import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSessions } from "../lib/api";
import { exportSessions } from "../lib/export";
import type { SessionObject } from "../lib/types";

interface SessionCardData {
  id: string;
  agent: string;
  agentKey: string;
  phase: string;
  status: string;
  timestamp: string;
  date: string;
  summary: string;
  inputTokens: string;
  outputTokens: string;
}

function mapSession(s: SessionObject): SessionCardData {
  const ts = new Date(s.timestamp);
  const now = new Date();
  const diffMs = now.getTime() - ts.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const dateLabel = diffDays === 0 ? "today" : diffDays === 1 ? "yesterday" : `${diffDays}d ago`;

  const agentKey = s.ai_agent.toLowerCase().includes("claude")
    ? "claude"
    : s.ai_agent.toLowerCase().includes("cursor")
      ? "cursor"
      : "copilot";

  const status =
    typeof s.progress === 'number' && s.progress >= 100
      ? "COMPLETED"
      : typeof s.progress === 'number' && s.progress > 0
        ? "ACTIVE"
        : typeof s.progress === 'string' && s.progress === 'completed'
          ? "COMPLETED"
          : "ARCHIVED";

  const inputTokens = "—";
  const outputTokens = "—";

  return {
    id: s.session_id.split("_")[1],
    agent: s.ai_agent,
    agentKey,
    phase: s.current_phase,
    status,
    timestamp: ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: dateLabel,
    summary: s.last_session_summary,
    inputTokens,
    outputTokens,
  };
}

const agentColors: Record<string, string> = {
  claude: "bg-tertiary/20 text-tertiary border border-tertiary/30",
  cursor: "bg-primary/20 text-primary border border-primary/30",
  copilot: "bg-secondary/20 text-secondary border border-secondary/30",
};

const phaseColors: Record<string, string> = {
  Optimization: "bg-tertiary/20 text-tertiary border border-tertiary/30",
  Debugging: "bg-primary/20 text-primary border border-primary/30",
  "Feature Addition": "bg-secondary/20 text-secondary border border-secondary/30",
  Refactoring: "bg-primary/20 text-primary border border-primary/30",
};

const statusStyles: Record<string, { dot: string; badge: string }> = {
  ACTIVE: {
    dot: "bg-status-success animate-pulse",
    badge: "bg-status-success/20 text-status-success border border-status-success/30",
  },
  COMPLETED: {
    dot: "bg-text-secondary",
    badge: "bg-surface-variant text-text-secondary border border-border-subtle",
  },
  ARCHIVED: {
    dot: "bg-text-secondary",
    badge: "bg-surface-variant text-text-secondary border border-border-subtle",
  },
};

