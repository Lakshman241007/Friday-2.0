import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  label?: string;
  variant?: 'spinner' | 'skeleton' | 'minimal';
  className?: string;
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Synchronizing galaxy stream...',
  variant = 'spinner',
  className,
  count = 3,
}) => {
  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-3 w-full animate-pulse', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full bg-white/[0.04] border border-white/[0.05] rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-slate-400', className)}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-300" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-xl border border-white/[0.06] bg-[#0c0c10]/70',
        className
      )}
    >
      <Loader2 className="w-6 h-6 animate-spin text-slate-200 mb-3" />
      <p className="text-xs font-medium text-slate-400 font-mono tracking-wide">
        {label}
      </p>
    </div>
  );
};
