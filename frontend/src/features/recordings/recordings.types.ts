export type RecordingStatus =
  | 'available'
  | 'processing'
  | 'failed'
  | 'unavailable';

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
}

export interface RecordingMetadata {
  callId: string;
  leadId: string;
  leadName: string;
  company: string;
  employeeId: string;
  employeeName: string;
  callDate: string;
  startTime: string;
  duration: string;
  durationSeconds: number;
  direction: 'outbound' | 'inbound';
  status: RecordingStatus;
  callOutcome: string;
  fileSize?: string;
  audioFormat?: string;
  channels?: number;
  bitrate?: string;
  sampleRate?: string;
}

export interface Recording {
  id: string;
  callId: string;
  leadId: string;
  leadName: string;
  company: string;
  employeeId: string;
  employeeName: string;
  date: string;
  duration: string;
  durationSeconds: number;
  status: RecordingStatus;
  audioUrl?: string;
  metadata: RecordingMetadata;
  transcriptId?: string;
}
