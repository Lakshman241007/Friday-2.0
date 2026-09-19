"""
Unit and Contract Tests for FRIDAY AI Provider Abstraction Layer.
Verifies LLM, Transcription, and Embedding interfaces, mock implementations,
error classifications, and provider factory routing.
"""

import asyncio
import io
import math
import os
import unittest
from typing import List

from app.ai.providers import (
    # LLM
    BaseLLMProvider,
    LLMMessage,
    LLMRequest,
    LLMResponse,
    MessageRole,
    UsageInfo,
    MockLLMProvider,
    # Transcription
    AudioInput,
    BaseTranscriptionProvider,
    TranscriptSegment,
    TranscriptionResult,
    MockTranscriptionProvider,
    # Embedding
    BaseEmbeddingProvider,
    BatchEmbeddingResult,
    EmbeddingResult,
    MockEmbeddingProvider,
    # Exceptions
    AIProviderError,
    ProviderAuthenticationError,
    ProviderConfigurationError,
    ProviderInvalidResponseError,
    ProviderProcessingError,
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderUnavailableError,
    # Factory
    get_embedding_provider,
    get_llm_provider,
    get_transcription_provider,
    register_embedding_provider,
    register_llm_provider,
    register_transcription_provider,
    reset_provider_cache,
)


class TestLLMProvider(unittest.IsolatedAsyncioTestCase):
    """Verifies LLM provider interface contract and MockLLMProvider behavior."""

    async def asyncSetUp(self) -> None:
        self.provider = MockLLMProvider(default_model="test-llm")

    async def test_generate_from_simple_string(self) -> None:
        prompt = "Generate a short response."
        response = await self.provider.generate(prompt)

        self.assertIsInstance(response, LLMResponse)
        self.assertEqual(response.provider, "mock_llm")
        self.assertEqual(response.model, "test-llm")
        self.assertTrue(len(response.content) > 0)
        self.assertIsInstance(response.usage, UsageInfo)
        self.assertGreater(response.usage.prompt_tokens, 0)
        self.assertGreater(response.usage.completion_tokens, 0)
        self.assertEqual(
            response.usage.total_tokens,
            response.usage.prompt_tokens + response.usage.completion_tokens,
        )

    async def test_generate_from_messages_list(self) -> None:
        messages = [
            LLMMessage(role=MessageRole.SYSTEM, content="You are a sales coach."),
            LLMMessage(role=MessageRole.USER, content="How do I handle pricing objections?"),
        ]
        response = await self.provider.generate(messages)

        self.assertIsInstance(response, LLMResponse)
        self.assertEqual(len(self.provider.call_history), 1)
        last_req = self.provider.call_history[0]
        self.assertEqual(len(last_req.messages), 2)
        self.assertEqual(last_req.messages[0].role, MessageRole.SYSTEM)

    async def test_generate_from_structured_request(self) -> None:
        req = LLMRequest(
            prompt="Analyze this sales pitch",
            system_instruction="Be concise",
            temperature=0.7,
            max_tokens=256,
            model="custom-model",
            response_format="json",
        )
        response = await self.provider.generate(req)

        self.assertEqual(response.model, "custom-model")
        last_req = self.provider.call_history[0]
        self.assertEqual(last_req.temperature, 0.7)
        self.assertEqual(last_req.max_tokens, 256)
        self.assertEqual(last_req.response_format, "json")

    async def test_canned_response_matching(self) -> None:
        self.provider.register_canned_response("pricing", "The price is $49/seat/month.")
        response = await self.provider.generate("Tell me about your pricing plans please")

        self.assertEqual(response.content, "The price is $49/seat/month.")

    async def test_dynamic_handler(self) -> None:
        def custom_handler(req: LLMRequest) -> str:
            return f"Processed: {req.get_effective_prompt().strip()}"

        self.provider.set_dynamic_handler(custom_handler)
        response = await self.provider.generate("Echo test")
        self.assertEqual(response.content, "Processed: Echo test")

    async def test_health_check_success(self) -> None:
        is_healthy = await self.provider.health_check()
        self.assertTrue(is_healthy)

    async def test_simulated_failure(self) -> None:
        self.provider.fail_with = ProviderRateLimitError(
            "Rate limit reached", provider_name="mock_llm", retry_after_seconds=5.0
        )
        with self.assertRaises(ProviderRateLimitError) as ctx:
            await self.provider.generate("test prompt")

        self.assertTrue(ctx.exception.retryable)
        self.assertEqual(ctx.exception.retry_after_seconds, 5.0)

        is_healthy = await self.provider.health_check()
        self.assertFalse(is_healthy)


