import React from 'react';
import { cn } from '@/lib/utils';
import { OutcomeMetrics } from './outcomes.types';
import { Progress } from '@/components/ui/Progress';
import { GitCompare, CheckCircle2, AlertCircle, BarChart3, Info } from 'lucide-react';

export interface AccuracyCardProps {
  metrics: OutcomeMetrics;
  className?: string;
}

export const AccuracyCard: React.FC<AccuracyCardProps> = ({ metrics, className }) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs p-5 sm:p-6 space-y-5',
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Aggregate Outcome Alignment
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
          Sample Benchmark Data
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Metric 1: Agreement Rate */}
        <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase">
            Outcome Agreement
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {metrics.agreementRate}%
          </div>
          <div className="text-[10px] text-slate-400">
            Semantic correlation across evaluated cohorts
          </div>
        </div>

        {/* Metric 2: Total Compared */}
        <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase">
            Compared Calls
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.totalCompared}
          </div>
          <div className="text-[10px] text-slate-400">
            Dual-verified telephone sessions
          </div>
        </div>

        {/* Metric 3: Concordant / Matching */}
        <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase">
            Matching Outcomes
          </div>
          <div className="text-2xl font-bold font-mono text-slate-200">
            {metrics.matchingCount} <span className="text-xs text-slate-500 font-normal">/ {metrics.totalCompared}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {metrics.differentCount} divergent reviews identified
          </div>
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <Progress
          value={metrics.agreementRate}
          variant="success"
          size="md"
        />
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <Info className="w-3 h-3 text-slate-500 shrink-0" />
          <span>Demo telemetry benchmark — provides representative insight into field concordance.</span>
        </div>
      </div>
    </div>
  );
};
