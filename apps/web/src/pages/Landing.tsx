import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "SDK", href: "#sdk" },
  { label: "Docs", href: "https://github.com/Benedict258/Buiry#readme" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <img src="/logo.png" alt="Buiry" className="w-8 h-8" />
      <span className="font-semibold text-lg text-text-primary">Buiry</span>
    </Link>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-effect border-b border-border-subtle/20"
          : "bg-transparent"
      }`}
    >
      <div className="container-landing flex items-center justify-between h-16 px-6 md:px-12 lg:px-24">
        <Logo />

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.href.startsWith("#") ? (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Dashboard
          </Link>
          <a
            href="https://github.com/Benedict258/Buiry"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-primary text-background text-sm font-semibold hover:opacity-90 transition-all"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px]" />

      <div className="relative container-landing px-6 md:px-12 lg:px-24 text-center space-y-8 pt-24">
        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span className="text-gradient">Own your AI's</span>
          <br />
          <span className="text-text-primary">training data.</span>
        </h1>

        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          One line of code. Every chatbot conversation, every agent decision, every API
          call — captured, privacy-scrubbed, and turned into labeled datasets you own.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="#sdk"
            className="px-6 py-3 rounded-lg bg-primary text-background text-base font-semibold hover:opacity-90 transition-all glow-primary"
          >
            Try the SDK
          </a>
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-lg border border-border-subtle text-text-primary text-base font-medium hover:bg-surface-elevated transition-all"
          >
            Open Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-3xl mx-auto">
          {[
            { value: "14", label: "LLM Adapters" },
            { value: "9", label: "MCP Tools" },
            { value: "10", label: "ADK Agents" },
            { value: "29", label: "API Routes" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-3xl md:text-4xl font-bold text-text-primary"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-text-secondary font-meta-mono uppercase tracking-wider mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="section-padding bg-surface-container/30">
      <div className="container-landing">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-text-primary mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Every AI app generates training data.
            <br />
            <span className="text-gradient">Today, you own nothing.</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Your chatbot conversations, agent decisions, and API calls — all
            that data vanishes into provider logs. Buiry changes that.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-status-error/20 bg-status-error/5 p-8 space-y-4">
            <span className="text-status-error text-sm font-semibold uppercase tracking-wider">
              Without Buiry
            </span>
            <ul className="space-y-3">
              {[
                "LLM interactions vanish into provider logs",
                "No record of what users actually asked",
                "PII scattered across third-party servers",
                "Can't fine-tune on your own application's data",
                "No dataset provenance or verification",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-text-secondary">
                  <span className="text-status-error mt-0.5 text-sm">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-8 space-y-4">
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">
              With Buiry
            </span>
            <ul className="space-y-3">
              {[
                "Every interaction captured automatically",
                "Full session history with search and filtering",
                "AI-powered PII scrubbing before storage",
                "Labeled datasets generated from your traffic",
                "Blockchain-attested provenance on Sui",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-text-secondary">
                  <span className="text-accent mt-0.5 text-sm">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Wrap",
      description:
        "One line of code wraps any LLM client. Auto-detects provider — OpenAI, Anthropic, Gemini, and 11 more. Zero configuration.",
      code: 'const wrapped = buiry.wrap(myOpenAIClient);',
    },
    {
      step: "02",
      title: "Capture",
      description:
        "Every prompt, response, token count, latency, and model is captured silently. No performance impact. Works with streaming and batch calls.",
      code: '// Everything after wrap() is automatically captured',
    },
    {
      step: "03",
      title: "Scrub",
      description:
        "Context Guardian AI agent scans all data for PII. Regex quick-scan catches 80%, Gemini deep-analysis catches contextual secrets. Nothing sensitive is stored.",
      code: 'Status: SCRUB → "beth@email.com" → "[REDACTED]"',
    },
    {
      step: "04",
      title: "Own",
      description:
        "Labeled datasets are generated from your traffic. Dataset Generator AI agent classifies, scores, and packages training data. Verified on Sui blockchain.",
      code: 'Dataset: customer_support (847 samples, 87/100 quality)',
    },
  ];

  return (
    <section id="how-it-works" className="section-padding">
      <div className="container-landing">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-text-primary mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Four steps to data ownership
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            From code to dataset in four automated steps. No manual labeling.
            No data engineering. No PII leaks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className="relative group rounded-2xl glass-card p-6 space-y-4 hover:border-primary/20 transition-all duration-300"
            >
              <span className="text-5xl font-bold text-text-primary/5 group-hover:text-primary/10 transition-colors">
                {s.step}
              </span>
              <h3
                className="text-xl font-semibold text-text-primary"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {s.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {s.description}
              </p>
              <pre className="text-xs font-meta-mono text-primary bg-surface-container rounded-lg p-3 overflow-x-auto">
                {s.code}
              </pre>

              {i < 3 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-text-secondary text-lg">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "🔌",
      title: "Universal SDK",
      desc: "14 LLM adapters with auto-detection. Wrap any client — OpenAI, Anthropic, Gemini, Groq, Mistral, Ollama, and more.",
      badge: "14 providers",
    },
    {
      icon: "🛡️",
      title: "Context Guardian",
      desc: "AI-powered PII detection. Two passes: regex quick-scan + Gemini deep-analysis. 8 PII types, 4 severity levels.",
      badge: "100% privacy score",
    },
    {
      icon: "📊",
      title: "Dataset Generator",
      desc: "Converts captured interactions into labeled datasets. 9 categories, quality scoring, anti-pattern detection.",
      badge: "LLM-powered",
    },
    {
      icon: "🔗",
      title: "MCP Server",
      desc: "9 tools for cross-agent persistent memory. Works with Claude Code, Cursor, Antigravity, and any MCP host.",
      badge: "npm published",
    },
    {
      icon: "⛓️",
      title: "Blockchain Attestation",
      desc: "SHA-256 dataset hashes verified on Sui testnet. Tamper detection. Immutable provenance records.",
      badge: "Sui testnet",
    },
    {
      icon: "📋",
      title: "Live Dashboard",
      desc: "Session explorer, dataset browser, project files, memory viewer. Real PostgreSQL-backed data at buiry.vercel.app.",
      badge: "11 screens",
    },
  ];

  return (
    <section id="features" className="section-padding bg-surface-container/30">
      <div className="container-landing">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-text-primary mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Every layer, built with AI agents
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Buiry is an agent-first platform. Every component that makes
            decisions is an AI agent built with Google ADK and Gemini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl glass-card p-6 space-y-4 hover:border-primary/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-[10px] font-meta-mono uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                  {f.badge}
                </span>
              </div>
              <h3
                className="text-lg font-semibold text-text-primary"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {f.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SDKSection() {
  return (
    <section id="sdk" className="section-padding">
      <div className="container-landing">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-text-primary mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Three lines. Zero config. Full ownership.
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            The Buiry SDK wraps your existing LLM client. No API changes. No
            performance impact. Just data ownership.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            { label: "TypeScript", code: `import { Buiry } from "@buiry/buiry";

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
//   You own it.` },
            { label: "Python", code: `from buiry import Buiry

# One line to wrap any LLM client
buiry = Buiry(api_key="buiry_sk_...")
wrapped = buiry.wrap(my_openai_client)

# Use normally — Buiry captures everything
response = wrapped.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}],
)

# ↑ Same API. Same capture. 14 adapters.
#   Python SDK published on PyPI.` },
          ].map(({ label, code }) => (
            <div key={label} className="rounded-2xl border-gradient bg-surface-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-surface-container">
                <span className="w-3 h-3 rounded-full bg-status-error/60" />
                <span className="w-3 h-3 rounded-full bg-status-warning/60" />
                <span className="w-3 h-3 rounded-full bg-status-success/60" />
                <span className="ml-2 text-xs text-text-secondary font-meta-mono">{label}</span>
              </div>
              <pre className="p-6 text-sm font-meta-mono text-text-primary overflow-x-auto">
                <code>{code}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "2", label: "SDKs", detail: "TypeScript + Python" },
    { value: "14", label: "Adapters", detail: "OpenAI to Ollama" },
    { value: "9", label: "MCP Tools", detail: "Published to npm" },
    { value: "10", label: "AI Agents", detail: "Google ADK + Gemini" },
    { value: "29", label: "API Routes", detail: "PostgreSQL-backed" },
    { value: "4", label: "Contracts", detail: "Sui testnet" },
  ];

  return (
    <section className="section-padding bg-surface-container/30">
      <div className="container-landing text-center">
        <h2
          className="text-3xl md:text-4xl font-bold text-text-primary mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Built for real use
        </h2>
        <p className="text-text-secondary text-lg mb-12">
          Not a mock. Not a prototype. A working platform.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl glass-card p-6 space-y-2 hover:border-primary/10 transition-all"
            >
              <p
                className="text-3xl font-bold text-gradient"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {s.value}
              </p>
              <p className="text-sm text-text-primary font-semibold">{s.label}</p>
              <p className="text-xs text-text-secondary">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="section-padding">
      <div className="container-landing">
        <div className="relative rounded-2xl border-gradient overflow-hidden p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/5 blur-[80px]" />

          <div className="relative space-y-6">
            <h2
              className="text-3xl md:text-5xl font-bold text-text-primary"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Start owning your AI's training data
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Open source. MIT licensed. Built with Google ADK. Deployed on
              Railway + Vercel. Ready for your next project.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="https://github.com/Benedict258/Buiry"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg bg-primary text-background text-base font-semibold hover:opacity-90 transition-all glow-primary"
              >
                View on GitHub
              </a>
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-lg border border-border-subtle text-text-primary text-base font-medium hover:bg-surface-elevated transition-all"
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="border-t border-border-subtle bg-surface-container/30">
      <div className="container-landing px-6 md:px-12 lg:px-24 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="text-text-secondary text-sm mt-3 leading-relaxed">
              Universal data ownership for AI-powered applications.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Product</h4>
            <div className="space-y-2">
              {["Dashboard", "Projects", "Sessions", "Datasets"].map((l) => (
                <Link
                  key={l}
                  to={`/${l.toLowerCase()}`}
                  className="block text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {l}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Developers</h4>
            <div className="space-y-2">
              {[
                { label: "GitHub", href: "https://github.com/Benedict258/Buiry" },
                { label: "npm (@buiry/buiry)", href: "https://www.npmjs.com/package/@buiry/buiry" },
                { label: "npm (@buiry/mcp)", href: "https://www.npmjs.com/package/@buiry/mcp" },
                { label: "Documentation", href: "https://github.com/Benedict258/Buiry#readme" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Stack</h4>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>Google ADK + Gemini</p>
              <p>MCP Protocol</p>
              <p>Sui Blockchain</p>
              <p>Railway + Vercel</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border-subtle mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary font-meta-mono">
            Buiry v0.1 — MIT License — Built with AI agents
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Benedict258/Buiry"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-secondary hover:text-text-primary transition-colors font-meta-mono"
            >
              GitHub
            </a>
            <span className="text-xs text-text-secondary font-meta-mono">
              buiry.vercel.app
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <SDKSection />
      <StatsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
