import React from 'react';
import { cn } from '@/lib/utils';
import { FollowUp } from '../followups.types';
import { PriorityBadge } from './PriorityBadge';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle2,
  Edit2,
  Eye,
  Phone,
  ArrowUpRight,
} from 'lucide-react';

export interface FollowUpCardProps {
  followUp: FollowUp;
  onView?: (followUp: FollowUp) => void;
  onComplete?: (id: string) => void;
  onEdit?: (followUp: FollowUp) => void;
  onNavigateToCall?: (callId: string) => void;
  className?: string;
}

export const FollowUpCard: React.FC<FollowUpCardProps> = ({
  followUp,
  onView,
  onComplete,
  onEdit,
  onNavigateToCall,
  className,
}) => {
  const getStatusBadge = (status: FollowUp['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
      case 'Overdue':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/25';
      case 'Due Today':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
      case 'Cancelled':
        return 'bg-white/5 text-slate-500 border-white/10';
      case 'Pending':
      default:
        return 'bg-sky-500/10 text-sky-300 border-sky-500/25';
    }
  };

  const isDone = followUp.status === 'Completed';

  return (
    <div
      className={cn(
        'p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs hover:border-white/20 transition-all space-y-3',
        isDone && 'opacity-70 bg-white/[0.01]',
        className
      )}
    >
      {/* Top Header: Lead & Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-semibold text-slate-100 text-sm">
            <span>{followUp.leadName}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Building2 className="w-3 h-3 text-slate-500" />
            <span>{followUp.company}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span
            className={cn(
              'font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border',
              getStatusBadge(followUp.status)
            )}
          >
            {followUp.status}
          </span>
          <PriorityBadge priority={followUp.priority} />
        </div>
      </div>

      {/* Task & Notes */}
      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
        <div className="text-xs font-medium text-slate-200 flex items-center justify-between">
          <span>{followUp.type}</span>
          {followUp.callId && (
            <button
              type="button"
              onClick={() => onNavigateToCall?.(followUp.callId!)}
              className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-0.5"
              title="Inspect origin call"
            >
              <span>Call #{followUp.callId}</span>
              <ArrowUpRight className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {followUp.notes || 'No specific agenda recorded.'}
        </p>
      </div>

      {/* Meta Row: Employee + Timing */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1 border-t border-white/[0.05]">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-300 truncate max-w-[130px]">{followUp.employeeName}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
          <Calendar className="w-3 h-3 text-slate-500" />
          <span>{followUp.dueDate}</span>
          <span>•</span>
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{followUp.dueTime}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.05]">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView?.(followUp)}
            className="h-7 px-2 text-xs text-slate-400 hover:text-white"
          >
            <Eye className="w-3 h-3 mr-1" />
            <span>View</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(followUp)}
            className="h-7 px-2 text-xs text-slate-400 hover:text-white"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            <span>Edit</span>
          </Button>
        </div>

        {!isDone ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onComplete?.(followUp.id)}
            className="h-7 px-2.5 text-xs text-emerald-300 hover:bg-emerald-950/30 border-emerald-500/30"
          >
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
            <span>Complete</span>
          </Button>
        ) : (
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Finished</span>
          </span>
        )}
      </div>
    </div>
  );
};
