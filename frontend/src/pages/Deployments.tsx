import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { DeploymentTable } from '../components/deployment/DeploymentTable';
import { deploymentHistory } from '../services/projectService';
import { BentoCard } from '../components/bento/BentoCard';
import { Info } from 'lucide-react';


export const Deployments: React.FC = () => {
  return (
    <PageContainer
      title="Deployment History & Audit"
      description="Audit trail of pipeline runs, immutable ECR container publishing, and deployment statuses."
    >
      <div className="space-y-5">
        {/* Info Banner */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 text-xs text-zinc-400 flex items-start gap-3 backdrop-blur-xs">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-zinc-200 font-semibold block font-mono">
              Deployment Traceability Contract
            </span>
            <span className="text-zinc-400 text-[11px] font-mono leading-relaxed block mt-0.5">
              Each deployment binds a Git commit SHA to an immutable ECR digest and ECS task revision. Historical entries reflect actual repository triggers and validation runs.
            </span>
          </div>
        </div>

        {/* Deployments Table Container */}
        <BentoCard colSpan="col-span-12" className="p-0 overflow-hidden">
          <DeploymentTable deployments={deploymentHistory} />
        </BentoCard>
      </div>
    </PageContainer>
  );
};