function formatDateHeader(dateLabel: string): string {
  if (dateLabel === "today") {
    const d = new Date();
    return `Today, ${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`;
  }
  if (dateLabel === "yesterday") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `Yesterday, ${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`;
  }
  const daysAgo = parseInt(dateLabel);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`;
}

export default function SessionExplorer() {
  const [sessions, setSessions] = useState<SessionCardData[]>([]);
  const [rawSessions, setRawSessions] = useState<SessionObject[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    getSessions().then((raw) => {
      setRawSessions(raw);
      setSessions(raw.map(mapSession));
    });
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

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const filteredSessions = sessions.filter(
    (s) =>
      (agentFilter === "all" || s.agentKey === agentFilter) &&
      (phaseFilter === "all" || s.phase.toLowerCase().includes(phaseFilter)) &&
      (search === "" ||
        s.summary.toLowerCase().includes(search.toLowerCase()) ||
        s.phase.toLowerCase().includes(search.toLowerCase()) ||
        s.agent.toLowerCase().includes(search.toLowerCase()))
  );

  const todaySessions = filteredSessions.filter((s) => s.date === "today");
  const yesterdaySessions = filteredSessions.filter((s) => s.date === "yesterday");
  const olderSessions = filteredSessions.filter(
    (s) => s.date !== "today" && s.date !== "yesterday"
  );

  const olderGroups = olderSessions.reduce<Record<string, SessionCardData[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  return (
    <div className="p-lg max-w-[1200px] mx-auto space-y-lg">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="border-l-4 border-primary pl-md">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-headline-lg font-headline-lg font-bold text-text-primary">
              Session Explorer
            </h1>
            <p className="text-text-secondary font-meta-mono text-[10px] uppercase tracking-wider mt-xs">
              Historical Session Analytics &amp; Audit Logs
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              onClick={async () => {
                const { getApiKey } = await import("../lib/api");
                const key = getApiKey();
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const headers: Record<string,string> = {'Content-Type':'application/json'};
                if (key) {
                  if (key.startsWith('Bearer ')) headers['Authorization'] = key;
                  else headers['x-api-key'] = key;
                }
                try {
                  const res = await fetch(`${API_URL}/api/dataset/generate`, { method: 'POST', headers });
                  const data = await res.json();
                  if (data.generated?.length) toast.success(`Generated ${data.generated.length} datasets`);
                  else toast(data.message || 'No data to generate from');
                } catch { toast.error('Generation failed'); }
              }}
              className="px-md py-sm bg-primary text-on-primary font-meta-mono text-xs rounded hover:opacity-90 transition-colors"
            >
              Generate Datasets
            </button>
            <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              disabled={rawSessions.length === 0}
              className="px-md py-sm bg-surface-card border border-border-subtle text-text-secondary font-meta-mono text-xs rounded hover:bg-surface-elevated hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-icons-round text-[14px] align-middle mr-xs">download</span>
              Export
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 bg-surface-card border border-border-subtle rounded-lg shadow-lg z-40 py-sm min-w-[120px]">
                {(["json", "csv", "txt"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      exportSessions(rawSessions, fmt);
                      toast.success(`Exported as ${fmt.toUpperCase()}`);
                      setShowExport(false);
                    }}
                    className="w-full text-left px-md py-sm text-sm text-text-primary hover:bg-surface-elevated transition-colors font-meta-mono uppercase"
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </header>

      {/* ── Filter Bar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-y border-border-subtle py-sm">
        <div className="flex items-center gap-sm">
          <div className="relative flex-1">
            <span className="material-icons-round absolute left-sm top-1/2 -translate-y-1/2 text-text-secondary text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search logs, sessions, or agent IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-xl pr-xl py-sm bg-surface-card border border-border-subtle rounded text-text-primary text-sm font-body-base placeholder:text-text-secondary focus:outline-none focus:border-primary/50 transition-colors"
            />
            <span className="absolute right-sm top-1/2 -translate-y-1/2 text-text-secondary font-meta-mono text-[10px] bg-surface-elevated px-xs py-[2px] rounded border border-border-subtle">
              /
            </span>
          </div>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="hidden sm:block px-md py-sm bg-surface-card border border-border-subtle rounded text-text-secondary text-sm font-body-base focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Agents</option>
            <option value="claude">Claude Code</option>
            <option value="cursor">Cursor</option>
            <option value="copilot">GitHub Copilot</option>
          </select>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="hidden sm:block px-md py-sm bg-surface-card border border-border-subtle rounded text-text-secondary text-sm font-body-base focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Phases</option>
            <option value="optimization">Optimization</option>
            <option value="debugging">Debugging</option>
            <option value="feature">Feature Addition</option>
            <option value="refactoring">Refactoring</option>
          </select>
          <button className="p-sm bg-surface-card border border-border-subtle rounded text-text-secondary hover:bg-surface-elevated hover:text-primary transition-colors">
            <span className="material-icons-round text-[18px]">filter_list</span>
          </button>
        </div>
      </div>

      {/* ── Timeline ────────────────────────────────────────────────── */}
      {sessions.length === 0 ? (
        <div className="bg-surface-card border border-border-subtle rounded-lg p-xl flex flex-col items-center justify-center py-2xl">
          <span className="material-icons-round text-text-secondary text-[48px] mb-md">
            history
          </span>
          <p className="text-headline-sm font-headline-sm font-semibold text-text-primary mb-xs">
            No sessions yet
          </p>
          <p className="text-text-secondary text-sm font-body-base">
            Start a coding session to see it appear here.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[16px] top-0 bottom-0 w-px bg-border-subtle z-0" />

          {/* Today */}
          <div className="relative z-10 mb-lg">
            <div className="flex items-center gap-sm mb-md pl-xl">
              <span className="material-icons-round text-text-secondary text-[16px]">
                calendar_today
              </span>
              <h2 className="text-section-header font-section-header font-semibold text-text-primary text-sm">
                {formatDateHeader("today")}
              </h2>
            </div>
            <div className="space-y-md pl-xl">
              {todaySessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  expanded={expanded === session.id}
                  onToggle={() => toggleExpand(session.id)}
                />
              ))}
              {todaySessions.length === 0 && (
                <p className="text-text-secondary font-meta-mono text-xs py-md">
                  No sessions match filters.
                </p>
              )}
            </div>
          </div>

          {/* Yesterday */}
          <div className="relative z-10 mb-lg">
            <div className="flex items-center gap-sm mb-md pl-xl">
              <span className="material-icons-round text-text-secondary text-[16px]">
                calendar_today
              </span>
              <h2 className="text-section-header font-section-header font-semibold text-text-primary text-sm">
                {formatDateHeader("yesterday")}
              </h2>
            </div>
            <div className="space-y-md pl-xl">
              {yesterdaySessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  expanded={expanded === session.id}
                  onToggle={() => toggleExpand(session.id)}
                />
              ))}
              {yesterdaySessions.length === 0 && (
                <p className="text-text-secondary font-meta-mono text-xs py-md">
                  No sessions match filters.
                </p>
              )}
            </div>
          </div>

          {/* Older sessions grouped by day */}
          {Object.entries(olderGroups).map(([date, group]) => (
            <div key={date} className="relative z-10 mb-lg">
              <div className="flex items-center gap-sm mb-md pl-xl">
                <span className="material-icons-round text-text-secondary text-[16px]">
                  calendar_today
                </span>
                <h2 className="text-section-header font-section-header font-semibold text-text-primary text-sm">
                  {formatDateHeader(date)}
                </h2>
              </div>
              <div className="space-y-md pl-xl">
                {group.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    expanded={expanded === session.id}
                    onToggle={() => toggleExpand(session.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Load More ────────────────────────────────────────────────── */}
      <div className="flex justify-center pt-md">
        <button className="inline-flex items-center gap-xs px-lg py-sm bg-surface-card border border-border-subtle text-text-secondary font-meta-mono text-xs rounded hover:bg-surface-elevated hover:text-primary transition-colors">
          <span className="material-icons-round text-[16px]">expand_more</span>
          LOAD_OLDER_SESSIONS
        </button>
      </div>
    </div>
  );
}

function SessionCard({
  session,
  expanded,
  onToggle,
}: {
  session: SessionCardData;
  expanded: boolean;
  onToggle: () => void;
}) {
  const st = statusStyles[session.status] ?? statusStyles.ARCHIVED;

  return (
    <div className="relative">
      <div
        className={`absolute left-[-24px] top-6 w-2 h-2 rounded-full z-20 ${st.dot}`}
      />

      <div
        className={`bg-surface-card border border-border-subtle rounded-lg overflow-hidden transition-all hover:border-primary/50 cursor-pointer ${
          expanded ? "border-primary/40" : ""
        }`}
        onClick={onToggle}
      >
        <div className="px-md py-sm flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-sm">
            <span className="font-technical-id text-xs text-primary font-medium bg-primary/10 px-xs py-[2px] rounded">
              #{session.id}
            </span>
            <span className={`px-xs py-[2px] rounded text-[10px] font-meta-mono ${st.badge}`}>
              ● {session.status}
            </span>
          </div>
          <span className="text-text-secondary font-meta-mono text-[10px]">
            {session.timestamp}
          </span>
        </div>

        <div className="px-md pb-sm grid grid-cols-2 md:grid-cols-4 gap-sm text-[11px]">
          <div>
            <span className="text-text-secondary font-meta-mono uppercase block mb-[2px]">
              Agent
            </span>
            <span
              className={`inline-block px-xs py-[2px] rounded font-meta-mono text-[10px] ${agentColors[session.agentKey] ?? ""}`}
            >
              {session.agent}
            </span>
          </div>
          <div>
            <span className="text-text-secondary font-meta-mono uppercase block mb-[2px]">
              Phase
            </span>
            <span
              className={`inline-block px-xs py-[2px] rounded font-meta-mono text-[10px] ${phaseColors[session.phase] ?? ""}`}
            >
              {session.phase}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-text-secondary font-meta-mono uppercase block mb-[2px]">
              Context
            </span>
            <p className="text-text-primary text-xs leading-relaxed line-clamp-2">
              {session.summary}
            </p>
          </div>
        </div>

        <div className="px-md py-sm bg-surface-container-lowest border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-md font-meta-mono text-[10px] text-text-secondary">
            <span>
              INPUT <span className="text-text-primary">{session.inputTokens}</span>
            </span>
            <span>
              OUTPUT <span className="text-text-primary">{session.outputTokens}</span>
            </span>
          </div>
          <button
            className="px-sm py-[4px] bg-surface-card border border-border-subtle rounded font-meta-mono text-[10px] text-text-secondary hover:bg-surface-elevated hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {session.status === "ACTIVE" ? "VIEW_FULL_STREAM" : "VIEW_SNAPSHOT"}
          </button>
        </div>

        {expanded && (
          <div className="px-md py-md border-t border-border-subtle bg-surface-container space-y-sm">
            <div className="grid grid-cols-2 gap-sm text-[11px]">
              <div>
                <span className="text-text-secondary font-meta-mono uppercase">
                  Session ID
                </span>
                <p className="text-text-primary font-technical-id">
                  #{session.id}
                </p>
              </div>
              <div>
                <span className="text-text-secondary font-meta-mono uppercase">
                  Agent Instance
                </span>
                <p className="text-text-primary font-meta-mono">{session.agent}</p>
              </div>
              <div>
                <span className="text-text-secondary font-meta-mono uppercase">
                  Operation Phase
                </span>
                <p className="text-text-primary font-meta-mono">{session.phase}</p>
              </div>
              <div>
                <span className="text-text-secondary font-meta-mono uppercase">
                  Status
                </span>
                <p className="text-text-primary font-meta-mono">{session.status}</p>
              </div>
            </div>
            <div>
              <span className="text-text-secondary font-meta-mono uppercase text-[10px]">
                Full Summary
              </span>
              <p className="text-text-primary text-xs leading-relaxed mt-xs">
                {session.summary}
              </p>
            </div>
            <div className="flex items-center gap-md font-meta-mono text-[10px] text-text-secondary pt-xs">
              <span>
                Total Input Tokens:{" "}
                <span className="text-text-primary">{session.inputTokens}</span>
              </span>
              <span>
                Total Output Tokens:{" "}
                <span className="text-text-primary">{session.outputTokens}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
