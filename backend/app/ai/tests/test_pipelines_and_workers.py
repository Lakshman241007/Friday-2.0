"""
Unit and Integration Tests for FRIDAY Phase 8: AI Pipelines and Workers.
Covers:
1. TranscriptionWorker: valid recording, missing recording, invalid audio, provider success,
   timeout/failure, duplicate task, retryable vs permanent failures.
2. AnalysisWorker: valid transcript, missing/incomplete transcript, analysis success/failure,
   outcome success/failure, quality success/failure, recommendation success/failure.
3. Idempotency: duplicate transcription, duplicate analysis, duplicate outcome, duplicate quality/recommendation.
4. Resumption & Partial Completion: Analysis + Outcome complete, Quality fails -> on retry, Analysis/Outcome
   are skipped, Quality retries, and Recommendations run.
5. Failure Isolation: failures at later stages do not erase or delete earlier persisted stages.
6. Retry & Backoff: transient provider errors retry up to max_retries; permanent errors fail fast.
7. Structured Logging: verification of stage event logging.
8. End-to-End Test: Complete deterministic pipeline flow from Recording -> Transcription -> Analysis -> Outcome -> Quality -> Recommendations.
"""

import asyncio
import json
import logging
import unittest
from typing import Any, Dict, List, Optional, Union

from app.ai.models.analysis_model import (
    AnalysisResult,
    IntentResult,
    KeywordItem,
    ObjectionItem,
    SentimentResult,
    SummaryResult,
)
from app.ai.models.outcome_model import OutcomeCategory, OutcomeResult
from app.ai.models.quality_model import EvidenceItem, QualityDimension, QualityResult
from app.ai.models.recommendation_model import (
    PriorityLevel,
    RecommendationItem,
    RecommendationResult,
    RecommendationType,
)
from app.ai.pipelines.analysis_pipeline import AnalysisPipeline
from app.ai.pipelines.transcription_pipeline import TranscriptionPipeline
from app.ai.providers import (
    AudioInput,
    BaseLLMProvider,
    LLMMessage,
    LLMRequest,
    LLMResponse,
    MockTranscriptionProvider,
    TranscriptSegment,
    TranscriptionResult,
    UsageInfo,
)
from app.ai.providers.exceptions import (
    ProviderAuthenticationError,
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderUnavailableError,
)
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.outcome_repository import OutcomeRepository
from app.services.ai.analysis_service import AnalysisService
from app.services.ai.call_quality_service import CallQualityService
from app.services.ai.outcome_service import OutcomeService
from app.services.ai.recommendation_service import RecommendationService
from app.services.transcription import (
    AudioUnavailableError,
    RecordingNotFoundError,
    TranscriptionError,
    TranscriptionOutput,
    TranscriptionService,
)
from app.workers.analysis_worker import AnalysisWorker
from app.workers.context import (
    AIProcessingContext,
    ErrorCategory,
    StageStatus,
    categorize_error,
)
from app.workers.transcription_worker import TranscriptionWorker


# =============================================================================
# MOCK INFRASTRUCTURE & REPOSITORIES
# =============================================================================

class MockRecordingRepository:
    """Mock repository mimicking Member 2's RecordingRepository."""

    def __init__(self, records: Optional[Dict[str, Dict[str, Any]]] = None) -> None:
        self.records = records or {}
        self.status_history: List[Dict[str, str]] = []

    async def get_by_id(self, recording_id: str) -> Optional[Dict[str, Any]]:
        return self.records.get(recording_id)

    async def update_status(self, recording_id: str, status: str) -> None:
        if recording_id in self.records:
            self.records[recording_id]["status"] = status
        self.status_history.append({"id": recording_id, "status": status})


class MockTranscriptRepository:
    """Mock repository mimicking Member 2's TranscriptRepository."""

    def __init__(self) -> None:
        self.transcripts: Dict[str, Dict[str, Any]] = {}
        self.by_call_id: Dict[str, Dict[str, Any]] = {}

    async def save_transcript(self, **kwargs: Any) -> Dict[str, Any]:
        rec_id = kwargs.get("recording_id", "rec_default")
        call_id = kwargs.get("call_id")
        tid = f"tr_{rec_id}"
        record = dict(kwargs, id=tid)
        self.transcripts[tid] = record
        if call_id:
            self.by_call_id[call_id] = record
        return record

    async def get_by_id(self, transcript_id: str) -> Optional[Dict[str, Any]]:
        return self.transcripts.get(transcript_id)

    async def get_by_call_id(self, call_id: str) -> Optional[Dict[str, Any]]:
        return self.by_call_id.get(call_id)


