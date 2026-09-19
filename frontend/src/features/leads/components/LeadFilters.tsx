import React from 'react';
import { Button } from '@/components/ui/Button';
import { LeadFilterOptions, LeadScoreTier, LeadSource, LeadStatus } from '../leads.types';
import { RotateCcw, Filter } from 'lucide-react';
import { EmployeeSummary } from '@/features/assignment/assignment.types';

export interface LeadFiltersProps {
  filters: LeadFilterOptions;
  onChange: (filters: LeadFilterOptions) => void;
  employees: EmployeeSummary[];
  className?: string;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  filters,
  onChange,
  employees,
  className,
}) => {
  const hasActiveFilters =
    (filters.status && filters.status !== 'all') ||
    (filters.assignedTo && filters.assignedTo !== 'all') ||
    (filters.scoreTier && filters.scoreTier !== 'all') ||
    (filters.source && filters.source !== 'all');

  const handleReset = () => {
    onChange({
      search: filters.search,
      status: 'all',
      assignedTo: 'all',
      scoreTier: 'all',
      source: 'all',
    });
  };

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className || ''}`}>
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-1 select-none">
        <Filter className="w-3.5 h-3.5 text-slate-500" />
        <span>Filters:</span>
      </div>

      {/* Status Filter */}
      <select
        value={filters.status || 'all'}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as LeadStatus | 'all' })
        }
        className="h-8 px-2.5 bg-[#0e0e13] border border-white/10 text-slate-200 text-xs rounded-lg outline-none hover:border-white/20 focus:border-white/30 cursor-pointer"
        aria-label="Filter by Status"
      >
        <option value="all">All Statuses</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="interested">Interested</option>
        <option value="converted">Converted</option>
        <option value="lost">Lost</option>
        <option value="follow-up">Follow-up</option>
      </select>

      {/* Assigned Employee Filter */}
      <select
        value={filters.assignedTo || 'all'}
        onChange={(e) =>
          onChange({ ...filters, assignedTo: e.target.value })
        }
        className="h-8 px-2.5 bg-[#0e0e13] border border-white/10 text-slate-200 text-xs rounded-lg outline-none hover:border-white/20 focus:border-white/30 cursor-pointer"
        aria-label="Filter by Rep"
      >
        <option value="all">All Reps</option>
        <option value="unassigned">Unassigned</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.name}
          </option>
        ))}
      </select>

      {/* Score Tier Filter */}
      <select
        value={filters.scoreTier || 'all'}
        onChange={(e) =>
          onChange({ ...filters, scoreTier: e.target.value as LeadScoreTier | 'all' })
        }
        className="h-8 px-2.5 bg-[#0e0e13] border border-white/10 text-slate-200 text-xs rounded-lg outline-none hover:border-white/20 focus:border-white/30 cursor-pointer"
        aria-label="Filter by Score"
      >
        <option value="all">All Scores</option>
        <option value="hot">Hot (75+)</option>
        <option value="warm">Warm (45 - 74)</option>
        <option value="cold">Cold (&lt; 45)</option>
      </select>

      {/* Source Filter */}
      <select
        value={filters.source || 'all'}
        onChange={(e) =>
          onChange({ ...filters, source: e.target.value as LeadSource | 'all' })
        }
        className="h-8 px-2.5 bg-[#0e0e13] border border-white/10 text-slate-200 text-xs rounded-lg outline-none hover:border-white/20 focus:border-white/30 cursor-pointer"
        aria-label="Filter by Source"
      >
        <option value="all">All Sources</option>
        <option value="inbound">Inbound</option>
        <option value="outbound">Outbound</option>
        <option value="website">Website</option>
        <option value="referral">Referral</option>
        <option value="event">Event</option>
        <option value="partner">Partner</option>
      </select>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 px-2 text-xs text-slate-400 hover:text-white"
        >
          <RotateCcw className="w-3 h-3 mr-1.5" />
          Reset
        </Button>
      )}
    </div>
  );
};
