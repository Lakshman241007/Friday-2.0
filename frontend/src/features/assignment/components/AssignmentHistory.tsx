import React from 'react';
import { AssignmentHistoryItem } from '../assignment.types';
import { ArrowRight, History, User } from 'lucide-react';

export interface AssignmentHistoryProps {
  history: AssignmentHistoryItem[];
  className?: string;
}

export const AssignmentHistory: React.FC<AssignmentHistoryProps> = ({
  history,
  className,
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
        No reassignment transactions recorded.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className || ''}`}>
      <div className="flex items-center gap-2 pb-2">
        <History className="w-4 h-4 text-slate-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Assignment Audit Trail & Routing History
        </h4>
      </div>

      <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-xl bg-[#0c0c11]/70 overflow-hidden">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-white/[0.02] transition-colors"
          >
            {/* Left: Lead & Transition */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100">{item.leadName}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{item.company}</span>
              </div>

              {/* Transition flow */}
              <div className="flex items-center gap-2 text-xs">
                <div className="inline-flex items-center gap-1 text-slate-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>{item.previousEmployeeName}</span>
                </div>

                <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />

                <div className="inline-flex items-center gap-1 text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-medium">
                  <User className="w-3 h-3 text-indigo-400" />
                  <span>{item.newEmployeeName}</span>
                </div>
              </div>

              {item.reason && (
                <p className="text-[11px] text-slate-400 italic">
                  Note: {item.reason}
                </p>
              )}
            </div>

            {/* Right: Actor & Timestamp */}
            <div className="text-left md:text-right text-[11px] space-y-0.5 font-mono">
              <div className="text-slate-400">
                Changed by: <span className="text-slate-200">{item.changedBy}</span>
              </div>
              <div className="text-slate-500">{item.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
