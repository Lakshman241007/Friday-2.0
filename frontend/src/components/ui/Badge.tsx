import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error'
  | 'active'
  | 'pending'
  | 'processing'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dotColor?: string }> = {
    neutral: {
      container: 'bg-[#18181f] text-slate-300 border-white/10',
      dotColor: 'bg-slate-400',
    },
    active: {
      container: 'bg-slate-100 text-zinc-950 font-semibold border-white',
      dotColor: 'bg-zinc-950',
    },
    success: {
      container: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/25',
      dotColor: 'bg-emerald-400',
    },
    warning: {
      container: 'bg-amber-950/40 text-amber-300 border-amber-500/25',
      dotColor: 'bg-amber-400',
    },
    error: {
      container: 'bg-rose-950/40 text-rose-300 border-rose-500/25',
      dotColor: 'bg-rose-400',
    },
    pending: {
      container: 'bg-zinc-900 text-zinc-400 border-zinc-700/40',
      dotColor: 'bg-zinc-500',
    },
    processing: {
      container: 'bg-sky-950/40 text-sky-300 border-sky-500/25',
      dotColor: 'bg-sky-400 animate-pulse',
    },
    outline: {
      container: 'bg-transparent text-slate-300 border-white/15',
      dotColor: 'bg-slate-400',
    },
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
  };

  const config = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border whitespace-nowrap tracking-wide leading-none transition-colors select-none',
        config.container,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotColor)}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
