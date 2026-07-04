"""Buiry adapter interface."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Optional


class BaseAdapter(ABC):
    """Base class for all Buiry LLM adapters."""

    def __init__(self, buiry: Any):
        self.buiry = buiry

    @abstractmethod
    def wrap(self, client: Any) -> Any:
        """Wrap the LLM client with Buiry interception."""
        ...

    def _extract_interaction(self, request: Any, response: Any, latency_ms: float) -> dict[str, Any]:
        """Extract interaction data from request/response."""
        return {
            "type": "interaction",
            "provider": "unknown",
            "project_id": self.buiry.project_id,
            "request": request,
            "response": response,
            "latency_ms": latency_ms,
            "timestamp": "",
        }
