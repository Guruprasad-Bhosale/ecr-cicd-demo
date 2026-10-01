import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { LogViewer } from '../components/logs/LogViewer';


export const Logs: React.FC = () => {
  return (
    <PageContainer
      title="System Telemetry & Signals"
      description="Developer-console log stream for pipeline triggers, Docker build, and local WSGI execution."
    >
      <div className="space-y-6">
        <LogViewer />
      </div>
    </PageContainer>
  );
};
