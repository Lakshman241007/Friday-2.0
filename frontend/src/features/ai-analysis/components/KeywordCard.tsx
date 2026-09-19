import React from 'react';
import { cn } from '@/lib/utils';
import { Keyword } from '../ai-analysis.types';
import { Hash, Clock } from 'lucide-react';

export interface KeywordCardProps {
  keywords: Keyword[];
  onSelectTimestamp?: (timestampSeconds: number, timestampStr: string) => void;
  className?: string;
}

export const KeywordCard: React.FC<KeywordCardProps> = ({
  keywords,
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
          <Hash className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Key Topics & Extracted Concepts
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {keywords.length} entities
        </span>
      </div>

      {keywords.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-500">
          No distinctive thematic entities identified.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <div
              key={kw.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-colors text-xs"
            >
              <span className="font-medium text-slate-200">{kw.keyword}</span>
              <span className="text-[10px] font-mono text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                ×{kw.frequency}
              </span>

              {kw.timestamp && (
                <button
                  type="button"
                  onClick={() => {
                    if (kw.timestampSeconds !== undefined) {
                      onSelectTimestamp?.(kw.timestampSeconds, kw.timestamp!);
                    }
                  }}
                  className="flex items-center gap-0.5 text-[10px] font-mono text-slate-400 hover:text-white"
                  title={`Jump to ${kw.timestamp}`}
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span>{kw.timestamp}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
