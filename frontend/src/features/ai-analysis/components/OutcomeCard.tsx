import React from 'react';
import { cn } from '@/lib/utils';
import { AIOutcome } from '../ai-analysis.types';
import { ConfidenceScore } from './ConfidenceScore';
import { Target, CheckCircle2, CalendarClock, PhoneCall, HelpCircle } from 'lucide-react';

export interface OutcomeCardProps {
  outcome?: AIOutcome;
  className?: string;
}

export const OutcomeCard: React.FC<OutcomeCardProps> = ({ outcome, className }) => {
  if (!outcome) {
    return (
      <div className={cn('rounded-xl border border-white/10 bg-[#0c0c11]/80 p-5 text-xs text-slate-500', className)}>
        Outcome classification is still processing or unavailable.
      </div>
    );
  }

  const getOutcomeBadge = (status: string) => {
    switch (status) {
      case 'Converted':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
      case 'Qualified':
      case 'Interested':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/25';
      case 'Follow-up Required':
      case 'Callback Requested':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
      case 'Not Interested':
      case 'Lost':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/25';
      default:
        return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs p-5 space-y-4',
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            AI Predicted Outcome
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {outcome.confidence}% AI confidence
        </span>
      </div>

      {/* Outcome Badge & Main Result */}
      <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            Categorization
          </span>
          <div className="font-bold text-white text-base">
            {outcome.outcome}
          </div>
        </div>

        <span
          className={cn(
            'text-xs font-mono font-medium px-3 py-1 rounded-full border',
            getOutcomeBadge(outcome.outcome)
          )}
        >
          {outcome.outcome}
        </span>
      </div>

      {/* Reasoning and Evidence Summary */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          Evidence Summary
        </span>
        <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">
          {outcome.reasoning}
        </p>
      </div>

      {/* Confidence Score Bar */}
      <div className="pt-2 border-t border-white/[0.04]">
        <ConfidenceScore score={outcome.confidence} label="Outcome Confidence" size="sm" />
      </div>
    </div>
  );
};
