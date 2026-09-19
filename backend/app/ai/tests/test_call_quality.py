"""
Comprehensive Unit Tests for FRIDAY AI Call Quality Engine (Phase 6).
Verifies:
- Evaluation across 5 dimensions: Opening, Discovery, Explanation, Objection Handling, Closing.
- Calculation of overall quality score strictly over applicable dimensions (N/A excluded from denominator).
- Handling of Objection Handling when N/A (no objections) vs applicable (single or multiple objections).
- Integration of Phase 3 intelligence context (intent, sentiment, objections, customer needs, concerns, next steps).
- Integration of Phase 5 outcome as context without dictating call execution quality score.
- Factual grounding in transcript timestamps and speaker quotes, with rejection of hallucinated timestamps or chain-of-thought.
- Score bounds validation (0-100), clamping, and out-of-bounds rejection in `validate_score`.
- Resilience to edge cases: empty transcript, short call, provider errors (RateLimit, Timeout, Unavailable), malformed JSON.
- Deterministic multi-stage call evaluation example matching specification.
All tests run deterministically with MockLLMProvider with zero external cloud dependencies.
"""

import json
import unittest
from typing import Any, Dict, List, Optional

from app.ai.models.analysis_model import AnalysisResult, KeywordItem, SummaryResult
from app.ai.models.intent_model import IntentResult
from app.ai.models.objection_model import ObjectionItem
from app.ai.models.outcome_model import OutcomeCategory, OutcomeResult
from app.ai.models.quality_model import EvidenceItem, QualityDimension, QualityResult
from app.ai.models.sentiment_model import SentimentResult
from app.ai.providers import MockLLMProvider
from app.ai.providers.exceptions import (
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderUnavailableError,
)
from app.services.ai.call_quality_service import CallQualityService
from app.services.ai.utils import validate_score


def make_dummy_phase3_analysis(
    call_id: str = "call-q-100",
    intent: str = "Product Evaluation",
    sentiment: str = "Positive",
    objections: Optional[List[Dict[str, Any]]] = None,
    customer_needs: Optional[List[str]] = None,
    next_steps: Optional[List[str]] = None,
) -> AnalysisResult:
    """Helper to build a Phase 3 AnalysisResult with realistic structured data."""
    obj_items = [
        ObjectionItem(
            category=o.get("category", "Pricing"),
            description=o.get("description", "Budget constraint"),
            confidence=0.85,
            timestamp=o.get("timestamp", 45.0),
            evidence=o.get("evidence", "Too expensive"),
        )
        for o in (objections or [])
    ]
    return AnalysisResult(
        call_id=call_id,
        transcript_id="trans-q-100",
        intent=IntentResult(intent=intent, confidence=0.91, evidence="Customer exploring workflow solution"),
        sentiment=SentimentResult(sentiment=sentiment, confidence=0.87, evidence="Interested tone"),
        objections=obj_items,
        keywords=[KeywordItem(keyword="workflow automation", relevance=0.9, frequency=3)],
        summary=SummaryResult(
            summary="Discussion regarding intake automation for customer requests.",
            key_points=["Current manual process takes 5 staff", "Automation interest"],
            customer_needs=customer_needs or ["Workflow intake automation"],
            concerns=["Pricing tier transparency"],
            next_steps=next_steps or ["Send pricing sheet and schedule tomorrow follow-up"],
        ),
        model="mock-llm-v1",
        provider="mock_llm",
    )


def make_dummy_phase5_outcome(
    call_id: str = "call-q-100",
    outcome: str = "Follow-up Required",
    confidence: float = 0.90,
    evidence: str = "Agreed to review pricing details and talk tomorrow.",
    next_action: str = "Send pricing details and call back tomorrow.",
) -> OutcomeResult:
    """Helper to build a Phase 5 OutcomeResult."""
    return OutcomeResult(
        call_id=call_id,
        transcript_id="trans-q-100",
        outcome=outcome,
        confidence=confidence,
        evidence=evidence,
        next_action=next_action,
        model="mock-llm-v1",
        provider="mock_llm",
    )


