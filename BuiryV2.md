# Buiry V2 — Execution Plan

## Universal Data Ownership for AI-Powered Applications

**Status: Planning | Built on: Existing Buiry V1 (244 files, 8 ADK agents, MCP server, SDK, Dashboard)**

> This document outlines the vision and execution plan for Buiry as a universal data capture and dataset generation platform. Nothing in this document replaces or removes existing code. All new work extends the current architecture.

---

## 1. The Core Insight

Every AI-powered application generates training data. Every chatbot conversation. Every agent decision. Every business workflow. Every API call. **Today, that data vanishes — the developer owns nothing.**

**Buiry changes that.** One SDK integration. Zero latency impact. Full data ownership.

| App Type | Example | What Buiry Captures |
|----------|---------|-------------------|
| Chatbots | ChatGPT wrapper, customer support | Every prompt, response, user feedback, escalation |
| AI Agents | Autonomous coding agent, research agent | Every decision, tool call, chain-of-thought, sub-agent handoff |
| Business Apps | AI CRM, AI analytics, AI-powered HR | Every analysis, prediction, recommendation, rejection reason |
| APIs | AI-enhanced REST/GraphQL endpoints | Every request, response, classification, embedding generation |
| Copilots | IDE assistants, writing tools, design copilots | Every completion, edit, undo, user override |
| Automation | AI workflows, RPA with LLM decisions | Every step, branch, confidence score, fallback |
| RAG Systems | Knowledge retrieval, enterprise search | Every query, retrieval context, relevance score, hallucination |
| AI Media | Image/video/audio generation, editing | Every generation, prompt, style parameters, user selection |
| Fintech AI | Trading bots, risk analysis, fraud detection | Every signal, decision, confidence, outcome |
| Healthcare AI | Diagnosis support, medical records, triage | Every assessment, recommendation, override by doctor |

**One integration. All types. Same pipeline.**

---

## 2. The AI Agents (All Google ADK + Gemini)

Buiry is an agent-first platform. Every component that makes decisions is an AI agent built with Google ADK. No keyword matching. No hardcoded rules. Every agent reasons with Gemini.

### Agent Architecture

```
                          ┌─────────────────────┐
                          │  ORCHESTRATOR AGENT  │
                          │  (google-adk)        │
                          │  Coordinates all      │
                          │  specialist agents    │
                          └──────────┬───────────┘
                                     │
        ┌────────────┬───────────────┼───────────────┬────────────┐
        ▼            ▼               ▼               ▼            ▼
   ┌─────────┐ ┌──────────┐  ┌────────────┐  ┌──────────┐ ┌──────────┐
   │CONTEXT  │ │ DATASET  │  │  SESSION   │  │ INTENT   │ │CONTRACT  │
   │GUARDIAN │ │GENERATOR │  │  ANALYST   │  │ ROUTER   │ │ GUARDIAN │
   └─────────┘ └──────────┘  └────────────┘  └──────────┘ └──────────┘
   Privacy     Labeling     Pattern       User input    Sui smart
   + Security  datasets     detection     → MCP tools   contract
```

### Agent 1: Context Guardian — Privacy Gatekeeper
**Built: Yes** (`agents/context_guardian.py`)

- Scans ALL incoming data before storage
- Two-pass detection: regex quick-scan → Gemini deep-analysis
- 8 PII types, 4 severity levels (LOW/MEDIUM/HIGH/CRITICAL)
- Actions: PASS, SCRUB, REJECT, ENCRYPT
- Detects contextual PII regex can't find (e.g., "my API key is in the .env file")
- Generates privacy audit reports per batch

### Agent 2: Dataset Generator — The Core Product
**Built: Yes** (`agents/dataset_generator.py`)

- Processes captured interactions using Gemini
- Understands code semantics, not just keywords
- Classifies into 9 categories: code_generation, debugging, design_patterns, devops_deployment, data_engineering, security_patterns, api_design, performance_optimization, testing_quality
- Extracts concrete reusable claims (training examples)
- Detects patterns and anti-patterns
- Estimates quality score per dataset
- Outputs labeled datasets ready for fine-tuning

