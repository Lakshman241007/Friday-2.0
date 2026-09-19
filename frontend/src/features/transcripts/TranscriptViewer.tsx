import React, { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Transcript, TranscriptMessage } from './transcripts.types';
import { SpeakerMessage } from './SpeakerMessage';
import { TranscriptSearch } from './TranscriptSearch';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Copy,
  Check,
  Download,
  Search,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export interface TranscriptViewerProps {
  transcript?: Transcript | null;
  currentAudioTime?: number; // In seconds (from RecordingPlayer)
  onSeekAudio?: (timestampSeconds: number) => void;
  isLoading?: boolean;
  className?: string;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  currentAudioTime = 0,
  onSeekAudio,
  isLoading = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Identify matching message IDs
  const matchingMessageIds = useMemo(() => {
    if (!transcript || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return transcript.messages
      .filter((m) => m.text.toLowerCase().includes(q))
      .map((m) => m.id);
  }, [transcript, searchQuery]);

  // Reset match index when search changes
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchQuery]);

  // Scroll to current search match
  const scrollToMatch = (index: number) => {
    if (matchingMessageIds.length === 0) return;
    const targetId = matchingMessageIds[index];
    const elem = document.getElementById(`msg-${targetId}`);
    if (elem && messagesContainerRef.current) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNextMatch = () => {
    if (matchingMessageIds.length === 0) return;
    const next = (currentMatchIndex + 1) % matchingMessageIds.length;
    setCurrentMatchIndex(next);
    scrollToMatch(next);
  };

  const handlePrevMatch = () => {
    if (matchingMessageIds.length === 0) return;
    const prev = (currentMatchIndex - 1 + matchingMessageIds.length) % matchingMessageIds.length;
    setCurrentMatchIndex(prev);
    scrollToMatch(prev);
  };

  // Determine active speaker message matching the current audio timestamp
  const activeMessageId = useMemo(() => {
    if (!transcript || transcript.messages.length === 0) return null;
    const messages = transcript.messages;

    // Find message where timestamp <= currentAudioTime and next message timestamp > currentAudioTime
    for (let i = 0; i < messages.length; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      if (
        currentAudioTime >= current.timestampSeconds &&
        (!next || currentAudioTime < next.timestampSeconds)
      ) {
        return current.id;
      }
    }
    return null;
  }, [transcript, currentAudioTime]);

  const handleCopyTranscript = () => {
    if (!transcript) return;
    const formatted = transcript.messages
      .map((m) => `[${m.timestamp}] ${m.speaker} (${m.speakerType.toUpperCase()}):\n${m.text}\n`)
      .join('\n');

    navigator.clipboard.writeText(formatted);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    if (!transcript) return;
    const formatted = `FRIDAY TELEPHONY TRANSCRIPT\nSession ID: ${transcript.callId}\nParticipants: ${transcript.employeeName} (Representative) & ${transcript.leadName} (${transcript.company})\nLanguage: ${transcript.language}\nDuration: ${transcript.duration}\n----------------------------------------\n\n` +
      transcript.messages
        .map((m) => `[${m.timestamp}] ${m.speaker}:\n${m.text}\n`)
        .join('\n');

    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${transcript.callId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-white/10 bg-[#0c0c11]/80 p-6 space-y-4 animate-pulse', className)}>
        <div className="h-6 w-48 bg-white/10 rounded" />
        <div className="h-9 w-full bg-white/[0.04] rounded-lg" />
        <div className="space-y-3 pt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/[0.02] rounded-lg border border-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className={cn('rounded-xl border border-white/10 bg-[#0c0c11]/80 p-8', className)}>
        <EmptyState
          title="No Transcript Available"
          description="This call recording has not been transcribed yet or transcription was disabled."
          icon={<FileText className="w-8 h-8 text-slate-500" />}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs flex flex-col h-full overflow-hidden',
        className
      )}
    >
      {/* Top Header & Actions */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] space-y-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Verbatim Dialogue Transcript
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              ({transcript.messages.length} utterances)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyTranscript}
              className="h-7 text-xs px-2.5 text-slate-300 hover:text-white"
              title="Copy transcript text to clipboard"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1 text-slate-400" />
                  Copy Text
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTranscript}
              className="h-7 text-xs px-2.5 text-slate-300 hover:text-white"
              title="Download plaintext transcript file"
            >
              <Download className="w-3 h-3 mr-1 text-slate-400" />
              Export .TXT
            </Button>
          </div>
        </div>

        {/* Search Bar with result counter & next/prev navigation */}
        <TranscriptSearch
          query={searchQuery}
          onQueryChange={setSearchQuery}
          totalMatches={matchingMessageIds.length}
          currentMatchIndex={currentMatchIndex}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
          onClear={() => setSearchQuery('')}
        />
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 divide-y divide-white/[0.03] scroll-smooth"
        tabIndex={0}
        aria-label="Transcript messages stream"
      >
        {matchingMessageIds.length === 0 && searchQuery.trim() !== '' ? (
          <div className="py-12 text-center space-y-2">
            <Search className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">
              No occurrences of "{searchQuery}" found in this session transcript.
            </p>
          </div>
        ) : (
          transcript.messages.map((msg, idx) => {
            const isMatch = matchingMessageIds.includes(msg.id);
            const isCurrentFocus = matchingMessageIds[currentMatchIndex] === msg.id;
            const isActive = activeMessageId === msg.id;

            return (
              <SpeakerMessage
                key={msg.id}
                message={msg}
                isActive={isActive}
                searchQuery={searchQuery}
                isSearchMatch={isMatch}
                isCurrentSearchFocus={isCurrentFocus}
                onSelectTimestamp={onSeekAudio}
              />
            );
          })
        )}
      </div>

      {/* Footer Status */}
      <div className="px-5 py-2.5 bg-[#09090d] border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-2">
          <span>Speaker Diarization Active</span>
          <span>•</span>
          <span>Dual-Channel Audio Linked</span>
        </div>
        <span>Click any timestamp to seek</span>
      </div>
    </div>
  );
};