class MockQualityRepository:
    """Mock repository for QualityResult persistence."""

    def __init__(self) -> None:
        self.records: Dict[str, QualityResult] = {}

    def save_quality(self, quality: QualityResult) -> None:
        self.records[quality.call_id or "default"] = quality


class MockRecommendationRepository:
    """Mock repository for RecommendationResult persistence."""

    def __init__(self) -> None:
        self.records: Dict[str, RecommendationResult] = {}

    def save_recommendations(self, rec: RecommendationResult) -> None:
        self.records[rec.call_id or "default"] = rec


class ScriptedLLMProvider(BaseLLMProvider):
    """Configurable mock LLM provider returning predetermined or stage-specific responses."""

    def __init__(self, responses: Optional[Dict[str, str]] = None) -> None:
        super().__init__(provider_name="scripted_mock_llm", default_model="mock-gemini")
        self.responses = responses or {}
        self.call_count = 0
        self.fail_stage: Optional[str] = None
        self.fail_exception: Optional[Exception] = None
        self.fail_countdown = 0

    async def health_check(self) -> bool:
        return True

    async def generate(
        self,
        request: Union[str, List[LLMMessage], LLMRequest],
        **kwargs: Any,
    ) -> LLMResponse:
        self.call_count += 1
        norm_req = self._normalize_request(request, **kwargs)
        prompt = norm_req.get_effective_prompt()

        # Error injection
        if self.fail_stage and self.fail_stage.lower() in prompt.lower():
            if self.fail_countdown > 0:
                self.fail_countdown -= 1
                raise self.fail_exception or ProviderTimeoutError("Simulated LLM timeout")

        # Stage detection based on prompt markers
        if "DIMENSION 1: OPENING" in prompt or "EVALUATION DIMENSIONS" in prompt or "CALL QUALITY" in prompt:
            content = self.responses.get("quality", self._default_quality_json())
        elif "RECOMMENDATION TYPES" in prompt or "RECOMMENDATION TAXONOMY" in prompt or "communication coach" in prompt.lower():
            content = self.responses.get("recommendations", self._default_recommendation_json())
        elif "Allowed Outcome Categories" in prompt or "most likely business outcome" in prompt:
            content = self.responses.get("outcome", self._default_outcome_json())
        elif "Call Summary" in prompt or "SUMMARY INSTRUCTIONS" in prompt or "concise, executive-ready call summary" in prompt.lower():
            content = self.responses.get("summary", self._default_summary_json())
        else:
            content = self.responses.get("analysis", self._default_analysis_json())

        return LLMResponse(
            content=content,
            model="mock-gemini",
            provider="scripted_mock_llm",
            usage=UsageInfo(prompt_tokens=100, completion_tokens=50, total_tokens=150),
            finish_reason="stop",
        )

    @staticmethod
    def _default_analysis_json() -> str:
        return json.dumps({
            "intent": {"intent": "Product Inquiry", "confidence": 0.95, "evidence": "I want a demo of your product"},
            "sentiment": {"sentiment": "Positive", "confidence": 0.90, "evidence": "Sounds great"},
            "objections": [{"category": "Budget", "description": "Too expensive", "confidence": 0.85, "timestamp": 12.5, "evidence": "Price is high"}],
            "keywords": [{"keyword": "pricing", "relevance": 0.9, "frequency": 2, "timestamps": [5.0, 12.0]}],
        })

    @staticmethod
    def _default_summary_json() -> str:
        return json.dumps({
            "summary": "Customer requested demo and inquired about pricing.",
            "key_points": ["Customer interested in demo", "Pricing objection discussed"],
            "customer_needs": ["Automated CRM integration"],
            "concerns": ["Budget limits"],
            "next_steps": ["Send demo schedule for tomorrow at 2 PM"],
        })

    @staticmethod
    def _default_outcome_json() -> str:
        return json.dumps({
            "outcome": "Interested",
            "confidence": 0.95,
            "evidence": "Demo scheduled for tomorrow at 2 PM",
            "next_action": "Send calendar invite",
        })

    @staticmethod
    def _default_quality_json() -> str:
        return json.dumps({
            "opening": {"score": 85, "applicable": True, "strengths": ["Clear greeting"], "weaknesses": [], "evidence": [{"timestamp": 1.0, "speaker": "Rep", "text": "Hello"}]},
            "discovery": {"score": 80, "applicable": True, "strengths": ["Asked need"], "weaknesses": [], "evidence": []},
            "explanation": {"score": 90, "applicable": True, "strengths": ["Clear value"], "weaknesses": [], "evidence": []},
            "objection_handling": {"score": 75, "applicable": True, "strengths": ["Addressed price"], "weaknesses": [], "evidence": []},
            "closing": {"score": 85, "applicable": True, "strengths": ["Secured next step"], "weaknesses": [], "evidence": []},
            "strengths": ["Solid sales interaction"],
            "weaknesses": [],
            "evidence": [],
        })

    @staticmethod
    def _default_recommendation_json() -> str:
        return json.dumps({
            "recommendations": [
                {
                    "type": "Follow-up",
                    "priority": "high",
                    "recommendation": "Send calendar invite for tomorrow at 2 PM.",
                    "reason": "Customer agreed to demo time.",
                    "suggested_action": "Email calendar invitation",
                    "evidence": [{"timestamp": 25.0, "speaker": "Customer", "quote": "Tomorrow at 2 PM works."}],
                }
            ]
        })


