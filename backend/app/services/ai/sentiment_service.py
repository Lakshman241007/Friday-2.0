"""
FRIDAY Sentiment Service.
Extracts customer sentiment and tone from conversation transcripts.
"""

from typing import Any, Dict, Optional

from app.ai.models.sentiment_model import SentimentCategory, SentimentResult
from app.ai.providers import BaseLLMProvider, get_llm_provider
from app.services.ai.utils import clean_json_response, validate_confidence


class SentimentService:
    """Service to classify and validate customer sentiment using LLMProvider abstraction."""

    def __init__(self, provider: Optional[BaseLLMProvider] = None) -> None:
        self.provider = provider or get_llm_provider()

    def parse_result(self, raw_data: Any) -> SentimentResult:
        """Parses and validates a raw dict or string into a SentimentResult."""
        if isinstance(raw_data, str):
            category = SentimentCategory.match(raw_data)
            return SentimentResult(
                sentiment=category.value,
                confidence=0.7,
                evidence=f"Dialogue exhibits {category.value.lower()} tone.",
            )

        if not isinstance(raw_data, dict):
            raw_data = {}

        raw_sentiment = raw_data.get("sentiment")
        if isinstance(raw_sentiment, dict):
            return self.parse_result(raw_sentiment)

        category = SentimentCategory.match(str(raw_sentiment) if raw_sentiment else "")
        confidence = validate_confidence(raw_data.get("confidence"), default=0.7)
        evidence = str(raw_data.get("evidence", "")).strip()

        if not evidence:
            evidence = f"Dialogue exhibits {category.value.lower()} tone."

        return SentimentResult(
            sentiment=category.value,
            confidence=confidence,
            evidence=evidence,
        )

    async def analyze(self, transcript_text: str) -> SentimentResult:
        """Analyzes sentiment directly if invoked standalone."""
        if not transcript_text or not transcript_text.strip():
            return SentimentResult(
                sentiment=SentimentCategory.NEUTRAL.value,
                confidence=0.0,
                evidence="Empty transcript provided.",
            )

        prompt = (
            "Analyze the overall customer sentiment of this conversation transcript.\n"
            "Respond with JSON format: {\"sentiment\": \"<Category>\", \"confidence\": 0.0, \"evidence\": \"<Text>\"}\n"
            "Allowed categories: Positive, Neutral, Negative, Mixed.\n\n"
            f"Transcript:\n{transcript_text}"
        )

        response = await self.provider.generate(prompt)
        data = clean_json_response(response.content)
        if isinstance(data.get("sentiment"), dict):
            return self.parse_result(data["sentiment"])
        return self.parse_result(data)
