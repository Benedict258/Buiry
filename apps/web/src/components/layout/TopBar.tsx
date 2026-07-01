/**
 * TopBar — Context-aware header bar.
 *
 * Fixed-position top bar that shows:
 *   - Breadcrumb navigation: "Buiry / {Current Page Name}"
 *   - Search input with Cmd+K hint (opens ContextSearchModal)
 *   - Notification bell with unread indicator (red dot)
 *   - Settings shortcut
 *   - User avatar
 *
 * Design choices:
 *   - The page name is derived from the current route using a lookup map,
 *     so adding a new route automatically updates the breadcrumb.
 *   - The search input is decorative — actual search is triggered by Cmd+K
 *     in ContextSearchModal. This is a common pattern (VS Code, Linear, etc.)
 *     where the input hints at the shortcut but doesn't handle the search itself.
 *   - left-[240px] matches the sidebar width to avoid overlap.
 */

import { useLocation } from "react-router-dom";

// Route path → Display name mapping for breadcrumbs.
// Unknown routes default to "Page" to avoid blank breadcrumbs.
const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/sessions": "Sessions",
  "/datasets": "Datasets",
  "/marketplace": "Market",
  "/docs": "Documentation",
  "/settings": "Settings",
};

export default function TopBar() {
  const location = useLocation();
  // Fallback to "Page" for unknown routes (e.g., /onboarding)
  const currentPage = pageNames[location.pathname] ?? "Page";

  return (
    <header className="fixed top-0 left-[240px] right-0 h-12 bg-surface border-b border-border-subtle flex items-center justify-between px-lg z-30">
      {/* Breadcrumb — "Buiry / Page Name". The "Buiry" prefix anchors the user
          to the product name, reinforcing brand identity during navigation. */}
      <div className="flex items-center gap-sm text-sm">
        <span className="font-bold text-primary">Buiry</span>
        <span className="text-outline">/</span>
        <span className="text-text-primary">{currentPage}</span>
      </div>

      <div className="flex items-center gap-md">
        {/* Search Input — Decorative; actual search is Cmd+K via ContextSearchModal.
            The placeholder text hints at the keyboard shortcut to discoverability. */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Search... (Cmd+K)"
            className="w-56 pl-9 pr-sm py-1.5 rounded-lg border border-border-subtle bg-surface-card text-sm text-text-primary placeholder:text-outline focus:outline-none focus:border-primary transition-colors duration-150"
          />
        </div>

        {/* Notification Bell — red dot indicates unread notifications.
            In production, this would be driven by a notification context/store. */}
        <button className="relative text-on-surface-variant hover:text-text-primary transition-colors duration-150">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-status-error" />
        </button>

        {/* Settings Quick Access — shortcut to /settings without opening the sidebar */}
        <button className="text-on-surface-variant hover:text-text-primary transition-colors duration-150">
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>

        {/* User Avatar — initials-based, matches sidebar avatar.
            Shared between TopBar and Sidebar for visual consistency. */}
        <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-text-primary cursor-pointer">
          JD
        </span>
      </div>
    </header>
  );
}
