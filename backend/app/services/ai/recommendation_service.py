"""
FRIDAY AI Recommendation Engine Service (Phase 7).
Transforms intelligence from:
- Phase 3: Intent, Sentiment, Objections, Keywords, Summary, Customer Needs, Concerns, Next Steps
- Phase 5: Business Outcome, Outcome Confidence, Evidence, Next Action
- Phase 6: Call Quality (Opening, Discovery, Explanation, Objection Handling, Closing), Weaknesses, Strengths
- Dialogue Transcript

Into actionable, evidence-based recommendations categorized by taxonomy and priority.
Deduplicates semantically similar recommendations and avoids recommendation spam.
Enforces strict grounding: excellent calls produce zero or minimal recommendations without artificial weaknesses.
"""

import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

from app.ai.models.analysis_model import AnalysisResult
from app.ai.models.outcome_model import OutcomeResult
from app.ai.models.quality_model import EvidenceItem, QualityDimension, QualityResult
from app.ai.models.recommendation_model import (
    PriorityLevel,
    RecommendationItem,
    RecommendationResult,
    RecommendationSource,
    RecommendationType,
)
from app.ai.providers import BaseLLMProvider, get_llm_provider
from app.ai.providers.exceptions import AIProviderError
from app.services.ai.utils import clean_json_response

logger = logging.getLogger("friday.ai.recommendation")

PROMPTS_DIR = Path(__file__).resolve().parent.parent.parent / "ai" / "prompts"

VALID_TYPES: Set[str] = {t.value for t in RecommendationType}
VALID_PRIORITIES: Set[str] = {p.value for p in PriorityLevel}
VALID_SOURCES: Set[str] = {s.value for s in RecommendationSource}


def load_prompt_template(filename: str) -> str:
    """Safely loads prompt text template from ai/prompts directory."""
    path = PROMPTS_DIR / filename
    if path.is_file():
        return path.read_text(encoding="utf-8")
    return ""


