"""
FRIDAY Summary Service.
Generates concise, factual call summaries, key discussion points, customer needs,
and explicitly scheduled next steps without fabrication.
"""

from typing import Any, Dict, List, Optional

from app.ai.models.analysis_model import SummaryResult
from app.ai.providers import BaseLLMProvider, get_llm_provider
from app.services.ai.utils import clean_json_response


class SummaryService:
    """Service to produce structured, factual call summaries using LLMProvider abstraction."""

    def __init__(self, provider: Optional[BaseLLMProvider] = None) -> None:
        self.provider = provider or get_llm_provider()

    def parse_result(self, raw_data: Dict[str, Any]) -> SummaryResult:
        """Parses and validates a raw dict into a SummaryResult."""
        summary = str(raw_data.get("summary", "")).strip()

        def parse_str_list(field_name: str) -> List[str]:
            val = raw_data.get(field_name, [])
            if isinstance(val, list):
                return [str(item).strip() for item in val if str(item).strip()]
            if isinstance(val, str) and val.strip():
                return [val.strip()]
            return []

        key_points = parse_str_list("key_points")
        customer_needs = parse_str_list("customer_needs")
        concerns = parse_str_list("concerns")
        next_steps = parse_str_list("next_steps")

        if not summary:
            if key_points:
                summary = " ".join(key_points)
            else:
                summary = "Conversation transcript completed."

        return SummaryResult(
            summary=summary,
            key_points=key_points,
            customer_needs=customer_needs,
            concerns=concerns,
            next_steps=next_steps,
        )

    async def summarize(self, transcript_text: str) -> SummaryResult:
        """Summarizes transcript text directly using configured LLMProvider."""
        if not transcript_text or not transcript_text.strip():
            return SummaryResult(
                summary="Empty transcript provided; no conversation to summarize.",
                key_points=[],
                customer_needs=[],
                concerns=[],
                next_steps=[],
            )

        prompt = (
            "You are a sales call summarizer. Produce a factual summary of this transcript.\n"
            "Respond strictly in JSON format:\n"
            "{\n"
            "  \"summary\": \"<Concise 2-3 sentence overview>\",\n"
            "  \"key_points\": [\"<Point 1>\", \"<Point 2>\"],\n"
            "  \"customer_needs\": [\"<Need 1>\"],\n"
            "  \"concerns\": [\"<Concern 1>\"],\n"
            "  \"next_steps\": [\"<Only explicitly agreed next steps; [] if none>\"]\n"
            "}\n\n"
            f"Transcript:\n{transcript_text}"
        )

        response = await self.provider.generate(prompt)
        data = clean_json_response(response.content)
        summary_data = data.get("summary_data", data)
        return self.parse_result(summary_data)
