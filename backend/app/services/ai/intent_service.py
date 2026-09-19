"""
FRIDAY Intent Service.
Extracts customer call intent from structured conversation transcripts.
"""

from typing import Any, Dict, Optional

from app.ai.models.intent_model import IntentCategory, IntentResult
from app.ai.providers import BaseLLMProvider, get_llm_provider
from app.services.ai.utils import clean_json_response, validate_confidence


class IntentService:
    """Service to classify and validate call intent using LLMProvider abstraction."""

    def __init__(self, provider: Optional[BaseLLMProvider] = None) -> None:
        self.provider = provider or get_llm_provider()

    def parse_result(self, raw_data: Any) -> IntentResult:
        """Parses and validates a raw dict or string into an IntentResult."""
        if isinstance(raw_data, str):
            category = IntentCategory.match(raw_data)
            return IntentResult(
                intent=category.value,
                confidence=0.7,
                evidence=f"Dialogue indicates {category.value}.",
            )

        if not isinstance(raw_data, dict):
            raw_data = {}

        raw_intent = raw_data.get("intent")
        if isinstance(raw_intent, dict):
            return self.parse_result(raw_intent)

        category = IntentCategory.match(str(raw_intent) if raw_intent else "")
        confidence = validate_confidence(raw_data.get("confidence"), default=0.7)
        evidence = str(raw_data.get("evidence", "")).strip()

        if not evidence:
            evidence = f"Dialogue indicates {category.value}."

        return IntentResult(
            intent=category.value,
            confidence=confidence,
            evidence=evidence,
        )

    async def analyze(self, transcript_text: str) -> IntentResult:
        """Analyzes transcript text directly if invoked standalone."""
        if not transcript_text or not transcript_text.strip():
            return IntentResult(
                intent=IntentCategory.OTHER.value,
                confidence=0.0,
                evidence="Empty transcript provided.",
            )

        prompt = (
            "Analyze the primary customer intent of this conversation transcript.\n"
            "Respond with JSON format: {\"intent\": \"<Category>\", \"confidence\": 0.0, \"evidence\": \"<Text>\"}\n"
            "Allowed categories: Product Inquiry, Pricing Inquiry, Purchase Intent, Support Request, "
            "Complaint, Renewal, Cancellation, Information Request, Follow-up, Other.\n\n"
            f"Transcript:\n{transcript_text}"
        )

        response = await self.provider.generate(prompt)
        data = clean_json_response(response.content)
        # If response is {"intent": {"intent": "...", "confidence": ...}}, pass data["intent"]
        # If response is {"intent": "Pricing Inquiry", "confidence": ...}, pass data
        if isinstance(data.get("intent"), dict):
            return self.parse_result(data["intent"])
        return self.parse_result(data)
