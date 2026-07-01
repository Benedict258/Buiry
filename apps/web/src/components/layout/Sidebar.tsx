/**
 * Sidebar — Primary navigation component.
 *
 * Fixed-position left sidebar (240px wide) with:
 *   - Project identity header (name, version, active status)
 *   - Navigation links with active state highlighting
 *   - "Deploy New Agent" CTA button
 *   - Help link and user avatar at bottom
 *
 * Design choices:
 *   - Uses NavLink (not Link) for automatic active state detection via CSS classes
 *   - Navigation items are a static array for easy maintenance and reordering
 *   - Icons use Material Symbols Outlined for consistency with the design system
 *   - The sidebar is fixed-position to remain visible during page scrolling
 *   - flex-1 on nav pushes footer items to the bottom regardless of nav item count
 */

import { NavLink } from "react-router-dom";

// Navigation items — ordered by frequency of use (Dashboard first).
// Adding a new page requires only adding an entry here and creating the route in App.tsx.
const navItems = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/sessions", label: "Sessions", icon: "analytics" },
  { to: "/datasets", label: "Datasets", icon: "database" },
  { to: "/marketplace", label: "Market", icon: "storefront" },
  { to: "/docs", label: "Docs", icon: "description" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-[240px] bg-surface-container border-r border-border-subtle flex flex-col z-40">
      {/* Project Identity — shows which project is loaded in Buiry.
          In production, this would be populated from Build-Context-Memory.json's
          project_identity field via the MCP server. */}
      <div className="px-md py-lg">
        <h1 className="text-headline-lg font-bold text-text-primary">Project Alpha</h1>
        <p className="font-meta-mono text-xs text-on-surface-variant mt-xs">
          v1.2.4 • Active
        </p>
        {/* Green dot indicates the project's MCP memory is healthy and connected */}
        <span className="inline-block w-2 h-2 rounded-full bg-status-success ml-xs align-middle" />
      </div>

      {/* Navigation Links — flex-1 pushes footer items to bottom */}
      <nav className="flex-1 px-sm space-y-xs">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            // exact match for "/" to avoid Dashboard being "active" on all routes
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-sm px-md py-sm rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer — CTA, help, and user avatar pinned to bottom.
          The "Deploy New Agent" button is the primary action for the hackathon demo,
          representing the workflow of adding a new AI agent to the project. */}
      <div className="px-sm pb-md space-y-sm">
        <button className="w-full flex items-center justify-center gap-sm px-md py-sm rounded-lg bg-primary text-on-primary font-bold text-sm hover:opacity-90 active:scale-95 transition-all duration-150">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Deploy New Agent
        </button>

        <NavLink
          to="/docs"
          className="flex items-center gap-sm px-md py-sm rounded-lg text-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-150"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
          Help
        </NavLink>

        {/* User avatar — initials-based for the hackathon demo.
            Production would use actual user profile images. */}
        <div className="flex items-center gap-sm px-md py-sm rounded-lg text-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-150 cursor-pointer">
          <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-text-primary">
            JD
          </span>
          <span>John Doe</span>
        </div>
      </div>
    </aside>
  );
}
