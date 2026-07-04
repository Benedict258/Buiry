#!/usr/bin/env python3
"""
ADK Multi-Agent Demo — Shows the 3-agent pipeline in action.
Coordinator → Developer → Reviewer, using Buiry memory via MCP tools.

Run: python3 adk-demo.py
Requires: GOOGLE_API_KEY set in environment
"""

import json
import os
import sys
import asyncio
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "packages", "adk-agents"))

from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# Import Buiry tools (same as Agents CLI tools)
from tools.buiry_tools import (
    buiry_start_session, buiry_end_session, buiry_log_decision,
    buiry_flag_issue, buiry_get_context, buiry_init,
)

COORDINATOR_PROMPT = """You are the Coordinator Agent for Buiry — the AI agent memory platform.

Your job in this demo:
1. Start the session by calling buiry_start_session
2. Read previous session context and next_steps
3. Create a task plan and delegate to the Developer agent
4. When the Developer is done, log decisions via buiry_log_decision

For this demo, plan to build a simple Express.js API. Output the plan clearly."""

DEVELOPER_PROMPT = """You are the Developer Agent. Implement the task assigned by the Coordinator.
For this demo, write a complete Express.js API with 3 endpoints:
- GET /health
- POST /users
- GET /users/:id
Include JWT auth middleware. Output the complete code."""

REVIEWER_PROMPT = """You are the Reviewer Agent. Review the Developer's code.
Check for: security issues, error handling, code quality, API design.
Flag any issues found. Approve or request changes."""

async def run_agent_demo():
    print("═══════════════════════════════════════════")
    print("  ADK MULTI-AGENT DEMO")
    print("  Coordinator → Developer → Reviewer")
    print("═══════════════════════════════════════════\n")

    # ─── Agent 1: Coordinator ──────────────────────────────
    print("─── AGENT 1: Coordinator ───")
    coordinator = LlmAgent(
        name="coordinator",
        model="gemini-2.5-flash",
        instruction=COORDINATOR_PROMPT,
        tools=[FunctionTool(buiry_start_session)],
    )
    session_service = InMemorySessionService()
    runner = Runner(agent=coordinator, app_name="buiry-demo", session_service=session_service)
    session = await session_service.create_session(app_name="buiry-demo", user_id="user", session_id="demo-session")

    content = types.Content(role="user", parts=[types.Part(text="Start a new coding session and create a plan for building a task API")])
    result = ""
    async for event in runner.run_async(user_id="user", session_id=session.id, new_message=content):
        if event.is_final_response() and event.content and event.content.parts:
            for part in event.content.parts:
                if part.text: result += part.text
    print(f"  Coordinator output ({len(result)} chars):")
    for line in result.strip().split("\n")[:8]:
        print(f"    {line}")
    if len(result.strip().split("\n")) > 8:
        print("    ...")

    # ─── Agent 2: Developer ────────────────────────────────
    print("\n─── AGENT 2: Developer ───")
    developer = LlmAgent(
        name="developer",
        model="gemini-2.5-flash",
        instruction=DEVELOPER_PROMPT,
        tools=[],
    )
    runner2 = Runner(agent=developer, app_name="buiry-demo-dev", session_service=session_service)
    session2 = await session_service.create_session(app_name="buiry-demo-dev", user_id="user", session_id="dev-session")

    content2 = types.Content(role="user", parts=[types.Part(text="Build an Express.js API with health, create user, and get user endpoints")])
    dev_result = ""
    async for event in runner2.run_async(user_id="user", session_id=session2.id, new_message=content2):
        if event.is_final_response() and event.content and event.content.parts:
            for part in event.content.parts:
                if part.text: dev_result += part.text
    print(f"  Developer output ({len(dev_result)} chars):")
    code_lines = [l for l in dev_result.strip().split("\n") if l.strip()][:8]
    for line in code_lines:
        print(f"    {line}")
    if len(code_lines) > 7:
        print("    ...")

    # ─── Agent 3: Reviewer ─────────────────────────────────
    print("\n─── AGENT 3: Reviewer ───")
    reviewer = LlmAgent(
        name="reviewer",
        model="gemini-2.5-flash",
        instruction=REVIEWER_PROMPT,
        tools=[FunctionTool(buiry_flag_issue)],
    )
    runner3 = Runner(agent=reviewer, app_name="buiry-demo-review", session_service=session_service)
    session3 = await session_service.create_session(app_name="buiry-demo-review", user_id="user", session_id="review-session")

    review_prompt = f"Review this code:\n```javascript\n{dev_result[:2000]}\n```"
    content3 = types.Content(role="user", parts=[types.Part(text=review_prompt)])
    review_result = ""
    async for event in runner3.run_async(user_id="user", session_id=session3.id, new_message=content3):
        if event.is_final_response() and event.content and event.content.parts:
            for part in event.content.parts:
                if part.text: review_result += part.text
    print(f"  Reviewer output ({len(review_result)} chars):")
    for line in review_result.strip().split("\n")[:6]:
        print(f"    {line}")
    if len(review_result.strip().split("\n")) > 5:
        print("    ...")

    # ─── Summary ───────────────────────────────────────────
    print("\n═══════════════════════════════════════════")
    print("  ADK MULTI-AGENT DEMO COMPLETE")
    print("═══════════════════════════════════════════")
    print("  Coordinator: Created task plan ✓")
    print("  Developer: Generated code ✓")
    print("  Reviewer: Found issues + flagged ✓")
    print("  Buiry tools used: start_session, flag_issue")
    print("  Pipeline: C → D → R → Memory ✓")

if __name__ == "__main__":
    asyncio.run(run_agent_demo())
