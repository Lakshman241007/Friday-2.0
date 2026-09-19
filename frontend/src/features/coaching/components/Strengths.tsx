import React from 'react';
import { cn } from '@/lib/utils';
import { Strength } from '../coaching.types';
import { CheckCircle2, PhoneCall, Sparkles, ArrowUpRight } from 'lucide-react';

export interface StrengthsProps {
  strengths: Strength[];
  onNavigateToCall?: (callId: string) => void;
  className?: string;
}

export const Strengths: React.FC<StrengthsProps> = ({ strengths, onNavigateToCall, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Demonstrated Strengths & Competencies
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          {strengths.length} observed proficiencies
        </span>
      </div>

      <div className="space-y-2.5">
        {strengths.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{item.title}</span>
                </span>
                <span className="text-[10px] font-mono uppercase text-slate-500 px-1.5 py-0.2 rounded bg-white/[0.04]">
                  {item.category}
                </span>
              </div>

              {item.metric && (
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                  {item.metric}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {item.description}
            </p>

            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-slate-400 flex items-start justify-between gap-2">
              <div className="leading-relaxed">
                <span className="text-slate-500 font-mono text-[10px] uppercase block">
                  Observed Evidence:
                </span>
                <span>{item.evidence}</span>
              </div>

              {item.callId && (
                <button
                  type="button"
                  onClick={() => onNavigateToCall?.(item.callId!)}
                  className="font-mono text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 shrink-0 underline underline-offset-2 transition-colors mt-0.5"
                >
                  <span>#{item.callId}</span>
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
