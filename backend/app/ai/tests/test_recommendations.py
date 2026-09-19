"""
Comprehensive Unit Tests for FRIDAY AI Recommendation Engine (Phase 7).
Verifies:
- Recommendation taxonomy classification (Follow-up, Discovery, Objection Handling, Product Explanation, Closing, Communication, etc.).
- Priority taxonomy validation (high, medium, low) and fallback behavior.
- Integration of Phase 3 intelligence (intent, sentiment, objections, customer needs, concerns, next steps).
- Integration of Phase 5 outcome and next actions.
- Integration of Phase 6 quality scores, dimensional gaps, weaknesses, and strengths.
- Deduplication of semantically similar recommendations.
- Rejection/normalization of invalid recommendation types, empty texts, and invalid evidence timestamps.
- Handling of edge cases: excellent calls (zero or minimal recommendations), missing Phase 3/5/6 context, short transcripts.
- Resilience to provider errors: RateLimit, Timeout, Unavailable, and Malformed JSON with deterministic fallbacks.
- Optional repository persistence integration without touching core files.
All tests run deterministically using MockLLMProvider with zero paid external APIs.
"""

import json
import unittest
from typing import Any, Dict, List, Optional

from app.ai.models.analysis_model import AnalysisResult, KeywordItem, SummaryResult
from app.ai.models.intent_model import IntentResult
from app.ai.models.objection_model import ObjectionItem
from app.ai.models.outcome_model import OutcomeResult
from app.ai.models.quality_model import EvidenceItem, QualityDimension, QualityResult
from app.ai.models.recommendation_model import (
    PriorityLevel,
    RecommendationItem,
    RecommendationResult,
    RecommendationSource,
    RecommendationType,
)
from app.ai.models.sentiment_model import SentimentResult
from app.ai.providers import MockLLMProvider
from app.ai.providers.exceptions import (
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderUnavailableError,
)
from app.services.ai.recommendation_service import RecommendationService


def make_dummy_phase3(
    call_id: str = "call-rec-100",
    intent: str = "Pricing Inquiry",
    sentiment: str = "Neutral",
    objections: Optional[List[Dict[str, Any]]] = None,
    customer_needs: Optional[List[str]] = None,
    concerns: Optional[List[str]] = None,
    next_steps: Optional[List[str]] = None,
) -> AnalysisResult:
    """Helper to build a realistic Phase 3 AnalysisResult."""
    obj_items = [
        ObjectionItem(
            category=o.get("category", "Pricing"),
            description=o.get("description", "Budget concern"),
            confidence=0.88,
            timestamp=o.get("timestamp", 30.0),
            evidence=o.get("evidence", "Pricing is high"),
        )
        for o in (objections or [])
    ]
    return AnalysisResult(
        call_id=call_id,
        transcript_id="trans-rec-100",
        intent=IntentResult(intent=intent, confidence=0.92, evidence="Looking for tier details"),
        sentiment=SentimentResult(sentiment=sentiment, confidence=0.85, evidence="Neutral discussion"),
        objections=obj_items,
        keywords=[KeywordItem(keyword="pricing tier", relevance=0.95, frequency=3)],
        summary=SummaryResult(
            summary="Lead inquired about usage-based tiers for their support department.",
            key_points=["5-person team", "Concerned about price"],
            customer_needs=customer_needs or ["Usage-based tier pricing"],
            concerns=concerns or ["Budget constraints"],
            next_steps=next_steps or ["Send pricing sheet and call tomorrow"],
        ),
        model="mock-llm-v1",
        provider="mock_llm",
    )


def make_dummy_phase5(
    call_id: str = "call-rec-100",
    outcome: str = "Follow-up Required",
    confidence: float = 0.90,
    evidence: str = "Customer requested callback tomorrow.",
    next_action: str = "Call lead at 10 AM tomorrow with pricing breakdown.",
) -> OutcomeResult:
    """Helper to build a Phase 5 OutcomeResult."""
    return OutcomeResult(
        call_id=call_id,
        transcript_id="trans-rec-100",
        outcome=outcome,
        confidence=confidence,
        evidence=evidence,
        next_action=next_action,
        model="mock-llm-v1",
        provider="mock_llm",
    )


