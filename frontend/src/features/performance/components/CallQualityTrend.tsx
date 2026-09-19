import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { PerformanceTrendPoint } from '../performance.types';
import { LineChart, LineChartDataPoint } from '@/components/charts/LineChart';
import { Sparkles, Calendar } from 'lucide-react';

export interface CallQualityTrendProps {
  trend: PerformanceTrendPoint[];
  className?: string;
}

export const CallQualityTrend: React.FC<CallQualityTrendProps> = ({ trend, className }) => {
  const [range, setRange] = useState<'7d' | '30d'>('7d');

  const chartData: LineChartDataPoint[] = trend.map((t) => ({
    label: t.date,
    value: t.qualityScore,
    secondaryValue: 80, // Target benchmark baseline
  }));

  const avgQuality = Math.round(
    trend.reduce((sum, item) => sum + item.qualityScore, 0) / (trend.length || 1)
  );

  return (
    <div className={cn('p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-4', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">
              Call Quality Progression
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Multi-stage conversation quality score over time (benchmark target: 80).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-mono text-slate-400">Period Average</div>
            <div className="text-sm font-bold font-mono text-purple-300">
              {avgQuality} / 100
            </div>
          </div>

          <div className="flex items-center bg-[#09090d] p-0.5 rounded-lg border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setRange('7d')}
              className={cn(
                'px-2.5 py-1 rounded transition-colors',
                range === '7d' ? 'bg-white text-zinc-950 font-semibold' : 'text-slate-400 hover:text-white'
              )}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setRange('30d')}
              className={cn(
                'px-2.5 py-1 rounded transition-colors',
                range === '30d' ? 'bg-white text-zinc-950 font-semibold' : 'text-slate-400 hover:text-white'
              )}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <LineChart
          data={chartData}
          height={220}
          strokeColor="#c084fc"
          secondaryStrokeColor="rgba(255, 255, 255, 0.2)"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-white/[0.04]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-purple-400 rounded-full" />
            <span>Observed Quality</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-white/30 rounded-full" />
            <span>Baseline Standard (80)</span>
          </span>
        </div>
        <span>Evaluation engine: FRIDAY Core Diarization</span>
      </div>
    </div>
  );
};
