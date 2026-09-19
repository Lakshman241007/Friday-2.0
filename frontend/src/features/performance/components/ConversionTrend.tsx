import React from 'react';
import { cn } from '@/lib/utils';
import { PerformanceTrendPoint } from '../performance.types';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Target } from 'lucide-react';

export interface ConversionTrendProps {
  trend: PerformanceTrendPoint[];
  className?: string;
}

export const ConversionTrend: React.FC<ConversionTrendProps> = ({ trend, className }) => {
  const chartData = trend.map((t) => ({
    date: t.date,
    Total: t.callsCount,
    Qualified: t.qualifiedCount,
    Converted: t.convertedCount,
  }));

  const totalCalls = trend.reduce((s, i) => s + i.callsCount, 0);
  const totalQualified = trend.reduce((s, i) => s + i.qualifiedCount, 0);
  const totalConverted = trend.reduce((s, i) => s + i.convertedCount, 0);

  return (
    <div className={cn('p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-4', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">
              Conversion Pipeline Velocity
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Cohort progression from total connection to qualification and deal closure.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500">Total: </span>
            <span className="text-slate-200 font-semibold">{totalCalls}</span>
          </div>
          <div>
            <span className="text-slate-500">Qualified: </span>
            <span className="text-sky-300 font-semibold">{totalQualified}</span>
          </div>
          <div>
            <span className="text-slate-500">Converted: </span>
            <span className="text-emerald-300 font-semibold">{totalConverted}</span>
          </div>
        </div>
      </div>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="rgba(255, 255, 255, 0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#0c0c12',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#f8fafc',
              }}
            />
            <Bar dataKey="Total" fill="#334155" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Qualified" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Converted" fill="#10b981" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-white/[0.04]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-600" />
            <span>Total Connected</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-sky-400" />
            <span>Qualified</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span>Converted</span>
          </span>
        </div>
        <span>Data verified daily at 00:00 UTC</span>
      </div>
    </div>
  );
};
