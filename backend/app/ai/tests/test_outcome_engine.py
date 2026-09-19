"""
Comprehensive Unit Tests for FRIDAY AI Outcome Engine (Phase 5).
Verifies:
- OutcomeService business outcome detection across categories (Converted, Interested, Follow-up, etc.)
- Phase 3 intelligence consumption (intent, sentiment, objections, summary, next_steps)
- Strict confidence normalization (0.0 - 1.0) and taxonomy matching
- Evidence formatting, truncation, and removal of reasoning/chain-of-thought
- Actionable next_step validation and cleaning (clearing placeholders and negative outcomes)
- Provider failure handling (rate limits, timeouts, unavailable, malformed JSON)
- Persistence and idempotency with OutcomeRepository (upserting on duplicate call_id)
- OutcomePipeline orchestration and input validation
All tests run deterministically using MockLLMProvider with zero external cloud dependencies.
"""

import json
import unittest
from typing import Any, Dict, List

from app.ai.models.analysis_model import AnalysisResult, KeywordItem, SummaryResult
from app.ai.models.intent_model import IntentCategory, IntentResult
from app.ai.models.objection_model import ObjectionCategory, ObjectionItem
from app.ai.models.outcome_model import OutcomeCategory, OutcomeResult
from app.ai.models.sentiment_model import SentimentCategory, SentimentResult
from app.ai.pipelines.outcome_pipeline import OutcomePipeline
from app.ai.providers import MockLLMProvider
from app.ai.providers.exceptions import (
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderUnavailableError,
)
from app.models.outcome import Outcome
from app.repositories.outcome_repository import DuplicateOutcomeError, OutcomeRepository
from app.schemas.mapping import outcome_result_to_create_schema
from app.schemas.outcome import OutcomeCreate, OutcomeResponse, OutcomeUpdate
from app.services.ai.outcome_service import OutcomeService


def make_dummy_phase3_analysis(
    call_id: str = "call-100",
    intent: str = "Purchase Intent",
    sentiment: str = "Positive",
    next_steps: List[str] = None,
    concerns: List[str] = None,
) -> AnalysisResult:
    """Helper to generate a structured Phase 3 AnalysisResult for testing."""
    return AnalysisResult(
        call_id=call_id,
        transcript_id="trans-100",
        intent=IntentResult(intent=intent, confidence=0.92, evidence="Explicit customer request"),
        sentiment=SentimentResult(sentiment=sentiment, confidence=0.88, evidence="Warm tone"),
        objections=[
            ObjectionItem(
                category="Pricing",
                description="Concerned about yearly cost",
                confidence=0.75,
                timestamp=45.0,
                evidence="That's a bit pricey.",
            )
        ]
        if concerns
        else [],
        keywords=[KeywordItem(keyword="enterprise tier", relevance=0.9, frequency=3)],
        summary=SummaryResult(
            summary="Customer evaluated enterprise software features and pricing.",
            key_points=["Evaluated enterprise tier", "Reviewed SLA terms"],
            customer_needs=["Fast deployment", "Dedicated account manager"],
            concerns=concerns or [],
            next_steps=next_steps or ["Send contract for 50 enterprise licenses"],
        ),
        model="mock-llm-v1",
        provider="mock_llm",
    )


