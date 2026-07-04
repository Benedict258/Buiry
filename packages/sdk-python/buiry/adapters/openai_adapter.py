"""OpenAI adapter — intercepts chat.completions.create()."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any
from unittest.mock import MagicMock


class OpenAIAdapter:
    """Wraps OpenAI client to capture LLM interactions."""

    PROVIDER = "openai"

    def __init__(self, buiry: Any):
        self.buiry = buiry

    def wrap(self, client: Any) -> Any:
        original_create = client.chat.completions.create

        def wrapped_create(*args: Any, **kwargs: Any) -> Any:
            start = time.time()
            response = original_create(*args, **kwargs)
            latency_ms = (time.time() - start) * 1000

            usage = {}
            if hasattr(response, "usage") and response.usage:
                usage = {
                    "prompt_tokens": getattr(response.usage, "prompt_tokens", 0),
                    "completion_tokens": getattr(response.usage, "completion_tokens", 0),
                }

            interaction = {
                "type": "interaction",
                "provider": self.PROVIDER,
                "model": getattr(response, "model", kwargs.get("model", "unknown")),
                "project_id": self.buiry.project_id,
                "request": {
                    "messages": kwargs.get("messages", []),
                    "model": kwargs.get("model", ""),
                    "temperature": kwargs.get("temperature"),
                    "max_tokens": kwargs.get("max_tokens"),
                },
                "response": {
                    "content": self._extract_content(response),
                    "finish_reason": self._extract_finish_reason(response),
                },
                "usage": usage,
                "latency_ms": round(latency_ms, 2),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            self.buiry._log_interaction(interaction)
            return response

        client.chat.completions.create = wrapped_create
        return client

    def _extract_content(self, response: Any) -> str:
        try:
            return response.choices[0].message.content
        except (AttributeError, IndexError):
            return ""

    def _extract_finish_reason(self, response: Any) -> str:
        try:
            return response.choices[0].finish_reason or ""
        except (AttributeError, IndexError):
            return ""
