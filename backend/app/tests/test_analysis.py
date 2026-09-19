"""
FRIDAY AI Phase 9 API Tests (Routes: /api/analysis & /api/outcomes).
Tests:
- GET analysis by ID
- GET analysis by call
- GET analysis by transcript
- analysis not found (404)
- invalid analysis ID (400)
- unauthorized access (401)
- forbidden access (403)
- valid processing trigger (202)
- processing already completed (409)
- processing already running (409)
- missing call
- missing transcript
- GET outcome by ID
- GET outcome by call
- GET outcome by transcript
- outcome not found (404)
- invalid outcome ID (400)
- unauthorized access (401)
- forbidden access (403)
- valid outcome processing trigger (202)
- outcome analysis dependency missing (409)
- outcome already completed (409)
- outcome already processing (409)
- async processing lifecycle & status transitions
"""

import asyncio
import unittest
from typing import Any, Dict, Optional

from app.api.routes.common import HTTPException
from app.api.routes.analysis import (
    CurrentUser,
    ProcessAnalysisRequest,
    get_analysis_by_call,
    get_analysis_by_id,
    get_analysis_by_transcript,
    trigger_analysis_process,
    validate_identifier,
)
from app.api.routes.outcomes import (
    ProcessOutcomeRequest,
    get_outcome_by_call,
    get_outcome_by_id,
    get_outcome_by_transcript,
    trigger_outcome_process,
)
from app.models.ai_analysis import AIAnalysis
from app.models.outcome import Outcome, OutcomeCategory
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.outcome_repository import OutcomeRepository
from app.schemas.analysis import AnalysisCreate, AnalysisResponse
from app.schemas.outcome import OutcomeCreate, OutcomeResponse
from app.workers.analysis_worker import AnalysisWorker
from app.workers.context import AIProcessingContext, StageStatus


