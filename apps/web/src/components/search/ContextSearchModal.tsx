import { useEffect, useState, useRef, useCallback } from "react";
import { searchContext } from "../../lib/api";
import type { SessionObject } from "../../lib/types";

interface SearchResult {
  id: string;
  icon: string;
  iconClass: string;
  iconBg: string;
  title: string;
  matchPercent: number;
  matchBadgeClass: string;
  content: string;
  tags: string[];
}

function sessionToResult(s: SessionObject): SearchResult {
  const tagColor =
    s.current_phase.toUpperCase().includes("OPTIM")
      ? "bg-status-success/10 text-status-success"
      : s.current_phase.toUpperCase().includes("SECUR")
        ? "bg-status-warning/10 text-status-warning"
        : "bg-status-error/10 text-status-error";

  return {
    id: s.session_id,
    icon: "terminal",
    iconClass: "text-primary",
    iconBg: "bg-primary/10",
    title: `${s.ai_agent}: ${s.current_phase}`,
    matchPercent: 0,
    matchBadgeClass: tagColor,
    content: s.last_session_summary,
    tags: [s.current_phase.toLowerCase()],
  };
}

interface ContextSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContextSearchModal({ open, onClose }: ContextSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const sessions = await searchContext(q);
      setResults(sessions.map(sessionToResult));
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      if (query.trim()) doSearch(query);
      else setResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, open, doSearch]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setSelectedIndex(0);
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          onClose();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, results.length]);

  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const el = resultsRef.current.children[selectedIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#000000CC] backdrop-blur-sm flex items-start justify-center pt-[10vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-surface-card border border-border-subtle rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center gap-sm px-lg py-md border-b border-border-subtle">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 28 }}>
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search project memory..."
            className="flex-1 bg-transparent border-none outline-none text-headline-md font-headline-md text-text-primary placeholder:text-outline"
          />
          <kbd className="px-sm py-xs rounded border border-border-subtle bg-surface-variant font-meta-mono text-xs text-on-surface-variant">
            ESC
          </kbd>
        </div>

        <div className="flex items-center gap-sm px-lg py-sm border-b border-border-subtle overflow-x-auto">
          <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-primary-container text-on-primary-container text-xs font-medium whitespace-nowrap">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            Semantic Match
          </span>
          <span className="inline-flex items-center gap-xs px-sm py-xs rounded-full bg-secondary-container text-on-secondary-container text-xs font-medium whitespace-nowrap">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Last 30 Days
          </span>
          <div className="flex-1" />
          {query.trim() && (
            <span className="text-xs text-tertiary whitespace-nowrap">
              {results.length} {results.length === 1 ? "match" : "matches"}
            </span>
          )}
        </div>

        <div ref={resultsRef} className="max-h-[420px] overflow-y-auto">
          {!query.trim() && (
            <div className="flex flex-col items-center justify-center py-2xl">
              <span className="material-icons-round text-text-secondary text-[32px] mb-sm">
                search
              </span>
              <p className="text-text-secondary font-meta-mono text-xs">
                Type to search...
              </p>
            </div>
          )}

          {query.trim() && isSearching && (
            <div className="flex flex-col items-center justify-center py-2xl">
              <span className="material-icons-round text-text-secondary text-[32px] mb-sm animate-spin">
                progress_activity
              </span>
              <p className="text-text-secondary font-meta-mono text-xs">
                Searching...
              </p>
            </div>
          )}

          {query.trim() && !isSearching && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-2xl">
              <span className="material-icons-round text-text-secondary text-[32px] mb-sm">
                search_off
              </span>
              <p className="text-text-secondary font-meta-mono text-xs">
                No results found
              </p>
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={result.id}
              className={`flex gap-md px-lg py-md border-b border-border-subtle cursor-pointer transition-colors duration-100 ${
                index === selectedIndex
                  ? "bg-surface-container-high"
                  : "hover:bg-surface-container-low"
              }`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${result.iconBg}`}
              >
                <span className={`material-symbols-outlined text-[22px] ${result.iconClass}`}>
                  {result.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-sm mb-xs">
                  <span className="text-headline-sm font-headline-md text-text-primary truncate">
                    {result.title}
                  </span>
                </div>
                <p className="text-sm text-text-secondary line-clamp-2">{result.content}</p>
                <div className="flex gap-xs mt-sm">
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-sm py-xs rounded bg-surface-variant text-xs text-on-surface-variant font-meta-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-sm px-lg py-sm border-t border-border-subtle">
          <button className="flex items-center gap-xs px-sm py-xs rounded-lg text-sm text-on-surface-variant hover:bg-surface-variant transition-colors duration-100">
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Create new dataset
          </button>
          <button className="flex items-center gap-xs px-sm py-xs rounded-lg text-sm text-on-surface-variant hover:bg-surface-variant transition-colors duration-100">
            <span className="material-symbols-outlined text-[18px]">help_center</span>
            Ask Buiry AI
          </button>
        </div>

        <div className="flex items-center justify-between px-lg py-sm border-t border-border-subtle">
          <div className="flex items-center gap-md text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-xs">
              <kbd className="px-xs py-px rounded border border-border-subtle bg-surface-variant font-meta-mono text-[10px]">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="inline-flex items-center gap-xs">
              <kbd className="px-xs py-px rounded border border-border-subtle bg-surface-variant font-meta-mono text-[10px]">
                ↵
              </kbd>
              Open
            </span>
          </div>
          <span className="text-xs text-tertiary font-meta-mono">
            Search powered by Buiry Context Engine
          </span>
        </div>
      </div>
    </div>
  );
}
