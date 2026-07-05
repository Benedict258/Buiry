import { NavLink } from "react-router-dom";
import { useSidebar } from "./Layout";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/projects", label: "Projects", icon: "folder" },
  { to: "/sessions", label: "Sessions", icon: "analytics" },
  { to: "/datasets", label: "Datasets", icon: "database" },
  { to: "/marketplace", label: "Market", icon: "storefront" },
  { to: "/docs", label: "Docs", icon: "description" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

export default function Sidebar() {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-[240px] bg-surface-container border-r border-border-subtle flex flex-col z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="px-md py-lg">
          <h1 className="text-headline-lg font-bold text-text-primary">Buiry</h1>
          <p className="font-meta-mono text-xs text-on-surface-variant mt-xs">
            BUild context memoRY
          </p>
          <span className="inline-block w-2 h-2 rounded-full bg-status-success ml-xs align-middle" />
        </div>

        <nav className="flex-1 px-sm space-y-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              onClick={close}
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

        <div className="px-sm pb-md space-y-sm">
          <button className="w-full flex items-center justify-center gap-sm px-md py-sm rounded-lg bg-primary text-on-primary font-bold text-sm hover:opacity-90 active:scale-95 transition-all duration-150">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Deploy New Agent
          </button>

          <NavLink
            to="/docs"
            onClick={close}
            className="flex items-center gap-sm px-md py-sm rounded-lg text-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-150"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
            Help
          </NavLink>

          <div className="flex items-center gap-sm px-md py-sm rounded-lg text-sm text-on-surface-variant hover:bg-surface-variant transition-all duration-150 cursor-pointer">
            <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-text-primary">
              U
            </span>
            <span>User</span>
          </div>
        </div>
      </aside>
    </>
  );
}
