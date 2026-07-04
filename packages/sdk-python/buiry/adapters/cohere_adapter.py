"""Cohere adapter — intercepts chat()."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any


class CohereAdapter:
    """Wraps Cohere client to capture LLM interactions."""

    PROVIDER = "cohere"

    def __init__(self, buiry: Any):
        self.buiry = buiry

    def wrap(self, client: Any) -> Any:
        if hasattr(client, "chat"):
            original_chat = client.chat

            def wrapped_chat(*args: Any, **kwargs: Any) -> Any:
                start = time.time()
                response = original_chat(*args, **kwargs)
                latency_ms = (time.time() - start) * 1000

                content = ""
                if hasattr(response, "text"):
                    content = response.text

                interaction = {
                    "type": "interaction",
                    "provider": self.PROVIDER,
                    "model": kwargs.get("model", "command"),
                    "project_id": self.buiry.project_id,
                    "request": {
                        "message": kwargs.get("message", ""),
                        "model": kwargs.get("model", ""),
                    },
                    "response": {
                        "content": content,
                    },
                    "usage": {
                        "input_tokens": getattr(response, "meta", {}).get("tokens", {}).get("input_tokens", 0) if hasattr(response, "meta") else 0,
                        "output_tokens": getattr(response, "meta", {}).get("tokens", {}).get("output_tokens", 0) if hasattr(response, "meta") else 0,
                    },
                    "latency_ms": round(latency_ms, 2),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                self.buiry._log_interaction(interaction)
                return response

            client.chat = wrapped_chat
        return client
