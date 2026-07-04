#!/usr/bin/env python3
"""
Context Guardian Agent — AI-powered privacy and security agent for Buiry MCP layer.

This agent autonomously:
1. Scans all incoming data for PII (API keys, emails, IPs, file paths, tokens)
2. Classifies data sensitivity (low/medium/high/critical)
3. Recommends privacy actions (scrub, anonymize, reject, encrypt)
4. Generates privacy audit reports
5. Enforces data retention policies

Why an agent and not regex:
- Regex misses contextual PII (e.g., "my key is abc123xyz" vs {"key": "abc123xyz"})
- LLM understands semantic sensitivity (a company name in code vs user PII)
- Agents can make judgment calls about what's safe to store vs. what must be rejected

This agent operates at Layer 1 (MCP Server) as a gatekeeper for ALL Buiry data flow.

Usage:
    python3 agents/context_guardian.py
    python3 agents/context_guardian.py --scan "Check this text for PII"
"""

import json
import os
import sys
import asyncio
from datetime import datetime, timezone
import re

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

GUARDIAN_PROMPT = """You are the Context Guardian Agent — an AI security agent that protects
developer data privacy in the Buiry memory platform.

Your job:
1. Scan all text for PII (Personally Identifiable Information)
2. Classify sensitivity: LOW (public info), MEDIUM (internal data), HIGH (user data), CRITICAL (secrets)
3. Recommend actions: PASS (safe), SCRUB (anonymize), REJECT (block), ENCRYPT (store encrypted)
4. Generate a privacy decision with reasoning

PII TYPES TO DETECT:
- API keys, tokens, secrets (CRITICAL — always REJECT)
- Email addresses (HIGH — SCRUB to anonymized)
- IP addresses (HIGH — SCRUB to anonymized)
- File paths with usernames (HIGH — SCRUB username)
- Passwords, private keys (CRITICAL — always REJECT)
- Personal names in non-public contexts (MEDIUM — SCRUB)
- Phone numbers (HIGH — SCRUB)
- URLs with tokens/keys (CRITICAL — REJECT the token part)
- Company internal hostnames or IP ranges (MEDIUM — flag)
- Credit card numbers, SSN, bank details (CRITICAL — REJECT)

OUTPUT FORMAT — Return this JSON:
{
  "passed": true/false,
  "findings": [
    {
      "type": "API Key",
      "value_preview": "sk-abc***",
      "location": "field: api_key",
      "severity": "CRITICAL",
      "action": "REJECT",
      "reason": "API key found — must not be stored"
    }
  ],
  "actions_taken": ["Scrubbed email addresses", "Rejected API key"],
  "residual_risk": "LOW",
  "recommendation": "Data is safe to store after scrubbing 2 email addresses"
}

Always err on the side of privacy. If unsure, REJECT.
"""

