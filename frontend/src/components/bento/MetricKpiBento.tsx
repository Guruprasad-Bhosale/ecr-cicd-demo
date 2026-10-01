import React from 'react';
import { BentoCard } from './BentoCard';
import { Layers, CheckCircle2, Lock, Database } from 'lucide-react';

import { projectConfig } from '../../services/projectService';

export const MetricKpiBento: React.FC = () => {
  const kpis = [
    {
      id: 'kpi-stages',
      title: 'CI/CD Pipeline',
      value: '4 Stages',
      badge: 'Ready',
      badgeType: 'emerald',
      description: 'Gated execution in GitHub Actions',
      icon: Layers,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      id: 'kpi-tests',
      title: 'Unit Test Gate',
      value: '4 / 4',
      badge: '100% Passing',
      badgeType: 'emerald',
      description: 'Ruff linter + Pytest test suite',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'kpi-security',
      title: 'Container Hardening',
      value: 'Non-Root',
      badge: 'UID 10001',
      badgeType: 'purple',
      description: 'Gunicorn on port 5000',
      icon: Lock,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 'kpi-registry',
      title: 'Amazon ECR',
      value: 'Active',
      badge: projectConfig.awsRegion,
      badgeType: 'cyan',
      description: 'Encrypted AES256 • scanOnPush',
      icon: Database,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <>
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <BentoCard
            key={kpi.id}
            colSpan="col-span-12 sm:col-span-6 lg:col-span-3"
            className="animate-fade-in-up"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="space-y-3">
              {/* Header with Icon and Badge */}
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg border ${kpi.iconBg} ${kpi.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-zinc-300">
                  {kpi.badge}
                </span>
              </div>

              {/* Metric Title & Main Value */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                  {kpi.title}
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 mt-0.5 block tracking-tight">
                  {kpi.value}
                </span>
              </div>

              {/* Subtitle */}
              <p className="text-[11px] text-zinc-400 font-mono leading-tight pt-1 border-t border-white/5">
                {kpi.description}
              </p>
            </div>
          </BentoCard>
        );
      })}
    </>
  );
};
