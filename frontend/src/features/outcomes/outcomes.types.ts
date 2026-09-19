export interface AIOutcomeData {
  outcome: string;
  confidence: number;
  reasoning: string;
  analyzedAt: string;
}

export interface HumanOutcomeData {
  outcome: string;
  recordedBy: string;
  recordedAt: string;
  notes?: string;
}

export type OutcomeComparisonStatus = 'match' | 'different' | 'unavailable';

export interface OutcomeComparison {
  callId: string;
  leadName: string;
  company: string;
  employeeName: string;
  callDate: string;
  aiOutcome: AIOutcomeData | null;
  humanOutcome: HumanOutcomeData | null;
  status: OutcomeComparisonStatus;
  notes?: string;
}

export interface OutcomeMetrics {
  totalCompared: number;
  matchingCount: number;
  differentCount: number;
  agreementRate: number; // 0 - 100 percentage
}
