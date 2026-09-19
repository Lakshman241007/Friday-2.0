export type SpeakerType = 'employee' | 'lead' | 'unknown';

export interface TranscriptMessage {
  id: string;
  speaker: string;
  speakerType: SpeakerType;
  timestamp: string; // e.g. "00:04"
  timestampSeconds: number; // e.g. 4
  text: string;
}

export interface Transcript {
  id: string;
  recordingId: string;
  callId: string;
  leadName: string;
  employeeName: string;
  company: string;
  language: string;
  duration: string;
  messages: TranscriptMessage[];
}

export interface TranscriptSearchResult {
  messageId: string;
  matchIndex: number;
  snippet: string;
}
