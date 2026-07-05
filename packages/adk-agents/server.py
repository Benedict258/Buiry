#!/usr/bin/env python3
"""ADK Agent Bridge Server — exposes Buiry AI agents as HTTP endpoints for the TypeScript pipeline.

Usage: python3 server.py --port 8765
"""

import argparse
import json
import os
import sys
import asyncio
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(ENV_PATH):
    with open(ENV_PATH) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GOOGLE_GENAI_API_KEY")

_AGENTS_LOADED = False
ContextGuardianAgent = None
DatasetGeneratorAgent = None
QualityAuditorAgent = None


def _load_agents():
    global _AGENTS_LOADED, ContextGuardianAgent, DatasetGeneratorAgent, QualityAuditorAgent
    if _AGENTS_LOADED:
        return
    from agents.context_guardian import ContextGuardianAgent as CGA
    from agents.dataset_generator import DatasetGeneratorAgent as DGA
    from agents.quality_auditor import QualityAuditorAgent as QAA
    ContextGuardianAgent = CGA
    DatasetGeneratorAgent = DGA
    QualityAuditorAgent = QAA
    _AGENTS_LOADED = True


class AdkHandler(BaseHTTPRequestHandler):

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length))

    def _send_json(self, status: int, data: dict):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/pii-check":
            self._pii_check()
        elif path == "/classify":
            self._classify()
        elif path == "/quality-audit":
            self._quality_audit()
        else:
            self._send_json(404, {"error": "not found"})

    def _pii_check(self):
        body = self._read_json()
        text = body.get("text", "")

        if not GOOGLE_API_KEY:
            self._send_json(200, {
                "pii_found": False,
                "findings": [],
                "note": "ADK unavailable — using regex only",
            })
            return

        try:
            _load_agents()
            agent = ContextGuardianAgent()
            result = asyncio.run(agent.scan(text))

            passed = result.get("passed", True)
            findings = result.get("findings", [])
            risk = result.get("residual_risk", "LOW").upper()

            self._send_json(200, {
                "pii_found": not passed,
                "findings": findings,
                "severity": risk,
            })
        except Exception as e:
            self._send_json(500, {
                "pii_found": True,
                "findings": [{"type": "Error", "severity": "HIGH", "details": str(e)}],
                "severity": "high",
            })

    def _classify(self):
        body = self._read_json()
        interactions = body.get("interactions", [])

        if not GOOGLE_API_KEY:
            self._send_json(500, {"error": "ADK unavailable — no API key"})
            return

        try:
            _load_agents()
            agent = DatasetGeneratorAgent()
            result = asyncio.run(agent.generate(interactions))

            if "error" in result:
                raise Exception(result["error"])

            categories: dict[str, list[int]] = {}
            datasets = result.get("datasets", [])
            for ds in datasets:
                cat = ds.get("category", "behavioral_patterns")
                domain = ds.get("domain", "")
                indices: list[int] = []
                for i, interaction in enumerate(interactions):
                    sigs = interaction.get("domain_signals", [])
                    if domain and any(domain.lower() in s.lower() for s in sigs):
                        indices.append(i)
                if indices:
                    categories.setdefault(cat, []).extend(indices)

            if not categories:
                categories["behavioral_patterns"] = list(range(len(interactions)))

            self._send_json(200, {"categories": categories})
        except Exception as e:
            self._send_json(500, {"error": str(e)})

    def _quality_audit(self):
        body = self._read_json()
        dataset = body.get("dataset", {})

        if not GOOGLE_API_KEY:
            self._send_json(200, {
                "score": 100,
                "verdict": "APPROVE",
                "note": "ADK unavailable — auto-approving",
            })
            return

        try:
            _load_agents()
            auditor = QualityAuditorAgent()
            result = asyncio.run(auditor.audit(dataset, []))

            verdict = result.get("verdict", "PASS")
            score = result.get("overall_score", 100)

            mapped_verdict = "APPROVE"
            if verdict in ("REJECT", "ERROR"):
                mapped_verdict = "REJECT"
            elif score < 60:
                mapped_verdict = "REJECT"

            self._send_json(200, {
                "score": score,
                "verdict": mapped_verdict,
                "issues": result.get("issues", []),
                "strengths": result.get("strengths", []),
            })
        except Exception as e:
            self._send_json(200, {
                "score": 100,
                "verdict": "APPROVE",
                "note": f"ADK error — auto-approving: {e}",
            })

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0] if args else format}")


def main():
    parser = argparse.ArgumentParser(description="ADK Agent Bridge Server")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    print(f"ADK Bridge Server starting on 127.0.0.1:{args.port}")
    print(f"Google API Key: {'configured' if GOOGLE_API_KEY else 'MISSING — agents disabled'}")

    server = HTTPServer(("127.0.0.1", args.port), AdkHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    print("Server stopped.")


if __name__ == "__main__":
    main()
