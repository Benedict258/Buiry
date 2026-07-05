# Buiry ADK Agents

AI agents for the Buiry platform — built with Google ADK and Gemini 2.5 Flash.

## Install

pip install -r requirements.txt

## Usage

### As an ADK Skill
```python
from buiry import BuirySkill

skill = BuirySkill(api_key="buiry_sk_...")
context = skill.buiry_start_session()
skill.buiry_remember("Added PostgreSQL connection pool")
```

### As standalone agents
```bash
python3 agents/context_guardian.py     # PII detection
python3 agents/dataset_generator.py    # Generate training datasets
python3 agents/session_analyst.py      # Pattern detection
python3 agents/quality_auditor.py      # Dataset quality validation
python3 agents/contract_guardian.py    # On-chain attestation
python3 agents/intent_router.py        # Natural language → MCP tools
python3 agents/buiry_cli_agent.py      # CLI agent wrapper
```

### Bridge Server (for TypeScript pipeline)
```bash
python3 server.py --port 8765
```

## Agents

| Agent | File | Function |
|-------|------|----------|
| Context Guardian | `agents/context_guardian.py` | Two-pass PII detection (regex + Gemini) |
| Dataset Generator | `agents/dataset_generator.py` | Classify interactions into labeled datasets |
| Session Analyst | `agents/session_analyst.py` | Pattern detection and recommendations |
| Quality Auditor | `agents/quality_auditor.py` | Dataset validation and model cards |
| Contract Guardian | `agents/contract_guardian.py` | Sui blockchain attestation |
| Intent Router | `agents/intent_router.py` | Natural language → MCP tool |
| Buiry CLI Agent | `agents/buiry_cli_agent.py` | Agents CLI wrapper |

## Configuration

Set `GOOGLE_API_KEY` in `.env` or `GOOGLE_GENAI_API_KEY` for Gemini access.

Set `BUIRY_API_KEY` for Buiry backend access (get from https://buiry.vercel.app/settings).
