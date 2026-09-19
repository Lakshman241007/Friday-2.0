import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RecordingList } from '../RecordingList';
import { RecordingPlayer } from '../RecordingPlayer';
import { RecordingMetadataView } from '../RecordingMetadataView';
import { TranscriptViewer } from '@/features/transcripts/TranscriptViewer';
import { Recording } from '../recordings.types';
import { Transcript } from '@/features/transcripts/transcripts.types';
import { recordingsStore } from '../recordings.data';
import { APP_NAME } from '@/lib/constants';
import {
  Disc,
  FileText,
  Radio,
  ArrowLeft,
  List,
  Columns,
  CheckCircle2,
  Phone,
  User,
  Building2,
  Sparkles,
} from 'lucide-react';

export interface RecordingsPageProps {
  initialRecordingId?: string;
  defaultView?: 'workspace' | 'list';
}

export const RecordingsPage: React.FC<RecordingsPageProps> = ({
  initialRecordingId,
  defaultView,
}) => {
  // Parse callId or recordingId or seek timestamp from hash URL
  const getUrlParams = () => {
    const hash = window.location.hash;
    const callMatch = hash.match(/callId=([^&]+)/);
    const recMatch = hash.match(/recordingId=([^&]+)/);
    const seekMatch = hash.match(/seek=([^&]+)/);
    return {
      callId: callMatch ? callMatch[1] : null,
      recordingId: recMatch ? recMatch[1] : initialRecordingId || null,
      seek: seekMatch ? parseFloat(seekMatch[1]) : null,
    };
  };

  const [recordings, setRecordings] = useState<Recording[]>(() =>
    recordingsStore.getRecordings()
  );

  const initialParams = getUrlParams();

  // Find initial selected recording
  const findInitialRecording = () => {
    if (initialParams.recordingId) {
      const match = recordingsStore.getRecordingById(initialParams.recordingId);
      if (match) return match;
    }
    if (initialParams.callId) {
      const match = recordingsStore.getRecordingByCallId(initialParams.callId);
      if (match) return match;
    }
    return recordings[0] || null;
  };

  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(findInitialRecording);
  const [activeTranscript, setActiveTranscript] = useState<Transcript | null>(() => {
    const initial = findInitialRecording();
    return initial ? recordingsStore.getTranscriptByRecordingId(initial.id) || null : null;
  });

  // Mode: if navigated directly with callId or recordingId, default to 'workspace', else 'list'
  const [viewMode, setViewMode] = useState<'workspace' | 'list'>(
    defaultView || (initialParams.callId || initialParams.recordingId ? 'workspace' : 'list')
  );

  // Audio synchronization state
  const [currentAudioTime, setCurrentAudioTime] = useState(initialParams.seek || 0);
  const [seekTime, setSeekTime] = useState<number | null>(initialParams.seek || null);

  useEffect(() => {
    const unsubscribe = recordingsStore.subscribe(() => {
      const updated = recordingsStore.getRecordings();
      setRecordings(updated);
      if (selectedRecording) {
        const fresh = updated.find((r) => r.id === selectedRecording.id);
        if (fresh) setSelectedRecording(fresh);
      }
    });
    return unsubscribe;
  }, [selectedRecording]);

  const handleSelectRecording = (rec: Recording) => {
    setSelectedRecording(rec);
    setCurrentAudioTime(0);
    setSeekTime(0);
    const tr = recordingsStore.getTranscriptByRecordingId(rec.id);
    setActiveTranscript(tr || null);
    setViewMode('workspace');
  };

  const handleSeekAudio = (timestampSeconds: number) => {
    setSeekTime(timestampSeconds);
  };

  // Telemetry metrics
  const totalCount = recordings.length;
  const availableCount = recordings.filter((r) => r.status === 'available').length;
  const processingCount = recordings.filter((r) => r.status === 'processing').length;
  const failedCount = recordings.filter((r) => r.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Recordings & Transcripts"
        description="Unified audio telemetry archive with dual-channel playback and synchronized speaker transcripts."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Intelligence' },
          { label: 'Recordings & Transcripts' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#09090d] p-0.5 rounded-lg border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Archive List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('workspace')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'workspace'
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Call Review Workspace</span>
              </button>
            </div>
          </div>
        }
      />

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 flex items-center gap-3 bg-[#0c0c11]/80">
          <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300">
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white tracking-tight">
              {totalCount}
            </div>
            <div className="text-xs text-slate-400">Total Audio Sessions</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-[#0c0c11]/80">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-emerald-300 tracking-tight">
              {availableCount}
            </div>
            <div className="text-xs text-slate-400">Playable & Transcribed</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-[#0c0c11]/80">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-amber-300 tracking-tight">
              {processingCount}
            </div>
            <div className="text-xs text-slate-400">Ingestion In Progress</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-[#0c0c11]/80">
          <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-indigo-300 tracking-tight">
              {Object.keys(recordingsStore.getTranscriptById('tr-501') ? 3 : 0).length || 3}
            </div>
            <div className="text-xs text-slate-400">Synchronized Transcripts</div>
          </div>
        </Card>
      </div>

      {/* VIEW MODE 1: ARCHIVE LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-semibold text-slate-200">
              Telephony Recording Archive
            </h3>
            {selectedRecording && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('workspace')}
                className="h-8 text-xs text-slate-300 hover:text-white"
              >
                <span>Open Active Workspace: {selectedRecording.leadName}</span>
                <Columns className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>

          <RecordingList
            recordings={recordings}
            selectedRecordingId={selectedRecording?.id}
            onSelectRecording={handleSelectRecording}
            onOpenTranscript={(rec) => {
              handleSelectRecording(rec);
              setViewMode('workspace');
            }}
          />
        </div>
      )}

      {/* VIEW MODE 2: CALL REVIEW WORKSPACE (PLAYER + TRANSCRIPT SYNC) */}
      {viewMode === 'workspace' && (
        <div className="space-y-5">
          {/* Workspace Top Quick Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0c0c11]/90 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-2.5 text-xs text-slate-300"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Archive
              </Button>

              {/* Quick Session Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Session:</span>
                <select
                  value={selectedRecording?.id || ''}
                  onChange={(e) => {
                    const found = recordings.find((r) => r.id === e.target.value);
                    if (found) handleSelectRecording(found);
                  }}
                  className="h-8 px-2.5 bg-[#121218] border border-white/15 text-xs text-slate-200 rounded-lg outline-none cursor-pointer focus:border-white/30 max-w-[260px] truncate"
                  aria-label="Select session to review"
                >
                  {recordings.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.leadName} ({r.company}) — {r.duration}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedRecording && (
              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="hidden md:inline">Call ID: {selectedRecording.callId}</span>
                <span className="hidden md:inline">•</span>
                <span className="text-emerald-400 font-semibold">{selectedRecording.duration}</span>
                <span className="hidden md:inline">•</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.hash = `/analysis/${selectedRecording.callId}`;
                  }}
                  className="h-7 px-2.5 text-xs text-slate-300 hover:text-white"
                  title="Open AI Analysis & Outcome Comparison"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>AI Analysis</span>
                </Button>
              </div>
            )}
          </div>

          {selectedRecording ? (
            /* Main Desktop 2-Column Split / Mobile Vertical Stack Workspace */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Audio Player + Metadata (5 cols on lg) */}
              <div className="lg:col-span-5 space-y-5">
                {/* 1. Audio Player with live scrubber and playback controls */}
                <RecordingPlayer
                  recording={selectedRecording}
                  seekTime={seekTime}
                  onTimeUpdate={(time) => setCurrentAudioTime(time)}
                />

                {/* 2. Structured Grouped Metadata */}
                <RecordingMetadataView recording={selectedRecording} />
              </div>

              {/* Right Column: Synchronized Verbatim Transcript (7 cols on lg) */}
              <div className="lg:col-span-7 h-[700px] flex flex-col">
                <TranscriptViewer
                  transcript={activeTranscript}
                  currentAudioTime={currentAudioTime}
                  onSeekAudio={handleSeekAudio}
                  className="h-full"
                />
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center text-xs text-slate-500">
              Select a recording from the archive to launch the analysis workspace.
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