class RecommendationService:
    """
    AI Recommendation Service (Phase 7).
    Synthesizes conversational intelligence from Phase 3, Phase 5, and Phase 6 into
    prioritized, actionable recommendations.
    """

    def __init__(
        self,
        provider: Optional[BaseLLMProvider] = None,
        repository: Optional[Any] = None,
    ) -> None:
        self.provider = provider or get_llm_provider()
        self.repository = repository
        self._prompt_template = load_prompt_template("recommendation_prompt.txt")

    def format_phase3_context(self, analysis_result: Any) -> str:
        """Formats Phase 3 AnalysisResult into concise prompt context."""
        if analysis_result is None:
            return "No Phase 3 intelligence available."

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
            lines.append(f"- Customer Intent: {label}")
        elif intent_info:
            lines.append(f"- Customer Intent: {intent_info}")

        # Sentiment
        sentiment_info = data.get("sentiment")
        if isinstance(sentiment_info, dict):
            label = sentiment_info.get("sentiment") or sentiment_info.get("label", "Unknown")
            lines.append(f"- Customer Sentiment: {label}")
        elif sentiment_info:
            lines.append(f"- Customer Sentiment: {sentiment_info}")

        # Objections
        objections = data.get("objections", [])
        if objections and isinstance(objections, list):
            obj_list = []
            for o in objections:
                if isinstance(o, dict):
                    cat = o.get("category", "Other")
                    desc = o.get("description", o.get("evidence", ""))
                    obj_list.append(f"[{cat}] {desc}".strip())
            if obj_list:
                lines.append(f"- Detected Objections: {'; '.join(obj_list)}")
        else:
            lines.append("- Detected Objections: None")

        # Summary, Needs, Concerns, Next steps
        summary_info = data.get("summary")
        if isinstance(summary_info, dict):
            if summary_info.get("summary"):
                lines.append(f"- Summary: {summary_info['summary']}")
            needs = summary_info.get("customer_needs", [])
            if needs:
                lines.append(f"- Customer Needs: {', '.join(needs)}")
            concerns = summary_info.get("concerns", [])
            if concerns:
                lines.append(f"- Customer Concerns: {', '.join(concerns)}")
            next_steps = summary_info.get("next_steps", [])
            if next_steps:
                lines.append(f"- Identified Next Steps: {', '.join(next_steps)}")
        elif isinstance(summary_info, str) and summary_info:
            lines.append(f"- Summary: {summary_info}")

        return "\n".join(lines) if lines else "No Phase 3 intelligence available."

    def format_phase5_context(self, outcome_result: Any) -> str:
        """Formats Phase 5 OutcomeResult into concise prompt context."""
        if outcome_result is None:
            return "No Phase 5 outcome available."

        if hasattr(outcome_result, "to_dict"):
            data = outcome_result.to_dict()
        elif isinstance(outcome_result, dict):
            data = outcome_result
        else:
            data = {}

        outcome = data.get("outcome", "Unknown")
        evidence = data.get("evidence", "")
        next_action = data.get("next_action")

        lines = [
            f"- Determined Outcome: {outcome}",
            f"- Outcome Evidence: {evidence}",
        ]
        if next_action:
            lines.append(f"- Action Required: {next_action}")

        return "\n".join(lines)

    def format_phase6_context(self, quality_result: Any) -> Tuple[str, bool]:
        """
        Formats Phase 6 QualityResult into concise prompt context.
        Returns (formatted_text, is_all_high_quality).
        """
        if quality_result is None:
            return "No Phase 6 call quality data available.", False

        if hasattr(quality_result, "to_dict"):
            data = quality_result.to_dict()
        elif isinstance(quality_result, dict):
            data = quality_result
        else:
            data = {}

        lines: List[str] = []
        overall_score = data.get("overall_score")
        if overall_score is not None:
            lines.append(f"- Overall Quality Score: {overall_score}/100")

        # Dimensions
        dim_names = ["opening", "discovery", "explanation", "objection_handling", "closing"]
        all_high = overall_score is not None and overall_score >= 88.0

        for name in dim_names:
            dim = data.get(name)
            if isinstance(dim, dict):
                applicable = dim.get("applicable", True)
                score = dim.get("score")
                weaknesses = dim.get("weaknesses", [])
                strengths = dim.get("strengths", [])

                if not applicable:
                    lines.append(f"- {name.replace('_', ' ').title()}: Not Applicable (N/A)")
                else:
                    score_str = f"{score}/100" if score is not None else "N/A"
                    desc = f"- {name.replace('_', ' ').title()}: Score {score_str}"
                    if weaknesses:
                        desc += f" | Gaps: {'; '.join(weaknesses[:2])}"
                    elif strengths:
                        desc += f" | Strengths: {'; '.join(strengths[:1])}"
                    lines.append(desc)

                    if score is not None and score < 75.0:
                        all_high = False

        # Overall weaknesses
        weaknesses = data.get("weaknesses", [])
        if weaknesses and isinstance(weaknesses, list):
            lines.append(f"- Primary Quality Gaps: {'; '.join(weaknesses[:4])}")

        return "\n".join(lines) if lines else "No Phase 6 call quality data available.", all_high

    def format_transcript(self, transcript_input: Any) -> str:
        """Extracts and formats dialogue lines from transcript input."""
        if transcript_input is None:
            return ""
        if isinstance(transcript_input, str):
            return transcript_input.strip()

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

        text = getattr(transcript_input, "text", None) or (
            transcript_input.get("text") if isinstance(transcript_input, dict) else str(transcript_input)
        )
        return str(text).strip() if text else ""

    def validate_type(self, raw_type: Any) -> Optional[str]:
        """Validates recommendation type against taxonomy; attempts tolerant normalization."""
        if not raw_type:
            return None
        t_clean = str(raw_type).strip()

        # Direct exact match
        for vt in VALID_TYPES:
            if t_clean.lower() == vt.lower():
                return vt

        # Synonym / tolerant mapping
        lower = t_clean.lower()
        if "follow" in lower:
            return RecommendationType.FOLLOW_UP.value
        if "discovery" in lower or "question" in lower or "probe" in lower:
            return RecommendationType.DISCOVERY.value
        if "objection" in lower or "concern" in lower:
            return RecommendationType.OBJECTION_HANDLING.value
        if "product" in lower or "explanation" in lower or "feature" in lower or "solution" in lower:
            return RecommendationType.PRODUCT_EXPLANATION.value
        if "close" in lower or "closing" in lower or "next step" in lower:
            return RecommendationType.CLOSING.value
        if "communication" in lower or "listen" in lower or "tone" in lower or "interrupt" in lower:
            return RecommendationType.COMMUNICATION.value
        if "engagement" in lower or "rapport" in lower:
            return RecommendationType.CUSTOMER_ENGAGEMENT.value
        if "process" in lower or "sales" in lower or "qualif" in lower:
            return RecommendationType.SALES_PROCESS.value

        return RecommendationType.GENERAL_IMPROVEMENT.value

    def validate_priority(self, raw_priority: Any, fallback: str = "medium") -> str:
        """Validates priority to high, medium, or low."""
        if not raw_priority:
            return fallback
        p_clean = str(raw_priority).strip().lower()
        if p_clean in VALID_PRIORITIES:
            return p_clean
        return fallback

    def validate_source(self, raw_source: Any) -> str:
        """Validates recommendation source."""
        if not raw_source:
            return RecommendationSource.HYBRID.value
        s_clean = str(raw_source).strip().lower()
        if s_clean in VALID_SOURCES:
            return s_clean
        return RecommendationSource.HYBRID.value

    def clean_evidence_list(self, raw_evidence: Any) -> List[EvidenceItem]:
        """Cleans and validates list of evidence items."""
        if not raw_evidence or not isinstance(raw_evidence, list):
            return []

        cleaned: List[EvidenceItem] = []
        for item in raw_evidence:
            if isinstance(item, str):
                text = item.strip()
                if text:
                    cleaned.append(EvidenceItem(text=text[:300]))
            elif isinstance(item, dict):
                text = str(item.get("text", "")).strip()
                if not text:
                    continue
                # Timestamp
                ts_val = item.get("timestamp")
                ts: Optional[float] = None
                if ts_val is not None:
                    try:
                        f_ts = float(ts_val)
                        if f_ts >= 0.0:
                            ts = round(f_ts, 2)
                    except (ValueError, TypeError):
                        ts = None

                speaker = item.get("speaker")
                spk = str(speaker).strip().lower() if speaker else None
                cleaned.append(EvidenceItem(text=text[:300], timestamp=ts, speaker=spk))
        return cleaned

    def deduplicate_recommendations(
        self,
        recommendations: List[RecommendationItem],
    ) -> List[RecommendationItem]:
        """
        Deduplicates recommendations that address the same underlying subject and type.
        Maintains order while filtering out semantic duplicates.
        """
        deduped: List[RecommendationItem] = []

        for rec in recommendations:
            rec_words = {
                w for w in re.sub(r"[^\w\s]", " ", rec.recommendation.lower()).split()
                if len(w) > 2
            }
            is_duplicate = False
            for existing in deduped:
                if existing.type == rec.type:
                    existing_words = {
                        w for w in re.sub(r"[^\w\s]", " ", existing.recommendation.lower()).split()
                        if len(w) > 2
                    }
                    if not rec_words or not existing_words:
                        continue
                    intersection = rec_words.intersection(existing_words)
                    union = rec_words.union(existing_words)
                    jaccard = len(intersection) / len(union) if union else 0.0
                    # Overlap ratio relative to the smaller set
                    overlap = len(intersection) / min(len(rec_words), len(existing_words))
                    if jaccard >= 0.5 or overlap >= 0.65:
                        is_duplicate = True
                        break
            if not is_duplicate:
                deduped.append(rec)

        return deduped

    def generate_deterministic_rules(
        self,
        outcome_result: Any,
        quality_result: Any,
    ) -> List[RecommendationItem]:
        """
        Deterministic rule checks to guarantee critical follow-up or closing actions
        are not omitted when strong signals exist in Phase 5 or Phase 6.
        """
        rules_recs: List[RecommendationItem] = []

        # 1. High priority follow-up requested in Phase 5
        if outcome_result:
            if hasattr(outcome_result, "to_dict"):
                out_data = outcome_result.to_dict()
            elif isinstance(outcome_result, dict):
                out_data = outcome_result
            else:
                out_data = {}

            outcome_label = str(out_data.get("outcome", "")).lower()
            next_action = out_data.get("next_action")
            evidence_str = out_data.get("evidence", "")

            if next_action and ("callback" in outcome_label or "follow-up" in outcome_label or "follow" in outcome_label):
                rules_recs.append(
                    RecommendationItem(
                        type=RecommendationType.FOLLOW_UP.value,
                        priority=PriorityLevel.HIGH.value,
                        recommendation=f"Complete the requested follow-up: {next_action}",
                        reason="Customer requested explicit follow-up callback or information.",
                        evidence=[EvidenceItem(text=evidence_str[:250])] if evidence_str else [],
                        source=RecommendationSource.OUTCOME.value,
                        suggested_action=next_action,
                    )
                )

        # 2. Closing gap in Phase 6 with low score
        if quality_result:
            if hasattr(quality_result, "to_dict"):
                q_data = quality_result.to_dict()
            elif isinstance(quality_result, dict):
                q_data = quality_result
            else:
                q_data = {}

            closing_dim = q_data.get("closing", {})
            if isinstance(closing_dim, dict) and closing_dim.get("applicable", True):
                c_score = closing_dim.get("score")
                if c_score is not None and c_score < 60.0:
                    weaknesses = closing_dim.get("weaknesses", [])
                    reason = (
                        weaknesses[0]
                        if weaknesses
                        else "Call ended without clearly confirming agreed next steps or timing."
                    )
                    rules_recs.append(
                        RecommendationItem(
                            type=RecommendationType.CLOSING.value,
                            priority=PriorityLevel.MEDIUM.value,
                            recommendation="Conclude the call by explicitly stating and confirming agreed next steps with the customer.",
                            reason=reason,
                            evidence=[],
                            source=RecommendationSource.QUALITY.value,
                            suggested_action="Confirm next action, date, and time before disconnecting.",
                        )
                    )

        return rules_recs

    async def generate_recommendations(
        self,
        transcript_input: Any = None,
        analysis_result: Any = None,
        outcome_result: Any = None,
        quality_result: Any = None,
        call_id: Optional[str] = None,
        transcript_id: Optional[str] = None,
    ) -> RecommendationResult:
        """
        Generates actionable recommendations synthesizing:
        - Phase 3 AnalysisResult
        - Phase 5 OutcomeResult
        - Phase 6 QualityResult
        - Dialogue Transcript
        """
        # Resolve IDs
        eff_call_id = (
            call_id
            or getattr(transcript_input, "call_id", None)
            or getattr(analysis_result, "call_id", None)
            or getattr(outcome_result, "call_id", None)
            or getattr(quality_result, "call_id", None)
        )
        if eff_call_id is None and isinstance(transcript_input, dict):
            eff_call_id = transcript_input.get("call_id")
        if eff_call_id is None and isinstance(analysis_result, dict):
            eff_call_id = analysis_result.get("call_id")
        if eff_call_id is None and isinstance(outcome_result, dict):
            eff_call_id = outcome_result.get("call_id")
        if eff_call_id is None and isinstance(quality_result, dict):
            eff_call_id = quality_result.get("call_id")

        eff_transcript_id = (
            transcript_id
            or getattr(transcript_input, "id", None)
            or getattr(transcript_input, "transcript_id", None)
            or getattr(analysis_result, "transcript_id", None)
            or getattr(outcome_result, "transcript_id", None)
            or getattr(quality_result, "transcript_id", None)
        )
        if eff_transcript_id is None and isinstance(transcript_input, dict):
            eff_transcript_id = transcript_input.get("id") or transcript_input.get("transcript_id")

        p3_context = self.format_phase3_context(analysis_result)
        p5_context = self.format_phase5_context(outcome_result)
        p6_context, is_flawless = self.format_phase6_context(quality_result)
        formatted_dialogue = self.format_transcript(transcript_input)

        model_name = getattr(self.provider, "default_model", "unknown")
        provider_name = getattr(self.provider, "provider_name", "unknown")

        # Deterministic baseline candidates
        deterministic_recs = self.generate_deterministic_rules(outcome_result, quality_result)

        # Check for empty inputs or completely missing conversation context
        if not formatted_dialogue and p3_context.startswith("No Phase 3") and p5_context.startswith("No Phase 5") and p6_context.startswith("No Phase 6") and not eff_call_id and not eff_transcript_id:
            return RecommendationResult(
                call_id=str(eff_call_id) if eff_call_id else None,
                transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
                recommendations=[],
                model=model_name,
                provider=provider_name,
            )

        # Construct prompt
        prompt = (
            f"{self._prompt_template}\n\n"
            f"=== PHASE 3 CONTEXT ===\n{p3_context}\n\n"
            f"=== PHASE 5 OUTCOME CONTEXT ===\n{p5_context}\n\n"
            f"=== PHASE 6 QUALITY CONTEXT ===\n{p6_context}\n\n"
            f"=== TRANSCRIPT ===\n{formatted_dialogue if formatted_dialogue else 'Transcript text unavailable.'}\n"
        )

        llm_recs: List[RecommendationItem] = []

        try:
            llm_resp = await self.provider.generate(prompt)
            model_name = llm_resp.model or model_name
            provider_name = llm_resp.provider or provider_name
            raw_content = llm_resp.content

            parsed = clean_json_response(raw_content)
            raw_items = parsed.get("recommendations", [])
            if isinstance(raw_items, list):
                for item in raw_items:
                    if not isinstance(item, dict):
                        continue

                    rec_text = str(item.get("recommendation", "")).strip()
                    if not rec_text:
                        continue

                    # Validate type
                    rec_type = self.validate_type(item.get("type"))
                    if not rec_type:
                        continue

                    # Priority
                    priority = self.validate_priority(item.get("priority"))

                    # Reason
                    reason = str(item.get("reason", "")).strip() or "Identified from conversation review."

                    # Evidence
                    evidence = self.clean_evidence_list(item.get("evidence", []))

                    # Source
                    source = self.validate_source(item.get("source"))

                    # Suggested action
                    suggested_action = item.get("suggested_action")
                    if suggested_action:
                        suggested_action = str(suggested_action).strip()

                    llm_recs.append(
                        RecommendationItem(
                            type=rec_type,
                            priority=priority,
                            recommendation=rec_text,
                            reason=reason,
                            evidence=evidence,
                            source=source,
                            suggested_action=suggested_action,
                        )
                    )
        except AIProviderError as p_err:
            logger.warning("Provider error during recommendation generation: %s", p_err)
            # Graceful fallback: return deterministic recommendations if available
            return RecommendationResult(
                call_id=str(eff_call_id) if eff_call_id else None,
                transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
                recommendations=deterministic_recs,
                model=model_name,
                provider=provider_name,
            )
        except Exception as err:
            logger.warning("Error during recommendation generation or parsing: %s", err)
            # Fallback to deterministic rules
            return RecommendationResult(
                call_id=str(eff_call_id) if eff_call_id else None,
                transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
                recommendations=deterministic_recs,
                model=model_name,
                provider=provider_name,
            )

        # Merge LLM recommendations with deterministic recommendations if LLM omitted that critical category
        llm_types = {r.type for r in llm_recs}
        complementary_deterministic = [
            dr for dr in deterministic_recs if dr.type not in llm_types
        ]
        merged = llm_recs + complementary_deterministic

        # Deduplicate recommendations
        deduped = self.deduplicate_recommendations(merged)

        # Handle excellent calls: if call was flawless and no follow-up was requested, keep empty or minimal
        if is_flawless and not any(r.type == RecommendationType.FOLLOW_UP.value for r in deduped):
            # Only keep very high-confidence follow-ups if present, clear synthetic critique
            deduped = [r for r in deduped if r.type == RecommendationType.FOLLOW_UP.value]

        return RecommendationResult(
            call_id=str(eff_call_id) if eff_call_id else None,
            transcript_id=str(eff_transcript_id) if eff_transcript_id else None,
            recommendations=deduped[:6],  # Cap at 6 high-value recommendations to prevent spam
            model=model_name,
            provider=provider_name,
        )

    def persist_recommendations(
        self,
        recommendation_result: RecommendationResult,
        repository: Optional[Any] = None,
        overwrite: bool = True,
    ) -> Any:
        """
        Persists RecommendationResult if a repository is provided.
        Maintains decoupling: RecommendationService -> RecommendationResult -> RecommendationRepository.
        """
        target_repo = repository or self.repository
        if target_repo is None:
            raise ValueError("No RecommendationRepository provided for persistence.")

        if not recommendation_result.call_id:
            raise ValueError("Cannot persist RecommendationResult without a call_id.")

        if hasattr(target_repo, "save_recommendations"):
            return target_repo.save_recommendations(recommendation_result, overwrite=overwrite)
        elif hasattr(target_repo, "create"):
            return target_repo.create(recommendation_result)
        else:
            raise AttributeError("Target repository does not support recommendation persistence.")

    async def generate_and_persist(
        self,
        transcript_input: Any = None,
        analysis_result: Any = None,
        outcome_result: Any = None,
        quality_result: Any = None,
        call_id: Optional[str] = None,
        transcript_id: Optional[str] = None,
        repository: Optional[Any] = None,
        overwrite: bool = True,
    ) -> RecommendationResult:
        """
        Generates recommendations and persists via repository if configured.
        """
        result = await self.generate_recommendations(
            transcript_input=transcript_input,
            analysis_result=analysis_result,
            outcome_result=outcome_result,
            quality_result=quality_result,
            call_id=call_id,
            transcript_id=transcript_id,
        )

        target_repo = repository or self.repository
        if target_repo is not None and result.call_id:
            self.persist_recommendations(result, repository=target_repo, overwrite=overwrite)

        return result
