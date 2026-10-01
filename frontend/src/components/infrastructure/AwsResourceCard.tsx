import React from 'react';
import type { AwsResource } from '../../types/deployment';
import { StatusBadge } from '../status/StatusBadge';
import { Database, Server, Globe, Terminal, KeyRound, ShieldAlert } from 'lucide-react';


interface AwsResourceCardProps {
  resource: AwsResource;
}

const renderResourceIcon = (id: string) => {
  switch (id) {
    case 'res-ecr':
      return <Database className="w-5 h-5" />;
    case 'res-oidc':
      return <KeyRound className="w-5 h-5" />;
    case 'res-ecs-cluster':
      return <Server className="w-5 h-5" />;
    case 'res-alb':
      return <Globe className="w-5 h-5" />;
    case 'res-cloudwatch':
    default:
      return <Terminal className="w-5 h-5" />;
  }
};

export const AwsResourceCard: React.FC<AwsResourceCardProps> = ({ resource }) => {
  const isBlocked =
    resource.status === 'BLOCKED' || resource.status === 'PROVISIONING_REQUIRED';

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        isBlocked
          ? 'bg-zinc-900/40 border-amber-900/30 hover:border-amber-700/50'
          : 'bg-zinc-900/60 border-zinc-800/80 hover:border-emerald-700/50'
      }`}
    >
      {/* Header with Title, Type, and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg border shrink-0 ${
              isBlocked
                ? 'bg-amber-950/20 border-amber-800/40 text-amber-400'
                : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
            }`}
          >
            {renderResourceIcon(resource.id)}
          </div>
          <div>
            <h2 className="text-sm font-semibold font-mono text-zinc-100">{resource.name}</h2>
            <p className="text-xs text-zinc-400">{resource.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/40">
            {resource.region}
          </span>
          <StatusBadge status={resource.status} size="sm" />
        </div>
      </div>

      {/* Status note message */}
      <div className="mt-3 text-xs leading-relaxed flex items-start gap-2">
        {isBlocked ? (
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        ) : null}
        <span className={isBlocked ? 'text-amber-300/90' : 'text-zinc-300'}>
          {resource.statusMessage}
        </span>
      </div>

      {/* Key-Value Details */}
      <div className="mt-4 pt-3 border-t border-zinc-800/60 grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {resource.details.map((detail, idx) => (
          <div key={idx} className="bg-zinc-950/60 p-2 rounded border border-zinc-800/50 text-[11px]">
            <span className="text-zinc-400 block font-mono">{detail.label}</span>
            <span className="text-zinc-200 font-mono break-all mt-0.5 block font-medium">
              {detail.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
