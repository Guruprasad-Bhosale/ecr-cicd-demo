import React, { useState } from 'react';
import { BentoCard } from './BentoCard';
import { pipelineStages } from '../../services/projectService';
import { StatusBadge } from '../status/StatusBadge';
import {
  CheckCircle2,
  Box,
  KeyRound,
  Database,
  Server,
  Activity,
  Globe,
  Workflow,
  ChevronDown,
} from 'lucide-react';

import type { PipelineStage } from '../../types/deployment';

export const PipelineBento: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

  const getStageIcon = (type: PipelineStage['iconType']) => {
    switch (type) {
      case 'test':
        return CheckCircle2;
      case 'build':
        return Box;
      case 'oidc':
        return KeyRound;
      case 'ecr':
        return Database;
      case 'ecs':
        return Server;
      case 'stability':
        return Activity;
      case 'alb':
      default:
        return Globe;
    }
  };

  return (
    <BentoCard colSpan="col-span-12" className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              CI/CD Pipeline Lifecycle
            </h2>
            <p className="text-[11px] font-mono text-zinc-400">
              Trigger: <code className="text-zinc-300">git push origin main</code> • 7 Stages Gated
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Verified (1-4)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Awaiting Admin (5-7)
          </span>
        </div>
      </div>

      {/* Horizontal Interactive Progression */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-1">
        {pipelineStages.map((stage, idx) => {
          const Icon = getStageIcon(stage.iconType);
          const isPassed = stage.status === 'PASSED' || stage.status === 'ACTIVE';
          const isBlocked = stage.status === 'BLOCKED' || stage.status === 'PROVISIONING_REQUIRED';
          const isSelected = selectedStage?.id === stage.id;

          return (
            <div
              key={stage.id}
              onClick={() => setSelectedStage(isSelected ? null : stage)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 animate-fade-in-up ${
                isSelected
                  ? 'bg-zinc-800/90 border-cyan-500/60 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                  : isPassed
                  ? 'bg-zinc-900/60 border-white/5 hover:border-emerald-500/40 hover:bg-zinc-800/50'
                  : isBlocked
                  ? 'bg-amber-950/15 border-amber-500/20 hover:border-amber-500/40'
                  : 'bg-zinc-900/40 border-white/5'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-zinc-950 text-zinc-400 font-mono text-[10px] font-semibold flex items-center justify-center border border-white/10">
                  {idx + 1}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${isPassed ? 'bg-emerald-400' : isBlocked ? 'bg-amber-400' : 'bg-zinc-600'}`} />
              </div>

              {/* Icon & Title */}
              <div>
                <Icon className={`w-4 h-4 mb-1.5 ${isPassed ? 'text-emerald-400' : isBlocked ? 'text-amber-400' : 'text-zinc-500'}`} />
                <h3 className="text-xs font-semibold text-zinc-100 truncate">{stage.name}</h3>
                <p className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">{stage.jobName}</p>
              </div>

              {/* Status footer */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className={isPassed ? 'text-emerald-400' : isBlocked ? 'text-amber-400' : 'text-zinc-500'}>
                  {stage.executionTime || 'Awaiting'}
                </span>
                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isSelected ? 'rotate-180 text-cyan-400' : ''}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable detail card for clicked stage */}
      {selectedStage && (
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-cyan-500/30 text-xs space-y-2 animate-fade-in-up">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-semibold text-cyan-300 font-mono flex items-center gap-1.5">
              <span>Stage Specification:</span>
              <code className="text-zinc-100">{selectedStage.name}</code>
            </span>
            <StatusBadge status={selectedStage.status} size="sm" />
          </div>
          <p className="text-zinc-300 text-xs">{selectedStage.purpose}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-mono text-zinc-400 pt-1">
            <div>Job: <span className="text-zinc-200">{selectedStage.jobName}</span></div>
            <div>Trigger: <span className="text-zinc-200">{selectedStage.trigger}</span></div>
            <div>Dependency: <span className="text-zinc-200">{selectedStage.dependency || 'Root (None)'}</span></div>
          </div>
        </div>
      )}
    </BentoCard>
  );
};
