"""Tests for Buiry Python SDK."""

import json
import sys
import os
from unittest.mock import MagicMock, patch
from dataclasses import dataclass
from typing import Any

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from buiry import Buiry


# ─── Mock LLM Clients ──────────────────────────────────────

@dataclass
class MockMessage:
    content: str = "Hello from mock"


@dataclass
class MockChoice:
    message: MockMessage = None
    finish_reason: str = "stop"

    def __post_init__(self):
        if self.message is None:
            self.message = MockMessage()


@dataclass
class MockUsage:
    prompt_tokens: int = 10
    completion_tokens: int = 20


@dataclass
class MockResponse:
    choices: list = None
    model: str = "mock-model"
    usage: MockUsage = None
    content: list = None

    def __post_init__(self):
        if self.choices is None:
            self.choices = [MockChoice()]
        if self.usage is None:
            self.usage = MockUsage()
        if self.content is None:
            self.content = [MagicMock(text="Hello from Anthropic")]


class MockOpenAIClient:
    def __init__(self):
        self.chat = MagicMock()
        self.chat.completions = MagicMock()
        self.chat.completions.create = MagicMock(return_value=MockResponse())


class MockAnthropicClient:
    def __init__(self):
        self.messages = MagicMock()
        self.messages.create = MagicMock(return_value=MockResponse(
            content=[MagicMock(text="Hello from Anthropic")],
        ))


class MockGroqClient:
    def __init__(self):
        self.chat = MagicMock()
        self.chat.completions = MagicMock()
        self.chat.completions.create = MagicMock(return_value=MockResponse())


class MockGeminiClient:
    def __init__(self):
        self.generate_content = MagicMock(return_value=MockResponse())


class MockCohereClient:
    def __init__(self):
        self.chat = MagicMock(return_value=MockResponse())


class MockOllamaClient:
    def __init__(self):
        self.chat = MagicMock(return_value={"message": {"content": "Hello from Ollama"}})


# ─── Tests ──────────────────────────────────────────────────

def test_init():
    buiry = Buiry(api_key="test-key", project_id="test")
    assert buiry.api_key == "test-key"
    assert buiry.project_id == "test"
    assert buiry.backend_url == "https://buiry.up.railway.app"
    buiry.close()


def test_init_defaults():
    buiry = Buiry()
    assert buiry.api_key == "dev-key"
    assert buiry.project_id == "default"
    buiry.close()


def test_wrap_openai():
    buiry = Buiry(api_key="test")
    client = MockOpenAIClient()
    wrapped = buiry.wrap(client)
    assert wrapped is client
    buiry.close()


def test_wrap_anthropic():
    buiry = Buiry(api_key="test")
    client = MockAnthropicClient()
    wrapped = buiry.wrap(client)
    assert wrapped is client
    buiry.close()


def test_wrap_groq():
    buiry = Buiry(api_key="test")
    client = MockGroqClient()
    wrapped = buiry.wrap(client)
    assert wrapped is client
    buiry.close()


def test_wrap_gemini():
    buiry = Buiry(api_key="test")
    client = MockGeminiClient()
    wrapped = buiry.wrap(client)
    assert wrapped is client
    buiry.close()


def test_wrap_with_explicit_provider():
    buiry = Buiry(api_key="test")
    client = MockOpenAIClient()
    wrapped = buiry.wrap(client, provider="openai")
    assert wrapped is client
    buiry.close()


def test_remember_and_recall():
    buiry = Buiry(api_key="test")
    result = buiry.remember({"content": "test data"})
    assert result["status"] == "stored"
    assert "id" in result

    results = buiry.recall("test data")
    assert len(results) == 1
    buiry.close()


def test_recall_empty():
    buiry = Buiry(api_key="test")
    results = buiry.recall("nonexistent")
    assert len(results) == 0
    buiry.close()


def test_interaction_captured():
    buiry = Buiry(api_key="test")
    client = MockOpenAIClient()
    buiry.wrap(client)
    client.chat.completions.create(messages=[{"role": "user", "content": "hi"}])
    assert len(buiry._interactions) == 1
    interaction = buiry._interactions[0]
    assert interaction["provider"] == "openai"
    assert interaction["type"] == "interaction"
    buiry.close()


def test_sample_rate():
    buiry = Buiry(api_key="test", sample_rate=0.0)
    buiry._log_interaction({"test": True})
    assert len(buiry._interactions) == 0
    buiry.close()


def test_anthropic_interaction():
    buiry = Buiry(api_key="test")
    client = MockAnthropicClient()
    buiry.wrap(client)
    client.messages.create(messages=[{"role": "user", "content": "hi"}])
    assert len(buiry._interactions) == 1
    assert buiry._interactions[0]["provider"] == "anthropic"
    buiry.close()


def test_groq_interaction():
    buiry = Buiry(api_key="test")
    client = MockGroqClient()
    buiry.wrap(client, provider="groq")
    client.chat.completions.create(messages=[{"role": "user", "content": "hi"}])
    assert len(buiry._interactions) == 1
    assert buiry._interactions[0]["provider"] == "groq"
    buiry.close()


def test_gemini_interaction():
    buiry = Buiry(api_key="test")
    client = MockGeminiClient()
    buiry.wrap(client, provider="gemini")
    client.generate_content("Hello")
    assert len(buiry._interactions) == 1
    assert buiry._interactions[0]["provider"] == "gemini"
    buiry.close()


def test_get_datasets_returns_list():
    buiry = Buiry(api_key="test")
    datasets = buiry.get_datasets()
    assert isinstance(datasets, list)
    buiry.close()


def test_get_sessions_returns_list():
    buiry = Buiry(api_key="test")
    sessions = buiry.get_sessions()
    assert isinstance(sessions, list)
    buiry.close()


def test_recall_limit():
    buiry = Buiry(api_key="test")
    for i in range(5):
        buiry.remember({"content": f"item {i}"})
    results = buiry.recall("item", limit=3)
    assert len(results) <= 3
    buiry.close()


def test_recall_no_match():
    buiry = Buiry(api_key="test")
    buiry.remember({"content": "hello"})
    results = buiry.recall("xyz")
    assert len(results) == 0
    buiry.close()


def test_flush_empty():
    buiry = Buiry(api_key="test")
    count = buiry.flush()
    assert count == 0
    buiry.close()


def test_multiple_providers_sequential():
    buiry = Buiry(api_key="test")

    openai_client = MockOpenAIClient()
    buiry.wrap(openai_client, provider="openai")
    openai_client.chat.completions.create(messages=[{"role": "user", "content": "hi"}])

    anthropic_client = MockAnthropicClient()
    buiry.wrap(anthropic_client, provider="anthropic")
    anthropic_client.messages.create(messages=[{"role": "user", "content": "hi"}])

    assert len(buiry._interactions) == 2
    assert buiry._interactions[0]["provider"] == "openai"
    assert buiry._interactions[1]["provider"] == "anthropic"
    buiry.close()


# ─── Run ────────────────────────────────────────────────────

if __name__ == "__main__":
    tests = [v for k, v in globals().items() if k.startswith("test_") and callable(v)]
    passed = 0
    failed = 0
    for test in tests:
        try:
            test()
            print(f"  ✓ {test.__name__}")
            passed += 1
        except Exception as e:
            print(f"  ✗ {test.__name__}: {e}")
            failed += 1
    print(f"\n  {passed}/{passed+failed} tests passed")
    sys.exit(1 if failed > 0 else 0)
