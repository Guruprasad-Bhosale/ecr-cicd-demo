import React from 'react';
import { ArrowDown, Shield, Server, Database, Globe, Terminal } from 'lucide-react';


export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-5 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/60">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            AWS Cloud Architecture & Topology
          </h2>
          <p className="text-xs text-zinc-400">
            Region: <code className="text-zinc-300 font-mono">ap-south-1</code> • VPC: <code className="text-zinc-300 font-mono">10.0.0.0/16</code>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
            ● ECR Live
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50">
            ! Fargate Pending Apply
          </span>
        </div>
      </div>

      {/* Visual Diagram Representation */}
      <div className="max-w-3xl mx-auto space-y-4 text-xs font-mono">
        {/* Tier 1: Internet & Load Balancer */}
        <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-700/60 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-blue-400">
            <Globe className="w-4 h-4" />
            <span className="font-semibold text-zinc-100">Public Internet Traffic (Port 80)</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Application Load Balancer (<code className="text-zinc-200 font-mono">flask-app-alb</code>) across 2 Multi-AZ Public Subnets
          </p>
        </div>

        <div className="flex justify-center text-zinc-500">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Tier 2: Network Isolation Boundary */}
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 relative space-y-3">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800/80 pb-2">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Target Group (<code className="text-zinc-200">flask-app-tg</code>)
            </span>
            <span className="text-amber-400">Protected Port 5000 Ingress (ALB SG Only)</span>
          </div>

          {/* Tier 3: ECS Fargate Task */}
          <div className="p-3.5 rounded-lg bg-[#0e0e11] border border-zinc-700/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-100">
                <Server className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">AWS ECS Fargate Task (<code className="text-zinc-300">flask-app-task</code>)</span>
              </div>
              <span className="text-[10px] bg-amber-950/50 text-amber-300 border border-amber-800/40 px-2 py-0.5 rounded">
                Provisioning Required
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/50">
              <div>Container User: <span className="text-zinc-200 font-mono">10001 (Non-Root)</span></div>
              <div>WSGI: <span className="text-zinc-200 font-mono">Gunicorn (2 workers)</span></div>
              <div>Health: <span className="text-emerald-400 font-mono">GET /health (200)</span></div>
            </div>
          </div>
        </div>

        <div className="flex justify-center text-zinc-500">
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Tier 4: Supporting AWS Services */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Database className="w-3.5 h-3.5" />
                Amazon ECR (<code className="text-zinc-200">dvops-flask-app</code>)
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded">Active</span>
            </div>
            <p className="text-zinc-400 text-[10px] mt-1">Image registry for immutable commit SHA tags</p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <Terminal className="w-3.5 h-3.5" />
                CloudWatch (<code className="text-zinc-200">/ecs/flask-app</code>)
              </span>
              <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded">Pending</span>
            </div>
            <p className="text-zinc-400 text-[10px] mt-1">Unbuffered stdout/stderr logging target</p>
          </div>
        </div>
      </div>
    </div>
  );
};
