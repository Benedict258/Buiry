import { useEffect, useState } from "react";
import { getDatasets, type Dataset } from "../lib/api";

export default function DatasetBrowser() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  const fetchDatasets = () => {
    setDatasets([]);
    getDatasets().then(setDatasets);
  };

  useEffect(() => {
    getDatasets().then(setDatasets);
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

  return (
    <div className="p-lg max-w-[1200px] mx-auto space-y-lg">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="border-l-4 border-primary pl-md">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-headline-lg font-headline-lg font-bold text-text-primary">
              Active Repositories
            </h1>
            <p className="text-text-secondary font-meta-mono text-[10px] uppercase tracking-wider mt-xs">
              Walrus &amp; Sui Decentralized Dataset Registry
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              onClick={fetchDatasets}
              className="px-md py-sm bg-surface-card border border-border-subtle text-text-secondary font-meta-mono text-xs rounded hover:bg-surface-elevated transition-colors"
            >
              <span className="material-icons-round text-[14px] align-middle mr-xs">refresh</span>
              Refresh
            </button>
            <button className="px-md py-sm bg-surface-card border border-border-subtle text-text-secondary font-meta-mono text-xs rounded hover:bg-surface-elevated transition-colors">
              <span className="material-icons-round text-[14px] align-middle mr-xs">
                filter_list
              </span>
              FILTERS
            </button>
          </div>
        </div>
      </header>

      {/* ── Dataset Grid ────────────────────────────────────────────── */}
      {datasets.length === 0 ? (
        <div className="bg-surface-card border border-border-subtle rounded-lg p-xl flex flex-col items-center justify-center py-2xl">
          <span className="material-icons-round text-text-secondary text-[48px] mb-md">
            folder_open
          </span>
          <p className="text-headline-sm font-headline-sm font-semibold text-text-primary mb-xs">
            No datasets yet
          </p>
          <p className="text-text-secondary text-sm font-body-base">
            0 datasets found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {datasets.map((ds) => (
            <div
              key={ds.name}
              className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden hover:border-primary/50 transition-colors flex flex-col"
            >
              <div className="p-md space-y-sm">
                <div className="flex items-center gap-sm">
                  <span className="material-icons-round text-primary text-[20px]">
                    {ds.icon}
                  </span>
                  <h3 className="font-section-header text-sm font-semibold text-text-primary">
                    {ds.name}
                  </h3>
                </div>
                <span className="inline-block px-xs py-[2px] rounded text-[10px] font-meta-mono bg-surface-variant text-text-secondary">
                  {ds.badge}
                </span>
              </div>

              <div className="px-md pb-md space-y-sm flex-1">
                <div>
                  <span className="text-text-secondary font-meta-mono text-[10px] uppercase">
                    Sui Object ID
                  </span>
                  <p className="text-text-primary font-technical-id text-xs">
                    {ds.suiId}
                  </p>
                </div>

                <div className="space-y-xs">
                  <div className="flex justify-between text-[11px] font-meta-mono text-text-secondary">
                    <span>Privacy Score</span>
                    <span className="text-text-primary">{ds.privacyScore}/100</span>
                  </div>
                  <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all bg-primary"
                      style={{ width: `${ds.privacyScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-text-secondary font-meta-mono text-[10px] uppercase">
                    Walrus CID
                  </span>
                  <p className="text-text-primary font-technical-id text-xs">
                    {ds.cid}
                  </p>
                </div>

                <div>
                  <span className="text-text-secondary font-meta-mono text-[10px] uppercase">
                    Epoch
                  </span>
                  <p className="text-text-primary font-meta-mono text-xs">
                    {ds.epoch}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      <div className="text-center py-lg">
        <p className="text-text-secondary text-sm">
          {datasets.length} dataset{datasets.length !== 1 ? 's' : ''} registered
        </p>
      </div>
    </div>
  );
}
