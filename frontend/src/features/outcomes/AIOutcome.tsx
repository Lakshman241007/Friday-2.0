import React from 'react';
import { cn } from '@/lib/utils';
import { AIOutcomeData } from './outcomes.types';
import { Sparkles, ShieldCheck, Clock } from 'lucide-react';

export interface AIOutcomeProps {
  data: AIOutcomeData | null;
  className?: string;
}

export const AIOutcome: React.FC<AIOutcomeProps> = ({ data, className }) => {
  if (!data) {
    return (
      <div
        className={cn(
          'p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-2 text-xs text-slate-500',
          className
        )}
      >
        <div className="flex items-center gap-1.5 font-mono text-slate-400 text-[11px] uppercase">
          <Sparkles className="w-3.5 h-3.5 text-slate-500" />
          <span>AI Predicted Disposition</span>
        </div>
        <p>Telemetry pending or unavailable for this session.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 sm:p-5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-3',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-semibold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          <span>AI Categorization</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{data.confidence}% AI confidence</span>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          Predicted Outcome
        </span>
        <div className="text-sm font-bold text-white">
          {data.outcome}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          Evidence Synopsis
        </span>
        <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
          {data.reasoning}
        </p>
      </div>

      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 pt-1">
        <Clock className="w-3 h-3" />
        <span>Analyzed: {data.analyzedAt}</span>
      </div>
    </div>
  );
};