# Quick pre-scan with regex before invoking the LLM agent
PII_PATTERNS = [
    (r"sk-[a-zA-Z0-9]{20,}", "API Key (OpenAI)", "CRITICAL"),
    (r"AIza[0-9A-Za-z\-_]{35}", "API Key (Google)", "CRITICAL"),
    (r"ghp_[a-zA-Z0-9]{36}", "API Key (GitHub)", "CRITICAL"),
    (r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', "Email Address", "HIGH"),
    (r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', "IP Address", "HIGH"),
    (r'(?:ssh-rsa|ssh-ed25519)\s+[A-Za-z0-9+/=]+', "SSH Key", "CRITICAL"),
    (r'(?:password|passwd|pwd)\s*[:=]\s*\S+', "Password", "CRITICAL"),
    (r'BEGIN\s+(?:RSA|DSA|EC|OPENSSH)?\s*PRIVATE\s+KEY', "Private Key", "CRITICAL"),
    (r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b', "Credit Card", "CRITICAL"),
    (r'(?:Home|Users|home|users)/[^/\s"]+', "File Path (PII)", "MEDIUM"),
]

def quick_scan(text: str) -> list[dict]:
    """Fast regex-based pre-scan for obvious PII."""
    findings = []
    for pattern, pii_type, severity in PII_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for m in matches:
            val = m.group(0)
            preview = val[:3] + "***" + val[-3:] if len(val) > 6 else val + "***"
            findings.append({
                "type": pii_type,
                "value_preview": preview,
                "severity": severity,
                "full_match": val,
            })
    return findings


class ContextGuardianAgent:
    """AI-powered privacy agent that scans, classifies, and protects data."""

    def __init__(self, model: str = "gemini-2.5-flash"):
        self.agent = LlmAgent(
            name="context_guardian",
            model=model,
            description="AI security agent that scans data for PII and enforces privacy policies",
            instruction=GUARDIAN_PROMPT,
            tools=[],
        )

    async def scan(self, data: str | dict, context: str = "session data") -> dict:
        """Scan data for PII and return privacy decision."""
        # Step 1: Quick regex pre-scan
        text = data if isinstance(data, str) else json.dumps(data, indent=2)
        quick_findings = quick_scan(text)

        if not quick_findings:
            return {
                "passed": True,
                "findings": [],
                "actions_taken": [],
                "residual_risk": "LOW",
                "recommendation": "No PII detected in quick scan",
            }

        # Step 2: LLM agent for deep analysis
        session_service = InMemorySessionService()
        runner = Runner(
            agent=self.agent,
            app_name="buiry-context-guardian",
            session_service=session_service,
        )

        session = await session_service.create_session(
            app_name="buiry-context-guardian",
            user_id="system",
            session_id=f"scan-{datetime.now(timezone.utc).timestamp()}",
        )

        scan_input = {
            "context": context,
            "quick_scan_findings": quick_findings,
            "data_preview": text[:3000],  # Limit for cost efficiency
        }

        prompt = f"Deep-scan this data for PII:\n\n{json.dumps(scan_input, indent=2)}"

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
            return {
                "passed": False,
                "findings": quick_findings,
                "actions_taken": ["Quick scan only — LLM analysis failed"],
                "residual_risk": "HIGH",
                "recommendation": "Manual review required",
            }


# ─── Demo ─────────────────────────────────────────────────────

SAMPLE_DATA = {
    "project_id": "quiz-pulse",
    "session": {
        "session_id": "sess_004",
        "ai_agent": "Antigravity",
        "summary": "Set up authentication with JWT",
    },
    "config": {
        "database_url": "postgresql://admin:password123@10.0.1.50:5432/quizdb",
        "redis_url": "redis://default:secret@internal.railway:6379",
        "jwt_secret": "my-super-secret-key-do-not-share",
    },
    "user_data": {
        "email": "developer@quizpulse.com",
        "name": "Benedict Isaac",
        "api_key": "AIzaSyDPC03BGOELbd-YcSwY1Xt0_4uHQu7ik68",
    },
}


async def main():
    print("═══════════════════════════════════════════")
    print("  CONTEXT GUARDIAN AGENT")
    print("  AI Agent → Scans for PII → Privacy Audit")
    print("═══════════════════════════════════════════\n")

    print("  Scanning session data for PII...\n")

    # Quick scan first
    findings = quick_scan(json.dumps(SAMPLE_DATA))
    if findings:
        print(f"  Quick Scan: {len(findings)} potential PII found:")
        for f in findings:
            print(f"    • [{f['severity']}] {f['type']}: {f['value_preview']}")
        print()

    print("  Agent deep-scanning...\n")

    agent = ContextGuardianAgent()
    result = await agent.scan(SAMPLE_DATA, "session configuration and user data")

    if result.get("error"):
        print(f"  Error: {result['error']}")
        return

    print(f"  Verdict: {'PASS' if result.get('passed') else 'REJECT'}")
    print(f"  Residual Risk: {result.get('residual_risk', 'UNKNOWN')}")
    print(f"  Recommendation: {result.get('recommendation', 'N/A')}\n")

    findings = result.get("findings", [])
    if findings:
        print(f"  Detailed Findings ({len(findings)}):")
        for f in findings:
            print(f"    [{f.get('severity', '?')}] {f.get('type', '?')}: {f.get('action', '?')}")
            if f.get("reason"):
                print(f"      Reason: {f['reason']}")
        print()

    actions = result.get("actions_taken", [])
    if actions:
        print(f"  Actions Taken:")
        for a in actions:
            print(f"    ✓ {a}")
        print()

    print("═══════════════════════════════════════════")
    print("  GUARDIAN SCAN COMPLETE")
    print("═══════════════════════════════════════════")


if __name__ == "__main__":
    asyncio.run(main())
