/**
 * App Root — Route definitions and layout structure.
 *
 * Uses React Router's nested routes with a shared Layout wrapper.
 * All pages are rendered inside the Layout component (sidebar + topbar).
 *
 * Route Structure:
 *   /              → Dashboard (project overview, stats, recent decisions)
 *   /sessions      → SessionExplorer (timeline of all coding sessions)
 *   /datasets      → DatasetBrowser (harvested training datasets)
 *   /marketplace   → Marketplace (placeholder — future agent marketplace)
 *   /settings      → Settings (placeholder)
 *   /docs          → Documentation (placeholder)
 *   /onboarding    → Onboarding (first-run experience)
 *
 * Design choice: All routes share a single Layout wrapper rather than each
 * page importing its own sidebar/topbar. This ensures consistent navigation
 * and avoids layout shift when switching pages. The Layout uses React Router's
 * <Outlet /> to render child routes.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./lib/ThemeContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import SessionExplorer from "./pages/SessionExplorer";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import DatasetBrowser from "./pages/DatasetBrowser";

// Placeholder pages — not yet implemented but routes exist for hackathon demo.
// These show the planned feature surface area without requiring full implementations.
function Marketplace() {
  return <div className="p-md"><h1 className="text-headline-lg font-headline-lg">Marketplace</h1></div>;
}

function Documentation() {
  return <div className="p-md"><h1 className="text-headline-lg font-headline-lg">Documentation</h1></div>;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* All routes share the Layout wrapper (sidebar + topbar) */}
          <Route element={<Layout />}>
            {/* Dashboard: project overview, active session, stats grid, activity chart */}
            <Route path="/" element={<Dashboard />} />
            {/* SessionExplorer: timeline view of all coding sessions with filters */}
            <Route path="/sessions" element={<SessionExplorer />} />
            {/* DatasetBrowser: harvested training datasets from session memory */}
            <Route path="/datasets" element={<DatasetBrowser />} />
            {/* Marketplace: future agent/template marketplace (placeholder) */}
            <Route path="/marketplace" element={<Marketplace />} />
            {/* Settings: configuration page (placeholder) */}
            <Route path="/settings" element={<Settings />} />
            {/* Documentation: project docs (placeholder) */}
            <Route path="/docs" element={<Documentation />} />
            {/* Onboarding: first-run experience for new users */}
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
