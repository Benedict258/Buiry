import { Link } from "react-router-dom";

const categories = ["Code", "Design", "DevOps", "Data", "Security", "Testing"];

const sampleDatasets = [
  {
    name: "React Performance Optimization",
    category: "Code",
    price: "0.5 SUI",
    samples: "847 samples",
    privacyScore: "92/100",
  },
  {
    name: "API Rate Limiting Patterns",
    category: "DevOps",
    price: "0.3 SUI",
    samples: "612 samples",
    privacyScore: "88/100",
  },
  {
    name: "SQL Query Optimization",
    category: "Data",
    price: "0.7 SUI",
    samples: "1204 samples",
    privacyScore: "95/100",
  },
  {
    name: "OAuth2 Authentication Flows",
    category: "Security",
    price: "0.6 SUI",
    samples: "523 samples",
    privacyScore: "91/100",
  },
  {
    name: "Figma Design System Patterns",
    category: "Design",
    price: "0.4 SUI",
    samples: "398 samples",
    privacyScore: "86/100",
  },
  {
    name: "Jest Testing Strategies",
    category: "Testing",
    price: "0.2 SUI",
    samples: "756 samples",
    privacyScore: "89/100",
  },
  {
    name: "GraphQL Schema Design",
    category: "Code",
    price: "0.8 SUI",
    samples: "934 samples",
    privacyScore: "93/100",
  },
  {
    name: "Kubernetes Deployment Patterns",
    category: "DevOps",
    price: "0.9 SUI",
    samples: "1089 samples",
    privacyScore: "87/100",
  },
];

const categoryColors: Record<string, string> = {
  Code: "bg-secondary/20 text-secondary border-secondary/30",
  Design: "bg-tertiary/20 text-tertiary border-tertiary/30",
  DevOps: "bg-primary/20 text-primary border-primary/30",
  Data: "bg-accent/20 text-accent border-accent/30",
  Security: "bg-status-error/20 text-status-error border-status-error/30",
  Testing: "bg-status-success/20 text-status-success border-status-success/30",
};

export default function Market() {
  return (
    <div className="p-lg space-y-lg max-w-[1200px] mx-auto">
      <header className="text-center space-y-sm pb-lg">
        <h1 className="text-headline-lg font-headline-lg font-bold text-text-primary">
          Dataset Marketplace
        </h1>
        <p className="text-text-secondary text-sm max-w-xl mx-auto">
          Trade verified training datasets on Sui blockchain
        </p>
        <span className="inline-block px-sm py-[2px] rounded text-[10px] font-meta-mono bg-primary/10 text-primary border border-primary/20">
          Coming Soon — Phase 5
        </span>
      </header>

      <div className="flex flex-col sm:flex-row gap-sm items-stretch">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search datasets by name, category, or keyword..."
            className="w-full px-md py-sm bg-surface-card border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-secondary font-body-base focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <button className="px-md py-sm bg-surface-card border border-border-subtle text-text-secondary font-meta-mono text-xs rounded-lg hover:bg-surface-elevated transition-colors whitespace-nowrap">
          Filters
        </button>
      </div>

      <div className="flex flex-wrap gap-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            className="px-sm py-[2px] rounded-full text-[10px] font-meta-mono border border-border-subtle text-text-secondary hover:text-text-primary hover:border-primary/30 transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        {sampleDatasets.map((ds) => (
          <div
            key={ds.name}
            className="relative rounded-2xl glass-card overflow-hidden hover:border-primary/20 transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-background/70 z-10 flex items-center justify-center">
              <span className="px-md py-sm rounded-full glass-card text-sm font-meta-mono text-text-primary font-semibold">
                Coming Soon
              </span>
            </div>

            <div className="p-md space-y-sm opacity-40">
              <div className="flex items-start justify-between gap-sm">
                <h3
                  className="text-sm font-semibold text-text-primary leading-snug"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {ds.name}
                </h3>
                <span
                  className={`inline-block px-xs py-[2px] rounded text-[9px] font-meta-mono border ${
                    categoryColors[ds.category] ?? "bg-surface-variant text-text-secondary"
                  }`}
                >
                  {ds.category}
                </span>
              </div>

              <div className="flex items-center gap-sm text-xs font-meta-mono">
                <span className="text-primary font-semibold">{ds.price}</span>
                <span className="text-text-secondary">|</span>
                <span className="text-text-secondary">{ds.samples}</span>
              </div>

              <div className="space-y-xs">
                <div className="flex justify-between text-[10px] font-meta-mono text-text-secondary">
                  <span>Privacy Score</span>
                  <span className="text-text-primary">{ds.privacyScore}</span>
                </div>
                <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{
                      width: `${Number(ds.privacyScore.split("/")[0])}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-sm border-t border-border-subtle flex items-center justify-between">
                <span className="text-[10px] font-meta-mono text-text-secondary">
                  Sui Verified
                </span>
                <span className="text-[9px] font-meta-mono text-status-success/60">
                  Pending
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-md">
        <div className="rounded-2xl glass-card p-md text-center space-y-xs">
          <p className="text-headline-lg font-headline-lg font-bold text-text-primary">
            0
          </p>
          <p className="text-[10px] font-meta-mono text-text-secondary uppercase tracking-wider">
            Total Listings
          </p>
        </div>
        <div className="rounded-2xl glass-card p-md text-center space-y-xs">
          <p className="text-headline-lg font-headline-lg font-bold text-text-primary">
            0 SUI
          </p>
          <p className="text-[10px] font-meta-mono text-text-secondary uppercase tracking-wider">
            Total Volume
          </p>
        </div>
        <div className="rounded-2xl glass-card p-md text-center space-y-xs">
          <p className="text-headline-lg font-headline-lg font-bold text-text-primary">
            0
          </p>
          <p className="text-[10px] font-meta-mono text-text-secondary uppercase tracking-wider">
            Active Sellers
          </p>
        </div>
      </div>

      <div className="relative rounded-2xl border-gradient overflow-hidden p-lg text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative space-y-sm">
          <h3
            className="text-xl font-bold text-text-primary"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Want to sell your datasets?
          </h3>
          <p className="text-text-secondary text-sm max-w-lg mx-auto">
            Connect your Buiry project and list your verified training datasets
            on the decentralized marketplace. Coming in Phase 5.
          </p>
          <Link
            to="/projects"
            className="inline-block px-md py-sm mt-sm rounded-lg bg-primary text-background text-sm font-semibold hover:opacity-90 transition-all"
          >
            Connect Your Project
          </Link>
        </div>
      </div>
    </div>
  );
}
