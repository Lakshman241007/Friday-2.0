"""
FRIDAY AI Analysis Worker (Phase 8).
Coordinates end-to-end processing across:
1. Transcript lookup / validation
2. Phase 3: AnalysisPipeline -> AnalysisRepository (AIAnalysis)
3. Phase 5: OutcomeService -> OutcomeRepository (Outcome)
4. Phase 6: CallQualityService -> QualityResult
5. Phase 7: RecommendationService -> RecommendationResult
6. Idempotency & Resumption of partially completed runs
7. Non-destructive failure isolation (errors in later stages do not erase previous stages)
8. Retryable vs Permanent error handling with bounded exponential backoff
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Callable, Dict, Optional, Set, Union

from app.ai.models.analysis_model import AnalysisResult
from app.ai.models.outcome_model import OutcomeResult
from app.ai.models.quality_model import QualityResult
from app.ai.models.recommendation_model import RecommendationResult
from app.ai.pipelines.analysis_pipeline import AnalysisPipeline
from app.ai.providers.exceptions import AIProviderError, ProviderUnavailableError
from app.repositories.analysis_repository import AnalysisRepository, DuplicateAnalysisError
from app.repositories.outcome_repository import DuplicateOutcomeError, OutcomeRepository
from app.schemas.mapping import (
    analysis_result_to_create_schema,
    outcome_result_to_create_schema,
)
from app.services.ai.call_quality_service import CallQualityService
from app.services.ai.outcome_service import OutcomeService
from app.services.ai.recommendation_service import RecommendationService
from app.workers.context import (
    AIProcessingContext,
    ErrorCategory,
    StageStatus,
    categorize_error,
)

logger = logging.getLogger("friday.workers.analysis")


class AnalysisWorker:
    """
    Background worker orchestrating the full multi-phase AI analysis pipeline for a call.
    Maintains strict separation between orchestration, AI business logic, and database persistence.
    """

    def __init__(
        self,
        analysis_pipeline: Optional[AnalysisPipeline] = None,
        outcome_service: Optional[OutcomeService] = None,
        quality_service: Optional[CallQualityService] = None,
        recommendation_service: Optional[RecommendationService] = None,
        analysis_repository: Optional[AnalysisRepository] = None,
        outcome_repository: Optional[OutcomeRepository] = None,
        quality_repository: Optional[Any] = None,
        recommendation_repository: Optional[Any] = None,
        transcript_repository: Optional[Any] = None,
        call_repository: Optional[Any] = None,
        max_retries: int = 3,
        initial_backoff_seconds: float = 0.05,
    ) -> None:
        self.analysis_pipeline = analysis_pipeline or AnalysisPipeline()
        self.outcome_service = outcome_service or OutcomeService()
        self.quality_service = quality_service or CallQualityService()
        self.recommendation_service = recommendation_service or RecommendationService()

        self.analysis_repository = analysis_repository
        self.outcome_repository = outcome_repository
        self.quality_repository = quality_repository
        self.recommendation_repository = recommendation_repository
        self.transcript_repository = transcript_repository
        self.call_repository = call_repository

        self.max_retries = max_retries
        self.initial_backoff = initial_backoff_seconds

        self._active_calls: Set[str] = set()
        self._completed_calls: Set[str] = set()
        self._in_memory_contexts: Dict[str, AIProcessingContext] = {}

    def get_context(self, call_id: str) -> Optional[AIProcessingContext]:
        """Retrieves in-memory processing context for a call if available."""
        return self._in_memory_contexts.get(call_id)

    async def _resolve_transcript(
        self,
        call_id: Optional[str] = None,
        transcript_id: Optional[str] = None,
        transcript_input: Optional[Any] = None,
    ) -> Any:
        """
        Locates the completed transcript from direct payload or repository.
        """
        if transcript_input is not None:
            return transcript_input

        if self.transcript_repository is not None:
            # Query by transcript_id first
            if transcript_id:
                if hasattr(self.transcript_repository, "get_by_id"):
                    t = await self._await_if_async(self.transcript_repository.get_by_id(transcript_id))
                    if t:
                        return t
                elif hasattr(self.transcript_repository, "get"):
                    t = await self._await_if_async(self.transcript_repository.get(transcript_id))
                    if t:
                        return t

            # Query by call_id
            if call_id:
                if hasattr(self.transcript_repository, "get_by_call_id"):
                    t = await self._await_if_async(self.transcript_repository.get_by_call_id(call_id))
                    if t:
                        return t
                elif hasattr(self.transcript_repository, "find_by_call_id"):
                    t = await self._await_if_async(self.transcript_repository.find_by_call_id(call_id))
                    if t:
                        return t

        return None

    @staticmethod
    async def _await_if_async(value: Any) -> Any:
        if asyncio.iscoroutine(value) or asyncio.isfuture(value):
            return await value
        return value

    async def _execute_with_retry(
        self,
        stage_name: str,
        coro_fn: Callable[[], Any],
        call_id: str,
    ) -> Any:
        """
        Executes an AI stage with bounded exponential backoff for retryable errors.
        Permanent errors fail fast without retry.
        """
        backoff = self.initial_backoff
        for attempt in range(1, self.max_retries + 1):
            try:
                return await coro_fn()
            except Exception as ex:
                err_category = categorize_error(ex)
                logger.warning(
                    "Error during stage '%s' for call '%s' (attempt %d/%d, category=%s): %s",
                    stage_name,
                    call_id,
                    attempt,
                    self.max_retries,
                    err_category.value,
                    str(ex),
                )
                if err_category == ErrorCategory.PERMANENT or attempt == self.max_retries:
                    raise ex

                # Exponential backoff
                await asyncio.sleep(backoff)
                backoff *= 2.0

    async def process_call(
        self,
        call_id: str,
        transcript_input: Optional[Any] = None,
        transcript_id: Optional[str] = None,
        recording_id: Optional[str] = None,
        force: bool = False,
    ) -> Dict[str, Any]:
        """
        Processes a call through all AI stages with idempotency, stage resumption,
        and failure isolation.
        """
        if not call_id:
            raise ValueError("call_id is required for AnalysisWorker.")

        # Idempotency check 1: already running
        if call_id in self._active_calls and not force:
            logger.info("Worker skipped call %s: already active in worker", call_id)
            ctx = self._in_memory_contexts.get(call_id)
            return ctx.to_dict() if ctx else {"call_id": call_id, "status": "active"}

        self._active_calls.add(call_id)
        ctx = self._in_memory_contexts.setdefault(
            call_id,
            AIProcessingContext(
                call_id=call_id,
                recording_id=recording_id,
                transcript_id=transcript_id,
            ),
        )

        try:
            logger.info("analysis_started call_id=%s transcript_id=%s", call_id, transcript_id)

            # Step 1: Resolve and validate transcript
            resolved_transcript = await self._resolve_transcript(
                call_id=call_id,
                transcript_id=transcript_id,
                transcript_input=transcript_input,
            )
            if resolved_transcript is None:
                err_msg = f"No completed transcript available for call_id='{call_id}'."
                logger.error("analysis_failed call_id=%s stage=transcript error=%s", call_id, err_msg)
                ctx.errors["transcript"] = err_msg
                ctx.analysis_status = StageStatus.FAILED
                return ctx.to_dict()

            ctx.transcript_payload = resolved_transcript
            if not ctx.transcript_id:
                ctx.transcript_id = getattr(resolved_transcript, "id", None) or (
                    resolved_transcript.get("id") if isinstance(resolved_transcript, dict) else None
                )

            # =========================================================================
            # STAGE 1: PHASE 3 ANALYSIS
            # =========================================================================
            existing_analysis = None
            if self.analysis_repository and not force:
                existing_analysis = self.analysis_repository.get_by_call_id(call_id)

            if existing_analysis is not None and not force:
                logger.info("analysis_skipped (already completed) call_id=%s", call_id)
                ctx.analysis_status = StageStatus.SKIPPED
                ctx.analysis_result = existing_analysis
            elif ctx.analysis_status == StageStatus.COMPLETED and ctx.analysis_result is not None and not force:
                logger.info("analysis_skipped (in-memory completed) call_id=%s", call_id)
            else:
                ctx.analysis_status = StageStatus.PROCESSING
                try:
                    analysis_res: AnalysisResult = await self._execute_with_retry(
                        "analysis",
                        lambda: self.analysis_pipeline.execute(
                            transcript_input=resolved_transcript,
                            call_id=call_id,
                            transcript_id=ctx.transcript_id,
                        ),
                        call_id=call_id,
                    )
                    ctx.analysis_result = analysis_res

                    # Persist via AnalysisRepository
                    if self.analysis_repository:
                        try:
                            create_schema = analysis_result_to_create_schema(
                                analysis_res,
                                call_id=call_id,
                                transcript_id=ctx.transcript_id,
                            )
                            self.analysis_repository.create(create_schema)
                        except DuplicateAnalysisError:
                            logger.info("Analysis record already exists in repository for call %s", call_id)

                    ctx.analysis_status = StageStatus.COMPLETED
                    logger.info("analysis_completed call_id=%s", call_id)
                except Exception as ex:
                    ctx.analysis_status = StageStatus.FAILED
                    ctx.errors["analysis"] = str(ex)
                    logger.error("analysis_failed call_id=%s stage=analysis error=%s", call_id, str(ex))
                    return ctx.to_dict()

            # =========================================================================
            # STAGE 2: PHASE 5 OUTCOME
            # =========================================================================
            existing_outcome = None
            if self.outcome_repository and not force:
                existing_outcome = self.outcome_repository.get_by_call_id(call_id)

            if existing_outcome is not None and not force:
                logger.info("outcome_skipped (already completed) call_id=%s", call_id)
                ctx.outcome_status = StageStatus.SKIPPED
                ctx.outcome_result = existing_outcome
            elif ctx.outcome_status == StageStatus.COMPLETED and ctx.outcome_result is not None and not force:
                logger.info("outcome_skipped (in-memory completed) call_id=%s", call_id)
            else:
                ctx.outcome_status = StageStatus.PROCESSING
                logger.info("outcome_started call_id=%s", call_id)
                try:
                    outcome_fn = (
                        getattr(self.outcome_service, "determine_outcome", None)
                        or getattr(self.outcome_service, "detect_outcome", None)
                    )
                    outcome_res: OutcomeResult = await self._execute_with_retry(
                        "outcome",
                        lambda: outcome_fn(
                            transcript_input=resolved_transcript,
                            analysis_result=ctx.analysis_result,
                            call_id=call_id,
                            transcript_id=ctx.transcript_id,
                            raise_on_error=True,
                        ) if "raise_on_error" in getattr(outcome_fn, "__code__", {}).co_varnames else outcome_fn(
                            transcript_input=resolved_transcript,
                            analysis_result=ctx.analysis_result,
                            call_id=call_id,
                            transcript_id=ctx.transcript_id,
                        ),
                        call_id=call_id,
                    )
                    ctx.outcome_result = outcome_res

                    # Persist via OutcomeRepository
                    if self.outcome_repository:
                        try:
                            outcome_schema = outcome_result_to_create_schema(
                                outcome_res,
                                call_id=call_id,
                                transcript_id=ctx.transcript_id,
                            )
                            self.outcome_repository.create(outcome_schema)
                        except DuplicateOutcomeError:
                            logger.info("Outcome record already exists in repository for call %s", call_id)

                    ctx.outcome_status = StageStatus.COMPLETED
                    logger.info("outcome_completed call_id=%s", call_id)
                except Exception as ex:
                    ctx.outcome_status = StageStatus.FAILED
                    ctx.errors["outcome"] = str(ex)
                    logger.error("outcome_failed call_id=%s stage=outcome error=%s", call_id, str(ex))
                    return ctx.to_dict()

            # =========================================================================
            # STAGE 3: PHASE 6 CALL QUALITY
            # =========================================================================
            if ctx.quality_status == StageStatus.COMPLETED and ctx.quality_result is not None and not force:
                logger.info("quality_skipped (already completed) call_id=%s", call_id)
            else:
                ctx.quality_status = StageStatus.PROCESSING
                logger.info("quality_started call_id=%s", call_id)
                try:
                    quality_res: QualityResult = await self._execute_with_retry(
                        "quality",
                        lambda: self.quality_service.evaluate_quality(
                            transcript_input=resolved_transcript,
                            analysis_result=ctx.analysis_result,
                            outcome_result=ctx.outcome_result,
                            call_id=call_id,
                            transcript_id=ctx.transcript_id,
                        ),
                        call_id=call_id,
                    )
                    ctx.quality_result = quality_res

                    # If the service caught an AIProviderError and returned an error marker without overall score
                    if (
                        quality_res.overall_score is None
                        and quality_res.weaknesses
                        and any("provider error" in w.lower() or "cluster offline" in w.lower() for w in quality_res.weaknesses)
                    ):
                        raise ProviderUnavailableError("; ".join(quality_res.weaknesses))

                    # Optional persistence if quality_repository provided
                    if self.quality_repository:
                        if hasattr(self.quality_repository, "save_quality"):
                            self.quality_repository.save_quality(quality_res)
                        elif hasattr(self.quality_repository, "create"):
                            self.quality_repository.create(quality_res)

                    ctx.quality_status = StageStatus.COMPLETED
                    logger.info("quality_completed call_id=%s score=%s", call_id, quality_res.overall_score)
                except Exception as ex:
                    ctx.quality_status = StageStatus.FAILED
                    ctx.errors["quality"] = str(ex)
                    logger.error("quality_failed call_id=%s stage=quality error=%s", call_id, str(ex))
                    return ctx.to_dict()

            # =========================================================================
            # STAGE 4: PHASE 7 RECOMMENDATIONS
            # =========================================================================
            if ctx.recommendation_status == StageStatus.COMPLETED and ctx.recommendation_result is not None and not force:
                logger.info("recommendations_skipped (already completed) call_id=%s", call_id)
            else:
                ctx.recommendation_status = StageStatus.PROCESSING
                logger.info("recommendations_started call_id=%s", call_id)
                try:
                    rec_res: RecommendationResult = await self._execute_with_retry(
                        "recommendations",
                        lambda: self.recommendation_service.generate_recommendations(
                            transcript_input=resolved_transcript,
                            analysis_result=ctx.analysis_result,
                            outcome_result=ctx.outcome_result,
                            quality_result=ctx.quality_result,
                            call_id=call_id,
                            transcript_id=ctx.transcript_id,
                        ),
                        call_id=call_id,
                    )
                    ctx.recommendation_result = rec_res

                    # Optional persistence if recommendation_repository provided
                    if self.recommendation_repository:
                        if hasattr(self.recommendation_repository, "save_recommendations"):
                            self.recommendation_repository.save_recommendations(rec_res)
                        elif hasattr(self.recommendation_repository, "create"):
                            self.recommendation_repository.create(rec_res)

                    ctx.recommendation_status = StageStatus.COMPLETED
                    logger.info("recommendations_completed call_id=%s total=%d", call_id, len(rec_res.recommendations))
                except Exception as ex:
                    ctx.recommendation_status = StageStatus.FAILED
                    ctx.errors["recommendations"] = str(ex)
                    logger.error("recommendations_failed call_id=%s stage=recommendations error=%s", call_id, str(ex))
                    return ctx.to_dict()

            ctx.completed_at = datetime.now(timezone.utc).isoformat()
            self._completed_calls.add(call_id)
            return ctx.to_dict()

        finally:
            self._active_calls.discard(call_id)

    async def dispatch_background(
        self,
        call_id: str,
        transcript_input: Optional[Any] = None,
        transcript_id: Optional[str] = None,
        recording_id: Optional[str] = None,
        force: bool = False,
    ) -> asyncio.Task:
        """
        Dispatches analysis worker asynchronously without blocking caller.
        """
        task = asyncio.create_task(
            self.process_call(
                call_id=call_id,
                transcript_input=transcript_input,
                transcript_id=transcript_id,
                recording_id=recording_id,
                force=force,
            )
        )
        return task