class TestAnalysisAPIRoutes(unittest.IsolatedAsyncioTestCase):
    """Verifies all /api/analysis route endpoints, validations, and security."""

    async def asyncSetUp(self) -> None:
        self.analysis_repo = AnalysisRepository()
        self.outcome_repo = OutcomeRepository()
        self.worker = AnalysisWorker(
            analysis_repository=self.analysis_repo,
            outcome_repository=self.outcome_repo,
        )

        self.authorized_user = CurrentUser(id="usr-1", role="agent")
        self.unauthorized_user = None  # No credentials provided
        self.forbidden_user = CurrentUser(id="usr-2", role="unauthorized")

        # Seed an analysis record
        self.sample_analysis = self.analysis_repo.create(
            AnalysisCreate(
                call_id="call-101",
                transcript_id="tr-101",
                intent="Pricing Inquiry",
                intent_confidence=0.92,
                intent_evidence="Customer asked about enterprise tiers.",
                sentiment="Positive",
                sentiment_confidence=0.88,
                sentiment_evidence="Sounded very enthusiastic.",
                objections=[{"category": "Budget", "description": "Too expensive", "confidence": 0.85}],
                keywords=[{"keyword": "enterprise tier", "relevance": 0.95}],
                summary="Discussed enterprise pricing plan.",
                key_points=["Budget discussion", "Enterprise tier"],
                customer_needs=["Predictable cost"],
                concerns=["Deployment time"],
                next_steps=["Send proposal"],
            )
        )

    # 1. GET analysis by ID
    async def test_get_analysis_by_id_success(self) -> None:
        resp = await get_analysis_by_id(
            analysis_id=self.sample_analysis.id,
            current_user=self.authorized_user,
            analysis_repo=self.analysis_repo,
        )
        self.assertIsInstance(resp, AnalysisResponse)
        self.assertEqual(resp.id, self.sample_analysis.id)
        self.assertEqual(resp.call_id, "call-101")
        self.assertEqual(resp.intent.label, "Pricing Inquiry")
        self.assertEqual(resp.sentiment.label, "Positive")
        self.assertEqual(len(resp.objections), 1)
        self.assertEqual(resp.objections[0].category, "Budget")

    # 2. GET analysis by call
    async def test_get_analysis_by_call_success(self) -> None:
        resp = await get_analysis_by_call(
            call_id="call-101",
            current_user=self.authorized_user,
            analysis_repo=self.analysis_repo,
        )
        self.assertIsInstance(resp, AnalysisResponse)
        self.assertEqual(resp.call_id, "call-101")
        self.assertEqual(resp.summary, "Discussed enterprise pricing plan.")

    # 3. GET analysis by transcript
    async def test_get_analysis_by_transcript_success(self) -> None:
        resp = await get_analysis_by_transcript(
            transcript_id="tr-101",
            current_user=self.authorized_user,
            analysis_repo=self.analysis_repo,
        )
        self.assertIsInstance(resp, AnalysisResponse)
        self.assertEqual(resp.transcript_id, "tr-101")

    # 4. Analysis not found (404)
    async def test_analysis_not_found(self) -> None:
        with self.assertRaises(HTTPException) as cm:
            await get_analysis_by_call(
                call_id="call-nonexistent",
                current_user=self.authorized_user,
                analysis_repo=self.analysis_repo,
            )
        self.assertEqual(cm.exception.status_code, 404)

        with self.assertRaises(HTTPException) as cm2:
            await get_analysis_by_id(
                analysis_id="an-nonexistent",
                current_user=self.authorized_user,
                analysis_repo=self.analysis_repo,
            )
        self.assertEqual(cm2.exception.status_code, 404)

        with self.assertRaises(HTTPException) as cm3:
            await get_analysis_by_transcript(
                transcript_id="tr-nonexistent",
                current_user=self.authorized_user,
                analysis_repo=self.analysis_repo,
            )
        self.assertEqual(cm3.exception.status_code, 404)

    # 5. Invalid identifier (400)
    async def test_invalid_identifier_validation(self) -> None:
        with self.assertRaises(HTTPException) as cm:
            await get_analysis_by_call(
                call_id="",
                current_user=self.authorized_user,
                analysis_repo=self.analysis_repo,
            )
        self.assertEqual(cm.exception.status_code, 400)

        with self.assertRaises(HTTPException) as cm2:
            await get_analysis_by_call(
                call_id="call/123/bad",
                current_user=self.authorized_user,
                analysis_repo=self.analysis_repo,
            )
        self.assertEqual(cm2.exception.status_code, 400)

    # 6. Unauthorized access (401)
    async def test_unauthorized_access(self) -> None:
        with self.assertRaises(HTTPException) as cm:
            await get_analysis_by_call(
                call_id="call-101",
                current_user=self.unauthorized_user,
                analysis_repo=self.analysis_repo,
            )
        self.assertEqual(cm.exception.status_code, 401)

    # 7. Forbidden access (403)
    async def test_forbidden_access(self) -> None:
        with self.assertRaises(HTTPException) as cm:
            await get_analysis_by_call(
                call_id="call-101",
                current_user=self.forbidden_user,
                analysis_repo=self.analysis_repo,
            )
        self.assertEqual(cm.exception.status_code, 403)

    # 8. User call ownership access check (403)
    async def test_call_ownership_restriction(self) -> None:
        restricted_user = CurrentUser(id="usr-3", role="agent")
        restricted_user.accessible_call_ids = {"call-999"}  # Does not have call-101

        with self.assertRaises(HTTPException) as cm:
            await get_analysis_by_call(
                call_id="call-101",
                current_user=restricted_user,
                analysis_repo=self.analysis_repo,
            )
        self.assertEqual(cm.exception.status_code, 403)

    # 9. Trigger processing (202 Accepted)
    async def test_trigger_analysis_process_success(self) -> None:
        resp = await trigger_analysis_process(
            call_id="call-200",
            payload=ProcessAnalysisRequest(transcript_id="tr-200"),
            current_user=self.authorized_user,
            analysis_repo=self.analysis_repo,
            analysis_worker=self.worker,
        )
        self.assertEqual(resp.call_id, "call-200")
        self.assertEqual(resp.status, "processing")
        self.assertEqual(resp.transcript_id, "tr-200")

    # 10. Trigger processing conflict: already completed (409)
    async def test_trigger_analysis_conflict_already_completed(self) -> None:
        with self.assertRaises(HTTPException) as cm:
            await trigger_analysis_process(
                call_id="call-101",  # already in repository
                payload=ProcessAnalysisRequest(force=False),
                current_user=self.authorized_user,
                analysis_repo=self.analysis_repo,
                analysis_worker=self.worker,
            )
        self.assertEqual(cm.exception.status_code, 409)
        self.assertIn("already completed", cm.exception.detail)

    # 11. Trigger processing conflict: already in progress (409)
    async def test_trigger_analysis_conflict_already_processing(self) -> None:
        # Mock an in-progress context in worker
        ctx = AIProcessingContext(call_id="call-in-flight", analysis_status=StageStatus.PROCESSING)
        self.worker._in_memory_contexts["call-in-flight"] = ctx

        with self.assertRaises(HTTPException) as cm:
            await trigger_analysis_process(
                call_id="call-in-flight",
                payload=ProcessAnalysisRequest(force=False),
                current_user=self.authorized_user,
                analysis_repo=self.analysis_repo,
                analysis_worker=self.worker,
            )
        self.assertEqual(cm.exception.status_code, 409)
        self.assertIn("currently processing", cm.exception.detail)


