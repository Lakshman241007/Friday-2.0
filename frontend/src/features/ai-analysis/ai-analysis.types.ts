export type AnalysisStatus =
  | 'completed'
  | 'processing'
  | 'failed'
  | 'unavailable';

export type IntentCategory =
  | 'Product Inquiry'
  | 'Pricing Inquiry'
  | 'Purchase Intent'
  | 'Support Request'
  | 'Complaint'
  | 'Renewal'
  | 'Cancellation'
  | 'Information Request'
  | 'Follow-up'
  | 'Other';

export interface IntentAnalysis {
  primaryIntent: IntentCategory;
  secondaryIntents: IntentCategory[];
  confidence: number; // 0 - 100
}

export type SentimentType = 'Positive' | 'Neutral' | 'Negative' | 'Mixed';

export interface SentimentProgressionSegment {
  stage: 'Start' | 'Middle' | 'End';
  sentiment: SentimentType;
  timestamp?: string;
  timestampSeconds?: number;
}

export interface SentimentAnalysis {
  overall: SentimentType;
  confidence: number; // 0 - 100
  progression: SentimentProgressionSegment[];
  summary: string;
}

export type ObjectionCategory =
  | 'Pricing'
  | 'Features'
  | 'Timing'
  | 'Competitor'
  | 'Trust'
  | 'Implementation'
  | 'Contract'
  | 'Need'
  | 'Other';

export interface Objection {
  id: string;
  category: ObjectionCategory;
  explanation: string;
  confidence: number; // 0 - 100
  timestamp?: string;
  timestampSeconds?: number;
}

export interface Keyword {
  id: string;
  keyword: string;
  frequency: number;
  relevance: 'High' | 'Medium' | 'Low';
  timestamp?: string;
  timestampSeconds?: number;
}

export interface CallSummary {
  overview: string;
  customerInterest: string;
  mainRequirement: string;
  mainConcern: string;
  nextStep: string;
}

export type AIOutcomeType =
  | 'Converted'
  | 'Qualified'
  | 'Follow-up Required'
  | 'Interested'
  | 'Not Interested'
  | 'Callback Requested'
  | 'No Response'
  | 'Lost'
  | 'Unknown';

export interface AIOutcome {
  outcome: AIOutcomeType;
  confidence: number; // 0 - 100
  reasoning: string;
  analyzedAt: string;
}

export interface AIAnalysis {
  id: string;
  callId: string;
  leadId: string;
  leadName: string;
  company: string;
  employeeId: string;
  employeeName: string;
  callDate: string;
  duration: string;
  direction: 'outbound' | 'inbound';
  status: AnalysisStatus;
  intent?: IntentAnalysis;
  sentiment?: SentimentAnalysis;
  objections: Objection[];
  keywords: Keyword[];
  summary?: CallSummary;
  outcome?: AIOutcome;
  confidence: number; // 0 - 100
  analyzedAt?: string;
  errorMessage?: string;
}
