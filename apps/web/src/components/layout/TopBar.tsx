import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "../../lib/ThemeContext";
import { useAuth } from "../../lib/AuthContext";
import { useSidebar } from "./Layout";

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/sessions": "Sessions",
  "/datasets": "Datasets",
  "/projects": "Projects",
  "/marketplace": "Market",
  "/docs": "Documentation",
  "/settings": "Settings",
};

export default function TopBar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { isOpen, toggle } = useSidebar();
  const navigate = useNavigate();
  const currentPage = pageNames[location.pathname] ?? "Page";

  return (
    <header
      className={`fixed top-0 right-0 h-12 bg-surface border-b border-border-subtle flex items-center justify-between px-lg z-30 transition-all duration-300 ${
        isOpen ? "left-[240px]" : "left-0"
      }`}
    >
      <div className="flex items-center gap-sm text-sm">
        <button
          onClick={toggle}
          className="text-on-surface-variant hover:text-text-primary transition-colors duration-150 mr-sm"
          aria-label="Toggle sidebar"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        {isOpen && (
          <>
            <span className="font-bold text-primary">Buiry</span>
            <span className="text-outline">/</span>
          </>
        )}
        <span className="text-text-primary">{currentPage}</span>
      </div>

      <div className="flex items-center gap-md">
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Search... (Cmd+K)"
            className="w-56 pl-9 pr-sm py-1.5 rounded-lg border border-border-subtle bg-surface-card text-sm text-text-primary placeholder:text-outline focus:outline-none focus:border-primary transition-colors duration-150"
          />
        </div>

        <button
          onClick={toggleTheme}
          className="text-on-surface-variant hover:text-text-primary transition-colors duration-150"
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-[20px]">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>

        <button
          onClick={() => toast("Notifications", { description: "No new notifications" })}
          className="hidden sm:block relative text-on-surface-variant hover:text-text-primary transition-colors duration-150"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>

        <button
          onClick={() => navigate("/settings")}
          className="hidden sm:block text-on-surface-variant hover:text-text-primary transition-colors duration-150"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>

        {user ? (
          <span
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-text-primary cursor-pointer"
            title={`${user.name ?? user.email}`}
          >
            {(user.name ?? user.email ?? "")[0].toUpperCase()}
          </span>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-3 py-1 rounded-lg bg-primary text-background text-xs font-semibold hover:opacity-90 transition-all"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