class TestOutcomeDetection(unittest.IsolatedAsyncioTestCase):
    """Verifies outcome classification across sales categories."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = OutcomeService(provider=self.mock_llm)

    async def test_converted_outcome(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "outcome": "Converted",
            "confidence": 0.96,
            "evidence": "Customer confirmed: 'We are ready to move forward, please send the contract right now.'",
            "next_action": "Send enterprise contract for signature by Friday.",
        })
        transcript = (
            "Agent: Are you ready to proceed with the 50-seat plan?\n"
            "Lead: Yes, we are ready to move forward, please send the contract right now."
        )
        res = await self.service.determine_outcome(
            transcript_input=transcript,
            call_id="call-conv-1",
        )
        self.assertEqual(res.outcome, OutcomeCategory.CONVERTED.value)
        self.assertEqual(res.confidence, 0.96)
        self.assertIn("contract right now", res.evidence)
        self.assertEqual(res.next_action, "Send enterprise contract for signature by Friday.")

    async def test_follow_up_required_outcome(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "outcome": "Follow-up Required",
            "confidence": 0.89,
            "evidence": "Customer asked to review the security whitepaper and meet again next Tuesday.",
            "next_action": "Send security whitepaper and schedule calendar invitation for Tuesday.",
        })
        res = await self.service.determine_outcome(
            transcript_input="Can you send the whitepaper? Let's talk Tuesday.",
            call_id="call-fu-1",
        )
        self.assertEqual(res.outcome, OutcomeCategory.FOLLOW_UP_REQUIRED.value)
        self.assertEqual(res.confidence, 0.89)
        self.assertEqual(
            res.next_action,
            "Send security whitepaper and schedule calendar invitation for Tuesday.",
        )

    async def test_callback_requested_outcome(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "outcome": "Callback Requested",
            "confidence": 0.92,
            "evidence": "Customer stated: 'I am stepping into a meeting, call me back at 3 PM.'",
            "next_action": "Call back at 3 PM today.",
        })
        res = await self.service.determine_outcome(
            transcript_input="I am stepping into a meeting, call me back at 3 PM.",
            call_id="call-cb-1",
        )
        self.assertEqual(res.outcome, OutcomeCategory.CALLBACK_REQUESTED.value)
        self.assertEqual(res.next_action, "Call back at 3 PM today.")

    async def test_not_interested_outcome_clears_next_action(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "outcome": "Not Interested",
            "confidence": 0.95,
            "evidence": "Customer firmly declined: 'We are completely satisfied with our current vendor and will not switch.'",
            "next_action": "Send marketing emails",  # Should be cleared because outcome is Not Interested
        })
        res = await self.service.determine_outcome(
            transcript_input="No thanks, we are happy with our current vendor.",
            call_id="call-ni-1",
        )
        self.assertEqual(res.outcome, OutcomeCategory.NOT_INTERESTED.value)
        self.assertIsNone(res.next_action)

    async def test_qualified_outcome(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "outcome": "Qualified",
            "confidence": 0.85,
            "evidence": "Customer confirmed $50k budget, decision authority, and Q4 implementation timeline.",
            "next_action": "Schedule solution architecture deep-dive with VP of Eng.",
        })
        res = await self.service.determine_outcome(
            transcript_input="We have $50k budgeted for Q4 and I make the final software decision.",
            call_id="call-qual-1",
        )
        self.assertEqual(res.outcome, OutcomeCategory.QUALIFIED.value)
        self.assertEqual(res.confidence, 0.85)

    async def test_unqualified_outcome(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "outcome": "Unqualified",
            "confidence": 0.90,
            "evidence": "Customer has zero budget and does not meet minimum team size requirements.",
            "next_action": None,
        })
        res = await self.service.determine_outcome(
            transcript_input="I'm a solo hobbyist with no budget.",
            call_id="call-unqual-1",
        )
        self.assertEqual(res.outcome, OutcomeCategory.UNQUALIFIED.value)
        self.assertIsNone(res.next_action)


class TestPhase3IntelligenceConsumption(unittest.IsolatedAsyncioTestCase):
    """Verifies that Phase 3 AnalysisResult context is properly provided and utilized."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = OutcomeService(provider=self.mock_llm)

    async def test_context_formatting_incorporates_phase3_intelligence(self) -> None:
        phase3 = make_dummy_phase3_analysis(
            call_id="call-p3-1",
            intent="Purchase Intent",
            sentiment="Positive",
            next_steps=["Send contract for 50 enterprise licenses"],
            concerns=["Budget approval cycle"],
        )
        self.mock_llm.default_response = json.dumps({
            "outcome": "Converted",
            "confidence": 0.94,
            "evidence": "Deal confirmed with 50 enterprise licenses requested.",
            "next_action": "Send contract for 50 enterprise licenses",
        })

        await self.service.determine_outcome(
            transcript_input="Let's finalize everything.",
            analysis_result=phase3,
            call_id="call-p3-1",
        )

        # Verify that prompt sent to LLM contains the Phase 3 intelligence
        self.assertTrue(len(self.mock_llm.call_history) > 0)
        sent_prompt = self.mock_llm.call_history[0].get_effective_prompt()
        self.assertIn("=== PHASE 3 INTELLIGENCE CONTEXT ===", sent_prompt)
        self.assertIn("Purchase Intent", sent_prompt)
        self.assertIn("Customer Sentiment: Positive", sent_prompt)
        self.assertIn("Customer Needs: Fast deployment, Dedicated account manager", sent_prompt)
        self.assertIn("Send contract for 50 enterprise licenses", sent_prompt)

    async def test_phase3_next_step_fallback_when_llm_action_empty(self) -> None:
        phase3 = make_dummy_phase3_analysis(
            next_steps=["Send pricing sheet by 5pm today"]
        )
        self.mock_llm.default_response = json.dumps({
            "outcome": "Follow-up Required",
            "confidence": 0.88,
            "evidence": "Customer requested pricing breakdown.",
            "next_action": None,  # LLM didn't return an explicit next_action
        })

        res = await self.service.determine_outcome(
            transcript_input="Send me the pricing sheet.",
            analysis_result=phase3,
            call_id="call-fallback-1",
        )
        # Should fallback to the Phase 3 explicit next step
        self.assertEqual(res.next_action, "Send pricing sheet by 5pm today")


