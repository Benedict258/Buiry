#!/usr/bin/env python3
"""
Quality Auditor Agent — AI agent that validates dataset quality.

This ADK agent:
1. Reviews every generated dataset for quality issues
2. Validates claims against source interactions
3. Detects bias, imbalance, and low-quality data
4. Assigns quality scores and confidence levels
5. Generates dataset cards (model-card format)
6. Flags datasets that fail quality thresholds

Why an agent and not a rules engine:
- Bias detection requires understanding sensitive topics (gender, race, etc.)
- Claim validation requires semantic comparison between claim and source
- Quality scoring requires holistic assessment, not mechanical metrics

Usage:
    python3 agents/quality_auditor.py
"""

import json
import os
import sys
import asyncio
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

QUALITY_AUDITOR_PROMPT = """You are the Quality Auditor Agent — an AI agent that validates
training dataset quality before release. You are the last line of defense before
data is used for model fine-tuning.

Your job:
1. Review each dataset for quality issues
2. Validate claims: does each claim logically follow from source interactions?
3. Detect bias: are there imbalanced categories, demographic skew, language bias?
4. Assess completeness: are there missing categories or edge cases?
5. Score quality on multiple dimensions
6. Assign an overall GO / NO-GO for model training use

QUALITY DIMENSIONS (score each 0-100):
- Claim Accuracy: Do claims correctly represent source interactions?
- Diversity: Do claims cover multiple perspectives and edge cases?
- Balance: Are categories evenly distributed? No single category dominates?
- Privacy: Is PII properly removed? Any residual PII risk?
- Usefulness: Would these claims actually help fine-tune a model?
- Completeness: Are all relevant patterns captured?

BIAS CATEGORIES TO CHECK:
- Demographic bias (gender, race, age assumptions in claims)
- Geographic bias (Western-centric examples only)
- Language bias (English-only claims when source may be multilingual)
- Tool bias (recommending specific tools without alternatives)
- Complexity bias (all claims assume expert-level knowledge)

PASS THRESHOLD: Overall quality score must be >= 70 to PASS.
Below 70: FLAG and recommend fixes.
Below 50: REJECT — do not use for training.

OUTPUT FORMAT — Return this JSON:
{
  "verdict": "PASS" | "FLAG" | "REJECT",
  "overall_score": 85,
  "dimensions": {
    "claim_accuracy": 90,
    "diversity": 80,
    "balance": 85,
    "privacy": 95,
    "usefulness": 88,
    "completeness": 75
  },
  "bias_findings": [
    { "type": "geographic", "severity": "LOW", "finding": "Claims reference common Western tools (React, Express, Docker) but no region-specific tools" }
  ],
  "issues": [
    { "severity": "MEDIUM", "issue": "Missing mobile development patterns", "recommendation": "Add React Native or Flutter claims" }
  ],
  "strengths": [
    "Strong real-time WebSocket patterns",
    "Good security best practices"
  ],
  "improvement_suggestions": [
    "Add edge case: 'What to do when WebSocket connection is rejected by firewall'",
    "Add mobile development patterns"
  ],
  "dataset_card": "# Dataset Card\\n\\n## Summary\\n...\\n\\n## Intended Use\\n...\\n\\n## Limitations\\n...",
  "recommendation": "PASS — dataset is ready for fine-tuning. Add mobile patterns before v2."
}
"""


