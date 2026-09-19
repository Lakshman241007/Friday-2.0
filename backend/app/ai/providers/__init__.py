"""
FRIDAY AI Provider Foundation Package
Exports core abstractions, data structures, exceptions, and provider factories.
"""

from .llm_provider import (
    BaseLLMProvider,
    LLMMessage,
    LLMRequest,
    LLMResponse,
    MessageRole,
    UsageInfo,
)
from .transcription_provider import (
    AudioInput,
    BaseTranscriptionProvider,
    TranscriptSegment,
    TranscriptionResult,
)
from .embedding_provider import (
    BaseEmbeddingProvider,
    BatchEmbeddingResult,
    EmbeddingResult,
)
from .exceptions import (
    AIProviderError,
    ProviderAuthenticationError,
    ProviderConfigurationError,
    ProviderInvalidResponseError,
    ProviderProcessingError,
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderUnavailableError,
)
from .mock import (
    MockEmbeddingProvider,
    MockLLMProvider,
    MockTranscriptionProvider,
)
from .factory import (
    get_embedding_provider,
    get_llm_provider,
    get_transcription_provider,
    register_embedding_provider,
    register_llm_provider,
    register_transcription_provider,
    reset_provider_cache,
)

__all__ = [
    # LLM Abstractions & Types
    "BaseLLMProvider",
    "LLMMessage",
    "LLMRequest",
    "LLMResponse",
    "MessageRole",
    "UsageInfo",
    # Transcription Abstractions & Types
    "AudioInput",
    "BaseTranscriptionProvider",
    "TranscriptSegment",
    "TranscriptionResult",
    # Embedding Abstractions & Types
    "BaseEmbeddingProvider",
    "BatchEmbeddingResult",
    "EmbeddingResult",
    # Provider Exceptions
    "AIProviderError",
    "ProviderAuthenticationError",
    "ProviderConfigurationError",
    "ProviderInvalidResponseError",
    "ProviderProcessingError",
    "ProviderRateLimitError",
    "ProviderTimeoutError",
    "ProviderUnavailableError",
    # Mock Providers
    "MockEmbeddingProvider",
    "MockLLMProvider",
    "MockTranscriptionProvider",
    # Factory Functions
    "get_embedding_provider",
    "get_llm_provider",
    "get_transcription_provider",
    "register_embedding_provider",
    "register_llm_provider",
    "register_transcription_provider",
    "reset_provider_cache",
]
