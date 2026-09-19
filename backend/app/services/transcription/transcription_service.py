"""
FRIDAY Transcription Service
Orchestrates audio transcription through Phase 1 BaseTranscriptionProvider,
validates timestamps and text, normalizes speaker assignments, and returns
structured, timestamped TranscriptionOutput.
"""

import io
import re
from typing import Any, Dict, List, Optional, Union

from app.ai.providers import (
    AudioInput,
    BaseTranscriptionProvider,
    TranscriptSegment,
    TranscriptionResult,
    get_transcription_provider,
)
from app.ai.providers.exceptions import AIProviderError

from .exceptions import (
    AudioUnavailableError,
    InvalidAudioError,
    InvalidSegmentError,
    InvalidTranscriptError,
    TranscriptionError,
)
from .models import (
    NormalizedTranscriptSegment,
    SpeakerRole,
    TranscriptionOutput,
    TranscriptionStatus,
)


class TranscriptionService:
    """
    Transcription orchestration service.
    Accepts audio payloads or references, invokes the configured provider,
    validates chronological and text fidelity constraints, and produces
    normalized, timestamped segment records.
    """

    def __init__(
        self,
        provider: Optional[BaseTranscriptionProvider] = None,
        default_language: str = "en",
        speaker_mapping: Optional[Dict[str, str]] = None,
    ) -> None:
        self.provider = provider or get_transcription_provider()
        self.default_language = default_language
        # Optional mapping of raw provider diarization labels to canonical roles
        # e.g., {"agent": "employee", "customer": "lead", "speaker_0": "employee"}
        self.speaker_mapping = {
            k.lower(): v.lower() for k, v in (speaker_mapping or {}).items()
        }

    def validate_audio_input(
        self,
        audio: Optional[Union[AudioInput, bytes, str, io.IOBase]],
    ) -> AudioInput:
        """
        Validates that audio is provided, not empty, and normalizes into AudioInput.
        """
        if audio is None:
            raise AudioUnavailableError("No audio payload or reference provided.")

        if isinstance(audio, AudioInput):
            if not audio.has_content():
                raise InvalidAudioError("AudioInput object contains no data, path, or URL.")
            return audio

        if isinstance(audio, bytes):
            if len(audio) == 0:
                raise InvalidAudioError("Audio byte buffer is empty (0 bytes).")
            return AudioInput(data=audio, mime_type="audio/wav")

        if isinstance(audio, str):
            clean_path = audio.strip()
            if not clean_path:
                raise InvalidAudioError("Audio path or URL cannot be blank.")
            if clean_path.startswith("http://") or clean_path.startswith("https://"):
                return AudioInput(url=clean_path, mime_type="audio/wav")
            return AudioInput(file_path=clean_path, mime_type="audio/wav")

        if isinstance(audio, io.IOBase):
            audio.seek(0)
            data = audio.read()
            if isinstance(data, str):
                data = data.encode("utf-8")
            if len(data) == 0:
                raise InvalidAudioError("Audio stream is empty.")
            return AudioInput(data=data, mime_type="audio/wav")

        raise InvalidAudioError(f"Unsupported audio reference type: {type(audio)}")

    def normalize_speaker(self, raw_speaker: Optional[str]) -> str:
        """
        Maps raw speaker diarization labels into employee, lead, or unknown.
        Does NOT invent speaker identities if unavailable.
        """
        if not raw_speaker or not str(raw_speaker).strip():
            return SpeakerRole.UNKNOWN.value

        clean = str(raw_speaker).strip().lower()

        # Check explicit custom mapping first
        if clean in self.speaker_mapping:
            return self.speaker_mapping[clean]

        # Standard canonical matches
        if clean in ("employee", "agent", "rep", "sales", "host", "speaker 0", "speaker_0", "spk_0"):
            return SpeakerRole.EMPLOYEE.value
        if clean in ("lead", "customer", "prospect", "caller", "client", "speaker 1", "speaker_1", "spk_1"):
            return SpeakerRole.LEAD.value

        # Return unknown for unmapped/unrecognized labels without fabricating
        return SpeakerRole.UNKNOWN.value

    def normalize_text(self, text: str) -> str:
        """
        Normalizes whitespace and encoding without altering verbatim words or meaning.
        """
        if not text:
            return ""
        # Collapse excessive internal whitespace and strip leading/trailing
        cleaned = re.sub(r"[ \t]+", " ", text).strip()
        return cleaned

    def normalize_and_validate_segments(
        self,
        raw_segments: List[TranscriptSegment],
        full_text: str,
    ) -> List[NormalizedTranscriptSegment]:
        """
        Validates timestamp ordering and constraints:
        - start >= 0.0
        - end >= start
        - segments sorted chronologically
        - rejects empty segments
        """
        normalized: List[NormalizedTranscriptSegment] = []

        if not raw_segments and full_text.strip():
            # If provider returned full text with no segments, create a single root segment
            normalized.append(
                NormalizedTranscriptSegment(
                    start=0.0,
                    end=0.0,
                    text=self.normalize_text(full_text),
                    speaker=SpeakerRole.UNKNOWN.value,
                    confidence=1.0,
                )
            )
            return normalized

        for idx, seg in enumerate(raw_segments):
            clean_text = self.normalize_text(seg.text)
            if not clean_text:
                # Skip empty whitespace segments
                continue

            start = float(seg.start)
            end = float(seg.end)

            if start < 0.0:
                raise InvalidSegmentError(
                    f"Segment {idx} contains negative start timestamp: {start}"
                )
            if end < 0.0:
                raise InvalidSegmentError(
                    f"Segment {idx} contains negative end timestamp: {end}"
                )
            if end < start:
                raise InvalidSegmentError(
                    f"Segment {idx} has end timestamp ({end}) prior to start timestamp ({start})."
                )

            speaker = self.normalize_speaker(seg.speaker)
            conf = float(seg.confidence) if seg.confidence is not None else None

            normalized.append(
                NormalizedTranscriptSegment(
                    start=start,
                    end=end,
                    text=clean_text,
                    speaker=speaker,
                    confidence=conf,
                    words=seg.words,
                )
            )

        # Sort chronologically by start time (and end time if starts are identical)
        normalized.sort(key=lambda s: (s.start, s.end))

        return normalized

    async def transcribe(
        self,
        audio: Union[AudioInput, bytes, str, io.IOBase],
        recording_id: str,
        call_id: Optional[str] = None,
        language: Optional[str] = None,
        diarization: bool = True,
        prompt: Optional[str] = None,
        **kwargs: Any,
    ) -> TranscriptionOutput:
        """
        Executes full transcription workflow:
        1. Validate audio input
        2. Invoke provider
        3. Validate and normalize segments and timestamps
        4. Package into structured TranscriptionOutput
        """
        norm_audio = self.validate_audio_input(audio)

        try:
            result: TranscriptionResult = await self.provider.transcribe(
                audio=norm_audio,
                language=language or self.default_language,
                diarization=diarization,
                prompt=prompt,
                **kwargs,
            )
        except AIProviderError as pe:
            # Re-raise or classify provider errors cleanly
            raise TranscriptionError(
                f"Transcription provider error: {pe.message}",
                recording_id=recording_id,
                call_id=call_id,
                details={"retryable": pe.retryable, "status_code": pe.status_code},
            ) from pe
        except Exception as ex:
            raise TranscriptionError(
                f"Unexpected transcription failure: {str(ex)}",
                recording_id=recording_id,
                call_id=call_id,
            ) from ex

        clean_text = self.normalize_text(result.text)
        norm_segments = self.normalize_and_validate_segments(result.segments, clean_text)

        if not clean_text and not norm_segments:
            raise InvalidTranscriptError(
                "Transcription provider returned completely empty transcript and segments.",
                recording_id=recording_id,
                call_id=call_id,
            )

        # If text is empty but segments exist, construct full text from segments
        if not clean_text:
            clean_text = " ".join(s.text for s in norm_segments)

        # Calculate effective duration
        eff_duration = result.duration
        if eff_duration <= 0.0 and norm_segments:
            eff_duration = max(s.end for s in norm_segments)

        return TranscriptionOutput(
            recording_id=recording_id,
            call_id=call_id,
            language=result.language or language or self.default_language,
            duration=round(eff_duration, 3),
            text=clean_text,
            segments=norm_segments,
            status=TranscriptionStatus.COMPLETED,
            model=result.model,
            provider=result.provider,
            confidence=result.confidence,
            latency_ms=result.latency_ms,
        )
