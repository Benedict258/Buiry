import type { FC } from "react";
import { useState } from "react";

const sections = [
  "Getting Started",
  "SDK",
  "MCP Server",
  "API Reference",
  "Architecture",
  "Security",
] as const;

type Section = (typeof sections)[number];

function GettingStarted() {
  return (
    <div className="space-y-lg">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Installation</h2>
        <p className="text-text-secondary text-sm mb-md">
          Buiry is a persistent memory infrastructure for AI coding agents. It gives agents append-only, cross-tool memory that survives across every session and every editor.
        </p>
      </div>

      <div className="space-y-md">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-sm">npm (MCP Server + SDK)</h3>
          <pre className="text-xs font-meta-mono text-text-primary bg-surface-container rounded-lg p-md overflow-x-auto border border-border-subtle">
{`# Install MCP server
npx @buiry/mcp

# Install SDK
npm install @buiry/buiry

# Or clone the full repo
git clone https://github.com/Benedict258/Buiry.git
cd Buiry
cd packages/buiry-mcp && npm install && npm run build`}
          </pre>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-sm">Python SDK</h3>
          <pre className="text-xs font-meta-mono text-text-primary bg-surface-container rounded-lg p-md overflow-x-auto border border-border-subtle">
{`# Install the Python SDK
pip install buiry

# Set up ADK agents
pip install google-adk
export GOOGLE_API_KEY="your-key"`}
          </pre>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-sm">MCP Configuration</h3>
          <pre className="text-xs font-meta-mono text-text-primary bg-surface-container rounded-lg p-md overflow-x-auto border border-border-subtle">
{`{
  "mcpServers": {
    "buiry": {
      "command": "npx",
      "args": ["buiry-mcp"],
      "env": {}
    }
  }
}`}
          </pre>
          <p className="text-text-secondary text-xs mt-sm">Add this to your <code className="px-xs py-[1px] bg-surface-container rounded font-meta-mono text-[11px]">.claude/settings.json</code> or equivalent MCP config file.</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-sm">Quick Start</h3>
        <pre className="text-xs font-meta-mono text-text-primary bg-surface-container rounded-lg p-md overflow-x-auto border border-border-subtle">
{`# Start the dashboard
cd apps/web
npm run dev

# Open http://localhost:5173

# Your agent can now use Buiry tools:
# buiry_start_session → loads full context
# buiry_end_session   → persists everything
# buiry_get_context   → search across sessions`}
        </pre>
      </div>
    </div>
  );
}

