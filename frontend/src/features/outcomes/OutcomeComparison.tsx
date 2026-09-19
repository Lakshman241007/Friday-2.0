import React from 'react';
import { cn } from '@/lib/utils';
import { OutcomeComparison as OutcomeComparisonType, OutcomeComparisonStatus } from './outcomes.types';
import { AIOutcome } from './AIOutcome';
import { HumanOutcome } from './HumanOutcome';
import { CheckCircle2, AlertCircle, Slash, GitCompare } from 'lucide-react';

export interface OutcomeComparisonProps {
  comparison: OutcomeComparisonType;
  className?: string;
}

export const OutcomeComparison: React.FC<OutcomeComparisonProps> = ({
  comparison,
  className,
}) => {
  const getStatusBadge = (status: OutcomeComparisonStatus) => {
    switch (status) {
      case 'match':
        return {
          label: 'Match',
          container: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'different':
        return {
          label: 'Different',
          container: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'unavailable':
      default:
        return {
          label: 'Not Available',
          container: 'bg-white/5 text-slate-400 border-white/10',
          icon: <Slash className="w-3.5 h-3.5 text-slate-500" />,
        };
    }
  };

  const statusConfig = getStatusBadge(comparison.status);

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs p-5 sm:p-6 space-y-5',
        className
      )}
    >
      {/* Header with Neutral Comparison Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Outcome Correlation Matrix (AI vs. Representative)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Status:
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-full border',
              statusConfig.container
            )}
          >
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </span>
        </div>
      </div>

      {/* Side-by-Side Dual Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Column */}
        <AIOutcome data={comparison.aiOutcome} />

        {/* Human Column */}
        <HumanOutcome data={comparison.humanOutcome} />
      </div>

      {/* Neutral Informational Footnote */}
      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span>Objective verification layer — measures semantic alignment between field reports and automated transcripts.</span>
        <span className="text-slate-500">Call #{comparison.callId}</span>
      </div>
    </div>
  );
};