### Agent 3: Session Analyst — Pattern Intelligence
**Built: Yes** (`agents/session_analyst.py`)

- Reviews all session history
- Builds developer/team skill profile
- Detects recurring patterns (e.g., "always uses TypeScript", "common error: auth token expiry")
- Predicts next steps based on trajectory
- Recommends actions (e.g., "add rate limiting before production")
- Identifies knowledge gaps

### Agent 4: Intent Router — Universal Interface
**Built: Yes** (`agents/intent_router.py`)

- Classifies natural language input into MCP tool calls
- 7 intent types: start_session, end_session, log_decision, flag_issue, get_context, generate_docs, init
- No strict phrases needed — natural language only
- Extracts parameters from user message
- Routes to correct MCP tool automatically

### Agent 5: Contract Guardian — Sui Smart Contract Verification
**Built: No — Phase 2**

- Monitors on-chain contract state
- Verifies dataset provenance against Sui records
- Detects tampered or invalid dataset claims
- Generates on-chain attestations for verified datasets
- Links datasets to blockchain for immutability

### Agent 6: Quality Auditor — Dataset Validation
**Built: No — Phase 2**

- Reviews generated datasets for quality
- Detects bias in training data
- Validates claims against source interactions
- Assigns confidence scores
- Flags low-quality or potentially harmful datasets
- Generates dataset cards (model card format)

### Supporting Agents (Built — Demo + Development)

| Agent | File | Purpose |
|-------|------|---------|
| Coordinator | `agents/coordinator.py` | Orchestrates C→D→R pipeline |
| Developer | `agents/dev_agent.py` | Generates code from plans |
| Reviewer | `agents/review_agent.py` | Reviews code, flags issues |
| Buiry CLI | `agents/buiry_cli_agent.py` | Wraps all Buiry tools for Agents CLI |

---

## 3. The Universal SDK

### Current State

```
@buiry/buiry (TypeScript, v0.1.0, npm)
├── Buiry.wrap()           — Wraps any LLM client
├── Buiry.remember()       — Store arbitrary data
├── Buiry.recall()         — Retrieve stored data
├── Buiry.getDatasets()    — Fetch generated datasets
└── Adapters: Anthropic, OpenAI, Generic
```

### Phase 2: Universal Adapter System

```
@buiry/buiry (TypeScript)
├── Buiry.wrap() — Universal entry point
├── Adapters:
│   ├── Anthropic (Claude API)          ✓ Built
│   ├── OpenAI (GPT, o-series)          ✓ Built
│   ├── Google (Gemini, Vertex AI)      ✓ Built (generic)
│   ├── Groq (Llama, Mixtral)           New
│   ├── Mistral                         New
│   ├── Cohere                          New
│   ├── xAI (Grok)                      New
│   ├── DeepSeek                        New
│   ├── Together AI                     New
│   ├── Fireworks AI                    New
│   ├── Perplexity                      New
│   ├── Replicate                       New
│   └── Generic/Local (Ollama, vLLM)    New
├── Auto-detection: buiry.wrap(client) detects provider automatically
└── Zero config: Works with any LLM interface without setup
```

### Phase 3: Multi-Language SDK

```
SDKs:
├── TypeScript/JavaScript  ✓ @buiry/buiry (npm)
├── Python                New (pip install buiry)
├── Go                    New
├── Rust                  New
├── Java/Kotlin           New
└── Ruby                  New
```

### SDK Developer Experience

```python
# Python — 3 lines to data ownership
from buiry import Buiry
buiry = Buiry(api_key="sk-...", project_id="my-app")
wrapped_llm = buiry.wrap(my_openai_client)

# Use normally — Buiry captures everything
response = wrapped_llm.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Analyze this data"}]
)
# ↑ Prompt, response, tokens, latency, model, domain — all captured
# ↑ PII scrubbed by Context Guardian agent
# ↑ Labeled by Dataset Generator agent
# ↑ YOU own the resulting dataset
```

