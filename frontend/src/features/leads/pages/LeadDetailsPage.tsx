import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LeadStatusBadge } from '../components/LeadStatusBadge';
import { LeadScore } from '../components/LeadScore';
import { LeadTimeline } from '../components/LeadTimeline';
import { AssignLeadModal } from '@/features/assignment/components/AssignLeadModal';
import { Lead, LeadStatus } from '../leads.types';
import { phase4Store } from '../leads.data';
import { formatPhoneNumber } from '../leads.utils';
import { APP_NAME } from '@/lib/constants';
import {
  ArrowLeft,
  Phone,
  Building2,
  Mail,
  Calendar,
  DollarSign,
  UserCheck,
  History,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export interface LeadDetailsPageProps {
  leadId: string;
}

export const LeadDetailsPage: React.FC<LeadDetailsPageProps> = ({ leadId }) => {
  const [lead, setLead] = useState<Lead | undefined>(() =>
    phase4Store.getLeadById(leadId)
  );
  const [employees] = useState(() => phase4Store.getEmployees());
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [callHistory, setCallHistory] = useState(() =>
    phase4Store.getCallHistory().filter((c) => c.leadId === leadId)
  );

  useEffect(() => {
    const updateData = () => {
      setLead(phase4Store.getLeadById(leadId));
      setCallHistory(phase4Store.getCallHistory().filter((c) => c.leadId === leadId));
    };

    const unsubscribe = phase4Store.subscribe(updateData);
    updateData();
    return unsubscribe;
  }, [leadId]);

  const handleBack = () => {
    window.location.hash = '/leads';
  };

  const handleCall = () => {
    if (lead) {
      window.location.hash = `/calling?leadId=${lead.id}`;
    }
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (!lead) return;
    phase4Store.updateLead(lead.id, {
      status: newStatus,
      timeline: [
        ...lead.timeline,
        {
          id: `tl-${Date.now()}`,
          type: 'status_change',
          title: `Status Updated to ${newStatus.toUpperCase()}`,
          description: `Lead status transitioned to ${newStatus}.`,
          timestamp: 'Just now',
          actor: 'Current User',
        },
      ],
    });
  };

  const handleConfirmAssignment = (employeeId: string, reason?: string) => {
    if (lead) {
      phase4Store.assignLead(lead.id, employeeId, 'Manager Console', reason);
      setIsAssignModalOpen(false);
    }
  };

  if (!lead) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Lead Not Found</h2>
        <p className="text-sm text-slate-400">
          The requested prospect profile (ID: {leadId}) could not be located in memory.
        </p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Back Nav & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="h-8 px-2.5 text-xs text-slate-300"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Leads
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
            className="h-8 text-xs flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            {lead.assignedEmployeeName ? 'Reassign Rep' : 'Assign Rep'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCall}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 mr-0.5" />
            Call Prospect
          </Button>
        </div>
      </div>

      {/* Page Header */}
      <PageHeader
        title={lead.name}
        description={`${lead.title} at ${lead.company}`}
        badge={<LeadStatusBadge status={lead.status} size="md" />}
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Leads', href: '#/leads' },
          { label: lead.name },
        ]}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Lead Profile & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Info Card */}
          <Card className="p-6 bg-[#0c0c11]/80 space-y-6 border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Lead Intelligence Profile
                </span>
                <h3 className="text-base font-semibold text-white">
                  {lead.company}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">AI Intent Score:</span>
                <LeadScore score={lead.score} size="md" />
              </div>
            </div>

            {/* Key Field Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Address</span>
                </div>
                <div className="text-slate-200 font-medium break-all">
                  {lead.email}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Direct Phone</span>
                </div>
                <div className="text-slate-200 font-medium font-mono">
                  {formatPhoneNumber(lead.phone)}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Estimated Deal Value</span>
                </div>
                <div className="text-emerald-400 font-medium font-mono">
                  {lead.dealValue || 'Not specified'}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Acquisition Channel</span>
                </div>
                <div className="text-slate-200 font-medium uppercase font-mono">
                  {lead.source}
                </div>
              </div>
            </div>

            {/* Next Action & Status Transition */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upcoming Milestone / Next Action:</span>
                </div>
                <p className="text-sm font-semibold text-slate-100">
                  {lead.nextAction || 'Schedule introductory technical qualification call'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                  className="h-8 px-2.5 bg-[#121218] border border-white/10 text-xs text-slate-200 rounded-lg outline-none cursor-pointer focus:border-white/30"
                  aria-label="Change Lead Status"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="interested">Interested</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>
            </div>

            {/* Account Notes */}
            {lead.notes && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  Account Notes & Context
                </span>
                <p className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs text-slate-300 leading-relaxed">
                  {lead.notes}
                </p>
              </div>
            )}
          </Card>

          {/* Recent Call Sessions (Summarized for Phase 4) */}
          <Card className="p-6 bg-[#0c0c11]/80 space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                <h4 className="text-sm font-semibold text-white">
                  Recent Telephony Sessions ({callHistory.length})
                </h4>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCall}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                Launch Dialer
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {callHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-lg">
                No calls recorded yet for {lead.name}. Launch the dialer to start an outbound session.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05] border border-white/[0.06] rounded-lg overflow-hidden bg-white/[0.01]">
                {callHistory.map((call) => (
                  <div
                    key={call.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">
                          {call.date}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="font-mono text-slate-400">{call.duration}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {call.outcome.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1">
                        {call.notes || 'Routine qualification outreach.'}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (window.location.hash = `/calling/${call.id}`)}
                      className="h-7 text-[11px] px-2.5 text-slate-300 shrink-0 self-start sm:self-center"
                    >
                      View Call
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Assigned Rep & Activity Timeline */}
        <div className="space-y-6">
          {/* Assigned Rep Card */}
          <Card className="p-5 bg-[#0c0c11]/80 space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Assigned Representative
              </span>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="text-xs text-indigo-400 hover:underline"
              >
                Change
              </button>
            </div>

            {lead.assignedEmployeeName ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center font-mono font-semibold text-xs text-slate-200">
                  {lead.assignedEmployeeName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    {lead.assignedEmployeeName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Lead Assigned • SLA Active
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                <span className="text-xs text-amber-300 block font-medium">
                  Currently Unassigned
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssignModalOpen(true)}
                  className="h-7 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                >
                  Assign to Employee
                </Button>
              </div>
            )}
          </Card>

          {/* Timeline Card */}
          <Card className="p-5 bg-[#0c0c11]/80 space-y-4 border border-white/10">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Lead History & Events
              </h4>
            </div>

            <LeadTimeline events={lead.timeline} />
          </Card>
        </div>
      </div>

      {/* Assign Modal */}
      <AssignLeadModal
        isOpen={isAssignModalOpen}
        lead={lead}
        employees={employees}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleConfirmAssignment}
      />
    </div>
  );
};
