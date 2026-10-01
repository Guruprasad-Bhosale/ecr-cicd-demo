import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Overview } from './pages/Overview';
import { Deployments } from './pages/Deployments';
import { DeploymentDetails } from './pages/DeploymentDetails';
import { Infrastructure } from './pages/Infrastructure';
import { Pipeline } from './pages/Pipeline';
import { Logs } from './pages/Logs';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() =>
    new Date().toLocaleTimeString()
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 600);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-[#09090b] text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
        {/* Persistent & Responsive Sidebar */}
        <Sidebar
          isOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <TopBar
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
          />

          {/* Page Routing */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/deployments" element={<Deployments />} />
              <Route path="/deployments/:id" element={<DeploymentDetails />} />
              <Route path="/infrastructure" element={<Infrastructure />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Overview />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