---

## 4. Data Flow Architecture

```
┌─────────────────────────────────────────────────────┐
│               YOUR AI APPLICATION                     │
│  (chatbot, agent, API, copilot, automation, etc.)    │
└──────────────────────┬──────────────────────────────┘
                       │ buiry.wrap(llmClient)
                       ▼
┌─────────────────────────────────────────────────────┐
│                  BUIRY SDK                            │
│  • Passive wrapper — zero latency impact             │
│  • Captures: prompt, response, tokens, model,        │
│    latency, domain, metadata                         │
│  • Auto-detects provider (OpenAI/Anthropic/Gemini/..)│
│  • Sample rate configurable                          │
│  • Works with streaming & non-streaming              │
└──────────────────────┬──────────────────────────────┘
                       │ Captured interaction
                       ▼
┌─────────────────────────────────────────────────────┐
│             CONTEXT GUARDIAN AGENT                    │
│  • Quick scan: regex (API keys, emails, IPs, SSH)    │
│  • Deep scan: Gemini (contextual PII, passwords,     │
│    internal hostnames, tokens in URLs)               │
│  • Severity: LOW / MEDIUM / HIGH / CRITICAL           │
│  • Actions: PASS / SCRUB / REJECT / ENCRYPT          │
│  • Generates privacy audit per batch                 │
└──────────────────────┬──────────────────────────────┘
                       │ Clean, anonymized data
                       ▼
┌─────────────────────────────────────────────────────┐
│                 BUIRY BACKEND                         │
│  • Railway (https://buiry.up.railway.app)            │
│  • PostgreSQL: session storage, project data          │
│  • Redis: real-time caching, rate limiting            │
│  • Sentry: error tracking                             │
│  • Rate limiting: per API key                         │
│  • Auth: X-Api-Key header                             │
└──────────────────────┬──────────────────────────────┘
                       │ Accumulated interactions
                       ▼
┌─────────────────────────────────────────────────────┐
│             DATASET GENERATOR AGENT                   │
│  • Processes interactions in batches                 │
│  • Classifies using Gemini (9 categories)            │
│  • Extracts reusable claims as training examples     │
│  • Groups by domain and topic                        │
│  • Assigns quality scores (0-100)                    │
│  • Generates dataset summaries and use cases          │
│  • Outputs labeled datasets for fine-tuning          │
└──────────────────────┬──────────────────────────────┘
                       │ Labeled datasets
                       ▼
┌─────────────────────────────────────────────────────┐
│             SESSION ANALYST AGENT                     │
│  • Reviews all sessions across time                  │
│  • Detects patterns and trends                       │
│  • Builds developer/team skill profile               │
│  • Predicts next development areas                   │
│  • Recommends actions and improvements               │
│  • Identifies knowledge gaps                         │
└──────────────────────┬──────────────────────────────┘
                       │ Insights + datasets
                       ▼
┌─────────────────────────────────────────────────────┐
│              BUIRY DASHBOARD                          │
│  • Vercel (https://buiry.vercel.app)                 │
│  • Session history with search and filtering         │
│  • Dataset browser with categories and scores        │
│  • Project settings and API key management           │
│  • Real-time metrics and analytics                   │
│  • Light/dark theme, responsive                     │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   YOU OWN IT    │
              │  Training data  │
              │  for fine-tuning│
              │  your models    │
              └─────────────────┘
```

---

## 5. The MCP Server — Cross-Agent Memory

Buiry MCP (`@buiry/mcp@0.1.2`) provides persistent memory across AI sessions.

### Tools (8 total)

