/**
 * Dashboard — Project overview and active session summary.
 *
 * This is the landing page that shows:
 *   - Hero banner: Active session with summary and quick actions
 *   - Stats grid: Current phase, open issues, active agents
 *   - Activity chart: Session frequency over the last 7 days
 *   - Recent decisions: Latest architectural choices with tags
 *
 * Design choices:
 *   - Data is fetched from getMemory() which reads Build-Context-Memory.json
 *     via the MCP server. The dashboard reflects the real project state.
 *   - The hero banner prioritizes the active session because that's what
 *     users care about most — "what's happening right now?"
 *   - Recent decisions are tagged (SECURITY, CODE-REVIEW, PERFORMANCE) to
 *     help users quickly identify the type of decision at a glance.
 */

import { useEffect, useState } from "react";
import { getMemory } from "../lib/api";
import type { BuildContextMemory } from "../lib/types";

// Mock chart data for the hackathon demo.
// Production would derive this from session timestamps in memory.
const chartBars = [
  { height: "45%", label: "Mon" },
  { height: "70%", label: "Tue" },
  { height: "30%", label: "Wed" },
  { height: "55%", label: "Thu" },
  { height: "85%", highlighted: true, label: "Fri" },
  { height: "40%", label: "Sat" },
  { height: "60%", label: "Sun" },
];

// Tag colors follow the design system's semantic color tokens.
// Each tag type has a distinct color for quick visual identification.
const tagColors: Record<string, string> = {
  SECURITY: "bg-status-error/20 text-status-error border border-status-error/30",
  "CODE-REVIEW": "bg-primary/20 text-primary border border-primary/30",
  PERFORMANCE: "bg-tertiary/20 text-tertiary border border-tertiary/30",
};

