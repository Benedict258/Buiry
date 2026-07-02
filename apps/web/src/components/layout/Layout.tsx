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
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  useEffect(() => {
    close();
  }, [location.pathname]);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <TopBar />
        <main className="md:ml-[240px] ml-0 pt-12 min-h-screen p-lg max-w-[1280px] mx-auto">
          <Outlet />
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