| Tool | Purpose | Agent Connection |
|------|---------|-----------------|
| `buiry_init` | Initialize new project | Orchestrator triggers on first use |
| `buiry_start_session` | Load context from memory | Orchestrator + Session Analyst read history |
| `buiry_end_session` | Save session summary | Orchestrator persists at session end |
| `buiry_log_decision` | Record architectural choice | Developer + Reviewer log decisions |
| `buiry_flag_issue` | Report problems found | Reviewer + Guardian flag security issues |
| `buiry_get_context` | Search across all sessions | Analyst searches for patterns |
| `buiry_generate_docs` | Generate PRD/Architecture/DevPlan | Orchestrator generates docs from history |
| `buiry_execute` | Universal intent router | Intent Router agent classifies → auto-routes |

### Cross-Platform Support

| Platform | Status | 
|----------|--------|
| Antigravity IDE | Verified — all 8 tools connected |
| Antigravity CLI | Verified — full session lifecycle tested |
| OpenCode | Verified — MCP config tested |
| Claude Code | Ready — npm package published |
| Cursor | Ready — npm package published |
| Cline (VS Code) | Ready — npm package published |
| Windsurf | Ready — npm package published |

---

## 6. Hackathon Submission Map

### Course Concepts Demonstrated (6/6)

| Concept | Where | How |
|---------|-------|-----|
| **Google ADK** | All 8 agents | Every agent uses `LlmAgent` + `gemini-2.5-flash` |
| **MCP Server** | `@buiry/mcp` | 8 tools, npm published, works in Antigravity |
| **Security** | Context Guardian agent | AI-powered PII detection, 8 types, 4 severity levels |
| **Deployability** | Railway + Vercel + npm | Live backend, frontend, SDK, MCP server |
| **Antigravity** | Video demo | MCP connected, full session lifecycle in Antigravity CLI |
| **Agents CLI** | `agents/buiry_cli_agent.py` | ADK agent runnable via `agents chat --agent buiry` |

### Submission Components

| Component | Status | Details |
|-----------|--------|---------|
| Writeup (<2500 words) | Done | `SubmissionDocs/Writeup.md` — 2012 words |
| YouTube Video (<5 min) | Script ready | `SubmissionDocs/Video-Script.md` — 5:00 |
| Cover Image | Not started | Needed before submission |
| Public Repo | Done | `https://github.com/Benedict258/Buiry` |
| Live Demo | Done | `https://buiry.up.railway.app` (backend), `https://buiry.vercel.app` (frontend) |

### Video Script (5 minutes)

| Time | Scene | What to Show |
|------|-------|-------------|
| 0:00-0:30 | **Problem** | "1M users interact with your AI app. You own nothing." |
| 0:30-1:00 | **Architecture** | Show agent diagram — 3 AI agents watching data |
| 1:00-1:45 | **MCP + Antigravity** | Antigravity CLI → `/mcp` → 8 Buiry tools → start session |
| 1:45-2:30 | **Agent 1: Guardian** | `python3 agents/context_guardian.py` → 8 PII items detected → secrets rejected |
| 2:30-3:15 | **Agent 2: Generator** | `python3 agents/dataset_generator.py` → 6 interactions → 5 datasets |
| 3:15-3:45 | **Agent 3: Analyst** | `python3 agents/session_analyst.py` → patterns, predictions, recommendations |
| 3:45-4:15 | **Dashboard** | `https://buiry.vercel.app` → session history, datasets, live data |
| 4:15-4:45 | **SDK Demo** | 3 lines of code → `buiry.wrap()` → data captured |
| 4:45-5:00 | **Summary** | "Buiry. Own your AI's training data." |

---

## 7. Phased Execution Plan with ADK Sub-Agents

Each phase is led by a Google ADK agent. Every agent has clear responsibilities, deliverables, and dependencies. Agents collaborate — output of one feeds input of another.

---

### Phase 1: Hackathon Complete — Submission Ready

**Goal**: Submit to Kaggle by July 6, 2026. Bug-free, fully tested.

**Lead Agent**: `Orchestrator`

```
┌─────────────────────────────────────────┐
│          PHASE 1 AGENT TRIAD             │
│                                          │
│  Orchestrator ──→ Intent Router          │
│       │              │                   │
│       │   Dataset Generator              │
│       │        │                         │
│       └────────┼──── Session Analyst     │
│                │         │               │
│                └── Context Guardian      │
│                       │                  │
│                  MCP Server (8 tools)     │
└─────────────────────────────────────────┘
```

