import React from 'react';
import { cn } from '@/lib/utils';
import { SentimentAnalysis, SentimentType } from '../ai-analysis.types';
import { ConfidenceScore } from './ConfidenceScore';
import {
  Smile,
  Meh,
  Frown,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export interface SentimentCardProps {
  sentiment?: SentimentAnalysis;
  className?: string;
}

export const SentimentCard: React.FC<SentimentCardProps> = ({
  sentiment,
  className,
}) => {
  if (!sentiment) {
    return (
      <div className={cn('rounded-xl border border-white/10 bg-[#0c0c11]/80 p-5 text-xs text-slate-500', className)}>
        Sentiment telemetry is not available for this call.
      </div>
    );
  }

  const getSentimentIcon = (type: SentimentType) => {
    switch (type) {
      case 'Positive':
        return <Smile className="w-4 h-4 text-emerald-400" />;
      case 'Neutral':
        return <Meh className="w-4 h-4 text-slate-300" />;
      case 'Negative':
        return <Frown className="w-4 h-4 text-rose-400" />;
      case 'Mixed':
        return <Activity className="w-4 h-4 text-amber-400" />;
    }
  };

  const getSentimentBadge = (type: SentimentType) => {
    switch (type) {
      case 'Positive':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'Neutral':
        return 'bg-white/5 text-slate-300 border-white/10';
      case 'Negative':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'Mixed':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
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
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Sentiment Vector
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {sentiment.confidence}% confidence
        </span>
      </div>

      {/* Overall Sentiment Rating */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          {getSentimentIcon(sentiment.overall)}
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-white">
              {sentiment.overall} Sentiment
            </div>
            <div className="text-[11px] text-slate-400">
              Aggregated across all speaking turns
            </div>
          </div>
        </div>

        <span
          className={cn(
            'text-xs font-mono font-medium px-2.5 py-1 rounded border',
            getSentimentBadge(sentiment.overall)
          )}
        >
          {sentiment.overall}
        </span>
      </div>

      {/* Summary Quote */}
      <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-white/20 pl-3">
        "{sentiment.summary}"
      </p>

      {/* Progression Across Call: Start -> Middle -> End */}
      {sentiment.progression.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Conversational Trajectory
          </span>

          <div className="grid grid-cols-3 gap-2">
            {sentiment.progression.map((step, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1 text-center"
              >
                <div className="text-[10px] font-mono text-slate-500 uppercase">
                  {step.stage}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs font-medium text-slate-200">
                  {getSentimentIcon(step.sentiment)}
                  <span className="truncate">{step.sentiment}</span>
                </div>
                {step.timestamp && (
                  <div className="text-[10px] font-mono text-slate-500">
                    {step.timestamp}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Score Bar */}
      <div className="pt-2 border-t border-white/[0.04]">
        <ConfidenceScore score={sentiment.confidence} size="sm" />
      </div>
    </div>
  );
};
