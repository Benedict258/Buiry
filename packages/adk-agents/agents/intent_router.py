#!/usr/bin/env python3
"""
Intent Router Agent — Classifies user input into MCP tool calls.
Lightweight version: just classification, no MCP call.
"""

import json
import os
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

INTENT_PROMPT = """You are an intent classifier for the Buiry MCP memory system.

Analyze the user's message and classify it into EXACTLY ONE intent:

INTENTS:
1. start_session — User begins work, first message, says "start", "begin", "let's work", "new session"
2. end_session — User says "done", "finished", "complete", "wrap up", "that's it", "end session"
3. log_decision — User states a technical choice: "decided to use X", "we'll use Y", "choice: Z"
4. flag_issue — User reports a problem: "issue:", "problem:", "blocker:", "bug:", "error:"
5. get_context — User asks about history: "what did we decide", "previous session", "history of", "search for"
6. generate_docs — User asks for docs: "generate PRD", "create architecture doc", "write dev plan"
7. none — General chat, code requests, questions not about memory

OUTPUT FORMAT (raw JSON only, no markdown, no code fences):
{"intent": "start_session", "params": {}}
{"intent": "log_decision", "params": {"decision": "Use TypeScript for SDK", "rationale": "Type safety"}}
{"intent": "flag_issue", "params": {"issue": "Network timeout on API calls", "severity": "high"}}
{"intent": "get_context", "params": {"query": "authentication decisions"}}
{"intent": "generate_docs", "params": {"doc_type": "PRD"}}
{"intent": "none", "params": {}}

RULES:
- Output ONLY the JSON object, nothing else
- If unsure, default to "none"
- Extract params from user's message naturally
- For end_session, require explicit completion signal
- Do NOT add explanations, only JSON
"""

intent_router = LlmAgent(
    name="intent_router",
    model="gemini-2.5-flash",
    instruction=INTENT_PROMPT,
)

async def classify_intent(user_message: str) -> dict:
    """Classify user message into intent."""
    session_service = InMemorySessionService()
    runner = Runner(
        agent=intent_router,
        app_name="buiry-intent-router",
        session_service=session_service,
    )
    
    session = await session_service.create_session(
        app_name="buiry-intent-router",
        user_id="user",
        session_id="intent-session"
    )
    
    content = types.Content(role="user", parts=[types.Part(text=user_message)])
    
    async for event in runner.run_async(
        user_id="user",
        session_id=session.id,
        new_message=content,
    ):
        if event.is_final_response() and event.content and event.content.parts:
            try:
                result = json.loads(event.content.parts[0].text)
                return result
            except json.JSONDecodeError:
                return {"intent": "none", "params": {}, "raw": event.content.parts[0].text}
    
    return {"intent": "none", "params": {}}

if __name__ == "__main__":
    import sys
    import asyncio
    if len(sys.argv) > 1:
        user_input = " ".join(sys.argv[1:])
        result = asyncio.run(classify_intent(user_input))
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python intent_router.py \"user message here\"")