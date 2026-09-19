"""
Comprehensive Unit Tests for FRIDAY AI Analysis Engine (Phase 3).
Verifies:
- IntentService classification, confidence boundaries, and error handling.
- SentimentService positive/neutral/negative/mixed classification.
- ObjectionService category detection, timestamp grounding, and empty states.
- KeywordService stopword filtering, frequency calculation, and segment timestamp matching.
- SummaryService factual condensation, bullet extraction, and next step preservation.
- AnalysisService unified multi-modal extraction.
- AnalysisPipeline execution and input validation.
All tests run deterministically with MockLLMProvider with zero external cloud dependencies.
"""

import json
import unittest
from typing import Any, Dict, List

from app.ai.models.analysis_model import AnalysisResult, KeywordItem, SummaryResult
from app.ai.models.intent_model import IntentCategory, IntentResult
from app.ai.models.objection_model import ObjectionCategory, ObjectionItem
from app.ai.models.sentiment_model import SentimentCategory, SentimentResult
from app.ai.pipelines.analysis_pipeline import AnalysisPipeline
from app.ai.providers import (
    LLMRequest,
    MockLLMProvider,
    TranscriptSegment,
    TranscriptionResult,
)
from app.ai.providers.exceptions import (
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderUnavailableError,
)
from app.services.ai.analysis_service import AnalysisService
from app.services.ai.intent_service import IntentService
from app.services.ai.keyword_service import KeywordService
from app.services.ai.objection_service import ObjectionService
from app.services.ai.sentiment_service import SentimentService
from app.services.ai.summary_service import SummaryService
from app.services.transcription.models import NormalizedTranscriptSegment, TranscriptionOutput


class TestIntentService(unittest.IsolatedAsyncioTestCase):
    """Verifies intent extraction, category matching, and confidence normalization."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = IntentService(provider=self.mock_llm)

    async def test_pricing_inquiry_intent(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "intent": "Pricing Inquiry",
            "confidence": 0.94,
            "evidence": "Lead asked how much the enterprise tier costs per seat.",
        })
        res = await self.service.analyze("How much does the enterprise tier cost?")
        self.assertEqual(res.intent, IntentCategory.PRICING_INQUIRY.value)
        self.assertEqual(res.confidence, 0.94)
        self.assertIn("enterprise tier", res.evidence)

    async def test_purchase_intent(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "intent": "Purchase Intent",
            "confidence": 0.88,
            "evidence": "Customer said they are ready to sign the contract today.",
        })
        res = await self.service.analyze("We are ready to buy.")
        self.assertEqual(res.intent, IntentCategory.PURCHASE_INTENT.value)
        self.assertEqual(res.confidence, 0.88)

    async def test_support_and_complaint_intents(self) -> None:
        # Support
        self.mock_llm.default_response = json.dumps({
            "intent": "support",
            "confidence": 0.85,
            "evidence": "Customer cannot log in to their dashboard.",
        })
        res1 = await self.service.analyze("I can't log in.")
        self.assertEqual(res1.intent, IntentCategory.SUPPORT_REQUEST.value)

        # Complaint
        self.mock_llm.default_response = json.dumps({
            "intent": "complaint",
            "confidence": 0.92,
            "evidence": "Lead is furious about billing downtime.",
        })
        res2 = await self.service.analyze("Your service has been down all morning.")
        self.assertEqual(res2.intent, IntentCategory.COMPLAINT.value)

    async def test_empty_transcript_intent(self) -> None:
        res = await self.service.analyze("")
        self.assertEqual(res.intent, IntentCategory.OTHER.value)
        self.assertEqual(res.confidence, 0.0)

    async def test_confidence_normalization_bounds(self) -> None:
        # Percentage 95 -> 0.95
        self.mock_llm.default_response = json.dumps({
            "intent": "Product Inquiry",
            "confidence": 95.0,
            "evidence": "Asking about CRM sync.",
        })
        res = await self.service.analyze("Does it sync with CRM?")
        self.assertEqual(res.confidence, 0.95)

        # Negative -> 0.0
        self.mock_llm.default_response = json.dumps({
            "intent": "Product Inquiry",
            "confidence": -0.5,
            "evidence": "Invalid negative confidence.",
        })
        res2 = await self.service.analyze("Test")
        self.assertEqual(res2.confidence, 0.0)


class TestSentimentService(unittest.IsolatedAsyncioTestCase):
    """Verifies sentiment analysis categories, confidence, and edge cases."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = SentimentService(provider=self.mock_llm)

    async def test_positive_sentiment(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "sentiment": "Positive",
            "confidence": 0.91,
            "evidence": "Lead was excited about the new analytics feature.",
        })
        res = await self.service.analyze("This looks amazing!")
        self.assertEqual(res.sentiment, SentimentCategory.POSITIVE.value)
        self.assertEqual(res.confidence, 0.91)

    async def test_negative_sentiment(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "sentiment": "negative",
            "confidence": 0.82,
            "evidence": "Lead expressed frustration with delays.",
        })
        res = await self.service.analyze("We are unhappy with the delay.")
        self.assertEqual(res.sentiment, SentimentCategory.NEGATIVE.value)

    async def test_mixed_sentiment(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "sentiment": "mixed",
            "confidence": 0.75,
            "evidence": "Likes the features but worried about price.",
        })
        res = await self.service.analyze("I like the UI, but it's too pricey.")
        self.assertEqual(res.sentiment, SentimentCategory.MIXED.value)

    async def test_empty_transcript_sentiment(self) -> None:
        res = await self.service.analyze("")
        self.assertEqual(res.sentiment, SentimentCategory.NEUTRAL.value)
        self.assertEqual(res.confidence, 0.0)


