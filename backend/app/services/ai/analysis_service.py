"""
FRIDAY AI Analysis Service.
Orchestrates Intent, Sentiment, Objection, Keyword, and Summary extraction
into a unified, strongly validated in-memory AnalysisResult.
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from app.ai.models.analysis_model import AnalysisResult, KeywordItem, SummaryResult
from app.ai.models.intent_model import IntentCategory, IntentResult
from app.ai.models.objection_model import ObjectionItem
from app.ai.models.sentiment_model import SentimentCategory, SentimentResult
from app.ai.providers import BaseLLMProvider, get_llm_provider
from app.services.ai.intent_service import IntentService
from app.services.ai.keyword_service import KeywordService
from app.services.ai.objection_service import ObjectionService
from app.services.ai.sentiment_service import SentimentService
from app.services.ai.summary_service import SummaryService
from app.services.ai.utils import clean_json_response

PROMPTS_DIR = Path(__file__).resolve().parent.parent.parent / "ai" / "prompts"


def load_prompt_template(filename: str) -> str:
    """Safely loads prompt text template from ai/prompts directory."""
    path = PROMPTS_DIR / filename
    if path.is_file():
        return path.read_text(encoding="utf-8")
    return ""


class AnalysisService:
    """
    AI Analysis Engine Service.
    Coordinates specialized sub-services (Intent, Sentiment, Objection, Keyword, Summary)
    or executes optimized unified analysis over transcripts.
    """

    def __init__(
        self,
        provider: Optional[BaseLLMProvider] = None,
        intent_service: Optional[IntentService] = None,
        sentiment_service: Optional[SentimentService] = None,
        objection_service: Optional[ObjectionService] = None,
        keyword_service: Optional[KeywordService] = None,
        summary_service: Optional[SummaryService] = None,
    ) -> None:
        self.provider = provider or get_llm_provider()
        self.intent_service = intent_service or IntentService(provider=self.provider)
        self.sentiment_service = sentiment_service or SentimentService(provider=self.provider)
        self.objection_service = objection_service or ObjectionService(provider=self.provider)
        self.keyword_service = keyword_service or KeywordService(provider=self.provider)
        self.summary_service = summary_service or SummaryService(provider=self.provider)

        self._analysis_prompt = load_prompt_template("analysis_prompt.txt")
        self._summary_prompt = load_prompt_template("summary_prompt.txt")

    def format_transcript_dialogue(self, transcript_input: Any) -> str:
        """
        Formats transcript into a clean, speaker-annotated dialogue string.
        Accepts raw string, TranscriptionOutput, dict, or list of segments.
        """
        if isinstance(transcript_input, str):
            return transcript_input.strip()

        # Check TranscriptionOutput object or dict with segments
        segments = getattr(transcript_input, "segments", None)
        if segments is None and isinstance(transcript_input, dict):
            segments = transcript_input.get("segments")

        if segments and isinstance(segments, list):
            lines = []
            for seg in segments:
                speaker = getattr(seg, "speaker", None) or (seg.get("speaker") if isinstance(seg, dict) else "unknown")
                text = getattr(seg, "text", None) or (seg.get("text") if isinstance(seg, dict) else "")
                start = getattr(seg, "start", 0.0) if hasattr(seg, "start") else (seg.get("start", 0.0) if isinstance(seg, dict) else 0.0)
                if text:
                    lines.append(f"[{start:.1f}s] {speaker.capitalize()}: {text}")
            if lines:
                return "\n".join(lines)

        # Fallback to text field
        text = getattr(transcript_input, "text", None) or (
            transcript_input.get("text") if isinstance(transcript_input, dict) else str(transcript_input)
        )
        return str(text).strip()

    def get_segments(self, transcript_input: Any) -> List[Any]:
        """Extracts segment list if present on input."""
        segments = getattr(transcript_input, "segments", None)
        if segments is None and isinstance(transcript_input, dict):
            segments = transcript_input.get("segments", [])
        return segments if isinstance(segments, list) else []

    async def analyze_transcript(
        self,
        transcript_input: Any,
        call_id: Optional[str] = None,
        transcript_id: Optional[str] = None,
    ) -> AnalysisResult:
        """
        Executes unified analysis against the transcript input:
        1. Formats speaker dialogue
        2. Queries LLM Provider with analysis prompt
        3. Separately queries or parses summary prompt
        4. Validates each extraction component through dedicated sub-services
        5. Returns strongly typed AnalysisResult
        """
        formatted_dialogue = self.format_transcript_dialogue(transcript_input)
        segments = self.get_segments(transcript_input)

        if not formatted_dialogue:
            # Handle empty transcript safely without fabricating data
            return AnalysisResult(
                call_id=call_id,
                transcript_id=transcript_id,
                intent=IntentResult(
                    intent=IntentCategory.OTHER.value,
                    confidence=0.0,
                    evidence="Empty transcript provided.",
                ),
                sentiment=SentimentResult(
                    sentiment=SentimentCategory.NEUTRAL.value,
                    confidence=0.0,
                    evidence="Empty transcript provided.",
                ),
                objections=[],
                keywords=[],
                summary=SummaryResult(
                    summary="Empty transcript provided; no conversation to analyze.",
                    key_points=[],
                    customer_needs=[],
                    concerns=[],
                    next_steps=[],
                ),
                model=getattr(self.provider, "model", "mock"),
                provider=getattr(self.provider, "provider_name", "mock"),
            )

        # Step 1: Execute primary intelligence analysis (Intent, Sentiment, Objections, Keywords)
        prompt = (
            f"{self._analysis_prompt}\n\n"
            f"Transcript:\n{formatted_dialogue}"
        )
        llm_resp = await self.provider.generate(prompt)

        try:
            analysis_data = clean_json_response(llm_resp.content)
        except Exception:
            # If JSON parsing failed, construct safe fallback
            analysis_data = {}

        # Parse and validate components via specialized services
        intent_res = self.intent_service.parse_result(analysis_data.get("intent", {}))
        sentiment_res = self.sentiment_service.parse_result(analysis_data.get("sentiment", {}))
        objections_res = self.objection_service.parse_result(
            analysis_data.get("objections", []),
            segments_lookup=segments,
        )
        keywords_res = self.keyword_service.parse_result(
            analysis_data.get("keywords", []),
            segments=segments,
        )

        # Step 2: Summary Generation
        summary_prompt = (
            f"{self._summary_prompt}\n\n"
            f"Transcript:\n{formatted_dialogue}"
        )
        summary_resp = await self.provider.generate(summary_prompt)

        try:
            summary_data = clean_json_response(summary_resp.content)
        except Exception:
            summary_data = {}

        summary_res = self.summary_service.parse_result(summary_data)

        return AnalysisResult(
            call_id=call_id,
            transcript_id=transcript_id,
            intent=intent_res,
            sentiment=sentiment_res,
            objections=objections_res,
            keywords=keywords_res,
            summary=summary_res,
            model=getattr(self.provider, "model", "mock"),
            provider=getattr(self.provider, "provider_name", "mock"),
        )
