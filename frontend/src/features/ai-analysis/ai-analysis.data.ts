import { AIAnalysis } from './ai-analysis.types';
import { OutcomeComparison, OutcomeMetrics } from '../outcomes/outcomes.types';

export const INITIAL_AI_ANALYSIS: Record<string, AIAnalysis> = {
  'call-901': {
    id: 'ana-901',
    callId: 'call-901',
    leadId: 'lead-101',
    leadName: 'Elena Rostova',
    company: 'Apex Robotics',
    employeeId: 'emp-1',
    employeeName: 'Sarah Jenkins',
    callDate: 'Sep 18, 2026',
    duration: '04:18',
    direction: 'outbound',
    status: 'completed',
    intent: {
      primaryIntent: 'Purchase Intent',
      secondaryIntents: ['Product Inquiry', 'Pricing Inquiry'],
      confidence: 91,
    },
    sentiment: {
      overall: 'Positive',
      confidence: 86,
      summary: 'Prospect showed high engagement, moving from initial cautious inquiry to proactive scheduling of an executive technical pilot.',
      progression: [
        { stage: 'Start', sentiment: 'Neutral', timestamp: '00:11', timestampSeconds: 11 },
        { stage: 'Middle', sentiment: 'Mixed', timestamp: '02:05', timestampSeconds: 125 },
        { stage: 'End', sentiment: 'Positive', timestamp: '03:40', timestampSeconds: 220 },
      ],
    },
    objections: [
      {
        id: 'obj-101',
        category: 'Trust',
        explanation: 'Customer raised regulatory compliance questions regarding German industrial privacy and GDPR data residency.',
        confidence: 89,
        timestamp: '02:05',
        timestampSeconds: 125,
      },
      {
        id: 'obj-102',
        category: 'Implementation',
        explanation: 'Noted friction with current CRM fragmentation and questioned ease of internal ERP webhook synchronization.',
        confidence: 84,
        timestamp: '00:41',
        timestampSeconds: 41,
      },
    ],
    keywords: [
      { id: 'kw-1', keyword: 'ERP Integration', frequency: 3, relevance: 'High', timestamp: '00:24', timestampSeconds: 24 },
      { id: 'kw-2', keyword: 'Dual-Channel Audio', frequency: 2, relevance: 'High', timestamp: '01:02', timestampSeconds: 62 },
      { id: 'kw-3', keyword: 'GDPR / SOC2', frequency: 2, relevance: 'High', timestamp: '02:05', timestampSeconds: 125 },
      { id: 'kw-4', keyword: 'Executive Pilot', frequency: 1, relevance: 'Medium', timestamp: '02:49', timestampSeconds: 169 },
      { id: 'kw-5', keyword: 'Munich Facility', frequency: 1, relevance: 'Low', timestamp: '00:11', timestampSeconds: 11 },
    ],
    summary: {
      overview: 'Elena Rostova confirmed Apex Robotics is scaling its Munich automation facility and requires reliable telephony telemetry to replace manual CRM summaries. Sarah presented FRIDAY dual-channel transcription and addressed European GDPR compliance concerns.',
      customerInterest: 'Real-time speaker diarization and automated ERP audio synchronization.',
      mainRequirement: 'SOC2/GDPR compliance dossier with customer-managed encryption keys.',
      mainConcern: 'Data privacy and long-term retention safeguards for EU clients.',
      nextStep: 'Executive pilot session scheduled for next Tuesday at 10:00 AM CET with VP of Engineering.',
    },
    outcome: {
      outcome: 'Follow-up Required',
      confidence: 88,
      reasoning: 'Strong commercial and technical intent demonstrated; deal progression relies on delivery of the compliance dossier prior to the scheduled Tuesday pilot.',
      analyzedAt: '18 Sep 2026, 16:50 UTC',
    },
    confidence: 88,
    analyzedAt: '18 Sep 2026, 16:50 UTC',
  },

  'call-902': {
    id: 'ana-902',
    callId: 'call-902',
    leadId: 'lead-102',
    leadName: 'Marcus Vance',
    company: 'Vance Dynamics',
    employeeId: 'emp-2',
    employeeName: 'David Kim',
    callDate: 'Sep 18, 2026',
    duration: '03:45',
    direction: 'outbound',
    status: 'completed',
    intent: {
      primaryIntent: 'Information Request',
      secondaryIntents: ['Follow-up', 'Pricing Inquiry'],
      confidence: 87,
    },
    sentiment: {
      overall: 'Neutral',
      confidence: 81,
      summary: 'Professional and guarded dialogue focused on legal requirements and retention schedules. Shifted favorably once addendum terms were offered.',
      progression: [
        { stage: 'Start', sentiment: 'Neutral', timestamp: '00:15', timestampSeconds: 15 },
        { stage: 'Middle', sentiment: 'Neutral', timestamp: '01:05', timestampSeconds: 65 },
        { stage: 'End', sentiment: 'Positive', timestamp: '02:15', timestampSeconds: 135 },
      ],
    },
    objections: [
      {
        id: 'obj-201',
        category: 'Contract',
        explanation: 'Legal team had reservations regarding standard audio retention schedules and required custom contractual addenda.',
        confidence: 92,
        timestamp: '00:15',
        timestampSeconds: 15,
      },
      {
        id: 'obj-202',
        category: 'Timing',
        explanation: 'Agreement execution is gated until legal clears the customized retention addendum.',
        confidence: 79,
        timestamp: '02:15',
        timestampSeconds: 135,
      },
    ],
    keywords: [
      { id: 'kw-201', keyword: 'Audio Retention', frequency: 4, relevance: 'High', timestamp: '00:35', timestampSeconds: 35 },
      { id: 'kw-202', keyword: 'Cryptographic Purging', frequency: 2, relevance: 'High', timestamp: '00:35', timestampSeconds: 35 },
      { id: 'kw-203', keyword: 'Enterprise Agreement', frequency: 2, relevance: 'Medium', timestamp: '02:15', timestampSeconds: 135 },
      { id: 'kw-204', keyword: 'Latency Benchmarks', frequency: 1, relevance: 'Low', timestamp: '00:15', timestampSeconds: 15 },
    ],
    summary: {
      overview: 'Marcus Vance confirmed interest in FRIDAY enterprise telephony following latency tests. The sole remaining hurdle is legal approval for custom cryptographic retention schedules.',
      customerInterest: 'High-throughput low-latency audio transmission.',
      mainRequirement: '30-day to 7-year customizable retention schedule with automated purging.',
      mainConcern: 'Legal liability over unpurged voice payloads.',
      nextStep: 'David to issue contract addendum from enterprise desk by close of business today.',
    },
    outcome: {
      outcome: 'Interested',
      confidence: 82,
      reasoning: 'Customer confirmed intent to sign agreement once legal clears the retention addendum provided by end of day.',
      analyzedAt: '18 Sep 2026, 15:35 UTC',
    },
    confidence: 82,
    analyzedAt: '18 Sep 2026, 15:35 UTC',
  },

  'call-903': {
    id: 'ana-903',
    callId: 'call-903',
    leadId: 'lead-103',
    leadName: 'Sofia Chen',
    company: 'Quantum Health',
    employeeId: 'emp-3',
    employeeName: 'Alex Rivera',
    callDate: 'Sep 18, 2026',
    duration: '05:32',
    direction: 'outbound',
    status: 'completed',
    intent: {
      primaryIntent: 'Purchase Intent',
      secondaryIntents: ['Product Inquiry'],
      confidence: 96,
    },
    sentiment: {
      overall: 'Positive',
      confidence: 94,
      summary: 'Enthusiastic and decisive. Customer arrived having already secured formal board approval for clinical rollout.',
      progression: [
        { stage: 'Start', sentiment: 'Positive', timestamp: '00:18', timestampSeconds: 18 },
        { stage: 'Middle', sentiment: 'Positive', timestamp: '01:12', timestampSeconds: 72 },
        { stage: 'End', sentiment: 'Positive', timestamp: '02:30', timestampSeconds: 150 },
      ],
    },
    objections: [
      {
        id: 'obj-301',
        category: 'Features',
        explanation: 'Integration team requires webhook specifications and sandbox keys ready prior to Monday morning setup.',
        confidence: 81,
        timestamp: '01:12',
        timestampSeconds: 72,
      },
    ],
    keywords: [
      { id: 'kw-301', keyword: 'Board Approval', frequency: 2, relevance: 'High', timestamp: '00:18', timestampSeconds: 18 },
      { id: 'kw-302', keyword: 'HIPAA Encryption', frequency: 2, relevance: 'High', timestamp: '00:40', timestampSeconds: 40 },
      { id: 'kw-303', keyword: 'Webhook Endpoints', frequency: 2, relevance: 'Medium', timestamp: '01:12', timestampSeconds: 72 },
      { id: 'kw-304', keyword: 'Clinical Staff', frequency: 1, relevance: 'Low', timestamp: '02:30', timestampSeconds: 150 },
    ],
    summary: {
      overview: 'Dr. Sofia Chen reported that the Quantum Health board formally authorized pilot deployment across their clinical network. Alex confirmed HIPAA sandbox provisioning and agreed on Wednesday onboarding.',
      customerInterest: 'Productivity gains for healthcare providers and automated clinical transcription.',
      mainRequirement: 'Webhook documentation and sandbox API keys delivered by Monday morning.',
      mainConcern: 'Smooth technical onboarding for hospital staff.',
      nextStep: 'Onboarding session locked for Wednesday; sandbox credentials to be dispatched today.',
    },
    outcome: {
      outcome: 'Converted',
      confidence: 95,
      reasoning: 'Board authorization formally secured, contract agreed, and onboarding date explicitly locked in.',
      analyzedAt: '18 Sep 2026, 14:22 UTC',
    },
    confidence: 95,
    analyzedAt: '18 Sep 2026, 14:22 UTC',
  },

  'call-904': {
    id: 'ana-904',
    callId: 'call-904',
    leadId: 'lead-104',
    leadName: 'David Thorne',
    company: 'Thorne Logistics',
    employeeId: 'emp-1',
    employeeName: 'Sarah Jenkins',
    callDate: 'Sep 18, 2026',
    duration: '01:50',
    direction: 'outbound',
    status: 'processing',
    objections: [],
    keywords: [],
    confidence: 0,
  },

  'call-905': {
    id: 'ana-905',
    callId: 'call-905',
    leadId: 'lead-105',
    leadName: 'Amara Okafor',
    company: 'Solaris Fintech',
    employeeId: 'emp-2',
    employeeName: 'David Kim',
    callDate: 'Sep 17, 2026',
    duration: '00:45',
    direction: 'outbound',
    status: 'failed',
    objections: [],
    keywords: [],
    confidence: 0,
    errorMessage: 'Session audio terminated prematurely; corrupt SIP payload prevented transcription and semantic parsing.',
  },

  'call-906': {
    id: 'ana-906',
    callId: 'call-906',
    leadId: 'lead-106',
    leadName: 'Liam O\'Connor',
    company: 'Cascade Retail',
    employeeId: 'emp-4',
    employeeName: 'Emily Taylor',
    callDate: 'Sep 17, 2026',
    duration: '02:10',
    direction: 'outbound',
    status: 'unavailable',
    objections: [],
    keywords: [],
    confidence: 0,
    errorMessage: 'Audio recording and AI intelligence was disabled for this call session per customer privacy opt-out.',
  },
};

