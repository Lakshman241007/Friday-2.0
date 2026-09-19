"""
FRIDAY Objection Service.
Detects and categorizes sales objections raised by leads/customers.
"""

from typing import Any, Dict, List, Optional

from app.ai.models.objection_model import ObjectionCategory, ObjectionItem
from app.ai.providers import BaseLLMProvider, get_llm_provider
from app.services.ai.utils import clean_json_response, validate_confidence


class ObjectionService:
    """Service to detect and structure customer objections using LLMProvider abstraction."""

    def __init__(self, provider: Optional[BaseLLMProvider] = None) -> None:
        self.provider = provider or get_llm_provider()

    def parse_item(self, item: Dict[str, Any], segments_lookup: Optional[List[Any]] = None) -> Optional[ObjectionItem]:
        """Parses an objection item, validating category, confidence, and timestamp bounds."""
        if not isinstance(item, dict):
            return None

        desc = str(item.get("description", "")).strip()
        evidence = str(item.get("evidence", "")).strip()
        if not desc and not evidence:
            return None

        category = ObjectionCategory.match(str(item.get("category", "")))
        confidence = validate_confidence(item.get("confidence"), default=0.75)

        raw_ts = item.get("timestamp", 0.0)
        try:
            ts = float(raw_ts)
            if ts < 0.0:
                ts = 0.0
        except (ValueError, TypeError):
            ts = 0.0

        # If timestamps exist in segments, check if we can correlate or clamp
        if segments_lookup:
            max_end = max((getattr(s, "end", 0.0) if hasattr(s, "end") else s.get("end", 0.0)) for s in segments_lookup) if segments_lookup else 0.0
            if ts > max_end and max_end > 0:
                ts = max_end

        return ObjectionItem(
            category=category.value,
            description=desc or f"{category.value} objection raised.",
            confidence=confidence,
            timestamp=round(ts, 3),
            evidence=evidence or desc,
        )

    def parse_result(
        self,
        raw_items: Any,
        segments_lookup: Optional[List[Any]] = None,
    ) -> List[ObjectionItem]:
        """Parses a list of raw objection dicts into validated ObjectionItem instances."""
        if not isinstance(raw_items, list):
            return []

        results: List[ObjectionItem] = []
        for obj in raw_items:
            item = self.parse_item(obj, segments_lookup)
            if item:
                results.append(item)
        return results

    async def analyze(
        self,
        transcript_text: str,
        segments: Optional[List[Any]] = None,
    ) -> List[ObjectionItem]:
        """Analyzes objections directly if invoked standalone."""
        if not transcript_text or not transcript_text.strip():
            return []

        prompt = (
            "Identify customer objections from the conversation transcript.\n"
            "Return JSON array: [{\"category\": \"<Category>\", \"description\": \"<Text>\", "
            "\"confidence\": 0.0, \"timestamp\": 0.0, \"evidence\": \"<Text>\"}].\n"
            "Allowed categories: Pricing, Features, Timing, Competitor, Trust, Implementation, Contract, Need, Other.\n"
            "If no meaningful objections were raised, return [].\n\n"
            f"Transcript:\n{transcript_text}"
        )

        response = await self.provider.generate(prompt)
        data = clean_json_response(response.content)
        raw_list = data.get("objections", data) if isinstance(data, dict) else data
        return self.parse_result(raw_list, segments_lookup=segments)
