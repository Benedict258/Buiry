import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./lib/ThemeContext";
import { AuthProvider } from "./lib/AuthContext";
import Layout from "./components/layout/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import SessionExplorer from "./pages/SessionExplorer";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import DatasetBrowser from "./pages/DatasetBrowser";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Market from "./pages/Market";
import Documentation from "./pages/Documentation";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster richColors theme="dark" />
        <BrowserRouter>
          <Routes>
            {/* Standalone pages — no sidebar */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* App pages — with sidebar layout */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sessions" element={<SessionExplorer />} />
              <Route path="/datasets" element={<DatasetBrowser />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/marketplace" element={<Market />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
