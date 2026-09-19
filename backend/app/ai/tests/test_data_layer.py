"""
Comprehensive Unit and Integration Tests for FRIDAY AI Data Layer (Phase 4).
Verifies:
- AI Analysis SQLAlchemy Model and Schema validation.
- Outcome SQLAlchemy Model and Schema validation.
- AnalysisRepository CRUD operations, uniqueness constraints, and error handling.
- OutcomeRepository CRUD operations, uniqueness constraints, and error handling.
- Deterministic Mapping from Phase 3 AnalysisResult to Phase 4 Persistence models.
Runs with zero external database or AI API dependencies.
"""

import unittest
from datetime import datetime, timezone

from app.ai.models.analysis_model import AnalysisResult, KeywordItem, SummaryResult
from app.ai.models.intent_model import IntentCategory, IntentResult
from app.ai.models.objection_model import ObjectionCategory, ObjectionItem
from app.ai.models.sentiment_model import SentimentCategory, SentimentResult
from app.models.ai_analysis import AIAnalysis
from app.models.outcome import Outcome, OutcomeCategory
from app.repositories.analysis_repository import (
    AnalysisNotFoundError,
    AnalysisRepository,
    DuplicateAnalysisError,
)
from app.repositories.outcome_repository import (
    DuplicateOutcomeError,
    OutcomeNotFoundError,
    OutcomeRepository,
)
from app.schemas.analysis import (
    AnalysisCreate,
    AnalysisResponse,
    AnalysisUpdate,
    KeywordSchema,
    ObjectionSchema,
    validate_confidence_range,
)
from app.schemas.mapping import (
    analysis_create_to_model,
    analysis_result_to_create_schema,
    outcome_create_to_model,
)
from app.schemas.outcome import OutcomeCreate, OutcomeResponse, OutcomeUpdate


class TestAnalysisSchemas(unittest.TestCase):
    """Verifies schema validation, bounds checking, and formatting for AI Analysis."""

    def test_valid_confidence_range(self) -> None:
        self.assertEqual(validate_confidence_range(0.85), 0.85)
        self.assertEqual(validate_confidence_range("0.95"), 0.95)
        self.assertEqual(validate_confidence_range(0.0), 0.0)
        self.assertEqual(validate_confidence_range(1.0), 1.0)

    def test_invalid_confidence_raises_value_error(self) -> None:
        with self.assertRaises(ValueError):
            validate_confidence_range(1.5)
        with self.assertRaises(ValueError):
            validate_confidence_range(-0.1)
        with self.assertRaises(ValueError):
            validate_confidence_range("invalid")

    def test_objection_schema_validation(self) -> None:
        obj = ObjectionSchema(
            category="Pricing",
            description="Exceeds budget",
            confidence=0.88,
            timestamp=45.2,
            evidence="Cost is high",
        )
        self.assertEqual(obj.category, "Pricing")
        self.assertEqual(obj.confidence, 0.88)
        self.assertEqual(obj.timestamp, 45.2)

        # Negative timestamp clamped to 0.0
        obj_neg = ObjectionSchema(
            category="Timing",
            confidence=0.5,
            timestamp=-10.0,
        )
        self.assertEqual(obj_neg.timestamp, 0.0)

        # Empty category raises ValueError
        with self.assertRaises(ValueError):
            ObjectionSchema(category="")

    def test_keyword_schema_validation(self) -> None:
        kw = KeywordSchema(
            keyword="CRM integration",
            relevance=0.92,
            frequency=3,
            timestamps=[12.0, 70.5],
        )
        self.assertEqual(kw.keyword, "CRM integration")
        self.assertEqual(kw.relevance, 0.92)
        self.assertEqual(kw.frequency, 3)
        self.assertEqual(kw.timestamps, [12.0, 70.5])

        with self.assertRaises(ValueError):
            KeywordSchema(keyword="")

    def test_analysis_create_validation(self) -> None:
        # Missing call_id raises
        with self.assertRaises(ValueError):
            AnalysisCreate(call_id="")

        # Valid create schema
        create = AnalysisCreate(
            call_id="call_123",
            transcript_id="trans_456",
            intent="Pricing Inquiry",
            intent_confidence=0.95,
            sentiment="Mixed",
            sentiment_confidence=0.8,
            objections=[{"category": "Pricing", "confidence": 0.9}],
            keywords=[{"keyword": "pricing", "relevance": 0.85}],
            summary="Discussion about pricing.",
            next_steps=["Send quote"],
        )
        self.assertEqual(create.call_id, "call_123")
        self.assertEqual(create.intent_confidence, 0.95)


