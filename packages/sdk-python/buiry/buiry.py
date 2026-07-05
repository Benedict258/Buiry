"""Buiry SDK — Main client class.

Wraps any LLM client, captures interactions, stores them on Buiry backend.
Zero configuration. Auto-detects provider.
"""

from __future__ import annotations

import time
import uuid
import hashlib
import re
import logging
from typing import Any, Optional, Union
from datetime import datetime, timezone

import httpx

from buiry.adapters.openai_adapter import OpenAIAdapter
from buiry.adapters.anthropic_adapter import AnthropicAdapter
from buiry.adapters.gemini_adapter import GeminiAdapter
from buiry.adapters.groq_adapter import GroqAdapter
from buiry.adapters.mistral_adapter import MistralAdapter
from buiry.adapters.cohere_adapter import CohereAdapter
from buiry.adapters.xai_adapter import XAIAdapter
from buiry.adapters.deepseek_adapter import DeepSeekAdapter
from buiry.adapters.together_adapter import TogetherAdapter
from buiry.adapters.fireworks_adapter import FireworksAdapter
from buiry.adapters.perplexity_adapter import PerplexityAdapter
from buiry.adapters.replicate_adapter import ReplicateAdapter
from buiry.adapters.ollama_adapter import OllamaAdapter
from buiry.adapters.generic_adapter import GenericAdapter


# ─── Adapter Registry ──────────────────────────────────────

ADAPTERS = {
    "openai": OpenAIAdapter,
    "anthropic": AnthropicAdapter,
    "gemini": GeminiAdapter,
    "google": GeminiAdapter,
    "groq": GroqAdapter,
    "mistral": MistralAdapter,
    "cohere": CohereAdapter,
    "xai": XAIAdapter,
    "deepseek": DeepSeekAdapter,
    "together": TogetherAdapter,
    "fireworks": FireworksAdapter,
    "perplexity": PerplexityAdapter,
    "replicate": ReplicateAdapter,
    "ollama": OllamaAdapter,
    "generic": GenericAdapter,
}


def _detect_provider(client: Any) -> str:
    """Auto-detect LLM provider from client object."""
    cls = type(client).__module__.lower()
    cls_name = type(client).__name__.lower()

    # OpenAI
    if "openai" in cls or "openai" in cls_name:
        return "openai"
    if hasattr(client, "chat") and hasattr(getattr(client, "chat", None), "completions"):
        return "openai"

    # Anthropic
    if "anthropic" in cls or "anthropic" in cls_name:
        return "anthropic"
    if hasattr(client, "messages") and hasattr(getattr(client, "messages", None), "create"):
        return "anthropic"

    # Groq
    if "groq" in cls or "groq" in cls_name:
        return "groq"

    # Mistral
    if "mistral" in cls or "mistralai" in cls:
        return "mistral"

    # Cohere
    if "cohere" in cls or "cohere" in cls_name:
        return "cohere"

    # xAI
    if "xai" in cls or "xai" in cls_name:
        return "xai"

    # DeepSeek
    if "deepseek" in cls or "deepseek" in cls_name:
        return "deepseek"

    # Together
    if "together" in cls or "together" in cls_name:
        return "together"

    # Fireworks
    if "fireworks" in cls or "fireworks" in cls_name:
        return "fireworks"

    # Perplexity
    if "perplexity" in cls or "perplexity" in cls_name:
        return "perplexity"

    # Replicate
    if "replicate" in cls or "replicate" in cls_name:
        return "replicate"

    # Ollama
    if "ollama" in cls or "ollama" in cls_name:
        return "ollama"

    # Gemini
    if "gemini" in cls or "google" in cls or "generativeai" in cls:
        return "gemini"

    return "generic"


