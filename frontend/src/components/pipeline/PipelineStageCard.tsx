import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Box,
  KeyRound,
  Database,
  Server,
  Activity,
  Globe,
  ChevronDown,
} from 'lucide-react';
import type { PipelineStage } from '../../types/deployment';
import { StatusBadge } from '../status/StatusBadge';


interface PipelineStageCardProps {
  stage: PipelineStage;
  stepNumber: number;
  totalSteps: number;
}

const renderStageIcon = (iconType: PipelineStage['iconType']) => {
  switch (iconType) {
    case 'test':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'build':
      return <Box className="w-4 h-4" />;
    case 'oidc':
      return <KeyRound className="w-4 h-4" />;
    case 'ecr':
      return <Database className="w-4 h-4" />;
    case 'ecs':
      return <Server className="w-4 h-4" />;
    case 'stability':
      return <Activity className="w-4 h-4" />;
    case 'alb':
    default:
      return <Globe className="w-4 h-4" />;
  }
};

export const PipelineStageCard: React.FC<PipelineStageCardProps> = ({
  stage,
  stepNumber,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getBorderColor = () => {
    switch (stage.status) {
      case 'PASSED':
      case 'ACTIVE':
        return 'border-zinc-800 hover:border-emerald-700/60 bg-zinc-900/50';
      case 'BLOCKED':
      case 'PROVISIONING_REQUIRED':
        return 'border-amber-900/40 hover:border-amber-700/60 bg-amber-950/10';
      case 'FAILED':
        return 'border-rose-900/40 hover:border-rose-700/60 bg-rose-950/10';
      default:
        return 'border-zinc-800 bg-zinc-900/30';
    }
  };

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all duration-200 ${getBorderColor()}`}
    >
      {/* Top row: Step number + Status badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px] font-semibold">
            {stepNumber}
          </span>
          <span className="font-mono text-[11px] text-zinc-400">{stage.jobName}</span>
        </div>
        <StatusBadge status={stage.status} size="sm" />
      </div>

      {/* Main card info */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 shrink-0 mt-0.5">
          {renderStageIcon(stage.iconType)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-zinc-100 truncate">{stage.name}</h2>
          <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{stage.statusDetails}</p>
        </div>
      </div>

      {/* Execution time if passed, or blocker note if blocked */}
      <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        {stage.executionTime ? (
          <span className="flex items-center gap-1 text-zinc-400">
            <Clock className="w-3 h-3 text-zinc-400" />
            {stage.executionTime}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-400">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Awaiting Admin
          </span>
        )}

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
        >
          <span>{isExpanded ? 'Hide' : 'Details'}</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Expandable details panel */}
      {isExpanded && (
        <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-2 text-xs">
          <div>
            <span className="text-zinc-400 text-[11px] uppercase tracking-wider font-mono">
              Purpose
            </span>
            <p className="text-zinc-300 text-xs mt-0.5">{stage.purpose}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-zinc-400">Trigger:</span>
              <p className="text-zinc-300 truncate">{stage.trigger}</p>
            </div>
            <div>
              <span className="text-zinc-400">Dependency:</span>
              <p className="text-zinc-300 truncate">{stage.dependency || 'None (Initial)'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
