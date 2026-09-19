import { Transcript, TranscriptSearchResult } from './transcripts.types';
import { recordingsStore } from '../recordings/recordings.data';

export const transcriptsApi = {
  async getTranscript(id: string): Promise<Transcript | undefined> {
    await new Promise((r) => setTimeout(r, 100));
    return recordingsStore.getTranscriptById(id);
  },

  async getTranscriptByRecording(recordingId: string): Promise<Transcript | undefined> {
    await new Promise((r) => setTimeout(r, 100));
    return recordingsStore.getTranscriptByRecordingId(recordingId);
  },

  async getTranscriptByCall(callId: string): Promise<Transcript | undefined> {
    await new Promise((r) => setTimeout(r, 100));
    return recordingsStore.getTranscriptByCallId(callId);
  },

  async searchTranscript(transcriptId: string, query: string): Promise<TranscriptSearchResult[]> {
    await new Promise((r) => setTimeout(r, 60));
    const transcript = recordingsStore.getTranscriptById(transcriptId);
    if (!transcript || !query.trim()) return [];

    const normalized = query.toLowerCase();
    const results: TranscriptSearchResult[] = [];

    transcript.messages.forEach((msg, idx) => {
      if (msg.text.toLowerCase().includes(normalized)) {
        results.push({
          messageId: msg.id,
          matchIndex: idx,
          snippet: msg.text,
        });
      }
    });

    return results;
  },
};
