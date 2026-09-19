import React from 'react';
import { cn } from '@/lib/utils';
import { IntentAnalysis } from '../ai-analysis.types';
import { ConfidenceScore } from './ConfidenceScore';
import { Compass, Target, ArrowRight } from 'lucide-react';

export interface IntentCardProps {
  intent?: IntentAnalysis;
  className?: string;
}

export const IntentCard: React.FC<IntentCardProps> = ({ intent, className }) => {
  if (!intent) {
    return (
      <div className={cn('rounded-xl border border-white/10 bg-[#0c0c11]/80 p-5 text-xs text-slate-500', className)}>
        Customer intent analysis is not available for this session.
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs p-5 space-y-4',
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Customer Intent
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {intent.confidence}% confidence
        </span>
      </div>

      {/* Primary Intent Display */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          Primary Objective
        </span>
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white text-sm">
              {intent.primaryIntent}
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Detected Lead Driver
          </span>
        </div>
      </div>

      {/* Secondary Intents */}
      {intent.secondaryIntents.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Secondary Interests & Drivers
          </span>
          <div className="flex flex-wrap gap-1.5">
            {intent.secondaryIntents.map((sub, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/[0.06] text-slate-300"
              >
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span>{sub}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Bar */}
      <div className="pt-2 border-t border-white/[0.04]">
        <ConfidenceScore score={intent.confidence} size="sm" />
      </div>
    </div>
  );
};