export const INITIAL_OUTCOME_COMPARISONS: Record<string, OutcomeComparison> = {
  'call-901': {
    callId: 'call-901',
    leadName: 'Elena Rostova',
    company: 'Apex Robotics',
    employeeName: 'Sarah Jenkins',
    callDate: 'Sep 18, 2026',
    aiOutcome: {
      outcome: 'Follow-up Required',
      confidence: 88,
      reasoning: 'Strong commercial interest with executive pilot scheduled for Tuesday morning. Awaiting delivery of compliance dossier.',
      analyzedAt: '18 Sep 2026, 16:50 UTC',
    },
    humanOutcome: {
      outcome: 'Follow-up Required',
      recordedBy: 'Sarah Jenkins',
      recordedAt: '18 Sep 2026, 16:49 UTC',
      notes: 'Elena is very interested in the automated transcript sync. Scheduled pilot demo for Tuesday 10am CET. Need to send SOC2/GDPR pack beforehand.',
    },
    status: 'match',
  },

  'call-902': {
    callId: 'call-902',
    leadName: 'Marcus Vance',
    company: 'Vance Dynamics',
    employeeName: 'David Kim',
    callDate: 'Sep 18, 2026',
    aiOutcome: {
      outcome: 'Interested',
      confidence: 82,
      reasoning: 'Customer confirmed intent to execute the enterprise agreement once legal clears the retention addendum.',
      analyzedAt: '18 Sep 2026, 15:35 UTC',
    },
    humanOutcome: {
      outcome: 'Follow-up Required',
      recordedBy: 'David Kim',
      recordedAt: '18 Sep 2026, 15:34 UTC',
      notes: 'Customer needs legal addendum on 7-year retention purging. Sending to contracts desk for dispatch today.',
    },
    status: 'different',
  },

  'call-903': {
    callId: 'call-903',
    leadName: 'Sofia Chen',
    company: 'Quantum Health',
    employeeName: 'Alex Rivera',
    callDate: 'Sep 18, 2026',
    aiOutcome: {
      outcome: 'Converted',
      confidence: 95,
      reasoning: 'Formal board approval confirmed, pilot rollout authorized, and onboarding scheduled for Wednesday.',
      analyzedAt: '18 Sep 2026, 14:22 UTC',
    },
    humanOutcome: {
      outcome: 'Converted',
      recordedBy: 'Alex Rivera',
      recordedAt: '18 Sep 2026, 14:21 UTC',
      notes: 'Board formally approved rollout! Sandbox credentials going out today. Onboarding locked in for Wednesday morning.',
    },
    status: 'match',
  },

  'call-904': {
    callId: 'call-904',
    leadName: 'David Thorne',
    company: 'Thorne Logistics',
    employeeName: 'Sarah Jenkins',
    callDate: 'Sep 18, 2026',
    aiOutcome: null,
    humanOutcome: {
      outcome: 'Follow-up Required',
      recordedBy: 'Sarah Jenkins',
      recordedAt: '18 Sep 2026, 13:05 UTC',
      notes: 'Waiting for call recording ingestion to complete.',
    },
    status: 'unavailable',
  },

  'call-905': {
    callId: 'call-905',
    leadName: 'Amara Okafor',
    company: 'Solaris Fintech',
    employeeName: 'David Kim',
    callDate: 'Sep 17, 2026',
    aiOutcome: null,
    humanOutcome: {
      outcome: 'Line Disconnected',
      recordedBy: 'David Kim',
      recordedAt: '17 Sep 2026, 17:11 UTC',
      notes: 'Call dropped abruptly during network transfer.',
    },
    status: 'unavailable',
  },

  'call-906': {
    callId: 'call-906',
    leadName: 'Liam O\'Connor',
    company: 'Cascade Retail',
    employeeName: 'Emily Taylor',
    callDate: 'Sep 17, 2026',
    aiOutcome: null,
    humanOutcome: {
      outcome: 'No Answer',
      recordedBy: 'Emily Taylor',
      recordedAt: '17 Sep 2026, 11:23 UTC',
      notes: 'No response after 6 rings.',
    },
    status: 'unavailable',
  },
};

export const INITIAL_OUTCOME_METRICS: OutcomeMetrics = {
  totalCompared: 32,
  matchingCount: 25,
  differentCount: 7,
  agreementRate: 78,
};

class AIAnalysisStore {
  private analyses: Record<string, AIAnalysis> = { ...INITIAL_AI_ANALYSIS };
  private comparisons: Record<string, OutcomeComparison> = { ...INITIAL_OUTCOME_COMPARISONS };
  private metrics: OutcomeMetrics = { ...INITIAL_OUTCOME_METRICS };
  private listeners: Set<() => void> = new Set();

  getAnalysis(callId: string): AIAnalysis | undefined {
    return this.analyses[callId];
  }

  getAllAnalyses(): AIAnalysis[] {
    return Object.values(this.analyses);
  }

  getComparison(callId: string): OutcomeComparison | undefined {
    return this.comparisons[callId];
  }

  getAllComparisons(): OutcomeComparison[] {
    return Object.values(this.comparisons);
  }

  getMetrics(): OutcomeMetrics {
    return { ...this.metrics };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const aiAnalysisStore = new AIAnalysisStore();
