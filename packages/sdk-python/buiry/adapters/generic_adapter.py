"""Generic adapter — wraps any LLM client via duck-typing."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any


class GenericAdapter:
    """Wraps any LLM client that has a generate/call/invoke method."""

    PROVIDER = "generic"

    def __init__(self, buiry: Any):
        self.buiry = buiry

    def wrap(self, client: Any) -> Any:
        # Try common method names
        for method_name in ("generate", "invoke", "__call__", "complete"):
            if hasattr(client, method_name) and callable(getattr(client, method_name)):
                original = getattr(client, method_name)

                def wrapped(*args: Any, **kwargs: Any) -> Any:
                    start = time.time()
                    response = original(*args, **kwargs)
                    latency_ms = (time.time() - start) * 1000

                    content = ""
                    if isinstance(response, str):
                        content = response
                    elif isinstance(response, dict):
                        content = response.get("content", response.get("text", str(response)))
                    elif hasattr(response, "content"):
                        content = str(response.content)
                    elif hasattr(response, "text"):
                        content = response.text

                    interaction = {
                        "type": "interaction",
                        "provider": self.PROVIDER,
                        "model": kwargs.get("model", type(client).__name__),
                        "project_id": self.buiry.project_id,
                        "request": {
                            "args": [str(a)[:500] for a in args],
                            "kwargs": {k: str(v)[:500] for k, v in kwargs.items()},
                        },
                        "response": {
                            "content": content[:5000],
                        },
                        "usage": {},
                        "latency_ms": round(latency_ms, 2),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }
                    self.buiry._log_interaction(interaction)
                    return response

                setattr(client, method_name, wrapped)
                break

        return client
