import React from 'react';
import { cn } from '@/lib/utils';
import { AIAnalysis } from '../ai-analysis.types';
import { ConfidenceScore } from './ConfidenceScore';
import {
  Compass,
  Smile,
  AlertCircle,
  Target,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

export interface AnalysisOverviewProps {
  analysis: AIAnalysis;
  className?: string;
}

export const AnalysisOverview: React.FC<AnalysisOverviewProps> = ({
  analysis,
  className,
}) => {
  const primaryObjection = analysis.objections[0];

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs p-5 sm:p-6 space-y-5',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Synthesis & High-Level Evaluation
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Evaluated: {analysis.analyzedAt || 'Real-time telemetry'}
        </span>
      </div>

      {/* Grid of Key Analytical Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Intent */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] uppercase">
            <Compass className="w-3 h-3 text-slate-400" />
            <span>Customer Intent</span>
          </div>
          <div className="font-semibold text-slate-100 text-xs sm:text-sm truncate">
            {analysis.intent?.primaryIntent || 'Unspecified'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {analysis.intent?.confidence ? `${analysis.intent.confidence}% confidence` : 'Evaluating'}
          </div>
        </div>

        {/* Metric 2: Sentiment */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] uppercase">
            <Smile className="w-3 h-3 text-slate-400" />
            <span>Overall Sentiment</span>
          </div>
          <div className="font-semibold text-slate-100 text-xs sm:text-sm truncate">
            {analysis.sentiment?.overall || 'Neutral'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {analysis.sentiment?.confidence ? `${analysis.sentiment.confidence}% confidence` : 'Evaluating'}
          </div>
        </div>

        {/* Metric 3: Primary Objection */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] uppercase">
            <AlertCircle className="w-3 h-3 text-slate-400" />
            <span>Primary Objection</span>
          </div>
          <div className="font-semibold text-slate-100 text-xs sm:text-sm truncate">
            {primaryObjection ? primaryObjection.category : 'None Detected'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {primaryObjection?.timestamp ? `At ${primaryObjection.timestamp}` : 'Clean flow'}
          </div>
        </div>

        {/* Metric 4: Predicted Outcome */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] uppercase">
            <Target className="w-3 h-3 text-slate-400" />
            <span>Predicted Outcome</span>
          </div>
          <div className="font-semibold text-emerald-300 text-xs sm:text-sm truncate">
            {analysis.outcome?.outcome || 'Pending'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {analysis.outcome?.confidence ? `${analysis.outcome.confidence}% AI confidence` : 'Analyzing'}
          </div>
        </div>
      </div>

      {/* Overall Confidence Bar */}
      <div className="pt-2 border-t border-white/[0.04]">
        <ConfidenceScore
          score={analysis.confidence}
          label="Aggregate Model Confidence"
          size="md"
        />
      </div>
    </div>
  );
};
