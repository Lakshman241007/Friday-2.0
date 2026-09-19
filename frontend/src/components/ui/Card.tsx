import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'ghost' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#0d0d12]/90 border border-white/[0.08] backdrop-blur-sm',
    elevated: 'bg-[#131319]/95 border border-white/[0.12] shadow-lg shadow-black/40',
    ghost: 'bg-transparent border border-white/[0.06]',
    interactive:
      'bg-[#0d0d12]/90 border border-white/[0.08] hover:border-white/20 hover:bg-[#121218] transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      className={cn('rounded-xl text-slate-100 overflow-hidden', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-6 pb-3 flex flex-col gap-1.5', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3
    className={cn('text-base font-semibold text-slate-100 tracking-tight leading-snug', className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-xs text-slate-400 leading-relaxed', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-6 pt-2', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('p-6 pt-0 flex items-center justify-between border-t border-white/[0.06] mt-4', className)}
    {...props}
  >
    {children}
  </div>
);
