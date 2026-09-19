"""
FRIDAY Embedding Provider Abstraction Layer
Provides a vendor-neutral interface for generating dense vector representations.
Future capabilities (semantic similarity, call retrieval, objection clustering,
knowledge retrieval) will rely on this abstraction.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class EmbeddingResult:
    """Standardized representation of a single text embedding vector."""
    vector: List[float]
    dimension: int
    model: str
    provider: str
    tokens: Optional[int] = None
    latency_ms: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "dimension": self.dimension,
            "model": self.model,
            "provider": self.provider,
            "tokens": self.tokens,
            "latency_ms": self.latency_ms,
            "vector_sample": self.vector[:5] if len(self.vector) > 5 else self.vector,
        }


@dataclass
class BatchEmbeddingResult:
    """Standardized representation of multiple text embeddings."""
    embeddings: List[EmbeddingResult] = field(default_factory=list)
    model: str = "unknown"
    provider: str = "unknown"
    total_tokens: Optional[int] = None
    latency_ms: Optional[float] = None

    @property
    def vectors(self) -> List[List[float]]:
        return [e.vector for e in self.embeddings]

    @property
    def count(self) -> int:
        return len(self.embeddings)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "count": self.count,
            "model": self.model,
            "provider": self.provider,
            "total_tokens": self.total_tokens,
            "latency_ms": self.latency_ms,
            "embeddings": [e.to_dict() for e in self.embeddings],
        }


class BaseEmbeddingProvider(ABC):
    """
    Abstract Base Class for Text Embedding Providers.
    Converts text strings into normalized vector embeddings.
    """

    def __init__(self, provider_name: str, default_model: str, default_dimension: int) -> None:
        self.provider_name = provider_name
        self.default_model = default_model
        self.default_dimension = default_dimension

    @abstractmethod
    async def embed(
        self,
        text: str,
        model: Optional[str] = None,
        **kwargs: Any,
    ) -> EmbeddingResult:
        """
        Asynchronously generates an embedding vector for a single text input.

        Args:
            text: Input text string to embed.
            model: Optional model override.
            **kwargs: Additional provider-specific parameters.

        Returns:
            EmbeddingResult containing vector float list, dimension, and metadata.

        Raises:
            AIProviderError or derived subclasses upon failure.
        """
        pass

    @abstractmethod
    async def embed_batch(
        self,
        texts: List[str],
        model: Optional[str] = None,
        **kwargs: Any,
    ) -> BatchEmbeddingResult:
        """
        Asynchronously generates embedding vectors for multiple text inputs.

        Args:
            texts: List of text strings to embed.
            model: Optional model override.
            **kwargs: Additional provider-specific parameters.

        Returns:
            BatchEmbeddingResult containing list of EmbeddingResults.

        Raises:
            AIProviderError or derived subclasses upon failure.
        """
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """
        Verifies provider availability and valid configuration.

        Returns:
            True if healthy and reachable, False otherwise.
        """
        pass