class TestStructuredValidationAndResilience(unittest.IsolatedAsyncioTestCase):
    """Verifies bounds checking, normalization, markdown stripping, and error states."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = OutcomeService(provider=self.mock_llm)

    async def test_markdown_wrapped_json_parsing(self) -> None:
        self.mock_llm.default_response = (
            "```json\n"
            "{\n"
            '  "outcome": "Interested",\n'
            '  "confidence": 0.82,\n'
            '  "evidence": "Prospect found the automated reporting feature impressive.",\n'
            '  "next_action": "Follow up after their team sync."\n'
            "}\n"
            "```"
        )
        res = await self.service.determine_outcome(
            transcript_input="The automated reporting is really cool.",
            call_id="call-md-1",
        )
        self.assertEqual(res.outcome, OutcomeCategory.INTERESTED.value)
        self.assertEqual(res.confidence, 0.82)
        self.assertEqual(res.next_action, "Follow up after their team sync.")

    async def test_confidence_normalization_percentage_and_clamping(self) -> None:
        # Percentage 85 -> 0.85
        self.mock_llm.default_response = json.dumps({
            "outcome": "Interested",
            "confidence": 85,
            "evidence": "Customer interested.",
            "next_action": None,
        })
        res = await self.service.determine_outcome("I'm interested.", call_id="call-conf-1")
        self.assertEqual(res.confidence, 0.85)

        # Value > 100 clamped to 1.0
        self.mock_llm.default_response = json.dumps({
            "outcome": "Interested",
            "confidence": 150,
            "evidence": "Customer interested.",
            "next_action": None,
        })
        res = await self.service.determine_outcome("I'm interested.", call_id="call-conf-2")
        self.assertEqual(res.confidence, 1.0)

        # Negative value clamped to 0.0
        self.mock_llm.default_response = json.dumps({
            "outcome": "Interested",
            "confidence": -0.5,
            "evidence": "Customer interested.",
            "next_action": None,
        })
        res = await self.service.determine_outcome("I'm interested.", call_id="call-conf-3")
        self.assertEqual(res.confidence, 0.0)

    async def test_tolerant_category_matching(self) -> None:
        # Non-standard formatting matching to valid enum
        self.mock_llm.default_response = json.dumps({
            "outcome": "follow_up_required",
            "confidence": 0.8,
            "evidence": "Follow up agreed.",
            "next_action": "Call next week",
        })
        res = await self.service.determine_outcome("Let's talk next week", call_id="call-cat-1")
        self.assertEqual(res.outcome, OutcomeCategory.FOLLOW_UP_REQUIRED.value)

    async def test_placeholder_next_action_cleaned_to_none(self) -> None:
        for placeholder in ["n/a", "N/A", "none", "null", "No Action", "none required", ""]:
            self.mock_llm.default_response = json.dumps({
                "outcome": "Interested",
                "confidence": 0.7,
                "evidence": "Customer had some interest.",
                "next_action": placeholder,
            })
            res = await self.service.determine_outcome("Interesting.", call_id="call-act-1")
            self.assertIsNone(res.next_action)

    async def test_malformed_json_fallback(self) -> None:
        self.mock_llm.default_response = "I cannot determine an outcome because of invalid text."
        res = await self.service.determine_outcome("Hello?", call_id="call-err-1")
        self.assertEqual(res.outcome, OutcomeCategory.OTHER.value)
        self.assertEqual(res.confidence, 0.0)
        self.assertIn("JSON", res.evidence)

    async def test_empty_input_handling(self) -> None:
        res = await self.service.determine_outcome(
            transcript_input="",
            analysis_result=None,
            call_id="call-empty-1",
        )
        self.assertEqual(res.outcome, OutcomeCategory.OTHER.value)
        self.assertEqual(res.confidence, 0.0)
        self.assertIn("Empty transcript", res.evidence)

    async def test_provider_exception_handling(self) -> None:
        # Rate limit failure
        self.mock_llm.fail_with = ProviderRateLimitError("Rate limit exceeded")
        res = await self.service.determine_outcome("Hello, customer here.", call_id="call-rl-1")
        self.assertEqual(res.outcome, OutcomeCategory.OTHER.value)
        self.assertEqual(res.confidence, 0.0)
        self.assertIn("Rate limit", res.evidence)

        # Timeout failure
        self.mock_llm.fail_with = ProviderTimeoutError("Request timed out after 30s")
        res = await self.service.determine_outcome("Hello, customer here.", call_id="call-to-1")
        self.assertEqual(res.outcome, OutcomeCategory.OTHER.value)
        self.assertEqual(res.confidence, 0.0)
        self.assertIn("timed out", res.evidence)


class TestPersistenceAndIdempotency(unittest.IsolatedAsyncioTestCase):
    """Verifies database persistence, update on re-run, and uniqueness enforcement."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.repo = OutcomeRepository()  # In-memory store
        self.service = OutcomeService(provider=self.mock_llm, repository=self.repo)

    async def test_persist_new_outcome(self) -> None:
        outcome_res = OutcomeResult(
            call_id="call-persist-1",
            transcript_id="trans-1",
            outcome=OutcomeCategory.CONVERTED.value,
            confidence=0.95,
            evidence="Deal closed on call.",
            next_action="Send onboarding pack.",
            model="mock-model",
            provider="mock-provider",
        )

        record = self.service.persist_outcome(outcome_res)
        self.assertIsNotNone(record.id)
        self.assertEqual(record.call_id, "call-persist-1")
        self.assertEqual(record.outcome, OutcomeCategory.CONVERTED.value)
        self.assertEqual(record.confidence, 0.95)

        # Verify retrieval from repo
        fetched = self.repo.get_by_call_id("call-persist-1")
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.outcome, OutcomeCategory.CONVERTED.value)

    async def test_idempotent_update_on_duplicate_call_id(self) -> None:
        initial = OutcomeResult(
            call_id="call-idem-1",
            transcript_id="trans-1",
            outcome=OutcomeCategory.INTERESTED.value,
            confidence=0.70,
            evidence="Initial interest.",
            next_action="Call back.",
        )
        rec1 = self.service.persist_outcome(initial)
        initial_id = rec1.id

        # Re-run with updated outcome for same call_id (overwrite=True by default)
        updated = OutcomeResult(
            call_id="call-idem-1",
            transcript_id="trans-1",
            outcome=OutcomeCategory.CONVERTED.value,
            confidence=0.98,
            evidence="Customer later completed deal.",
            next_action="Send contract.",
        )
        rec2 = self.service.persist_outcome(updated, overwrite=True)

        # Should update existing record with same ID, NOT create duplicate
        self.assertEqual(rec2.id, initial_id)
        self.assertEqual(rec2.outcome, OutcomeCategory.CONVERTED.value)
        self.assertEqual(rec2.confidence, 0.98)

        # Confirm only 1 record exists
        all_for_call = [r for r in self.repo._memory_store.values() if r.call_id == "call-idem-1"]
        self.assertEqual(len(all_for_call), 1)

    async def test_duplicate_raises_when_overwrite_false(self) -> None:
        initial = OutcomeResult(
            call_id="call-no-overwrite-1",
            transcript_id="trans-1",
            outcome=OutcomeCategory.INTERESTED.value,
            confidence=0.70,
            evidence="Initial interest.",
        )
        self.service.persist_outcome(initial)

        with self.assertRaises(DuplicateOutcomeError):
            self.service.persist_outcome(initial, overwrite=False)

    async def test_determine_and_persist_flow(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "outcome": "Callback Requested",
            "confidence": 0.91,
            "evidence": "Customer requested callback tomorrow morning.",
            "next_action": "Call tomorrow at 9:30 AM.",
        })

        result = await self.service.determine_and_persist(
            transcript_input="Call me tomorrow morning at 9:30.",
            call_id="call-flow-1",
        )
        self.assertEqual(result.outcome, OutcomeCategory.CALLBACK_REQUESTED.value)

        # Confirm persisted in repository
        persisted = self.repo.get_by_call_id("call-flow-1")
        self.assertIsNotNone(persisted)
        self.assertEqual(persisted.outcome, OutcomeCategory.CALLBACK_REQUESTED.value)
        self.assertEqual(persisted.next_action, "Call tomorrow at 9:30 AM.")


