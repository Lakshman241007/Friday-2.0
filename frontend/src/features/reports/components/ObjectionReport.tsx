import React from 'react';
import { cn } from '@/lib/utils';
import { ObjectionReportData } from '../reports.types';
import { ShieldAlert, TrendingUp, TrendingDown, ArrowUpRight, PhoneCall, Sparkles } from 'lucide-react';

export interface ObjectionReportProps {
  data: ObjectionReportData;
  onNavigateToAnalysis?: (callId: string) => void;
  className?: string;
}

export const ObjectionReport: React.FC<ObjectionReportProps> = ({
  data,
  onNavigateToAnalysis,
  className,
}) => {
  return (
    <div className={cn('space-y-5', className)}>
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">
              Objection Categorization & Distribution
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Automated objection clustering extracted from dialogue diarization streams.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Total Flagged</div>
            <div className="text-xl font-bold font-mono text-amber-300">
              {data.totalObjections}
            </div>
          </div>
          <div className="text-right border-l border-white/10 pl-4">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Predominant Vector</div>
            <div className="text-xl font-bold font-mono text-white">
              {data.topCategory}
            </div>
          </div>
        </div>
      </div>

      {/* Objections Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.categories.map((item) => {
          const isUp = item.trend.startsWith('+');

          return (
            <div
              key={item.category}
              className="p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-3 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-sm font-semibold text-white block">
                    {item.category} Objection
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {item.count} occurrences ({item.percentage}%)
                  </span>
                </div>

                <span
                  className={cn(
                    'font-mono text-[11px] px-1.5 py-0.5 rounded flex items-center gap-0.5',
                    isUp ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'
                  )}
                >
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{item.trend}</span>
                </span>
              </div>

              {/* Progress bar visual */}
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400/80"
                  style={{ width: `${item.percentage * 2.5}%` }}
                />
              </div>

              {/* Linked Call Sample */}
              {item.relatedCallId && (
                <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                    e.g. {item.exampleLead || 'Sample Session'}
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateToAnalysis?.(item.relatedCallId!)}
                    className="font-mono text-[11px] text-sky-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>Inspect #{item.relatedCallId}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
