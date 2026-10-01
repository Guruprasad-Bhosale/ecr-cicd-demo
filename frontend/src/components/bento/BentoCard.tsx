import React from 'react';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: string;
  glow?: 'none' | 'cyan' | 'amber';
  style?: React.CSSProperties;
}


export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = '',
  colSpan = 'col-span-12',
  glow = 'none',
  style,
}) => {
  const glowClass = {
    none: '',
    cyan: 'bento-glow-cyan',
    amber: 'bento-glow-amber',
  }[glow];

  return (
    <div
      className={`bento-card ${colSpan} ${glowClass} p-5 md:p-6 flex flex-col justify-between ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
