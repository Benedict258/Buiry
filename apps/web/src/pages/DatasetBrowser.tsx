import { useEffect } from "react";

const datasets = [
  {
    name: "Global-NLP-v4",
    icon: "language",
    suiId: "0x7f3a...e2c1",
    cid: "bafybeig...xk9m2",
    privacyScore: 98,
    epoch: "Epoch 4,218",
    badge: "Verified",
    badgeStyle: "bg-status-success/20 text-status-success border border-status-success/30",
    barColor: "bg-status-success",
  },
  {
    name: "error-recovery-patterns",
    icon: "bug_report",
    suiId: "0x3d1b...a8f4",
    cid: "bafybeid...p7n3q",
    privacyScore: 62,
    epoch: "Epoch 3,891",
    badge: "Anonymizing",
    badgeStyle: "bg-status-warning/20 text-status-warning border border-status-warning/30",
    barColor: "bg-status-warning",
  },
  {
    name: "decision-sequences",
    icon: "account_tree",
    suiId: "0x9e4c...d7b3",
    cid: "bafybeih...w2k5r",
    privacyScore: 24,
    epoch: "Epoch 4,002",
    badge: "Critical PII",
    badgeStyle: "bg-status-error/20 text-status-error border border-status-error/30",
    barColor: "bg-status-error",
  },
];

const auditTrail = [
  {
    event: "Dataset Ingested",
    source: "walrus-cli",
    hash: "0x4f2a...8c1e",
    timestamp: "2025-10-24 14:32 UTC",
  },
  {
    event: "Privacy Scan Complete",
    source: "buiry-scanner",
    hash: "0x7d3b...1f6a",
    timestamp: "2025-10-24 14:35 UTC",
  },
  {
    event: "Sui Object Minted",
    source: "sui-sdk",
    hash: "0x2e9c...4d7b",
    timestamp: "2025-10-24 14:38 UTC",
  },
  {
    event: "Marketplace Listed",
    source: "marketplace-api",
    hash: "0x8a1f...c3e9",
    timestamp: "2025-10-24 14:40 UTC",
  },
];

export default function DatasetBrowser() {
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
            <button className="px-md py-sm bg-surface-card border border-border-subtle text-text-secondary font-meta-mono text-xs rounded hover:bg-surface-elevated transition-colors">
              <span className="material-icons-round text-[14px] align-middle mr-xs">
                filter_list
              </span>
              FILTERS
            </button>
            <button className="px-md py-sm bg-primary text-on-primary font-body-base text-sm font-medium rounded hover:bg-primary/80 transition-colors">
              <span className="material-icons-round text-[16px] align-middle mr-xs">
                add
              </span>
              Ingest Dataset
            </button>
          </div>
        </div>
      </header>

      {/* ── Dataset Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-md">
        {datasets.map((ds) => (
          <div
            key={ds.name}
            className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden hover:border-primary/50 transition-colors flex flex-col"
          >
            {/* Card Header */}
            <div className="p-md space-y-sm">
              <div className="flex items-center gap-sm">
                <span className="material-icons-round text-primary text-[20px]">
                  {ds.icon}
                </span>
                <h3 className="font-section-header text-sm font-semibold text-text-primary">
                  {ds.name}
                </h3>
              </div>
              <span
                className={`inline-block px-xs py-[2px] rounded text-[10px] font-meta-mono ${ds.badgeStyle}`}
              >
                {ds.badge}
              </span>
            </div>

            {/* Card Body */}
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
                    className={`h-full rounded-full transition-all ${ds.barColor}`}
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

            {/* Card Footer */}
            <div className="px-md py-sm bg-surface-container-lowest border-t border-border-subtle flex items-center gap-sm">
              <button className="flex-1 px-sm py-[4px] bg-surface-card border border-border-subtle rounded font-meta-mono text-[10px] text-text-secondary hover:bg-surface-elevated hover:text-primary transition-colors">
                VIEW_SAMPLE
              </button>
              <button className="flex-1 px-sm py-[4px] bg-surface-card border border-border-subtle rounded font-meta-mono text-[10px] text-text-secondary hover:bg-surface-elevated hover:text-primary transition-colors">
                DOWNLOAD
              </button>
              <button className="p-sm bg-surface-card border border-border-subtle rounded text-text-secondary hover:bg-surface-elevated hover:text-primary transition-colors">
                <span className="material-icons-round text-[14px]">
                  shopping_bag
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Audit Trail ─────────────────────────────────────────────── */}
      <section className="bg-surface-card border border-border-subtle rounded-lg overflow-hidden">
        <div className="px-md py-sm border-b border-border-subtle">
          <h2 className="font-section-header text-sm font-semibold text-text-primary">
            Audit Trail
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-md py-sm text-left text-text-secondary font-meta-mono text-[10px] uppercase">
                Event
              </th>
              <th className="px-md py-sm text-left text-text-secondary font-meta-mono text-[10px] uppercase">
                Source
              </th>
              <th className="px-md py-sm text-left text-text-secondary font-meta-mono text-[10px] uppercase">
                Security Hash
              </th>
              <th className="px-md py-sm text-left text-text-secondary font-meta-mono text-[10px] uppercase">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {auditTrail.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border-subtle last:border-0 hover:bg-surface-elevated transition-colors"
              >
                <td className="px-md py-sm text-text-primary text-sm font-body-base">
                  {row.event}
                </td>
                <td className="px-md py-sm">
                  <span className="px-xs py-[2px] bg-surface-variant text-text-secondary rounded text-[10px] font-meta-mono">
                    {row.source}
                  </span>
                </td>
                <td className="px-md py-sm text-text-primary font-technical-id text-xs">
                  {row.hash}
                </td>
                <td className="px-md py-sm text-text-secondary font-meta-mono text-xs">
                  {row.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-md">
        <div className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-xs">
          <p className="text-text-secondary font-meta-mono text-[10px] uppercase">
            Total Harvested
          </p>
          <p className="text-headline-lg font-headline-lg font-bold text-text-primary">
            12.4 TB
          </p>
        </div>
        <div className="bg-surface-card border border-border-subtle rounded-lg p-lg space-y-xs">
          <p className="text-text-secondary font-meta-mono text-[10px] uppercase">
            Marketplace Revenue
          </p>
          <p className="text-headline-lg font-headline-lg font-bold text-text-primary">
            4,821 SUI
          </p>
        </div>
      </div>
    </div>
  );
}
