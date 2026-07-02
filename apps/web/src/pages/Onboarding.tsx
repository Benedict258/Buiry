import { useEffect, useState } from "react";

const steps = [
  { num: 1, label: "Welcome" },
  { num: 2, label: "Project" },
  { num: 3, label: "Connect" },
];

const features = [
  {
    icon: "hub",
    title: "Connect",
    description: "Integrate your IDE, agents, and version control into a unified workspace.",
  },
  {
    icon: "construction",
    title: "Build",
    description: "Iterate rapidly with AI-assisted scaffolding and automated test harnesses.",
  },
  {
    icon: "eco",
    title: "Harvest",
    description: "Extract structured datasets, audit trails, and replayable session logs.",
  },
];

const techStacks = ["TypeScript", "Python", "Rust", "Go"];

const agents = [
  {
    id: "claude",
    name: "Claude Code",
    icon: "psychology",
    description: "Advanced reasoning and long-context code generation.",
  },
  {
    id: "cursor",
    name: "Cursor",
    icon: "architecture",
    description: "IDE-native AI with multi-file editing and inline suggestions.",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    icon: "psychology_alt",
    description: "Autocomplete and chat-assisted development across repositories.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [finalized, setFinalized] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/icon?family=Material+Icons+Round";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const toggleStack = (stack: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack]
    );
  };

  const handleFinalize = () => {
    setFinalized(true);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
  };

  return (
    <div className="p-lg max-w-[800px] mx-auto space-y-lg">
      {/* ── Brand Header ────────────────────────────────────────────── */}
      <header className="text-center space-y-sm">
        <div className="flex items-center justify-center gap-xs">
          <span className="material-icons-round text-primary text-[24px]">
            memory
          </span>
          <span className="font-technical-id text-sm text-primary uppercase tracking-wider">
            DevLabs OS
          </span>
        </div>
        <h1 className="text-headline-lg font-headline-lg font-bold text-text-primary">
          Welcome to Buiry
        </h1>
      </header>

      {/* ── Step Indicator ──────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-md">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-sm">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-meta-mono font-bold transition-colors ${
                step >= s.num
                  ? "bg-primary text-on-primary"
                  : "bg-surface-card border border-border-subtle text-text-secondary"
              }`}
            >
              {s.num}
            </div>
            <span
              className={`text-xs font-body-base ${
                step >= s.num ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="w-12 h-px bg-border-subtle mx-xs" />
            )}
          </div>
        ))}
      </div>

      {/* ── Progress Bar ────────────────────────────────────────────── */}
      <div className="flex gap-xs">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-colors ${
              step > s ? "bg-primary" : step === s ? "bg-primary/60" : "bg-border-subtle"
            }`}
          />
        ))}
      </div>

      {/* ── Step Content ────────────────────────────────────────────── */}
      <div className="bg-surface-card border border-border-subtle rounded-lg p-lg min-h-[400px]">
        {step === 1 && (
          <div className="space-y-lg">
            <div className="space-y-sm">
              <h2 className="text-headline-lg font-headline-lg font-bold text-text-primary">
                Welcome to Buiry
              </h2>
              <p className="text-text-secondary text-body-base max-w-[480px]">
                The ultimate lab environment for rapid AI development cycles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-surface-container border border-border-subtle rounded-lg p-md space-y-sm"
                >
                  <span className="material-icons-round text-primary text-[28px]">
                    {f.icon}
                  </span>
                  <h3 className="text-sm font-section-header font-semibold text-text-primary">
                    {f.title}
                  </h3>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-xs px-md py-sm bg-primary text-on-primary font-body-base text-sm font-medium rounded hover:bg-primary/80 transition-colors"
              >
                Begin Integration
                <span className="material-icons-round text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-lg">
            <h2 className="text-headline-lg font-headline-lg font-bold text-text-primary">
              Initialize Project
            </h2>

            <div className="space-y-md">
              <div className="space-y-xs">
                <label className="text-text-secondary font-meta-mono text-[10px] uppercase">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-ai-project"
                  className="w-full px-md py-sm bg-surface-container border border-border-subtle rounded text-text-primary text-sm font-body-base placeholder:text-text-secondary focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="space-y-xs">
                <label className="text-text-secondary font-meta-mono text-[10px] uppercase">
                  Tech Stack
                </label>
                <div className="flex flex-wrap gap-sm">
                  {techStacks.map((stack) => (
                    <button
                      key={stack}
                      onClick={() => toggleStack(stack)}
                      className={`px-md py-sm rounded text-sm font-body-base border transition-colors ${
                        selectedStacks.includes(stack)
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-surface-container border-border-subtle text-text-secondary hover:bg-surface-elevated"
                      }`}
                    >
                      {stack}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-xs">
                <label className="text-text-secondary font-meta-mono text-[10px] uppercase">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your project..."
                  rows={4}
                  className="w-full px-md py-sm bg-surface-container border border-border-subtle rounded text-text-primary text-sm font-body-base placeholder:text-text-secondary focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-md py-sm border border-border-subtle text-text-secondary font-body-base text-sm rounded hover:bg-surface-elevated transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-xs px-md py-sm bg-primary text-on-primary font-body-base text-sm font-medium rounded hover:bg-primary/80 transition-colors"
              >
                Validate &amp; Continue
                <span className="material-icons-round text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {step === 3 && !finalized && (
          <div className="space-y-lg">
            <h2 className="text-headline-lg font-headline-lg font-bold text-text-primary">
              Select Intelligence Core
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`bg-surface-container border rounded-lg p-md space-y-sm text-left transition-colors ${
                    selectedAgent === agent.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-border-subtle hover:border-primary/30"
                  }`}
                >
                  <span className="material-icons-round text-primary text-[28px]">
                    {agent.icon}
                  </span>
                  <h3 className="text-sm font-section-header font-semibold text-text-primary">
                    {agent.name}
                  </h3>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    {agent.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-md py-sm border border-border-subtle text-text-secondary font-body-base text-sm rounded hover:bg-surface-elevated transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleFinalize}
                className="inline-flex items-center gap-xs px-md py-sm bg-primary text-on-primary font-body-base text-sm font-medium rounded hover:bg-primary/80 transition-colors"
              >
                Finalize Setup
                <span className="material-icons-round text-[16px]">check</span>
              </button>
            </div>
          </div>
        )}

        {step === 3 && finalized && (
          <div className="flex flex-col items-center justify-center min-h-[360px] space-y-lg">
            <span className="material-icons-round text-primary text-[64px]">
              rocket_launch
            </span>
            <h2 className="text-headline-lg font-headline-lg font-bold text-text-primary">
              Environment Ready
            </h2>
            <p className="text-text-secondary text-sm text-center max-w-[400px]">
              Your workspace has been configured. Launching Buiry...
            </p>
            <div className="w-full max-w-[300px] space-y-xs">
              <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-text-secondary font-meta-mono text-[10px] text-right">
                {progress}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
