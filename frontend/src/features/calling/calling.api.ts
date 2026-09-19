import { CallHistoryItem } from './calling.types';
import { phase4Store } from '../leads/leads.data';

export const callingApi = {
  async getCallHistory(): Promise<CallHistoryItem[]> {
    await new Promise((r) => setTimeout(r, 100));
    return phase4Store.getCallHistory();
  },

  async getCall(id: string): Promise<CallHistoryItem | undefined> {
    await new Promise((r) => setTimeout(r, 100));
    return phase4Store.getCallById(id);
  },

  async logCall(record: Omit<CallHistoryItem, 'id' | 'date'>): Promise<CallHistoryItem> {
    await new Promise((r) => setTimeout(r, 150));
    return phase4Store.addCallRecord(record);
  },
};