class TestObjectionService(unittest.IsolatedAsyncioTestCase):
    """Verifies sales objection identification, timestamps, and empty response handling."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = ObjectionService(provider=self.mock_llm)

    async def test_pricing_and_timing_objections(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "objections": [
                {
                    "category": "Pricing",
                    "description": "Enterprise plan exceeds current budget.",
                    "confidence": 0.89,
                    "timestamp": 45.2,
                    "evidence": "Lead said $50k is over budget.",
                },
                {
                    "category": "Timing",
                    "description": "Current quarter is frozen for new tool evaluations.",
                    "confidence": 0.84,
                    "timestamp": 82.0,
                    "evidence": "Call us back in Q4.",
                },
            ]
        })

        res = await self.service.analyze("Sample transcript with objections")
        self.assertEqual(len(res), 2)
        self.assertEqual(res[0].category, ObjectionCategory.PRICING.value)
        self.assertEqual(res[0].timestamp, 45.2)
        self.assertEqual(res[1].category, ObjectionCategory.TIMING.value)
        self.assertEqual(res[1].timestamp, 82.0)

    async def test_no_objections_returns_empty_list(self) -> None:
        self.mock_llm.default_response = json.dumps({"objections": []})
        res = await self.service.analyze("Friendly smooth call with no friction.")
        self.assertEqual(res, [])

    async def test_clamping_negative_timestamps(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "objections": [
                {
                    "category": "Competitor",
                    "description": "Already evaluating competitor.",
                    "confidence": 0.8,
                    "timestamp": -10.5,
                    "evidence": "Using competitor tool.",
                }
            ]
        })
        res = await self.service.analyze("Competitor dialogue")
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0].timestamp, 0.0)


class TestKeywordService(unittest.IsolatedAsyncioTestCase):
    """Verifies keyword filtering, stopword exclusion, and timestamp alignment."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = KeywordService(provider=self.mock_llm)

    async def test_extract_meaningful_keywords_and_filter_stopwords(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "keywords": [
                {"keyword": "CRM integration", "relevance": 0.92, "frequency": 3},
                {"keyword": "enterprise pricing", "relevance": 0.85, "frequency": 2},
                {"keyword": "and", "relevance": 0.99, "frequency": 10},  # Stop word
                {"keyword": "the", "relevance": 0.95, "frequency": 15},  # Stop word
                {"keyword": "security compliance", "relevance": 0.78, "frequency": 1},
            ]
        })

        segments = [
            {"start": 12.0, "end": 16.0, "text": "We need CRM integration across all sales reps."},
            {"start": 45.5, "end": 50.0, "text": "What about enterprise pricing discounts?"},
            {"start": 70.0, "end": 75.0, "text": "Our CRM integration must support OAuth."},
        ]

        res = await self.service.analyze("Sample transcript", segments=segments)
        # Verify stopwords 'and' and 'the' were filtered
        extracted_names = [k.keyword.lower() for k in res]
        self.assertIn("crm integration", extracted_names)
        self.assertIn("enterprise pricing", extracted_names)
        self.assertIn("security compliance", extracted_names)
        self.assertNotIn("and", extracted_names)
        self.assertNotIn("the", extracted_names)

        # Check matched segment timestamps
        crm_kw = next(k for k in res if k.keyword.lower() == "crm integration")
        self.assertIn(12.0, crm_kw.timestamps)
        self.assertIn(70.0, crm_kw.timestamps)

    async def test_empty_transcript_keywords(self) -> None:
        res = await self.service.analyze("")
        self.assertEqual(res, [])


