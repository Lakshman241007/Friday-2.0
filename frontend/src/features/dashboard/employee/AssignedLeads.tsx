import React from 'react';
import { cn } from '@/lib/utils';
import { EmployeeLead } from '../dashboard.data';
import { Badge } from '@/components/ui/Badge';
import { Phone, Calendar, ArrowRight, UserCheck } from 'lucide-react';

export interface AssignedLeadsProps {
  leads: EmployeeLead[];
  isLoading?: boolean;
  onSelectLead?: (lead: EmployeeLead) => void;
  className?: string;
}

export const AssignedLeads: React.FC<AssignedLeadsProps> = ({
  leads,
  isLoading = false,
  onSelectLead,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-5 space-y-3 animate-pulse', className)}>
        <div className="h-5 w-40 bg-white/[0.06] rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 w-full bg-white/[0.04] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-8 text-center text-xs text-slate-500', className)}>
        No active leads currently assigned to your queue.
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
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
              Assigned Queue Leads
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              ({leads.length} high priority)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Accounts awaiting scheduled outbound engagement
          </p>
        </div>
        <Badge variant="neutral" size="sm" dot>
          Active Focus
        </Badge>
      </div>

      {/* Leads List */}
      <div className="divide-y divide-white/[0.04] mt-1">
        {leads.map((lead) => {
          const priorityVariant =
            lead.priority === 'urgent'
              ? 'error'
              : lead.priority === 'high'
              ? 'warning'
              : 'neutral';

          const statusVariant =
            lead.status === 'scheduled'
              ? 'active'
              : lead.status === 'negotiation'
              ? 'processing'
              : 'pending';

          return (
            <div
              key={lead.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.015] px-1 rounded-lg transition-colors group"
            >
              {/* Lead Info */}
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-xs text-slate-100 group-hover:text-white transition-colors">
                    {lead.name}
                  </span>
                  <span className="text-xs text-slate-400">• {lead.company}</span>
                  <Badge variant={priorityVariant} size="sm">
                    {lead.priority.toUpperCase()}
                  </Badge>
                  <Badge variant={statusVariant} size="sm">
                    {lead.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="text-slate-400">Next Action:</span>
                  <span className="font-medium text-slate-200">{lead.nextAction}</span>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {lead.scheduledTime}
                  </span>
                  <span>Est. Value: {lead.dealValue}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onSelectLead?.(lead)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <Phone className="w-3 h-3 text-slate-300" />
                  <span>Call Queue</span>
                  <ArrowRight className="w-3 h-3 opacity-60" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
