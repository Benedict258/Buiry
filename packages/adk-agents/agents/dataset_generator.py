#!/usr/bin/env python3
"""
Dataset Generator Agent — The core AI agent of Buiry.

This agent autonomously:
1. Reads captured developer interactions (from SDK or sessions)
2. Uses Gemini to classify interactions into meaningful categories
3. Generates labeled datasets with insights, patterns, and claims
4. Outputs privacy-safe training datasets for fine-tuning

This replaces the deterministic pipeline (PrivacyPass → Threshold → Aggregate → Categorize)
with an LLM-powered agent that truly understands what developers are building.

Why an agent and not a pipeline:
- Keyword matching can't understand context ("use React" could mean UI, state, or routing)
- An LLM agent can detect patterns across sessions (e.g., "this team always asks about auth")
- Real categorization requires understanding developer intent, not just string matching

Usage:
    python3 agents/dataset_generator.py
    python3 agents/dataset_generator.py --interactions test_data.json
"""

import json
import os
import sys
import asyncio
from datetime import datetime, timezone
from typing import Any

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

DATASET_GENERATOR_PROMPT = """You are the Dataset Generator Agent — an AI agent that transforms raw developer
interactions into high-quality, privacy-safe training datasets.

Your job:
1. Analyze developer interactions (prompts, responses, code patterns)
2. Classify each interaction into meaningful categories
3. Group related interactions by domain and topic
4. Extract reusable claims, patterns, and best practices
5. Generate structured datasets ready for model fine-tuning

CATEGORIES (use these, create sub-categories when needed):
- code_generation: generating new code, functions, components
- debugging: fixing errors, troubleshooting, root cause analysis
- design_patterns: architecture decisions, patterns, conventions
- devops_deployment: deployment, CI/CD, infrastructure, containers
- data_engineering: database queries, schemas, data pipelines
- security_patterns: authentication, authorization, encryption, PII handling
- api_design: REST, GraphQL, endpoint design, API versioning
- performance_optimization: profiling, caching, indexing, load balancing
- testing_quality: unit tests, integration tests, code review patterns

For each interaction:
- Domain: extract the primary technical domain
- Category: choose the best category from the list above
- Claims: extract 1-3 concrete, reusable claims (e.g., "Use EXPLAIN ANALYZE for Postgres query optimization")
- Patterns: identify any recurring patterns or anti-patterns
- Skill Level: estimate difficulty (beginner, intermediate, advanced)
- Privacy Note: flag any PII concerns

OUTPUT FORMAT — Return this exact JSON structure:
{
  "datasets": [
    {
      "category": "code_generation",
      "domain": "backend",
      "sample_size": 3,
      "privacy_score": 95,
      "quality_score": 85,
      "claims": ["claim 1", "claim 2"],
      "patterns": ["pattern 1"],
      "summary": "Dataset of backend API generation patterns from 3 sessions",
      "recommended_use": "Fine-tuning for code generation in Node.js/Express"
    }
  ],
  "insights": "Summary analysis of what this developer/team most commonly builds, their top domains, and what datasets would be most valuable for them"
}

Be thorough. Real code analysis, not generic labels. Every claim must be concrete and reusable."""


class DatasetGeneratorAgent:
    """LLM-powered agent that generates training datasets from developer interactions."""

    def __init__(self, model: str = "gemini-2.5-flash"):
        self.model = model
        self.agent = LlmAgent(
            name="dataset_generator",
            model=model,
            description="Analyzes developer interactions and generates labeled training datasets",
            instruction=DATASET_GENERATOR_PROMPT,
            tools=[],
        )

    async def generate(self, interactions: list[dict]) -> dict:
        """Process interactions and generate datasets."""
        session_service = InMemorySessionService()
        runner = Runner(
            agent=self.agent,
            app_name="buiry-dataset-generator",
            session_service=session_service,
        )

        session = await session_service.create_session(
            app_name="buiry-dataset-generator",
            user_id="system",
            session_id=f"gen-{datetime.now(timezone.utc).timestamp()}",
        )

        # Build the prompt with all interactions
        interactions_text = json.dumps(interactions, indent=2)
        prompt = f"Analyze these {len(interactions)} developer interactions and generate datasets:\n\n{interactions_text}"

        content = types.Content(role="user", parts=[types.Part(text=prompt)])

        result_text = ""
        async for event in runner.run_async(
            user_id="system",
            session_id=session.id,
            new_message=content,
        ):
            if event.is_final_response() and event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        result_text += part.text

        # Parse JSON from LLM response
        try:
            # Strip markdown code fences if present
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            return json.loads(result_text.strip())
        except json.JSONDecodeError:
            return {"error": "Failed to parse agent output", "raw": result_text}


# ─── Demo ─────────────────────────────────────────────────────

