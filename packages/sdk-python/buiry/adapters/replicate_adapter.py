"""Replicate adapter — intercepts client.run()."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any


class ReplicateAdapter:
    """Wraps Replicate client to capture LLM interactions."""

    PROVIDER = "replicate"

    def __init__(self, buiry: Any):
        self.buiry = buiry

    def wrap(self, client: Any) -> Any:
        if hasattr(client, "run"):
            original_run = client.run

            def wrapped_run(*args: Any, **kwargs: Any) -> Any:
                start = time.time()
                response = original_run(*args, **kwargs)
                latency_ms = (time.time() - start) * 1000

                content = ""
                if isinstance(response, str):
                    content = response
                elif isinstance(response, list):
                    content = "".join(str(chunk) for chunk in response)

                interaction = {
                    "type": "interaction",
                    "provider": self.PROVIDER,
                    "model": str(args[0]) if args else kwargs.get("model", "unknown"),
                    "project_id": self.buiry.project_id,
                    "request": {
                        "model": str(args[0]) if args else "",
                        "input": kwargs.get("input", {}),
                    },
                    "response": {
                        "content": content,
                    },
                    "usage": {},
                    "latency_ms": round(latency_ms, 2),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                self.buiry._log_interaction(interaction)
                return response

            client.run = wrapped_run
        return client
