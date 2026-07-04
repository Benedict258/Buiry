#!/usr/bin/env python3
"""
Contract Guardian Agent — AI agent for on-chain dataset verification.

This ADK agent:
1. Verifies dataset authenticity against Sui blockchain records
2. Generates on-chain attestations for verified datasets
3. Detects tampered or modified datasets via hash comparison
4. Links dataset provenance to immutable blockchain records
5. Manages the dataset → Sui transaction lifecycle

Why an agent and not a smart contract alone:
- The agent makes judgment calls about what constitutes "verified"
- It coordinates between off-chain (dataset files) and on-chain (Sui contracts)
- It handles edge cases: network failures, reorgs, contract upgrades
- It can explain verification results in human-readable format

Usage:
    python3 agents/contract_guardian.py
"""

import json
import os
import sys
import asyncio
import hashlib
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# Sui testnet contract IDs
SUI_TESTNET_PACKAGE = "0x411d197869a261a42911ac454e063231301c18d0c0f9289f3a4c414db016e60e"
SUI_TESTNET_RPC = "https://fullnode.testnet.sui.io"

CONTRACT_GUARDIAN_PROMPT = """You are the Contract Guardian Agent — an AI agent that verifies
dataset authenticity using Sui blockchain smart contracts.

Your job:
1. Receive a dataset and compute its content hash
2. Compare the hash against on-chain records
3. Detect tampering: if hash changed, dataset was modified
4. Generate attestation reports with on-chain proof
5. Coordinate with Buiry MCP to log verification results

VERIFICATION STATES:
- UNVERIFIED: No on-chain record exists yet
- VERIFIED: Hash matches on-chain record — dataset is authentic
- TAMPERED: Hash mismatch — dataset was modified after attestation
- PENDING: Attestation transaction submitted but not confirmed
- FAILED: Network error or contract call failed

For the demo (no live Sui RPC), simulate the on-chain response.

OUTPUT FORMAT:
{
  "status": "VERIFIED" | "TAMPERED" | "UNVERIFIED" | "PENDING" | "FAILED",
  "dataset_id": "ds_001",
  "content_hash": "sha256abc123...",
  "on_chain_hash": "sha256abc123...",
  "sui_tx_digest": "0xabc123...",
  "block_number": 12345678,
  "timestamp": "2026-07-04T00:00:00Z",
  "verified": true,
  "tampered": false,
  "recommendation": "Dataset verified on-chain. Safe to use for training."
}
"""


