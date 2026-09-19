import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ReportFilters as ReportFiltersType } from '../reports.types';
import { Button } from '@/components/ui/Button';
import { Filter, RotateCcw, Calendar, User, Target, Smile } from 'lucide-react';

export interface ReportFiltersProps {
  filters: ReportFiltersType;
  onChange: (filters: ReportFiltersType) => void;
  onReset: () => void;
  className?: string;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onChange,
  onReset,
  className,
}) => {
  const [localFilters, setLocalFilters] = useState<ReportFiltersType>(filters);

  const handleApply = () => {
    onChange(localFilters);
  };

  const handleReset = () => {
    const defaultFilters: ReportFiltersType = {
      dateRange: '7d',
      employeeId: 'all',
      outcome: 'all',
      sentiment: 'all',
    };
    setLocalFilters(defaultFilters);
    onReset();
  };

  return (
    <div className={cn('p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-3', className)}>
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Report Parameters & Cohort Filters
          </span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Date Range */}
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
            Date Window
          </label>
          <select
            value={localFilters.dateRange}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, dateRange: e.target.value as any })
            }
            className="w-full bg-[#121218] border border-white/10 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-white/30"
          >
            <option value="7d">Trailing 7 Days</option>
            <option value="30d">Trailing 30 Days</option>
            <option value="90d">Trailing 90 Days</option>
            <option value="q3">Q3 2026 Fiscal</option>
          </select>
        </div>

        {/* Representative */}
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
            Representative
          </label>
          <select
            value={localFilters.employeeId || 'all'}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, employeeId: e.target.value })
            }
            className="w-full bg-[#121218] border border-white/10 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-white/30"
          >
            <option value="all">Entire Team (Aggregate)</option>
            <option value="emp-1">Sarah Jenkins (Senior AE)</option>
            <option value="emp-2">Alex Chen (Outbound Specialist)</option>
            <option value="emp-3">David Kim (Solutions Engineer)</option>
            <option value="usr_emp_01">Elena Rostova (Account Executive)</option>
          </select>
        </div>

        {/* Disposition / Outcome */}
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
            Disposition Outcome
          </label>
          <select
            value={localFilters.outcome || 'all'}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, outcome: e.target.value })
            }
            className="w-full bg-[#121218] border border-white/10 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-white/30"
          >
            <option value="all">All Dispositions</option>
            <option value="converted">Converted (Deal Closed)</option>
            <option value="qualified">Qualified</option>
            <option value="followup">Follow-up Required</option>
            <option value="callback">Callback Requested</option>
            <option value="not_interested">Not Interested</option>
          </select>
        </div>

        {/* Sentiment */}
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
            Dialogue Sentiment
          </label>
          <select
            value={localFilters.sentiment || 'all'}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, sentiment: e.target.value })
            }
            className="w-full bg-[#121218] border border-white/10 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-white/30"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          variant="primary"
          size="sm"
          onClick={handleApply}
          className="text-xs bg-white text-zinc-950 hover:bg-slate-200 h-7 px-3"
        >
          Apply Parameters
        </Button>
      </div>
    </div>
  );
};
