"""
FRIDAY AI Data Layer Mapping Helpers.
Deterministic conversion between Phase 3 AnalysisResult and Phase 4 AnalysisCreate/AIAnalysis.
Contains NO LLM calls or reasoning.
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.ai.models.analysis_model import AnalysisResult
from app.models.ai_analysis import AIAnalysis
from app.models.outcome import Outcome, OutcomeCategory
from app.schemas.analysis import AnalysisCreate
from app.schemas.outcome import OutcomeCreate


def analysis_result_to_create_schema(
    result: AnalysisResult,
    call_id: Optional[str] = None,
    transcript_id: Optional[str] = None,
) -> AnalysisCreate:
    """
    Deterministically maps a Phase 3 AnalysisResult into an AnalysisCreate schema.
    """
    eff_call_id = call_id or result.call_id
    if not eff_call_id:
        raise ValueError("Cannot map AnalysisResult to AnalysisCreate without a call_id.")

    eff_transcript_id = transcript_id or result.transcript_id

    # Intent
    intent_val = getattr(result.intent, "intent", "Other")
    intent_conf = getattr(result.intent, "confidence", 0.0)
    intent_ev = getattr(result.intent, "evidence", "")

    # Sentiment
    sentiment_val = getattr(result.sentiment, "sentiment", "Neutral")
    sentiment_conf = getattr(result.sentiment, "confidence", 0.0)
    sentiment_ev = getattr(result.sentiment, "evidence", "")

    # Objections
    objections_data = [
        obj.to_dict() if hasattr(obj, "to_dict") else obj
        for obj in (result.objections or [])
    ]

    # Keywords
    keywords_data = [
        kw.to_dict() if hasattr(kw, "to_dict") else kw
        for kw in (result.keywords or [])
    ]

    # Summary
    summary_obj = result.summary
    summary_text = getattr(summary_obj, "summary", "")
    key_points = getattr(summary_obj, "key_points", []) or []
    customer_needs = getattr(summary_obj, "customer_needs", []) or []
    concerns = getattr(summary_obj, "concerns", []) or []
    next_steps = getattr(summary_obj, "next_steps", []) or []

    return AnalysisCreate(
        call_id=str(eff_call_id),
        transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
        intent=str(intent_val),
        intent_confidence=float(intent_conf),
        intent_evidence=str(intent_ev),
        sentiment=str(sentiment_val),
        sentiment_confidence=float(sentiment_conf),
        sentiment_evidence=str(sentiment_ev),
        objections=objections_data,
        keywords=keywords_data,
        summary=str(summary_text),
        key_points=list(key_points),
        customer_needs=list(customer_needs),
        concerns=list(concerns),
        next_steps=list(next_steps),
        model=getattr(result, "model", "unknown"),
        provider=getattr(result, "provider", "unknown"),
    )


def analysis_create_to_model(schema: AnalysisCreate) -> AIAnalysis:
    """
    Transforms AnalysisCreate schema into an AIAnalysis SQLAlchemy model instance.
    """
    data = schema.dict() if hasattr(schema, "dict") else schema.__dict__
    return AIAnalysis(
        call_id=data["call_id"],
        transcript_id=data.get("transcript_id"),
        intent=data.get("intent", "Other"),
        intent_confidence=data.get("intent_confidence", 0.0),
        intent_evidence=data.get("intent_evidence", ""),
        sentiment=data.get("sentiment", "Neutral"),
        sentiment_confidence=data.get("sentiment_confidence", 0.0),
        sentiment_evidence=data.get("sentiment_evidence", ""),
        objections=data.get("objections", []),
        keywords=data.get("keywords", []),
        summary=data.get("summary", ""),
        key_points=data.get("key_points", []),
        customer_needs=data.get("customer_needs", []),
        concerns=data.get("concerns", []),
        next_steps=data.get("next_steps", []),
        model=data.get("model", "unknown"),
        provider=data.get("provider", "unknown"),
    )


def outcome_create_to_model(schema: OutcomeCreate) -> Outcome:
    """
    Transforms OutcomeCreate schema into an Outcome SQLAlchemy model instance.
    """
    data = schema.dict() if hasattr(schema, "dict") else schema.__dict__
    return Outcome(
        call_id=data["call_id"],
        transcript_id=data.get("transcript_id"),
        outcome=data.get("outcome", OutcomeCategory.OTHER.value),
        confidence=data.get("confidence", 0.0),
        evidence=data.get("evidence", ""),
        next_action=data.get("next_action"),
        model=data.get("model", "unknown"),
        provider=data.get("provider", "unknown"),
    )


def outcome_result_to_create_schema(
    result: Any,
    call_id: Optional[str] = None,
    transcript_id: Optional[str] = None,
) -> OutcomeCreate:
    """
    Deterministically maps a Phase 5 OutcomeResult into an OutcomeCreate schema.
    """
    eff_call_id = call_id or getattr(result, "call_id", None)
    if not eff_call_id:
        raise ValueError("Cannot map OutcomeResult to OutcomeCreate without a call_id.")

    eff_transcript_id = transcript_id or getattr(result, "transcript_id", None)
    return OutcomeCreate(
        call_id=str(eff_call_id),
        transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
        outcome=getattr(result, "outcome", OutcomeCategory.OTHER.value),
        confidence=float(getattr(result, "confidence", 0.0)),
        evidence=str(getattr(result, "evidence", "")),
        next_action=getattr(result, "next_action", None),
        model=getattr(result, "model", "unknown"),
        provider=getattr(result, "provider", "unknown"),
    )
