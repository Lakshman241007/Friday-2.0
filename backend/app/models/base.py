"""
SQLAlchemy and Python Model Compatibility Shim.
Provides fallback DeclarativeBase and Column/Type mocks when SQLAlchemy
is not installed in the execution environment, while remaining fully compliant
with real SQLAlchemy 2.0+ when deployed.
"""

from datetime import datetime, timezone
import uuid
from typing import Any

try:
    from sqlalchemy import (
        Column,
        DateTime,
        Float,
        ForeignKey,
        Index,
        Integer,
        JSON,
        String,
        Text,
        UniqueConstraint,
    )
    from sqlalchemy.dialects.postgresql import JSONB
    from sqlalchemy.orm import declarative_base, relationship

    Base = declarative_base()
    HAS_SQLALCHEMY = True
except ImportError:
    HAS_SQLALCHEMY = False

    class Base:  # type: ignore
        """Fallback lightweight base class when sqlalchemy is not installed."""
        __table_args__: Any = ()

        def __init__(self, **kwargs: Any) -> None:
            for k, v in kwargs.items():
                setattr(self, k, v)

    def Column(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return None

    def Integer(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return None

    def String(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return None

    def Text(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return None

    def Float(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return None

    def DateTime(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return None

    def JSON(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return None

    def JSONB(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return None

    def ForeignKey(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return None

    def UniqueConstraint(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return None

    def Index(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return None

    def relationship(*args: Any, **kwargs: Any) -> Any:  # type: ignore
        return None
