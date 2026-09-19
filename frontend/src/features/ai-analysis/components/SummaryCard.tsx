import React from 'react';
import { cn } from '@/lib/utils';
import { CallSummary } from '../ai-analysis.types';
import { FileText, CheckCircle, HelpCircle, AlertCircle, ArrowRight } from 'lucide-react';

export interface SummaryCardProps {
  summary?: CallSummary;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, className }) => {
  if (!summary) {
    return (
      <div className={cn('rounded-xl border border-white/10 bg-[#0c0c11]/80 p-5 text-xs text-slate-500', className)}>
        Executive call summary is currently generating or unavailable.
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs p-5 sm:p-6 space-y-5',
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Executive Synthesis & Strategic Briefing
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Autonomous Abstract
        </span>
      </div>

      {/* Main Narrative Paragraph */}
      <div className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-prose">
        <p>{summary.overview}</p>
      </div>

      {/* Structured Key Points */}
      <div className="pt-3 border-t border-white/[0.05] grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Customer Interest */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase font-semibold">
            <CheckCircle className="w-3 h-3" />
            <span>Customer Interest</span>
          </div>
          <p className="text-xs text-slate-300 leading-normal">
            {summary.customerInterest}
          </p>
        </div>

        {/* Main Requirement */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[10px] uppercase font-semibold">
            <HelpCircle className="w-3 h-3" />
            <span>Technical Requirement</span>
          </div>
          <p className="text-xs text-slate-300 leading-normal">
            {summary.mainRequirement}
          </p>
        </div>

        {/* Main Concern */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] uppercase font-semibold">
            <AlertCircle className="w-3 h-3" />
            <span>Primary Concern</span>
          </div>
          <p className="text-xs text-slate-300 leading-normal">
            {summary.mainConcern}
          </p>
        </div>

        {/* Next Step */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
          <div className="flex items-center gap-1.5 text-sky-400 font-mono text-[10px] uppercase font-semibold">
            <ArrowRight className="w-3 h-3" />
            <span>Committed Next Step</span>
          </div>
          <p className="text-xs text-slate-300 leading-normal font-medium">
            {summary.nextStep}
          </p>
        </div>
      </div>
    </div>
  );
};
