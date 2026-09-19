import React from 'react';
import { cn } from '@/lib/utils';
import { CallQualityReportData } from '../reports.types';
import { LineChart, LineChartDataPoint } from '@/components/charts/LineChart';
import { Progress } from '@/components/ui/Progress';
import { Sparkles, Info, ShieldCheck } from 'lucide-react';

export interface CallQualityReportProps {
  data: CallQualityReportData;
  className?: string;
}

export const CallQualityReport: React.FC<CallQualityReportProps> = ({ data, className }) => {
  const chartData: LineChartDataPoint[] = data.timeline.map((t) => ({
    label: t.date,
    value: t.score,
    secondaryValue: data.targetScore,
  }));

  return (
    <div className={cn('space-y-5', className)}>
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">
              Composite Call Quality Evaluation
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Multi-stage conversational grading based on natural language diarization rubrics.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Average Score</div>
            <div className="text-xl font-bold font-mono text-purple-300">
              {data.averageScore} <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="text-right border-l border-white/10 pl-4">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Target Benchmark</div>
            <div className="text-xl font-bold font-mono text-slate-300">
              {data.targetScore} <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Quality Timeline Chart + Dimension Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Quality Progression Chart */}
        <div className="lg:col-span-6 p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Quality Progression Over Time
            </h4>
            <span className="text-[11px] font-mono text-purple-300">Daily Telemetry</span>
          </div>

          <div className="pt-2">
            <LineChart
              data={chartData}
              height={220}
              strokeColor="#c084fc"
              secondaryStrokeColor="rgba(255, 255, 255, 0.2)"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-white/[0.04]">
            <span>Lavender: Observed Quality</span>
            <span>Gray: Benchmark (80)</span>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="lg:col-span-6 p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Rubric Dimensions Performance
            </h4>
            <span className="text-[11px] font-mono text-emerald-400">5 Categories</span>
          </div>

          <div className="space-y-3.5">
            {data.dimensions.map((dim) => (
              <div key={dim.dimension} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{dim.dimension}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-purple-300 font-semibold">{dim.score}</span>
                    <span className="text-slate-500 text-[10px]">/ target {dim.target}</span>
                  </div>
                </div>
                <Progress value={dim.score} max={100} className="h-1.5 bg-white/10" />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 pt-2 border-t border-white/[0.04]">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Sample Telemetry Mode: Conversation scores derived from test evaluation batches.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