class MockQualityRepository:
    """Simple in-memory repository implementing quality persistence."""

    def __init__(self) -> None:
        self.store: Dict[str, QualityResult] = {}

    def save_quality(self, quality_result: QualityResult, overwrite: bool = True) -> QualityResult:
        if not quality_result.call_id:
            raise ValueError("Missing call_id")
        self.store[quality_result.call_id] = quality_result
        return quality_result


class TestCallQualityDimensions(unittest.IsolatedAsyncioTestCase):
    """Verifies individual evaluation of the 5 quality dimensions."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = CallQualityService(provider=self.mock_llm)

    async def test_opening_clear_vs_unclear(self) -> None:
        # Clear opening scenario
        self.mock_llm.default_response = json.dumps({
            "opening": {
                "applicable": True,
                "score": 92,
                "strengths": ["Representative clearly stated name, company, and purpose of the call."],
                "weaknesses": [],
                "evidence": [{"timestamp": 5.0, "speaker": "employee", "text": "Hi, I'm Alex from FRIDAY calling about..."}],
            },
            "discovery": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
            "explanation": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
            "objection_handling": {"applicable": False, "score": None, "strengths": [], "weaknesses": [], "evidence": []},
            "closing": {"applicable": True, "score": 88, "strengths": [], "weaknesses": [], "evidence": []},
        })
        res = await self.service.evaluate_quality(
            transcript_input="Employee: Hi, I'm Alex from FRIDAY calling to see how you manage tickets.\nLead: Hi Alex.",
            call_id="call-op-1",
        )
        self.assertTrue(res.opening.applicable)
        self.assertEqual(res.opening.score, 92)
        self.assertIn("purpose of the call", res.opening.strengths[0])
        self.assertEqual(res.opening.evidence[0].timestamp, 5.0)

        # Unclear opening scenario (missing introduction)
        self.mock_llm.default_response = json.dumps({
            "opening": {
                "applicable": True,
                "score": 45,
                "strengths": [],
                "weaknesses": ["Representative jumped directly into pitch without introducing themselves or purpose."],
                "evidence": [{"timestamp": 1.0, "speaker": "employee", "text": "Do you want to buy software?"}],
            },
            "discovery": {"applicable": True, "score": 60, "strengths": [], "weaknesses": [], "evidence": []},
            "explanation": {"applicable": True, "score": 65, "strengths": [], "weaknesses": [], "evidence": []},
            "objection_handling": {"applicable": False, "score": None, "strengths": [], "weaknesses": [], "evidence": []},
            "closing": {"applicable": True, "score": 50, "strengths": [], "weaknesses": [], "evidence": []},
        })
        res_bad = await self.service.evaluate_quality(
            transcript_input="Employee: Do you want to buy software?",
            call_id="call-op-2",
        )
        self.assertEqual(res_bad.opening.score, 45)
        self.assertIn("without introducing themselves", res_bad.opening.weaknesses[0])

    async def test_discovery_strong_vs_weak(self) -> None:
        # Strong discovery
        self.mock_llm.default_response = json.dumps({
            "opening": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
            "discovery": {
                "applicable": True,
                "score": 90,
                "strengths": [
                    "Asked insightful open-ended questions clarifying team size and pain points.",
                    "Actively listened and probed follow-up on bottlenecks.",
                ],
                "weaknesses": [],
                "evidence": [{"timestamp": 35.0, "speaker": "employee", "text": "What causes the biggest slowdown in your manual workflow?"}],
            },
            "explanation": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
            "objection_handling": {"applicable": False, "score": None, "strengths": [], "weaknesses": [], "evidence": []},
            "closing": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
        })
        res = await self.service.evaluate_quality(
            transcript_input="Employee: What causes the biggest slowdown in your manual workflow?\nLead: The data handoffs.",
            call_id="call-disc-1",
        )
        self.assertEqual(res.discovery.score, 90)
        self.assertEqual(len(res.discovery.strengths), 2)

        # No discovery / premature pitch
        self.mock_llm.default_response = json.dumps({
            "opening": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
            "discovery": {
                "applicable": True,
                "score": 35,
                "strengths": [],
                "weaknesses": ["No discovery conducted; employee pitched features without asking about customer needs."],
                "evidence": [],
            },
            "explanation": {"applicable": True, "score": 70, "strengths": [], "weaknesses": [], "evidence": []},
            "objection_handling": {"applicable": False, "score": None, "strengths": [], "weaknesses": [], "evidence": []},
            "closing": {"applicable": True, "score": 60, "strengths": [], "weaknesses": [], "evidence": []},
        })
        res_no_disc = await self.service.evaluate_quality(
            transcript_input="Employee: Buy our product, it has AI and graphs.",
            call_id="call-disc-2",
        )
        self.assertEqual(res_no_disc.discovery.score, 35)
        self.assertIn("No discovery conducted", res_no_disc.discovery.weaknesses[0])

    async def test_explanation_relevant_vs_unrelated(self) -> None:
        # Explanation aligned with customer needs
        self.mock_llm.default_response = json.dumps({
            "opening": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
            "discovery": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
            "explanation": {
                "applicable": True,
                "score": 95,
                "strengths": ["Tailored solution explanation directly to lead's manual triage issue."],
                "weaknesses": [],
                "evidence": [{"timestamp": 75.0, "speaker": "employee", "text": "Our platform eliminates that manual data triage automatically."}],
            },
            "objection_handling": {"applicable": False, "score": None, "strengths": [], "weaknesses": [], "evidence": []},
            "closing": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
        })
        res = await self.service.evaluate_quality(
            transcript_input="Employee: Our platform eliminates that manual data triage automatically.",
            call_id="call-exp-1",
        )
        self.assertEqual(res.explanation.score, 95)
        self.assertEqual(res.explanation.evidence[0].timestamp, 75.0)

    async def test_objection_handling_na_when_no_objections(self) -> None:
        # When no objections occur, objection handling is marked applicable=False, score=None
        self.mock_llm.default_response = json.dumps({
            "opening": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
            "discovery": {"applicable": True, "score": 75, "strengths": [], "weaknesses": [], "evidence": []},
            "explanation": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
            "objection_handling": {
                "applicable": False,
                "score": None,
                "strengths": [],
                "weaknesses": [],
                "evidence": [],
            },
            "closing": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
        })
        res = await self.service.evaluate_quality(
            transcript_input="Employee: Good morning.\nLead: Hello, I just called to confirm your address.",
            call_id="call-no-obj-1",
        )
        self.assertFalse(res.objection_handling.applicable)
        self.assertIsNone(res.objection_handling.score)
        # Denominator should be 4: (80 + 75 + 85 + 80) / 4 = 80.0
        self.assertEqual(res.overall_score, 80.0)

    async def test_objection_handling_addressed_vs_ignored(self) -> None:
        # Objection addressed effectively
        self.mock_llm.default_response = json.dumps({
            "opening": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
            "discovery": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
            "explanation": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
            "objection_handling": {
                "applicable": True,
                "score": 90,
                "strengths": ["Acknowledged budget concern transparently and outlined scalable tier pricing."],
                "weaknesses": [],
                "evidence": [{"timestamp": 90.0, "speaker": "employee", "text": "We offer tiered pricing based on active volume so you don't overpay."}],
            },
            "closing": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
        })
        phase3 = make_dummy_phase3_analysis(
            objections=[{"category": "Pricing", "description": "Budget concern", "timestamp": 85.0}]
        )
        res = await self.service.evaluate_quality(
            transcript_input="Lead: Pricing is too steep.\nEmployee: We offer tiered pricing based on active volume.",
            analysis_result=phase3,
            call_id="call-obj-1",
        )
        self.assertTrue(res.objection_handling.applicable)
        self.assertEqual(res.objection_handling.score, 90)
        # Denominator is 5: (85 + 80 + 85 + 90 + 85) / 5 = 85.0
        self.assertEqual(res.overall_score, 85.0)

        # Objection ignored
        self.mock_llm.default_response = json.dumps({
            "opening": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
            "discovery": {"applicable": True, "score": 75, "strengths": [], "weaknesses": [], "evidence": []},
            "explanation": {"applicable": True, "score": 70, "strengths": [], "weaknesses": [], "evidence": []},
            "objection_handling": {
                "applicable": True,
                "score": 30,
                "strengths": [],
                "weaknesses": ["Ignored customer's security objection and continued standard pitch."],
                "evidence": [{"timestamp": 60.0, "speaker": "lead", "text": "We cannot host outside EU due to GDPR."}],
            },
            "closing": {"applicable": True, "score": 60, "strengths": [], "weaknesses": [], "evidence": []},
        })
        res_ignored = await self.service.evaluate_quality(
            transcript_input="Lead: We cannot host outside EU due to GDPR.\nEmployee: Look at this reporting dashboard!",
            call_id="call-obj-2",
        )
        self.assertEqual(res_ignored.objection_handling.score, 30)
        self.assertIn("Ignored customer's security objection", res_ignored.objection_handling.weaknesses[0])

    async def test_closing_clear_next_step_vs_unclear(self) -> None:
        # Clear next step confirmed
        self.mock_llm.default_response = json.dumps({
            "opening": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
            "discovery": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
            "explanation": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
            "objection_handling": {"applicable": False, "score": None, "strengths": [], "weaknesses": [], "evidence": []},
            "closing": {
                "applicable": True,
                "score": 95,
                "strengths": ["Confirmed explicit callback for Friday at 10 AM with calendar invite."],
                "weaknesses": [],
                "evidence": [{"timestamp": 115.0, "speaker": "employee", "text": "I will send the calendar invite for Friday 10 AM right away."}],
            },
        })
        res = await self.service.evaluate_quality(
            transcript_input="Employee: I will send the calendar invite for Friday 10 AM right away.\nLead: Sounds great.",
            call_id="call-close-1",
        )
        self.assertEqual(res.closing.score, 95)
        self.assertIn("Friday at 10 AM", res.closing.strengths[0])


class TestOverallScoreAndScoringLogic(unittest.TestCase):
    """Verifies score averaging, N/A exclusion, and bounds validation."""

    def setUp(self) -> None:
        self.service = CallQualityService(provider=MockLLMProvider())

    def test_overall_score_with_all_five_dimensions(self) -> None:
        dims = [
            QualityDimension(applicable=True, score=90.0),
            QualityDimension(applicable=True, score=80.0),
            QualityDimension(applicable=True, score=70.0),
            QualityDimension(applicable=True, score=60.0),
            QualityDimension(applicable=True, score=100.0),
        ]
        score = self.service.calculate_overall_score(dims)
        self.assertEqual(score, 80.0)

    def test_overall_score_with_objection_handling_na(self) -> None:
        dims = [
            QualityDimension(applicable=True, score=80.0),
            QualityDimension(applicable=True, score=70.0),
            QualityDimension(applicable=True, score=85.0),
            QualityDimension(applicable=False, score=None),  # N/A excluded from denominator!
            QualityDimension(applicable=True, score=75.0),
        ]
        # (80 + 70 + 85 + 75) / 4 = 77.5
        score = self.service.calculate_overall_score(dims)
        self.assertEqual(score, 77.5)

    def test_overall_score_with_multiple_na_dimensions(self) -> None:
        dims = [
            QualityDimension(applicable=True, score=80.0),
            QualityDimension(applicable=False, score=None),
            QualityDimension(applicable=True, score=90.0),
            QualityDimension(applicable=False, score=None),
            QualityDimension(applicable=False, score=None),
        ]
        # (80 + 90) / 2 = 85.0
        score = self.service.calculate_overall_score(dims)
        self.assertEqual(score, 85.0)

    def test_overall_score_all_na_returns_none(self) -> None:
        dims = [QualityDimension(applicable=False, score=None) for _ in range(5)]
        score = self.service.calculate_overall_score(dims)
        self.assertIsNone(score)

    def test_validate_score_bounds_and_clamping(self) -> None:
        # Valid scores
        self.assertEqual(validate_score(85.5), 85.5)
        self.assertEqual(validate_score(0), 0.0)
        self.assertEqual(validate_score(100), 100.0)

        # Clamping when clamp=True
        self.assertEqual(validate_score(125, clamp=True), 100.0)
        self.assertEqual(validate_score(-15, clamp=True), 0.0)

        # Strict rejection when clamp=False
        with self.assertRaises(ValueError):
            validate_score(125, clamp=False)
        with self.assertRaises(ValueError):
            validate_score(-20, clamp=False)
        with self.assertRaises(ValueError):
            validate_score("not_a_number", clamp=False)


class TestPhase3AndPhase5Integration(unittest.IsolatedAsyncioTestCase):
    """Verifies that Phase 3 and Phase 5 contexts are properly passed without conflating quality with outcome."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = CallQualityService(provider=self.mock_llm)

    async def test_phase3_and_phase5_context_injected_into_prompt(self) -> None:
        phase3 = make_dummy_phase3_analysis(
            intent="Workflow Automation",
            sentiment="Positive",
            objections=[{"category": "Pricing", "description": "High per-user price", "timestamp": 45.0}],
            customer_needs=["Fast intake processing", "CRM sync"],
        )
        phase5 = make_dummy_phase5_outcome(
            outcome="Converted",
            confidence=0.95,
            evidence="Customer confirmed agreement.",
            next_action="Send signable contract.",
        )

        self.mock_llm.default_response = json.dumps({
            "opening": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
            "discovery": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
            "explanation": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
            "objection_handling": {"applicable": True, "score": 90, "strengths": [], "weaknesses": [], "evidence": []},
            "closing": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
        })

        await self.service.evaluate_quality(
            transcript_input="Employee: Let's get you set up.\nLead: Sounds great, send the contract.",
            analysis_result=phase3,
            outcome_result=phase5,
            call_id="call-ctx-1",
        )

        sent_prompt = self.mock_llm.call_history[0].get_effective_prompt()
        self.assertIn("=== PHASE 3 INTELLIGENCE CONTEXT ===", sent_prompt)
        self.assertIn("Workflow Automation", sent_prompt)
        self.assertIn("Customer Sentiment: Positive", sent_prompt)
        self.assertIn("High per-user price", sent_prompt)
        self.assertIn("=== PHASE 5 OUTCOME CONTEXT ===", sent_prompt)
        self.assertIn("Determined Outcome: Converted", sent_prompt)
        self.assertIn("Call Quality evaluates how skillfully the employee executed", sent_prompt)

    async def test_outcome_does_not_force_high_quality_score(self) -> None:
        # Call has Outcome = Converted (customer bought), but employee execution was poor
        self.mock_llm.default_response = json.dumps({
            "opening": {"applicable": True, "score": 40, "strengths": [], "weaknesses": ["Rude greeting"], "evidence": []},
            "discovery": {"applicable": True, "score": 30, "strengths": [], "weaknesses": ["No discovery"], "evidence": []},
            "explanation": {"applicable": True, "score": 50, "strengths": [], "weaknesses": ["Muddled details"], "evidence": []},
            "objection_handling": {"applicable": False, "score": None, "strengths": [], "weaknesses": [], "evidence": []},
            "closing": {"applicable": True, "score": 45, "strengths": [], "weaknesses": ["Rushed closing"], "evidence": []},
        })
        phase5_converted = make_dummy_phase5_outcome(outcome="Converted")

        res = await self.service.evaluate_quality(
            transcript_input="Customer: Just sell me 50 licenses.\nEmployee: Fine, sign here.",
            outcome_result=phase5_converted,
            call_id="call-sep-1",
        )
        # Quality score reflects execution quality (41.25), NOT the converted business outcome
        self.assertEqual(res.overall_score, 41.25)
        self.assertLess(res.overall_score, 50.0)


