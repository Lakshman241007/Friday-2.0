"""
FRIDAY AI Phase 10 Dedicated Outcomes Test Suite.
Tests:
- GET /api/outcomes/call/{call_id}
- GET /api/outcomes/transcript/{transcript_id}
- GET /api/outcomes/{outcome_id}
- POST /api/outcomes/process/{call_id}
- Schema validation & enum category mapping
- Grounded evidence checks
- Idempotency & duplicate execution handling
- Authorization & ownership controls
- Pre-requisite validation (Analysis must complete before Outcome)
- Demo data file loading and schema conformity
"""

import asyncio
import json
import os
import unittest
from typing import Any, Dict, Optional

from app.api.routes.common import HTTPException
from app.api.routes.analysis import (
    CurrentUser,
    ProcessAnalysisRequest,
    get_analysis_repository,
)
from app.api.routes.outcomes import (
    ProcessOutcomeRequest,
    ProcessOutcomeResponse,
    get_outcome_by_call,
    get_outcome_by_id,
    get_outcome_by_transcript,
    trigger_outcome_process,
    validate_identifier,
)
from app.models.outcome import Outcome, OutcomeCategory
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.outcome_repository import OutcomeRepository
from app.schemas.analysis import AnalysisCreate
from app.schemas.outcome import OutcomeCreate, OutcomeResponse
from app.workers.analysis_worker import AnalysisWorker
from app.workers.context import AIProcessingContext, StageStatus


