"""
FRIDAY Mock LLM Provider
Deterministic development and testing provider requiring no external API keys.
Supports canned responses, simulated latency, and intentional error injection.
"""

import asyncio
from typing import Any, Callable, Dict, List, Optional, Union

from ..llm_provider import BaseLLMProvider, LLMMessage, LLMRequest, LLMResponse, UsageInfo
from ..exceptions import (
    ProviderUnavailableError,
    ProviderTimeoutError,
    ProviderRateLimitError,
    ProviderInvalidResponseError,
    ProviderProcessingError,
)


class MockLLMProvider(BaseLLMProvider):
    """
    In-memory deterministic LLM provider for unit tests, development, and offline pipelines.
    """

    def __init__(
        self,
        default_model: str = "mock-llm-v1",
        default_response: Optional[str] = None,
        latency_seconds: float = 0.0,
        fail_with: Optional[Exception] = None,
    ) -> None:
        super().__init__(provider_name="mock_llm", default_model=default_model)
        self.default_response = default_response or "Mock LLM generation successful."
        self.latency_seconds = latency_seconds
        self.fail_with = fail_with
        self.call_history: List[LLMRequest] = []
        self._canned_responses: Dict[str, str] = {}
        self._dynamic_handler: Optional[Callable[[LLMRequest], str]] = None

    def register_canned_response(self, prompt_substring: str, response: str) -> None:
        """Register specific responses when prompt contains matching substring."""
        self._canned_responses[prompt_substring.lower()] = response

    def set_dynamic_handler(self, handler: Callable[[LLMRequest], str]) -> None:
        """Set a dynamic callback function to compute response text from LLMRequest."""
        self._dynamic_handler = handler

    def clear_history(self) -> None:
        self.call_history.clear()

    async def generate(
        self,
        request: Union[str, List[LLMMessage], LLMRequest],
        **kwargs: Any,
    ) -> LLMResponse:
        norm_req = self._normalize_request(request, **kwargs)
        self.call_history.append(norm_req)

        if self.latency_seconds > 0:
            await asyncio.sleep(self.latency_seconds)

        # Handle intentional test failures
        if self.fail_with:
            raise self.fail_with

        prompt_text = norm_req.get_effective_prompt()

        # Check for dynamic handler
        if self._dynamic_handler:
            content = self._dynamic_handler(norm_req)
        else:
            # Check for matching canned responses
            content = self.default_response
            lower_prompt = prompt_text.lower()
            for key, canned in self._canned_responses.items():
                if key in lower_prompt:
                    content = canned
                    break

        # Calculate deterministic mock token usage (approx 4 chars per token)
        prompt_tokens = max(1, len(prompt_text) // 4)
        completion_tokens = max(1, len(content) // 4)
        total_tokens = prompt_tokens + completion_tokens

        return LLMResponse(
            content=content,
            model=norm_req.model or self.default_model,
            provider=self.provider_name,
            usage=UsageInfo(
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
            ),
            finish_reason="stop",
            latency_ms=round(self.latency_seconds * 1000, 2),
        )

    async def health_check(self) -> bool:
        return self.fail_with is None
