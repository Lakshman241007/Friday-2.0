import React from 'react';
import { cn } from '@/lib/utils';
import { TeamMemberPerformance } from '../dashboard.data';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { ArrowUpRight, ArrowDownRight, Minus, Users, Phone } from 'lucide-react';

export interface TeamPerformanceProps {
  members: TeamMemberPerformance[];
  isLoading?: boolean;
  className?: string;
}

export const TeamPerformance: React.FC<TeamPerformanceProps> = ({
  members,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-6 space-y-4 animate-pulse', className)}>
        <div className="h-5 w-40 bg-white/[0.06] rounded" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-white/[0.04] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-8 text-center text-xs text-slate-500', className)}>
        No active team performance records found.
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-xs overflow-hidden flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
              Team Execution & Quality
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              ({members.length} active reps)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual call volume, conversion throughput, and voice adherence
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="neutral" size="sm" dot>
            Live Roster
          </Badge>
        </div>
      </div>

      {/* Table / List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.04] bg-[#0e0e14] text-[11px] font-mono text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-5 font-medium">Representative</th>
              <th className="py-3 px-4 font-medium text-right">Calls (Conn.)</th>
              <th className="py-3 px-4 font-medium">Conv. Rate</th>
              <th className="py-3 px-4 font-medium text-right">Quality Index</th>
              <th className="py-3 px-4 font-medium text-center">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {members.map((member) => {
              const statusBadgeVariant =
                member.status === 'in_call'
                  ? 'processing'
                  : member.status === 'active'
                  ? 'success'
                  : 'pending';

              const statusLabel =
                member.status === 'in_call'
                  ? 'On Call'
                  : member.status === 'active'
                  ? 'Ready'
                  : 'Offline';

              return (
                <tr
                  key={member.id}
                  className="hover:bg-white/[0.02] transition-colors duration-150 group"
                >
                  {/* Name & Role */}
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center font-mono text-xs font-medium text-slate-300">
                          {member.initials}
                        </div>
                        <span
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-[#0c0c11]',
                            member.status === 'in_call'
                              ? 'bg-sky-400 animate-pulse'
                              : member.status === 'active'
                              ? 'bg-emerald-400'
                              : 'bg-zinc-500'
                          )}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                          <span>{member.role}</span>
                          <span>•</span>
                          <span className="capitalize">{statusLabel}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Calls */}
                  <td className="py-3 px-4 text-right">
                    <div className="font-mono text-slate-200 font-medium">
                      {member.calls}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {member.connected} conn.
                    </div>
                  </td>

                  {/* Conversion Rate with Progress */}
                  <td className="py-3 px-4 min-w-[130px]">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-300 font-medium">
                        {member.conversionRate}%
                      </span>
                      <span className="text-slate-500">{member.conversions} closed</span>
                    </div>
                    <Progress
                      value={member.conversionRate}
                      max={40}
                      size="sm"
                      variant={member.conversionRate >= 26 ? 'success' : 'default'}
                    />
                  </td>

                  {/* Quality Score */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-semibold',
                        member.qualityScore >= 90
                          ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
                          : member.qualityScore >= 85
                          ? 'text-slate-200 bg-white/[0.05] border border-white/[0.08]'
                          : 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
                      )}
                    >
                      {member.qualityScore}
                      <span className="text-[10px] text-slate-500 font-normal ml-0.5">/100</span>
                    </span>
                  </td>

                  {/* Trend */}
                  <td className="py-3 px-4 text-center">
                    {member.trend === 'up' ? (
                      <span className="inline-flex items-center text-emerald-400">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    ) : member.trend === 'down' ? (
                      <span className="inline-flex items-center text-rose-400">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-slate-500">
                        <Minus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
