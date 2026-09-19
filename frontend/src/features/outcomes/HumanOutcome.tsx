import React from 'react';
import { cn } from '@/lib/utils';
import { HumanOutcomeData } from './outcomes.types';
import { User, Calendar, MessageSquare } from 'lucide-react';

export interface HumanOutcomeProps {
  data: HumanOutcomeData | null;
  className?: string;
}

export const HumanOutcome: React.FC<HumanOutcomeProps> = ({ data, className }) => {
  if (!data) {
    return (
      <div
        className={cn(
          'p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-2 text-xs text-slate-500',
          className
        )}
      >
        <div className="flex items-center gap-1.5 font-mono text-slate-400 text-[11px] uppercase">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>Representative Log</span>
        </div>
        <p>No human disposition recorded for this session.</p>
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
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>Representative Disposition</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Agent: {data.recordedBy}
        </span>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          Recorded Outcome
        </span>
        <div className="text-sm font-bold text-white">
          {data.outcome}
        </div>
      </div>

      {data.notes && (
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Representative Remarks
          </span>
          <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
            {data.notes}
          </p>
        </div>
      )}

      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 pt-1">
        <Calendar className="w-3 h-3" />
        <span>Logged: {data.recordedAt}</span>
      </div>
    </div>
  );
};
