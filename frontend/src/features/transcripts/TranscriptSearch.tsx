import React from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

export interface TranscriptSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  totalMatches: number;
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onClear: () => void;
  className?: string;
}

export const TranscriptSearch: React.FC<TranscriptSearchProps> = ({
  query,
  onQueryChange,
  totalMatches,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
  onClear,
  className,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrevMatch();
      } else {
        onNextMatch();
      }
    } else if (e.key === 'Escape') {
      onClear();
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-center h-9 w-full bg-[#0a0a0e] border border-white/10 rounded-lg px-2.5 transition-colors focus-within:border-white/30',
        className
      )}
      role="search"
    >
      <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" aria-hidden="true" />

      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search dialogue phrases, objections, keywords..."
        className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none"
        aria-label="Search within transcript"
      />

      {query && (
        <div className="flex items-center gap-1 shrink-0 ml-1.5 pl-2 border-l border-white/10">
          {/* Match Counter */}
          <span className="text-[11px] font-mono text-slate-400 select-none mr-1">
            {totalMatches > 0
              ? `${currentMatchIndex + 1}/${totalMatches}`
              : '0 matches'}
          </span>

          {/* Previous Match */}
          <button
            type="button"
            onClick={onPrevMatch}
            disabled={totalMatches === 0}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous match (Shift+Enter)"
            aria-label="Previous search match"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Next Match */}
          <button
            type="button"
            onClick={onNextMatch}
            disabled={totalMatches === 0}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next match (Enter)"
            aria-label="Next search match"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Clear Search */}
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-white/[0.08] transition-colors"
            title="Clear search (Esc)"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
