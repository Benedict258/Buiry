import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

const codeSnippet = `import { BuiryClient } from '@buiry/sdk';

const client = new BuiryClient({
  apiKey: process.env.BUIRY_API_KEY,
  workspace: 'devlabs-os',
});`;

const regionOptions = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"];
const retentionOptions = ["7 days", "30 days", "90 days", "1 year"];

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");
const API_KEY = import.meta.env.VITE_BUIRY_API_KEY || "";

interface KeyRecord {
  id: string;
  name: string;
  project_id: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export default function Settings() {
  const [autoCapture, setAutoCapture] = useState(true);
  const [domain, setDomain] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [retention, setRetention] = useState("30 days");

  // API Key Management
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [freshKey, setFreshKey] = useState(""); // newly created key shown once
  const [copied, setCopied] = useState(false);

  const fetchKeys = useCallback(async () => {
    if (!API_KEY) {
      setError("VITE_BUIRY_API_KEY not set. Add it to your Vercel environment variables.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/keys`, {
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown' }));
        setError(err.error || "Failed to load keys");
      }
    } catch {
      setError("Cannot connect to API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  useEffect(() => {
    if (!API_KEY) return;
    fetch(`${API_URL}/api/settings/profile`, {
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.profile) {
          if (typeof data.profile.auto_capture === "boolean") setAutoCapture(data.profile.auto_capture);
          if (data.profile.domain) setDomain(data.profile.domain);
          if (data.profile.region) setRegion(data.profile.region);
          if (data.profile.retention) setRetention(data.profile.retention);
        }
      })
      .catch(() => {});
  }, []);

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

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setFreshKey(data.api_key);
        setNewKeyName("");
        fetchKeys();
        toast.success("API key created", { description: "Your new key is ready" });
      } else {
        const err = await res.json();
        setError(err.error || "Failed to create key");
      }
    } catch {
      setError("Cannot connect to API. Is the backend running?");
    }
  };

  const revokeKey = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/keys/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
      });
      if (res.ok) {
        fetchKeys();
      }
    } catch {
      setError("Failed to revoke key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-lg max-w-[1200px] mx-auto space-y-lg">
      {/* Header */}
      <header className="border-l-4 border-primary pl-md">
        <h1 className="text-headline-lg font-headline-lg font-bold text-text-primary">
          Settings
        </h1>
        <p className="text-text-secondary font-meta-mono text-[10px] uppercase tracking-wider mt-xs">
          Workspace Configuration &amp; API Management
        </p>
      </header>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        {/* Left Column */}
        <div className="col-span-12 md:col-span-8 space-y-lg">
          {/* Freshly Created Key Banner */}
          {freshKey && (
            <section className="bg-status-success/10 border border-status-success/30 rounded-lg p-lg space-y-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-section-header text-sm font-semibold text-status-success">
                  Key Created
                </h2>
                <button
                  onClick={() => setFreshKey("")}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <span className="material-icons-round text-[16px]">close</span>
                </button>
              </div>
              <div className="flex items-center gap-sm">
                <code className="flex-1 px-md py-sm bg-surface-container border border-border-subtle rounded font-meta-mono text-sm text-text-primary break-all">
                  {freshKey}
                </code>
                <button
                  onClick={() => copyToClipboard(freshKey)}
                  className="px-sm py-sm bg-surface-container border border-border-subtle rounded text-text-secondary hover:bg-surface-elevated hover:text-primary transition-colors"
                >
                  <span className="material-icons-round text-[16px]">content_copy</span>
                </button>
              </div>
              <p className="text-text-secondary text-xs font-body-base">
                Copy this key now. It will not be shown again. Use it as{" "}
                <code className="bg-surface-container px-1 rounded text-[11px]">BUIRY_API_KEY</code>{" "}
                in your MCP config or <code className="bg-surface-container px-1 rounded text-[11px]">X-Api-Key</code> header.
              </p>
              {copied && (
                <p className="text-status-success text-xs font-meta-mono">Copied to clipboard!</p>
              )}
            </section>
          )}

          {/* API Keys Management */}
          <section className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-md">
            <h2 className="font-section-header text-sm font-semibold text-text-primary">
              API Keys
            </h2>

            {error && (
              <div className="px-md py-sm bg-status-error/10 border border-status-error/30 rounded text-status-error text-sm">
                {error}
              </div>
            )}

            {/* Create New Key */}
            <div className="flex gap-sm">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createKey()}
                placeholder="Key name (e.g. 'production', 'dev')"
                className="flex-1 px-md py-sm bg-surface-container border border-border-subtle rounded text-text-primary text-sm font-body-base focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button
                onClick={createKey}
                disabled={!newKeyName.trim() || loading}
                className="px-md py-sm bg-primary text-on-primary font-body-base text-sm font-medium rounded hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Key
              </button>
            </div>

            {/* Keys List */}
            <div className="space-y-sm">
              {loading && (
                <p className="text-text-secondary text-sm">Loading keys...</p>
              )}
              {!loading && keys.length === 0 && (
                <p className="text-text-secondary text-sm">
                  No API keys yet. Create one above.
                </p>
              )}
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between px-md py-sm bg-surface-container border border-border-subtle rounded"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-sm">
                      <span className="text-text-primary text-sm font-body-base truncate">
                        {key.name}
                      </span>
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          key.is_active ? "bg-status-success" : "bg-status-error"
                        }`}
                      />
                      <span className="text-text-secondary font-meta-mono text-[10px]">
                        {key.is_active ? "ACTIVE" : "REVOKED"}
                      </span>
                    </div>
                    <div className="flex items-center gap-sm mt-1">
                      <code className="text-text-secondary font-meta-mono text-[10px]">
                        {key.key_prefix}...
                      </code>
                      <span className="text-text-secondary font-meta-mono text-[10px]">
                        Created {new Date(key.created_at).toLocaleDateString()}
                      </span>
                      {key.last_used_at && (
                        <span className="text-text-secondary font-meta-mono text-[10px]">
                          Last used {new Date(key.last_used_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {key.is_active && (
                    <button
                      onClick={() => revokeKey(key.id)}
                      className="px-sm py-1 border border-status-error/30 text-status-error font-meta-mono text-[10px] rounded hover:bg-status-error/10 transition-colors ml-sm"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
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
                placeholder="e.g. api.example.com"
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

            <button
              onClick={async () => {
                if (!API_KEY) return;
                try {
                  const res = await fetch(`${API_URL}/api/settings/profile`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
                    body: JSON.stringify({
                      auto_capture: autoCapture,
                      domain,
                      region,
                      retention,
                    }),
                  });
                  if (res.ok) {
                    toast.success("Configuration saved");
                  } else {
                    toast.error("Failed to save configuration");
                  }
                } catch {
                  toast.error("Cannot connect to API");
                }
              }}
              className="px-md py-sm bg-primary text-on-primary font-body-base text-sm font-medium rounded hover:bg-primary/80 transition-colors"
            >
              Save Configuration
            </button>
          </section>

          {/* Code Snippet */}
          <section className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-md">
            <div className="flex items-center justify-between">
              <h2 className="font-section-header text-sm font-semibold text-text-primary">
                MCP Config Snippet
              </h2>
              <button
                onClick={() => copyToClipboard(codeSnippet)}
                className="px-sm py-[4px] bg-surface-container border border-border-subtle rounded font-meta-mono text-[10px] text-text-secondary hover:bg-surface-elevated hover:text-primary transition-colors"
              >
                COPY
              </button>
            </div>
            <pre className="bg-surface-container border border-border-subtle rounded-lg p-md font-meta-mono text-xs text-text-primary overflow-x-auto whitespace-pre">
              {codeSnippet}
            </pre>
          </section>
        </div>

        {/* Right Column */}
        <div className="col-span-12 md:col-span-4 space-y-lg">
          {/* Current Plan */}
          <section className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden">
            <div className="bg-primary p-md">
              <p className="font-meta-mono text-[10px] text-on-primary uppercase">
                Current Plan
              </p>
              <p className="text-headline-lg font-headline-lg font-bold text-on-primary mt-xs">
                Free Tier
              </p>
              <p className="text-on-primary/80 text-sm font-body-base">
                Community
              </p>
            </div>
            <div className="p-md space-y-md">
              <div className="space-y-xs">
                <div className="flex justify-between text-[11px] font-meta-mono text-text-secondary">
                  <span>API Keys</span>
                  <span className="text-text-primary">{keys.length}/5</span>
                </div>
                <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(keys.length * 20, 100)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-xs">
                <div className="flex justify-between text-[11px] font-meta-mono text-text-secondary">
                  <span>API Requests</span>
                  <span className="text-text-primary">0/10k</span>
                </div>
                <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tertiary rounded-full"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
              <div className="space-y-sm pt-sm border-t border-border-subtle">
                <button disabled title="Coming Soon" className="w-full px-md py-sm border border-border-subtle text-text-secondary font-body-base text-sm rounded hover:bg-surface-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Manage Billing
                </button>
                <button disabled title="Coming Soon" className="w-full px-md py-sm bg-primary text-on-primary font-body-base text-sm font-medium rounded hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </section>

          {/* Network Status */}
          <section className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-sm">
            <h2 className="font-section-header text-sm font-semibold text-text-primary">
              Backend Status
            </h2>
            <div className="p-md bg-surface-container border border-border-subtle rounded">
              <div className="flex items-center gap-sm mb-sm">
                <span className={`inline-block w-2 h-2 rounded-full ${keys.length > 0 ? "bg-status-success" : "bg-text-secondary"}`} />
                <span className="text-text-primary text-sm font-body-base">
                  {keys.length > 0 ? "Connected" : "Configure API key"}
                </span>
              </div>
              <p className="text-text-secondary font-meta-mono text-[10px]">
                API: {API_URL}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