class TestSummaryService(unittest.IsolatedAsyncioTestCase):
    """Verifies call summary generation, key points, customer needs, and next step preservation."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()
        self.service = SummaryService(provider=self.mock_llm)

    async def test_summary_with_explicit_next_steps(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "summary": "Arun presented FRIDAY features to the prospective client, focusing on automatic CRM transcription.",
            "key_points": [
                "Reviewed automatic audio synchronization.",
                "Discussed enterprise volume tiers.",
            ],
            "customer_needs": ["Automated CRM note creation", "Multi-rep assignment"],
            "concerns": ["Onboarding timeline"],
            "next_steps": ["Send custom price quote by Friday at 2 PM"],
        })

        res = await self.service.summarize("Transcript text")
        self.assertIn("Arun presented FRIDAY", res.summary)
        self.assertEqual(len(res.key_points), 2)
        self.assertEqual(len(res.customer_needs), 2)
        self.assertEqual(res.next_steps, ["Send custom price quote by Friday at 2 PM"])

    async def test_summary_with_no_next_steps(self) -> None:
        self.mock_llm.default_response = json.dumps({
            "summary": "Informational demo call; lead did not commit to any follow up.",
            "key_points": ["Basic overview provided."],
            "customer_needs": [],
            "concerns": [],
            "next_steps": [],
        })

        res = await self.service.summarize("Informational call")
        self.assertEqual(res.next_steps, [])

    async def test_empty_transcript_summary(self) -> None:
        res = await self.service.summarize("")
        self.assertIn("Empty transcript", res.summary)
        self.assertEqual(res.next_steps, [])


class TestAnalysisServiceAndPipeline(unittest.IsolatedAsyncioTestCase):
    """Verifies end-to-end multi-component analysis and AnalysisPipeline integration."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = MockLLMProvider()

        # Dynamic handler to simulate real prompt-based responses
        def dynamic_handler(req: LLMRequest) -> str:
            prompt = req.get_effective_prompt().lower()
            if "summarize" in prompt or "summary" in prompt:
                return json.dumps({
                    "summary": "Call between employee and lead discussing enterprise plan pricing and CRM sync.",
                    "key_points": ["Lead expressed interest in enterprise plan.", "Reviewed pricing options."],
                    "customer_needs": ["CRM integration", "Scalable seat pricing"],
                    "concerns": ["Current pricing exceeds initial budget"],
                    "next_steps": ["Schedule follow-up demo on Thursday at 10 AM"],
                })
            else:
                return json.dumps({
                    "intent": {
                        "intent": "Pricing Inquiry",
                        "confidence": 0.92,
                        "evidence": "Lead explicitly asked for discount on annual commitment.",
                    },
                    "sentiment": {
                        "sentiment": "Mixed",
                        "confidence": 0.81,
                        "evidence": "Excited about features but hesitant on price.",
                    },
                    "objections": [
                        {
                            "category": "Pricing",
                            "description": "Cost per user is higher than expected.",
                            "confidence": 0.88,
                            "timestamp": 14.5,
                            "evidence": "The price per seat is steep.",
                        }
                    ],
                    "keywords": [
                        {"keyword": "enterprise plan", "relevance": 0.95, "frequency": 2},
                        {"keyword": "CRM integration", "relevance": 0.89, "frequency": 1},
                    ],
                })

        self.mock_llm.set_dynamic_handler(dynamic_handler)
        self.analysis_service = AnalysisService(provider=self.mock_llm)
        self.pipeline = AnalysisPipeline(analysis_service=self.analysis_service)

    async def test_pipeline_execution_with_transcription_output(self) -> None:
        # Construct realistic Phase 2 TranscriptionOutput
        segments = [
            NormalizedTranscriptSegment(
                start=0.0,
                end=4.2,
                text="Hello, thanks for taking the call from FRIDAY.",
                speaker="employee",
            ),
            NormalizedTranscriptSegment(
                start=4.5,
                end=10.0,
                text="Hi Arun, I'm interested in the enterprise plan, but the price per seat is steep.",
                speaker="lead",
            ),
            NormalizedTranscriptSegment(
                start=10.5,
                end=16.0,
                text="We also require seamless CRM integration with our Salesforce instance.",
                speaker="lead",
            ),
        ]
        transcription_output = TranscriptionOutput(
            recording_id="rec_phase3_001",
            call_id="call_phase3_001",
            language="en",
            duration=16.0,
            text="Hello, thanks for taking the call... CRM integration with Salesforce.",
            segments=segments,
        )

        result: AnalysisResult = await self.pipeline.execute(
            transcript_input=transcription_output,
            call_id="call_phase3_001",
            transcript_id="trans_001",
        )

        self.assertIsInstance(result, AnalysisResult)
        self.assertEqual(result.call_id, "call_phase3_001")
        self.assertEqual(result.transcript_id, "trans_001")

        # Intent
        self.assertEqual(result.intent.intent, IntentCategory.PRICING_INQUIRY.value)
        self.assertEqual(result.intent.confidence, 0.92)

        # Sentiment
        self.assertEqual(result.sentiment.sentiment, SentimentCategory.MIXED.value)

        # Objections
        self.assertEqual(len(result.objections), 1)
        self.assertEqual(result.objections[0].category, ObjectionCategory.PRICING.value)
        self.assertEqual(result.objections[0].timestamp, 14.5)

        # Keywords
        kw_names = [k.keyword for k in result.keywords]
        self.assertIn("enterprise plan", kw_names)

        # Summary
        self.assertIn("Call between employee and lead", result.summary.summary)
        self.assertEqual(result.summary.next_steps, ["Schedule follow-up demo on Thursday at 10 AM"])

        # Dict export test
        res_dict = result.to_dict()
        self.assertEqual(res_dict["call_id"], "call_phase3_001")
        self.assertIn("intent", res_dict)
        self.assertIn("sentiment", res_dict)
        self.assertIn("objections", res_dict)
        self.assertIn("keywords", res_dict)
        self.assertIn("summary", res_dict)

    async def test_pipeline_none_transcript_raises_error(self) -> None:
        with self.assertRaises(ValueError):
            await self.pipeline.execute(None)

    async def test_pipeline_empty_transcript_safe_fallback(self) -> None:
        res = await self.pipeline.execute("")
        self.assertEqual(res.intent.intent, IntentCategory.OTHER.value)
        self.assertEqual(res.sentiment.sentiment, SentimentCategory.NEUTRAL.value)
        self.assertEqual(res.objections, [])
        self.assertEqual(res.keywords, [])
        self.assertIn("Empty transcript", res.summary.summary)


if __name__ == "__main__":
    unittest.main()
