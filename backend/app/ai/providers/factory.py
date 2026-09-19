"""
FRIDAY AI Provider Factory
Provides central accessors to resolve configured AI providers.
Allows the application to swap providers via environment variables or explicit configuration
without modifying downstream AI pipelines or services.
"""

import os
from typing import Callable, Dict, Optional, Union

from .llm_provider import BaseLLMProvider
from .transcription_provider import BaseTranscriptionProvider
from .embedding_provider import BaseEmbeddingProvider
from .exceptions import ProviderConfigurationError
from .mock import (
    MockLLMProvider,
    MockTranscriptionProvider,
    MockEmbeddingProvider,
)

# Registry stores factory functions: () -> BaseProvider
_LLM_REGISTRY: Dict[str, Callable[..., BaseLLMProvider]] = {}
_TRANSCRIPTION_REGISTRY: Dict[str, Callable[..., BaseTranscriptionProvider]] = {}
_EMBEDDING_REGISTRY: Dict[str, Callable[..., BaseEmbeddingProvider]] = {}

# Cached singletons
_INSTANCES: Dict[str, Union[BaseLLMProvider, BaseTranscriptionProvider, BaseEmbeddingProvider]] = {}


def register_llm_provider(name: str, factory: Callable[..., BaseLLMProvider]) -> None:
    """Register an LLM provider implementation with the factory."""
    _LLM_REGISTRY[name.lower()] = factory


def register_transcription_provider(name: str, factory: Callable[..., BaseTranscriptionProvider]) -> None:
    """Register a Transcription provider implementation with the factory."""
    _TRANSCRIPTION_REGISTRY[name.lower()] = factory


def register_embedding_provider(name: str, factory: Callable[..., BaseEmbeddingProvider]) -> None:
    """Register an Embedding provider implementation with the factory."""
    _EMBEDDING_REGISTRY[name.lower()] = factory


# Register built-in default mock providers
register_llm_provider("mock", lambda **kwargs: MockLLMProvider(**kwargs))
register_llm_provider("mock_llm", lambda **kwargs: MockLLMProvider(**kwargs))

register_transcription_provider("mock", lambda **kwargs: MockTranscriptionProvider(**kwargs))
register_transcription_provider("mock_transcription", lambda **kwargs: MockTranscriptionProvider(**kwargs))

register_embedding_provider("mock", lambda **kwargs: MockEmbeddingProvider(**kwargs))
register_embedding_provider("mock_embedding", lambda **kwargs: MockEmbeddingProvider(**kwargs))


def get_llm_provider(
    provider_name: Optional[str] = None,
    use_cache: bool = True,
    **kwargs,
) -> BaseLLMProvider:
    """
    Retrieves the configured LLM provider instance.

    Checks:
    1. Explicit provider_name argument
    2. FRIDAY_LLM_PROVIDER environment variable
    3. Defaults to 'mock' provider
    """
    target = (provider_name or os.getenv("FRIDAY_LLM_PROVIDER") or "mock").lower()
    cache_key = f"llm:{target}:{sorted(kwargs.items())}"

    if use_cache and cache_key in _INSTANCES:
        return _INSTANCES[cache_key]  # type: ignore

    factory = _LLM_REGISTRY.get(target)
    if not factory:
        available = list(_LLM_REGISTRY.keys())
        raise ProviderConfigurationError(
            f"Requested LLM provider '{target}' is not registered. Available: {available}",
            provider_name=target,
        )

    instance = factory(**kwargs)
    if use_cache:
        _INSTANCES[cache_key] = instance
    return instance


def get_transcription_provider(
    provider_name: Optional[str] = None,
    use_cache: bool = True,
    **kwargs,
) -> BaseTranscriptionProvider:
    """
    Retrieves the configured Speech-to-Text transcription provider instance.

    Checks:
    1. Explicit provider_name argument
    2. FRIDAY_TRANSCRIPTION_PROVIDER environment variable
    3. Defaults to 'mock' provider
    """
    target = (provider_name or os.getenv("FRIDAY_TRANSCRIPTION_PROVIDER") or "mock").lower()
    cache_key = f"transcription:{target}:{sorted(kwargs.items())}"

    if use_cache and cache_key in _INSTANCES:
        return _INSTANCES[cache_key]  # type: ignore

    factory = _TRANSCRIPTION_REGISTRY.get(target)
    if not factory:
        available = list(_TRANSCRIPTION_REGISTRY.keys())
        raise ProviderConfigurationError(
            f"Requested Transcription provider '{target}' is not registered. Available: {available}",
            provider_name=target,
        )

    instance = factory(**kwargs)
    if use_cache:
        _INSTANCES[cache_key] = instance
    return instance


def get_embedding_provider(
    provider_name: Optional[str] = None,
    use_cache: bool = True,
    **kwargs,
) -> BaseEmbeddingProvider:
    """
    Retrieves the configured text embedding provider instance.

    Checks:
    1. Explicit provider_name argument
    2. FRIDAY_EMBEDDING_PROVIDER environment variable
    3. Defaults to 'mock' provider
    """
    target = (provider_name or os.getenv("FRIDAY_EMBEDDING_PROVIDER") or "mock").lower()
    cache_key = f"embedding:{target}:{sorted(kwargs.items())}"

    if use_cache and cache_key in _INSTANCES:
        return _INSTANCES[cache_key]  # type: ignore

    factory = _EMBEDDING_REGISTRY.get(target)
    if not factory:
        available = list(_EMBEDDING_REGISTRY.keys())
        raise ProviderConfigurationError(
            f"Requested Embedding provider '{target}' is not registered. Available: {available}",
            provider_name=target,
        )

    instance = factory(**kwargs)
    if use_cache:
        _INSTANCES[cache_key] = instance
    return instance


def reset_provider_cache() -> None:
    """Clears cached provider instances (useful in unit testing)."""
    _INSTANCES.clear()