def make_dummy_phase6(
    call_id: str = "call-rec-100",
    overall_score: float = 65.0,
    discovery_score: float = 55.0,
    objection_score: Optional[float] = 50.0,
    closing_score: float = 58.0,
    weaknesses: Optional[List[str]] = None,
) -> QualityResult:
    """Helper to build a Phase 6 QualityResult."""
    return QualityResult(
        call_id=call_id,
        transcript_id="trans-rec-100",
        overall_score=overall_score,
        opening=QualityDimension(applicable=True, score=85.0, strengths=["Clear introduction"]),
        discovery=QualityDimension(
            applicable=True,
            score=discovery_score,
            weaknesses=["Asked few questions about current workflow volume."],
        ),
        explanation=QualityDimension(
            applicable=True,
            score=75.0,
            strengths=["Explained tier options clearly."],
        ),
        objection_handling=QualityDimension(
            applicable=objection_score is not None,
            score=objection_score,
            weaknesses=["Pricing objection was noted but not fully resolved."] if objection_score else [],
        ),
        closing=QualityDimension(
            applicable=True,
            score=closing_score,
            weaknesses=["Did not confirm specific time for the callback."],
        ),
        weaknesses=weaknesses or [
            "Asked few questions about current workflow volume.",
            "Pricing objection was noted but not fully resolved.",
            "Did not confirm specific time for the callback.",
        ],
        model="mock-llm-v1",
        provider="mock_llm",
    )


class MockRecommendationRepository:
    """In-memory test repository for recommendation persistence verification."""

    def __init__(self) -> None:
        self.store: Dict[str, RecommendationResult] = {}

    def save_recommendations(
        self,
        recommendation_result: RecommendationResult,
        overwrite: bool = True,
    ) -> RecommendationResult:
        if not recommendation_result.call_id:
            raise ValueError("Missing call_id")
        self.store[recommendation_result.call_id] = recommendation_result
        return recommendation_result


