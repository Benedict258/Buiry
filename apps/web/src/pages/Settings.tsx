import { useEffect, useState } from "react";

const codeSnippet = `import { BuiryClient } from '@buiry/sdk';

const client = new BuiryClient({
  apiKey: process.env.BUIRY_API_KEY,
  workspace: 'devlabs-os',
});`;

const toggles = [
  { id: "auto-suggest", label: "Auto-Suggest Indices", defaultOn: true },
  { id: "anomaly", label: "Anomaly Alerts", defaultOn: true },
  { id: "rate-limit", label: "Smart Rate Limiting", defaultOn: false },
];

const regionOptions = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"];
const retentionOptions = ["7 days", "30 days", "90 days", "1 year"];

export default function Settings() {
  const [autoCapture, setAutoCapture] = useState(true);
  const [domain, setDomain] = useState("api.devlabos.io");
  const [region, setRegion] = useState("us-east-1");
  const [retention, setRetention] = useState("30 days");
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    "auto-suggest": true,
    anomaly: true,
    "rate-limit": false,
  });

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

  const handleToggle = (id: string) => {
    setToggleStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-lg max-w-[1200px] mx-auto space-y-lg">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="border-l-4 border-primary pl-md">
        <h1 className="text-headline-lg font-headline-lg font-bold text-text-primary">
          Settings
        </h1>
        <p className="text-text-secondary font-meta-mono text-[10px] uppercase tracking-wider mt-xs">
          Workspace Configuration &amp; API Management
        </p>
      </header>

      {/* ── Two-Column Layout ───────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-lg">
        {/* ── Left Column (8 cols) ──────────────────────────────────── */}
        <div className="col-span-8 space-y-lg">
          {/* API Credentials */}
          <section className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-md">
            <h2 className="font-section-header text-sm font-semibold text-text-primary">
              API Credentials
            </h2>

            <div className="space-y-sm">
              <label className="text-text-secondary font-meta-mono text-[10px] uppercase">
                Production API Key
              </label>
              <div className="flex items-center gap-sm">
                <div className="flex-1 px-md py-sm bg-surface-container border border-border-subtle rounded font-meta-mono text-sm text-text-secondary">
                  buiry_prod_••••••••••••••••••••••••
                </div>
                <button className="px-sm py-sm bg-surface-container border border-border-subtle rounded text-text-secondary hover:bg-surface-elevated hover:text-primary transition-colors">
                  <span className="material-icons-round text-[16px]">content_copy</span>
                </button>
                <button className="px-sm py-sm bg-surface-container border border-border-subtle rounded text-text-secondary hover:bg-surface-elevated hover:text-primary transition-colors">
                  <span className="material-icons-round text-[16px]">refresh</span>
                </button>
              </div>
            </div>

            <div className="space-y-sm">
              <label className="text-text-secondary font-meta-mono text-[10px] uppercase">
                Sandbox Testing Key
              </label>
              <div className="flex items-center gap-sm">
                <div className="flex-1 px-md py-sm bg-surface-container border border-border-subtle rounded font-meta-mono text-sm text-text-secondary">
                  buiry_sbx_••••••••••••••••••••••••
                </div>
                <button className="px-sm py-sm bg-surface-container border border-border-subtle rounded text-text-secondary hover:bg-surface-elevated hover:text-primary transition-colors">
                  <span className="material-icons-round text-[16px]">content_copy</span>
                </button>
              </div>
            </div>
          </section>

          {/* Workspace Environment */}
          <section className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-md">
            <h2 className="font-section-header text-sm font-semibold text-text-primary">
              Workspace Environment
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-primary text-sm font-body-base">
                  Automatic Data Capture
                </p>
                <p className="text-text-secondary text-xs font-body-base">
                  Automatically log session inputs and outputs.
                </p>
              </div>
              <button
                onClick={() => setAutoCapture(!autoCapture)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  autoCapture ? "bg-primary" : "bg-surface-variant"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-on-primary transition-transform ${
                    autoCapture ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            <div className="space-y-xs">
              <label className="text-text-secondary font-meta-mono text-[10px] uppercase">
                Custom Domain Endpoint
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-md py-sm bg-surface-container border border-border-subtle rounded text-text-primary text-sm font-body-base focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-text-secondary font-meta-mono text-[10px] uppercase">
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-md py-sm bg-surface-container border border-border-subtle rounded text-text-primary text-sm font-body-base focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                >
                  {regionOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-text-secondary font-meta-mono text-[10px] uppercase">
                  Log Retention
                </label>
                <select
                  value={retention}
                  onChange={(e) => setRetention(e.target.value)}
                  className="w-full px-md py-sm bg-surface-container border border-border-subtle rounded text-text-primary text-sm font-body-base focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                >
                  {retentionOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Co-pilot Integration */}
          <section className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-md">
            <div className="flex items-center justify-between">
              <h2 className="font-section-header text-sm font-semibold text-text-primary">
                Claude Code Snippet
              </h2>
              <button className="px-sm py-[4px] bg-surface-container border border-border-subtle rounded font-meta-mono text-[10px] text-text-secondary hover:bg-surface-elevated hover:text-primary transition-colors">
                COPY
              </button>
            </div>
            <pre className="bg-surface-container border border-border-subtle rounded-lg p-md font-meta-mono text-xs text-text-primary overflow-x-auto whitespace-pre">
              {codeSnippet}
            </pre>
          </section>
        </div>

        {/* ── Right Column (4 cols) ─────────────────────────────────── */}
        <div className="col-span-4 space-y-lg">
          {/* Current Plan */}
          <section className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden">
            <div className="bg-primary p-md">
              <p className="font-meta-mono text-[10px] text-on-primary uppercase">
                Current Plan
              </p>
              <p className="text-headline-lg font-headline-lg font-bold text-on-primary mt-xs">
                $49/mo
              </p>
              <p className="text-on-primary/80 text-sm font-body-base">
                Professional Tier
              </p>
            </div>
            <div className="p-md space-y-md">
              <div className="space-y-xs">
                <div className="flex justify-between text-[11px] font-meta-mono text-text-secondary">
                  <span>Agent Instances</span>
                  <span className="text-text-primary">18/50</span>
                </div>
                <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: "36%" }}
                  />
                </div>
              </div>
              <div className="space-y-xs">
                <div className="flex justify-between text-[11px] font-meta-mono text-text-secondary">
                  <span>API Requests</span>
                  <span className="text-text-primary">824k/1M</span>
                </div>
                <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tertiary rounded-full"
                    style={{ width: "82.4%" }}
                  />
                </div>
              </div>
              <div className="space-y-sm pt-sm border-t border-border-subtle">
                <button className="w-full px-md py-sm border border-border-subtle text-text-secondary font-body-base text-sm rounded hover:bg-surface-elevated transition-colors">
                  Manage Billing
                </button>
                <button className="w-full px-md py-sm bg-primary text-on-primary font-body-base text-sm font-medium rounded hover:bg-primary/80 transition-colors">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </section>

          {/* Co-pilot Assistant */}
          <section className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-md">
            <h2 className="font-section-header text-sm font-semibold text-text-primary">
              Co-pilot Assistant
            </h2>
            {toggles.map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <span className="text-text-primary text-sm font-body-base">
                  {t.label}
                </span>
                <button
                  onClick={() => handleToggle(t.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    toggleStates[t.id] ? "bg-primary" : "bg-surface-variant"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-on-primary transition-transform ${
                      toggleStates[t.id] ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            ))}
          </section>

          {/* Network Status */}
          <section className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-sm">
            <h2 className="font-section-header text-sm font-semibold text-text-primary">
              Network Status
            </h2>
            <div className="w-full h-32 bg-surface-container border border-border-subtle rounded flex items-center justify-center">
              <span className="material-icons-round text-text-secondary text-[32px]">
                signal_wifi_off
              </span>
            </div>
            <p className="text-text-secondary font-meta-mono text-[10px] text-center">
              No active network diagnostic
            </p>
          </section>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div className="flex justify-between pt-md border-t border-border-subtle">
        <button className="px-md py-sm border border-border-subtle text-text-secondary font-body-base text-sm rounded hover:bg-surface-elevated transition-colors">
          Discard Changes
        </button>
        <button className="px-md py-sm bg-primary text-on-primary font-body-base text-sm font-medium rounded hover:bg-primary/80 transition-colors">
          Save Configuration
        </button>
      </div>
    </div>
  );
}
