import React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/Progress';
import { ShieldCheck, HelpCircle } from 'lucide-react';

export interface ConfidenceScoreProps {
  score: number; // 0 - 100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
  className?: string;
}

export const ConfidenceScore: React.FC<ConfidenceScoreProps> = ({
  score,
  label = 'AI confidence',
  size = 'md',
  showBar = true,
  className,
}) => {
  const boundedScore = Math.min(100, Math.max(0, Math.round(score)));

  const getTier = (val: number) => {
    if (val >= 85) return { text: 'High confidence', variant: 'success' as const, badge: 'text-emerald-300' };
    if (val >= 65) return { text: 'Moderate confidence', variant: 'default' as const, badge: 'text-slate-300' };
    return { text: 'Low confidence', variant: 'default' as const, badge: 'text-amber-300' };
  };

  const tier = getTier(boundedScore);

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-slate-500" />
          <span>{label}</span>
        </span>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-bold text-white text-xs">{boundedScore}%</span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">({tier.text})</span>
        </div>
      </div>

      {showBar && (
        <Progress
          value={boundedScore}
          size={size === 'sm' ? 'sm' : 'md'}
          variant={tier.variant}
          className="w-full"
        />
      )}
    </div>
  );
};
