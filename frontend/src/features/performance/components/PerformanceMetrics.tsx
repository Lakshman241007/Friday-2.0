import React from 'react';
import { cn } from '@/lib/utils';
import { PerformanceMetric } from '../performance.types';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

export interface PerformanceMetricsProps {
  metrics: PerformanceMetric[];
  className?: string;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((metric) => {
          const isUp = metric.isPositive !== false;

          return (
            <div
              key={metric.id}
              className="p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="truncate">{metric.label}</span>
                {metric.change && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded',
                      isUp ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
                    )}
                  >
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{metric.change}</span>
                  </span>
                )}
              </div>

              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {metric.value}
              </div>

              {metric.description && (
                <p className="text-[11px] text-slate-500 leading-tight">
                  {metric.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono text-slate-500 px-1">
        <Info className="w-3 h-3" />
        <span>Telemetry benchmarks calculated from validated sample operational sessions.</span>
      </div>
    </div>
  );
};
