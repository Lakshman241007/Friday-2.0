export interface Strength {
  id: string;
  title: string;
  category: 'opening' | 'discovery' | 'objection' | 'closing' | 'followup';
  description: string;
  evidence: string;
  callId?: string;
  metric?: string;
}

export interface ImprovementArea {
  id: string;
  area: string;
  category: 'pricing' | 'closing' | 'followup_timing' | 'discovery' | 'compliance';
  evidence: string;
  suggestedPractice: string;
  relatedCallId?: string;
  priority: 'High' | 'Medium' | 'Low';
}

export type GoalStatus = 'In Progress' | 'Achieved' | 'Needs Attention';

export interface CoachingGoal {
  id: string;
  title: string;
  metricTarget: string;
  currentValue: number;
  targetValue: number;
  deadline: string;
  status: GoalStatus;
  category: string;
  notes?: string;
}

export interface BestPracticeCall {
  id: string;
  callId: string;
  leadName: string;
  company: string;
  employeeId: string;
  employeeName: string;
  date: string;
  duration: string;
  outcome: string;
  relevantStrength: string;
  takeaway: string;
  audioTimestampSeconds?: number;
}

export interface CoachingFeedbackItem {
  id: string;
  timestamp: string;
  author: string;
  authorRole: string;
  callId?: string;
  statement: string;
  evidenceReference: string;
  actionableRecommendation: string;
}

export interface CoachingProfile {
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  overallScore: number;
  summaryFeedback: string;
  strengths: Strength[];
  improvementAreas: ImprovementArea[];
  goals: CoachingGoal[];
  feedback: CoachingFeedbackItem[];
  bestPracticeCalls: BestPracticeCall[];
}
