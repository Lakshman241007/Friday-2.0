import React from 'react';
import { cn } from '@/lib/utils';
import { Objection } from '../ai-analysis.types';
import { AlertCircle, Clock, ArrowUpRight, CheckCircle } from 'lucide-react';

export interface ObjectionCardProps {
  objections: Objection[];
  onSelectTimestamp?: (timestampSeconds: number, timestampStr: string) => void;
  className?: string;
}

export const ObjectionCard: React.FC<ObjectionCardProps> = ({
  objections,
  onSelectTimestamp,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs p-5 space-y-4',
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Detected Objections & Friction Points
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {objections.length} detected
        </span>
      </div>

      {objections.length === 0 ? (
        <div className="p-6 rounded-lg bg-white/[0.02] border border-white/[0.05] text-center space-y-1">
          <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
          <p className="text-xs font-medium text-slate-200">
            Zero explicit friction or objections detected.
          </p>
          <p className="text-[11px] text-slate-500">
            Dialogue flowed without significant pricing, competitor, or timing resistance.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {objections.map((obj) => (
            <div
              key={obj.id}
              className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors space-y-2 group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {obj.category} Objection
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {obj.confidence}% confidence
                  </span>
                </div>

                {obj.timestamp && (
                  <button
                    type="button"
                    onClick={() => {
                      if (obj.timestampSeconds !== undefined) {
                        onSelectTimestamp?.(obj.timestampSeconds, obj.timestamp!);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                    title="Jump to dialogue transcript timestamp"
                  >
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{obj.timestamp}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {obj.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
