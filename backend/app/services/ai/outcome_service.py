"""
FRIDAY AI Outcome Service.
Determines the business outcome of a call from transcript dialogue and
Phase 3 Analysis intelligence (intent, sentiment, objections, summary, next steps).
Outputs validated OutcomeResult and persists safely via OutcomeRepository.
"""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from app.ai.models.analysis_model import AnalysisResult
from app.ai.models.outcome_model import OutcomeCategory, OutcomeResult
from app.ai.providers import BaseLLMProvider, get_llm_provider
from app.ai.providers.exceptions import AIProviderError
from app.models.outcome import Outcome
from app.repositories.outcome_repository import DuplicateOutcomeError, OutcomeRepository
from app.schemas.mapping import outcome_result_to_create_schema
from app.schemas.outcome import OutcomeCreate, OutcomeUpdate
from app.services.ai.utils import clean_json_response, validate_confidence

logger = logging.getLogger("friday.ai.outcome")

PROMPTS_DIR = Path(__file__).resolve().parent.parent.parent / "ai" / "prompts"


def load_prompt_template(filename: str) -> str:
    """Safely loads prompt text template from ai/prompts directory."""
    path = PROMPTS_DIR / filename
    if path.is_file():
        return path.read_text(encoding="utf-8")
    return ""