class TestOutcomeSchemas(unittest.TestCase):
    """Verifies schema validation for Call Outcomes."""

    def test_valid_outcome_create(self) -> None:
        out = OutcomeCreate(
            call_id="call_999",
            outcome="Interested",
            confidence=0.88,
            evidence="Client asked to proceed with trial.",
            next_action="Send onboarding link",
        )
        self.assertEqual(out.call_id, "call_999")
        self.assertEqual(out.outcome, OutcomeCategory.INTERESTED.value)
        self.assertEqual(out.confidence, 0.88)

    def test_outcome_category_normalization(self) -> None:
        out = OutcomeCreate(
            call_id="call_999",
            outcome="deal closed",
            confidence=0.95,
        )
        self.assertEqual(out.outcome, OutcomeCategory.CONVERTED.value)

    def test_outcome_invalid_confidence(self) -> None:
        with self.assertRaises(ValueError):
            OutcomeCreate(call_id="call_1", outcome="Interested", confidence=2.0)


class TestAnalysisRepository(unittest.TestCase):
    """Verifies CRUD operations and uniqueness for AnalysisRepository."""

    def setUp(self) -> None:
        self.repo = AnalysisRepository()

    def test_create_and_retrieve_by_id_and_call_id(self) -> None:
        create_in = AnalysisCreate(
            call_id="call_test_001",
            transcript_id="trans_test_001",
            intent="Purchase Intent",
            intent_confidence=0.91,
            intent_evidence="Ready to sign",
            sentiment="Positive",
            sentiment_confidence=0.89,
            sentiment_evidence="Loved the demo",
            objections=[{"category": "Timing", "confidence": 0.7, "timestamp": 30.0}],
            keywords=[{"keyword": "enterprise", "relevance": 0.95, "frequency": 2}],
            summary="Customer ready to sign annual deal.",
            key_points=["Demo was successful"],
            next_steps=["Send agreement"],
        )

        record = self.repo.create(create_in)
        self.assertIsNotNone(record.id)
        self.assertEqual(record.call_id, "call_test_001")
        self.assertEqual(record.intent, "Purchase Intent")

        # Retrieve by ID
        by_id = self.repo.get_by_id(record.id)
        self.assertIsNotNone(by_id)
        self.assertEqual(by_id.id, record.id)

        # Retrieve by Call ID
        by_call = self.repo.get_by_call_id("call_test_001")
        self.assertIsNotNone(by_call)
        self.assertEqual(by_call.call_id, "call_test_001")

        # Retrieve by Transcript ID
        by_trans = self.repo.get_by_transcript_id("trans_test_001")
        self.assertIsNotNone(by_trans)
        self.assertEqual(by_trans.transcript_id, "trans_test_001")

        # Exists
        self.assertTrue(self.repo.exists("call_test_001"))
        self.assertFalse(self.repo.exists("call_non_existent"))

    def test_duplicate_analysis_raises_error(self) -> None:
        create_in = AnalysisCreate(call_id="call_dup_001", intent="Other")
        self.repo.create(create_in)

        with self.assertRaises(DuplicateAnalysisError):
            self.repo.create(create_in)

    def test_missing_analysis_returns_none(self) -> None:
        self.assertIsNone(self.repo.get_by_id("non_existent_id"))
        self.assertIsNone(self.repo.get_by_call_id("non_existent_call"))
        self.assertIsNone(self.repo.get_by_transcript_id("non_existent_trans"))

    def test_update_analysis(self) -> None:
        record = self.repo.create(AnalysisCreate(call_id="call_up_001", intent="Other", intent_confidence=0.5))
        updated = self.repo.update(
            record.id,
            AnalysisUpdate(intent="Support Request", intent_confidence=0.92, summary="Updated summary"),
        )
        self.assertEqual(updated.intent, "Support Request")
        self.assertEqual(updated.intent_confidence, 0.92)
        self.assertEqual(updated.summary, "Updated summary")

        with self.assertRaises(AnalysisNotFoundError):
            self.repo.update("unknown_id", AnalysisUpdate(intent="Complaint"))

    def test_delete_analysis(self) -> None:
        record = self.repo.create(AnalysisCreate(call_id="call_del_001"))
        self.assertTrue(self.repo.delete(record.id))
        self.assertIsNone(self.repo.get_by_id(record.id))
        self.assertFalse(self.repo.delete(record.id))


