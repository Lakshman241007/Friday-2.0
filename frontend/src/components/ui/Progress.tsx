import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  max?: number;
  indeterminate?: boolean;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'accent' | 'success';
}

export const Progress: React.FC<ProgressProps> = ({
  className,
  value = 0,
  max = 100,
  indeterminate = false,
  label,
  showValue = false,
  size = 'md',
  variant = 'default',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const barStyles = {
    default: 'bg-slate-200',
    accent: 'bg-sky-400',
    success: 'bg-emerald-400',
  };

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          {label && <span className="font-medium text-slate-300">{label}</span>}
          {showValue && !indeterminate && (
            <span className="font-mono text-[11px] text-slate-400">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'w-full bg-[#16161d] border border-white/[0.06] rounded-full overflow-hidden relative',
          sizeStyles[size]
        )}
      >
        {indeterminate ? (
          <div
            className={cn(
              'h-full rounded-full w-1/3 animate-[indeterminate_1.5s_infinite_ease-in-out]',
              barStyles[variant]
            )}
          />
        ) : (
          <div
            className={cn('h-full transition-all duration-300 ease-out rounded-full', barStyles[variant])}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};
