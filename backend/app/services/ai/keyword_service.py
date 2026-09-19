"""
FRIDAY Keyword Service.
Extracts meaningful domain keywords, entities, and topics from transcripts,
correlating timestamps from transcript segments and filtering noise.
"""

import re
from typing import Any, Dict, List, Optional, Set

from app.ai.models.analysis_model import KeywordItem
from app.ai.providers import BaseLLMProvider, get_llm_provider
from app.services.ai.utils import clean_json_response, validate_confidence

# Common English stop words to exclude from extracted keywords
STOP_WORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
    "during", "each", "few", "for", "from", "further", "had", "hadn't", "has",
    "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
    "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
    "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
    "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
    "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
    "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
    "they're", "they've", "this", "those", "through", "to", "too", "under",
    "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're",
    "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
    "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with",
    "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've",
    "your", "yours", "yourself", "yourselves", "hello", "hi", "hey", "thanks",
    "thank", "okay", "yes", "yeah", "sure", "well", "um", "uh", "like", "actually",
}


class KeywordService:
    """Service to extract high-value topics and keywords with segment timestamp alignment."""

    def __init__(self, provider: Optional[BaseLLMProvider] = None) -> None:
        self.provider = provider or get_llm_provider()

    def filter_keyword(self, word: str) -> bool:
        """Returns True if the keyword is valid and non-stopword."""
        clean = word.strip().lower()
        if len(clean) < 3:
            return False
        if clean in STOP_WORDS:
            return False
        # If multi-word, check that it's not made entirely of stop words
        tokens = [t for t in clean.split() if t not in STOP_WORDS]
        return len(tokens) > 0

    def find_keyword_timestamps(self, keyword: str, segments: List[Any]) -> List[float]:
        """Scans transcript segments to extract exact timestamps where keyword occurs."""
        if not segments or not keyword:
            return []

        pattern = re.compile(r"\b" + re.escape(keyword.lower()) + r"\b", re.IGNORECASE)
        timestamps: List[float] = []

        for seg in segments:
            text = getattr(seg, "text", None) or (seg.get("text") if isinstance(seg, dict) else "")
            start = getattr(seg, "start", 0.0) if hasattr(seg, "start") else (seg.get("start", 0.0) if isinstance(seg, dict) else 0.0)
            if text and pattern.search(text.lower()):
                timestamps.append(round(float(start), 3))

        return timestamps

    def parse_result(
        self,
        raw_items: Any,
        segments: Optional[List[Any]] = None,
    ) -> List[KeywordItem]:
        """Parses and enriches raw keyword extractions with segment timestamps."""
        if not isinstance(raw_items, list):
            return []

        results: List[KeywordItem] = []
        seen_keywords: Set[str] = set()

        for item in raw_items:
            if not isinstance(item, dict):
                continue

            kw = str(item.get("keyword", "")).strip()
            if not kw or not self.filter_keyword(kw):
                continue

            norm_key = kw.lower()
            if norm_key in seen_keywords:
                continue
            seen_keywords.add(norm_key)

            relevance = validate_confidence(item.get("relevance"), default=0.7)
            frequency = item.get("frequency", 1)
            try:
                freq = max(1, int(frequency))
            except (ValueError, TypeError):
                freq = 1

            # Match timestamps from segment dialogue
            timestamps: List[float] = []
            raw_ts = item.get("timestamps")
            if isinstance(raw_ts, list) and len(raw_ts) > 0:
                timestamps = [float(t) for t in raw_ts if t is not None and float(t) >= 0]
            elif segments:
                timestamps = self.find_keyword_timestamps(kw, segments)

            if not timestamps and segments:
                timestamps = self.find_keyword_timestamps(kw, segments)

            results.append(
                KeywordItem(
                    keyword=kw,
                    relevance=relevance,
                    frequency=freq,
                    timestamps=timestamps,
                )
            )

        return results

    async def analyze(
        self,
        transcript_text: str,
        segments: Optional[List[Any]] = None,
    ) -> List[KeywordItem]:
        """Analyzes keywords directly if invoked standalone."""
        if not transcript_text or not transcript_text.strip():
            return []

        prompt = (
            "Extract the most meaningful products, features, pricing topics, and pain points discussed.\n"
            "Respond with JSON array: [{\"keyword\": \"<Term>\", \"relevance\": 0.0, \"frequency\": 1}].\n"
            "Do NOT include conversational stop words or generic filler.\n\n"
            f"Transcript:\n{transcript_text}"
        )

        response = await self.provider.generate(prompt)
        data = clean_json_response(response.content)
        raw_list = data.get("keywords", data) if isinstance(data, dict) else data
        return self.parse_result(raw_list, segments=segments)
