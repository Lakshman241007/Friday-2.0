import React from 'react';
import { cn } from '@/lib/utils';
import { ManagerKPI } from '../dashboard.data';
import { ArrowUpRight, ArrowDownRight, PhoneCall, Radio, Target, Sparkles } from 'lucide-react';

export interface KPIOverviewProps {
  kpis: ManagerKPI[];
  isLoading?: boolean;
  className?: string;
}

const KPI_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  kpi_calls: PhoneCall,
  kpi_connected: Radio,
  kpi_conversion: Target,
  kpi_quality: Sparkles,
};

export const KPIOverview: React.FC<KPIOverviewProps> = ({
  kpis,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-[#0c0c11]/80 border border-white/[0.06] p-5 animate-pulse flex flex-col justify-between"
          >
            <div className="h-4 w-28 bg-white/[0.05] rounded" />
            <div className="h-8 w-20 bg-white/[0.08] rounded my-2" />
            <div className="h-3 w-36 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!kpis || kpis.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-white/[0.06] bg-[#0c0c11]/60 text-xs text-slate-500">
        No KPI telemetry available for the current period.
      </div>
    );
  }

  return (
    <div
      className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}
      role="region"
      aria-label="Key Performance Indicators"
    >
      {kpis.map((kpi) => {
        const Icon = KPI_ICONS[kpi.id] || PhoneCall;
        return (
          <div
            key={kpi.id}
            className="group relative rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 hover:bg-[#111117] hover:border-white/15 transition-all duration-200 p-5 flex flex-col justify-between backdrop-blur-xs"
          >
            {/* Header / Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 tracking-wide">
                {kpi.label}
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-400 group-hover:text-slate-200 transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Value & Change */}
            <div className="my-2.5 flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-mono">
                {kpi.value}
              </div>
              <div
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-mono font-medium px-1.5 py-0.5 rounded',
                  kpi.isPositive
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-400 bg-rose-500/10'
                )}
              >
                {kpi.isPositive ? (
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 shrink-0" />
                )}
                <span>{kpi.change}</span>
              </div>
            </div>

            {/* Supporting Context & Target */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-white/[0.04]">
              <span className="truncate">{kpi.context}</span>
              {kpi.target && (
                <span className="shrink-0 font-mono text-[10px] text-slate-400 ml-2">
                  {kpi.target}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
