import React from 'react';
import { cn } from '@/lib/utils';
import { RecentActivityItem } from '../dashboard.data';
import { Phone, Sparkles, UserPlus, FileCheck, ArrowRight } from 'lucide-react';

export interface RecentActivityProps {
  activities: RecentActivityItem[];
  isLoading?: boolean;
  className?: string;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  ai_score: Sparkles,
  assignment: UserPlus,
  contract: FileCheck,
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-5 space-y-3 animate-pulse', className)}>
        <div className="h-5 w-36 bg-white/[0.06] rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 w-full bg-white/[0.04] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-8 text-center text-xs text-slate-500', className)}>
        No recent operational activity registered.
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-xs p-5 flex flex-col justify-between',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
            Live Stream Activity
          </h3>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <span className="text-[11px] font-mono text-slate-500">Real-time Pulse</span>
      </div>

      {/* Activity Timeline list */}
      <div className="divide-y divide-white/[0.04] mt-1">
        {activities.map((item) => {
          const Icon = TYPE_ICONS[item.type] || Phone;
          return (
            <div
              key={item.id}
              className="py-3 flex items-start gap-3 hover:bg-white/[0.015] px-1 rounded-lg transition-colors group"
            >
              {/* Type Avatar */}
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-slate-400 group-hover:text-slate-200 transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* Description */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-slate-200 truncate">
                    {item.actor}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {item.timestamp}
                  </span>
                </div>

                <div className="text-xs text-slate-400 mt-0.5 leading-normal">
                  <span>{item.action} </span>
                  <span className="text-slate-200 font-medium">[{item.target}]</span>
                </div>

                {item.badgeLabel && (
                  <div className="mt-1.5">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] border border-white/[0.08] text-slate-400">
                      {item.badgeLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
