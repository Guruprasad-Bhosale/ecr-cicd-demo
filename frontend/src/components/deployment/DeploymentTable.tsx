import React from 'react';
import { Link } from 'react-router-dom';
import type { Deployment } from '../../types/deployment';
import { StatusBadge } from '../status/StatusBadge';
import { GitBranch, GitCommit, Clock, ArrowRight } from 'lucide-react';


interface DeploymentTableProps {
  deployments: Deployment[];
}

export const DeploymentTable: React.FC<DeploymentTableProps> = ({ deployments }) => {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900/90 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Commit</th>
              <th className="px-4 py-3 font-medium">Branch</th>
              <th className="px-4 py-3 font-medium">Image Tag / URI</th>
              <th className="px-4 py-3 font-medium">Environment</th>
              <th className="px-4 py-3 font-medium">Started</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
            {deployments.map((dep) => (
              <tr
                key={dep.id}
                className="hover:bg-zinc-800/40 transition-colors group"
              >
                {/* Status Badge */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusBadge status={dep.status} size="sm" />
                </td>

                {/* Commit SHA & Message */}
                <td className="px-4 py-3.5">
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-200 flex items-center gap-1">
                      <GitCommit className="w-3 h-3 text-blue-400 shrink-0" />
                      {dep.shortSha}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate max-w-xs font-sans mt-0.5">
                      {dep.commitMessage}
                    </span>
                  </div>
                </td>

                {/* Branch */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    <GitBranch className="w-3 h-3 text-emerald-400" />
                    {dep.branch}
                  </span>
                </td>

                {/* Image URI */}
                <td className="px-4 py-3.5">
                  <span
                    className="text-zinc-400 truncate max-w-[180px] block"
                    title={dep.imageUri}
                  >
                    {dep.imageTag}
                  </span>
                </td>

                {/* Environment */}
                <td className="px-4 py-3.5 whitespace-nowrap text-zinc-300">
                  {dep.environment}
                </td>

                {/* Started */}
                <td className="px-4 py-3.5 whitespace-nowrap text-zinc-400 text-[11px]">
                  {dep.startedAt}
                </td>

                {/* Duration */}
                <td className="px-4 py-3.5 whitespace-nowrap text-zinc-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    {dep.duration}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <Link
                    to={`/deployments/${dep.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-sans font-medium rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
