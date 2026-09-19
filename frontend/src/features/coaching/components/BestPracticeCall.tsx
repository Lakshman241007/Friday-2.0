import React from 'react';
import { cn } from '@/lib/utils';
import { BestPracticeCall as BestPracticeCallType } from '../coaching.types';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  PhoneCall,
  FileText,
  Disc,
  Clock,
  Building2,
  ArrowUpRight,
  BookmarkCheck,
} from 'lucide-react';

export interface BestPracticeCallProps {
  calls: BestPracticeCallType[];
  className?: string;
  onNavigateToRecording?: (callId: string) => void;
  onNavigateToTranscript?: (callId: string) => void;
  onNavigateToAnalysis?: (callId: string) => void;
}

export const BestPracticeCall: React.FC<BestPracticeCallProps> = ({
  calls,
  className,
  onNavigateToRecording,
  onNavigateToTranscript,
  onNavigateToAnalysis,
}) => {
  if (calls.length === 0) {
    return (
      <div className={cn('p-5 rounded-xl border border-white/10 bg-[#0c0c11]/80 text-center text-slate-400 text-xs font-mono', className)}>
        No best-practice benchmark calls curated for this representative yet.
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Curated Benchmark & Exemplar Calls
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          Curated for study
        </span>
      </div>

      <div className="space-y-3">
        {calls.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-3"
          >
            {/* Call Header */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {item.leadName}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    #{item.callId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>{item.company}</span>
                  </span>
                  <span>•</span>
                  <span>Agent: {item.employeeName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {item.outcome}
                </span>
                <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{item.duration}</span>
                </span>
              </div>
            </div>

            {/* Relevant Strength Highlight */}
            <div className="p-2.5 rounded-lg bg-sky-500/[0.04] border border-sky-500/15 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Exemplar Competency: {item.relevantStrength}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.takeaway}
              </p>
            </div>

            {/* Deep Links to Recordings, Transcripts, AI Analysis */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
              <span className="text-[10px] font-mono text-slate-500">
                Logged on {item.date}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToRecording?.(item.callId)}
                  className="h-6 px-2 text-[11px] text-slate-300 hover:text-white"
                  title="Listen to Dual-Channel Audio"
                >
                  <Disc className="w-3 h-3 mr-1 text-slate-400" />
                  <span>Audio</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToTranscript?.(item.callId)}
                  className="h-6 px-2 text-[11px] text-slate-300 hover:text-white"
                  title="Read Speaker Diarization Transcript"
                >
                  <FileText className="w-3 h-3 mr-1 text-slate-400" />
                  <span>Transcript</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToAnalysis?.(item.callId)}
                  className="h-6 px-2 text-[11px] text-slate-300 hover:text-white"
                  title="Review AI Intent & Objections"
                >
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                  <span>AI Analysis</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
