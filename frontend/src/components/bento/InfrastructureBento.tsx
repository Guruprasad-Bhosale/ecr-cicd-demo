import React from 'react';
import { Link } from 'react-router-dom';
import { BentoCard } from './BentoCard';
import { awsResources, projectConfig } from '../../services/projectService';
import { StatusBadge } from '../status/StatusBadge';
import { Server, Database, KeyRound, Globe, Terminal, ArrowRight } from 'lucide-react';

export const InfrastructureBento: React.FC = () => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'res-ecr':
        return Database;
      case 'res-oidc':
        return KeyRound;
      case 'res-ecs-cluster':
        return Server;
      case 'res-alb':
        return Globe;
      default:
        return Terminal;
    }
  };

  return (
    <BentoCard colSpan="col-span-12 lg:col-span-5" className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              AWS Infrastructure Map
            </h2>
            <p className="text-[11px] font-mono text-zinc-400">
              Target: <code className="text-zinc-300">{projectConfig.awsRegion}</code> ({projectConfig.awsAccount})
            </p>
          </div>
        </div>

        <Link
          to="/infrastructure"
          className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <span>Topology</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Resource Nodes */}
      <div className="space-y-2">
        {awsResources.map((res) => {
          const Icon = getIcon(res.id);
          const isBlocked =
            res.status === 'BLOCKED' || res.status === 'PROVISIONING_REQUIRED';

          return (
            <div
              key={res.id}
              className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs font-mono transition-colors ${
                isBlocked
                  ? 'bg-zinc-950/40 border-white/5 hover:border-amber-500/30'
                  : 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-500/50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-1.5 rounded border shrink-0 ${
                    isBlocked
                      ? 'bg-zinc-900 border-white/10 text-zinc-400'
                      : 'bg-cyan-950 border-cyan-500/40 text-cyan-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="font-semibold text-zinc-200 truncate block">
                    {res.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 block truncate font-sans">
                    {res.type}
                  </span>
                </div>
              </div>

              <StatusBadge status={res.status} size="sm" />
            </div>
          );
        })}
      </div>
    </BentoCard>
  );
};
