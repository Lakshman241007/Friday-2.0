import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/common/SearchBar';
import { AssignmentTable } from '../components/AssignmentTable';
import { AssignmentHistory } from '../components/AssignmentHistory';
import { AssignLeadModal } from '../components/AssignLeadModal';
import { Assignment } from '../assignment.types';
import { Lead } from '@/features/leads/leads.types';
import { phase4Store } from '@/features/leads/leads.data';
import { APP_NAME } from '@/lib/constants';
import { UserCheck, UserX, Users, ShieldCheck } from 'lucide-react';

export const AssignmentPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    phase4Store.getAssignments()
  );
  const [employees, setEmployees] = useState(() => phase4Store.getEmployees());
  const [history, setHistory] = useState(() => phase4Store.getAssignmentHistory());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [reassigningLead, setReassigningLead] = useState<Lead | null>(null);

  useEffect(() => {
    const update = () => {
      setAssignments(phase4Store.getAssignments());
      setEmployees(phase4Store.getEmployees());
      setHistory(phase4Store.getAssignmentHistory());
    };

    const unsubscribe = phase4Store.subscribe(update);
    return unsubscribe;
  }, []);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      if (statusFilter !== 'all' && asg.status !== statusFilter) {
        return false;
      }
      if (search.trim() !== '') {
        const q = search.toLowerCase();
        return (
          asg.leadName.toLowerCase().includes(q) ||
          asg.company.toLowerCase().includes(q) ||
          asg.employeeName.toLowerCase().includes(q) ||
          asg.employeeRole.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [assignments, statusFilter, search]);

  // Telemetry metrics
  const totalCount = assignments.length;
  const assignedCount = assignments.filter((a) => a.status === 'assigned').length;
  const unassignedCount = totalCount - assignedCount;
  const totalCapacity = employees.reduce((s, e) => s + e.capacity, 0);
  const totalActive = employees.reduce((s, e) => s + e.activeLeads, 0);

  const handleOpenReassign = (asg: Assignment) => {
    const lead = phase4Store.getLeadById(asg.leadId);
    if (lead) {
      setReassigningLead(lead);
    }
  };

  const handleConfirmAssignment = (employeeId: string, reason?: string) => {
    if (reassigningLead) {
      phase4Store.assignLead(reassigningLead.id, employeeId, 'Manager Console', reason);
      setReassigningLead(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Lead Distribution & Assignments"
        description="Configure workload allocation, inspect sales floor queues, and enforce lead routing protocols."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Management' },
          { label: 'Assignments' },
        ]}
        metadata={
          <div className="flex items-center gap-2 text-indigo-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Managerial Queue Oversight Active</span>
          </div>
        }
      />

      {/* Assignment Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 flex items-center gap-3 bg-[#0c0c11]/80">
          <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white tracking-tight">
              {totalCount}
            </div>
            <div className="text-xs text-slate-400">Total Leads in Queue</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-[#0c0c11]/80">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-indigo-300 tracking-tight">
              {assignedCount}
            </div>
            <div className="text-xs text-slate-400">Active Rep Assignments</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-[#0c0c11]/80">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-amber-300 tracking-tight">
              {unassignedCount}
            </div>
            <div className="text-xs text-slate-400">Awaiting Distribution</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-[#0c0c11]/80">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <span className="font-mono font-bold text-xs">CAP</span>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-emerald-400 tracking-tight">
              {Math.round((totalActive / Math.max(1, totalCapacity)) * 100)}%
            </div>
            <div className="text-xs text-slate-400">
              Team Floor Capacity ({totalActive}/{totalCapacity})
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0c11]/70 backdrop-blur-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by prospect, company, or representative..."
          className="max-w-md w-full"
        />

        {/* Status Tab Selector */}
        <div className="flex items-center gap-1 bg-[#09090d] p-1 rounded-lg border border-white/10 self-start sm:self-auto">
          {(['all', 'assigned', 'unassigned'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setStatusFilter(mode)}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors capitalize ${
                statusFilter === mode
                  ? 'bg-white text-zinc-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment Table */}
      <AssignmentTable
        assignments={filteredAssignments}
        onReassign={handleOpenReassign}
      />

      {/* Assignment History Section */}
      <AssignmentHistory history={history} className="pt-4" />

      {/* Modal for Reassignment */}
      {reassigningLead && (
        <AssignLeadModal
          isOpen={true}
          lead={reassigningLead}
          employees={employees}
          onClose={() => setReassigningLead(null)}
          onAssign={handleConfirmAssignment}
        />
      )}
    </div>
  );
};