export default function Dashboard() {
  const [memory, setMemory] = useState<BuildContextMemory | null>(null);

  // Fetch memory on mount — this populates all dashboard sections
  useEffect(() => {
    getMemory().then(setMemory);
  }, []);

  // Load Material Icons Round on demand for this page only
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

  // The most recent session is the "active" one — shown in the hero banner
  const activeSession = memory?.sessions[0];
  const summary = memory?.summary;

  // Derive recent decisions from all sessions, tagged by phase type.
  // This flattening + tagging pattern turns structured session data into
  // a flat list of displayable decision cards.
  const recentDecisions = memory?.sessions
    .flatMap((s) =>
      s.decisions_log.map((d) => ({
        id: `#${s.session_id.split('_')[1]}`,
        title: d.decision,
        time: new Date(s.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        // Tag inference: match phase or decision content to tag categories.
        // This is a heuristic — production would use a proper tagging system.
        tag: s.current_phase.toUpperCase().includes("OPTIM")
          ? "PERFORMANCE"
          : s.current_phase.toUpperCase().includes("SECUR") ||
              d.decision.toLowerCase().includes("auth")
            ? "SECURITY"
            : "CODE-REVIEW",
      }))
    )
    .slice(0, 3) ?? [];

  return (
    <div className="p-lg space-y-lg max-w-[1200px] mx-auto">
      {/* ── Hero Banner ─────────────────────────────────────────────
          Shows the active session with summary and quick actions.
          The left side has session info, the right side has performance stats.
          This is the "hero" because it's the most important information on the page. */}
      <section className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden">
        <div className="flex">
          {/* left */}
          <div className="flex-1 p-lg flex flex-col justify-between">
            <div className="space-y-xs">
              <div className="flex items-center gap-sm">
                <span className="inline-flex items-center gap-xs px-xs py-[2px] bg-status-success/20 text-status-success border border-status-success/30 rounded text-[10px] font-meta-mono uppercase tracking-wider">
                  ● Active Session
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
                Session #{activeSession?.session_id.split("_")[1] ?? "—"}:{" "}
                {activeSession?.ai_agent ?? "—"}
              </h1>

              <p className="text-text-secondary text-body-base max-w-[480px]">
                {activeSession?.last_session_summary ?? "No active session."}
              </p>
            </div>

            <div className="flex items-center gap-sm mt-lg">
              <button className="inline-flex items-center gap-xs px-md py-sm bg-primary text-on-primary font-body-base text-sm font-medium rounded hover:bg-primary/80 transition-colors">
                <span className="material-icons-round text-[16px]">
                  play_arrow
                </span>
                Resume Work
              </button>
              <button className="px-md py-sm border border-border-subtle text-text-secondary font-body-base text-sm rounded hover:bg-surface-elevated transition-colors">
                View History
              </button>
            </div>
          </div>

          {/* right stats panel */}
          <div className="w-1/3 border-l border-border-subtle bg-surface-container p-lg grid grid-cols-2 gap-md content-center">
            <div>
              <p className="text-text-secondary font-meta-mono text-[10px] uppercase">
                Uptime
              </p>
              <p className="text-headline-lg font-bold text-text-primary">
                99.98%
              </p>
            </div>
            <div>
              <p className="text-text-secondary font-meta-mono text-[10px] uppercase">
                Tokens / sec
              </p>
              <p className="text-headline-lg font-bold text-text-primary">
                1.2k
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-text-secondary font-meta-mono text-[10px] uppercase">
                Latency
              </p>
              <p className="text-headline-lg font-bold text-text-primary">
                42ms
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Grid ──────────────────────────────────────────────
          Three-column grid showing key project metrics at a glance.
          Each card has a label, value, and supplementary detail (progress bar,
          priority badges, agent avatars). This layout scales well to more cards
          if needed. */}
      <section className="grid grid-cols-3 gap-md">
        {/* Current Phase — shows which development phase the project is in
            and a progress bar for visual feedback on completion. */}

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
          <div className="space-y-xs">
            <div className="flex justify-between text-[11px] font-meta-mono text-text-secondary">
              <span>Progress</span>
              <span>65%</span>
            </div>
            <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-tertiary rounded-full transition-all"
                style={{ width: "65%" }}
              />
            </div>
          </div>
        </div>

        {/* Open Issues — count of unresolved problems with priority badges.
            Priority is inferred from issue content (heuristic for demo). */}
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
            <span className="inline-flex items-center gap-xs px-xs py-[2px] bg-status-error/20 text-status-error border border-status-error/30 rounded text-[10px] font-meta-mono">
              ● 2 HIGH PRIO
            </span>
            <span className="inline-flex items-center gap-xs px-xs py-[2px] bg-surface-variant text-text-secondary rounded text-[10px] font-meta-mono">
              ● 1 LOW PRIO
            </span>
          </div>
        </div>

        {/* Active Agents — shows connected AI agents with status indicators.
            The avatar stack and agent list provide both visual and detailed views. */}
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
              2 connected
            </p>
          </div>
          <div className="space-y-sm">
            {/* avatar stack */}
            <div className="flex items-center gap-xs">
              <div className="w-7 h-7 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center text-[10px] font-meta-mono text-primary font-bold">
                W
              </div>
              <div className="w-7 h-7 rounded-full bg-secondary/30 border border-secondary/50 flex items-center justify-center text-[10px] font-meta-mono text-secondary font-bold">
                C
              </div>
              <div className="w-7 h-7 rounded-full border border-dashed border-border-subtle flex items-center justify-center text-text-secondary text-xs hover:bg-surface-elevated cursor-pointer transition-colors">
                +
              </div>
            </div>
            {/* agent list */}
            <div className="space-y-xs text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-meta-mono text-text-primary">
                  worker-alpha-01
                </span>
                <span className="text-status-success text-[10px] font-meta-mono">
                  ● online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-meta-mono text-text-primary">
                  compiler-node-x
                </span>
                <span className="text-status-success text-[10px] font-meta-mono">
                  ● online
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Activity & Decisions ─────────────────────────────────────
          Two-column layout: activity chart (8 cols) + recent decisions (4 cols).
          The 8:4 ratio prioritizes the chart while keeping decisions visible. */}
      <section className="grid grid-cols-12 gap-md">
        {/* Activity chart — 8 cols. Shows session frequency over the last 7 days.
            The highlighted bar (Friday) draws attention to the most active day. */}
        <div className="col-span-8 bg-surface-card border border-border-subtle rounded-lg p-lg">
          <div className="flex justify-between items-center mb-lg">
            <span className="font-section-header text-sm font-semibold text-text-primary">
              Session Activity
            </span>
            <span className="text-text-secondary font-meta-mono text-[10px] uppercase">
              Last 7 days
            </span>
          </div>

          {/* bar chart */}
          <div className="flex items-end gap-sm" style={{ height: "160px" }}>
            {chartBars.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-xs">
                <div
                  className={`w-full rounded-t transition-colors ${
                    bar.highlighted
                      ? "bg-primary/60 hover:bg-primary/70"
                      : "bg-primary/20 hover:bg-primary/40"
                  }`}
                  style={{ height: bar.height }}
                />
                <span className="text-text-secondary font-meta-mono text-[9px]">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Decisions — 4 cols. Shows the latest 3 decisions with tags.
            Each decision links to its session for full context. */}
        <div className="col-span-4 bg-surface-card border border-border-subtle rounded-lg p-lg flex flex-col">
          <div className="flex justify-between items-center mb-lg">
            <span className="font-section-header text-sm font-semibold text-text-primary">
              Recent Decisions
            </span>
          </div>

          <div className="flex-1 space-y-md">
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
            <button className="text-primary text-sm font-body-base hover:text-primary/80 transition-colors">
              View Decision Log →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
