import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { EmployeeSummary } from '../assignment.types';
import { Search, Check, User } from 'lucide-react';

export interface EmployeeSelectorProps {
  employees: EmployeeSummary[];
  selectedEmployeeId?: string;
  onSelect: (employeeId: string) => void;
  className?: string;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  selectedEmployeeId,
  onSelect,
  className,
}) => {
  const [search, setSearch] = useState('');

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Bar */}
      <div className="relative flex items-center w-full h-9 px-3 bg-[#0e0e13] border border-white/10 rounded-lg focus-within:border-white/30">
        <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter representatives..."
          className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none"
        />
      </div>

      {/* List */}
      <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 border border-white/[0.06] rounded-lg p-1.5 bg-[#09090e]/60">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No representatives matching "{search}"
          </div>
        ) : (
          filtered.map((emp) => {
            const isSelected = emp.id === selectedEmployeeId;
            const workloadPct = Math.round((emp.activeLeads / emp.capacity) * 100);
            const isNearCapacity = workloadPct >= 80;

            return (
              <div
                key={emp.id}
                onClick={() => onSelect(emp.id)}
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-all border select-none',
                  isSelected
                    ? 'bg-white/[0.08] border-white/30 text-white'
                    : 'bg-transparent border-transparent hover:bg-white/[0.03] text-slate-300'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-mono text-[11px] font-semibold text-slate-200 shrink-0">
                    {emp.initials}
                  </div>
                  <div>
                    <div className="font-medium text-slate-100 flex items-center gap-1.5">
                      {emp.name}
                      {emp.status === 'in_call' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="In Call" />
                      )}
                      {emp.status === 'active' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Available" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{emp.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Capacity Telemetry */}
                  <div className="text-right">
                    <div className="text-[11px] font-mono text-slate-300">
                      {emp.activeLeads} / {emp.capacity}
                    </div>
                    <div
                      className={cn(
                        'text-[10px] font-mono',
                        isNearCapacity ? 'text-amber-400' : 'text-slate-500'
                      )}
                    >
                      {workloadPct}% cap
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