SAMPLE_INTERACTIONS = [
    {
        "id": "int_001",
        "session_id": "sess_001",
        "timestamp": "2026-07-01T10:00:00Z",
        "user_query": "How do I optimize PostgreSQL queries for a dashboard with 1M rows?",
        "assistant_response": "Use EXPLAIN ANALYZE to identify slow queries. Add composite indexes on frequently filtered columns. Use materialized views for dashboard aggregations. Consider partitioning by date for time-series data.",
        "domain_signals": ["backend", "database"],
        "token_count": 245,
        "model": "gemini-2.5-flash",
        "latency_ms": 423,
    },
    {
        "id": "int_002",
        "session_id": "sess_001",
        "timestamp": "2026-07-01T10:15:00Z",
        "user_query": "My React component keeps re-rendering, how do I fix it?",
        "assistant_response": "Wrap the component in React.memo() to prevent unnecessary re-renders. Use useCallback for event handlers passed as props. Use useMemo for expensive computations. Check if parent state changes are causing cascading updates.",
        "domain_signals": ["frontend", "react"],
        "token_count": 312,
        "model": "gemini-2.5-flash",
        "latency_ms": 312,
    },
    {
        "id": "int_003",
        "session_id": "sess_002",
        "timestamp": "2026-07-01T14:00:00Z",
        "user_query": "Design a REST API for a real-time quiz platform",
        "assistant_response": "Use Express.js with RESTful conventions. Structure: GET /quizzes, POST /quizzes, GET /quizzes/:id/questions, POST /sessions/:id/answer. Use JWT for authentication with refresh tokens. Implement rate limiting per user. Store active game state in Redis for sub-second reads.",
        "domain_signals": ["backend", "api"],
        "token_count": 567,
        "model": "gemini-2.5-flash",
        "latency_ms": 389,
    },
    {
        "id": "int_004",
        "session_id": "sess_002",
        "timestamp": "2026-07-01T14:30:00Z",
        "user_query": "Set up WebSocket for real-time game with Socket.io",
        "assistant_response": "Use Socket.io with rooms for game sessions. Handle lifecycle: connection → authenticate → join room → game events → disconnect. Implement heartbeat (ping/pong) at 25s intervals. Use Redis adapter for horizontal scaling. Rate limit to 10 events/sec per client.",
        "domain_signals": ["backend", "websocket"],
        "token_count": 489,
        "model": "gemini-2.5-flash",
        "latency_ms": 445,
    },
    {
        "id": "int_005",
        "session_id": "sess_003",
        "timestamp": "2026-07-02T09:00:00Z",
        "user_query": "Deploy my Node.js app with Docker and CI/CD",
        "assistant_response": "Create a multi-stage Dockerfile: build stage for compiling TypeScript, production stage with only runtime deps. Use GitHub Actions: test → build → push to registry → deploy. Add health check endpoint. Use environment variables for config, never hardcode secrets.",
        "domain_signals": ["devops", "deployment"],
        "token_count": 398,
        "model": "gemini-2.5-flash",
        "latency_ms": 567,
    },
    {
        "id": "int_006",
        "session_id": "sess_003",
        "timestamp": "2026-07-02T09:30:00Z",
        "user_query": "How do I handle authentication securely in Express?",
        "assistant_response": "Use bcrypt for password hashing (12 rounds). Implement JWT with short expiry (15min) + refresh tokens (7 days). Store refresh tokens in httpOnly cookies. Use helmet middleware for security headers. Implement rate limiting on auth endpoints (5 attempts/min). Never log or expose tokens.",
        "domain_signals": ["backend", "security"],
        "token_count": 456,
        "model": "gemini-2.5-flash",
        "latency_ms": 398,
    },
]


async def main():
    print("═══════════════════════════════════════════")
    print("  DATASET GENERATOR AGENT")
    print("  AI Agent → Analyzes dev interactions → Datasets")
    print("═══════════════════════════════════════════\n")

    print(f"  Input: {len(SAMPLE_INTERACTIONS)} developer interactions")
    print(f"  Sessions: {len(set(i['session_id'] for i in SAMPLE_INTERACTIONS))}")
    print(f"  Domains: {', '.join(set(d for i in SAMPLE_INTERACTIONS for d in i['domain_signals']))}\n")

    print("  🤖 Agent analyzing interactions...\n")

    agent = DatasetGeneratorAgent()
    result = await agent.generate(SAMPLE_INTERACTIONS)

    if "error" in result:
        print(f"  ✗ Error: {result['error']}")
        return

    datasets = result.get("datasets", [])
    print(f"  ✓ Generated {len(datasets)} datasets\n")

    for i, ds in enumerate(datasets, 1):
        print(f"  ─── Dataset {i}: {ds.get('category', 'unknown')} ───")
        print(f"  Domain: {ds.get('domain', 'unknown')}")
        print(f"  Sample Size: {ds.get('sample_size', 0)}")
        print(f"  Privacy Score: {ds.get('privacy_score', 0)}%")
        print(f"  Quality Score: {ds.get('quality_score', 0)}%")
        print(f"  Claims:")
        for c in ds.get("claims", []):
            print(f"    • {c}")
        if ds.get("patterns"):
            print(f"  Patterns:")
            for p in ds.get("patterns", []):
                print(f"    • {p}")
        print(f"  Use: {ds.get('recommended_use', 'N/A')}\n")

    if result.get("insights"):
        print(f"  ─── Agent Insights ───")
        print(f"  {result['insights']}\n")

    print("═══════════════════════════════════════════")
    print("  DATASET GENERATOR COMPLETE")
    print("═══════════════════════════════════════════")
    print(f"  Agent: LLM-powered (not keyword matching)")
    print(f"  Output: {len(datasets)} labeled datasets")
    print(f"  Ready for model fine-tuning ✓")


if __name__ == "__main__":
    asyncio.run(main())
