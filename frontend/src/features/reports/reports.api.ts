import {
  ReportFilters,
  PerformanceReportData,
  ConversionReportData,
  CallQualityReportData,
  ObjectionReportData,
  SentimentReportData,
} from './reports.types';

export const INITIAL_PERFORMANCE_REPORT: PerformanceReportData = {
  totalCalls: 527,
  connectedCalls: 466,
  connectionRate: '88.4%',
  totalFollowUps: 148,
  followUpCompletionRate: '90.3%',
  conversionRate: '24.9%',
  avgQualityScore: 87,
  dailyRows: [
    { date: 'Sep 18, 2026', calls: 84, connected: 76, followUps: 24, converted: 19, quality: 89 },
    { date: 'Sep 17, 2026', calls: 78, connected: 69, followUps: 21, converted: 16, quality: 85 },
    { date: 'Sep 16, 2026', calls: 82, connected: 73, followUps: 23, converted: 18, quality: 88 },
    { date: 'Sep 15, 2026', calls: 75, connected: 66, followUps: 19, converted: 15, quality: 86 },
    { date: 'Sep 14, 2026', calls: 69, connected: 60, followUps: 18, converted: 14, quality: 81 },
    { date: 'Sep 13, 2026', calls: 71, connected: 63, followUps: 22, converted: 17, quality: 84 },
    { date: 'Sep 12, 2026', calls: 68, connected: 59, followUps: 21, converted: 14, quality: 82 },
  ],
};

export const INITIAL_CONVERSION_REPORT: ConversionReportData = {
  total: 527,
  qualified: 184,
  converted: 131,
  followUpRequired: 112,
  callbackRequested: 64,
  notInterested: 36,
  stages: [
    { stage: 'Converted (Win / Deal)', count: 131, percentage: 24.9, color: '#10b981' },
    { stage: 'Qualified Pipeline', count: 184, percentage: 34.9, color: '#38bdf8' },
    { stage: 'Follow-up Required', count: 112, percentage: 21.3, color: '#f59e0b' },
    { stage: 'Callback Requested', count: 64, percentage: 12.1, color: '#a855f7' },
    { stage: 'Not Interested', count: 36, percentage: 6.8, color: '#64748b' },
  ],
};

export const INITIAL_QUALITY_REPORT: CallQualityReportData = {
  averageScore: 87,
  targetScore: 80,
  dimensions: [
    { dimension: 'Opening & Framing', score: 91, target: 85, status: 'optimal' },
    { dimension: 'Discovery & Needs Audit', score: 88, target: 85, status: 'optimal' },
    { dimension: 'Product Architecture & Value', score: 86, target: 80, status: 'on_track' },
    { dimension: 'Objection Handling & Poise', score: 84, target: 80, status: 'on_track' },
    { dimension: 'Closing & Explicit Scheduling', score: 87, target: 80, status: 'optimal' },
  ],
  timeline: [
    { date: 'Sep 12', score: 82 },
    { date: 'Sep 13', score: 84 },
    { date: 'Sep 14', score: 81 },
    { date: 'Sep 15', score: 86 },
    { date: 'Sep 16', score: 88 },
    { date: 'Sep 17', score: 85 },
    { date: 'Sep 18', score: 89 },
  ],
};

export const INITIAL_OBJECTION_REPORT: ObjectionReportData = {
  totalObjections: 168,
  topCategory: 'Pricing',
  categories: [
    { category: 'Pricing', count: 54, percentage: 32.1, trend: '+4%', relatedCallId: 'call-902', exampleLead: 'Marcus Vance' },
    { category: 'Trust', count: 38, percentage: 22.6, trend: '-2%', relatedCallId: 'call-901', exampleLead: 'Elena Rostova' },
    { category: 'Features', count: 28, percentage: 16.7, trend: '-1%', relatedCallId: 'call-905', exampleLead: 'Aria Montgomery' },
    { category: 'Implementation', count: 24, percentage: 14.3, trend: '+3%', relatedCallId: 'call-901', exampleLead: 'Elena Rostova' },
    { category: 'Competitor', count: 14, percentage: 8.3, trend: '-5%', relatedCallId: 'call-904', exampleLead: 'Liam Becker' },
    { category: 'Timing', count: 10, percentage: 6.0, trend: '0%', relatedCallId: 'call-905', exampleLead: 'Aria Montgomery' },
  ],
};

export const INITIAL_SENTIMENT_REPORT: SentimentReportData = {
  positivePercentage: 62.4,
  neutralPercentage: 24.1,
  negativePercentage: 8.5,
  mixedPercentage: 5.0,
  counts: {
    positive: 329,
    neutral: 127,
    negative: 45,
    mixed: 26,
  },
  progressionTrend: [
    { stage: 'Opening (00:00 - 01:00)', positive: 45, neutral: 48, negative: 7 },
    { stage: 'Discovery (01:00 - 03:00)', positive: 58, neutral: 32, negative: 10 },
    { stage: 'Solution & Objections (03:00 - 05:00)', positive: 64, neutral: 22, negative: 14 },
    { stage: 'Closing Commitment (05:00+)', positive: 76, neutral: 18, negative: 6 },
  ],
};

export const reportsApi = {
  async getPerformanceReport(filters?: ReportFilters): Promise<PerformanceReportData> {
    await new Promise((r) => setTimeout(r, 60));
    return INITIAL_PERFORMANCE_REPORT;
  },

  async getConversionReport(filters?: ReportFilters): Promise<ConversionReportData> {
    await new Promise((r) => setTimeout(r, 50));
    return INITIAL_CONVERSION_REPORT;
  },

  async getCallQualityReport(filters?: ReportFilters): Promise<CallQualityReportData> {
    await new Promise((r) => setTimeout(r, 50));
    return INITIAL_QUALITY_REPORT;
  },

  async getObjectionReport(filters?: ReportFilters): Promise<ObjectionReportData> {
    await new Promise((r) => setTimeout(r, 50));
    return INITIAL_OBJECTION_REPORT;
  },

  async getSentimentReport(filters?: ReportFilters): Promise<SentimentReportData> {
    await new Promise((r) => setTimeout(r, 50));
    return INITIAL_SENTIMENT_REPORT;
  },
};
