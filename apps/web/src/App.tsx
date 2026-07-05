import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./lib/ThemeContext";
import Layout from "./components/layout/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SessionExplorer from "./pages/SessionExplorer";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import DatasetBrowser from "./pages/DatasetBrowser";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";

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
          {/* Landing page — no sidebar, standalone */}
          <Route path="/" element={<Landing />} />

          {/* App pages — with sidebar layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sessions" element={<SessionExplorer />} />
            <Route path="/datasets" element={<DatasetBrowser />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
