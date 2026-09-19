import { AIAnalysis, AnalysisStatus, IntentAnalysis, SentimentAnalysis, Objection, Keyword, CallSummary, AIOutcome } from './ai-analysis.types';
import { aiAnalysisStore } from './ai-analysis.data';

export const aiAnalysisApi = {
  async getAnalysis(callId: string): Promise<AIAnalysis | undefined> {
    await new Promise((r) => setTimeout(r, 100));
    return aiAnalysisStore.getAnalysis(callId);
  },

  async getAllAnalyses(): Promise<AIAnalysis[]> {
    await new Promise((r) => setTimeout(r, 100));
    return aiAnalysisStore.getAllAnalyses();
  },

  async getAnalysisStatus(callId: string): Promise<AnalysisStatus | undefined> {
    await new Promise((r) => setTimeout(r, 60));
    const analysis = aiAnalysisStore.getAnalysis(callId);
    return analysis?.status;
  },

  async getIntent(callId: string): Promise<IntentAnalysis | undefined> {
    await new Promise((r) => setTimeout(r, 60));
    const analysis = aiAnalysisStore.getAnalysis(callId);
    return analysis?.intent;
  },

  async getSentiment(callId: string): Promise<SentimentAnalysis | undefined> {
    await new Promise((r) => setTimeout(r, 60));
    const analysis = aiAnalysisStore.getAnalysis(callId);
    return analysis?.sentiment;
  },

  async getObjections(callId: string): Promise<Objection[]> {
    await new Promise((r) => setTimeout(r, 60));
    const analysis = aiAnalysisStore.getAnalysis(callId);
    return analysis?.objections || [];
  },

  async getKeywords(callId: string): Promise<Keyword[]> {
    await new Promise((r) => setTimeout(r, 60));
    const analysis = aiAnalysisStore.getAnalysis(callId);
    return analysis?.keywords || [];
  },

  async getSummary(callId: string): Promise<CallSummary | undefined> {
    await new Promise((r) => setTimeout(r, 60));
    const analysis = aiAnalysisStore.getAnalysis(callId);
    return analysis?.summary;
  },

  async getOutcome(callId: string): Promise<AIOutcome | undefined> {
    await new Promise((r) => setTimeout(r, 60));
    const analysis = aiAnalysisStore.getAnalysis(callId);
    return analysis?.outcome;
  },
};
