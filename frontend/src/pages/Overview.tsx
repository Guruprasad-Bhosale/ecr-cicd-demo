import React from 'react';
import { BentoGrid } from '../components/bento/BentoGrid';
import { HeroStatusBento } from '../components/bento/HeroStatusBento';
import { PipelineBento } from '../components/bento/PipelineBento';
import { MetricKpiBento } from '../components/bento/MetricKpiBento';
import { DeploymentActivityBento } from '../components/bento/DeploymentActivityBento';
import { InfrastructureBento } from '../components/bento/InfrastructureBento';
import { SystemSignalsBento } from '../components/bento/SystemSignalsBento';

export const Overview: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-5">
      {/* Primary Bento Composition Grid */}
      <BentoGrid>
        {/* 1. Large Hero Status Bento */}
        <HeroStatusBento />

        {/* 2. Interactive Pipeline Bento */}
        <PipelineBento />

        {/* 3. 4 Compact KPI Bento Cards */}
        <MetricKpiBento />

        {/* 4. Recent Deployment Activity Bento */}
        <DeploymentActivityBento />

        {/* 5. Infrastructure System Map Bento */}
        <InfrastructureBento />

        {/* 6. Live Telemetry Signals Bento */}
        <SystemSignalsBento />
      </BentoGrid>
    </div>
  );
};
