"""
FRIDAY AI Analysis Parsing & Validation Utilities.
Safely cleans JSON strings, extracts payloads, and validates numeric ranges.
"""

import json
import re
from typing import Any, Dict, Optional


def clean_json_response(raw_text: str) -> Dict[str, Any]:
    """
    Extracts and parses JSON from raw LLM output.
    Strips markdown code blocks, preamble, and trailing artifacts.
    """
    if not raw_text or not raw_text.strip():
        raise ValueError("Empty response string from LLM.")

    text = raw_text.strip()

    # Match ```json ... ``` or ``` ... ```
    code_block_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if code_block_match:
        text = code_block_match.group(1).strip()

    # Match earliest '{' to latest '}'
    start_idx = text.find("{")
    end_idx = text.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
        text = text[start_idx : end_idx + 1]

    try:
        return json.loads(text)
    except json.JSONDecodeError as err:
        raise ValueError(f"Failed to parse LLM JSON payload: {err.msg}") from err


def validate_confidence(val: Any, default: float = 0.5) -> float:
    """
    Validates that confidence is a float strictly bounded between 0.0 and 1.0.
    """
    if val is None:
        return default
    try:
        fval = float(val)
    except (ValueError, TypeError):
        return default

    # If model returned percentage 0-100, normalize to 0-1
    if 1.0 < fval <= 100.0:
        fval = fval / 100.0

    if fval < 0.0:
        return 0.0
    if fval > 1.0:
        return 1.0
    return round(fval, 4)


def validate_score(val: Any, default: Optional[float] = None, clamp: bool = True) -> Optional[float]:
    """
    Validates a quality score on the 0-100 scale.
    If clamp is False and score is out of bounds or non-numeric, raises ValueError.
    If clamp is True, clamps to [0.0, 100.0].
    """
    if val is None:
        return default
    try:
        fval = float(val)
    except (ValueError, TypeError):
        if not clamp:
            raise ValueError(f"Invalid score value: {val}")
        return default

    if fval < 0.0 or fval > 100.0:
        if not clamp:
            raise ValueError(f"Score {fval} out of valid bounds [0, 100]")
        fval = max(0.0, min(100.0, fval))

    return round(fval, 2)

