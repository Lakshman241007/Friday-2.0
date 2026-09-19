"""
FRIDAY AI Common Exceptions & Shims for API layer.
Provides a shared HTTPException and routing shims.
"""

from typing import Any

try:
    from fastapi import HTTPException as _FastAPIHTTPException  # type: ignore
    HAS_FASTAPI = True
except ImportError:
    HAS_FASTAPI = False
    _FastAPIHTTPException = None


class APIHTTPException(Exception):
    """Universal HTTP Exception supporting status_code and detail."""
    def __init__(self, status_code: int, detail: Any = None) -> None:
        super().__init__(str(detail))
        self.status_code = status_code
        self.detail = detail


# If FastAPI is available, use FastAPI's HTTPException, otherwise use APIHTTPException
HTTPException = _FastAPIHTTPException if HAS_FASTAPI else APIHTTPException
