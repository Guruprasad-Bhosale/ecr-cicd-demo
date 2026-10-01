import React from 'react';
import { Link } from 'react-router-dom';
import { BentoCard } from './BentoCard';
import { deploymentHistory } from '../../services/projectService';
import { StatusBadge } from '../status/StatusBadge';
import { GitCommit, GitBranch, ArrowRight, Activity, Clock } from 'lucide-react';

export const DeploymentActivityBento: React.FC = () => {
  return (
    <BentoCard colSpan="col-span-12 lg:col-span-7" className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Deployment Audit Trail
            </h2>
            <p className="text-[11px] font-mono text-zinc-400">
              Immutable SHA image tags & pipeline execution states
            </p>
          </div>
        </div>

        <Link
          to="/deployments"
          className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Deployment Rows */}
      <div className="divide-y divide-white/5">
        {deploymentHistory.map((dep) => (
          <div
            key={dep.id}
            className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/30 px-2 rounded-lg transition-colors -mx-2"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-zinc-900 border border-white/10 text-zinc-400 shrink-0 mt-0.5 font-mono text-xs flex items-center gap-1">
                <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-zinc-200">{dep.shortSha}</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-200 truncate max-w-xs sm:max-w-sm">
                    {dep.commitMessage}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-500 mt-1">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <GitBranch className="w-3 h-3 text-emerald-400" />
                    {dep.branch}
                  </span>
                  <span>•</span>
                  <span>{dep.environment}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {dep.duration}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <StatusBadge status={dep.status} size="sm" />
              <Link
                to={`/deployments/${dep.id}`}
                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/5 transition-colors"
                title="View Step Timeline"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
};
