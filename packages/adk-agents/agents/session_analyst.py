#!/usr/bin/env python3
"""
Session Analyst Agent — An AI agent that reviews coding sessions and generates insights.

This agent autonomously:
1. Reads all session history from Build-Context-Memory.json
2. Identifies patterns, trends, and recurring issues
3. Predicts next steps based on past behavior
4. Generates actionable insights for developers
5. Detects potential risks and blockers before they happen

Why an agent and not a script:
- Keyword search can't detect "you keep hitting this same class of error"
- An LLM understands the semantic meaning of decisions, not just text matching
- Pattern recognition across sessions requires understanding project evolution

Usage:
    python3 agents/session_analyst.py
    python3 agents/session_analyst.py --project-root /path/to/project
"""

import json
import os
import sys
import asyncio
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

SESSION_ANALYST_PROMPT = """You are the Session Analyst Agent — an AI agent that reviews coding session
history and generates insights, predictions, and recommendations.

Your job:
1. Analyze session history for patterns
2. Identify what the developer/team most commonly works on
3. Detect recurring issues or error patterns
4. Predict next steps based on project trajectory
5. Recommend areas that need attention

ANALYSIS CATEGORIES:
- Top Skills: What technologies, frameworks, and patterns appear most
- Growth Areas: What the developer is learning or improving at
- Recurring Issues: Problems that keep appearing across sessions
- Decision Patterns: Consistent architectural choices
- Risk Areas: Code areas with most issues or changes
- Velocity: Progress rate, session completion patterns
- Knowledge Gaps: Topics where the developer frequently asks for help

OUTPUT FORMAT — Return this JSON:
{
  "profile": {
    "top_domains": ["backend", "api"],
    "top_technologies": ["Express.js", "PostgreSQL", "React"],
    "skill_level": "intermediate",
    "primary_focus": "Building real-time web applications"
  },
  "patterns": [
    { "pattern": "Prefers TypeScript over JavaScript", "confidence": 95, "evidence": "3 sessions" },
    { "pattern": "Common error: WebSocket reconnection handling", "confidence": 80, "evidence": "2 sessions" }
  ],
  "recurring_issues": [
    { "issue": "WebSocket connection drops", "frequency": "2 of 3 sessions", "severity": "medium" }
  ],
  "predictions": [
    "Next session will likely focus on deployment and CI/CD",
    "Will need rate limiting for the WebSocket implementation"
  ],
  "recommendations": [
    "Add error boundary patterns to the frontend",
    "Implement structured logging before going to production"
  ],
  "summary": "This developer is building a real-time quiz platform. They work primarily in the backend domain with Express.js and PostgreSQL. The most common challenge is WebSocket reliability."
}
"""


class SessionAnalystAgent:
    """LLM-powered agent that analyzes session history and generates insights."""

    def __init__(self, model: str = "gemini-2.5-flash"):
        self.agent = LlmAgent(
            name="session_analyst",
            model=model,
            description="Analyzes coding session history to generate patterns, predictions, and recommendations",
            instruction=SESSION_ANALYST_PROMPT,
            tools=[],
        )

    async def analyze(self, sessions: list[dict], project_identity: dict) -> dict:
        """Analyze session history and return insights."""
        session_service = InMemorySessionService()
        runner = Runner(
            agent=self.agent,
            app_name="buiry-session-analyst",
            session_service=session_service,
        )

        session = await session_service.create_session(
            app_name="buiry-session-analyst",
            user_id="system",
            session_id=f"analyze-{datetime.now(timezone.utc).timestamp()}",
        )

        context = {
            "project": project_identity,
            "sessions": sessions,
            "total_sessions": len(sessions),
        }

        prompt = f"Analyze this project's session history and generate insights:\n\n{json.dumps(context, indent=2)}"

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

        try:
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            return json.loads(result_text.strip())
        except json.JSONDecodeError:
            return {"error": "Failed to parse agent output", "raw": result_text}


# ─── Demo ─────────────────────────────────────────────────────

