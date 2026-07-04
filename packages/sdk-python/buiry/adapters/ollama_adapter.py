"""Ollama adapter — intercepts chat()."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any


class OllamaAdapter:
    """Wraps Ollama client to capture LLM interactions."""

    PROVIDER = "ollama"

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
                if isinstance(response, dict):
                    content = response.get("message", {}).get("content", "")
                elif hasattr(response, "message"):
                    content = response.message.get("content", "")

                interaction = {
                    "type": "interaction",
                    "provider": self.PROVIDER,
                    "model": kwargs.get("model", "unknown"),
                    "project_id": self.buiry.project_id,
                    "request": {
                        "model": kwargs.get("model", ""),
                        "messages": kwargs.get("messages", []),
                    },
                    "response": {
                        "content": content,
                    },
                    "usage": {
                        "prompt_tokens": response.get("prompt_eval_count", 0) if isinstance(response, dict) else 0,
                        "completion_tokens": response.get("eval_count", 0) if isinstance(response, dict) else 0,
                    },
                    "latency_ms": round(latency_ms, 2),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                self.buiry._log_interaction(interaction)
                return response

            client.chat = wrapped_chat
        return client
