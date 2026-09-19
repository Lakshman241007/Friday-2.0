import React from 'react';
import { cn } from '@/lib/utils';
import { AnalysisStatus as AnalysisStatusType } from '../ai-analysis.types';
import { CheckCircle2, Loader2, AlertTriangle, Slash } from 'lucide-react';

export interface AnalysisStatusProps {
  status: AnalysisStatusType;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export const AnalysisStatus: React.FC<AnalysisStatusProps> = ({
  status,
  size = 'md',
  showDescription = false,
  className,
}) => {
  const configs: Record<
    AnalysisStatusType,
    {
      label: string;
      description: string;
      icon: React.ComponentType<{ className?: string }>;
      containerStyle: string;
      iconStyle: string;
      badgeStyle: string;
    }
  > = {
    completed: {
      label: 'Analysis Complete',
      description: 'All conversational metrics and semantic models processed.',
      icon: CheckCircle2,
      containerStyle: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300',
      iconStyle: 'text-emerald-400',
      badgeStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    },
    processing: {
      label: 'Analysis Processing',
      description: 'Ingesting audio stream and synthesizing semantic vectors.',
      icon: Loader2,
      containerStyle: 'border-amber-500/20 bg-amber-950/20 text-amber-300',
      iconStyle: 'text-amber-400 animate-spin',
      badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    },
    failed: {
      label: 'Analysis Failed',
      description: 'Analysis aborted due to audio corruption or packet loss.',
      icon: AlertTriangle,
      containerStyle: 'border-red-500/20 bg-red-950/20 text-red-300',
      iconStyle: 'text-red-400',
      badgeStyle: 'bg-red-500/10 text-red-300 border-red-500/25',
    },
    unavailable: {
      label: 'Analysis Unavailable',
      description: 'AI intelligence was not captured or opted out for this session.',
      icon: Slash,
      containerStyle: 'border-white/10 bg-white/[0.02] text-slate-400',
      iconStyle: 'text-slate-500',
      badgeStyle: 'bg-white/5 text-slate-400 border-white/10',
    },
  };

  const config = configs[status] || configs.unavailable;
  const Icon = config.icon;

  if (showDescription) {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-3.5 rounded-xl border',
          config.containerStyle,
          className
        )}
      >
        <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', config.iconStyle)} />
        <div className="space-y-0.5 text-xs">
          <div className="font-semibold">{config.label}</div>
          <div className="text-slate-400 text-[11px] leading-relaxed">
            {config.description}
          </div>
        </div>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium rounded-full border select-none transition-colors',
        sizeClasses[size],
        config.badgeStyle,
        className
      )}
      role="status"
    >
      <Icon className={cn(iconSizes[size], config.iconStyle)} />
      <span>{config.label}</span>
    </span>
  );
};