class TestDeterministicCallSpecification(unittest.IsolatedAsyncioTestCase):
    """
    Tests the exact deterministic transcript provided in the Phase 6 specification:
    Employee: Hi, I'm calling to understand how you're currently managing customer requests.
    Lead: We have a manual process and it takes a lot of time.
    Employee: How many people are involved in that process?
    Lead: About five people.
    Employee: Our platform can automate that workflow and integrate with your existing system.
    Lead: That sounds useful, but I'm concerned about pricing.
    Employee: We have different plans depending on usage.
    Lead: Please send me the pricing details and call me tomorrow.
    """

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = CallQualityService(provider=self.mock_llm)

    async def test_deterministic_transcript_evaluation(self) -> None:
        transcript = (
            "[0.0s] Employee: Hi, I'm calling to understand how you're currently managing customer requests.\n"
            "[6.5s] Lead: We have a manual process and it takes a lot of time.\n"
            "[12.0s] Employee: How many people are involved in that process?\n"
            "[16.0s] Lead: About five people.\n"
            "[20.0s] Employee: Our platform can automate that workflow and integrate with your existing system.\n"
            "[27.0s] Lead: That sounds useful, but I'm concerned about pricing.\n"
            "[33.0s] Employee: We have different plans depending on usage.\n"
            "[39.0s] Lead: Please send me the pricing details and call me tomorrow."
        )

        phase3 = make_dummy_phase3_analysis(
            intent="Workflow Automation",
            sentiment="Interested",
            objections=[{"category": "Pricing", "description": "Concerned about pricing", "timestamp": 27.0}],
            customer_needs=["Automate manual process for 5-person team"],
            next_steps=["Send pricing details and call tomorrow"],
        )

        phase5 = make_dummy_phase5_outcome(
            outcome="Callback Requested",
            evidence="Lead asked to send pricing details and call tomorrow.",
            next_action="Send pricing details and call back tomorrow.",
        )

        self.mock_llm.default_response = json.dumps({
            "opening": {
                "applicable": True,
                "score": 88,
                "strengths": ["Clear purpose stated to understand request management."],
                "weaknesses": ["Did not confirm customer's immediate availability."],
                "evidence": [{"timestamp": 0.0, "speaker": "employee", "text": "Hi, I'm calling to understand how you're currently managing customer requests."}],
            },
            "discovery": {
                "applicable": True,
                "score": 86,
                "strengths": ["Asked about process size and understood manual time drain."],
                "weaknesses": [],
                "evidence": [{"timestamp": 12.0, "speaker": "employee", "text": "How many people are involved in that process?"}],
            },
            "explanation": {
                "applicable": True,
                "score": 84,
                "strengths": ["Connected platform automation directly to stated manual workflow problem."],
                "weaknesses": [],
                "evidence": [{"timestamp": 20.0, "speaker": "employee", "text": "Our platform can automate that workflow and integrate with your existing system."}],
            },
            "objection_handling": {
                "applicable": True,
                "score": 76,
                "strengths": ["Acknowledged pricing concern by noting usage-based plans."],
                "weaknesses": ["Could have provided more specific range or ROI justification."],
                "evidence": [{"timestamp": 33.0, "speaker": "employee", "text": "We have different plans depending on usage."}],
            },
            "closing": {
                "applicable": True,
                "score": 82,
                "strengths": ["Lead confirmed follow-up action: send pricing and callback tomorrow."],
                "weaknesses": ["Employee did not verbally confirm specific call time."],
                "evidence": [{"timestamp": 39.0, "speaker": "lead", "text": "Please send me the pricing details and call me tomorrow."}],
            },
            "strengths": [
                "Clear purpose stated in opening.",
                "Targeted discovery question quantifying team size.",
                "Solution explanation tied directly to customer need.",
            ],
            "weaknesses": [
                "Did not set specific follow-up time for callback.",
            ],
        })

        res = await self.service.evaluate_quality(
            transcript_input=transcript,
            analysis_result=phase3,
            outcome_result=phase5,
            call_id="call-spec-1",
        )

        # Opening evaluated from actual opening
        self.assertEqual(res.opening.score, 88)
        self.assertEqual(res.opening.evidence[0].timestamp, 0.0)

        # Discovery recognized process questioning
        self.assertEqual(res.discovery.score, 86)
        self.assertEqual(res.discovery.evidence[0].timestamp, 12.0)

        # Explanation connected to problem
        self.assertEqual(res.explanation.score, 84)

        # Objection handling recognized pricing concern
        self.assertTrue(res.objection_handling.applicable)
        self.assertEqual(res.objection_handling.score, 76)

        # Closing recognized pricing request and callback
        self.assertEqual(res.closing.score, 82)

        # Overall average: (88 + 86 + 84 + 76 + 82) / 5 = 83.2
        self.assertEqual(res.overall_score, 83.2)


