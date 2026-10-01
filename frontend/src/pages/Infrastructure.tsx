import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ArchitectureDiagram } from '../components/infrastructure/ArchitectureDiagram';
import { AwsResourceCard } from '../components/infrastructure/AwsResourceCard';
import { awsResources, projectConfig } from '../services/projectService';


export const Infrastructure: React.FC = () => {
  return (
    <PageContainer
      title="AWS Infrastructure Topology & Inventory"
      description="Visual topology and provisioning audit of AWS ECS Fargate, ECR, ALB, and VPC networking."
    >
      <div className="space-y-6">
        {/* Architecture Topology View */}
        <ArchitectureDiagram />

        {/* AWS Resource Inventory Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
            <h2 className="text-sm font-semibold text-zinc-200">
              Infrastructure Components Inventory
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500">Target AWS Account:</span>
              <code className="text-cyan-400 bg-zinc-950 px-2 py-0.5 rounded border border-white/10">
                {projectConfig.awsAccount} ({projectConfig.awsRegion})
              </code>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {awsResources.map((resource) => (
              <AwsResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