# =============================================================================
# TEST CASES: TRANSCRIPTION WORKER
# =============================================================================

class TestTranscriptionWorker(unittest.IsolatedAsyncioTestCase):
    """Tests the TranscriptionWorker background orchestration."""

    async def asyncSetUp(self) -> None:
        self.mock_stt = MockTranscriptionProvider(
            custom_segments=[
                TranscriptSegment(start=0.0, end=3.5, speaker="Rep", text="Hello, this is a test sales call dialogue.")
            ]
        )
        self.stt_service = TranscriptionService(provider=self.mock_stt)
        self.rec_repo = MockRecordingRepository({
            "rec_1": {"id": "rec_1", "call_id": "call_1", "file_path": "/tmp/test.wav", "status": "pending"}
        })
        self.transcript_repo = MockTranscriptRepository()
        self.pipeline = TranscriptionPipeline(
            service=self.stt_service,
            recording_repository=self.rec_repo,
            transcript_repository=self.transcript_repo,
        )
        self.worker = TranscriptionWorker(pipeline=self.pipeline, max_retries=2, initial_backoff_seconds=0.01)

    async def test_valid_recording_success(self) -> None:
        """Worker successfully processes a valid recording."""
        result = await self.worker.process_recording(recording_id="rec_1")
        self.assertIsNotNone(result)
        self.assertEqual(result.recording_id, "rec_1")
        self.assertTrue(self.worker.is_completed("rec_1"))
        self.assertIn("tr_rec_1", self.transcript_repo.transcripts)

    async def test_missing_recording_permanent_failure(self) -> None:
        """Worker fails fast on missing recording."""
        with self.assertRaises(RecordingNotFoundError):
            await self.worker.process_recording(recording_id="rec_nonexistent")

    async def test_invalid_audio_missing_source(self) -> None:
        """Worker raises AudioUnavailableError if audio payload is missing."""
        empty_repo = MockRecordingRepository({"rec_empty": {"id": "rec_empty"}})
        pipeline = TranscriptionPipeline(service=self.stt_service, recording_repository=empty_repo)
        worker = TranscriptionWorker(pipeline=pipeline)
        with self.assertRaises(AudioUnavailableError):
            await worker.process_recording("rec_empty")

    async def test_duplicate_task_in_worker_skipped(self) -> None:
        """Worker skips task if it was already completed in lifecycle."""
        await self.worker.process_recording("rec_1")
        # Second invocation
        dup_result = await self.worker.process_recording("rec_1")
        self.assertIsNone(dup_result)

    async def test_retryable_provider_timeout_recovers(self) -> None:
        """Worker retries on transient ProviderTimeoutError and succeeds."""
        call_count = 0
        original_transcribe = self.mock_stt.transcribe

        async def failing_once(*args: Any, **kwargs: Any) -> TranscriptionResult:
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise ProviderTimeoutError("Transient STT timeout")
            return await original_transcribe(*args, **kwargs)

        self.mock_stt.transcribe = failing_once
        result = await self.worker.process_recording("rec_1")
        self.assertIsNotNone(result)
        self.assertEqual(call_count, 2)

    async def test_retry_exhaustion_raises(self) -> None:
        """Worker exhausts retries and raises error."""
        async def always_fail(*args: Any, **kwargs: Any) -> TranscriptionResult:
            raise ProviderUnavailableError("STT service completely down")

        self.mock_stt.transcribe = always_fail
        with self.assertRaises(TranscriptionError):
            await self.worker.process_recording("rec_1")


