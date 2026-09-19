import React from 'react';
import { cn } from '@/lib/utils';
import { getLeadScoreTier } from '../leads.utils';

export interface LeadScoreProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const LeadScore: React.FC<LeadScoreProps> = ({
  score,
  showLabel = true,
  size = 'sm',
  className,
}) => {
  const tier = getLeadScoreTier(score);

  const tierStyles = {
    hot: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/15 border-emerald-500/30',
      bar: 'bg-emerald-400',
      label: 'HOT',
    },
    warm: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/15 border-amber-500/30',
      bar: 'bg-amber-400',
      label: 'WARM',
    },
    cold: {
      text: 'text-slate-400',
      bg: 'bg-white/[0.06] border-white/10',
      bar: 'bg-slate-400',
      label: 'COLD',
    },
  }[tier];

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className="flex items-baseline gap-1">
        <span className={cn('font-mono font-semibold', size === 'md' ? 'text-sm' : 'text-xs', tierStyles.text)}>
          {score}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">/100</span>
      </div>

      {/* Subtle Mini Bar */}
      <div className="w-10 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', tierStyles.bar)}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      {showLabel && (
        <span
          className={cn(
            'px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold uppercase tracking-wider border',
            tierStyles.bg,
            tierStyles.text
          )}
        >
          {tierStyles.label}
        </span>
      )}
    </div>
  );
};
