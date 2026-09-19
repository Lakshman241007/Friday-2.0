"""
FRIDAY AI Call Quality Engine Service (Phase 6).
Evaluates the quality of a completed sales/customer call across five dimensions:
- Opening
- Discovery
- Explanation
- Objection Handling
- Closing

Grounds evaluation in actual transcript evidence, Phase 3 intelligence, and Phase 5 outcome.
Calculates overall quality score strictly from applicable dimensions, excluding N/A from denominator.
Produces structured QualityResult.
"""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

from app.ai.models.analysis_model import AnalysisResult
from app.ai.models.outcome_model import OutcomeCategory, OutcomeResult
from app.ai.models.quality_model import EvidenceItem, QualityDimension, QualityResult
from app.ai.providers import BaseLLMProvider, get_llm_provider
from app.ai.providers.exceptions import AIProviderError
from app.services.ai.utils import clean_json_response, validate_score

logger = logging.getLogger("friday.ai.quality")

PROMPTS_DIR = Path(__file__).resolve().parent.parent.parent / "ai" / "prompts"


def load_prompt_template(filename: str) -> str:
    """Safely loads prompt text template from ai/prompts directory."""
    path = PROMPTS_DIR / filename
    if path.is_file():
        return path.read_text(encoding="utf-8")
    return ""


