export interface PerformanceMetric {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  benchmark?: string;
  description?: string;
}

export interface QualityDimension {
  dimension: string;
  score: number; // 0-100
  target: number;
  description: string;
}

export interface PerformanceOverviewData {
  totalCalls: number;
  connectedCalls: number;
  connectionRate: string;
  avgDuration: string;
  conversionRate: string;
  followUpCompletionRate: string;
  avgCallQualityScore: number;
  aiOutcomeAgreementRate: string;
  period: string;
}

export interface PerformanceTrendPoint {
  date: string;
  qualityScore: number;
  callsCount: number;
  qualifiedCount: number;
  convertedCount: number;
}

export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  role: string;
  avatarInitials: string;
  totalCalls: number;
  connectedCalls: number;
  conversionRate: string;
  conversionPercentage: number;
  callQualityScore: number;
  followUpCompletionRate: string;
  followUpCompletionPercentage: number;
  aiOutcomeAgreement: string;
  avgCallDuration: string;
  topStrengths: string[];
  dimensions: QualityDimension[];
  recentCalls: {
    id: string;
    leadName: string;
    company: string;
    outcome: string;
    qualityScore: number;
    date: string;
  }[];
}

export interface TeamPerformanceData {
  overview: PerformanceOverviewData;
  metrics: PerformanceMetric[];
  trend: PerformanceTrendPoint[];
  employees: EmployeePerformance[];
}
