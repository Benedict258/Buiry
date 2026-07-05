import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMemory } from "../lib/api";
import type { BuildContextMemory } from "../lib/types";

const tagColors: Record<string, string> = {
  SECURITY: "bg-status-error/20 text-status-error border border-status-error/30",
  "CODE-REVIEW": "bg-primary/20 text-primary border border-primary/30",
  PERFORMANCE: "bg-tertiary/20 text-tertiary border border-tertiary/30",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function deriveActivityChart(sessions: BuildContextMemory["sessions"]) {
  const dayCounts = new Array(7).fill(0);
  for (const s of sessions) {
    const d = new Date(s.timestamp).getDay();
    const idx = d === 0 ? 6 : d - 1;
    dayCounts[idx]++;
  }
  const max = Math.max(...dayCounts, 1);
  const todayIdx = new Date().getDay();
  const todayMapped = todayIdx === 0 ? 6 : todayIdx - 1;
  return DAYS.map((label, i) => ({
    count: dayCounts[i],
    label,
    highlighted: i === todayMapped,
    amplitude: Math.round((dayCounts[i] / max) * 60),
  }));
}

export default function Dashboard() {
  const [memory, setMemory] = useState<BuildContextMemory | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMemory().then(setMemory);
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

  const activeSession = memory?.sessions[0];
  const summary = memory?.summary;

  const recentDecisions = memory?.sessions
    .flatMap((s) =>
      (s.decisions_log || []).map((d) => ({
        id: `#${(s.session_id || '').split("_")[1] || '?'}`,
        title: d.decision,
        time: new Date(s.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        tag: s.current_phase.toUpperCase().includes("OPTIM")
          ? "PERFORMANCE"
          : s.current_phase.toUpperCase().includes("SECUR") ||
              d.decision.toLowerCase().includes("auth")
            ? "SECURITY"
            : "CODE-REVIEW",
      }))
    )
    .slice(0, 3) ?? [];

  const chartBars = deriveActivityChart(memory?.sessions ?? []);

  const hasActivity = chartBars.some((b) => b.count > 0);
  const points = chartBars.map((bar, i) => {
    const x = (i / 6) * 600 + 50;
    const y = bar.amplitude * Math.sin(i * Math.PI / 3.5) + 80;
    return { x, y: Math.abs(y), label: bar.label, highlighted: bar.highlighted, count: bar.count };
  });
  const pathD = points.length > 0
    ? `M${points[0].x},${points[0].y} ` +
      points.slice(1).map((p, i) => {
        const prev = points[i];
        const cx1 = prev.x + (p.x - prev.x) / 3;
        const cx2 = prev.x + ((p.x - prev.x) / 3) * 2;
        return `C${cx1},${prev.y} ${cx2},${p.y} ${p.x},${p.y}`;
      }).join(' ')
    : '';

  const uniqueAgents = [...new Set((memory?.sessions ?? []).map((s) => s.ai_agent))];

  const allIssues = (memory?.sessions ?? []).flatMap((s) => (s.known_issues || []));
  const highPrio = allIssues.filter((i: any) => i?.severity === "high").length;
  const lowPrio = allIssues.filter((i: any) => i?.severity === "low").length;

  return (
    <div className="p-lg space-y-lg max-w-[1200px] mx-auto">
      {/* ── Hero Banner ───────────────────────────────────────────── */}
      <section className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-lg flex flex-col justify-between">
            <div className="space-y-xs">
              <div className="flex items-center gap-sm">
                <span className="inline-flex items-center gap-xs px-xs py-[2px] bg-status-success/20 text-status-success border border-status-success/30 rounded text-[10px] font-meta-mono uppercase tracking-wider">
                  {activeSession ? "● Active Session" : "○ No Sessions"}
                </span>
                <span className="text-text-secondary font-meta-mono text-[10px] uppercase">
                  {activeSession
                    ? new Date(activeSession.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>

              <h1 className="text-headline-lg font-headline-lg font-bold text-text-primary mt-sm">
              {activeSession
                ? `Session #${(activeSession.session_id || '').split("_")[1] || '?'}: ${activeSession.ai_agent}`
                : "No Active Session"}
              </h1>

              <p className="text-text-secondary text-body-base max-w-[480px]">
                {activeSession?.last_session_summary ?? "No data available. Start a session to see activity here."}
              </p>
            </div>

            <div className="flex items-center gap-sm mt-lg">
              <button onClick={() => navigate("/sessions")} className="px-md py-sm border border-border-subtle text-text-secondary font-body-base text-sm rounded hover:bg-surface-elevated transition-colors">
                View History
              </button>
            </div>
          </div>

          {/* right stats panel */}
          <div className="w-full md:w-1/3 border-l border-border-subtle bg-surface-container p-lg grid grid-cols-2 gap-md content-center">
            <div>
              <p className="text-text-secondary font-meta-mono text-[10px] uppercase">
                Total Sessions
              </p>
              <p className="text-headline-lg font-bold text-text-primary">
                {summary?.total_sessions ?? 0}
              </p>
            </div>
            <div>
              <p className="text-text-secondary font-meta-mono text-[10px] uppercase">
                Status
              </p>
              <p className="text-headline-lg font-bold text-text-primary capitalize">
                {summary?.overall_status ?? "N/A"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-text-secondary font-meta-mono text-[10px] uppercase">
                Last Updated
              </p>
              <p className="text-headline-lg font-bold text-text-primary">
                {summary?.last_updated
                  ? new Date(summary.last_updated).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Grid ────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
        <div className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-md">
          <div className="flex justify-between items-center">
            <span className="font-section-header text-sm font-semibold text-text-primary">
              Current Phase
            </span>
          </div>
          <div>
            <p className="text-text-secondary font-meta-mono text-[10px] uppercase">
              Phase
            </p>
            <p className="text-headline-lg font-bold text-text-primary">
              {summary?.current_phase ?? "—"}
            </p>
          </div>
        </div>

        <div className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-md">
          <div className="flex justify-between items-center">
            <span className="font-section-header text-sm font-semibold text-text-primary">
              Open Issues
            </span>
          </div>
          <div>
            <p className="text-text-secondary font-meta-mono text-[10px] uppercase">
              Total
            </p>
            <p className="text-headline-lg font-bold text-text-primary">
              {summary?.open_issues ?? 0} total
            </p>
          </div>
          <div className="flex items-center gap-sm flex-wrap">
            {highPrio > 0 && (
              <span className="inline-flex items-center gap-xs px-xs py-[2px] bg-status-error/20 text-status-error border border-status-error/30 rounded text-[10px] font-meta-mono">
                ● {highPrio} HIGH PRIO
              </span>
            )}
            {lowPrio > 0 && (
              <span className="inline-flex items-center gap-xs px-xs py-[2px] bg-surface-variant text-text-secondary rounded text-[10px] font-meta-mono">
                ● {lowPrio} LOW PRIO
              </span>
            )}
            {highPrio === 0 && lowPrio === 0 && (
              <span className="text-text-secondary font-meta-mono text-[10px]">No issues</span>
            )}
          </div>
        </div>

        <div className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-md">
          <div className="flex justify-between items-center">
            <span className="font-section-header text-sm font-semibold text-text-primary">
              Active Agents
            </span>
          </div>
          <div>
            <p className="text-text-secondary font-meta-mono text-[10px] uppercase">
              Status
            </p>
            <p className="text-headline-lg font-bold text-text-primary">
              {uniqueAgents.length} connected
            </p>
          </div>
          <div className="space-y-sm">
            <div className="flex items-center gap-xs">
              {uniqueAgents.slice(0, 3).map((agent, i) => {
                const colors = ["bg-primary/30 border-primary/50 text-primary", "bg-secondary/30 border-secondary/50 text-secondary", "bg-tertiary/30 border-tertiary/50 text-tertiary"];
                return (
                  <div key={agent} className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-meta-mono font-bold ${colors[i % colors.length]}`}>
                    {agent[0]}
                  </div>
                );
              })}
            </div>
            <div className="space-y-xs text-[11px]">
              {uniqueAgents.map((agent) => (
                <div key={agent} className="flex items-center justify-between">
                  <span className="font-meta-mono text-text-primary">
                    {agent}
                  </span>
                  <span className="text-status-success text-[10px] font-meta-mono">
                    ● online
                  </span>
                </div>
              ))}
              {uniqueAgents.length === 0 && (
                <span className="text-text-secondary font-meta-mono text-[10px]">No agents connected</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Activity & Decisions ───────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-md">
        <div className="col-span-1 lg:col-span-8 bg-surface-card border border-border-subtle rounded-lg p-lg">
          <div className="flex justify-between items-center mb-lg">
            <span className="font-section-header text-sm font-semibold text-text-primary">
              Session Activity
            </span>
            <span className="text-text-secondary font-meta-mono text-[10px] uppercase">
              Last 7 days
            </span>
          </div>

          <svg viewBox="0 0 700 160" className="w-full" style={{ height: "160px" }}>
            {!hasActivity && (
              <line x1="50" y1="80" x2="650" y2="80" stroke="var(--color-outline)" strokeWidth="1" strokeDasharray="4 4" />
            )}
            {hasActivity && (
              <path
                d={pathD}
                stroke="var(--color-primary)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            )}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.highlighted ? 5 : 3}
                  fill={p.highlighted ? "var(--color-primary)" : hasActivity ? "var(--color-primary)" : "var(--color-outline)"}
                  opacity={hasActivity ? 0.8 : 0.4}
                />
                <text
                  x={p.x}
                  y="140"
                  textAnchor="middle"
                  className="text-[9px] font-meta-mono"
                  fill={p.highlighted ? "var(--color-primary)" : "var(--color-text-secondary)"}
                >
                  {p.label}
                </text>
              </g>
            ))}
          </svg>
          {(!memory?.sessions || memory.sessions.length === 0) && (
            <p className="text-text-secondary font-meta-mono text-xs text-center mt-md">
              No data available
            </p>
          )}
        </div>

        <div className="col-span-1 lg:col-span-4 bg-surface-card border border-border-subtle rounded-lg p-lg flex flex-col">
          <div className="flex justify-between items-center mb-lg">
            <span className="font-section-header text-sm font-semibold text-text-primary">
              Recent Decisions
            </span>
          </div>

          <div className="flex-1 space-y-md">
            {recentDecisions.length === 0 && (
              <p className="text-text-secondary font-meta-mono text-xs">
                No decisions recorded yet.
              </p>
            )}
            {recentDecisions.map((d) => (
              <div
                key={d.id}
                className="border-b border-border-subtle last:border-0 pb-md last:pb-0"
              >
                <div className="flex items-center justify-between mb-xs">
                  <span className="font-meta-mono text-xs text-primary font-medium">
                    {d.id}
                  </span>
                  <span className="text-text-secondary font-meta-mono text-[10px]">
                    {d.time}
                  </span>
                </div>
                <p className="text-text-primary text-sm mb-xs">{d.title}</p>
                <span
                  className={`inline-block px-xs py-[2px] rounded text-[10px] font-meta-mono ${
                    tagColors[d.tag] ?? "bg-surface-variant text-text-secondary"
                  }`}
                >
                  {d.tag}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-md border-t border-border-subtle">
            <button onClick={() => navigate("/sessions")} className="text-primary text-sm font-body-base hover:text-primary/80 transition-colors">
              View Decision Log →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