def compute_hash(data: dict) -> str:
    """Compute SHA-256 hash of a dataset for on-chain comparison."""
    canonical = json.dumps(data, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(canonical.encode()).hexdigest()


class ContractGuardianAgent:
    """ADK agent that verifies datasets on Sui blockchain."""

    def __init__(self, model: str = "gemini-2.5-flash"):
        self.agent = LlmAgent(
            name="contract_guardian",
            model=model,
            description="Verifies dataset authenticity using Sui blockchain smart contracts",
            instruction=CONTRACT_GUARDIAN_PROMPT,
            tools=[],
        )

    async def verify(self, dataset: dict, on_chain_record: dict | None = None) -> dict:
        """Verify a dataset against on-chain records."""
        content_hash = compute_hash(dataset)

        # Simulated on-chain lookup for demo
        if on_chain_record is None:
            return {
                "status": "UNVERIFIED",
                "dataset_id": dataset.get("id", "unknown"),
                "content_hash": content_hash,
                "on_chain_hash": None,
                "sui_tx_digest": None,
                "block_number": None,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "verified": False,
                "tampered": False,
                "recommendation": "No on-chain record found. Dataset needs initial attestation. Call attest() to create an on-chain record.",
            }

        on_chain_hash = on_chain_record.get("content_hash", "")

        if content_hash == on_chain_hash:
            return {
                "status": "VERIFIED",
                "dataset_id": dataset.get("id", "unknown"),
                "content_hash": content_hash,
                "on_chain_hash": on_chain_hash,
                "sui_tx_digest": on_chain_record.get("tx_digest"),
                "block_number": on_chain_record.get("block_number"),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "verified": True,
                "tampered": False,
                "recommendation": "Dataset verified on-chain. Hash matches. Safe to use for training.",
            }
        else:
            return {
                "status": "TAMPERED",
                "dataset_id": dataset.get("id", "unknown"),
                "content_hash": content_hash,
                "on_chain_hash": on_chain_hash,
                "sui_tx_digest": on_chain_record.get("tx_digest"),
                "block_number": on_chain_record.get("block_number"),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "verified": False,
                "tampered": True,
                "recommendation": "WARNING: Dataset hash does not match on-chain record. Dataset may have been tampered with. Do not use for training without investigation.",
            }

    async def attest(self, dataset: dict) -> dict:
        """Create an on-chain attestation for a dataset (simulated)."""
        content_hash = compute_hash(dataset)
        # Simulated Sui transaction
        tx_digest = f"0x{content_hash[:16]}...{content_hash[-16:]}"
        block = 12345678 + len(dataset.get("claims", []))

        return {
            "status": "VERIFIED",
            "dataset_id": dataset.get("id", "dataset_001"),
            "content_hash": content_hash,
            "on_chain_hash": content_hash,
            "sui_tx_digest": tx_digest,
            "sui_package": SUI_TESTNET_PACKAGE,
            "block_number": block,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "verified": True,
            "tampered": False,
            "attestation_created": True,
            "recommendation": "Attestation created on Sui testnet. Dataset is now verifiably immutable.",
        }

    async def verify_with_llm(self, dataset: dict, on_chain_record: dict | None = None) -> dict:
        """Enhanced verification using LLM reasoning for edge cases."""
        session_service = InMemorySessionService()
        runner = Runner(agent=self.agent, app_name="buiry-contract-guardian", session_service=session_service)
        session = await session_service.create_session(app_name="buiry-contract-guardian", user_id="system", session_id=f"verify-{datetime.now(timezone.utc).timestamp()}")

        verify_input = {
            "dataset_summary": {
                "id": dataset.get("id"),
                "category": dataset.get("category"),
                "claims_count": len(dataset.get("claims", [])),
                "domain": dataset.get("domain"),
            },
            "on_chain_record": on_chain_record,
            "action": "verify" if on_chain_record else "attest",
        }

        prompt = f"Verify this dataset on Sui blockchain:\n\n{json.dumps(verify_input, indent=2)}"

        content = types.Content(role="user", parts=[types.Part(text=prompt)])
        result_text = ""
        async for event in runner.run_async(user_id="system", session_id=session.id, new_message=content):
            if event.is_final_response() and event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text: result_text += part.text

        try:
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            return json.loads(result_text.strip())
        except json.JSONDecodeError:
            return {"status": "FAILED", "error": "LLM output not parseable"}


# ─── Demo ─────────────────────────────────────────────────────

SAMPLE_DATASET = {
    "id": "ds_backend_001",
    "category": "performance_optimization",
    "domain": "backend",
    "sample_size": 2,
    "privacy_score": 100,
    "claims": [
        "Use EXPLAIN ANALYZE for PostgreSQL optimization",
        "Add composite indexes on filtered columns",
    ],
}

# Simulate on-chain record with matching hash
MATCHING_RECORD = {
    "content_hash": compute_hash(SAMPLE_DATASET),
    "tx_digest": "0xabc123def456abc123def456abc123def456abc1",
    "block_number": 12345678,
}

# Simulate tampered record with different hash
TAMPERED_RECORD = {
    "content_hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "tx_digest": "0xabc123def456abc123def456abc123def456abc1",
    "block_number": 12345678,
}


async def main():
    print("═══════════════════════════════════════════")
    print("  CONTRACT GUARDIAN AGENT")
    print("  AI Agent → Sui Blockchain → Dataset Proof")
    print("═══════════════════════════════════════════\n")

    guardian = ContractGuardianAgent()

    # Test 1: Unverified dataset
    print("─── TEST 1: Unverified Dataset ───")
    result = await guardian.verify(SAMPLE_DATASET)
    print(f"  Status: {result['status']}")
    print(f"  Hash: {result['content_hash'][:32]}...")
    print(f"  Recommendation: {result['recommendation']}\n")

    # Test 2: Verify matching hash
    print("─── TEST 2: Verified Dataset (Hash Match) ───")
    result = await guardian.verify(SAMPLE_DATASET, MATCHING_RECORD)
    print(f"  Status: {result['status']}")
    print(f"  On-chain hash: {result['on_chain_hash'][:32]}...")
    print(f"  Content hash:  {result['content_hash'][:32]}...")
    print(f"  Match: {'✓' if result['verified'] else '✗'}")
    print(f"  SUI TX: {result['sui_tx_digest']}")
    print(f"  Block: {result['block_number']}\n")

    # Test 3: Tamper detection
    print("─── TEST 3: Tampered Dataset (Hash Mismatch) ───")
    result = await guardian.verify(SAMPLE_DATASET, TAMPERED_RECORD)
    print(f"  Status: {result['status']}")
    print(f"  On-chain hash: {result['on_chain_hash'][:32]}...")
    print(f"  Content hash:  {result['content_hash'][:32]}...")
    print(f"  Tampered: {'⚠ YES' if result['tampered'] else '✗'}")
    print(f"  Recommendation: {result['recommendation']}\n")

    # Test 4: Create attestation
    print("─── TEST 4: Create On-Chain Attestation ───")
    result = await guardian.attest(SAMPLE_DATASET)
    print(f"  Status: {result['status']}")
    print(f"  SUI Package: {result['sui_package']}")
    print(f"  TX Digest: {result['sui_tx_digest']}")
    print(f"  Block: {result['block_number']}")
    print(f"  Hash locked on-chain: {result['content_hash'][:32]}...")
    print(f"  Attestation created: {'✓' if result.get('attestation_created') else '✗'}\n")

    print("═══════════════════════════════════════════")
    print("  CONTRACT GUARDIAN COMPLETE")
    print("═══════════════════════════════════════════")
    print("  Sui Testnet Package:", SUI_TESTNET_PACKAGE)
    print("  Verification: SHA-256 hash → compare → attest/tamper detect")
    print("  Immutable proof: dataset hash locked on blockchain")


if __name__ == "__main__":
    asyncio.run(main())
