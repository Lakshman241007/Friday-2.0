import { AIOutcomeData, HumanOutcomeData, OutcomeComparison, OutcomeMetrics } from './outcomes.types';
import { aiAnalysisStore } from '../ai-analysis/ai-analysis.data';

export const outcomesApi = {
  async getAIOutcome(callId: string): Promise<AIOutcomeData | null> {
    await new Promise((r) => setTimeout(r, 60));
    const comparison = aiAnalysisStore.getComparison(callId);
    return comparison?.aiOutcome || null;
  },

  async getHumanOutcome(callId: string): Promise<HumanOutcomeData | null> {
    await new Promise((r) => setTimeout(r, 60));
    const comparison = aiAnalysisStore.getComparison(callId);
    return comparison?.humanOutcome || null;
  },

  async compareOutcomes(callId: string): Promise<OutcomeComparison | undefined> {
    await new Promise((r) => setTimeout(r, 100));
    return aiAnalysisStore.getComparison(callId);
  },

  async getAllComparisons(): Promise<OutcomeComparison[]> {
    await new Promise((r) => setTimeout(r, 100));
    return aiAnalysisStore.getAllComparisons();
  },

  async getOutcomeMetrics(): Promise<OutcomeMetrics> {
    await new Promise((r) => setTimeout(r, 80));
    return aiAnalysisStore.getMetrics();
  },
};