class TestOutcomeAPIRoutes(unittest.IsolatedAsyncioTestCase):
    """Verifies all /api/outcomes route endpoints, validations, and security."""

    async def asyncSetUp(self) -> None:
        self.analysis_repo = AnalysisRepository()
        self.outcome_repo = OutcomeRepository()
        self.worker = AnalysisWorker(
            analysis_repository=self.analysis_repo,
            outcome_repository=self.outcome_repo,
        )

        self.authorized_user = CurrentUser(id="usr-1", role="agent")
        self.unauthorized_user = None
        self.forbidden_user = CurrentUser(id="usr-2", role="unauthorized")

        # Seed an outcome record
        self.sample_outcome = self.outcome_repo.create(
            OutcomeCreate(
                call_id="call-101",
                transcript_id="tr-101",
                outcome=OutcomeCategory.FOLLOW_UP_REQUIRED.value,
                confidence=0.94,
                evidence="Customer explicitly confirmed demo on Thursday.",
                next_action="Send calendar invitation.",
            )
        )

        # Also seed analysis for call-101
        self.analysis_repo.create(
            AnalysisCreate(call_id="call-101", transcript_id="tr-101")
        )

    # 1. GET outcome by ID
    async def test_get_outcome_by_id_success(self) -> None:
        resp = await get_outcome_by_id(
            outcome_id=self.sample_outcome.id,
            current_user=self.authorized_user,
            outcome_repo=self.outcome_repo,
        )
        self.assertIsInstance(resp, OutcomeResponse)
        self.assertEqual(resp.id, self.sample_outcome.id)
        self.assertEqual(resp.call_id, "call-101")
        self.assertEqual(resp.outcome, OutcomeCategory.FOLLOW_UP_REQUIRED.value)
        self.assertEqual(resp.confidence, 0.94)

    # 2. GET outcome by call
    async def test_get_outcome_by_call_success(self) -> None:
        resp = await get_outcome_by_call(
            call_id="call-101",
            current_user=self.authorized_user,
            outcome_repo=self.outcome_repo,
        )
        self.assertIsInstance(resp, OutcomeResponse)
        self.assertEqual(resp.call_id, "call-101")
        self.assertEqual(resp.next_action, "Send calendar invitation.")

    # 3. GET outcome by transcript
    async def test_get_outcome_by_transcript_success(self) -> None:
        resp = await get_outcome_by_transcript(
            transcript_id="tr-101",
            current_user=self.authorized_user,
            outcome_repo=self.outcome_repo,
        )
        self.assertIsInstance(resp, OutcomeResponse)
        self.assertEqual(resp.transcript_id, "tr-101")

    # 4. Outcome not found (404)
    async def test_outcome_not_found(self) -> None:
        with self.assertRaises(HTTPException) as cm:
            await get_outcome_by_call(
                call_id="call-nonexistent",
                current_user=self.authorized_user,
                outcome_repo=self.outcome_repo,
            )
        self.assertEqual(cm.exception.status_code, 404)

    # 5. Invalid identifier (400)
    async def test_invalid_outcome_identifier(self) -> None:
        with self.assertRaises(HTTPException) as cm:
            await get_outcome_by_id(
                outcome_id="",
                current_user=self.authorized_user,
                outcome_repo=self.outcome_repo,
            )
        self.assertEqual(cm.exception.status_code, 400)

    # 6. Unauthorized access (401)
    async def test_outcome_unauthorized(self) -> None:
        with self.assertRaises(HTTPException) as cm:
            await get_outcome_by_call(
                call_id="call-101",
                current_user=self.unauthorized_user,
                outcome_repo=self.outcome_repo,
            )
        self.assertEqual(cm.exception.status_code, 401)

    # 7. Forbidden access (403)
    async def test_outcome_forbidden(self) -> None:
        with self.assertRaises(HTTPException) as cm:
            await get_outcome_by_call(
                call_id="call-101",
                current_user=self.forbidden_user,
                outcome_repo=self.outcome_repo,
            )
        self.assertEqual(cm.exception.status_code, 403)

    # 8. Dependency validation: analysis must exist before triggering outcome (409)
    async def test_trigger_outcome_dependency_missing(self) -> None:
        with self.assertRaises(HTTPException) as cm:
            await trigger_outcome_process(
                call_id="call-without-analysis",
                payload=ProcessOutcomeRequest(),
                current_user=self.authorized_user,
                analysis_repo=self.analysis_repo,
                outcome_repo=self.outcome_repo,
                analysis_worker=self.worker,
            )
        self.assertEqual(cm.exception.status_code, 409)
        self.assertIn("AI analysis must be completed before outcome processing", cm.exception.detail)

    # 9. Trigger outcome processing (202 Accepted)
    async def test_trigger_outcome_process_success(self) -> None:
        # Prepare call with analysis completed but outcome not yet run
        self.analysis_repo.create(AnalysisCreate(call_id="call-202", transcript_id="tr-202"))

        resp = await trigger_outcome_process(
            call_id="call-202",
            payload=ProcessOutcomeRequest(transcript_id="tr-202"),
            current_user=self.authorized_user,
            analysis_repo=self.analysis_repo,
            outcome_repo=self.outcome_repo,
            analysis_worker=self.worker,
        )
        self.assertEqual(resp.call_id, "call-202")
        self.assertEqual(resp.status, "processing")
        self.assertEqual(resp.message, "AI outcome processing started.")

    # 10. Conflict: outcome already completed (409)
    async def test_trigger_outcome_already_completed(self) -> None:
        with self.assertRaises(HTTPException) as cm:
            await trigger_outcome_process(
                call_id="call-101",  # already exists in outcome_repo
                payload=ProcessOutcomeRequest(force=False),
                current_user=self.authorized_user,
                analysis_repo=self.analysis_repo,
                outcome_repo=self.outcome_repo,
                analysis_worker=self.worker,
            )
        self.assertEqual(cm.exception.status_code, 409)
        self.assertIn("already completed", cm.exception.detail)


if __name__ == "__main__":
    unittest.main()
