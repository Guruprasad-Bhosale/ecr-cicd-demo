import type { Status } from '../types/deployment';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Radio,
  HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  bg: string;
  text: string;
  border: string;
  dot: string;
  glow: string;
}

export const statusConfig: Record<Status, StatusConfig> = {
  PASSED: {
    label: 'Passed',
    icon: CheckCircle2,
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    glow: 'rgba(52, 211, 153, 0.15)',
  },
  ACTIVE: {
    label: 'Active',
    icon: CheckCircle2,
    bg: 'bg-cyan-950/40',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
    glow: 'rgba(56, 189, 248, 0.15)',
  },
  RUNNING: {
    label: 'Running',
    icon: Radio,
    bg: 'bg-blue-950/40',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.6)]',
    glow: 'rgba(96, 165, 250, 0.15)',
  },
  BLOCKED: {
    label: 'Blocked',
    icon: AlertTriangle,
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    glow: 'rgba(251, 191, 36, 0.15)',
  },
  PROVISIONING_REQUIRED: {
    label: 'Provisioning Required',
    icon: AlertTriangle,
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    glow: 'rgba(251, 191, 36, 0.15)',
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    bg: 'bg-rose-950/40',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]',
    glow: 'rgba(248, 113, 113, 0.15)',
  },
  NOT_EXECUTED: {
    label: 'Not Executed',
    icon: Clock,
    bg: 'bg-zinc-900/60',
    text: 'text-zinc-400',
    border: 'border-zinc-800',
    dot: 'bg-zinc-600',
    glow: 'transparent',
  },
};

export const getStatusConfig = (status: Status): StatusConfig => {
  return (
    statusConfig[status] || {
      label: String(status),
      icon: HelpCircle,
      bg: 'bg-zinc-900/60',
      text: 'text-zinc-400',
      border: 'border-zinc-800',
      dot: 'bg-zinc-600',
      glow: 'transparent',
    }
  );
};
