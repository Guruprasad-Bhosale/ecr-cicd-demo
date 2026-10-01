import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { DeploymentTimeline } from '../components/deployment/DeploymentTimeline';
import { deploymentHistory } from '../services/projectService';
import { StatusBadge } from '../components/status/StatusBadge';
import { BentoCard } from '../components/bento/BentoCard';
import { ArrowLeft, ShieldAlert } from 'lucide-react';



export const DeploymentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const deployment =
    deploymentHistory.find((d) => d.id === id) || deploymentHistory[0];

  return (
    <PageContainer
      title={`Deployment ${deployment.shortSha}`}
      description={`Detailed execution lifecycle for run ${deployment.id}`}
      actions={
        <Link
          to="/deployments"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Deployments</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Header Summary Card */}
        <BentoCard colSpan="col-span-12" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Commit Message
              </span>
              <h2 className="text-base font-semibold text-zinc-100 mt-0.5">
                {deployment.commitMessage}
              </h2>
            </div>
            <StatusBadge status={deployment.status} size="lg" />
          </div>

          {/* Grid of metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5">
              <span className="text-zinc-500 block text-[10px] uppercase">Commit SHA</span>
              <span className="text-cyan-400 block truncate font-medium mt-1">
                {deployment.commitSha}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5">
              <span className="text-zinc-500 block text-[10px] uppercase">Branch & Environment</span>
              <span className="text-zinc-200 block font-medium mt-1">
                {deployment.branch} • {deployment.environment}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5">
              <span className="text-zinc-500 block text-[10px] uppercase">Image Digest</span>
              <span className="text-zinc-300 block truncate font-medium mt-1" title={deployment.imageDigest}>
                {deployment.imageDigest}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5">
              <span className="text-zinc-500 block text-[10px] uppercase">Execution Duration</span>
              <span className="text-zinc-200 block font-medium mt-1">
                {deployment.duration} ({deployment.startedAt})
              </span>
            </div>
          </div>

          {deployment.reason && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-amber-200">Failure / Blocker Diagnostics</span>
                <span className="text-amber-300/85 text-[11px] font-mono leading-relaxed block mt-0.5">
                  {deployment.reason}
                </span>
              </div>
            </div>
          )}
        </BentoCard>

        {/* Timeline of step execution */}
        <BentoCard colSpan="col-span-12" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-zinc-100">
              Step-by-Step Execution Lifecycle
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              {deployment.steps.length} Steps Recorded
            </span>
          </div>

          <DeploymentTimeline deployment={deployment} />
        </BentoCard>
      </div>
    </PageContainer>
  );
};
