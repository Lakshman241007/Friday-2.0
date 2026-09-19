import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { EmployeePerformance } from '../performance.types';
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
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GraduationCap,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export interface EmployeeComparisonProps {
  employees: EmployeePerformance[];
  onSelectEmployee?: (employeeId: string) => void;
  onNavigateToCoaching?: (employeeId: string) => void;
  className?: string;
}

type SortField = 'employeeName' | 'totalCalls' | 'conversionPercentage' | 'callQualityScore' | 'followUpCompletionPercentage';

export const EmployeeComparison: React.FC<EmployeeComparisonProps> = ({
  employees,
  onSelectEmployee,
  onNavigateToCoaching,
  className,
}) => {
  const [sortField, setSortField] = useState<SortField>('totalCalls');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sorted = [...employees].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      return sortOrder === 'asc'
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }

    return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-white" />
    ) : (
      <ArrowDown className="w-3 h-3 text-white" />
    );
  };

  return (
    <div className={cn('p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-4', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.08]">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Team Telemetry & Representative Benchmarks
          </h3>
          <p className="text-xs text-slate-400">
            Descriptive operational metrics across active team representatives. Select any row for in-depth profile analysis.
          </p>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Showing {employees.length} active representatives
        </div>
      </div>

      <div className="border border-white/[0.08] rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <tr>
              <TableHead className="w-[28%]">
                <button
                  type="button"
                  onClick={() => handleSort('employeeName')}
                  className="flex items-center gap-1.5 group text-xs font-mono uppercase text-slate-400 hover:text-white"
                >
                  <span>Representative</span>
                  {renderSortIcon('employeeName')}
                </button>
              </TableHead>

              <TableHead className="w-[16%]">
                <button
                  type="button"
                  onClick={() => handleSort('totalCalls')}
                  className="flex items-center gap-1.5 group text-xs font-mono uppercase text-slate-400 hover:text-white"
                >
                  <span>Calls Logged</span>
                  {renderSortIcon('totalCalls')}
                </button>
              </TableHead>

              <TableHead className="w-[18%]">
                <button
                  type="button"
                  onClick={() => handleSort('conversionPercentage')}
                  className="flex items-center gap-1.5 group text-xs font-mono uppercase text-slate-400 hover:text-white"
                >
                  <span>Conversion Rate</span>
                  {renderSortIcon('conversionPercentage')}
                </button>
              </TableHead>

              <TableHead className="w-[18%]">
                <button
                  type="button"
                  onClick={() => handleSort('callQualityScore')}
                  className="flex items-center gap-1.5 group text-xs font-mono uppercase text-slate-400 hover:text-white"
                >
                  <span>Quality Score</span>
                  {renderSortIcon('callQualityScore')}
                </button>
              </TableHead>

              <TableHead className="w-[20%] text-right">
                <button
                  type="button"
                  onClick={() => handleSort('followUpCompletionPercentage')}
                  className="inline-flex items-center gap-1.5 group text-xs font-mono uppercase text-slate-400 hover:text-white ml-auto"
                >
                  <span>Follow-up Rate</span>
                  {renderSortIcon('followUpCompletionPercentage')}
                </button>
              </TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {sorted.map((emp) => (
              <TableRow
                key={emp.employeeId}
                onClick={() => onSelectEmployee?.(emp.employeeId)}
                className="cursor-pointer hover:bg-white/[0.04] transition-colors group"
              >
                {/* Employee Name + Role */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center font-mono text-xs text-slate-200">
                      {emp.avatarInitials}
                    </div>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white flex items-center gap-1">
                        <span>{emp.employeeName}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-slate-400">{emp.role}</div>
                    </div>
                  </div>
                </TableCell>

                {/* Total Calls */}
                <TableCell>
                  <div className="font-mono text-xs sm:text-sm text-slate-200">
                    {emp.totalCalls}
                    <span className="text-[10px] text-slate-500 ml-1">
                      ({emp.connectedCalls} connected)
                    </span>
                  </div>
                </TableCell>

                {/* Conversion Rate */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm font-semibold text-slate-200">
                      {emp.conversionRate}
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-sky-400 rounded-full"
                        style={{ width: `${Math.min(emp.conversionPercentage * 2.5, 100)}%` }}
                      />
                    </div>
                  </div>
                </TableCell>

                {/* Quality Score */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm font-semibold text-purple-300">
                      {emp.callQualityScore}
                      <span className="text-[10px] text-slate-500">/100</span>
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-purple-400 rounded-full"
                        style={{ width: `${emp.callQualityScore}%` }}
                      />
                    </div>
                  </div>
                </TableCell>

                {/* Follow-up Rate & Coaching Button */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-mono text-xs sm:text-sm text-emerald-300">
                      {emp.followUpCompletionRate}
                    </span>
                    {onNavigateToCoaching && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToCoaching(emp.employeeId);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Open Coaching Profile"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-[10px] font-mono text-slate-500">
        Note: Metrics reflect aggregate observational telephony events; columns can be sorted objectively.
      </div>
    </div>
  );
};
