import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TranscriptViewer } from '../TranscriptViewer';
import { recordingsStore } from '@/features/recordings/recordings.data';
import { Transcript } from '../transcripts.types';
import { APP_NAME } from '@/lib/constants';
import { FileText, Play, Building2, User, Clock, ChevronRight, Disc } from 'lucide-react';

export const TranscriptsPage: React.FC = () => {
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string>('tr-501');
  const [activeTranscript, setActiveTranscript] = useState<Transcript | null>(() =>
    recordingsStore.getTranscriptById('tr-501') || null
  );

  const transcriptsList = [
    recordingsStore.getTranscriptById('tr-501'),
    recordingsStore.getTranscriptById('tr-502'),
    recordingsStore.getTranscriptById('tr-503'),
  ].filter(Boolean) as Transcript[];

  const handleSelectTranscript = (t: Transcript) => {
    setSelectedTranscriptId(t.id);
    setActiveTranscript(t);
  };

  const handleOpenInRecordingPlayer = (recordingId: string) => {
    window.location.hash = `/recordings?recordingId=${recordingId}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversational Transcripts"
        description="Searchable verbatim transcripts with speaker diarization and instant audio synchronization."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Intelligence' },
          { label: 'Transcripts' },
        ]}
        actions={
          activeTranscript && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenInRecordingPlayer(activeTranscript.recordingId)}
              className="h-8 text-xs text-slate-300 hover:text-white"
            >
              <Disc className="w-3.5 h-3.5 mr-1.5" />
              Open in Audio Player
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Transcript Index (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Transcribed Sessions ({transcriptsList.length})
            </span>
          </div>

          <div className="space-y-2">
            {transcriptsList.map((item) => {
              const isSelected = item.id === selectedTranscriptId;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectTranscript(item)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-white/[0.08] border-white/30 text-white shadow-xs'
                      : 'bg-[#0c0c11]/80 border-white/[0.06] hover:bg-white/[0.03] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-slate-100">
                      {item.leadName}
                    </span>
                    <span className="font-mono text-emerald-400 text-[11px]">
                      {item.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-2">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>{item.company}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">Call #{item.callId}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[11px] text-slate-500">
                    <span className="truncate">Agent: {item.employeeName}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Verbatim Transcript Viewer (8 cols) */}
        <div className="lg:col-span-8 h-[720px] flex flex-col">
          <TranscriptViewer
            transcript={activeTranscript}
            onSeekAudio={(secs) => {
              if (activeTranscript) {
                window.location.hash = `/recordings?recordingId=${activeTranscript.recordingId}`;
              }
            }}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};