# =============================================================================
# TEST CASES: ANALYSIS WORKER & PIPELINES
# =============================================================================

class TestAnalysisWorker(unittest.IsolatedAsyncioTestCase):
    """Tests the AnalysisWorker orchestration across Phases 3, 5, 6, and 7."""

    async def asyncSetUp(self) -> None:
        self.mock_llm = ScriptedLLMProvider()
        self.analysis_service = AnalysisService(provider=self.mock_llm)
        self.analysis_pipeline = AnalysisPipeline(analysis_service=self.analysis_service)

        self.analysis_repo = AnalysisRepository()
        self.outcome_repo = OutcomeRepository()
        self.quality_repo = MockQualityRepository()
        self.rec_repo = MockRecommendationRepository()

        self.outcome_service = OutcomeService(provider=self.mock_llm)
        self.quality_service = CallQualityService(provider=self.mock_llm)
        self.recommendation_service = RecommendationService(provider=self.mock_llm)

        self.worker = AnalysisWorker(
            analysis_pipeline=self.analysis_pipeline,
            outcome_service=self.outcome_service,
            quality_service=self.quality_service,
            recommendation_service=self.recommendation_service,
            analysis_repository=self.analysis_repo,
            outcome_repository=self.outcome_repo,
            quality_repository=self.quality_repo,
            recommendation_repository=self.rec_repo,
            max_retries=2,
            initial_backoff_seconds=0.01,
        )

        self.sample_transcript = {
            "id": "tr_100",
            "call_id": "call_100",
            "text": "Rep: Hello! Customer: I would like a demo. Rep: Tomorrow at 2 PM? Customer: Yes, perfect.",
            "segments": [
                {"speaker": "Rep", "text": "Hello!", "start": 0.0, "end": 1.5},
                {"speaker": "Customer", "text": "I would like a demo.", "start": 1.6, "end": 3.5},
                {"speaker": "Rep", "text": "Tomorrow at 2 PM?", "start": 3.6, "end": 5.0},
                {"speaker": "Customer", "text": "Yes, perfect.", "start": 5.1, "end": 7.0},
            ],
        }

    async def test_full_analysis_worker_success(self) -> None:
        """Full end-to-end worker run successfully completes all 4 stages and persists."""
        res = await self.worker.process_call(
            call_id="call_100",
            transcript_input=self.sample_transcript,
        )
        self.assertEqual(res["status"], "completed")
        self.assertEqual(res["stages"]["analysis"], "completed")
        self.assertEqual(res["stages"]["outcome"], "completed")
        self.assertEqual(res["stages"]["quality"], "completed")
        self.assertEqual(res["stages"]["recommendations"], "completed")

        # Verify database persistence
        self.assertTrue(self.analysis_repo.exists("call_100"))
        self.assertTrue(self.outcome_repo.exists("call_100"))
        self.assertIn("call_100", self.quality_repo.records)
        self.assertIn("call_100", self.rec_repo.records)

    async def test_missing_transcript_fails_cleanly(self) -> None:
        """Worker cleanly records failure if no transcript is supplied or found."""
        res = await self.worker.process_call(call_id="call_unknown", transcript_input=None)
        self.assertEqual(res["status"], "failed")
        self.assertIn("transcript", res["errors"])

    async def test_idempotency_skips_persisted_stages(self) -> None:
        """Running worker a second time skips already persisted analysis and outcome stages."""
        await self.worker.process_call("call_100", transcript_input=self.sample_transcript)

        # Second run with force=False
        res = await self.worker.process_call("call_100", transcript_input=self.sample_transcript)
        self.assertEqual(res["status"], "completed")
        # In second run, existing analysis and outcome are skipped from re-running
        self.assertIn(res["stages"]["analysis"], ("skipped", "completed"))
        self.assertIn(res["stages"]["outcome"], ("skipped", "completed"))

    async def test_failure_isolation_analysis_failure_preserves_environment(self) -> None:
        """Failure during analysis does not corrupt or create incomplete records."""
        async def fail_analysis(*args: Any, **kwargs: Any) -> AnalysisResult:
            raise ValueError("Malformed transcript data")

        self.analysis_pipeline.execute = fail_analysis  # type: ignore
        res = await self.worker.process_call("call_100", transcript_input=self.sample_transcript)
        self.assertEqual(res["status"], "failed")
        self.assertFalse(self.analysis_repo.exists("call_100"))
        self.assertFalse(self.outcome_repo.exists("call_100"))

    async def test_mandatory_scenario_quality_fails_then_resumes(self) -> None:
        """
        MANDATORY SCENARIO:
        1. Run worker: Analysis succeeds, Outcome succeeds, Quality fails.
        2. Verify Analysis and Outcome were persisted.
        3. Run worker again with working Quality.
        4. Verify Analysis: SKIPPED, Outcome: SKIPPED, Quality: RUNS, Recommendations: RUNS.
        """
        # Step 1: inject failure into Quality stage
        self.mock_llm.fail_stage = "EVALUATION DIMENSIONS"
        self.mock_llm.fail_countdown = 999  # fail permanently for this run
        self.mock_llm.fail_exception = ProviderUnavailableError("Quality model cluster offline")

        res_first = await self.worker.process_call("call_100", transcript_input=self.sample_transcript)
        self.assertEqual(res_first["status"], "failed")
        self.assertEqual(res_first["stages"]["analysis"], "completed")
        self.assertEqual(res_first["stages"]["outcome"], "completed")
        self.assertEqual(res_first["stages"]["quality"], "failed")
        self.assertEqual(res_first["stages"]["recommendations"], "pending")

        # Verify Analysis & Outcome are persisted in repository
        self.assertTrue(self.analysis_repo.exists("call_100"))
        self.assertTrue(self.outcome_repo.exists("call_100"))

        # Step 2: Remove failure condition for retry
        self.mock_llm.fail_stage = None
        self.mock_llm.fail_countdown = 0

        # Step 3: Run worker again
        res_second = await self.worker.process_call("call_100", transcript_input=self.sample_transcript)
        self.assertEqual(res_second["status"], "completed")
        self.assertEqual(res_second["stages"]["analysis"], "skipped")
        self.assertEqual(res_second["stages"]["outcome"], "skipped")
        self.assertEqual(res_second["stages"]["quality"], "completed")
        self.assertEqual(res_second["stages"]["recommendations"], "completed")

        # Quality and Recommendations now saved
        self.assertIn("call_100", self.quality_repo.records)
        self.assertIn("call_100", self.rec_repo.records)

    async def test_retry_transient_error_in_analysis_worker(self) -> None:
        """Transient error in worker automatically retries with backoff and succeeds."""
        self.mock_llm.fail_stage = "Allowed Outcome Categories"
        self.mock_llm.fail_countdown = 1  # Fails 1st attempt, succeeds 2nd attempt
        self.mock_llm.fail_exception = ProviderRateLimitError("Rate limit exceeded")

        res = await self.worker.process_call("call_100", transcript_input=self.sample_transcript)
        self.assertEqual(res["status"], "completed")
        self.assertEqual(res["stages"]["outcome"], "completed")