class TestRecommendationTaxonomyAndPriorities(unittest.IsolatedAsyncioTestCase):
    """Verifies recommendation categorization, priority assignments, and taxonomy mapping."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = RecommendationService(provider=self.mock_llm)

    async def test_follow_up_recommendation(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "recommendations": [
                {
                    "type": "Follow-up",
                    "priority": "high",
                    "recommendation": "Send the pricing tier PDF and place callback tomorrow.",
                    "reason": "Lead requested pricing information and requested tomorrow callback.",
                    "evidence": [{"timestamp": 35.0, "speaker": "lead", "text": "Send me pricing and call tomorrow."}],
                    "source": "outcome",
                    "suggested_action": "Email pricing documentation and schedule reminder.",
                }
            ]
        })
        res = await self.service.generate_recommendations(
            transcript_input="Lead: Send me pricing and call tomorrow.",
            call_id="call-tax-1",
        )
        self.assertEqual(len(res.recommendations), 1)
        r = res.recommendations[0]
        self.assertEqual(r.type, RecommendationType.FOLLOW_UP.value)
        self.assertEqual(r.priority, PriorityLevel.HIGH.value)
        self.assertIn("pricing tier PDF", r.recommendation)
        self.assertEqual(r.evidence[0].timestamp, 35.0)

    async def test_discovery_recommendation(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "recommendations": [
                {
                    "type": "Discovery",
                    "priority": "medium",
                    "recommendation": "Probe into existing software bottlenecks before presenting features.",
                    "reason": "Representative pitched capabilities before clarifying current process pain points.",
                    "evidence": [{"timestamp": 12.0, "speaker": "employee", "text": "Our tool has 50 features."}],
                    "source": "quality",
                    "suggested_action": "Ask: 'What part of your current workflow takes the most time?'",
                }
            ]
        })
        res = await self.service.generate_recommendations(
            transcript_input="Employee: Our tool has 50 features.",
            call_id="call-tax-2",
        )
        r = res.recommendations[0]
        self.assertEqual(r.type, RecommendationType.DISCOVERY.value)
        self.assertEqual(r.priority, PriorityLevel.MEDIUM.value)
        self.assertIn("bottlenecks before presenting", r.recommendation)

    async def test_objection_handling_recommendation(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "recommendations": [
                {
                    "type": "Objection Handling",
                    "priority": "high",
                    "recommendation": "Address budget objection by demonstrating cost-per-seat ROI.",
                    "reason": "Pricing concern was brushed off with generic response.",
                    "evidence": [{"timestamp": 45.0, "speaker": "lead", "text": "That's way over our budget."}],
                    "source": "analysis",
                    "suggested_action": "Provide ROI comparison showing manual hours saved.",
                }
            ]
        })
        res = await self.service.generate_recommendations(
            transcript_input="Lead: That's way over our budget.",
            call_id="call-tax-3",
        )
        r = res.recommendations[0]
        self.assertEqual(r.type, RecommendationType.OBJECTION_HANDLING.value)
        self.assertEqual(r.priority, PriorityLevel.HIGH.value)

    async def test_product_explanation_recommendation(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "recommendations": [
                {
                    "type": "Product Explanation",
                    "priority": "medium",
                    "recommendation": "Connect intake automation feature directly to customer's 5-person team size.",
                    "reason": "Feature was explained generically without reference to lead's stated team size.",
                    "evidence": [],
                    "source": "quality",
                }
            ]
        })
        res = await self.service.generate_recommendations(call_id="call-tax-4")
        self.assertEqual(res.recommendations[0].type, RecommendationType.PRODUCT_EXPLANATION.value)

    async def test_closing_recommendation(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "recommendations": [
                {
                    "type": "Closing",
                    "priority": "medium",
                    "recommendation": "State and confirm an exact date and time for the follow-up meeting.",
                    "reason": "Call concluded with a vague 'talk soon' without calendar confirmation.",
                    "evidence": [{"timestamp": 120.0, "speaker": "employee", "text": "Okay, talk soon!"}],
                    "source": "quality",
                    "suggested_action": "Propose: 'Does Thursday at 2 PM work for a 15-minute review?'",
                }
            ]
        })
        res = await self.service.generate_recommendations(call_id="call-tax-5")
        self.assertEqual(res.recommendations[0].type, RecommendationType.CLOSING.value)

    async def test_communication_recommendation(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "recommendations": [
                {
                    "type": "Communication",
                    "priority": "low",
                    "recommendation": "Pause to allow customer to finish their thought before answering.",
                    "reason": "Representative spoke over the customer twice during the opening.",
                    "evidence": [],
                    "source": "transcript",
                }
            ]
        })
        res = await self.service.generate_recommendations(call_id="call-tax-6")
        self.assertEqual(res.recommendations[0].type, RecommendationType.COMMUNICATION.value)
        self.assertEqual(res.recommendations[0].priority, PriorityLevel.LOW.value)

    def test_priority_validation_and_fallback(self) -> None:
        self.assertEqual(self.service.validate_priority("high"), "high")
        self.assertEqual(self.service.validate_priority("MEDIUM"), "medium")
        self.assertEqual(self.service.validate_priority("low"), "low")
        self.assertEqual(self.service.validate_priority("urgent", fallback="medium"), "medium")
        self.assertEqual(self.service.validate_priority(None, fallback="low"), "low")

    def test_tolerant_type_normalization(self) -> None:
        self.assertEqual(self.service.validate_type("follow up"), RecommendationType.FOLLOW_UP.value)
        self.assertEqual(self.service.validate_type("discovery questions"), RecommendationType.DISCOVERY.value)
        self.assertEqual(self.service.validate_type("objection response"), RecommendationType.OBJECTION_HANDLING.value)
        self.assertEqual(self.service.validate_type("close call"), RecommendationType.CLOSING.value)
        self.assertEqual(self.service.validate_type("unknown category"), RecommendationType.GENERAL_IMPROVEMENT.value)


class TestIntelligenceSynthesisAndIntegration(unittest.IsolatedAsyncioTestCase):
    """Verifies that Phase 3, Phase 5, and Phase 6 data are accurately formatted and ingested."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = RecommendationService(provider=self.mock_llm)

    async def test_phase3_phase5_phase6_synthesis(self) -> None:
        phase3 = make_dummy_phase3(
            intent="Software Automation",
            sentiment="Interested",
            objections=[{"category": "Pricing", "description": "High setup fee", "timestamp": 25.0}],
            customer_needs=["Fast intake processing"],
        )
        phase5 = make_dummy_phase5(
            outcome="Follow-up Required",
            next_action="Send pricing sheet and call tomorrow at 10 AM",
        )
        phase6 = make_dummy_phase6(
            discovery_score=55.0,
            closing_score=60.0,
            weaknesses=["Did not confirm specific callback time."],
        )

        self.mock_llm.default_response = json.dumps({
            "recommendations": [
                {
                    "type": "Follow-up",
                    "priority": "high",
                    "recommendation": "Send pricing sheet and call tomorrow at 10 AM.",
                    "reason": "Lead requested pricing sheet and follow-up call.",
                    "evidence": [{"timestamp": 25.0, "speaker": "lead", "text": "Send me the sheet."}],
                    "source": "outcome",
                },
                {
                    "type": "Discovery",
                    "priority": "medium",
                    "recommendation": "Ask about current intake volume before presenting automation.",
                    "reason": "Discovery gap identified in Phase 6 evaluation.",
                    "evidence": [],
                    "source": "quality",
                },
            ]
        })

        res = await self.service.generate_recommendations(
            transcript_input="Lead: Send me the sheet.\nEmployee: Will do!",
            analysis_result=phase3,
            outcome_result=phase5,
            quality_result=phase6,
            call_id="call-syn-1",
        )

        sent_prompt = self.mock_llm.call_history[0].get_effective_prompt()
        self.assertIn("=== PHASE 3 CONTEXT ===", sent_prompt)
        self.assertIn("Software Automation", sent_prompt)
        self.assertIn("High setup fee", sent_prompt)
        self.assertIn("=== PHASE 5 OUTCOME CONTEXT ===", sent_prompt)
        self.assertIn("Follow-up Required", sent_prompt)
        self.assertIn("=== PHASE 6 QUALITY CONTEXT ===", sent_prompt)
        self.assertIn("Did not confirm specific callback time", sent_prompt)

        self.assertEqual(len(res.recommendations), 2)

    async def test_missing_phase3_handled_gracefully(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "recommendations": [
                {
                    "type": "Follow-up",
                    "priority": "high",
                    "recommendation": "Contact lead tomorrow.",
                    "reason": "Outcome indicated callback.",
                    "evidence": [],
                    "source": "outcome",
                }
            ]
        })
        res = await self.service.generate_recommendations(
            transcript_input="Employee: Speak tomorrow!\nLead: Sounds good.",
            analysis_result=None,
            call_id="call-nop3",
        )
        self.assertEqual(len(res.recommendations), 1)

    async def test_missing_phase5_and_phase6_handled_gracefully(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "recommendations": [
                {
                    "type": "Discovery",
                    "priority": "medium",
                    "recommendation": "Ask open-ended discovery questions.",
                    "reason": "Transcript had no discovery.",
                    "evidence": [],
                    "source": "transcript",
                }
            ]
        })
        res = await self.service.generate_recommendations(
            transcript_input="Employee: Buy our product.\nLead: No thanks.",
            outcome_result=None,
            quality_result=None,
            call_id="call-nop5p6",
        )
        self.assertEqual(len(res.recommendations), 1)