PII_PATTERNS = [
    re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
    re.compile(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b"),
    re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    re.compile(r"\b[A-Z][a-z]+\s[A-Z][a-z]+\b"),
    re.compile(r"\d+\s+[A-Za-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b", re.IGNORECASE),
    re.compile(r"\+\d{1,3}[\s-]?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b"),
]


def _strip_pii(text: str) -> str:
    result = text
    for pattern in PII_PATTERNS:
        result = pattern.sub("[REDACTED]", result)
    return result


# ─── Main Buiry Class ──────────────────────────────────────

class Buiry:
    """Universal data ownership for AI applications.

    Usage:
        buiry = Buiry(api_key="sk-...", project_id="my-app")
        wrapped = buiry.wrap(my_openai_client)
        # Now every LLM call is captured automatically
    """

    def __init__(
        self,
        api_key: str = "",
        backend_url: str = "https://buiry.up.railway.app",
        project_id: str = "default",
        sample_rate: float = 1.0,
        **kwargs: Any,
    ):
        self.api_key = api_key or "dev-key"
        self.backend_url = backend_url.rstrip("/")
        self.project_id = project_id
        self.sample_rate = sample_rate
        self._interactions: list[dict[str, Any]] = []
        self.failed_captures = 0
        self._client = httpx.Client(
            headers={"X-Api-Key": self.api_key, "Content-Type": "application/json"},
            timeout=30.0,
        )

    def wrap(self, client: Any, provider: Optional[str] = None) -> Any:
        """Wrap any LLM client to capture interactions.

        Args:
            client: The LLM client to wrap (OpenAI, Anthropic, etc.)
            provider: Force a specific provider. Auto-detected if not provided.

        Returns:
            The same client, with interception enabled.
        """
        if provider is None:
            provider = _detect_provider(client)

        adapter_cls = ADAPTERS.get(provider, GenericAdapter)
        adapter = adapter_cls(buiry=self)

        return adapter.wrap(client)

    def remember(self, data: dict[str, Any]) -> dict[str, Any]:
        """Store arbitrary data.

        Args:
            data: Data to store (prompt, feedback, metadata, etc.)

        Returns:
            Confirmation with memory ID.
        """
        memory_id = f"mem_{uuid.uuid4().hex[:12]}"
        interaction = {
            "id": memory_id,
            "type": "memory",
            "data": data,
            "project_id": self.project_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._interactions.append(interaction)
        return {"id": memory_id, "status": "stored"}

    def recall(self, query: str, limit: int = 10) -> list[dict[str, Any]]:
        """Recall stored memories.

        Args:
            query: Search query.
            limit: Max results.

        Returns:
            List of matching memories.
        """
        results = []
        for interaction in reversed(self._interactions):
            if len(results) >= limit:
                break
            if interaction.get("type") == "memory":
                if query.lower() in str(interaction.get("data", {})).lower():
                    results.append(interaction)
        return results

    def get_datasets(self, category: Optional[str] = None) -> list[dict[str, Any]]:
        """Fetch generated datasets from backend.

        Args:
            category: Filter by category.

        Returns:
            List of datasets.
        """
        try:
            resp = self._client.get(
                f"{self.backend_url}/api/datasets",
                params={"category": category} if category else None,
            )
            resp.raise_for_status()
            return resp.json().get("datasets", [])
        except Exception as e:
            logging.warning(f"[Buiry SDK] get_datasets failed: {e}")
            return []

    def get_sessions(self, limit: int = 10) -> list[dict[str, Any]]:
        """Fetch sessions from backend.

        Args:
            limit: Max results.

        Returns:
            List of sessions.
        """
        try:
            resp = self._client.get(
                f"{self.backend_url}/api/sessions",
                params={"limit": limit},
            )
            resp.raise_for_status()
            return resp.json().get("sessions", [])
        except Exception as e:
            logging.warning(f"[Buiry SDK] get_sessions failed: {e}")
            return []

    def _log_interaction(self, interaction: dict[str, Any]) -> None:
        """Log an interaction internally."""
        import random
        if random.random() <= self.sample_rate:
            for key in ("input", "output", "prompt", "response", "content"):
                if key in interaction and isinstance(interaction[key], str):
                    interaction[key] = _strip_pii(interaction[key])
            self._interactions.append(interaction)

    def flush(self) -> int:
        """Flush all captured interactions to the backend.

        Returns:
            Number of interactions sent.
        """
        if not self._interactions:
            return 0

        count = 0
        for interaction in self._interactions:
            try:
                resp = self._client.post(
                    f"{self.backend_url}/api/interactions",
                    json=interaction,
                )
                if resp.status_code in (200, 201):
                    count += 1
            except Exception as e:
                logging.warning(f"[Buiry SDK] Flush interaction failed: {e}")
                self.failed_captures += 1

        self._interactions.clear()
        return count

    def close(self) -> None:
        """Close the HTTP client."""
        self._client.close()
