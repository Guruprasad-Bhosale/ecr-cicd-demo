import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitCommit,
  Server,
  Workflow,
  Terminal,
  Settings,
  CloudAlert,
  Layers,
  ExternalLink,
} from 'lucide-react';

import { projectConfig } from '../../services/projectService';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const navigationSections = [
    {
      title: 'OVERVIEW',
      items: [{ to: '/', label: 'Overview', icon: LayoutDashboard }],
    },
    {
      title: 'OPERATIONS',
      items: [
        { to: '/deployments', label: 'Deployments', icon: GitCommit },
        { to: '/pipeline', label: 'Pipeline', icon: Workflow },
        { to: '/infrastructure', label: 'Infrastructure', icon: Server },
        { to: '/logs', label: 'Logs', icon: Terminal },
      ],
    },
    {
      title: 'SYSTEM',
      items: [{ to: '/settings', label: 'Settings', icon: Settings }],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-60 border-r border-white/5 bg-[#0b0f15] transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-100 font-mono">
              E10
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
              CI/CD Control Center
            </p>
          </div>
        </div>

        {/* Navigation Links with Group Sections */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navigationSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-semibold block mb-1">
                {section.title}
              </span>

              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `relative flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                        isActive
                          ? 'bg-zinc-800/80 text-cyan-300 font-semibold border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.08)]'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-cyan-400' : 'text-zinc-400'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38BDF8]" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Info Box */}
        <div className="p-3 border-t border-white/5 space-y-2.5 bg-[#080b10]">
          {/* AWS Runtime Status Card */}
          <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">AWS / {projectConfig.awsRegion}</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#FBBF24]" />
            </div>
            <div className="text-[10px] text-amber-300/90 font-mono flex items-center gap-1.5">
              <CloudAlert className="w-3 h-3 text-amber-400 shrink-0" />
              <span>ECS Fargate Pending</span>
            </div>
          </div>

          {/* GitHub Repo link */}
          <a
            href={`https://github.com/${projectConfig.repository}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-900 rounded-md border border-white/5 transition-colors"
          >
            <span className="truncate">{projectConfig.repository}</span>
            <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
          </a>
        </div>
      </aside>
    </>
  );
};