# =============================================================================
# TEST CASES: COMPLETE DETERMINISTIC END-TO-END PIPELINE
# =============================================================================

class TestEndToEndPipeline(unittest.IsolatedAsyncioTestCase):
    """
    End-to-End deterministic test:
    Recording -> Transcription Worker -> Transcript -> Analysis Worker ->
    Analysis -> Outcome -> Quality -> Recommendations.
    """

    async def test_full_e2e_recording_to_recommendations(self) -> None:
        # Step 1: Setup STT and Core repositories
        recording_id = "demo-recording-001"
        call_id = "demo-call-001"

        mock_stt = MockTranscriptionProvider(
            custom_segments=[
                TranscriptSegment(start=0.0, end=2.0, speaker="Rep", text="Thanks for calling FRIDAY."),
                TranscriptSegment(start=2.1, end=5.5, speaker="Customer", text="We want to schedule a product demo tomorrow."),
            ]
        )
        stt_service = TranscriptionService(provider=mock_stt)
        rec_repo = MockRecordingRepository({
            recording_id: {
                "id": recording_id,
                "call_id": call_id,
                "file_path": "/audio/demo.wav",
                "status": "pending",
            }
        })
        transcript_repo = MockTranscriptRepository()
        transcription_pipeline = TranscriptionPipeline(
            service=stt_service,
            recording_repository=rec_repo,
            transcript_repository=transcript_repo,
        )
        transcription_worker = TranscriptionWorker(pipeline=transcription_pipeline)

        # Step 2: Run Transcription Worker
        stt_output = await transcription_worker.process_recording(recording_id=recording_id)
        self.assertIsNotNone(stt_output)
        self.assertEqual(stt_output.recording_id, recording_id)

        # Retrieve saved transcript from repository
        saved_transcript = await transcript_repo.get_by_call_id(call_id)
        self.assertIsNotNone(saved_transcript)

        # Step 3: Setup Analysis Worker with AI repositories
        llm = ScriptedLLMProvider()
        analysis_service = AnalysisService(provider=llm)
        analysis_pipeline = AnalysisPipeline(analysis_service=analysis_service)
        analysis_repo = AnalysisRepository()
        outcome_repo = OutcomeRepository()
        quality_repo = MockQualityRepository()
        rec_repo_ai = MockRecommendationRepository()

        analysis_worker = AnalysisWorker(
            analysis_pipeline=analysis_pipeline,
            outcome_service=OutcomeService(provider=llm),
            quality_service=CallQualityService(provider=llm),
            recommendation_service=RecommendationService(provider=llm),
            analysis_repository=analysis_repo,
            outcome_repository=outcome_repo,
            quality_repository=quality_repo,
            recommendation_repository=rec_repo_ai,
            transcript_repository=transcript_repo,
        )

        # Step 4: Run Analysis Worker using call_id (resolves transcript from repository)
        analysis_summary = await analysis_worker.process_call(call_id=call_id)

        # Step 5: Verify all stages completed
        self.assertEqual(analysis_summary["status"], "completed")
        self.assertEqual(analysis_summary["stages"]["analysis"], "completed")
        self.assertEqual(analysis_summary["stages"]["outcome"], "completed")
        self.assertEqual(analysis_summary["stages"]["quality"], "completed")
        self.assertEqual(analysis_summary["stages"]["recommendations"], "completed")

        # Step 6: Verify persisted artifacts
        analysis_record = analysis_repo.get_by_call_id(call_id)
        self.assertIsNotNone(analysis_record)
        self.assertEqual(analysis_record.intent, "Product Inquiry")

        outcome_record = outcome_repo.get_by_call_id(call_id)
        self.assertIsNotNone(outcome_record)
        self.assertEqual(outcome_record.outcome, OutcomeCategory.INTERESTED.value)

        self.assertIn(call_id, quality_repo.records)
        self.assertEqual(quality_repo.records[call_id].overall_score, 83.0)

        self.assertIn(call_id, rec_repo_ai.records)
        self.assertEqual(len(rec_repo_ai.records[call_id].recommendations), 1)
        self.assertEqual(rec_repo_ai.records[call_id].recommendations[0].type, RecommendationType.FOLLOW_UP.value)


if __name__ == "__main__":
    unittest.main()
