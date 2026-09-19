import React from 'react';
import { cn } from '@/lib/utils';
import { Alert, AlertPriority, AlertType } from './alerts.types';
import { Button } from '@/components/ui/Button';
import {
  AlertCircle,
  CalendarClock,
  Clock,
  Sparkles,
  TrendingDown,
  ShieldAlert,
  Radio,
  Check,
  X,
  ArrowUpRight,
} from 'lucide-react';

export interface AlertCardProps {
  alert: Alert;
  onSelect?: (alert: Alert) => void;
  onDismiss?: (id: string) => void;
  onMarkRead?: (id: string) => void;
  className?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onSelect,
  onDismiss,
  onMarkRead,
  className,
}) => {
  const getIcon = (type: AlertType) => {
    switch (type) {
      case 'follow_up_overdue':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'follow_up_due':
        return <CalendarClock className="w-4 h-4 text-amber-400" />;
      case 'negative_sentiment':
        return <TrendingDown className="w-4 h-4 text-orange-400" />;
      case 'high_priority_lead':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'objection_detected':
        return <ShieldAlert className="w-4 h-4 text-amber-300" />;
      case 'call_quality':
      case 'system':
      default:
        return <Radio className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityBadge = (priority: AlertPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'info':
      default:
        return 'bg-white/[0.04] text-slate-300 border-white/10';
    }
  };

  const isUnread = alert.status === 'unread';

  return (
    <div
      onClick={() => onSelect?.(alert)}
      className={cn(
        'group relative p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/90 hover:border-white/20 transition-all cursor-pointer space-y-2',
        isUnread && 'border-white/20 bg-white/[0.02]',
        className
      )}
    >
      {/* Top Meta Bar */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
            {getIcon(alert.type)}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className={cn('text-xs font-semibold tracking-tight', isUnread ? 'text-white' : 'text-slate-300')}>
                {alert.title}
              </span>
              {isUnread && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              {alert.timestamp} {alert.company && `• ${alert.company}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span
            className={cn(
              'font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border',
              getPriorityBadge(alert.priority)
            )}
          >
            {alert.priority}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss?.(alert.id);
            }}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Dismiss Alert"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 pl-8">
        {alert.description}
      </p>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-1.5 pl-8 border-t border-white/[0.04] text-[11px]">
        {alert.actionLabel ? (
          <span className="text-slate-300 group-hover:text-white font-medium flex items-center gap-1 transition-colors">
            <span>{alert.actionLabel}</span>
            <ArrowUpRight className="w-3 h-3" />
          </span>
        ) : (
          <span className="text-slate-500">Inspect context</span>
        )}

        {isUnread && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead?.(alert.id);
            }}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );
};
