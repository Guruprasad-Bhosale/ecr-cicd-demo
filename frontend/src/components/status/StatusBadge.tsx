import React from 'react';
import type { Status } from '../../types/deployment';
import { getStatusConfig } from '../../tokens/status';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  customLabel,
}) => {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-mono',
    md: 'text-xs px-2.5 py-1 gap-2 font-mono font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-mono font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses} backdrop-blur-xs transition-colors`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{customLabel || config.label}</span>
    </span>
  );
};
