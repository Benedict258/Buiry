#!/usr/bin/env python3
"""
Buiry Tools for Google ADK — Direct implementations of Buiry memory operations.
These are FunctionTool-compatible wrappers that read/write Build-Context-Memory.json,
providing the same capabilities as the MCP server but as native ADK tools.

Used by: buiry_cli_agent.py (for Agents CLI) and intent_router.py
"""

import json
import os
from datetime import datetime, timezone

MEMORY_FILENAME = "Build-Context-Memory.json"

def _memory_path(project_root: str) -> str:
    return os.path.join(project_root, MEMORY_FILENAME)

def _detect_root(project_root: str | None = None) -> str:
    if project_root:
        return project_root
    env = os.environ.get("BUIRY_PROJECT_ROOT")
    if env:
        return env
    return os.getcwd()

def _read_memory(project_root: str) -> dict:
    path = _memory_path(project_root)
    try:
        with open(path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "project_identity": {"name": "Unknown", "description": "No project initialized"},
            "summary": "No sessions yet.",
            "sessions": [],
        }
    except json.JSONDecodeError:
        raise ValueError(f"{MEMORY_FILENAME} is not valid JSON")

def _write_memory(project_root: str, memory: dict) -> None:
    path = _memory_path(project_root)
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w") as f:
        json.dump(memory, f, indent=2)
        f.write("\n")


