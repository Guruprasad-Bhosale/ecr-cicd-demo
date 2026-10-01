import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  RefreshCw,
  Play,
  GitBranch,
  GitCommit,
  AlertTriangle,
} from 'lucide-react';

import { projectConfig } from '../../services/projectService';

interface TopBarProps {
  onToggleMobileMenu: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleMobileMenu,
  onRefresh,
  isRefreshing,
  lastUpdated,
}) => {
  const [showDeployToast, setShowDeployToast] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Overview';
      case '/deployments':
        return 'Deployments';
      case '/pipeline':
        return 'Pipeline';
      case '/infrastructure':
        return 'Infrastructure';
      case '/logs':
        return 'Logs';
      case '/settings':
        return 'Settings';
      default:
        if (pathname.startsWith('/deployments/')) return 'Deployment Details';
        return 'Control Center';
    }
  };

  const handleDeployClick = () => {
    setShowDeployToast(true);
    setTimeout(() => setShowDeployToast(false), 3500);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 border-b border-white/5 bg-[#07090d]/90 backdrop-blur-md">
      {/* Left section: Breadcrumb / Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 md:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500 font-medium">E10</span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-200 font-semibold">{getPageTitle(location.pathname)}</span>
        </div>
      </div>

      {/* Right section: System Badge + Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Branch & Commit Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono">
          <span className="inline-flex items-center gap-1 bg-zinc-900/80 border border-white/5 px-2 py-0.5 rounded text-zinc-300">
            <GitBranch className="w-3 h-3 text-emerald-400" />
            {projectConfig.branch}
          </span>
          <span className="inline-flex items-center gap-1 bg-zinc-900/80 border border-white/5 px-2 py-0.5 rounded text-cyan-400">
            <GitCommit className="w-3 h-3" />
            {projectConfig.shortSha}
          </span>
        </div>

        {/* AWS Runtime Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/30 border border-amber-500/20 text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#FBBF24]" />
          <span>AWS: Provisioning Required</span>
        </div>

        {/* Refresh Action */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 transition-all hover:border-white/15 disabled:opacity-50"
          title={`Last telemetry refresh: ${lastUpdated}`}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Deploy Action (Honest State) */}
        <div className="relative">
          <button
            type="button"
            onClick={handleDeployClick}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all hover:border-cyan-500/60 shadow-[0_0_10px_rgba(56,189,248,0.1)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Deploy</span>
          </button>

          {/* Toast / Popover when user clicks Deploy */}
          {showDeployToast && (
            <div className="absolute right-0 mt-2 w-72 p-3 bg-[#10151d] border border-amber-500/40 rounded-xl shadow-2xl text-xs z-50 animate-fade-in-up">
              <div className="flex items-start gap-2.5 text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-200">Continuous Deployment Operational</p>
                  <p className="mt-1 text-zinc-400 leading-relaxed text-[11px] font-mono">
                    Pushes to <code className="text-zinc-200">main</code> automatically trigger ECR publishing. Live ECS updates require administrative role activation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
