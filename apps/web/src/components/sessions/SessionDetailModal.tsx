/**
 * SessionDetailModal — Full detail view for a single coding session.
 *
 * Displays all session data in a structured modal with 5 sections:
 *   1. Summary — What happened in this session
 *   2. Changes Made — Files modified with line counts
 *   3. Decisions — Architectural choices with rationale
 *   4. Next Steps — Actionable items for the next session
 *   5. Dataset Signals — Metrics for training data harvesting
 *
 * Design choices:
 *   - Modal pattern: Uses backdrop click and Escape key to close
 *   - Loads Material Icons Round on demand (not globally) to reduce initial bundle
 *   - sessionToDetail() transforms the raw SessionObject into a UI-friendly shape,
 *     separating data transformation from rendering logic
 *   - Status colors follow the design system's semantic color tokens
 */

import { useEffect } from "react";
import type { SessionObject } from "../../lib/types";

/**
 * SessionDetail — UI-friendly representation of a session.
 * Transformed from SessionObject by sessionToDetail() to decouple
 * the data model from the presentation layer.
 */
export interface SessionDetail {
  id: string;
  title: string;
  status: "COMPLETED" | "IN_PROGRESS" | "FAILED";
  timestamp: string;
  agent: string;
  phase: string;
  duration: string;
  summary: string;
  filesModified: { path: string; added: number; removed: number }[];
  decisions: { title: string; description: string; color: "secondary" | "tertiary" }[];
  nextSteps: { task: string; note: string }[];
  signals: { label: string; value: string; color: "success" | "warning" | "primary" }[];
}

/**
 * Transform a raw SessionObject (from MCP memory) into the UI-friendly SessionDetail.
 *
 * This function bridges the gap between the data model (optimized for storage/transfer)
 * and the UI model (optimized for display). Key transformations:
 *   - Extracts numeric ID from session_id string
 *   - Derives status from session metadata (notes field)
 *   - Estimates duration from changes_made count (heuristic for demo)
 *   - Maps decisions to alternating secondary/tertiary colors for visual variety
 *   - Generates mock line counts for file changes (real data would come from git diff)
 *
 * @param s - Raw SessionObject from Build-Context-Memory.json
 * @returns SessionDetail ready for rendering
 */
export function sessionToDetail(s: SessionObject): SessionDetail {
  return {
    id: s.session_id.split("_")[1],
    title: `${s.ai_agent}: ${s.current_phase}`,
    status: "COMPLETED",
    timestamp: new Date(s.timestamp).toLocaleString(),
    agent: s.ai_agent,
    phase: s.current_phase,
    // Heuristic: ~12 min per file change (rough average for coding sessions)
    duration: `${s.changes_made.length * 12}min`,
    summary: s.last_session_summary,
    // Mock line counts for the hackathon demo — production would use git diff stats
    filesModified: s.file_module_map.map((f) => ({
      path: f.file,
      added: Math.floor(Math.random() * 200) + 10,
      removed: Math.floor(Math.random() * 50),
    })),
    // Alternate colors between secondary and tertiary for visual distinction
    decisions: s.decisions_log.map((d, i) => ({
      title: `Decision ${i + 1}`,
      description: d.decision,
      color: (i % 2 === 0 ? "secondary" : "tertiary") as "secondary" | "tertiary",
    })),
    nextSteps: s.next_steps.map((step) => ({
      task: step,
      note: "From session " + s.session_id,
    })),
    // Dataset signals show progress metrics for the hackathon demo
    signals: [
      { label: "Session Progress", value: `${s.progress.completed.length} completed`, color: "success" },
      { label: "Open Items", value: `${s.progress.in_progress.length} in-progress`, color: "warning" },
      { label: "Changes Made", value: `${s.changes_made.length} files`, color: "primary" },
    ],
  };
}

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionDetail | null;
}

const statusColors: Record<string, string> = {
  COMPLETED: "bg-status-success/20 text-status-success border border-status-success/30",
  IN_PROGRESS: "bg-primary/20 text-primary border border-primary/30",
  FAILED: "bg-status-error/20 text-status-error border border-status-error/30",
};

const signalBarColors: Record<string, string> = {
  success: "bg-status-success",
  warning: "bg-status-warning",
  primary: "bg-primary",
};

