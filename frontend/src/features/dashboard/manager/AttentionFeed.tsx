import React from 'react';
import { cn } from '@/lib/utils';
import { AttentionItem } from '../dashboard.data';
import { Badge } from '@/components/ui/Badge';
import { AlertCircle, Clock, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react';

export interface AttentionFeedProps {
  items: AttentionItem[];
  isLoading?: boolean;
  onItemAction?: (item: AttentionItem) => void;
  className?: string;
}

export const AttentionFeed: React.FC<AttentionFeedProps> = ({
  items,
  isLoading = false,
  onItemAction,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-5 space-y-3 animate-pulse', className)}>
        <div className="h-5 w-36 bg-white/[0.06] rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 w-full bg-white/[0.04] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-8 text-center text-xs text-slate-500', className)}>
        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-80" />
        All operations nominal. No critical escalations require intervention.
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
            Operational Attention
          </h3>
          <Badge variant="warning" size="sm" dot>
            {items.length} Active
          </Badge>
        </div>
        <span className="text-[11px] font-mono text-slate-500">Autonomous Sentinel</span>
      </div>

      {/* Feed Items */}
      <div className="divide-y divide-white/[0.04] mt-1">
        {items.map((item) => {
          const badgeVariant =
            item.severity === 'high'
              ? 'error'
              : item.severity === 'medium'
              ? 'warning'
              : 'neutral';

          return (
            <div
              key={item.id}
              className="py-3 group flex items-start justify-between gap-3 hover:bg-white/[0.015] px-1 rounded-lg transition-colors"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={badgeVariant} size="sm">
                    {item.severity.toUpperCase()}
                  </Badge>
                  <span className="font-medium text-xs text-slate-200 truncate">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    • {item.timeAgo}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pr-2">
                  {item.description}
                </p>

                {(item.entityName || item.assignee) && (
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-0.5">
                    {item.entityName && <span>Target: {item.entityName}</span>}
                    {item.assignee && <span>Rep: {item.assignee}</span>}
                  </div>
                )}
              </div>

              {onItemAction && (
                <button
                  type="button"
                  onClick={() => onItemAction(item)}
                  className="shrink-0 text-slate-500 group-hover:text-slate-200 p-1 rounded hover:bg-white/10 transition-colors"
                  aria-label={`Inspect ${item.title}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