class TestOutcomeRepository(unittest.TestCase):
    """Verifies CRUD operations and uniqueness for OutcomeRepository."""

    def setUp(self) -> None:
        self.repo = OutcomeRepository()

    def test_create_and_retrieve_outcome(self) -> None:
        create_in = OutcomeCreate(
            call_id="call_out_001",
            transcript_id="trans_out_001",
            outcome="Interested",
            confidence=0.94,
            evidence="Lead asked for contract terms",
            next_action="Email standard terms",
        )

        record = self.repo.create(create_in)
        self.assertIsNotNone(record.id)
        self.assertEqual(record.outcome, OutcomeCategory.INTERESTED.value)

        by_id = self.repo.get_by_id(record.id)
        self.assertIsNotNone(by_id)
        self.assertEqual(by_id.id, record.id)

        by_call = self.repo.get_by_call_id("call_out_001")
        self.assertIsNotNone(by_call)
        self.assertEqual(by_call.call_id, "call_out_001")

        by_trans = self.repo.get_by_transcript_id("trans_out_001")
        self.assertIsNotNone(by_trans)
        self.assertEqual(by_trans.transcript_id, "trans_out_001")

        self.assertTrue(self.repo.exists("call_out_001"))

    def test_duplicate_outcome_raises_error(self) -> None:
        create_in = OutcomeCreate(call_id="call_out_dup", outcome="Busy")
        self.repo.create(create_in)

        with self.assertRaises(DuplicateOutcomeError):
            self.repo.create(create_in)

    def test_update_and_delete_outcome(self) -> None:
        record = self.repo.create(OutcomeCreate(call_id="call_out_up", outcome="Follow-up Required"))
        updated = self.repo.update(
            record.id,
            OutcomeUpdate(outcome="Converted", confidence=0.99, next_action="Setup account"),
        )
        self.assertEqual(updated.outcome, OutcomeCategory.CONVERTED.value)
        self.assertEqual(updated.confidence, 0.99)

        self.assertTrue(self.repo.delete(record.id))
        self.assertIsNone(self.repo.get_by_id(record.id))
        self.assertFalse(self.repo.delete(record.id))

        with self.assertRaises(OutcomeNotFoundError):
            self.repo.update("unknown_id", OutcomeUpdate(outcome="Interested"))


class TestPhase3ToPhase4Mapping(unittest.TestCase):
    """Verifies deterministic lossless mapping from Phase 3 AnalysisResult to persistence."""

    def test_analysis_result_to_persistence_mapping(self) -> None:
        phase3_result = AnalysisResult(
            call_id="call_p3_p4_001",
            transcript_id="trans_p3_p4_001",
            intent=IntentResult(
                intent=IntentCategory.PRICING_INQUIRY.value,
                confidence=0.93,
                evidence="Asking about annual discount.",
            ),
            sentiment=SentimentResult(
                sentiment=SentimentCategory.MIXED.value,
                confidence=0.82,
                evidence="Hesitant on price.",
            ),
            objections=[
                ObjectionItem(
                    category=ObjectionCategory.PRICING.value,
                    description="High seat license fee",
                    confidence=0.87,
                    timestamp=24.5,
                    evidence="License fee is too high",
                )
            ],
            keywords=[
                KeywordItem(
                    keyword="annual discount",
                    relevance=0.91,
                    frequency=2,
                    timestamps=[15.0, 24.5],
                )
            ],
            summary=SummaryResult(
                summary="Discussed enterprise volume pricing.",
                key_points=["Reviewed 100 seat package"],
                customer_needs=["Lower cost per seat"],
                concerns=["Budget limit"],
                next_steps=["Send updated quote on Monday"],
            ),
            model="gemini-2.5-flash",
            provider="gemini",
        )

        # Step 1: Map to AnalysisCreate schema
        create_schema = analysis_result_to_create_schema(phase3_result)
        self.assertEqual(create_schema.call_id, "call_p3_p4_001")
        self.assertEqual(create_schema.intent, IntentCategory.PRICING_INQUIRY.value)
        self.assertEqual(create_schema.intent_confidence, 0.93)
        self.assertEqual(len(create_schema.objections), 1)
        self.assertEqual(create_schema.objections[0]["category"], ObjectionCategory.PRICING.value)
        self.assertEqual(create_schema.next_steps, ["Send updated quote on Monday"])

        # Step 2: Map to SQLAlchemy model
        model = analysis_create_to_model(create_schema)
        self.assertIsInstance(model, AIAnalysis)
        self.assertEqual(model.call_id, "call_p3_p4_001")
        self.assertEqual(model.summary, "Discussed enterprise volume pricing.")

        # Step 3: Persist through AnalysisRepository
        repo = AnalysisRepository()
        persisted = repo.create(create_schema)
        self.assertIsNotNone(persisted.id)
        self.assertEqual(persisted.call_id, "call_p3_p4_001")

        # Step 4: Serialize through AnalysisResponse
        response = AnalysisResponse.from_orm(persisted)
        self.assertEqual(response.call_id, "call_p3_p4_001")
        self.assertEqual(response.intent.label, IntentCategory.PRICING_INQUIRY.value)
        self.assertEqual(response.sentiment.label, SentimentCategory.MIXED.value)
        self.assertEqual(response.objections[0].category, ObjectionCategory.PRICING.value)
        self.assertEqual(response.keywords[0].keyword, "annual discount")
        self.assertEqual(response.next_steps, ["Send updated quote on Monday"])


if __name__ == "__main__":
    unittest.main()
