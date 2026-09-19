import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Lead } from '../leads.types';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadScore } from './LeadScore';
import { Phone, ArrowRight, Building2, Calendar, User } from 'lucide-react';
import { formatPhoneNumber } from '../leads.utils';

export interface LeadCardProps {
  lead: Lead;
  onSelectLead: (lead: Lead) => void;
  onCallLead: (lead: Lead) => void;
  onAssignLead?: (lead: Lead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onSelectLead,
  onCallLead,
  onAssignLead,
}) => {
  return (
    <Card
      variant="interactive"
      className="p-4 sm:p-5 flex flex-col justify-between space-y-4 cursor-pointer"
      onClick={() => onSelectLead(lead)}
    >
      {/* Header Info */}
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              {lead.name}
            </h3>
            <p className="text-xs text-slate-400">
              {lead.title}
            </p>
          </div>
          <LeadStatusBadge status={lead.status} />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-medium text-slate-200">{lead.company}</span>
          {lead.dealValue && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] font-mono text-emerald-400">{lead.dealValue}</span>
            </>
          )}
        </div>
      </div>

      {/* Meta row: Score & Rep */}
      <div className="grid grid-cols-2 gap-3 py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
            Score
          </span>
          <LeadScore score={lead.score} />
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
            Assigned Rep
          </span>
          {lead.assignedEmployeeName ? (
            <span className="text-xs text-slate-200 font-medium truncate block">
              {lead.assignedEmployeeName}
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAssignLead?.(lead);
              }}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              Assign now
            </button>
          )}
        </div>
      </div>

      {/* Next Action & Contact */}
      <div className="space-y-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{lead.nextAction || 'No pending action'}</span>
        </div>
        <div className="text-[11px] font-mono text-slate-500 pl-5.5">
          {formatPhoneNumber(lead.phone)}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div
        className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCallLead(lead)}
          className="flex-1 h-8 text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
        >
          <Phone className="w-3.5 h-3.5 mr-1.5" />
          Call Lead
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onSelectLead(lead)}
          className="h-8 text-xs px-3"
        >
          Details
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>
    </Card>
  );
};