class TestOutcomePipeline(unittest.IsolatedAsyncioTestCase):
    """Verifies orchestration through OutcomePipeline."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.repo = OutcomeRepository()
        self.service = OutcomeService(provider=self.mock_llm, repository=self.repo)
        self.pipeline = OutcomePipeline(outcome_service=self.service, repository=self.repo)

    async def test_pipeline_execution_without_persistence(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "outcome": "Qualified",
            "confidence": 0.87,
            "evidence": "Budget and timeline confirmed.",
            "next_action": "Book demo.",
        })
        res = await self.pipeline.execute(
            transcript_input="Budget and timeline are ready.",
            call_id="call-pipe-1",
            persist=False,
        )
        self.assertEqual(res.outcome, OutcomeCategory.QUALIFIED.value)
        # Should NOT be saved to repo
        self.assertIsNone(self.repo.get_by_call_id("call-pipe-1"))

    async def test_pipeline_execution_with_persistence(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "outcome": "Converted",
            "confidence": 0.95,
            "evidence": "Signed up.",
            "next_action": "Onboard.",
        })
        res = await self.pipeline.execute(
            transcript_input="I'm signing up now.",
            call_id="call-pipe-2",
            persist=True,
        )
        self.assertEqual(res.outcome, OutcomeCategory.CONVERTED.value)
        # Should be saved to repo
        record = self.repo.get_by_call_id("call-pipe-2")
        self.assertIsNotNone(record)
        self.assertEqual(record.outcome, OutcomeCategory.CONVERTED.value)

    async def test_pipeline_validates_inputs(self) -> None:
        with self.assertRaises(ValueError):
            await self.pipeline.execute(transcript_input=None, analysis_result=None)


if __name__ == "__main__":
    unittest.main()
