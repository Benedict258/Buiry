import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import SessionExplorer from "./pages/SessionExplorer";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import DatasetBrowser from "./pages/DatasetBrowser";

function Marketplace() {
  return <div className="p-md"><h1 className="text-headline-lg font-headline-lg">Marketplace</h1></div>;
}

function Documentation() {
  return <div className="p-md"><h1 className="text-headline-lg font-headline-lg">Documentation</h1></div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sessions" element={<SessionExplorer />} />
          <Route path="/datasets" element={<DatasetBrowser />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
