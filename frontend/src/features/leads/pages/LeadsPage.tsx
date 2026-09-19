import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/common/SearchBar';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { LeadTable } from '../components/LeadTable';
import { LeadCard } from '../components/LeadCard';
import { LeadFilters } from '../components/LeadFilters';
import { AssignLeadModal } from '@/features/assignment/components/AssignLeadModal';
import { Lead, LeadFilterOptions } from '../leads.types';
import { filterLeads, calculateLeadMetrics } from '../leads.utils';
import { phase4Store } from '../leads.data';
import { APP_NAME } from '@/lib/constants';
import { UserPlus, Users, Sparkles, PhoneCall, Award } from 'lucide-react';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(() => phase4Store.getLeads());
  const [employees] = useState(() => phase4Store.getEmployees());
  const [filters, setFilters] = useState<LeadFilterOptions>({
    search: '',
    status: 'all',
    assignedTo: 'all',
    scoreTier: 'all',
    source: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected lead for assignment modal
  const [assigningLead, setAssigningLead] = useState<Lead | null>(null);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = phase4Store.subscribe(() => {
      setLeads(phase4Store.getLeads());
    });
    return unsubscribe;
  }, []);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return filterLeads(leads, filters);
  }, [leads, filters]);

  // Metrics
  const metrics = useMemo(() => {
    return calculateLeadMetrics(leads);
  }, [leads]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  // Navigate to Create Lead
  const handleCreateLead = () => {
    window.location.hash = '/leads/create';
  };

  // Navigate to Lead Details
  const handleSelectLead = (lead: Lead) => {
    window.location.hash = `/leads/${lead.id}`;
  };

  // Navigate to Calling with this lead
  const handleCallLead = (lead: Lead) => {
    window.location.hash = `/calling?leadId=${lead.id}`;
  };

  // Open assign lead modal
  const handleOpenAssignModal = (lead: Lead) => {
    setAssigningLead(lead);
  };

  // Confirm assignment
  const handleConfirmAssignment = (employeeId: string, reason?: string) => {
    if (assigningLead) {
      phase4Store.assignLead(assigningLead.id, employeeId, 'Manager Console', reason);
      setAssigningLead(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Leads Workspace"
        description="Comprehensive repository for prospect discovery, qualification telemetry, and distribution queues."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Main' },
          { label: 'Leads' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateLead}
            className="flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 mr-0.5" />
            Create Lead
          </Button>
        }
      />

      {/* Leads KPI Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 flex items-center gap-3 bg-[#0c0c11]/80">
          <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white tracking-tight">
              {metrics.total}
            </div>
            <div className="text-xs text-slate-400">Total Pipeline Leads</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-[#0c0c11]/80">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-emerald-400 tracking-tight">
              {metrics.qualified}
            </div>
            <div className="text-xs text-slate-400">Qualified / Interested</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-[#0c0c11]/80">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-amber-300 tracking-tight">
              {metrics.hotLeads}
            </div>
            <div className="text-xs text-slate-400">High-Intent Leads (75+)</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-[#0c0c11]/80">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-indigo-300 tracking-tight">
              {metrics.avgScore}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
            <div className="text-xs text-slate-400">Average Lead Score</div>
          </div>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0c11]/70 backdrop-blur-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <SearchBar
            value={filters.search}
            onChange={(val) => {
              setFilters({ ...filters, search: val });
              setCurrentPage(1);
            }}
            placeholder="Search leads by name, company, email, or phone..."
            className="max-w-md w-full"
          />

          <div className="text-xs text-slate-400 flex items-center justify-between sm:justify-end gap-2">
            <span>
              Showing <strong className="text-white">{filteredLeads.length}</strong> of{' '}
              <strong className="text-white">{leads.length}</strong> records
            </span>
          </div>
        </div>

        <LeadFilters
          filters={filters}
          onChange={(newFilters) => {
            setFilters(newFilters);
            setCurrentPage(1);
          }}
          employees={employees}
        />
      </div>

      {/* Content: Desktop Table / Mobile Cards */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          title="No Matching Leads Discovered"
          description="None of your leads match the specified search or filter conditions. Try clearing filters or creating a new lead."
          actionLabel="Clear All Filters"
          onAction={() =>
            setFilters({
              search: '',
              status: 'all',
              assignedTo: 'all',
              scoreTier: 'all',
              source: 'all',
            })
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <LeadTable
              leads={paginatedLeads}
              onSelectLead={handleSelectLead}
              onCallLead={handleCallLead}
              onAssignLead={handleOpenAssignModal}
            />
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {paginatedLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onSelectLead={handleSelectLead}
                onCallLead={handleCallLead}
                onAssignLead={handleOpenAssignModal}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLeads.length}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}

      {/* Reassign / Assign Modal */}
      {assigningLead && (
        <AssignLeadModal
          isOpen={true}
          lead={assigningLead}
          employees={employees}
          onClose={() => setAssigningLead(null)}
          onAssign={handleConfirmAssignment}
        />
      )}
    </div>
  );
};
