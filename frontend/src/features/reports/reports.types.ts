export interface ReportFilters {
  dateRange: '7d' | '30d' | '90d' | 'q3';
  employeeId?: string;
  outcome?: string;
  sentiment?: string;
  intent?: string;
}

export interface PerformanceReportData {
  totalCalls: number;
  connectedCalls: number;
  connectionRate: string;
  totalFollowUps: number;
  followUpCompletionRate: string;
  conversionRate: string;
  avgQualityScore: number;
  dailyRows: {
    date: string;
    calls: number;
    connected: number;
    followUps: number;
    converted: number;
    quality: number;
  }[];
}

export interface ConversionReportData {
  total: number;
  qualified: number;
  converted: number;
  followUpRequired: number;
  notInterested: number;
  callbackRequested: number;
  stages: {
    stage: string;
    count: number;
    percentage: number;
    color?: string;
  }[];
}

export interface QualityDimensionBreakdown {
  dimension: string;
  score: number;
  target: number;
  status: 'optimal' | 'on_track' | 'attention';
}

export interface CallQualityReportData {
  averageScore: number;
  targetScore: number;
  dimensions: QualityDimensionBreakdown[];
  timeline: {
    date: string;
    score: number;
  }[];
}

export interface ObjectionCategoryData {
  category: 'Pricing' | 'Features' | 'Timing' | 'Competitor' | 'Trust' | 'Implementation';
  count: number;
  percentage: number;
  trend: string;
  relatedCallId?: string;
  exampleLead?: string;
}

export interface ObjectionReportData {
  totalObjections: number;
  topCategory: string;
  categories: ObjectionCategoryData[];
}

export interface SentimentReportData {
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  mixedPercentage: number;
  counts: {
    positive: number;
    neutral: number;
    negative: number;
    mixed: number;
  };
  progressionTrend: {
    stage: string;
    positive: number;
    neutral: number;
    negative: number;
  }[];
}