| Sub-Agent | Responsibility | Deliverable | Status |
|-----------|---------------|-------------|--------|
| **Orchestrator** | Coordinates all agents. Ensures session lifecycle (start → work → end). | Working `e2e-demo.py` | Done |
| **Intent Router** | Classifies user input → MCP tool calls. Natural language only. | `agents/intent_router.py` | Done |
| **Context Guardian** | Scans all data for PII. Rejects secrets. Scrubs user data. | `agents/context_guardian.py` | Done |
| **Dataset Generator** | Analyzes captured interactions. Generates labeled datasets. | `agents/dataset_generator.py` | Done |
| **Session Analyst** | Reviews session history. Detects patterns. Predicts next steps. | `agents/session_analyst.py` | Done |
| **Coordinator** | Delegates C→D→R pipeline for development tasks. | `agents/coordinator.py` | Done |
| **Developer** | Generates code from plans. | `agents/dev_agent.py` | Done |
| **Reviewer** | Reviews code. Flags issues. | `agents/review_agent.py` | Done |
| **Buiry CLI** | Wraps all tools for Agents CLI. | `agents/buiry_cli_agent.py` | Done |

**Phase 1 Deliverables**
- [x] 8 AI agents (all ADK, all `gemini-2.5-flash`)
- [x] MCP Server (8 tools, npm published, Antigravity-verified)
- [x] SDK (`@buiry/buiry@0.1.0`, npm published)
- [x] Backend (Railway, PG + Redis, auth, rate limiting)
- [x] Frontend (Vercel, responsive, light/dark, live data)
- [x] Sui contracts (testnet deployed)
- [x] CI/CD (GitHub Actions)
- [x] Writeup (2012 words)
- [ ] YouTube video recording
- [ ] Cover image
- [ ] Kaggle submission

---

### Phase 2: Universal Adapter System

**Goal**: Buiry SDK works with every major LLM provider. One `wrap()` call. Zero config.

**Lead Agent**: `Dataset Generator` + `Developer`

**Why Dataset Generator leads**: Every new adapter means more data sources. The agent must verify each adapter captures the correct fields (prompt, response, tokens, latency, model, domain).

```
┌──────────────────────────────────────────────┐
│           PHASE 2 AGENT QUARTET               │
│                                               │
│  Developer ──→ generates adapter code         │
│      │                                        │
│      ├── Reviewer ──→ reviews adapter quality │
│      │        │                               │
│      │        └── Dataset Generator           │
│      │             │    verifies adapter      │
│      │             │    captures correct data │
│      │             │                          │
│      └── Context Guardian                     │
│               │   verifies no PII leak        │
│               │   in adapter implementation   │
└──────────────────────────────────────────────┘
```

| Sub-Agent | Responsibility | Deliverable |
|-----------|---------------|-------------|
| **Developer** | Generates adapter code for each LLM provider. Follows existing adapter pattern. | 12 adapter files |
| **Reviewer** | Reviews each adapter. Checks: error handling, type safety, edge cases. Flags issues. | Review reports per adapter |
| **Dataset Generator** | Tests each adapter with real LLM calls. Verifies: prompt capture, response capture, token counting, latency tracking. | Validation report per adapter |
| **Context Guardian** | Scans adapter code for PII leakage patterns. Ensures no secrets in generated code. | Security audit per adapter |

**Phase 2 Deliverables**
| # | Adapter | Provider | Status |
|---|---------|----------|--------|
| 1 | Anthropic | Claude API | Done |
| 2 | OpenAI | GPT, o-series | Done |
| 3 | Google | Gemini, Vertex AI | Done |
| 4 | Groq | Llama, Mixtral, DeepSeek | New |
| 5 | Mistral | Mistral, Codestral | New |
| 6 | Cohere | Command, Embed | New |
| 7 | xAI | Grok | New |
| 8 | DeepSeek | DeepSeek-V3, R1 | New |
| 9 | Together AI | All open models | New |
| 10 | Fireworks | All open models | New |
| 11 | Perplexity | Sonar, Online | New |
| 12 | Replicate | All hosted models | New |
| 13 | Ollama (local) | Llama, Mistral, Gemma | New |

