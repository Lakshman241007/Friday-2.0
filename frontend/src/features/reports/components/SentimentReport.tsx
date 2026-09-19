import React from 'react';
import { cn } from '@/lib/utils';
import { SentimentReportData } from '../reports.types';
import { DonutChart } from '@/components/charts/DonutChart';
import { Smile, Meh, Frown, Sparkles, Compass } from 'lucide-react';

export interface SentimentReportProps {
  data: SentimentReportData;
  className?: string;
}

export const SentimentReport: React.FC<SentimentReportProps> = ({ data, className }) => {
  const donutData = [
    { name: 'Positive Tone', value: data.counts.positive, color: '#10b981' },
    { name: 'Neutral / Informational', value: data.counts.neutral, color: '#38bdf8' },
    { name: 'Negative / Friction', value: data.counts.negative, color: '#f43f5e' },
    { name: 'Mixed Sentiment', value: data.counts.mixed, color: '#a855f7' },
  ];

  return (
    <div className={cn('space-y-5', className)}>
      {/* Top Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[10px] font-mono text-emerald-400 uppercase flex items-center justify-between">
            <span>Positive Disposition</span>
            <Smile className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {data.positivePercentage}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {data.counts.positive} sessions
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[10px] font-mono text-sky-400 uppercase flex items-center justify-between">
            <span>Neutral / Analytical</span>
            <Meh className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-300">
            {data.neutralPercentage}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {data.counts.neutral} sessions
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[10px] font-mono text-rose-400 uppercase flex items-center justify-between">
            <span>Friction / Skepticism</span>
            <Frown className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300">
            {data.negativePercentage}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {data.counts.negative} sessions
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[10px] font-mono text-purple-400 uppercase flex items-center justify-between">
            <span>Mixed Signals</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {data.mixedPercentage}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {data.counts.mixed} sessions
          </div>
        </div>
      </div>

      {/* Grid: Donut + Conversation Phase Sentiment Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs flex flex-col items-center justify-center">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 self-start mb-2">
            Dialogue Sentiment Composition
          </h4>
          <div className="w-full h-[220px]">
            <DonutChart
              data={donutData}
              height={220}
              innerRadius={55}
              outerRadius={80}
              centerLabel="Analyzed"
              centerValue={
                data.counts.positive +
                data.counts.neutral +
                data.counts.negative +
                data.counts.mixed
              }
            />
          </div>
        </div>

        <div className="lg:col-span-7 p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-4">
          <div className="space-y-0.5 pb-2 border-b border-white/[0.06]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Conversational Phase Sentiment Trajectory
            </h4>
            <p className="text-xs text-slate-400">
              Shift in prospect sentiment as calls progress through discovery to closing commitments.
            </p>
          </div>

          <div className="space-y-3.5">
            {data.progressionTrend.map((phase) => (
              <div key={phase.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{phase.stage}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-emerald-400">{phase.positive}% pos</span>
                    <span className="text-slate-400">{phase.neutral}% neu</span>
                    <span className="text-rose-400">{phase.negative}% neg</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden flex">
                  <div style={{ width: `${phase.positive}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${phase.neutral}%` }} className="bg-sky-400 h-full" />
                  <div style={{ width: `${phase.negative}%` }} className="bg-rose-500 h-full" />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/[0.04] text-[11px] font-mono text-slate-500">
            Green: Positive/Receptive • Blue: Neutral/Informational • Red: Friction/Resistance
          </div>
        </div>
      </div>
    </div>
  );
};