function SDKSection() {
  return (
    <div className="space-y-lg">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Buiry SDK</h2>
        <p className="text-text-secondary text-sm mb-md">
          The Buiry SDK wraps your existing LLM client. No API changes. No performance impact. Just data ownership.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-sm">TypeScript</h3>
        <pre className="text-xs font-meta-mono text-text-primary bg-surface-container rounded-lg p-md overflow-x-auto border border-border-subtle">
{`import { Buiry } from "@buiry/buiry";

// One line to wrap any LLM client
const buiry = new Buiry({ apiKey: "buiry_sk_..." });
const wrapped = buiry.wrap(myOpenAIClient);

// Use normally — Buiry captures everything
const reply = await wrapped.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
});

// ↑ Prompt, response, tokens, latency, model —
//   all captured. PII scrubbed. Dataset generated.
//   You own it.`}
        </pre>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-sm">Python</h3>
        <pre className="text-xs font-meta-mono text-text-primary bg-surface-container rounded-lg p-md overflow-x-auto border border-border-subtle">
{`from buiry import Buiry

# One line to wrap any LLM client
buiry = Buiry(api_key="buiry_sk_...")
wrapped = buiry.wrap(my_openai_client)

# Use normally — Buiry captures everything
response = wrapped.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}],
)

# ↑ Same API. Same capture. 14 adapters.
#   Python SDK published on PyPI.`}
        </pre>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-sm">Adapter Support</h3>
        <div className="rounded-xl glass-card p-md">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-xs">
            {[
              "Anthropic (Claude)", "OpenAI (GPT, o-series)",  "Google (Gemini)", "Groq (Llama, Mixtral)",
              "Mistral", "Cohere", "xAI (Grok)", "DeepSeek",
              "Together AI", "Fireworks AI", "Perplexity", "Replicate",
              "Ollama (local)", "Generic / vLLM",
            ].map((adapter) => (
              <div key={adapter} className="flex items-center gap-xs text-xs text-text-secondary font-meta-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {adapter}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MCPServerSection() {
  return (
    <div className="space-y-lg">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>MCP Server</h2>
        <p className="text-text-secondary text-sm mb-md">
          Buiry MCP (<code className="px-xs py-[1px] bg-surface-container rounded font-meta-mono text-[11px]">@buiry/mcp@0.1.2</code>) provides persistent memory across AI sessions via the Model Context Protocol.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-sm">Tools (8 total)</h3>
        <div className="space-y-xs">
          {[
            { tool: "buiry_init", desc: "Initialize a new Buiry project with full file structure" },
            { tool: "buiry_start_session", desc: "Begin a session — returns project identity, last 5 sessions, next steps, open issues" },
            { tool: "buiry_end_session", desc: "End session — validates, enforces append-only rules, writes to memory" },
            { tool: "buiry_log_decision", desc: "Append a decision to the active session" },
            { tool: "buiry_get_context", desc: "Keyword search across all past sessions" },
            { tool: "buiry_flag_issue", desc: "Log a known issue and increment open issues counter" },
            { tool: "buiry_generate_docs", desc: "LLM-synthesize PRD, Architecture, and Dev Plan from session history" },
            { tool: "buiry_execute", desc: "Universal intent router — natural language input classified and auto-routed to tools" },
          ].map((t) => (
            <div key={t.tool} className="rounded-lg bg-surface-container p-sm flex items-start gap-sm">
              <code className="text-xs font-meta-mono text-primary whitespace-nowrap">{t.tool}</code>
              <span className="text-xs text-text-secondary">{t.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-sm">Platform Support</h3>
        <div className="rounded-xl glass-card p-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            {[
              "Antigravity IDE — Verified", "Antigravity CLI — Verified",
              "OpenCode — Verified", "Claude Code — Ready",
              "Cursor — Ready", "Cline (VS Code) — Ready",
              "Windsurf — Ready",
            ].map((p) => (
              <div key={p} className="text-xs font-meta-mono text-text-secondary flex items-center gap-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function APIReference() {
  const endpoints = [
    { method: "GET", path: "/api/sessions", desc: "List all sessions for a project" },
    { method: "GET", path: "/api/sessions/:id", desc: "Get a specific session by ID" },
    { method: "POST", path: "/api/sessions", desc: "Create a new session via end_session" },
    { method: "GET", path: "/api/datasets", desc: "List all datasets for a project" },
    { method: "GET", path: "/api/projects", desc: "List all projects" },
    { method: "POST", path: "/api/projects", desc: "Create a new project" },
    { method: "GET", path: "/api/projects/:id", desc: "Get project details" },
    { method: "GET", path: "/api/memory", desc: "Read the Build-Context-Memory.json" },
    { method: "GET", path: "/api/health", desc: "Health check endpoint" },
  ];

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>API Reference</h2>
        <p className="text-text-secondary text-sm mb-md">
          The Buiry API is a REST API deployed on Railway. All endpoints require an <code className="px-xs py-[1px] bg-surface-container rounded font-meta-mono text-[11px]">X-Api-Key</code> header for authentication.
        </p>
      </div>

      <div className="space-y-xs">
        {endpoints.map((ep) => (
          <div key={ep.path} className="rounded-lg bg-surface-container p-sm flex items-center gap-md">
            <span
              className={`inline-block px-xs py-[1px] rounded text-[10px] font-meta-mono font-semibold whitespace-nowrap ${
                ep.method === "GET"
                  ? "bg-primary/20 text-primary"
                  : ep.method === "POST"
                    ? "bg-secondary/20 text-secondary"
                    : "bg-tertiary/20 text-tertiary"
              }`}
            >
              {ep.method}
            </span>
            <code className="text-xs font-meta-mono text-text-primary">{ep.path}</code>
            <span className="text-xs text-text-secondary flex-1">{ep.desc}</span>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-sm">Authentication</h3>
        <pre className="text-xs font-meta-mono text-text-primary bg-surface-container rounded-lg p-md overflow-x-auto border border-border-subtle">
{`curl -H "X-Api-Key: buiry_sk_your_key" \\
  https://buiry.up.railway.app/api/sessions`}
        </pre>
      </div>
    </div>
  );
}

function ArchitectureSection() {
  return (
    <div className="space-y-lg">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Architecture</h2>
        <p className="text-text-secondary text-sm mb-md">
          Buiry is an agent-first platform. Every component that makes decisions is an AI agent built with Google ADK and Gemini.
        </p>
      </div>

      <pre className="text-[10px] font-meta-mono text-text-primary bg-surface-container rounded-lg p-md overflow-x-auto border border-border-subtle leading-relaxed">
{`┌─────────────────────────────────────────────────────────────┐
│                      MCP Server                             │
│                   npx buiry-mcp                             │
│                                                             │
│  buiry_start_session    buiry_end_session    buiry_get...  │
│  ◄── reads last 5 sessions    ◄── validates & appends      │
│                                                             │
│  Single file: Build-Context-Memory.json                     │
│  Schema: Zod validates every write (next_steps required)    │
│  Model: Append-only (sessions immutable once written)       │
└──────────────────────┬──────────────────────────────────────┘
                       │ MCP protocol (stdio)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 ADK Agents (Python)                         │
│                                                             │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │
│   │ Coordinator  │──►│   DevAgent   │──►│  ReviewAgent │  │
│   │              │   │              │   │              │  │
│   │ Loads context│   │ Implements   │   │ Validates    │  │
│   │ Delegates    │   │ Writes code  │   │ Flags issues │  │
│   │ Resolves     │   │ Logs changes │   │ Cross-checks │  │
│   └──────────────┘   └──────────────┘   └──────────────┘  │
│                                                             │
│   Each agent calls MCP tools via stdio to read/write memory │
│   Disagreements resolved using session history              │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                React Dashboard (Vite)                       │
│                                                             │
│  Session Explorer  │  Context Search  │  Dataset Browser    │
│  Session Detail    │  Activity Timeline│  Onboarding        │
│                                                             │
│  Stitch dark theme • MD3 tokens • Inter + JetBrains Mono   │
└─────────────────────────────────────────────────────────────┘`}
      </pre>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-sm">Agent Architecture</h3>
        <pre className="text-[10px] font-meta-mono text-text-primary bg-surface-container rounded-lg p-md overflow-x-auto border border-border-subtle leading-relaxed">
{`                      ┌─────────────────────┐
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
+ Security  datasets     detection     → MCP tools   contract`}
        </pre>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-sm">Tech Stack</h3>
        <div className="rounded-xl glass-card p-md">
          <div className="space-y-xs">
            {[
              { layer: "MCP Server", tech: "TypeScript + Zod", purpose: "Local JSON read/write, tool definitions, schema validation" },
              { layer: "Agents", tech: "Python + Google ADK", purpose: "Multi-agent orchestration, session lifecycle" },
              { layer: "Frontend", tech: "React 19 + Vite + Tailwind", purpose: "Dashboard for sessions, search, datasets" },
              { layer: "Design System", tech: "Stitch (MD3 dark theme)", purpose: "Consistent UI tokens, Inter + JetBrains Mono" },
              { layer: "Backend API", tech: "Express + TypeScript", purpose: "Cloud endpoints (Phase 2)" },
              { layer: "Database", tech: "PostgreSQL + pgvector", purpose: "Metadata, vector search (Phase 2)" },
              { layer: "Blockchain", tech: "Sui", purpose: "Ownership, marketplace (Phase 2)" },
              { layer: "Storage", tech: "Walrus", purpose: "Decentralized session archives (Phase 2)" },
            ].map((row) => (
              <div key={row.layer} className="flex items-start gap-md py-xs border-b border-border-subtle last:border-0">
                <span className="text-[10px] font-meta-mono text-primary font-semibold min-w-[90px]">{row.layer}</span>
                <span className="text-[10px] font-meta-mono text-text-primary min-w-[180px]">{row.tech}</span>
                <span className="text-[10px] font-meta-mono text-text-secondary flex-1">{row.purpose}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-sm">Phases</h3>
        <div className="space-y-sm">
          {[
            { phase: "Phase 1", title: "Hackathon Complete", status: "In Progress", desc: "8 AI agents, MCP server, SDK, backend, frontend, Sui contracts" },
            { phase: "Phase 2", title: "Universal Adapter System", status: "Planned", desc: "13 LLM adapters with auto-detection" },
            { phase: "Phase 3", title: "Multi-Language SDKs", status: "Planned", desc: "Python, Go, Rust SDKs with same API" },
            { phase: "Phase 4", title: "Advanced AI Agents", status: "Planned", desc: "Quality Auditor + Contract Guardian" },
            { phase: "Phase 5", title: "Multi-Tenant Platform", status: "Planned", desc: "Production-grade backend, dataset marketplace" },
            { phase: "Phase 6", title: "Ecosystem & Scale", status: "Planned", desc: "Standard data ownership layer for AI applications" },
          ].map((p) => (
            <div key={p.phase} className="rounded-lg bg-surface-container p-sm flex items-start gap-md">
              <span className="text-[10px] font-meta-mono text-primary font-semibold min-w-[55px]">{p.phase}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-sm mb-xs">
                  <span className="text-sm font-semibold text-text-primary">{p.title}</span>
                  <span className={`inline-block px-xs py-[1px] rounded text-[9px] font-meta-mono ${
                    p.status === "In Progress" ? "bg-status-success/20 text-status-success" : "bg-surface-variant text-text-secondary"
                  }`}>{p.status}</span>
                </div>
                <p className="text-xs text-text-secondary">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="space-y-lg">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Security</h2>
        <p className="text-text-secondary text-sm mb-md">
          Buiry&apos;s security model is built into the architecture, not bolted on after the fact.
        </p>
      </div>

      <div className="space-y-md">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-sm">Append-Only Memory Model</h3>
          <p className="text-text-secondary text-sm">
            Sessions are immutable once written. The <code className="px-xs py-[1px] bg-surface-container rounded font-meta-mono text-[11px]">buiry_end_session</code> tool appends a validated session object and never modifies existing entries. No session can be updated or deleted after writing.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-sm">Schema Validation (Zod)</h3>
          <p className="text-text-secondary text-sm mb-sm">
            Every session object passes through Zod validation before touching the file system. Malformed data is rejected at write time, not discovered at read time.
          </p>
          <div className="rounded-xl glass-card p-md">
            <div className="space-y-xs text-xs font-meta-mono">
              {[
                { field: "next_steps", rule: "Required, min 1 entry", enforce: "Every session leaves a breadcrumb" },
                { field: "session_id", rule: "Unique within file", enforce: "Prevents duplicate sessions" },
                { field: "timestamp", rule: "ISO 8601 format", enforce: "Enforces temporal ordering" },
                { field: "progress.completed", rule: "Required array", enforce: "No session closes without progress" },
                { field: "progress.in_progress", rule: "Required array", enforce: "Active work always documented" },
                { field: "progress.blocked", rule: "Required array", enforce: "Blockers surfaced, not hidden" },
              ].map((row) => (
                <div key={row.field} className="flex items-start gap-md py-xs border-b border-border-subtle last:border-0">
                  <code className="text-primary min-w-[160px]">{row.field}</code>
                  <span className="text-text-secondary min-w-[200px]">{row.rule}</span>
                  <span className="text-text-secondary">{row.enforce}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-sm">API Key Management</h3>
          <p className="text-text-secondary text-sm">
            All API access requires an <code className="px-xs py-[1px] bg-surface-container rounded font-meta-mono text-[11px]">X-Api-Key</code> header. API keys are scoped to individual projects and can be rotated from the dashboard Settings page. Never commit API keys to version control — use environment variables.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-sm">PII Stripping Pipeline</h3>
          <p className="text-text-secondary text-sm">
            The Context Guardian AI agent scans all incoming data for PII before storage. Two-pass detection: regex quick-scan catches 80% of patterns (API keys, emails, IPs, SSH keys), while Gemini deep-analysis catches contextual PII that regex misses (e.g., &ldquo;my API key is in the .env file&rdquo;). PII is replaced with anonymized placeholders before storage.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-sm">Local-Only Mode</h3>
          <p className="text-text-secondary text-sm">
            The MCP server operates entirely on the local filesystem by default. No cloud API, no telemetry, no network calls. No data leaves the machine unless explicitly configured for cloud deployment.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-sm">Design Principles</h3>
          <ol className="list-decimal list-inside space-y-xs text-sm text-text-secondary">
            <li><strong className="text-text-primary">Reject bad data early</strong> — Zod validation at write time, not read time</li>
            <li><strong className="text-text-primary">Immutable by default</strong> — Append-only prevents accidental corruption</li>
            <li><strong className="text-text-primary">Local-first</strong> — No data leaves the machine unless explicitly configured</li>
            <li><strong className="text-text-primary">Privacy by design</strong> — PII stripping is a first-class feature, not an afterthought</li>
            <li><strong className="text-text-primary">Audit trail</strong> — Every session is a timestamped, immutable record</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

const sectionContent: Record<Section, FC> = {
  "Getting Started": GettingStarted,
  SDK: SDKSection,
  "MCP Server": MCPServerSection,
  "API Reference": APIReference,
  Architecture: ArchitectureSection,
  Security: SecuritySection,
};

export default function Documentation() {
  const [active, setActive] = useState<Section>("Getting Started");

  const Content = sectionContent[active];

  return (
    <div className="p-lg max-w-[1400px] mx-auto flex gap-lg">
      <nav className="hidden lg:flex flex-col w-[220px] shrink-0 space-y-xs sticky top-[64px] self-start">
        <div className="mb-sm">
          <h2 className="text-sm font-semibold text-text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Documentation</h2>
        </div>
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`text-left px-sm py-xs rounded text-sm font-body-base transition-colors ${
              active === s
                ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated border-l-2 border-transparent"
            }`}
          >
            {s}
          </button>
        ))}
      </nav>

      <div className="hidden lg:block w-px bg-border-subtle self-stretch" />

      <div className="lg:hidden mb-lg">
        <select
          value={active}
          onChange={(e) => setActive(e.target.value as Section)}
          className="w-full px-md py-sm bg-surface-card border border-border-subtle rounded-lg text-sm text-text-primary font-body-base focus:outline-none focus:border-primary/50"
        >
          {sections.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <main className="flex-1 min-w-0">
        <div className="rounded-2xl glass-card p-lg">
          <Content />
        </div>
      </main>
    </div>
  );
}
