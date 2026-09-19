import { Recording, RecordingStatus } from './recordings.types';
import { recordingsStore } from './recordings.data';

export const recordingsApi = {
  async getRecordings(): Promise<Recording[]> {
    await new Promise((r) => setTimeout(r, 120));
    return recordingsStore.getRecordings();
  },

  async getRecording(id: string): Promise<Recording | undefined> {
    await new Promise((r) => setTimeout(r, 100));
    return recordingsStore.getRecordingById(id);
  },

  async getRecordingByCall(callId: string): Promise<Recording | undefined> {
    await new Promise((r) => setTimeout(r, 100));
    return recordingsStore.getRecordingByCallId(callId);
  },

  async getRecordingStatus(id: string): Promise<RecordingStatus | undefined> {
    await new Promise((r) => setTimeout(r, 60));
    const rec = recordingsStore.getRecordingById(id);
    return rec?.status;
  },

  async getRecordingUrl(id: string): Promise<string | undefined> {
    await new Promise((r) => setTimeout(r, 80));
    const rec = recordingsStore.getRecordingById(id);
    return rec?.audioUrl;
  },
};
