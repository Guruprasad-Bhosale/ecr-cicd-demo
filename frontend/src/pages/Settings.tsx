import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { projectConfig } from '../services/projectService';
import { BentoCard } from '../components/bento/BentoCard';
import { ShieldCheck, Server, GitBranch, KeyRound } from 'lucide-react';


export const Settings: React.FC = () => {
  const configSections = [
    {
      title: 'Source Control & CI/CD Configuration',
      icon: GitBranch,
      items: [
        { label: 'GitHub Repository', value: projectConfig.repository },
        { label: 'Default Deployment Branch', value: projectConfig.branch },
        { label: 'Active Commit SHA', value: projectConfig.commitSha },
        { label: 'CI/CD Workflow File', value: '.github/workflows/ecr-push.yml' },
        { label: 'Quality Gate Tools', value: 'Ruff (Python Linter) + Pytest (Unit Testing)' },
      ],
    },
    {
      title: 'AWS Identity & Security Parameters',
      icon: KeyRound,
      items: [
        { label: 'AWS Target Account ID', value: projectConfig.awsAccount },
        { label: 'AWS Deployment Region', value: projectConfig.awsRegion },
        { label: 'Authentication Architecture', value: projectConfig.authMethod },
        { label: 'IAM Deployment Role', value: `arn:aws:iam::${projectConfig.awsAccount}:role/github-actions-ecr-role` },
        { label: 'Static Credential Policy', value: 'Strictly Prohibited (Zero static keys stored in repo/secrets)' },
      ],
    },
    {
      title: 'Container & Runtime Specifications',
      icon: Server,
      items: [
        { label: 'Target ECR Repository', value: projectConfig.ecrRepository },
        { label: 'Container Runtime User', value: projectConfig.containerUser },
        { label: 'Exposed Container Port', value: `${projectConfig.containerPort} (TCP)` },
        { label: 'Target ECS Cluster', value: projectConfig.ecsCluster },
        { label: 'Target ECS Service', value: projectConfig.ecsService },
        { label: 'Application Load Balancer', value: projectConfig.albName },
        { label: 'Health Check Route', value: `${projectConfig.healthCheckPath} (HTTP 200 OK)` },
      ],
    },
  ];

  return (
    <PageContainer
      title="Project Settings & Configuration"
      description="Read-only architecture, identity parameters, and runtime specifications."
    >
      <div className="space-y-6 max-w-5xl">
        {/* Security Audit Badge */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs text-emerald-300 flex items-start gap-3 backdrop-blur-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-200 block font-mono">
              Zero-Secret Security Architecture Enforced
            </span>
            <span className="text-emerald-300/90 text-[11px] font-mono leading-relaxed block mt-0.5">
              All AWS authentication utilizes short-lived OpenID Connect (OIDC) tokens with cryptographic JWT validation against AWS STS. No passwords, static access keys, or secrets are exposed or required in the settings.
            </span>
          </div>
        </div>

        {/* Configuration Bento Cards */}
        <div className="grid grid-cols-1 gap-4">
          {configSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <BentoCard key={idx} colSpan="col-span-12" className="p-0 overflow-hidden">
                <div className="p-4 bg-zinc-900/80 border-b border-white/5 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-zinc-800 text-cyan-400 border border-white/5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-zinc-100">{section.title}</h2>
                </div>

                <div className="p-4 divide-y divide-white/5 text-xs font-mono">
                  {section.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-zinc-800/20 px-2 rounded -mx-2 transition-colors"
                    >
                      <span className="text-zinc-400 font-sans text-xs">{item.label}</span>
                      <span className="text-zinc-200 font-mono text-xs bg-zinc-950 px-2 py-0.5 rounded border border-white/5 max-w-md truncate">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </BentoCard>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
};
