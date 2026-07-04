"""Anthropic adapter — intercepts messages.create()."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any


class AnthropicAdapter:
    """Wraps Anthropic client to capture LLM interactions."""

    PROVIDER = "anthropic"

    def __init__(self, buiry: Any):
        self.buiry = buiry

    def wrap(self, client: Any) -> Any:
        original_create = client.messages.create

        def wrapped_create(*args: Any, **kwargs: Any) -> Any:
            start = time.time()
            response = original_create(*args, **kwargs)
            latency_ms = (time.time() - start) * 1000

            usage = {}
            if hasattr(response, "usage") and response.usage:
                usage = {
                    "input_tokens": getattr(response.usage, "input_tokens", 0),
                    "output_tokens": getattr(response.usage, "output_tokens", 0),
                }

            content = ""
            if hasattr(response, "content") and response.content:
                for block in response.content:
                    if hasattr(block, "text"):
                        content += block.text

            interaction = {
                "type": "interaction",
                "provider": self.PROVIDER,
                "model": getattr(response, "model", kwargs.get("model", "unknown")),
                "project_id": self.buiry.project_id,
                "request": {
                    "messages": kwargs.get("messages", []),
                    "model": kwargs.get("model", ""),
                    "max_tokens": kwargs.get("max_tokens"),
                    "temperature": kwargs.get("temperature"),
                    "system": kwargs.get("system", ""),
                },
                "response": {
                    "content": content,
                    "stop_reason": getattr(response, "stop_reason", ""),
                },
                "usage": usage,
                "latency_ms": round(latency_ms, 2),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            self.buiry._log_interaction(interaction)
            return response

        client.messages.create = wrapped_create
        return client
