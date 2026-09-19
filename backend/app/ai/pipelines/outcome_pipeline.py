"""
FRIDAY AI Outcome Pipeline.
Orchestration pipeline connecting:
Transcript + Phase 3 Analysis -> OutcomeService -> Validated OutcomeResult -> Optional Persistence.
"""

import logging
from typing import Any, Optional

from app.ai.models.outcome_model import OutcomeResult
from app.repositories.outcome_repository import OutcomeRepository
from app.services.ai.outcome_service import OutcomeService

logger = logging.getLogger("friday.ai.pipelines.outcome")


class OutcomePipeline:
    """
    Pipeline orchestrating business outcome determination and optional persistence.
    """

    def __init__(
        self,
        outcome_service: Optional[OutcomeService] = None,
        repository: Optional[OutcomeRepository] = None,
    ) -> None:
        self.outcome_service = outcome_service or OutcomeService(repository=repository)
        self.repository = repository

    async def execute(
        self,
        transcript_input: Any = None,
        analysis_result: Any = None,
        call_id: Optional[str] = None,
        transcript_id: Optional[str] = None,
        persist: bool = False,
        overwrite: bool = True,
    ) -> OutcomeResult:
        """
        Executes outcome determination:
        1. Validates inputs exist.
        2. Resolves call_id and transcript_id.
        3. Delegates to OutcomeService.determine_outcome.
        4. If persist=True and repository is configured, persists into database.
        5. Returns typed OutcomeResult.
        """
        if transcript_input is None and analysis_result is None:
            raise ValueError("Either transcript_input or analysis_result must be provided.")

        eff_call_id = call_id or getattr(transcript_input, "call_id", None) or getattr(analysis_result, "call_id", None)
        if eff_call_id is None and isinstance(transcript_input, dict):
            eff_call_id = transcript_input.get("call_id")
        if eff_call_id is None and isinstance(analysis_result, dict):
            eff_call_id = analysis_result.get("call_id")

        eff_transcript_id = (
            transcript_id
            or getattr(transcript_input, "id", None)
            or getattr(transcript_input, "transcript_id", None)
            or getattr(analysis_result, "transcript_id", None)
        )
        if eff_transcript_id is None and isinstance(transcript_input, dict):
            eff_transcript_id = transcript_input.get("id") or transcript_input.get("transcript_id")
        if eff_transcript_id is None and isinstance(analysis_result, dict):
            eff_transcript_id = analysis_result.get("transcript_id")

        logger.info(
            "Executing AI Outcome Pipeline for call_id=%s, transcript_id=%s, persist=%s",
            eff_call_id,
            eff_transcript_id,
            persist,
        )

        outcome_res = await self.outcome_service.determine_outcome(
            transcript_input=transcript_input,
            analysis_result=analysis_result,
            call_id=str(eff_call_id) if eff_call_id else None,
            transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
        )

        if persist and self.repository is not None and outcome_res.call_id:
            self.outcome_service.persist_outcome(
                outcome_result=outcome_res,
                repository=self.repository,
                overwrite=overwrite,
            )
            logger.info("Persisted outcome for call_id=%s", eff_call_id)

        return outcome_res
