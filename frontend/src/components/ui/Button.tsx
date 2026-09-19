import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none whitespace-nowrap active:scale-[0.98]';

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-slate-100 hover:bg-white text-zinc-950 font-semibold shadow-sm shadow-white/5 border border-white/90',
      secondary:
        'bg-[#141419] hover:bg-[#1c1c24] text-slate-200 border border-white/10 hover:border-white/20 hover:text-white',
      ghost:
        'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-transparent',
      destructive:
        'bg-red-950/30 hover:bg-red-900/40 text-red-300 hover:text-red-200 border border-red-500/25 hover:border-red-500/40',
      outline:
        'bg-transparent hover:bg-white/[0.04] text-slate-300 hover:text-white border border-white/15 hover:border-white/25',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
      md: 'h-9.5 px-4 text-sm rounded-lg gap-2',
      lg: 'h-11 px-5 text-sm rounded-lg gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
