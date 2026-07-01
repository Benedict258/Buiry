import { useEffect } from "react";
import type { SessionObject } from "../../lib/types";

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

export function sessionToDetail(s: SessionObject): SessionDetail {
  return {
    id: s.session_id.split("_")[1],
    title: `${s.ai_agent}: ${s.current_phase}`,
    status: "COMPLETED",
    timestamp: new Date(s.timestamp).toLocaleString(),
    agent: s.ai_agent,
    phase: s.current_phase,
    duration: `${s.changes_made.length * 12}min`,
    summary: s.last_session_summary,
    filesModified: s.file_module_map.map((f) => ({
      path: f.file,
      added: Math.floor(Math.random() * 200) + 10,
      removed: Math.floor(Math.random() * 50),
    })),
    decisions: s.decisions_log.map((d, i) => ({
      title: `Decision ${i + 1}`,
      description: d.decision,
      color: (i % 2 === 0 ? "secondary" : "tertiary") as "secondary" | "tertiary",
    })),
    nextSteps: s.next_steps.map((step) => ({
      task: step,
      note: "From session " + s.session_id,
    })),
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

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-lg py-lg space-y-lg">
          {/* Section 1: Last Session Summary */}
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

          {/* Section 2: Changes Made */}
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

          {/* Section 3: Decisions */}
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

          {/* Section 4: Next Steps */}
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

          {/* Section 5: Dataset Signals */}
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
