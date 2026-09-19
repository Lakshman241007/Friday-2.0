import React from 'react';
import { cn } from '@/lib/utils';
import { FollowUpItem } from '../dashboard.data';
import { Badge } from '@/components/ui/Badge';
import { Clock, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';

export interface FollowUpOverviewProps {
  items: FollowUpItem[];
  isLoading?: boolean;
  className?: string;
}

export const FollowUpOverview: React.FC<FollowUpOverviewProps> = ({
  items,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-5 space-y-4 animate-pulse', className)}>
        <div className="h-5 w-40 bg-white/[0.06] rounded" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/[0.04] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const overdueCount = items.filter((i) => i.isOverdue).length;
  const todayCount = items.length;

  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-xs p-5 flex flex-col justify-between',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
            Follow-up Commitments
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Client callback SLAs and scheduled collateral delivery
          </p>
        </div>
        {overdueCount > 0 && (
          <Badge variant="error" size="sm" dot>
            {overdueCount} Overdue
          </Badge>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 my-4">
        <div className="p-3 rounded-lg bg-[#0e0e14] border border-white/[0.05] text-center">
          <div className="text-[10px] font-mono text-rose-400 uppercase">Overdue</div>
          <div className="text-lg font-semibold font-mono text-rose-300 mt-0.5">
            {overdueCount}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#0e0e14] border border-white/[0.05] text-center">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Due Today</div>
          <div className="text-lg font-semibold font-mono text-slate-200 mt-0.5">
            {todayCount}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#0e0e14] border border-white/[0.05] text-center">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">Completed</div>
          <div className="text-lg font-semibold font-mono text-emerald-300 mt-0.5">
            18
          </div>
        </div>
      </div>

      {/* Follow-up list */}
      <div className="divide-y divide-white/[0.04]">
        {items.map((item) => (
          <div
            key={item.id}
            className="py-2.5 flex items-start justify-between gap-3 group hover:bg-white/[0.015] px-1 rounded-lg transition-colors"
          >
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs text-slate-200 truncate">
                  {item.leadName}
                </span>
                <span className="text-[11px] text-slate-500">({item.company})</span>
                {item.isOverdue && (
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded">
                    OVERDUE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">{item.action}</p>
            </div>

            <div className="shrink-0 text-right">
              <span
                className={cn(
                  'text-[11px] font-mono',
                  item.isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
                )}
              >
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