class TestOutcomesAPISuite(unittest.IsolatedAsyncioTestCase):
    """Verifies all outcome endpoints, validations, authorizations, and idempotency."""

    async def asyncSetUp(self) -> None:
        self.analysis_repo = AnalysisRepository()
        self.outcome_repo = OutcomeRepository()
        self.worker = AnalysisWorker(
            analysis_repository=self.analysis_repo,
            outcome_repository=self.outcome_repo,
        )

        self.user = CurrentUser(id="agent-01", role="agent")
        self.unauthenticated = None
        self.forbidden_user = CurrentUser(id="agent-02", role="unauthorized")

        # Create prerequisite analysis
        self.analysis_repo.create(
            AnalysisCreate(
                call_id="call-401",
                transcript_id="tr-401",
                intent="Pricing Inquiry",
                summary="Discussed enterprise licenses.",
            )
        )

        # Create outcome record
        self.outcome_record = self.outcome_repo.create(
            OutcomeCreate(
                call_id="call-401",
                transcript_id="tr-401",
                outcome=OutcomeCategory.QUALIFIED.value,
                confidence=0.92,
                evidence="Customer confirmed budget and decision authority.",
                next_action="Send calendar invite for solution demo.",
                model="mock-llm-v1",
                provider="mock-provider",
            )
        )

    # 1. Successful Retrieval by Call ID
    async def test_get_outcome_by_call_id_success(self) -> None:
        res = await get_outcome_by_call(
            call_id="call-401",
            current_user=self.user,
            outcome_repo=self.outcome_repo,
        )
        self.assertIsInstance(res, OutcomeResponse)
        self.assertEqual(res.call_id, "call-401")
        self.assertEqual(res.outcome, OutcomeCategory.QUALIFIED.value)
        self.assertEqual(res.confidence, 0.92)
        self.assertEqual(res.evidence, "Customer confirmed budget and decision authority.")
        self.assertEqual(res.next_action, "Send calendar invite for solution demo.")

    # 2. Successful Retrieval by Transcript ID
    async def test_get_outcome_by_transcript_id_success(self) -> None:
        res = await get_outcome_by_transcript(
            transcript_id="tr-401",
            current_user=self.user,
            outcome_repo=self.outcome_repo,
        )
        self.assertIsInstance(res, OutcomeResponse)
        self.assertEqual(res.transcript_id, "tr-401")
        self.assertEqual(res.id, self.outcome_record.id)

    # 3. Successful Retrieval by Outcome ID
    async def test_get_outcome_by_id_success(self) -> None:
        res = await get_outcome_by_id(
            outcome_id=self.outcome_record.id,
            current_user=self.user,
            outcome_repo=self.outcome_repo,
        )
        self.assertIsInstance(res, OutcomeResponse)
        self.assertEqual(res.id, self.outcome_record.id)
        self.assertEqual(res.call_id, "call-401")

    # 4. 404 on Missing Record
    async def test_get_outcome_not_found(self) -> None:
        with self.assertRaises(HTTPException) as ctx:
            await get_outcome_by_call(
                call_id="call-missing-999",
                current_user=self.user,
                outcome_repo=self.outcome_repo,
            )
        self.assertEqual(ctx.exception.status_code, 404)

    # 5. 400 on Invalid Identifier
    async def test_invalid_identifier_rejected(self) -> None:
        with self.assertRaises(HTTPException) as ctx:
            await get_outcome_by_call(
                call_id="   ",
                current_user=self.user,
                outcome_repo=self.outcome_repo,
            )
        self.assertEqual(ctx.exception.status_code, 400)

        with self.assertRaises(HTTPException) as ctx2:
            await get_outcome_by_id(
                outcome_id="bad/id/path",
                current_user=self.user,
                outcome_repo=self.outcome_repo,
            )
        self.assertEqual(ctx2.exception.status_code, 400)

    # 6. 401 on Missing Authentication
    async def test_unauthenticated_rejected(self) -> None:
        with self.assertRaises(HTTPException) as ctx:
            await get_outcome_by_call(
                call_id="call-401",
                current_user=self.unauthenticated,
                outcome_repo=self.outcome_repo,
            )
        self.assertEqual(ctx.exception.status_code, 401)

    # 7. 403 on Forbidden Access
    async def test_forbidden_role_rejected(self) -> None:
        with self.assertRaises(HTTPException) as ctx:
            await get_outcome_by_call(
                call_id="call-401",
                current_user=self.forbidden_user,
                outcome_repo=self.outcome_repo,
            )
        self.assertEqual(ctx.exception.status_code, 403)

    # 8. 403 on Specific Call Access Restriction
    async def test_restricted_call_ownership_rejected(self) -> None:
        agent_with_restricted_calls = CurrentUser(id="agent-03", role="agent")
        agent_with_restricted_calls.accessible_call_ids = {"call-999"}

        with self.assertRaises(HTTPException) as ctx:
            await get_outcome_by_call(
                call_id="call-401",
                current_user=agent_with_restricted_calls,
                outcome_repo=self.outcome_repo,
            )
        self.assertEqual(ctx.exception.status_code, 403)

    # 9. 409 Conflict when Pre-requisite Analysis is Missing
    async def test_trigger_outcome_requires_analysis_completed(self) -> None:
        with self.assertRaises(HTTPException) as ctx:
            await trigger_outcome_process(
                call_id="call-no-prior-analysis",
                payload=ProcessOutcomeRequest(),
                current_user=self.user,
                analysis_repo=self.analysis_repo,
                outcome_repo=self.outcome_repo,
                analysis_worker=self.worker,
            )
        self.assertEqual(ctx.exception.status_code, 409)
        self.assertIn("AI analysis must be completed before outcome processing", ctx.exception.detail)

    # 10. 202 Accepted on Valid Outcome Processing Trigger
    async def test_trigger_outcome_process_success(self) -> None:
        # Create analysis first
        self.analysis_repo.create(AnalysisCreate(call_id="call-402", transcript_id="tr-402"))

        res = await trigger_outcome_process(
            call_id="call-402",
            payload=ProcessOutcomeRequest(transcript_id="tr-402"),
            current_user=self.user,
            analysis_repo=self.analysis_repo,
            outcome_repo=self.outcome_repo,
            analysis_worker=self.worker,
        )
        self.assertIsInstance(res, ProcessOutcomeResponse)
        self.assertEqual(res.call_id, "call-402")
        self.assertEqual(res.status, "processing")
        self.assertEqual(res.transcript_id, "tr-402")

    # 11. 409 Conflict when Outcome Already Completed
    async def test_trigger_outcome_already_completed_conflict(self) -> None:
        with self.assertRaises(HTTPException) as ctx:
            await trigger_outcome_process(
                call_id="call-401",  # already exists in outcome_repo
                payload=ProcessOutcomeRequest(force=False),
                current_user=self.user,
                analysis_repo=self.analysis_repo,
                outcome_repo=self.outcome_repo,
                analysis_worker=self.worker,
            )
        self.assertEqual(ctx.exception.status_code, 409)
        self.assertIn("already completed", ctx.exception.detail)

    # 12. 409 Conflict when Outcome Currently In Flight
    async def test_trigger_outcome_concurrent_conflict(self) -> None:
        # Pre-seed analysis record
        self.analysis_repo.create(AnalysisCreate(call_id="call-in-flight", transcript_id="tr-inf"))
        # Set context in worker
        ctx = AIProcessingContext(
            call_id="call-in-flight",
            analysis_status=StageStatus.COMPLETED,
            outcome_status=StageStatus.PROCESSING,
        )
        self.worker._in_memory_contexts["call-in-flight"] = ctx

        with self.assertRaises(HTTPException) as err_ctx:
            await trigger_outcome_process(
                call_id="call-in-flight",
                payload=ProcessOutcomeRequest(force=False),
                current_user=self.user,
                analysis_repo=self.analysis_repo,
                outcome_repo=self.outcome_repo,
                analysis_worker=self.worker,
            )
        self.assertEqual(err_ctx.exception.status_code, 409)
        self.assertIn("currently processing", err_ctx.exception.detail)

    # 13. Demo Data Schema & File Integrity Verification
    def test_demo_outcomes_conformity(self) -> None:
        demo_dir = "data/demo/outcomes"
        self.assertTrue(os.path.isdir(demo_dir), f"{demo_dir} directory must exist.")
        demo_files = os.listdir(demo_dir)
        self.assertGreaterEqual(len(demo_files), 4, "Must contain at least 4 demo outcome fixtures.")

        for fname in demo_files:
            if not fname.endswith(".json"):
                continue
            path = os.path.join(demo_dir, fname)
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Validate fields
            self.assertIn("call_id", data)
            self.assertIn("transcript_id", data)
            self.assertIn("outcome", data)
            self.assertIn("confidence", data)
            self.assertIn("evidence", data)
            self.assertIn("next_action", data)

            # Verify that outcome enum matches
            matched = OutcomeCategory.match(data["outcome"])
            self.assertNotEqual(matched, OutcomeCategory.OTHER, f"Outcome {data['outcome']} should be a standard category")

            # Validate schema creation capability
            schema = OutcomeCreate(**data)
            self.assertEqual(schema.call_id, data["call_id"])
            self.assertGreater(schema.confidence, 0.0)
            self.assertLessEqual(schema.confidence, 1.0)


if __name__ == "__main__":
    unittest.main()
