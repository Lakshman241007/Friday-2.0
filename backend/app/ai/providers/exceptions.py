"""
FRIDAY AI Provider Exceptions
Defines standardized exception hierarchy for AI provider operations.
Self-contained within AI ownership boundary; does not modify Member 2's core exceptions.
"""

from typing import Optional, Any, Dict


class AIProviderError(Exception):
    """Base exception for all AI provider-related errors."""

    def __init__(
        self,
        message: str,
        provider_name: Optional[str] = None,
        status_code: Optional[int] = None,
        retryable: bool = False,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.provider_name = provider_name
        self.status_code = status_code
        self.retryable = retryable
        self.details = details or {}

    def __str__(self) -> str:
        provider_prefix = f"[{self.provider_name}] " if self.provider_name else ""
        retry_flag = " (retryable)" if self.retryable else ""
        return f"{provider_prefix}{self.message}{retry_flag}"


class ProviderUnavailableError(AIProviderError):
    """Raised when the provider endpoint is unreachable, down, or network failed."""

    def __init__(
        self,
        message: str = "AI provider is currently unavailable or unreachable.",
        provider_name: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            provider_name=provider_name,
            status_code=503,
            retryable=True,
            details=details,
        )


class ProviderTimeoutError(AIProviderError):
    """Raised when an operation against the provider times out."""

    def __init__(
        self,
        message: str = "AI provider operation timed out.",
        provider_name: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            provider_name=provider_name,
            status_code=504,
            retryable=True,
            details=details,
        )


class ProviderAuthenticationError(AIProviderError):
    """Raised when API credentials are missing, rejected, or expired."""

    def __init__(
        self,
        message: str = "AI provider authentication failed. Check credentials/API keys.",
        provider_name: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            provider_name=provider_name,
            status_code=401,
            retryable=False,
            details=details,
        )


class ProviderRateLimitError(AIProviderError):
    """Raised when provider rate limits or quotas are exceeded."""

    def __init__(
        self,
        message: str = "AI provider rate limit exceeded.",
        provider_name: Optional[str] = None,
        retry_after_seconds: Optional[float] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        details_dict = details or {}
        if retry_after_seconds is not None:
            details_dict["retry_after_seconds"] = retry_after_seconds
        super().__init__(
            message=message,
            provider_name=provider_name,
            status_code=429,
            retryable=True,
            details=details_dict,
        )
        self.retry_after_seconds = retry_after_seconds


class ProviderInvalidResponseError(AIProviderError):
    """Raised when the provider response format is unexpected, invalid, or corrupted."""

    def __init__(
        self,
        message: str = "AI provider returned an invalid or unparseable response.",
        provider_name: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            provider_name=provider_name,
            status_code=502,
            retryable=False,
            details=details,
        )


class ProviderProcessingError(AIProviderError):
    """Raised when the model or service fails during generation, transcription, or embedding."""

    def __init__(
        self,
        message: str = "AI provider encountered a processing error during execution.",
        provider_name: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            provider_name=provider_name,
            status_code=500,
            retryable=False,
            details=details,
        )


class ProviderConfigurationError(AIProviderError):
    """Raised when provider configuration or initialization parameters are invalid."""

    def __init__(
        self,
        message: str = "AI provider configuration is invalid or missing required settings.",
        provider_name: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            provider_name=provider_name,
            status_code=400,
            retryable=False,
            details=details,
        )
