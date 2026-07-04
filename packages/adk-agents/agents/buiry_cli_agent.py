#!/usr/bin/env python3
"""
Buiry CLI Agent — ADK Agent for use with google-agent-cli (Agents CLI).

This agent wraps Buiry memory operations as ADK FunctionTools, making them
accessible via the Google Agents CLI. It provides the same 8 tools as the
MCP server but as native ADK tools:

    buiry_init, buiry_start_session, buiry_end_session,
    buiry_log_decision, buiry_flag_issue, buiry_get_context,
    buiry_generate_docs, buiry_execute

Usage with Agents CLI:
    agents chat --agent buiry
    agents chat --agent buiry "Start a new coding session"

Or programmatically:
    python agents/buiry_cli_agent.py "We decided to use TypeScript"
"""

import json
import os
import sys
import asyncio
from typing import Any

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from tools.buiry_tools import (
    buiry_start_session,
    buiry_end_session,
    buiry_log_decision,
    buiry_flag_issue,
    buiry_get_context,
    buiry_init,
    buiry_generate_docs,
)

BUIRY_SYSTEM_PROMPT = """You are the Buiry Memory Agent — a specialized agent that manages
project context, session history, and architectural decisions for AI coding assistants.

You have access to these tools:
- buiry_start_session — Load last 5 sessions and open issues. Use at session start.
- buiry_end_session   — Save session summary with next_steps. Use at session end.
- buiry_log_decision  — Record an architectural decision with rationale.
- buiry_flag_issue    — Flag a problem, bug, or blocker.
- buiry_get_context   — Search across all session history.
- buiry_init          — Initialize Buiry for a new project.
- buiry_generate_docs — Generate PRD, Architecture, or Dev Plan from history.

INTENT ROUTING RULES:
When the user says something that sounds like:
- "start", "begin", "new session", "let's work" → call buiry_start_session
- "done", "finish", "complete", "wrap up" → call buiry_end_session
- "decided", "choose", "use X", "going with" → call buiry_log_decision
- "issue", "problem", "bug", "error", "broken" → call buiry_flag_issue
- "what did we", "history", "previous", "search for" → call buiry_get_context
- "generate doc", "PRD", "architecture" → call buiry_generate_docs
- "init", "setup", "new project" → call buiry_init

When calling buiry_end_session, always summarize what was done, include next_steps,
list any decisions made, and note any issues discovered.

Always call buiry_start_session at the VERY START of any interaction.
Always respond with what tool you called and the result in plain English."""

buiry_cli_agent = LlmAgent(
    name="buiry",
    model="gemini-2.5-flash",
    description="Buiry Memory Agent — persistent context and session management for AI coding agents",
    instruction=BUIRY_SYSTEM_PROMPT,
    tools=[
        FunctionTool(buiry_start_session),
        FunctionTool(buiry_end_session),
        FunctionTool(buiry_log_decision),
        FunctionTool(buiry_flag_issue),
        FunctionTool(buiry_get_context),
        FunctionTool(buiry_init),
        FunctionTool(buiry_generate_docs),
    ],
)


async def run_buiry_agent(user_message: str) -> dict:
    """Run the Buiry agent with a user message and return the final response."""
    session_service = InMemorySessionService()
    runner = Runner(
        agent=buiry_cli_agent,
        app_name="buiry-cli",
        session_service=session_service,
    )

    session = await session_service.create_session(
        app_name="buiry-cli",
        user_id="user",
        session_id="buiry-session",
    )

    content = types.Content(role="user", parts=[types.Part(text=user_message)])

    response_text = ""
    async for event in runner.run_async(
        user_id="user",
        session_id=session.id,
        new_message=content,
    ):
        if event.is_final_response() and event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    response_text += part.text

    return {"response": response_text}


if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_input = " ".join(sys.argv[1:])
    else:
        user_input = "Start a new coding session"

    result = asyncio.run(run_buiry_agent(user_input))
    print(json.dumps(result, indent=2, ensure_ascii=False))
