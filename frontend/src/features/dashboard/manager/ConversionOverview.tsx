import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ConversionDayData } from '../dashboard.data';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, BarChart2 } from 'lucide-react';

export interface ConversionOverviewProps {
  data: ConversionDayData[];
  isLoading?: boolean;
  className?: string;
}

export const ConversionOverview: React.FC<ConversionOverviewProps> = ({
  data,
  isLoading = false,
  className,
}) => {
  const [metric, setMetric] = useState<'both' | 'calls' | 'conversions'>('both');

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-6 space-y-4 animate-pulse', className)}>
        <div className="h-5 w-48 bg-white/[0.06] rounded" />
        <div className="h-64 w-full bg-white/[0.03] rounded-lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-8 text-center text-xs text-slate-500', className)}>
        No conversion trend data recorded for this duration.
      </div>
    );
  }

  // Summary calculations
  const totalCalls = data.reduce((acc, curr) => acc + curr.calls, 0);
  const totalConversions = data.reduce((acc, curr) => acc + curr.conversions, 0);
  const avgConversionRate = (totalConversions / totalCalls * 100).toFixed(1);

  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-xs p-5 flex flex-col justify-between',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
              Conversion Trends
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              {avgConversionRate}% Avg
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Daily call volume vs. successful appointments booked
          </p>
        </div>

        {/* View Filters */}
        <div className="flex items-center gap-1 bg-[#0a0a0f] p-1 rounded-lg border border-white/[0.06] text-[11px] self-start sm:self-auto font-mono">
          <button
            type="button"
            onClick={() => setMetric('both')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors',
              metric === 'both'
                ? 'bg-white/10 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Combined
          </button>
          <button
            type="button"
            onClick={() => setMetric('calls')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors',
              metric === 'calls'
                ? 'bg-white/10 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Calls
          </button>
          <button
            type="button"
            onClick={() => setMetric('conversions')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors',
              metric === 'conversions'
                ? 'bg-white/10 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            Conversions
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-white/10 bg-[#0e0e14]/95 p-2.5 shadow-xl backdrop-blur-md text-xs font-mono">
                      <div className="font-semibold text-slate-200 border-b border-white/[0.08] pb-1 mb-1.5">
                        {label} Metrics
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4 text-slate-400">
                          <span>Total Calls:</span>
                          <span className="text-slate-200 font-semibold">{payload[0]?.value}</span>
                        </div>
                        {payload[1] && (
                          <div className="flex items-center justify-between gap-4 text-emerald-400">
                            <span>Conversions:</span>
                            <span className="font-semibold">{payload[1]?.value}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {(metric === 'both' || metric === 'calls') && (
              <Area
                type="monotone"
                dataKey="calls"
                stroke="#cbd5e1"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorCalls)"
              />
            )}
            {(metric === 'both' || metric === 'conversions') && (
              <Area
                type="monotone"
                dataKey="conversions"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorConv)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-4 mt-2 border-t border-white/[0.04] text-center">
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-500">7-Day Calls</div>
          <div className="text-sm font-semibold font-mono text-slate-200 mt-0.5">{totalCalls}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-500">Appointments</div>
          <div className="text-sm font-semibold font-mono text-emerald-400 mt-0.5">{totalConversions}</div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-500">Efficiency Index</div>
          <div className="text-sm font-semibold font-mono text-white mt-0.5">Top 8%</div>
        </div>
      </div>
    </div>
  );
};
