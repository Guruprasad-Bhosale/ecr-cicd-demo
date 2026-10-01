import React from 'react';
import { pipelineStages } from '../../services/projectService';
import { PipelineStageCard } from './PipelineStageCard';
import { ArrowRight } from 'lucide-react';


export const PipelineGraph: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Visual Pipeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <h2 className="text-sm font-semibold text-zinc-200">
          Delivery Pipeline Execution Graph
        </h2>
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Stages 1-4 Configured & Verified
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Stages 5-7 Awaiting AWS Provisioning
          </span>
        </div>
      </div>

      {/* Grid of pipeline stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pipelineStages.map((stage, idx) => (
          <React.Fragment key={stage.id}>
            <PipelineStageCard
              stage={stage}
              stepNumber={idx + 1}
              totalSteps={pipelineStages.length}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Flow Chain Indicator */}
      <div className="hidden lg:flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 overflow-x-auto">
        <span className="text-emerald-400 font-semibold">1. Ruff + Pytest</span>
        <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        <span className="text-emerald-400 font-semibold">2. Docker Build</span>
        <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        <span className="text-emerald-400 font-semibold">3. GitHub OIDC</span>
        <ArrowRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        <span className="text-emerald-400 font-semibold">4. Amazon ECR</span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-amber-400 font-semibold">5. ECS Task Reg</span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-amber-400 font-semibold">6. ECS Service Update</span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-amber-400 font-semibold">7. ALB Smoke Test</span>
      </div>
    </div>
  );
};
