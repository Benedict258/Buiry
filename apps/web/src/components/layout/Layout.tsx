import { useState, createContext, useContext, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggle: () => {},
  close: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function Layout() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  useEffect(() => {
    if (window.innerWidth < 768) close();
  }, [location.pathname]);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <TopBar />
        <main
          className={`min-h-screen p-lg max-w-[1280px] mx-auto transition-all duration-300 ${
            isOpen ? "md:ml-[240px]" : "ml-0"
          }`}
          style={{ paddingTop: "4rem" }}
        >
          <Outlet />
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