class OutcomeService:
    """
    AI Outcome Engine Service.
    Determines call outcome using LLMProvider, Phase 3 analysis, and transcript evidence.
    Enforces strict taxonomy validation, concise factual evidence, and safe persistence.
    """

    def __init__(
        self,
        provider: Optional[BaseLLMProvider] = None,
        repository: Optional[OutcomeRepository] = None,
    ) -> None:
        self.provider = provider or get_llm_provider()
        self.repository = repository
        self._outcome_prompt = load_prompt_template("outcome_prompt.txt")

    def format_transcript_dialogue(self, transcript_input: Any) -> str:
        """
        Formats transcript input into clean dialogue text.
        Handles strings, objects with segments, dictionaries, and raw text.
        """
        if transcript_input is None:
            return ""

        if isinstance(transcript_input, str):
            return transcript_input.strip()

        # Handle object or dict with segments
        segments = getattr(transcript_input, "segments", None)
        if segments is None and isinstance(transcript_input, dict):
            segments = transcript_input.get("segments")

        if segments and isinstance(segments, list):
            lines = []
            for seg in segments:
                speaker = (
                    getattr(seg, "speaker", None)
                    or (seg.get("speaker") if isinstance(seg, dict) else "unknown")
                )
                text = (
                    getattr(seg, "text", None)
                    or (seg.get("text") if isinstance(seg, dict) else "")
                )
                start = (
                    getattr(seg, "start", 0.0)
                    if hasattr(seg, "start")
                    else (seg.get("start", 0.0) if isinstance(seg, dict) else 0.0)
                )
                if text:
                    lines.append(f"[{start:.1f}s] {str(speaker).capitalize()}: {text}")
            if lines:
                return "\n".join(lines)

        # Fallback to text attribute
        text = getattr(transcript_input, "text", None) or (
            transcript_input.get("text") if isinstance(transcript_input, dict) else str(transcript_input)
        )
        return str(text).strip() if text else ""

    def format_analysis_context(self, analysis_result: Any) -> str:
        """
        Formats structured intelligence from Phase 3 AnalysisResult into concise prompt context.
        Consumes: intent, sentiment, objections, summary, customer needs, concerns, next steps.
        """
        if analysis_result is None:
            return "No Phase 3 intelligence available."

        # Convert to dict if object
        if hasattr(analysis_result, "to_dict"):
            data = analysis_result.to_dict()
        elif isinstance(analysis_result, dict):
            data = analysis_result
        else:
            data = {}

        lines: List[str] = []

        # Intent
        intent_info = data.get("intent")
        if isinstance(intent_info, dict):
            label = intent_info.get("intent") or intent_info.get("label", "Unknown")
            conf = intent_info.get("confidence", 0.0)
            lines.append(f"- Stated Intent: {label} (confidence: {conf})")
        elif intent_info:
            lines.append(f"- Stated Intent: {intent_info}")

        # Sentiment
        sentiment_info = data.get("sentiment")
        if isinstance(sentiment_info, dict):
            label = sentiment_info.get("sentiment") or sentiment_info.get("label", "Unknown")
            conf = sentiment_info.get("confidence", 0.0)
            lines.append(f"- Customer Sentiment: {label} (confidence: {conf})")
        elif sentiment_info:
            lines.append(f"- Customer Sentiment: {sentiment_info}")

        # Objections
        objections = data.get("objections", [])
        if objections and isinstance(objections, list):
            obj_desc = [
                f"{o.get('category', 'Other')}: {o.get('description', o.get('evidence', ''))}".strip()
                for o in objections
                if isinstance(o, dict)
            ]
            if obj_desc:
                lines.append(f"- Customer Objections: {'; '.join(obj_desc)}")

        # Summary
        summary_info = data.get("summary")
        if isinstance(summary_info, dict):
            sum_text = summary_info.get("summary", "")
            if sum_text:
                lines.append(f"- Call Summary: {sum_text}")

            needs = summary_info.get("customer_needs", [])
            if needs:
                lines.append(f"- Customer Needs: {', '.join(needs)}")

            concerns = summary_info.get("concerns", [])
            if concerns:
                lines.append(f"- Identified Concerns: {', '.join(concerns)}")

            next_steps = summary_info.get("next_steps", [])
            if next_steps:
                lines.append(f"- Explicit Next Steps from Dialogue: {', '.join(next_steps)}")
        elif isinstance(summary_info, str) and summary_info:
            lines.append(f"- Call Summary: {summary_info}")

        # Direct root next_steps if present
        root_next_steps = data.get("next_steps", [])
        if root_next_steps and not (isinstance(summary_info, dict) and summary_info.get("next_steps")):
            lines.append(f"- Explicit Next Steps from Dialogue: {', '.join(root_next_steps)}")

        return "\n".join(lines) if lines else "No structured Phase 3 intelligence available."

    def validate_and_clean_next_action(
        self,
        next_action: Any,
        outcome: str,
        phase3_next_steps: Optional[List[str]] = None,
    ) -> Optional[str]:
        """
        Validates that next action is actionable, non-fabricated, and groundable.
        Returns cleaned string or None.
        """
        if not next_action:
            # Check if Phase 3 had explicit next steps and outcome warrants an action
            if phase3_next_steps and outcome in {
                OutcomeCategory.FOLLOW_UP_REQUIRED.value,
                OutcomeCategory.CALLBACK_REQUESTED.value,
                OutcomeCategory.INTERESTED.value,
                OutcomeCategory.QUALIFIED.value,
            }:
                return str(phase3_next_steps[0]).strip()[:255]
            return None

        clean_action = str(next_action).strip()

        # Reject placeholder or negative action indicators
        lower_action = clean_action.lower()
        if lower_action in {
            "null",
            "none",
            "n/a",
            "no action",
            "no next action",
            "none required",
            "not applicable",
            "undefined",
            "",
        }:
            return None

        # If outcome is clearly terminal/negative, next_action should generally be None
        if outcome in {
            OutcomeCategory.NOT_INTERESTED.value,
            OutcomeCategory.DISQUALIFIED.value,
            OutcomeCategory.WRONG_NUMBER.value,
            OutcomeCategory.NO_ANSWER.value,
            OutcomeCategory.BUSY.value,
        }:
            return None

        # Truncate to database column size limit (String(255))
        return clean_action[:255]

    def validate_and_clean_evidence(self, evidence: Any, outcome: str) -> str:
        """
        Ensures evidence is concise, non-empty, factual, and free of chain-of-thought.
        Caps length at 400 characters to ensure scannability.
        """
        if not evidence or not str(evidence).strip():
            return f"Call outcome determined as {outcome} based on conversational dialogue."

        clean_evidence = str(evidence).strip()

        # Remove chain-of-thought markers if model outputs them
        clean_evidence = clean_evidence.replace("Reasoning:", "").replace("Thought:", "").strip()

        if len(clean_evidence) > 400:
            # Truncate at sentence or word boundary
            truncated = clean_evidence[:397]
            last_period = truncated.rfind(".")
            if last_period > 100:
                clean_evidence = truncated[: last_period + 1]
            else:
                clean_evidence = truncated.rsplit(" ", 1)[0] + "..."

        return clean_evidence

    def extract_phase3_next_steps(self, analysis_result: Any) -> List[str]:
        """Extracts list of next steps from Phase 3 data if available."""
        if analysis_result is None:
            return []
        data = analysis_result.to_dict() if hasattr(analysis_result, "to_dict") else (
            analysis_result if isinstance(analysis_result, dict) else {}
        )
        summary = data.get("summary")
        if isinstance(summary, dict) and summary.get("next_steps"):
            return list(summary["next_steps"])
        if data.get("next_steps"):
            return list(data["next_steps"])
        return []

    async def determine_outcome(
        self,
        transcript_input: Any = None,
        analysis_result: Any = None,
        call_id: Optional[str] = None,
        transcript_id: Optional[str] = None,
        raise_on_error: bool = False,
    ) -> OutcomeResult:
        """
        Determines the business outcome of a call:
        1. Validates inputs and extracts IDs.
        2. Formats transcript dialogue and Phase 3 intelligence context.
        3. Queries LLMProvider using outcome prompt.
        4. Parses and validates structured JSON.
        5. Validates outcome taxonomy, confidence, concise evidence, and next action.
        6. Returns typed OutcomeResult.
        """
        # Resolve IDs
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

        formatted_dialogue = self.format_transcript_dialogue(transcript_input)
        analysis_context = self.format_analysis_context(analysis_result)
        phase3_next_steps = self.extract_phase3_next_steps(analysis_result)

        # Handle completely empty inputs safely
        if not formatted_dialogue and (analysis_result is None or analysis_context == "No Phase 3 intelligence available."):
            return OutcomeResult(
                call_id=str(eff_call_id) if eff_call_id else None,
                transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
                outcome=OutcomeCategory.OTHER.value,
                confidence=0.0,
                evidence="Empty transcript and analysis input provided; cannot determine outcome.",
                next_action=None,
                model=getattr(self.provider, "default_model", "unknown"),
                provider=getattr(self.provider, "provider_name", "unknown"),
            )

        # Construct prompt
        dialogue_section = formatted_dialogue if formatted_dialogue else "Transcript: [Not provided, relying on Phase 3 analysis]"
        prompt = (
            f"{self._outcome_prompt}\n\n"
            f"=== PHASE 3 INTELLIGENCE CONTEXT ===\n"
            f"{analysis_context}\n\n"
            f"=== CALL TRANSCRIPT ===\n"
            f"{dialogue_section}\n"
        )

        model_name = getattr(self.provider, "default_model", "unknown")
        provider_name = getattr(self.provider, "provider_name", "unknown")

        try:
            llm_resp = await self.provider.generate(prompt)
            model_name = llm_resp.model or model_name
            provider_name = llm_resp.provider or provider_name
            raw_content = llm_resp.content
        except AIProviderError as p_err:
            logger.warning("Provider error during outcome detection: %s", p_err)
            if raise_on_error:
                raise p_err
            return OutcomeResult(
                call_id=str(eff_call_id) if eff_call_id else None,
                transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
                outcome=OutcomeCategory.OTHER.value,
                confidence=0.0,
                evidence=f"Outcome detection provider failure: {str(p_err)}",
                next_action=None,
                model=model_name,
                provider=provider_name,
            )
        except Exception as gen_err:
            logger.warning("Unexpected error during LLM generation for outcome: %s", gen_err)
            if raise_on_error:
                raise gen_err
            return OutcomeResult(
                call_id=str(eff_call_id) if eff_call_id else None,
                transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
                outcome=OutcomeCategory.OTHER.value,
                confidence=0.0,
                evidence=f"Outcome generation failure: {str(gen_err)}",
                next_action=None,
                model=model_name,
                provider=provider_name,
            )

        # Parse JSON
        try:
            parsed = clean_json_response(raw_content)
        except Exception as json_err:
            logger.warning("Failed to parse JSON response for outcome: %s", json_err)
            return OutcomeResult(
                call_id=str(eff_call_id) if eff_call_id else None,
                transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
                outcome=OutcomeCategory.OTHER.value,
                confidence=0.0,
                evidence="Model response did not contain valid structured JSON.",
                next_action=None,
                model=model_name,
                provider=provider_name,
            )

        # Validate outcome taxonomy
        raw_outcome = parsed.get("outcome")
        matched_category = OutcomeCategory.match(raw_outcome)
        outcome_val = matched_category.value

        # Validate confidence (strictly 0.0 - 1.0)
        raw_conf = parsed.get("confidence")
        confidence_val = validate_confidence(raw_conf, default=0.5)

        # Validate evidence
        raw_evidence = parsed.get("evidence", "")
        evidence_val = self.validate_and_clean_evidence(raw_evidence, outcome_val)

        # Validate next action
        raw_next_action = parsed.get("next_action")
        next_action_val = self.validate_and_clean_next_action(
            raw_next_action,
            outcome=outcome_val,
            phase3_next_steps=phase3_next_steps,
        )

        return OutcomeResult(
            call_id=str(eff_call_id) if eff_call_id else None,
            transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
            outcome=outcome_val,
            confidence=confidence_val,
            evidence=evidence_val,
            next_action=next_action_val,
            model=model_name,
            provider=provider_name,
        )

    def persist_outcome(
        self,
        outcome_result: OutcomeResult,
        repository: Optional[OutcomeRepository] = None,
        overwrite: bool = True,
    ) -> Outcome:
        """
        Persists OutcomeResult via OutcomeRepository.
        Enforces idempotency:
        - If an outcome record already exists for the call_id:
            - If overwrite=True: updates existing record.
            - If overwrite=False: raises DuplicateOutcomeError.
        - If no record exists: creates a new record.
        """
        target_repo = repository or self.repository
        if target_repo is None:
            raise ValueError("No OutcomeRepository provided for persistence.")

        if not outcome_result.call_id:
            raise ValueError("Cannot persist OutcomeResult without a valid call_id.")

        existing = target_repo.get_by_call_id(outcome_result.call_id)
        if existing:
            if not overwrite:
                raise DuplicateOutcomeError(
                    f"Outcome already exists for call_id '{outcome_result.call_id}' and overwrite=False."
                )
            update_in = OutcomeUpdate(
                outcome=outcome_result.outcome,
                confidence=outcome_result.confidence,
                evidence=outcome_result.evidence,
                next_action=outcome_result.next_action,
            )
            return target_repo.update(existing.id, update_in)

        create_in = outcome_result_to_create_schema(outcome_result)
        return target_repo.create(create_in)

    async def determine_and_persist(
        self,
        transcript_input: Any = None,
        analysis_result: Any = None,
        call_id: Optional[str] = None,
        transcript_id: Optional[str] = None,
        repository: Optional[OutcomeRepository] = None,
        overwrite: bool = True,
    ) -> OutcomeResult:
        """
        Coordinates outcome determination and subsequent database persistence.
        """
        result = await self.determine_outcome(
            transcript_input=transcript_input,
            analysis_result=analysis_result,
            call_id=call_id,
            transcript_id=transcript_id,
        )

        if result.call_id:
            target_repo = repository or self.repository
            if target_repo is not None:
                self.persist_outcome(result, repository=target_repo, overwrite=overwrite)

        return result