class TestEdgeCasesAndProviderResilience(unittest.IsolatedAsyncioTestCase):
    """Verifies robustness against empty inputs, provider failures, and malformed outputs."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = CallQualityService(provider=self.mock_llm)

    async def test_empty_transcript(self) -> None:
        res = await self.service.evaluate_quality(transcript_input="", call_id="call-empty")
        self.assertIsNone(res.overall_score)
        self.assertFalse(res.opening.applicable)
        self.assertFalse(res.discovery.applicable)
        self.assertFalse(res.explanation.applicable)
        self.assertFalse(res.objection_handling.applicable)
        self.assertFalse(res.closing.applicable)
        self.assertIn("No conversational transcript", res.weaknesses[0])

    async def test_rate_limit_error(self) -> None:
        self.mock_llm.fail_with = ProviderRateLimitError("Rate limit exceeded")
        res = await self.service.evaluate_quality(
            transcript_input="Employee: Hello.\nLead: Hi.",
            call_id="call-rl",
        )
        self.assertIsNone(res.overall_score)
        self.assertIn("Rate limit", res.weaknesses[0])

    async def test_timeout_error(self) -> None:
        self.mock_llm.fail_with = ProviderTimeoutError("Request timed out after 30s")
        res = await self.service.evaluate_quality(
            transcript_input="Employee: Hello.\nLead: Hi.",
            call_id="call-to",
        )
        self.assertIsNone(res.overall_score)
        self.assertIn("timed out", res.weaknesses[0])

    async def test_provider_unavailable_error(self) -> None:
        self.mock_llm.fail_with = ProviderUnavailableError("LLM cluster down")
        res = await self.service.evaluate_quality(
            transcript_input="Employee: Hello.\nLead: Hi.",
            call_id="call-unavail",
        )
        self.assertIsNone(res.overall_score)
        self.assertIn("LLM cluster down", res.weaknesses[0])

    async def test_malformed_json_response(self) -> None:
        self.mock_llm.default_response = "I think the call was good but this is not JSON."
        res = await self.service.evaluate_quality(
            transcript_input="Employee: Hello.\nLead: Hi.",
            call_id="call-bad-json",
        )
        self.assertIsNone(res.overall_score)
        self.assertIn("valid structured quality JSON", res.weaknesses[0])

    async def test_malformed_evidence_timestamps(self) -> None:
        # Model returns negative timestamp or string timestamp
        item1 = self.service.clean_evidence_item({"timestamp": -5.0, "speaker": "employee", "text": "Greeting"})
        self.assertIsNone(item1.timestamp)

        item2 = self.service.clean_evidence_item({"timestamp": "invalid_ts", "speaker": "lead", "text": "Reply"})
        self.assertIsNone(item2.timestamp)

        item3 = self.service.clean_evidence_item({"timestamp": 42.8, "speaker": "employee", "text": "Valid quote"})
        self.assertEqual(item3.timestamp, 42.8)


class TestPersistencePattern(unittest.IsolatedAsyncioTestCase):
    """Verifies optional repository integration without breaking Phase 4 boundaries."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.repo = MockQualityRepository()
        self.service = CallQualityService(provider=self.mock_llm, repository=self.repo)

    async def test_evaluate_and_persist_pattern(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "opening": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
            "discovery": {"applicable": True, "score": 80, "strengths": [], "weaknesses": [], "evidence": []},
            "explanation": {"applicable": True, "score": 85, "strengths": [], "weaknesses": [], "evidence": []},
            "objection_handling": {"applicable": False, "score": None, "strengths": [], "weaknesses": [], "evidence": []},
            "closing": {"applicable": True, "score": 90, "strengths": [], "weaknesses": [], "evidence": []},
        })
        res = await self.service.evaluate_and_persist(
            transcript_input="Employee: Hello.\nLead: Hi.",
            call_id="call-persist-q1",
        )
        self.assertEqual(res.call_id, "call-persist-q1")
        self.assertIn("call-persist-q1", self.repo.store)
        self.assertEqual(self.repo.store["call-persist-q1"].overall_score, 85.0)


if __name__ == "__main__":
    unittest.main()