class TestTranscriptionProvider(unittest.IsolatedAsyncioTestCase):
    """Verifies Transcription provider interface contract and MockTranscriptionProvider behavior."""

    async def asyncSetUp(self) -> None:
        self.provider = MockTranscriptionProvider(default_model="test-stt")

    async def test_transcribe_audio_bytes(self) -> None:
        dummy_audio = b"RIFF....WAVEfmt ...."
        result = await self.provider.transcribe(dummy_audio)

        self.assertIsInstance(result, TranscriptionResult)
        self.assertEqual(result.provider, "mock_transcription")
        self.assertEqual(result.model, "test-stt")
        self.assertEqual(result.language, "en")
        self.assertGreater(result.duration, 0.0)
        self.assertTrue(len(result.text) > 0)
        self.assertIsInstance(result.segments, list)
        self.assertGreater(len(result.segments), 0)

        first_seg = result.segments[0]
        self.assertIsInstance(first_seg, TranscriptSegment)
        self.assertEqual(first_seg.start, 0.0)
        self.assertGreater(first_seg.end, first_seg.start)
        self.assertIn(first_seg.speaker, ["Agent", "Customer"])
        self.assertTrue(len(first_seg.text) > 0)

    async def test_transcribe_audio_input_object(self) -> None:
        audio_in = AudioInput(
            file_path="/tmp/mock_call_001.wav",
            mime_type="audio/wav",
            sample_rate=16000,
        )
        result = await self.provider.transcribe(audio_in)
        self.assertIsInstance(result, TranscriptionResult)
        self.assertEqual(self.provider.call_count, 1)

    async def test_transcribe_io_stream(self) -> None:
        stream = io.BytesIO(b"fake audio stream content")
        result = await self.provider.transcribe(stream)
        self.assertIsInstance(result, TranscriptionResult)

    async def test_transcribe_diarization_toggle(self) -> None:
        result_without_diarization = await self.provider.transcribe(
            b"fake audio", diarization=False
        )
        for seg in result_without_diarization.segments:
            self.assertIsNone(seg.speaker)

    async def test_custom_segments(self) -> None:
        custom = [
            TranscriptSegment(start=0.0, end=2.0, text="Lead contacted.", speaker="Agent"),
            TranscriptSegment(start=2.5, end=5.0, text="Interested in demo.", speaker="Customer"),
        ]
        self.provider.set_segments(custom)
        result = await self.provider.transcribe(b"audio")

        self.assertEqual(len(result.segments), 2)
        self.assertEqual(result.duration, 5.0)
        self.assertEqual(result.text, "Lead contacted. Interested in demo.")

    async def test_simulated_failure(self) -> None:
        self.provider.fail_with = ProviderTimeoutError("Audio transcription timed out")
        with self.assertRaises(ProviderTimeoutError) as ctx:
            await self.provider.transcribe(b"audio")

        self.assertTrue(ctx.exception.retryable)
        self.assertEqual(ctx.exception.status_code, 504)