SAMPLE_SESSIONS = [
    {
        "session_id": "sess_001",
        "timestamp": "2026-07-01T10:00:00Z",
        "ai_agent": "Antigravity + Buiry",
        "current_phase": "Architecture Planning",
        "progress": 100,
        "last_session_summary": "Designed quiz platform architecture. Decided on Express.js backend, React frontend, PostgreSQL for persistence, Redis for real-time state. Created PRD, architecture document, and dev plan.",
        "decisions_log": [
            {
                "decision": "Use PostgreSQL exclusively for persistence",
                "rationale": "ACID compliance for transactional game data, JSONB support for dynamic question structures"
            },
            {
                "decision": "Use Redis for active game state",
                "rationale": "Sub-second reads for real-time gameplay, minimizes load on PostgreSQL"
            }
        ],
        "known_issues": [],
        "next_steps": ["Set up monorepo with backend and frontend", "Configure PostgreSQL and Redis connections"],
    },
    {
        "session_id": "sess_002",
        "timestamp": "2026-07-01T14:00:00Z",
        "ai_agent": "Antigravity + Buiry",
        "current_phase": "Backend Development",
        "progress": 60,
        "last_session_summary": "Started Express.js backend. Implemented quiz CRUD endpoints, JWT authentication, and WebSocket game server. Discovered WebSocket reconnection issue under load.",
        "decisions_log": [
            {
                "decision": "Use JWT with refresh tokens for auth",
                "rationale": "Stateless auth for API, refresh tokens for long-lived sessions"
            }
        ],
        "known_issues": [
            "WebSocket connection drops when multiple players join simultaneously"
        ],
        "next_steps": ["Implement WebSocket debouncing", "Add rate limiting", "Set up Redis caching layer"],
    },
    {
        "session_id": "sess_003",
        "timestamp": "2026-07-02T09:00:00Z",
        "ai_agent": "Antigravity + Buiry",
        "current_phase": "Infrastructure Setup",
        "progress": 40,
        "last_session_summary": "Set up Docker multi-stage builds, GitHub Actions CI/CD, Railway deployment. Configured environment variables and health checks.",
        "decisions_log": [
            {
                "decision": "Use multi-stage Docker builds",
                "rationale": "Smaller production images, no dev dependencies in production"
            }
        ],
        "known_issues": [],
        "next_steps": ["Complete CI/CD pipeline", "Set up staging environment", "Add structured logging"],
    },
]


async def main():
    print("═══════════════════════════════════════════")
    print("  SESSION ANALYST AGENT")
    print("  AI Agent → Analyzes sessions → Pattern Insights")
    print("═══════════════════════════════════════════\n")

    print(f"  Input: {len(SAMPLE_SESSIONS)} sessions")
    print(f"  Project: QuizPulse — Real-time quiz platform\n")

    print("  Agent analyzing sessions...\n")

    agent = SessionAnalystAgent()
    result = await agent.analyze(SAMPLE_SESSIONS, {
        "name": "QuizPulse",
        "description": "Real-time quiz platform (Kahoot! clone) built with Express.js and React"
    })

    if "error" in result:
        print(f"  Error: {result.get('error')}")
        if "raw" in result:
            print(f"  Raw: {result['raw'][:500]}")
        return

    profile = result.get("profile", {})
    print(f"  Developer Profile:")
    print(f"    Skills: {', '.join(profile.get('top_technologies', []))}")
    print(f"    Level: {profile.get('skill_level', 'unknown')}")
    print(f"    Focus: {profile.get('primary_focus', 'unknown')}\n")

    patterns = result.get("patterns", [])
    if patterns:
        print(f"  Detected Patterns:")
        for p in patterns:
            print(f"    • {p.get('pattern')} (confidence: {p.get('confidence', 0)}%)")
        print()

    issues = result.get("recurring_issues", [])
    if issues:
        print(f"  Recurring Issues:")
        for i in issues:
            print(f"    • {i.get('issue')} — {i.get('frequency')} (severity: {i.get('severity')})")
        print()

    predictions = result.get("predictions", [])
    if predictions:
        print(f"  Predictions:")
        for p in predictions:
            print(f"    • {p}")
        print()

    recommendations = result.get("recommendations", [])
    if recommendations:
        print(f"  Recommendations:")
        for r in recommendations:
            print(f"    • {r}")
        print()

    print(f"  Summary: {result.get('summary', 'N/A')}")

    print("\n═══════════════════════════════════════════")
    print("  SESSION ANALYST COMPLETE")
    print("═══════════════════════════════════════════")


if __name__ == "__main__":
    asyncio.run(main())
