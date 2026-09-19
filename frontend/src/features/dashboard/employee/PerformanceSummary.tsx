import React from 'react';
import { cn } from '@/lib/utils';
import { EmployeeMetric } from '../dashboard.data';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Target, TrendingUp, Award, Zap } from 'lucide-react';

export interface PerformanceSummaryProps {
  metrics: EmployeeMetric[];
  isLoading?: boolean;
  className?: string;
}

export const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({
  metrics,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-5 space-y-4 animate-pulse', className)}>
        <div className="h-5 w-44 bg-white/[0.06] rounded" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-white/[0.04] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-xs p-5 flex flex-col justify-between',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
            Daily Quota & Velocity
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual target achievement and pacing against daily benchmarks
          </p>
        </div>
        <Badge variant="active" size="sm" dot>
          88% Quota Pacing
        </Badge>
      </div>

      {/* Metrics List */}
      <div className="space-y-4 my-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">{metric.label}</span>
              <div className="font-mono text-[11px] text-slate-400">
                <span className="text-white font-semibold">{metric.current}</span>
                <span className="text-slate-500"> / {metric.target} {metric.unit}</span>
              </div>
            </div>
            <Progress
              value={metric.percentage}
              size="md"
              variant={metric.percentage >= 100 ? 'success' : 'default'}
            />
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Shift Status: On Track
        </span>
        <span>Avg Talk Time: 4m 12s</span>
      </div>
    </div>
  );
};
