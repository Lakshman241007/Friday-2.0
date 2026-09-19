"""
FRIDAY Mock Embedding Provider
Deterministic vector generation provider requiring no external API keys.
Produces reproducible normalized float vectors for testing similarity and clustering.
"""

import asyncio
import hashlib
import math
from typing import Any, List, Optional

from ..embedding_provider import (
    BaseEmbeddingProvider,
    BatchEmbeddingResult,
    EmbeddingResult,
)


class MockEmbeddingProvider(BaseEmbeddingProvider):
    """
    In-memory deterministic embedding provider.
    Hashes input text to generate normalized pseudo-vectors of specified dimension.
    """

    def __init__(
        self,
        default_model: str = "mock-embed-v1",
        default_dimension: int = 128,
        latency_seconds: float = 0.0,
        fail_with: Optional[Exception] = None,
    ) -> None:
        super().__init__(
            provider_name="mock_embedding",
            default_model=default_model,
            default_dimension=default_dimension,
        )
        self.latency_seconds = latency_seconds
        self.fail_with = fail_with
        self.call_count: int = 0

    def _generate_deterministic_vector(self, text: str, dimension: int) -> List[float]:
        """
        Generates a deterministic unit-normalized float vector of length `dimension`
        from the SHA-256 hash of the input text.
        """
        raw_vals: List[float] = []
        seed_bytes = text.encode("utf-8")
        current_hash = hashlib.sha256(seed_bytes).digest()

        while len(raw_vals) < dimension:
            for b in current_hash:
                # Convert byte 0-255 to float -1.0 to 1.0
                raw_vals.append((b - 128.0) / 128.0)
                if len(raw_vals) >= dimension:
                    break
            current_hash = hashlib.sha256(current_hash).digest()

        # Normalize to unit length (L2 norm)
        norm = math.sqrt(sum(x * x for x in raw_vals)) or 1.0
        return [round(x / norm, 6) for x in raw_vals]

    async def embed(
        self,
        text: str,
        model: Optional[str] = None,
        **kwargs: Any,
    ) -> EmbeddingResult:
        self.call_count += 1

        if self.latency_seconds > 0:
            await asyncio.sleep(self.latency_seconds)

        if self.fail_with:
            raise self.fail_with

        dim = kwargs.get("dimension", self.default_dimension)
        vector = self._generate_deterministic_vector(text, dim)

        # Approximate token count
        tokens = max(1, len(text) // 4)

        return EmbeddingResult(
            vector=vector,
            dimension=dim,
            model=model or self.default_model,
            provider=self.provider_name,
            tokens=tokens,
            latency_ms=round(self.latency_seconds * 1000, 2),
        )

    async def embed_batch(
        self,
        texts: List[str],
        model: Optional[str] = None,
        **kwargs: Any,
    ) -> BatchEmbeddingResult:
        self.call_count += 1

        if self.latency_seconds > 0:
            await asyncio.sleep(self.latency_seconds)

        if self.fail_with:
            raise self.fail_with

        embeddings: List[EmbeddingResult] = []
        total_tokens = 0
        dim = kwargs.get("dimension", self.default_dimension)
        eff_model = model or self.default_model

        for text in texts:
            vec = self._generate_deterministic_vector(text, dim)
            tokens = max(1, len(text) // 4)
            total_tokens += tokens
            embeddings.append(
                EmbeddingResult(
                    vector=vec,
                    dimension=dim,
                    model=eff_model,
                    provider=self.provider_name,
                    tokens=tokens,
                    latency_ms=round(self.latency_seconds * 1000, 2),
                )
            )

        return BatchEmbeddingResult(
            embeddings=embeddings,
            model=eff_model,
            provider=self.provider_name,
            total_tokens=total_tokens,
            latency_ms=round(self.latency_seconds * 1000, 2),
        )

    async def health_check(self) -> bool:
        return self.fail_with is None
