import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Lead } from '../leads.types';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadScore } from './LeadScore';
import { Button } from '@/components/ui/Button';
import { Phone, ChevronRight, User } from 'lucide-react';
import { formatPhoneNumber } from '../leads.utils';

export interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onCallLead: (lead: Lead) => void;
  onAssignLead?: (lead: Lead) => void;
  isLoading?: boolean;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onSelectLead,
  onCallLead,
  onAssignLead,
  isLoading = false,
}) => {
  return (
    <Table
      isLoading={isLoading}
      isEmpty={leads.length === 0}
      emptyMessage="No matching leads discovered. Try adjusting your search query or filters."
    >
      <TableHeader>
        <tr>
          <TableHead className="w-[24%]">Lead & Organization</TableHead>
          <TableHead className="w-[18%]">Contact Info</TableHead>
          <TableHead className="w-[12%]">Status</TableHead>
          <TableHead className="w-[14%]">Lead Score</TableHead>
          <TableHead className="w-[16%]">Assigned Rep</TableHead>
          <TableHead className="w-[16%]">Next Action</TableHead>
          <TableHead className="w-[10%] text-right">Actions</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow
            key={lead.id}
            onClick={() => onSelectLead(lead)}
            className="cursor-pointer hover:bg-white/[0.04]"
          >
            {/* Lead & Organization */}
            <TableCell>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-100 group-hover:text-white transition-colors">
                  {lead.name}
                </span>
                <span className="text-xs text-slate-400">
                  {lead.title} • <strong className="text-slate-300 font-medium">{lead.company}</strong>
                </span>
                {lead.dealValue && (
                  <span className="text-[11px] font-mono text-emerald-400/90 mt-0.5">
                    {lead.dealValue}
                  </span>
                )}
              </div>
            </TableCell>

            {/* Contact Info */}
            <TableCell>
              <div className="flex flex-col text-xs space-y-0.5">
                <span className="text-slate-300 font-mono">
                  {formatPhoneNumber(lead.phone)}
                </span>
                <span className="text-slate-500 truncate max-w-[180px]">
                  {lead.email}
                </span>
              </div>
            </TableCell>

            {/* Status */}
            <TableCell>
              <LeadStatusBadge status={lead.status} />
            </TableCell>

            {/* Score */}
            <TableCell>
              <LeadScore score={lead.score} />
            </TableCell>

            {/* Assigned Rep */}
            <TableCell>
              {lead.assignedEmployeeName ? (
                <div className="flex items-center gap-2">
                  <div className="w-5.5 h-5.5 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[10px] font-mono text-slate-300">
                    {lead.assignedEmployeeName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <span className="text-xs text-slate-200">
                    {lead.assignedEmployeeName}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssignLead?.(lead);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="underline underline-offset-2">Unassigned</span>
                </button>
              )}
            </TableCell>

            {/* Next Action */}
            <TableCell>
              <div className="flex flex-col">
                <span className="text-xs text-slate-300 line-clamp-1">
                  {lead.nextAction || 'None scheduled'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Last: {lead.lastContact || 'Never'}
                </span>
              </div>
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
              <div
                className="flex items-center justify-end gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCallLead(lead)}
                  className="h-7.5 px-2.5 text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
                  aria-label={`Call ${lead.name}`}
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectLead(lead)}
                  className="h-7.5 w-7.5 p-0 text-slate-400 hover:text-white"
                  aria-label={`View details for ${lead.name}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
