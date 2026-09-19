import React from 'react';
import { cn } from '@/lib/utils';
import { FollowUp } from '../followups.types';
import { PriorityBadge } from './PriorityBadge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Eye,
  Edit2,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';

export interface FollowUpTableProps {
  followUps: FollowUp[];
  onView?: (followUp: FollowUp) => void;
  onEdit?: (followUp: FollowUp) => void;
  onComplete?: (id: string) => void;
  onNavigateToCall?: (callId: string) => void;
  className?: string;
}

export const FollowUpTable: React.FC<FollowUpTableProps> = ({
  followUps,
  onView,
  onEdit,
  onComplete,
  onNavigateToCall,
  className,
}) => {
  const getStatusBadge = (status: FollowUp['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Completed</span>
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Overdue</span>
          </span>
        );
      case 'Due Today':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Due Today</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/10">
            <span>Cancelled</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/25">
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className={cn('border border-white/[0.08] rounded-xl overflow-hidden bg-[#0c0c11]/80 backdrop-blur-xs', className)}>
      <Table
        isEmpty={followUps.length === 0}
        emptyMessage="No operational follow-up tasks match the selected criteria."
      >
        <TableHeader>
          <tr>
            <TableHead className="w-[24%]">Lead / Organization</TableHead>
            <TableHead className="w-[14%]">Owner</TableHead>
            <TableHead className="w-[16%]">Task Type</TableHead>
            <TableHead className="w-[14%]">Due Schedule</TableHead>
            <TableHead className="w-[10%]">Priority</TableHead>
            <TableHead className="w-[10%]">Status</TableHead>
            <TableHead className="w-[12%] text-right">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {followUps.map((item) => {
            const isCompleted = item.status === 'Completed';

            return (
              <TableRow
                key={item.id}
                className={cn('transition-colors group hover:bg-white/[0.03]', isCompleted && 'opacity-70')}
              >
                {/* Lead column */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-100 text-xs sm:text-sm">
                      {item.leadName}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      <span>{item.company}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Employee column */}
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-slate-200">
                    <User className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{item.employeeName}</span>
                  </div>
                </TableCell>

                {/* Task Type & Notes snippet */}
                <TableCell>
                  <div className="space-y-0.5">
                    <span className="inline-block text-xs font-mono font-medium px-2 py-0.5 rounded bg-white/[0.04] text-slate-200 border border-white/[0.06]">
                      {item.type}
                    </span>
                    {item.notes && (
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Due Date & Time */}
                <TableCell>
                  <div className="flex flex-col text-xs font-mono">
                    <div className="flex items-center gap-1 text-slate-200">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{item.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      <span>{item.dueTime}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Priority Badge */}
                <TableCell>
                  <PriorityBadge priority={item.priority} />
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  {getStatusBadge(item.status)}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Link to Call if exists */}
                    {item.callId && (
                      <button
                        type="button"
                        onClick={() => onNavigateToCall?.(item.callId!)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title={`View Origin Call #${item.callId}`}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView?.(item)}
                      className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                      title="Inspect Details"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>

                    {!isCompleted ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onComplete?.(item.id)}
                        className="h-7 px-2 text-xs text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/30"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                      </Button>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400 px-1">
                        Done
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
