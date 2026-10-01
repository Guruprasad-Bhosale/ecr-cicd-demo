import React from 'react';
import { BentoCard } from './BentoCard';
import { StatusBadge } from '../status/StatusBadge';
import { projectConfig } from '../../services/projectService';
import {
  GitBranch,
  GitCommit,
  ShieldAlert,
  Server,
  Terminal,
  Activity,
  Zap,
} from 'lucide-react';

export const HeroStatusBento: React.FC = () => {
  return (
    <BentoCard colSpan="col-span-12" glow="cyan" className="relative">
      {/* Background Ambient Visual Graphic */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-20 overflow-hidden hidden sm:block">
        <svg
          className="w-full h-full"
          viewBox="0 0 400 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="hero-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(56, 189, 248, 0.4)"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
          {/* Animated signal pulse lines */}
          <path
            d="M 20 100 Q 100 40 180 100 T 340 100"
            stroke="rgba(56, 189, 248, 0.6)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <circle cx="180" cy="100" r="4" fill="#38BDF8">
            <animate
              attributeName="r"
              values="3;6;3"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      <div className="relative z-10 space-y-4">
        {/* Eyebrow & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-semibold tracking-wider uppercase text-[10px] flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              CI/CD Pipeline System Ready
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 flex items-center gap-1">
              <GitBranch className="w-3 h-3 text-emerald-400" />
              {projectConfig.branch}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 flex items-center gap-1">
              <GitCommit className="w-3 h-3 text-cyan-400" />
              {projectConfig.shortSha}
            </span>
          </div>

          <StatusBadge status="ACTIVE" customLabel="ECR & Quality Gate Live" size="sm" />
        </div>

        {/* Main Title & Value Proposition */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            {projectConfig.projectName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Automated delivery pipeline: Ruff & Pytest quality gate → Non-root Docker container build → GitHub OIDC authentication → Amazon ECR publishing → ECS Fargate deployment.
          </p>
        </div>

        {/* Runtime Blocker Notification Banner */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-200">
                AWS Runtime: Provisioning Required
              </span>
              <p className="text-[11px] text-amber-300/80 leading-snug mt-0.5">
                Local tests & ECR registry verified. Live ECS Fargate rolling updates require one-time administrative provisioning of <code className="text-amber-200 font-mono">github-actions-ecr-role</code>.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono uppercase bg-amber-900/40 text-amber-300 px-2 py-1 rounded border border-amber-700/50 shrink-0">
            Action: Admin Unblock
          </span>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-zinc-400">
          <span className="flex items-center gap-1.5 bg-zinc-950/70 border border-white/5 px-2.5 py-1 rounded-md">
            <Activity className="w-3 h-3 text-emerald-400" />
            Pytest: 4/4 Passed (100%)
          </span>
          <span className="flex items-center gap-1.5 bg-zinc-950/70 border border-white/5 px-2.5 py-1 rounded-md">
            <Server className="w-3 h-3 text-purple-400" />
            User: appuser (10001)
          </span>
          <span className="flex items-center gap-1.5 bg-zinc-950/70 border border-white/5 px-2.5 py-1 rounded-md">
            <Terminal className="w-3 h-3 text-cyan-400" />
            Region: {projectConfig.awsRegion}
          </span>
        </div>
      </div>
    </BentoCard>
  );
};
