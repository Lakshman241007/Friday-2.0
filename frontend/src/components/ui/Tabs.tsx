import React, { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  activeTab: string;
  onChange: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  children,
  className,
}) => {
  return (
    <TabsContext.Provider value={{ activeTab: value, onChange: onValueChange }}>
      <div className={cn('flex flex-col gap-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'pills' | 'line';
}

export const TabList: React.FC<TabListProps> = ({
  className,
  variant = 'pills',
  children,
  ...props
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center',
        variant === 'pills' &&
          'p-1 bg-[#0f0f14] border border-white/[0.08] rounded-xl gap-1',
        variant === 'line' &&
          'border-b border-white/[0.08] gap-6 w-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export const TabTrigger: React.FC<TabTriggerProps> = ({
  className,
  value,
  icon,
  badge,
  children,
  disabled,
  ...props
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabTrigger must be used within Tabs');

  const isActive = context.activeTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => context.onChange(value)}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 select-none whitespace-nowrap focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30',
        isActive
          ? 'bg-white text-zinc-950 font-semibold shadow-xs'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      <span>{children}</span>
      {badge && <span className="ml-1">{badge}</span>}
    </button>
  );
};

export interface TabContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabContent: React.FC<TabContentProps> = ({
  className,
  value,
  children,
  ...props
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabContent must be used within Tabs');

  if (context.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn('focus:outline-none animate-in fade-in duration-200', className)}
      {...props}
    >
      {children}
    </div>
  );
};
