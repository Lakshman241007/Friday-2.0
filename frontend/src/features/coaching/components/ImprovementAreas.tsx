import React from 'react';
import { cn } from '@/lib/utils';
import { ImprovementArea } from '../coaching.types';
import { Target, AlertCircle, ArrowUpRight, Compass } from 'lucide-react';

export interface ImprovementAreasProps {
  improvementAreas: ImprovementArea[];
  onNavigateToCall?: (callId: string) => void;
  className?: string;
}

export const ImprovementAreas: React.FC<ImprovementAreasProps> = ({
  improvementAreas,
  onNavigateToCall,
  className,
}) => {
  const getPriorityBadge = (priority: ImprovementArea['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
      case 'Medium':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/25';
      case 'Low':
      default:
        return 'bg-white/[0.04] text-slate-400 border-white/10';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Targeted Improvement Focus
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          {improvementAreas.length} recommended areas
        </span>
      </div>

      <div className="space-y-2.5">
        {improvementAreas.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{item.area}</span>
              </span>

              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'font-mono text-[10px] uppercase font-medium px-2 py-0.5 rounded border',
                    getPriorityBadge(item.priority)
                  )}
                >
                  {item.priority} Priority
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
                <span>Observed Telemetry Evidence</span>
                {item.relatedCallId && (
                  <button
                    type="button"
                    onClick={() => onNavigateToCall?.(item.relatedCallId!)}
                    className="text-slate-400 hover:text-white flex items-center gap-0.5"
                  >
                    <span>Session #{item.relatedCallId}</span>
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.evidence}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-500/[0.04] border border-amber-500/15 space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-300 font-medium">
                Suggested Playbook Practice
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {item.suggestedPractice}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
