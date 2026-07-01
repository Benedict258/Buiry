import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main className="ml-[240px] pt-12 min-h-screen p-lg max-w-[1280px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
