import React from 'react';
import { cn } from '@/lib/utils';
import { CoachingFeedbackItem } from '../coaching.types';
import { Button } from '@/components/ui/Button';
import { MessageSquare, PhoneCall, Sparkles, UserCheck, ArrowRight } from 'lucide-react';

export interface CoachingFeedbackProps {
  feedback: CoachingFeedbackItem[];
  onNavigateToCall?: (callId: string) => void;
  className?: string;
}

export const CoachingFeedback: React.FC<CoachingFeedbackProps> = ({
  feedback,
  onNavigateToCall,
  className,
}) => {
  if (feedback.length === 0) {
    return (
      <div className={cn('p-5 rounded-xl border border-white/10 bg-[#0c0c11]/80 text-center text-slate-400 text-xs font-mono', className)}>
        No qualitative supervisor feedback logged for this observation window.
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {feedback.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-3"
        >
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-200">
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">
                  {item.author} <span className="text-slate-500 font-normal">({item.authorRole})</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">{item.timestamp}</div>
              </div>
            </div>

            {item.callId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToCall?.(item.callId!)}
                className="h-6 px-2 text-[11px] font-mono text-slate-400 hover:text-white"
              >
                <PhoneCall className="w-3 h-3 mr-1" />
                <span>Call #{item.callId}</span>
              </Button>
            )}
          </div>

          <div className="text-xs text-slate-200 leading-relaxed font-sans">
            "{item.statement}"
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500">
                Observation Evidence
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {item.evidenceReference}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-500/[0.04] border border-indigo-500/15 space-y-1">
              <span className="text-[10px] font-mono uppercase text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Actionable Recommendation</span>
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {item.actionableRecommendation}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