**Phase 2 Acceptance Criteria**
- `buiry.wrap(client)` auto-detects provider — no config needed
- Every adapter captures: prompt, response, tokens, model, latency, domain
- Context Guardian verifies zero PII leaks in adapter code
- Dataset Generator validates each adapter produces correct dataset signals

---

### Phase 3: Multi-Language SDKs

**Goal**: Buiry SDK in Python, Go, Rust. Same API. Same agents.

**Lead Agent**: `Developer` + `Reviewer`

```
┌──────────────────────────────────────────────┐
│           PHASE 3 AGENT DUO                   │
│                                               │
│  Developer ──→ generates SDK in target lang   │
│      │        (Python, Go, Rust)             │
│      │                                        │
│      └── Reviewer ──→ reviews SDK quality     │
│               │   cross-checks against        │
│               │   TypeScript reference impl    │
│               │                               │
│               └── Dataset Generator           │
│                      validates data pipeline  │
│                      works end-to-end in      │
│                      each language             │
└──────────────────────────────────────────────┘
```

| Sub-Agent | Responsibility | Deliverable |
|-----------|---------------|-------------|
| **Developer** | Generates SDK code in target language. Follows TypeScript reference. | SDK source per language |
| **Reviewer** | Cross-checks against TypeScript reference. Validates API parity. Tests edge cases. | Review report per SDK |
| **Dataset Generator** | End-to-end test: SDK → capture → Guardian → Generator → datasets. | Pipeline validation per SDK |

**Phase 3 Deliverables**
| SDK | Registry | Priority | Status |
|-----|----------|----------|--------|
| TypeScript | `@buiry/buiry` (npm) | Done | Published v0.1.0 |
| Python | `buiry` (PyPI) | High | Planned |
| Go | `buiry` (go modules) | Medium | Planned |
| Rust | `buiry` (crates.io) | Low | Planned |
| Java/Kotlin | `buiry` (Maven Central) | Low | Planned |
| Ruby | `buiry` (RubyGems) | Low | Planned |

**Phase 3 Acceptance Criteria**
- Same `buiry.wrap()` API in every language
- Same agent pipeline (Guardian → Generator → Analyst) works with data from any SDK
- All SDKs published to respective package registries with README + examples

---

### Phase 4: Advanced AI Agents

**Goal**: Two new agents. Contract Guardian verifies datasets on Sui blockchain. Quality Auditor validates dataset quality before export.

**Lead Agent**: `Orchestrator`

```
┌──────────────────────────────────────────────┐
│           PHASE 4 — TWO NEW AGENTS            │
│                                               │
│  Quality Auditor                              │
│  ┌─────────────────────────────────┐          │
│  │ Reviews every generated dataset │          │
│  │ • Bias detection                │          │
│  │ • Claim validation against src  │          │
│  │ • Quality scoring (0-100)       │          │
│  │ • Dataset cards (model card fmt)│          │
│  │ • Flags low-quality datasets    │          │
│  └──────────────┬──────────────────┘          │
│                 │ feeds into                   │
│                 ▼                              │
│  Contract Guardian                            │
│  ┌─────────────────────────────────┐          │
│  │ Verifies datasets on Sui chain  │          │
│  │ • Generates on-chain attestation│          │
│  │ • Links dataset hash → Sui TX   │          │
│  │ • Tamper detection              │          │
│  │ • Immutable provenance proof    │          │
│  └─────────────────────────────────┘          │
│                                               │
│  Both agents report to Session Analyst        │
│  for inclusion in session insights            │
└──────────────────────────────────────────────┘
```