class CallQualityService:
    """
    AI Call Quality Service.
    Evaluates call execution against conversational dialogue and intelligence context.
    Evaluates Opening, Discovery, Explanation, Objection Handling, and Closing.
    Enforces strict 0-100 score normalization, N/A exclusion, and factual grounding.
    """

    def __init__(
        self,
        provider: Optional[BaseLLMProvider] = None,
        repository: Optional[Any] = None,
    ) -> None:
        self.provider = provider or get_llm_provider()
        self.repository = repository
        self._quality_prompt = load_prompt_template("quality_prompt.txt")

    def format_transcript_dialogue(self, transcript_input: Any) -> str:
        """
        Formats transcript input into clean dialogue text with speaker and timestamp attribution.
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
                    getattr(seg, "start", None)
                    if hasattr(seg, "start")
                    else (seg.get("start") if isinstance(seg, dict) else None)
                )
                if text:
                    time_prefix = f"[{float(start):.1f}s] " if start is not None else ""
                    lines.append(f"{time_prefix}{str(speaker).capitalize()}: {text}")
            if lines:
                return "\n".join(lines)

        # Fallback to text attribute
        text = getattr(transcript_input, "text", None) or (
            transcript_input.get("text") if isinstance(transcript_input, dict) else str(transcript_input)
        )
        return str(text).strip() if text else ""

    def format_analysis_context(self, analysis_result: Any) -> Tuple[str, bool]:
        """
        Formats structured intelligence from Phase 3 AnalysisResult into concise prompt context.
        Returns (formatted_context_string, has_detected_objections).
        """
        if analysis_result is None:
            return "No Phase 3 intelligence available.", False

        if hasattr(analysis_result, "to_dict"):
            data = analysis_result.to_dict()
        elif isinstance(analysis_result, dict):
            data = analysis_result
        else:
            data = {}

        lines: List[str] = []
        has_objections = False

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
            has_objections = True
            obj_desc = [
                f"[{o.get('category', 'Other')}] {o.get('description', o.get('evidence', ''))}".strip()
                for o in objections
                if isinstance(o, dict)
            ]
            if obj_desc:
                lines.append(f"- Phase 3 Detected Objections: {'; '.join(obj_desc)}")
        else:
            lines.append("- Phase 3 Detected Objections: None detected")

        # Keywords
        keywords = data.get("keywords", [])
        if keywords and isinstance(keywords, list):
            kw_list = [
                k.get("keyword", "") if isinstance(k, dict) else str(k)
                for k in keywords
            ]
            kw_list = [k for k in kw_list if k]
            if kw_list:
                lines.append(f"- Key Discussion Topics: {', '.join(kw_list[:8])}")

        # Summary
        summary_info = data.get("summary")
        if isinstance(summary_info, dict):
            sum_text = summary_info.get("summary", "")
            if sum_text:
                lines.append(f"- Call Summary: {sum_text}")

            needs = summary_info.get("customer_needs", [])
            if needs:
                lines.append(f"- Identified Customer Needs: {', '.join(needs)}")

            concerns = summary_info.get("concerns", [])
            if concerns:
                lines.append(f"- Customer Concerns: {', '.join(concerns)}")

            next_steps = summary_info.get("next_steps", [])
            if next_steps:
                lines.append(f"- Identified Next Steps: {', '.join(next_steps)}")
        elif isinstance(summary_info, str) and summary_info:
            lines.append(f"- Call Summary: {summary_info}")

        return "\n".join(lines) if lines else "No Phase 3 intelligence available.", has_objections

    def format_outcome_context(self, outcome_result: Any) -> str:
        """
        Formats Phase 5 OutcomeResult into contextual information.
        Reinforces that customer outcome is context, not quality score.
        """
        if outcome_result is None:
            return "No Phase 5 outcome data available."

        if hasattr(outcome_result, "to_dict"):
            data = outcome_result.to_dict()
        elif isinstance(outcome_result, dict):
            data = outcome_result
        else:
            data = {}

        outcome = data.get("outcome", "Unknown")
        confidence = data.get("confidence", 0.0)
        evidence = data.get("evidence", "")
        next_action = data.get("next_action")

        lines = [
            f"- Determined Outcome: {outcome} (confidence: {confidence})",
            f"- Outcome Evidence: {evidence}",
        ]
        if next_action:
            lines.append(f"- Recorded Next Action: {next_action}")
        lines.append(
            "(Note: This business outcome describes what the customer decided. "
            "Call Quality evaluates how skillfully the employee executed the conversation.)"
        )
        return "\n".join(lines)

    def clean_evidence_item(self, raw_item: Any) -> Optional[EvidenceItem]:
        """
        Validates and cleans an evidence item.
        Ensures timestamp is non-negative float (or None), speaker is string, and text is concise.
        """
        if raw_item is None:
            return None

        if isinstance(raw_item, str):
            text = raw_item.strip()
            if not text:
                return None
            return EvidenceItem(text=text[:300])

        if not isinstance(raw_item, dict):
            return None

        text = str(raw_item.get("text", "")).strip()
        if not text:
            return None

        # Clean any chain-of-thought labels
        text = text.replace("Reasoning:", "").replace("Thought:", "").strip()

        # Validate timestamp
        raw_ts = raw_item.get("timestamp")
        timestamp: Optional[float] = None
        if raw_ts is not None:
            try:
                parsed_ts = float(raw_ts)
                if parsed_ts >= 0.0:
                    timestamp = round(parsed_ts, 2)
            except (ValueError, TypeError):
                timestamp = None

        # Speaker
        raw_speaker = raw_item.get("speaker")
        speaker = str(raw_speaker).strip().lower() if raw_speaker else None
        if speaker and speaker not in {"employee", "lead", "agent", "customer", "caller"}:
            speaker = speaker[:30]

        return EvidenceItem(
            text=text[:300],
            timestamp=timestamp,
            speaker=speaker,
        )

    def validate_dimension(
        self,
        dim_name: str,
        raw_dim: Any,
        has_phase3_objections: bool = False,
    ) -> QualityDimension:
        """
        Validates a single quality dimension.
        Enforces:
        - applicable boolean flag.
        - score in [0.0, 100.0] if applicable, or None if inapplicable.
        - special rule: if dim_name is 'objection_handling' and raw indicates not applicable or no objections occurred, score is None.
        - lists of strengths, weaknesses, and evidence.
        """
        if not isinstance(raw_dim, dict):
            return QualityDimension(
                applicable=False,
                score=None,
                strengths=[],
                weaknesses=[f"Could not evaluate {dim_name} due to missing structured output."],
                evidence=[],
            )

        raw_applicable = raw_dim.get("applicable", True)
        applicable = bool(raw_applicable)

        # Objection handling special case:
        if dim_name == "objection_handling" and not applicable:
            return QualityDimension(
                applicable=False,
                score=None,
                strengths=[],
                weaknesses=[],
                evidence=[],
            )

        score: Optional[float] = None
        if applicable:
            raw_score = raw_dim.get("score")
            score = validate_score(raw_score, default=70.0, clamp=True)
            if score is None:
                applicable = False

        # Parse strengths
        raw_strengths = raw_dim.get("strengths", [])
        strengths: List[str] = []
        if isinstance(raw_strengths, list):
            for s in raw_strengths:
                s_str = str(s).strip()
                if s_str and s_str.lower() not in {"none", "n/a", "null"}:
                    strengths.append(s_str[:255])

        # Parse weaknesses
        raw_weaknesses = raw_dim.get("weaknesses", [])
        weaknesses: List[str] = []
        if isinstance(raw_weaknesses, list):
            for w in raw_weaknesses:
                w_str = str(w).strip()
                if w_str and w_str.lower() not in {"none", "n/a", "null"}:
                    weaknesses.append(w_str[:255])

        # Parse evidence
        raw_evidence = raw_dim.get("evidence", [])
        evidence_items: List[EvidenceItem] = []
        if isinstance(raw_evidence, list):
            for e in raw_evidence:
                item = self.clean_evidence_item(e)
                if item:
                    evidence_items.append(item)

        return QualityDimension(
            applicable=applicable,
            score=score,
            strengths=strengths,
            weaknesses=weaknesses,
            evidence=evidence_items,
        )

    def calculate_overall_score(
        self,
        dimensions: List[QualityDimension],
    ) -> Optional[float]:
        """
        Calculates the overall quality score strictly from applicable dimensions.
        Inapplicable dimensions (e.g. objection handling when no objection occurred)
        are excluded from the denominator.
        """
        applicable_scores = [d.score for d in dimensions if d.applicable and d.score is not None]
        if not applicable_scores:
            return None
        return round(sum(applicable_scores) / len(applicable_scores), 2)

    async def evaluate_quality(
        self,
        transcript_input: Any = None,
        analysis_result: Any = None,
        outcome_result: Any = None,
        call_id: Optional[str] = None,
        transcript_id: Optional[str] = None,
    ) -> QualityResult:
        """
        Evaluates the quality of the call across all 5 dimensions.
        1. Formats dialogue and supporting intelligence.
        2. Queries LLMProvider using quality prompt.
        3. Parses and validates dimension scores, strengths, weaknesses, and evidence.
        4. Calculates overall score excluding N/A dimensions.
        5. Returns structured QualityResult.
        """
        # Resolve IDs
        eff_call_id = (
            call_id
            or getattr(transcript_input, "call_id", None)
            or getattr(analysis_result, "call_id", None)
            or getattr(outcome_result, "call_id", None)
        )
        if eff_call_id is None and isinstance(transcript_input, dict):
            eff_call_id = transcript_input.get("call_id")
        if eff_call_id is None and isinstance(analysis_result, dict):
            eff_call_id = analysis_result.get("call_id")
        if eff_call_id is None and isinstance(outcome_result, dict):
            eff_call_id = outcome_result.get("call_id")

        eff_transcript_id = (
            transcript_id
            or getattr(transcript_input, "id", None)
            or getattr(transcript_input, "transcript_id", None)
            or getattr(analysis_result, "transcript_id", None)
            or getattr(outcome_result, "transcript_id", None)
        )
        if eff_transcript_id is None and isinstance(transcript_input, dict):
            eff_transcript_id = transcript_input.get("id") or transcript_input.get("transcript_id")

        formatted_dialogue = self.format_transcript_dialogue(transcript_input)
        analysis_context, has_phase3_objections = self.format_analysis_context(analysis_result)
        outcome_context = self.format_outcome_context(outcome_result)

        model_name = getattr(self.provider, "default_model", "unknown")
        provider_name = getattr(self.provider, "provider_name", "unknown")

        # Handle empty transcript safely
        if not formatted_dialogue:
            na_dim = QualityDimension(applicable=False, score=None, strengths=[], weaknesses=[], evidence=[])
            return QualityResult(
                call_id=str(eff_call_id) if eff_call_id else None,
                transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
                overall_score=None,
                opening=na_dim,
                discovery=na_dim,
                explanation=na_dim,
                objection_handling=na_dim,
                closing=na_dim,
                strengths=[],
                weaknesses=["No conversational transcript provided to evaluate call quality."],
                evidence=[],
                model=model_name,
                provider=provider_name,
            )

        # Construct prompt
        prompt = (
            f"{self._quality_prompt}\n\n"
            f"=== PHASE 3 INTELLIGENCE CONTEXT ===\n"
            f"{analysis_context}\n\n"
            f"=== PHASE 5 OUTCOME CONTEXT ===\n"
            f"{outcome_context}\n\n"
            f"=== CALL TRANSCRIPT ===\n"
            f"{formatted_dialogue}\n"
        )

        try:
            llm_resp = await self.provider.generate(prompt)
            model_name = llm_resp.model or model_name
            provider_name = llm_resp.provider or provider_name
            raw_content = llm_resp.content
        except AIProviderError as p_err:
            logger.warning("Provider error during call quality evaluation: %s", p_err)
            na_dim = QualityDimension(applicable=False, score=None, strengths=[], weaknesses=[], evidence=[])
            return QualityResult(
                call_id=str(eff_call_id) if eff_call_id else None,
                transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
                overall_score=None,
                opening=na_dim,
                discovery=na_dim,
                explanation=na_dim,
                objection_handling=na_dim,
                closing=na_dim,
                strengths=[],
                weaknesses=[f"Quality evaluation provider error: {str(p_err)}"],
                evidence=[],
                model=model_name,
                provider=provider_name,
            )
        except Exception as gen_err:
            logger.warning("Unexpected error during LLM generation for call quality: %s", gen_err)
            na_dim = QualityDimension(applicable=False, score=None, strengths=[], weaknesses=[], evidence=[])
            return QualityResult(
                call_id=str(eff_call_id) if eff_call_id else None,
                transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
                overall_score=None,
                opening=na_dim,
                discovery=na_dim,
                explanation=na_dim,
                objection_handling=na_dim,
                closing=na_dim,
                strengths=[],
                weaknesses=[f"Quality evaluation generation error: {str(gen_err)}"],
                evidence=[],
                model=model_name,
                provider=provider_name,
            )

        # Parse JSON
        try:
            parsed = clean_json_response(raw_content)
        except Exception as json_err:
            logger.warning("Failed to parse JSON response for call quality: %s", json_err)
            na_dim = QualityDimension(applicable=False, score=None, strengths=[], weaknesses=[], evidence=[])
            return QualityResult(
                call_id=str(eff_call_id) if eff_call_id else None,
                transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
                overall_score=None,
                opening=na_dim,
                discovery=na_dim,
                explanation=na_dim,
                objection_handling=na_dim,
                closing=na_dim,
                strengths=[],
                weaknesses=["Model response did not contain valid structured quality JSON."],
                evidence=[],
                model=model_name,
                provider=provider_name,
            )

        # Validate dimensions
        opening_dim = self.validate_dimension("opening", parsed.get("opening", {}))
        discovery_dim = self.validate_dimension("discovery", parsed.get("discovery", {}))
        explanation_dim = self.validate_dimension("explanation", parsed.get("explanation", {}))
        objection_dim = self.validate_dimension(
            "objection_handling",
            parsed.get("objection_handling", {}),
            has_phase3_objections=has_phase3_objections,
        )
        closing_dim = self.validate_dimension("closing", parsed.get("closing", {}))

        # Calculate overall score strictly over applicable dimensions
        all_dims = [opening_dim, discovery_dim, explanation_dim, objection_dim, closing_dim]
        overall_score = self.calculate_overall_score(all_dims)

        # Root-level strengths and weaknesses
        root_strengths: List[str] = []
        raw_root_s = parsed.get("strengths", [])
        if isinstance(raw_root_s, list):
            for s in raw_root_s:
                s_str = str(s).strip()
                if s_str and s_str not in root_strengths:
                    root_strengths.append(s_str[:255])
        if not root_strengths:
            # Aggregate from dimensions
            for d in all_dims:
                for s in d.strengths:
                    if s not in root_strengths:
                        root_strengths.append(s)

        root_weaknesses: List[str] = []
        raw_root_w = parsed.get("weaknesses", [])
        if isinstance(raw_root_w, list):
            for w in raw_root_w:
                w_str = str(w).strip()
                if w_str and w_str not in root_weaknesses:
                    root_weaknesses.append(w_str[:255])
        if not root_weaknesses:
            for d in all_dims:
                for w in d.weaknesses:
                    if w not in root_weaknesses:
                        root_weaknesses.append(w)

        # Root-level evidence
        root_evidence: List[EvidenceItem] = []
        raw_root_e = parsed.get("evidence", [])
        if isinstance(raw_root_e, list):
            for e in raw_root_e:
                item = self.clean_evidence_item(e)
                if item:
                    root_evidence.append(item)
        if not root_evidence:
            for d in all_dims:
                for e in d.evidence:
                    root_evidence.append(e)

        return QualityResult(
            call_id=str(eff_call_id) if eff_call_id else None,
            transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
            overall_score=overall_score,
            opening=opening_dim,
            discovery=discovery_dim,
            explanation=explanation_dim,
            objection_handling=objection_dim,
            closing=closing_dim,
            strengths=root_strengths,
            weaknesses=root_weaknesses,
            evidence=root_evidence,
            model=model_name,
            provider=provider_name,
        )

    def persist_quality(
        self,
        quality_result: QualityResult,
        repository: Optional[Any] = None,
        overwrite: bool = True,
    ) -> Any:
        """
        Persists QualityResult via QualityRepository if configured.
        Maintains decoupling: CallQualityService -> QualityResult -> QualityRepository.
        """
        target_repo = repository or self.repository
        if target_repo is None:
            raise ValueError("No QualityRepository provided for persistence.")

        if not quality_result.call_id:
            raise ValueError("Cannot persist QualityResult without a call_id.")

        if hasattr(target_repo, "save_quality"):
            return target_repo.save_quality(quality_result, overwrite=overwrite)
        elif hasattr(target_repo, "create"):
            return target_repo.create(quality_result)
        else:
            raise AttributeError("Target repository does not support quality persistence.")

    async def evaluate_and_persist(
        self,
        transcript_input: Any = None,
        analysis_result: Any = None,
        outcome_result: Any = None,
        call_id: Optional[str] = None,
        transcript_id: Optional[str] = None,
        repository: Optional[Any] = None,
        overwrite: bool = True,
    ) -> QualityResult:
        """
        Evaluates quality and persists if repository is configured.
        """
        result = await self.evaluate_quality(
            transcript_input=transcript_input,
            analysis_result=analysis_result,
            outcome_result=outcome_result,
            call_id=call_id,
            transcript_id=transcript_id,
        )

        target_repo = repository or self.repository
        if target_repo is not None and result.call_id:
            self.persist_quality(result, repository=target_repo, overwrite=overwrite)

        return result