def buiry_start_session(project_root: str | None = None) -> dict:
    """Read Build-Context-Memory.json and return last 5 sessions."""
    root = _detect_root(project_root)
    try:
        memory = _read_memory(root)
        last5 = memory["sessions"][-5:]

        open_issues = []
        seen = set()
        for s in memory["sessions"]:
            for issue in s.get("known_issues", []):
                if issue not in seen:
                    open_issues.append(issue)
                    seen.add(issue)

        return {
            "success": True,
            "project_identity": memory.get("project_identity", {}),
            "summary": memory.get("summary", "No summary"),
            "last_5_sessions": [
                {
                    "session_id": s.get("session_id"),
                    "timestamp": s.get("timestamp"),
                    "ai_agent": s.get("ai_agent"),
                    "current_phase": s.get("current_phase"),
                    "progress": s.get("progress"),
                    "last_session_summary": s.get("last_session_summary"),
                    "next_steps": s.get("next_steps", []),
                }
                for s in last5
            ],
            "open_issues": open_issues,
            "total_sessions": len(memory["sessions"]),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def buiry_end_session(session: dict, project_root: str | None = None) -> dict:
    """Validate and append a session to Build-Context-Memory.json."""
    root = _detect_root(project_root)
    try:
        session.setdefault("session_id", f"sess_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}")
        session.setdefault("timestamp", datetime.now(timezone.utc).isoformat())
        session.setdefault("known_issues", [])
        session.setdefault("decisions_log", [])
        session.setdefault("next_steps", [])
        session.setdefault("changes_made", [])
        session.setdefault("file_module_map", {})
        session.setdefault("progress", 0)
        session.setdefault("current_phase", "development")
        session.setdefault("ai_agent", "google-adk")
        session.setdefault("last_session_summary", "Session completed via Buiry ADK agent")

        memory = _read_memory(root)
        memory["sessions"].append(session)

        _write_memory(root, memory)

        return {
            "success": True,
            "session_id": session["session_id"],
            "total_sessions": len(memory["sessions"]),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def buiry_log_decision(
    decision: str,
    rationale: str,
    alternatives: list[str] | None = None,
    project_root: str | None = None,
) -> dict:
    """Log an architectural decision to the active session."""
    root = _detect_root(project_root)
    try:
        memory = _read_memory(root)
        if not memory["sessions"]:
            return {"success": False, "error": "No active session. Start a session first."}

        session = memory["sessions"][-1]
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "decision": decision,
            "rationale": rationale,
        }
        if alternatives:
            entry["alternatives_considered"] = alternatives
        session.setdefault("decisions_log", []).append(entry)

        _write_memory(root, memory)

        return {
            "success": True,
            "session_id": session["session_id"],
            "decisions_logged": len(session["decisions_log"]),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def buiry_flag_issue(issue: str, project_root: str | None = None) -> dict:
    """Flag an issue to the active session."""
    root = _detect_root(project_root)
    try:
        memory = _read_memory(root)
        if not memory["sessions"]:
            return {"success": False, "error": "No active session. Start a session first."}

        session = memory["sessions"][-1]
        session.setdefault("known_issues", []).append(issue)

        _write_memory(root, memory)

        return {
            "success": True,
            "session_id": session["session_id"],
            "known_issues": session["known_issues"],
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def buiry_get_context(query: str, limit: int = 10, project_root: str | None = None) -> dict:
    """Search across all sessions for a query string."""
    root = _detect_root(project_root)
    try:
        memory = _read_memory(root)
        q = query.lower()
        matches = [
            {
                "session_id": s.get("session_id"),
                "timestamp": s.get("timestamp"),
                "summary": s.get("last_session_summary"),
                "matched_in": "session",
            }
            for s in memory["sessions"]
            if q in json.dumps(s).lower()
        ]

        results = matches[-limit:] if len(matches) > limit else matches

        return {
            "success": True,
            "query": query,
            "match_count": len(matches),
            "returned_count": len(results),
            "sessions": results,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def buiry_init(
    project_name: str,
    project_description: str,
    project_root: str | None = None,
) -> dict:
    """Initialize Buiry file structure for a new project."""
    root = _detect_root(project_root)
    try:
        buiry_dir = os.path.join(root, ".buiry")
        os.makedirs(buiry_dir, exist_ok=True)

        memory = {
            "project_identity": {
                "name": project_name,
                "description": project_description,
            },
            "summary": "No sessions yet.",
            "sessions": [],
        }
        _write_memory(root, memory)

        return {
            "success": True,
            "project_root": root,
            "files_created": [MEMORY_FILENAME],
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def buiry_generate_docs(doc_type: str, project_root: str | None = None) -> dict:
    """Generate a PRD, Architecture, or Dev Plan from session history."""
    root = _detect_root(project_root)
    try:
        memory = _read_memory(root)
        sessions = memory.get("sessions", [])

        if doc_type == "prd":
            content = _generate_prd(memory)
        elif doc_type == "architecture":
            content = _generate_architecture(memory)
        elif doc_type == "dev_plan":
            content = _generate_dev_plan(memory)
        else:
            content = f"Unknown doc_type: {doc_type}"

        return {
            "success": True,
            "doc_type": doc_type,
            "session_count": len(sessions),
            "content": content,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def _generate_prd(memory: dict) -> str:
    sessions = memory.get("sessions", [])
    latest = sessions[-3:]
    progress_notes = "\n".join(
        f"- Session {s.get('session_id')}: {s.get('current_phase')} ({s.get('progress')}%) — {s.get('last_session_summary')}"
        for s in latest
    )
    all_steps = list({s for ss in latest for s in ss.get("next_steps", [])})
    return f"""# Product Requirements Document

## Overview
**Project**: {memory.get('project_identity', {}).get('name', 'Unknown')}
**Description**: {memory.get('project_identity', {}).get('description', 'N/A')}

## Current Status
{memory.get('summary', 'No summary')}

## Progress from Sessions
{progress_notes or '_No session data yet._'}

## Next Steps
{chr(10).join(f'- {s}' for s in all_steps) or '_None recorded._'}
"""


def _generate_architecture(memory: dict) -> str:
    sessions = memory.get("sessions", [])
    all_decisions = [
        {**d, "session_id": s.get("session_id")}
        for s in sessions
        for d in s.get("decisions_log", [])
    ]
    decisions_section = "\n\n".join(
        f"### {d.get('decision')}\n- **Rationale**: {d.get('rationale')}\n- **Session**: {d.get('session_id')}"
        for d in all_decisions
    ) or "_No decisions recorded._"

    return f"""# Architecture

## System Overview
{memory.get('summary', 'No summary')}

## Key Decisions
{decisions_section}
"""


def _generate_dev_plan(memory: dict) -> str:
    sessions = memory.get("sessions", [])
    latest = sessions[-1] if sessions else None
    all_issues = [
        {"issue": i, "session_id": s.get("session_id")}
        for s in sessions
        for i in s.get("known_issues", [])
    ]
    all_steps = list({s for ss in sessions for s in ss.get("next_steps", [])})

    return f"""# Development Plan

## Current Phase
{latest.get('current_phase') + ' (' + str(latest.get('progress')) + '%)' if latest else '_No active session._'}

## Summary
{memory.get('summary', 'No summary')}

## Next Steps
{chr(10).join(f'- {s}' for s in all_steps) or '_None recorded._'}

## Known Issues
{chr(10).join(f'- [{i.get("session_id")}] {i.get("issue")}' for i in all_issues) or '_No issues recorded._'}
"""
