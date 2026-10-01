import React from 'react';
import type { Deployment } from '../../types/deployment';
import { StatusBadge } from '../status/StatusBadge';
import { CheckCircle2, AlertTriangle, XCircle, Clock, CircleDot } from 'lucide-react';


interface DeploymentTimelineProps {
  deployment: Deployment;
}

export const DeploymentTimeline: React.FC<DeploymentTimelineProps> = ({ deployment }) => {
  const getStepIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'BLOCKED':
      case 'PROVISIONING_REQUIRED':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'NOT_EXECUTED':
      default:
        return <CircleDot className="w-4 h-4 text-zinc-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
        {deployment.steps.map((step, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-[#09090b] ring-4 ring-[#09090b]">
              {getStepIcon(step.status)}
            </div>

            {/* Step Card Content */}
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-200">{step.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.duration}
                  </span>
                  <StatusBadge status={step.status} size="sm" />
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-mono">{step.details}</p>

              <div className="text-[11px] text-zinc-500 font-mono pt-1">
                Executed at: {step.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
