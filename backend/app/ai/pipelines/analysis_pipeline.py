"""
FRIDAY AI Analysis Pipeline.
Thin coordination pipeline connecting:
Transcript Input -> Input Validation -> AnalysisService -> Validated AnalysisResult.
Does NOT implement database persistence or API handlers (Phase 4).
"""

import logging
from typing import Any, Optional

from app.ai.models.analysis_model import AnalysisResult
from app.services.ai.analysis_service import AnalysisService

logger = logging.getLogger("friday.ai.pipelines.analysis")


class AnalysisPipeline:
    """
    Orchestration pipeline for call transcript analysis.
    Validates input and delegates to AnalysisService to produce AnalysisResult.
    """

    def __init__(self, analysis_service: Optional[AnalysisService] = None) -> None:
        self.analysis_service = analysis_service or AnalysisService()

    async def execute(
        self,
        transcript_input: Any,
        call_id: Optional[str] = None,
        transcript_id: Optional[str] = None,
    ) -> AnalysisResult:
        """
        Executes analysis pipeline:
        1. Validates transcript input exists.
        2. Executes AnalysisService extraction.
        3. Returns typed AnalysisResult in-memory.
        """
        if transcript_input is None:
            raise ValueError("Transcript input cannot be None.")

        # Extract call_id or transcript_id from transcript object if not explicitly passed
        eff_call_id = call_id or getattr(transcript_input, "call_id", None) or (
            transcript_input.get("call_id") if isinstance(transcript_input, dict) else None
        )
        eff_transcript_id = transcript_id or getattr(transcript_input, "id", None) or (
            transcript_input.get("id") if isinstance(transcript_input, dict) else None
        )

        logger.info("Executing AI analysis for call_id=%s, transcript_id=%s", eff_call_id, eff_transcript_id)

        result = await self.analysis_service.analyze_transcript(
            transcript_input=transcript_input,
            call_id=eff_call_id,
            transcript_id=eff_transcript_id,
        )

        logger.info("AI analysis completed successfully for call_id=%s", eff_call_id)
        return result