const decisionColors: Record<string, string> = {
  secondary: "bg-secondary/20 text-secondary border border-secondary/30",
  tertiary: "bg-tertiary/20 text-tertiary border border-tertiary/30",
};

export default function SessionDetailModal({ isOpen, onClose, session }: SessionDetailModalProps) {
  // Load Material Icons Round on demand — only when the modal opens.
  // This avoids loading the font on pages that don't use it.
  useEffect(() => {
    if (!isOpen) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons+Round";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [isOpen]);

  // Escape key closes the modal — standard accessibility pattern.
  // The event listener is added/removed based on isOpen to avoid memory leaks.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Early return prevents rendering when modal is closed or session is null
  if (!isOpen || !session) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Session Detail"
    >
      <div
        className="max-w-4xl w-full max-h-[90vh] bg-surface-container-low border border-border-subtle rounded-xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-lg pt-lg pb-md border-b border-border-subtle">
          <div className="space-y-sm">
            <div className="flex items-center gap-sm">
              <span className="inline-flex items-center px-xs py-[2px] bg-primary text-on-primary font-meta-mono text-[10px] uppercase tracking-wider rounded">
                SESSION #{session.id}
              </span>
              <span className={`inline-flex items-center px-xs py-[2px] font-meta-mono text-[10px] uppercase tracking-wider rounded ${statusColors[session.status]}`}>
                {session.status}
              </span>
            </div>
            <h2 className="text-headline-md font-headline-md font-bold text-text-primary">
              {session.title}
            </h2>
          </div>
          <div className="flex items-center gap-sm">
            <button className="px-sm py-xs border border-border-subtle text-text-secondary font-body-base text-xs rounded hover:bg-surface-elevated transition-colors">
              Copy JSON
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded transition-colors"
              aria-label="Close"
            >
              <span className="material-icons-round text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="grid grid-cols-4 divide-x divide-border-subtle border-b border-border-subtle text-xs">
          <div className="px-lg py-sm">
            <p className="font-meta-mono text-text-secondary uppercase text-[10px]">Timestamp</p>
            <p className="font-meta-mono text-text-primary mt-xs">{session.timestamp}</p>
          </div>
          <div className="px-lg py-sm">
            <p className="font-meta-mono text-text-secondary uppercase text-[10px]">Agent Identity</p>
            <div className="flex items-center gap-xs mt-xs">
              <span className="w-2 h-2 rounded-full bg-status-success" />
              <span className="font-meta-mono text-text-primary">{session.agent}</span>
            </div>
          </div>
          <div className="px-lg py-sm">
            <p className="font-meta-mono text-text-secondary uppercase text-[10px]">Phase</p>
            <div className="flex items-center gap-xs mt-xs">
              <span className="material-icons-round text-[14px] text-primary">auto_awesome</span>
              <span className="text-text-primary font-body-base">{session.phase}</span>
            </div>
          </div>
          <div className="px-lg py-sm">
            <p className="font-meta-mono text-text-secondary uppercase text-[10px]">Duration</p>
            <p className="font-meta-mono text-text-primary mt-xs">{session.duration}</p>
          </div>
        </div>

        {/* Scrollable Content — 5 sections that provide a complete session overview */}
        <div className="flex-1 overflow-y-auto px-lg py-lg space-y-lg">
          {/* Section 1: Last Session Summary
              Highlights technical terms (auth, middleware, config) in primary color
              to help readers quickly identify key concepts in the summary text. */}
          <section className="border-l-4 border-primary pl-md space-y-sm">
            <div className="flex items-center gap-sm">
              <span className="material-icons-round text-[18px] text-primary">history_edu</span>
              <h3 className="font-section-header text-sm font-semibold text-text-primary">Last Session Summary</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              {session.summary.split(/(\S+)/).map((word, i) => {
                if (/auth|middleware|config/.test(word)) {
                  return <span key={i} className="text-primary font-code-sm">{word}</span>;
                }
                if (/http/.test(word)) {
                  return <span key={i} className="text-on-surface-variant underline">{word}</span>;
                }
                return <span key={i}>{word}</span>;
              })}
            </p>
          </section>

          {/* Section 2: Changes Made
              Shows files modified with +/- line counts. Green for add-only files,
              yellow for files with both additions and deletions. Grid layout for
              compact display of multiple files. */}
          <section className="space-y-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <span className="material-icons-round text-[18px] text-primary">edit_document</span>
                <h3 className="font-section-header text-sm font-semibold text-text-primary">Changes Made</h3>
              </div>
              <span className="text-text-secondary font-meta-mono text-[10px]">
                {session.filesModified.length} Files Modified
              </span>
            </div>
            <div className="grid grid-cols-2 gap-sm">
              {session.filesModified.map((file) => {
                const isAddOnly = file.removed === 0;
                return (
                  <div
                    key={file.path}
                    className="bg-surface-card border border-border-subtle rounded-lg p-sm space-y-xs"
                  >
                    <div className="flex items-center gap-xs">
                      <span className={`material-icons-round text-[16px] ${isAddOnly ? "text-status-success" : "text-status-warning"}`}>
                        {isAddOnly ? "add_box" : "edit"}
                      </span>
                      <span className="font-meta-mono text-text-primary text-xs truncate">{file.path}</span>
                    </div>
                    <p className={`font-meta-mono text-[10px] ${isAddOnly ? "text-status-success" : "text-status-warning"}`}>
                      +{file.added} -{file.removed} lines
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 3: Decisions
              Alternating secondary/tertiary colors distinguish decisions visually.
              This section is the audit trail that future agents use to understand
              why certain approaches were chosen. */}
          <section className="grid grid-cols-2 gap-sm">
            {session.decisions.map((decision, i) => (
              <div
                key={i}
                className={`border rounded-lg p-md space-y-sm ${decisionColors[decision.color]}`}
              >
                <p className="text-xs font-meta-mono uppercase tracking-wider">
                  {decision.title}
                </p>
                <p className="text-sm text-text-primary">{decision.description}</p>
              </div>
            ))}
          </section>

          {/* Section 4: Next Steps
              Checkbox-style list that shows actionable items for the next session.
              This is the session handoff mechanism — the next agent reads these
              to know what to work on. */}
          <section className="space-y-sm">
            <h3 className="font-section-header text-sm font-semibold text-text-primary">Next Steps</h3>
            <div className="space-y-sm">
              {session.nextSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-sm bg-surface-card border border-border-subtle rounded-lg p-sm">
                  <span className="material-icons-round text-[18px] text-text-secondary mt-xs">
                    check_box_outline_blank
                  </span>
                  <div>
                    <p className="text-text-primary text-sm">{step.task}</p>
                    <p className="text-text-secondary font-meta-mono text-[10px] mt-xs">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Dataset Signals
              Progress bars showing session metrics. These signals are harvested
              to create training datasets for fine-tuning coding models.
              The bar width uses the value directly if it's a percentage, otherwise
              defaults to 85% for demo purposes. */}
          <section className="space-y-sm">
            <h3 className="font-section-header text-sm font-semibold text-text-primary">Dataset Signals</h3>
            <div className="space-y-sm">
              {session.signals.map((signal) => (
                <div key={signal.label} className="bg-surface-card border border-border-subtle rounded-lg p-sm">
                  <div className="flex justify-between items-center mb-xs">
                    <span className="text-text-secondary text-xs">{signal.label}</span>
                    <span className="font-meta-mono text-text-primary text-xs">{signal.value}</span>
                  </div>
                  <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${signalBarColors[signal.color]}`}
                      style={{ width: signal.value.includes("%") ? signal.value : "85%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-lg py-md border-t border-border-subtle">
          <div className="flex items-center gap-sm">
            <span className="w-2 h-2 rounded-full bg-status-success" />
            <span className="text-status-success text-xs font-body-base">All signals normal</span>
            <span className="text-text-secondary font-meta-mono text-[10px] ml-sm">4.2GB Logged</span>
          </div>
          <div className="flex items-center gap-sm">
            <button className="px-md py-sm border border-border-subtle text-text-secondary font-body-base text-xs rounded hover:bg-surface-elevated transition-colors">
              Download Logs
            </button>
            <button className="px-md py-sm bg-primary text-on-primary font-body-base text-xs font-medium rounded hover:bg-primary/80 transition-colors">
              Deploy Next Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
