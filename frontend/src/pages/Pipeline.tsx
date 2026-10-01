import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { PipelineBento } from '../components/bento/PipelineBento';
import { pipelineStages } from '../services/projectService';
import { StatusBadge } from '../components/status/StatusBadge';
import { BentoCard } from '../components/bento/BentoCard';
import { Workflow } from 'lucide-react';


export const Pipeline: React.FC = () => {
  return (
    <PageContainer
      title="CI/CD Pipeline Architecture"
      description="GitHub Actions continuous integration & deployment workflow specifications (.github/workflows/ecr-push.yml)."
    >
      <div className="space-y-6">
        {/* Main interactive Bento pipeline */}
        <PipelineBento />

        {/* Detailed Stages Bento Card */}
        <BentoCard colSpan="col-span-12" className="p-0 overflow-hidden space-y-0">
          <div className="p-4 bg-zinc-900/90 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Workflow className="w-4 h-4 text-cyan-400" />
              Pipeline Stage Specifications & Gating Contract
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">
              Concurrency: <code className="text-zinc-300">cancel-in-progress: false</code>
            </span>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            {pipelineStages.map((stage, idx) => (
              <div
                key={stage.id}
                className="p-4 hover:bg-zinc-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-950 text-zinc-400 font-mono text-xs font-semibold shrink-0 mt-0.5 border border-white/10">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-100">{stage.name}</h3>
                      <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                        job: {stage.jobName}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{stage.purpose}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-zinc-500">
                      <span>Trigger: <code className="text-zinc-300">{stage.trigger}</code></span>
                      <span>•</span>
                      <span>Dependency: <code className="text-zinc-300">{stage.dependency || 'Root (None)'}</code></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                  <span className="text-xs font-mono text-zinc-400">{stage.statusDetails}</span>
                  <StatusBadge status={stage.status} size="md" />
                </div>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>
    </PageContainer>
  );
};
