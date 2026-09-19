"""
FRIDAY LLM Provider Abstraction Layer
Provides a vendor-neutral interface for Large Language Model operations.
Future pipelines (analysis, summary, outcome, coaching, recommendations)
will interact solely with this abstraction rather than direct vendor SDKs.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Union


class MessageRole(str, Enum):
    """Standard conversational roles for multi-turn messages."""
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


@dataclass
class LLMMessage:
    """Individual conversational message turn."""
    role: Union[MessageRole, str]
    content: str
    name: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        result: Dict[str, Any] = {
            "role": str(self.role.value if isinstance(self.role, MessageRole) else self.role),
            "content": self.content,
        }
        if self.name:
            result["name"] = self.name
        return result


@dataclass
class UsageInfo:
    """Token consumption telemetry."""
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

    def to_dict(self) -> Dict[str, int]:
        return {
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_tokens": self.total_tokens or (self.prompt_tokens + self.completion_tokens),
        }


@dataclass
class LLMRequest:
    """Structured request payload for text generation."""
    prompt: Optional[str] = None
    messages: Optional[List[LLMMessage]] = None
    system_instruction: Optional[str] = None
    temperature: float = 0.2
    max_tokens: Optional[int] = None
    top_p: Optional[float] = None
    stop_sequences: Optional[List[str]] = None
    response_format: Optional[str] = None  # "json" or "text"
    model: Optional[str] = None
    extra_params: Dict[str, Any] = field(default_factory=dict)

    def get_effective_prompt(self) -> str:
        """Helper to extract or build flat text prompt if messages are provided."""
        if self.prompt:
            return self.prompt
        if self.messages:
            lines: List[str] = []
            if self.system_instruction:
                lines.append(f"System: {self.system_instruction}")
            for msg in self.messages:
                role_label = msg.role.value if isinstance(msg.role, MessageRole) else str(msg.role)
                lines.append(f"{role_label.capitalize()}: {msg.content}")
            return "\n".join(lines)
        return ""


@dataclass
class LLMResponse:
    """Standardized response payload from LLM generation."""
    content: str
    model: str
    provider: str
    usage: UsageInfo = field(default_factory=UsageInfo)
    finish_reason: Optional[str] = "stop"
    latency_ms: Optional[float] = None
    raw_response: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "content": self.content,
            "model": self.model,
            "provider": self.provider,
            "usage": self.usage.to_dict(),
            "finish_reason": self.finish_reason,
            "latency_ms": self.latency_ms,
        }


class BaseLLMProvider(ABC):
    """
    Abstract Base Class for Large Language Model Providers.
    All concrete implementations (Mock, OpenAI, Groq, Gemini, Anthropic, etc.)
    must conform to this interface.
    """

    def __init__(self, provider_name: str, default_model: str) -> None:
        self.provider_name = provider_name
        self.default_model = default_model

    def _normalize_request(
        self,
        request: Union[str, List[LLMMessage], LLMRequest],
        **kwargs: Any,
    ) -> LLMRequest:
        """Converts raw prompt string or list of messages into a unified LLMRequest."""
        if isinstance(request, LLMRequest):
            req = request
        elif isinstance(request, str):
            req = LLMRequest(prompt=request)
        elif isinstance(request, list):
            req = LLMRequest(messages=request)
        else:
            raise ValueError(f"Unsupported request type: {type(request)}")

        # Override any additional kwargs
        if "model" in kwargs and kwargs["model"]:
            req.model = kwargs["model"]
        elif not req.model:
            req.model = self.default_model

        if "temperature" in kwargs:
            req.temperature = kwargs["temperature"]
        if "max_tokens" in kwargs:
            req.max_tokens = kwargs["max_tokens"]
        if "system_instruction" in kwargs:
            req.system_instruction = kwargs["system_instruction"]
        if "response_format" in kwargs:
            req.response_format = kwargs["response_format"]

        return req

    @abstractmethod
    async def generate(
        self,
        request: Union[str, List[LLMMessage], LLMRequest],
        **kwargs: Any,
    ) -> LLMResponse:
        """
        Asynchronously generates a response from the LLM.

        Args:
            request: Prompt string, list of messages, or full LLMRequest instance.
            **kwargs: Additional parameters (model, temperature, max_tokens, etc.)

        Returns:
            LLMResponse containing text content, model name, and usage metrics.

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
