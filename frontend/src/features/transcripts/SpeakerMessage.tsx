import React from 'react';
import { cn } from '@/lib/utils';
import { TranscriptMessage, SpeakerType } from './transcripts.types';
import { User, Headphones, Clock, HelpCircle } from 'lucide-react';

export interface SpeakerMessageProps {
  message: TranscriptMessage;
  isActive?: boolean;
  searchQuery?: string;
  isSearchMatch?: boolean;
  isCurrentSearchFocus?: boolean;
  onSelectTimestamp?: (timestampSeconds: number) => void;
  className?: string;
}

export const SpeakerMessage: React.FC<SpeakerMessageProps> = ({
  message,
  isActive = false,
  searchQuery = '',
  isSearchMatch = false,
  isCurrentSearchFocus = false,
  onSelectTimestamp,
  className,
}) => {
  const isEmployee = message.speakerType === 'employee';
  const isLead = message.speakerType === 'lead';

  // Highlight query text safely
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={i}
          className={cn(
            'rounded px-1 py-0.5 transition-colors',
            isCurrentSearchFocus
              ? 'bg-amber-400 text-zinc-950 font-medium'
              : 'bg-white/20 text-white font-medium'
          )}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      id={`msg-${message.id}`}
      onClick={() => onSelectTimestamp?.(message.timestampSeconds)}
      className={cn(
        'group relative py-3.5 px-4 rounded-xl transition-all duration-150 cursor-pointer border',
        isActive
          ? 'bg-white/[0.06] border-white/25 shadow-xs'
          : isCurrentSearchFocus
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-transparent border-transparent hover:bg-white/[0.025] hover:border-white/[0.06]',
        className
      )}
      role="article"
      aria-current={isActive ? 'true' : undefined}
    >
      {/* Top Meta Line: Speaker identifier & Timestamp */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          {/* Subtle Speaker Tag */}
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border',
              isEmployee
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                : isLead
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-white/5 text-slate-400 border-white/10'
            )}
          >
            {isEmployee ? (
              <Headphones className="w-3 h-3 text-indigo-400" />
            ) : isLead ? (
              <User className="w-3 h-3 text-emerald-400" />
            ) : (
              <HelpCircle className="w-3 h-3 text-slate-400" />
            )}
            <span>{message.speaker}</span>
          </span>

          {/* Active Speaking Indicator */}
          {isActive && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Speaking</span>
            </span>
          )}
        </div>

        {/* Timestamp button (click to seek audio) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectTimestamp?.(message.timestampSeconds);
          }}
          className={cn(
            'inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border transition-colors',
            isActive
              ? 'bg-white/10 text-white border-white/30 font-semibold'
              : 'text-slate-500 hover:text-slate-200 border-transparent hover:border-white/10 hover:bg-white/5'
          )}
          title={`Seek audio to ${message.timestamp}`}
          aria-label={`Jump to audio timestamp ${message.timestamp}`}
        >
          <Clock className="w-3 h-3" />
          <span>{message.timestamp}</span>
        </button>
      </div>

      {/* Message Text with comfortable line-height and max-w */}
      <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed max-w-prose">
        {renderHighlightedText(message.text, searchQuery)}
      </p>
    </div>
  );
};
