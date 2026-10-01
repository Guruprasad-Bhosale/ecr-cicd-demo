import React from 'react';
import { Link } from 'react-router-dom';
import type { Deployment } from '../../types/deployment';
import { StatusBadge } from '../status/StatusBadge';
import { GitCommit, GitBranch, Database, ShieldAlert, ArrowRight } from 'lucide-react';


interface DeploymentCardProps {
  deployment: Deployment;
}

export const DeploymentCard: React.FC<DeploymentCardProps> = ({ deployment }) => {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Latest Deployment
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs font-mono text-zinc-300 flex items-center gap-1">
            <GitCommit className="w-3.5 h-3.5 text-blue-400" />
            {deployment.shortSha}
          </span>
        </div>
        <StatusBadge status={deployment.status} size="md" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-zinc-100">{deployment.commitMessage}</h3>
        <p className="text-xs text-zinc-400 font-mono">Started {deployment.startedAt}</p>
      </div>

      {deployment.reason && (
        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Runtime Blocker</span>
            <span className="text-amber-200/90 text-[11px] leading-relaxed block mt-0.5">
              {deployment.reason}
            </span>
          </div>
        </div>
      )}

      {/* Grid of deployment attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
        <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/50">
          <span className="text-zinc-500 block text-[10px] uppercase">Branch</span>
          <span className="text-zinc-200 flex items-center gap-1 mt-0.5">
            <GitBranch className="w-3 h-3 text-emerald-400" />
            {deployment.branch}
          </span>
        </div>

        <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/50">
          <span className="text-zinc-500 block text-[10px] uppercase">Tests</span>
          <span className="text-emerald-400 font-semibold block mt-0.5">4 / 4 Passing</span>
        </div>

        <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/50">
          <span className="text-zinc-500 block text-[10px] uppercase">Registry</span>
          <span className="text-zinc-200 flex items-center gap-1 mt-0.5">
            <Database className="w-3 h-3 text-purple-400" />
            ECR Active
          </span>
        </div>

        <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/50">
          <span className="text-zinc-500 block text-[10px] uppercase">Image Tag</span>
          <span className="text-zinc-300 truncate block mt-0.5" title={deployment.imageUri}>
            {deployment.imageTag}
          </span>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-2 flex justify-end">
        <Link
          to={`/deployments/${deployment.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>View Deployment Timeline & Steps</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
