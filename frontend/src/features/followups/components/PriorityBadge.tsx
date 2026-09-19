import React from 'react';
import { cn } from '@/lib/utils';
import { FollowUpPriority } from '../followups.types';

export interface PriorityBadgeProps {
  priority: FollowUpPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const configs: Record<
    FollowUpPriority,
    { label: string; dot: string; container: string }
  > = {
    Low: {
      label: 'Low Priority',
      dot: 'bg-slate-400',
      container: 'bg-white/[0.04] text-slate-300 border-white/10',
    },
    Medium: {
      label: 'Medium Priority',
      dot: 'bg-amber-400',
      container: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },
    High: {
      label: 'High Priority',
      dot: 'bg-rose-400',
      container: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    },
  };

  const config = configs[priority] || configs.Medium;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded-md border select-none',
        config.container,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      <span>{config.label}</span>
    </span>
  );
};
