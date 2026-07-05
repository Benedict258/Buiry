"""BuirySkill — Buiry memory and context for Google ADK agents."""

import json
import os
import urllib.request
from typing import Optional

DEFAULT_BACKEND = "https://buiry.up.railway.app"


class BuirySkill:
    """A skill that provides persistent build memory for AI agents via Buiry.

    Usage:
        skill = BuirySkill(api_key="buiry_sk_...")
        context = skill.buiry_start_session()
        skill.buiry_remember("Decided to use PostgreSQL for sessions")
        results = skill.buiry_recall("PostgreSQL")
    """

    name: str = "buiry"
    description: str = "Persistent build memory and context for AI agents — powered by Buiry"
    version: str = "0.1.0"

    def __init__(
        self,
        api_key: str = "",
        workspace_id: str = "default",
        backend_url: str = "",
    ):
        self.api_key = api_key or os.environ.get("BUIRY_API_KEY", "")
        self.workspace_id = workspace_id
        self.backend_url = (backend_url or os.environ.get("BUIRY_CLOUD_URL", "") or DEFAULT_BACKEND).rstrip("/")

    def _post(self, path: str, body: dict) -> Optional[dict]:
        if not self.api_key:
            print("[Buiry] Warning: No API key set. Set BUIRY_API_KEY env var.")
            return None
        data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(
            f"{self.backend_url}{path}",
            data=data,
            headers={
                "Content-Type": "application/json",
                "X-Api-Key": self.api_key,
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            print(f"[Buiry] API call failed: {e}")
            return None

    def buiry_start_session(self) -> dict:
        result = self._post("/api/session/cloud/start", {})
        return result or {"error": "Buiry backend unreachable"}

    def buiry_end_session(self, session_object: dict) -> dict:
        result = self._post("/api/session/cloud/end", session_object)
        return result or {"error": "Failed to save session"}

    def buiry_remember(self, content: str, namespace: str = "workspace", session_id: str = "") -> dict:
        if session_id:
            from datetime import datetime, timezone
            result = self._post("/api/session/cloud/decision", {
                "session_id": session_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "decision": content,
                "rationale": content,
            })
        else:
            result = self._post("/api/session/cloud/decision", {
                "session_id": "memory",
                "timestamp": "",
                "decision": content,
                "rationale": content,
            })
        return result or {"error": "Failed to store memory"}

    def buiry_recall(self, query: str, limit: int = 10) -> list:
        result = self._post("/api/session/cloud/search", {"query": query})
        if not result or "sessions" not in result:
            return []
        sessions = result["sessions"]
        return sessions[:limit] if limit else sessions

    def buiry_checkpoint(self, summary: str, next_steps: list) -> dict:
        from datetime import datetime, timezone
        content = f"CHECKPOINT: {summary}\nNext steps: {', '.join(next_steps)}"
        return self.buiry_remember(content)

    def buiry_flag_issue(self, issue: str, session_id: str = "") -> dict:
        result = self._post("/api/session/cloud/issue", {
            "session_id": session_id or "current",
            "issue": issue,
        })
        return result or {"error": "Failed to flag issue"}

    def buiry_init(self, project_name: str, project_description: str = "") -> dict:
        result = self._post("/api/projects", {
            "name": project_name,
            "description": project_description,
        })
        return result or {"error": "Failed to initialize project"}