class TestEmbeddingProvider(unittest.IsolatedAsyncioTestCase):
    """Verifies Embedding provider interface contract and MockEmbeddingProvider behavior."""

    async def asyncSetUp(self) -> None:
        self.provider = MockEmbeddingProvider(default_dimension=128)

    async def test_embed_single_text(self) -> None:
        text = "customer asked about pricing"
        result = await self.provider.embed(text)

        self.assertIsInstance(result, EmbeddingResult)
        self.assertEqual(result.dimension, 128)
        self.assertEqual(len(result.vector), 128)
        self.assertEqual(result.provider, "mock_embedding")

        # Verify unit normalization (L2 norm ≈ 1.0)
        norm = math.sqrt(sum(x * x for x in result.vector))
        self.assertAlmostEqual(norm, 1.0, places=4)

    async def test_deterministic_output(self) -> None:
        text = "sales qualification checklist"
        res1 = await self.provider.embed(text)
        res2 = await self.provider.embed(text)
        self.assertEqual(res1.vector, res2.vector)

        # Different text produces different vector
        res3 = await self.provider.embed("completely unrelated text")
        self.assertNotEqual(res1.vector, res3.vector)

    async def test_embed_batch(self) -> None:
        texts = [
            "schedule product demonstration",
            "contract signed by executive sponsor",
            "requested budget approval",
        ]
        batch_result = await self.provider.embed_batch(texts)

        self.assertIsInstance(batch_result, BatchEmbeddingResult)
        self.assertEqual(batch_result.count, 3)
        self.assertEqual(len(batch_result.embeddings), 3)
        self.assertEqual(len(batch_result.vectors), 3)
        for emb in batch_result.embeddings:
            self.assertEqual(emb.dimension, 128)
            norm = math.sqrt(sum(x * x for x in emb.vector))
            self.assertAlmostEqual(norm, 1.0, places=4)

    async def test_custom_dimension(self) -> None:
        result = await self.provider.embed("pricing inquiry", dimension=64)
        self.assertEqual(result.dimension, 64)
        self.assertEqual(len(result.vector), 64)

    async def test_simulated_failure(self) -> None:
        self.provider.fail_with = ProviderUnavailableError("Embedding service unreachable")
        with self.assertRaises(ProviderUnavailableError) as ctx:
            await self.provider.embed("test")

        self.assertTrue(ctx.exception.retryable)
        self.assertEqual(ctx.exception.status_code, 503)


class TestProviderFactory(unittest.IsolatedAsyncioTestCase):
    """Verifies Provider Factory resolution, registration, and fallback behavior."""

    def setUp(self) -> None:
        reset_provider_cache()
        if "FRIDAY_LLM_PROVIDER" in os.environ:
            del os.environ["FRIDAY_LLM_PROVIDER"]
        if "FRIDAY_TRANSCRIPTION_PROVIDER" in os.environ:
            del os.environ["FRIDAY_TRANSCRIPTION_PROVIDER"]
        if "FRIDAY_EMBEDDING_PROVIDER" in os.environ:
            del os.environ["FRIDAY_EMBEDDING_PROVIDER"]

    def test_default_factory_returns_mock_providers(self) -> None:
        llm = get_llm_provider()
        trans = get_transcription_provider()
        emb = get_embedding_provider()

        self.assertIsInstance(llm, BaseLLMProvider)
        self.assertEqual(llm.provider_name, "mock_llm")

        self.assertIsInstance(trans, BaseTranscriptionProvider)
        self.assertEqual(trans.provider_name, "mock_transcription")

        self.assertIsInstance(emb, BaseEmbeddingProvider)
        self.assertEqual(emb.provider_name, "mock_embedding")

    def test_environment_variable_routing(self) -> None:
        os.environ["FRIDAY_LLM_PROVIDER"] = "mock"
        llm = get_llm_provider()
        self.assertEqual(llm.provider_name, "mock_llm")

    def test_custom_provider_registration(self) -> None:
        class CustomLLM(BaseLLMProvider):
            async def generate(self, request, **kwargs):
                return LLMResponse(content="custom", model="c1", provider="custom")
            async def health_check(self):
                return True

        register_llm_provider("custom_vendor", lambda **kw: CustomLLM("custom_vendor", "c1"))
        llm = get_llm_provider("custom_vendor")
        self.assertIsInstance(llm, CustomLLM)
        self.assertEqual(llm.provider_name, "custom_vendor")

    def test_unregistered_provider_raises_configuration_error(self) -> None:
        with self.assertRaises(ProviderConfigurationError):
            get_llm_provider("non_existent_vendor")


class TestProviderExceptions(unittest.TestCase):
    """Verifies exception hierarchy and retry classification."""

    def test_exception_properties(self) -> None:
        err = ProviderRateLimitError("Too many calls", provider_name="test_ai", retry_after_seconds=10)
        self.assertTrue(err.retryable)
        self.assertEqual(err.status_code, 429)
        self.assertEqual(err.retry_after_seconds, 10)
        self.assertIn("[test_ai]", str(err))

        auth_err = ProviderAuthenticationError("Bad API key", provider_name="test_ai")
        self.assertFalse(auth_err.retryable)
        self.assertEqual(auth_err.status_code, 401)


if __name__ == "__main__":
    unittest.main()