| Sub-Agent | Responsibility | Deliverable | Status |
|-----------|---------------|-------------|--------|
| **Quality Auditor** | Reviews datasets for quality, bias, validity. Generates model-card-format documentation. | `agents/quality_auditor.py` | New |
| **Contract Guardian** | Generates on-chain attestations for verified datasets. Links dataset hash to Sui transactions. Detects tampered claims. | `agents/contract_guardian.py` | New |

**Phase 4 Deliverables**
- Quality Auditor agent validates every dataset before export
- Dataset cards generated in standard model-card format
- Contract Guardian links datasets to Sui blockchain (testnet → mainnet)
- Immutable provenance: any dataset can be verified against on-chain record
- Tamper detection: if dataset changes, hash mismatch detected

---

### Phase 5: Multi-Tenant Platform

**Goal**: Production-grade backend. Multi-user, multi-project, enterprise-ready.

**Lead Agent**: `Session Analyst` + `Dataset Generator`

```
┌──────────────────────────────────────────────┐
│           PHASE 5 AGENT CONSTELLATION          │
│                                               │
│  Session Analyst  ──→ monitors usage patterns │
│      │               predicts scaling needs   │
│      │                                        │
│      ├── Dataset Generator                    │
│      │   └── cross-tenant dataset merging     │
│      │       (opt-in, anonymized)             │
│      │                                        │
│      ├── Context Guardian                     │
│      │   └── per-tenant PII policies          │
│      │       (EU tenant vs US tenant)         │
│      │                                        │
│      └── Quality Auditor                      │
│          └── tenant-level quality scoring     │
│              dataset health per project       │
└──────────────────────────────────────────────┘
```

| Sub-Agent | Responsibility | Deliverable |
|-----------|---------------|-------------|
| **Session Analyst** | Monitors usage across tenants. Predicts scaling. Detects anomalies. | Usage analytics |
| **Dataset Generator** | Merges datasets across tenants (opt-in). Cross-tenant learning. | Cross-tenant datasets |
| **Context Guardian** | Per-tenant privacy policies. EU vs US compliance. Data residency. | Policy enforcement |
| **Quality Auditor** | Per-project dataset quality. Health scores. Improvement recommendations. | Quality dashboard |

**Phase 5 Deliverables**
- Multi-tenant backend (user accounts, projects, API key management)
- Dataset export: HuggingFace, TensorFlow, PyTorch formats
- Real-time streaming capture (not batch)
- Analytics dashboard (usage, quality, domains)
- Enterprise: SSO, RBAC, audit logs
- Dataset marketplace (opt-in sharing, verified by Contract Guardian)

---

### Phase 6: Ecosystem & Scale

**Goal**: Buiry as the standard data ownership layer for AI applications.

**Lead Agent**: All agents + new `Market Guardian` agent

| Sub-Agent | Responsibility |
|-----------|---------------|
| **Market Guardian** | Verifies dataset quality in marketplace. Handles disputes. Manages licensing. |
| **All existing agents** | Scale to handle millions of interactions per minute. Multi-region deployment. |
| **Developer + Reviewer** | Community SDKs (Rust, Java, Ruby, Swift). Open-source contributions. |

---

## 8. Agent Collaboration Map

How all agents work together across all phases:

```
                          ┌──────────────────┐
                          │   ORCHESTRATOR   │◄── Starts every session
                          │  (Session Mgmt)  │◄── Coordinates all agents
                          └────────┬─────────┘
                                   │
        ┌──────────────┬───────────┼───────────┬──────────────┬──────────────┐
        ▼              ▼           ▼           ▼              ▼              ▼
   ┌─────────┐  ┌───────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
   │CONTEXT  │  │  DATASET  │ │SESSION  │ │ INTENT   │ │QUALITY   │ │CONTRACT  │
   │GUARDIAN │  │ GENERATOR │ │ANALYST  │ │ ROUTER   │ │AUDITOR   │ │GUARDIAN  │
   └────┬────┘  └─────┬─────┘ └────┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
        │             │            │           │            │            │
        │   ┌─────────┘            │           │            │            │
        │   │    ┌─────────────────┘           │            │            │
        │   │    │    ┌────────────────────────┘            │            │
        │   │    │    │    ┌─────────────────────────────────┘            │
        │   │    │    │    │    ┌──────────────────────────────────────────┘
        ▼   ▼    ▼    ▼    ▼    ▼
   ┌─────────────────────────────────────────────┐
   │              BUIRY MCP SERVER                │
   │            (8 tools, stdio + HTTP)           │
   │     Cross-agent persistent memory layer       │
   └─────────────────────┬───────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │  Antigravity│ │Claude Code │ │  Cursor    │
   │  IDE + CLI  │ │            │ │            │
   └────────────┘ └────────────┘ └────────────┘
         Any platform. Same memory. Same agents.
```

**Agent-to-Agent Communication Pattern**:
1. **Orchestrator** → starts session, delegates to specialists
2. **Context Guardian** → scans data, passes clean data to Generator and Analyst
3. **Dataset Generator** → produces datasets, passes to Quality Auditor
4. **Quality Auditor** → validates datasets, passes verified ones to Contract Guardian
5. **Contract Guardian** → attests on-chain, reports back to Session Analyst
6. **Session Analyst** → aggregates all agent outputs into insights, saves via MCP

---

## 9. Architecture Decision Record

| Decision | Rationale | Date |
|----------|-----------|------|
| Google ADK for all agents | Hackathon requires ADK; Gemini is the only model with quota | 2026-07-01 |
| Gemini 2.5 Flash (not Pro) | Pro quota exhausted; Flash is fast enough for classification agents | 2026-07-02 |
| MCP as cross-agent bridge | MCP is an open standard; works across Antigravity/Claude/Cursor/Cline | 2026-07-02 |
| Keyword pre-scan + LLM deep-scan | Reduces Gemini API costs; regex catches 80% of PII instantly | 2026-07-03 |
| LLM agents, not pipelines | Judges evaluate "agents as central to solution"; keyword matching doesn't count | 2026-07-04 |
| SDK as passive wrapper | Zero latency impact on user's app; silent capture = adoption | 2026-07-04 |
| Phase execution by ADK sub-agents | Agents build Buiry itself — meta-agent architecture. Developer + Reviewer agents generate SDK code; Guardian audits it; Generator validates data flow | 2026-07-04 |
| Adapter auto-detection over config | Zero-config adoption: `buiry.wrap(client)` detects provider without user specifying it | 2026-07-04 |

---

## 10. How to Demo (One Command)

```bash
# Clone
git clone https://github.com/Benedict258/Buiry.git
cd Buiry

# Set up
pip install google-adk
export GOOGLE_API_KEY="your-key"

# The full agent pipeline
python3 e2e-demo.py         # Shows 3-agent orchestration

# Individual agents
python3 agents/dataset_generator.py   # Agent 2: Generate datasets
python3 agents/session_analyst.py     # Agent 3: Analyze sessions
python3 agents/context_guardian.py    # Agent 1: PII detection

# MCP Server (any platform)
npx -y @buiry/mcp

# SDK (any Node.js app)
npm install @buiry/buiry
```

---

## 11. The Pitch (30 seconds)

> Every AI-powered application generates training data. Chatbots, agents, copilots, APIs — every prompt and response is a training example. Today, that data evaporates. The developer owns nothing.
>
> **Buiry changes that.** One line of code — `buiry.wrap(yourLLM)` — and every interaction is captured, PII-scrubbed by AI agents, and turned into labeled datasets you own.
>
> Six AI agents work together: Context Guardian blocks secrets before storage. Dataset Generator classifies interactions into training data. Session Analyst detects patterns and predicts what you should build next. Quality Auditor validates every dataset. Contract Guardian attests them on-chain.
>
> All built with Google ADK and Gemini. All open source.
>
> **Buiry. Own your AI's training data.**
