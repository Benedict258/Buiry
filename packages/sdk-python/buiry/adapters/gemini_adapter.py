"""Google Gemini adapter — intercepts generate_content()."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any


class GeminiAdapter:
    """Wraps Gemini client to capture LLM interactions."""

    PROVIDER = "gemini"

    def __init__(self, buiry: Any):
        self.buiry = buiry

    def wrap(self, client: Any) -> Any:
        original_generate = client.generate_content

        def wrapped_generate(*args: Any, **kwargs: Any) -> Any:
            start = time.time()
            response = original_generate(*args, **kwargs)
            latency_ms = (time.time() - start) * 1000

            content = ""
            if hasattr(response, "text"):
                content = response.text

            usage = {}
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                um = response.usage_metadata
                usage = {
                    "prompt_token_count": getattr(um, "prompt_token_count", 0),
                    "candidates_token_count": getattr(um, "candidates_token_count", 0),
                }

            model = ""
            if args:
                model = str(args[0]) if args else kwargs.get("model", "")

            interaction = {
                "type": "interaction",
                "provider": self.PROVIDER,
                "model": model,
                "project_id": self.buiry.project_id,
                "request": {
                    "prompt": str(args[0]) if args else "",
                    "contents": kwargs.get("contents", []),
                    "generation_config": kwargs.get("generation_config", {}),
                },
                "response": {
                    "content": content,
                },
                "usage": usage,
                "latency_ms": round(latency_ms, 2),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            self.buiry._log_interaction(interaction)
            return response

        client.generate_content = wrapped_generate
        return client