class TestDeduplicationAndEdgeCases(unittest.IsolatedAsyncioTestCase):
    """Verifies deduplication, excellent call handling, empty input behavior, and resilience."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = RecommendationService(provider=self.mock_llm)

    async def test_deduplication_of_semantically_similar_recommendations(self) -> None:
        # LLM returns duplicate variations of the same closing advice
        self.mock_llm.default_response = json.dumps({
            "recommendations": [
                {
                    "type": "Closing",
                    "priority": "medium",
                    "recommendation": "Confirm the agreed follow-up date and time.",
                    "reason": "Closing was vague.",
                    "evidence": [],
                    "source": "quality",
                },
                {
                    "type": "Closing",
                    "priority": "medium",
                    "recommendation": "Confirm the agreed follow-up date and time before ending call.",
                    "reason": "Closing was vague.",
                    "evidence": [],
                    "source": "quality",
                },
                {
                    "type": "Discovery",
                    "priority": "medium",
                    "recommendation": "Ask about current intake volume.",
                    "reason": "Discovery was brief.",
                    "evidence": [],
                    "source": "quality",
                },
            ]
        })

        res = await self.service.generate_recommendations(
            transcript_input="Employee: Bye!\nLead: Bye.",
            call_id="call-dedup-1",
        )

        closing_recs = [r for r in res.recommendations if r.type == RecommendationType.CLOSING.value]
        # Should deduplicate similar closing recommendations into 1
        self.assertEqual(len(closing_recs), 1)
        self.assertEqual(len(res.recommendations), 2)

    async def test_excellent_call_produces_zero_or_minimal_recommendations(self) -> None:
        # High quality score with no flaws
        flawless_quality = QualityResult(
            call_id="call-flawless",
            transcript_id="trans-flawless",
            overall_score=94.0,
            opening=QualityDimension(applicable=True, score=95.0, strengths=["Pristine introduction"]),
            discovery=QualityDimension(applicable=True, score=92.0, strengths=["Thorough workflow discovery"]),
            explanation=QualityDimension(applicable=True, score=95.0, strengths=["Perfect solution match"]),
            objection_handling=QualityDimension(applicable=False, score=None),
            closing=QualityDimension(applicable=True, score=94.0, strengths=["Booked demo for Thursday"]),
            strengths=["Exceptional dialogue execution across all stages."],
            weaknesses=[],
        )

        # Even if LLM tries to manufacture a generic nitpick, service strips synthetic weaknesses
        self.mock_llm.default_response = json.dumps({
            "recommendations": [
                {
                    "type": "Communication",
                    "priority": "low",
                    "recommendation": "Speak slightly slower.",
                    "reason": "Minor pacing thought.",
                    "evidence": [],
                    "source": "transcript",
                }
            ]
        })

        res = await self.service.generate_recommendations(
            transcript_input="Employee: Good morning!\nLead: Good morning.",
            quality_result=flawless_quality,
            call_id="call-flawless",
        )
        # Should return empty recommendations array for a flawless call without follow-up requests
        self.assertEqual(res.recommendations, [])

    async def test_empty_input_returns_empty_result(self) -> None:
        res = await self.service.generate_recommendations(
            transcript_input="",
            analysis_result=None,
            outcome_result=None,
            quality_result=None,
            call_id="call-empty",
        )
        self.assertEqual(res.recommendations, [])

    async def test_provider_rate_limit_resilience(self) -> None:
        self.mock_llm.fail_with = ProviderRateLimitError("Rate limit exceeded")
        phase5 = make_dummy_phase5(next_action="Send quote tomorrow morning")
        res = await self.service.generate_recommendations(
            transcript_input="Employee: Hello.\nLead: Hi.",
            outcome_result=phase5,
            call_id="call-rl",
        )
        # Resiliently falls back to deterministic rule from Phase 5 next_action
        self.assertEqual(len(res.recommendations), 1)
        self.assertEqual(res.recommendations[0].type, RecommendationType.FOLLOW_UP.value)

    async def test_provider_timeout_resilience(self) -> None:
        self.mock_llm.fail_with = ProviderTimeoutError("Request timed out after 30s")
        res = await self.service.generate_recommendations(
            transcript_input="Employee: Hello.\nLead: Hi.",
            call_id="call-to",
        )
        self.assertEqual(res.recommendations, [])

    async def test_provider_unavailable_resilience(self) -> None:
        self.mock_llm.fail_with = ProviderUnavailableError("Cluster unreachable")
        res = await self.service.generate_recommendations(
            transcript_input="Employee: Hello.\nLead: Hi.",
            call_id="call-unavail",
        )
        self.assertEqual(res.recommendations, [])

    async def test_malformed_json_resilience(self) -> None:
        self.mock_llm.default_response = "Here are recommendations: 1. Do better."
        phase6 = make_dummy_phase6(closing_score=50.0)
        res = await self.service.generate_recommendations(
            transcript_input="Employee: Hello.\nLead: Hi.",
            quality_result=phase6,
            call_id="call-bad-json",
        )
        # Falls back to deterministic rule generated from low closing score
        self.assertEqual(len(res.recommendations), 1)
        self.assertEqual(res.recommendations[0].type, RecommendationType.CLOSING.value)

    async def test_evidence_sanitization_and_bounds(self) -> None:
        cleaned = self.service.clean_evidence_list([
            {"timestamp": -10.0, "speaker": "employee", "text": "Negative timestamp"},
            {"timestamp": "invalid", "speaker": "lead", "text": "Invalid timestamp"},
            {"timestamp": 45.5, "speaker": "lead", "text": "Valid timestamp"},
            "Simple string evidence quote",
        ])
        self.assertEqual(len(cleaned), 4)
        self.assertIsNone(cleaned[0].timestamp)
        self.assertIsNone(cleaned[1].timestamp)
        self.assertEqual(cleaned[2].timestamp, 45.5)
        self.assertIsNone(cleaned[3].timestamp)


class TestRecommendationPersistence(unittest.IsolatedAsyncioTestCase):
    """Verifies optional repository integration without breaking Phase 4 boundaries."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.repo = MockRecommendationRepository()
        self.service = RecommendationService(provider=self.mock_llm, repository=self.repo)

    async def test_generate_and_persist_flow(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "recommendations": [
                {
                    "type": "Follow-up",
                    "priority": "high",
                    "recommendation": "Send contract to lead by 5 PM.",
                    "reason": "Lead requested agreement today.",
                    "evidence": [],
                    "source": "outcome",
                }
            ]
        })
        res = await self.service.generate_and_persist(
            transcript_input="Lead: Send contract today.",
            call_id="call-p-1",
        )
        self.assertEqual(res.call_id, "call-p-1")
        self.assertIn("call-p-1", self.repo.store)
        self.assertEqual(len(self.repo.store["call-p-1"].recommendations), 1)


if __name__ == "__main__":
    unittest.main()
