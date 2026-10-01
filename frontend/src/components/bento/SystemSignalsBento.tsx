import React, { useState } from 'react';
import { BentoCard } from './BentoCard';
import { projectLogs } from '../../services/projectService';
import { Terminal, Search, Copy, Check, Info } from 'lucide-react';
import type { LogEntry } from '../../types/deployment';

export const SystemSignalsBento: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  const filteredLogs = projectLogs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] ${l.level.padEnd(5)} [${l.source.padEnd(9)}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'ERROR':
        return 'text-rose-400 font-semibold';
      case 'WARN':
        return 'text-amber-400 font-semibold';
      case 'INFO':
        return 'text-cyan-400 font-semibold';
      default:
        return 'text-zinc-500';
    }
  };

  return (
    <BentoCard colSpan="col-span-12" className="space-y-3 font-mono">
      {/* Header with Title & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Live System Signals & Telemetry
            </h2>
            <p className="text-[11px] text-zinc-400">
              Project execution trace & local runtime events
            </p>
          </div>
          <span className="text-[10px] bg-zinc-900 border border-white/10 text-zinc-400 px-2 py-0.5 rounded font-mono ml-2">
            LOCAL / STATIC
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search signal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-zinc-950 border border-white/10 rounded-md text-zinc-200 text-xs focus:outline-hidden focus:border-cyan-500/50 w-36 sm:w-44"
            />
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-2 py-1 bg-zinc-950 border border-white/10 rounded-md text-zinc-300 text-xs focus:outline-hidden"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyLogs}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-md text-zinc-300 text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="p-3.5 rounded-xl bg-[#06080b] border border-white/5 space-y-1.5 max-h-56 overflow-y-auto text-xs leading-relaxed select-text">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 hover:bg-white/[0.02] px-1 py-0.5 rounded transition-colors"
            >
              <span className="text-zinc-600 shrink-0 select-none text-[11px]">{log.timestamp}</span>
              <span className={`shrink-0 w-12 text-[11px] ${getLevelColor(log.level)}`}>{log.level}</span>
              <span className="text-zinc-500 shrink-0 w-20 text-[11px]">[{log.source}]</span>
              <span className="text-zinc-300 break-all text-[11px]">{log.message}</span>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-zinc-600 text-xs">
            No system signals matching criteria.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
        <span className="flex items-center gap-1.5">
          <Info className="w-3 h-3 text-cyan-400" />
          Displaying {filteredLogs.length} verified pipeline & WSGI execution traces
        </span>
        <span className="font-sans">WSGI: Gunicorn • Port 5000</span>
      </div>
    </BentoCard>
  );
};