class QualityAuditorAgent:
    """ADK agent that validates dataset quality before release."""

    def __init__(self, model: str = "gemini-2.5-flash"):
        self.agent = LlmAgent(
            name="quality_auditor",
            model=model,
            description="Validates dataset quality, detects bias, and generates model cards",
            instruction=QUALITY_AUDITOR_PROMPT,
            tools=[],
        )

    async def audit(self, dataset: dict, source_interactions: list[dict]) -> dict:
        """Audit a dataset against its source interactions."""
        session_service = InMemorySessionService()
        runner = Runner(
            agent=self.agent,
            app_name="buiry-quality-auditor",
            session_service=session_service,
        )

        session = await session_service.create_session(
            app_name="buiry-quality-auditor",
            user_id="system",
            session_id=f"audit-{datetime.now(timezone.utc).timestamp()}",
        )

        audit_input = {
            "dataset": dataset,
            "source_interactions": source_interactions,
            "source_count": len(source_interactions),
            "claim_count": len(dataset.get("claims", [])),
        }

        prompt = f"Audit this dataset for quality, bias, and completeness:\n\n{json.dumps(audit_input, indent=2)}"

        content = types.Content(role="user", parts=[types.Part(text=prompt)])

        result_text = ""
        async for event in runner.run_async(user_id="system", session_id=session.id, new_message=content):
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
            return {"verdict": "ERROR", "raw_output": result_text}


# ─── Demo ─────────────────────────────────────────────────────

SAMPLE_DATASET = {
    "category": "performance_optimization",
    "domain": "backend",
    "sample_size": 2,
    "privacy_score": 100,
    "quality_score": 90,
    "claims": [
        "Use EXPLAIN ANALYZE to identify slow PostgreSQL queries",
        "Add composite indexes on frequently filtered columns for PostgreSQL",
        "Wrap React components in React.memo() to prevent unnecessary re-renders",
        "Use useCallback for event handlers passed as props in React",
    ],
    "patterns": ["Database indexing strategies", "Query analysis", "Component memoization"],
    "summary": "Dataset of performance optimization patterns from 2 sessions",
    "recommended_use": "Fine-tuning for performance optimization advice",
}

SOURCE_INTERACTIONS = [
    {
        "query": "How do I optimize PostgreSQL queries for a dashboard with 1M rows?",
        "response": "Use EXPLAIN ANALYZE to identify slow queries. Add composite indexes on frequently filtered columns...",
        "domain": "backend",
    },
    {
        "query": "My React component keeps re-rendering, how do I fix it?",
        "response": "Wrap the component in React.memo() to prevent unnecessary re-renders. Use useCallback for event handlers...",
        "domain": "frontend",
    },
]


async def main():
    print("═══════════════════════════════════════════")
    print("  QUALITY AUDITOR AGENT")
    print("  AI Agent → Validates datasets → Model Cards")
    print("═══════════════════════════════════════════\n")

    print(f"  Auditing dataset: {SAMPLE_DATASET['category']} ({SAMPLE_DATASET['sample_size']} samples)")
    print(f"  Claims to validate: {len(SAMPLE_DATASET['claims'])}\n")

    print("  Agent auditing...\n")

    auditor = QualityAuditorAgent()
    result = await auditor.audit(SAMPLE_DATASET, SOURCE_INTERACTIONS)

    print(f"  Verdict: {result.get('verdict', 'UNKNOWN')}")
    print(f"  Overall Score: {result.get('overall_score', '?')}/100\n")

    dims = result.get("dimensions", {})
    if dims:
        print("  Quality Dimensions:")
        for k, v in dims.items():
            bar = "█" * (v // 10)
            print(f"    {k:20s} {bar} {v}%")
        print()

    bias = result.get("bias_findings", [])
    if bias:
        print(f"  Bias Findings ({len(bias)}):")
        for b in bias:
            print(f"    [{b.get('severity', '?')}] {b.get('type')}: {b.get('finding')}")
        print()

    issues = result.get("issues", [])
    if issues:
        print(f"  Issues ({len(issues)}):")
        for i in issues:
            print(f"    [{i.get('severity', '?')}] {i.get('issue')}")
            if i.get("recommendation"):
                print(f"      Fix: {i['recommendation']}")
        print()

    strengths = result.get("strengths", [])
    if strengths:
        print(f"  Strengths:")
        for s in strengths:
            print(f"    ✓ {s}")
        print()

    print(f"  Recommendation: {result.get('recommendation', 'N/A')}")

    print("\n═══════════════════════════════════════════")
    print("  AUDIT COMPLETE")
    print("═══════════════════════════════════════════")


if __name__ == "__main__":
    asyncio.run(main())
