export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'interested'
  | 'converted'
  | 'lost'
  | 'follow-up';

export type LeadSource =
  | 'inbound'
  | 'outbound'
  | 'website'
  | 'referral'
  | 'event'
  | 'partner';

export type LeadScoreTier = 'hot' | 'warm' | 'cold';

export interface LeadScore {
  value: number;
  tier: LeadScoreTier;
  label?: string;
}

export interface LeadTimelineEvent {
  id: string;
  type: 'created' | 'assigned' | 'call' | 'status_change' | 'follow_up' | 'note';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  lastContact?: string;
  nextAction?: string;
  dealValue?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: LeadTimelineEvent[];
  callCount?: number;
}

export interface LeadFilterOptions {
  search?: string;
  status?: LeadStatus | 'all';
  assignedTo?: string | 'all';
  scoreTier?: LeadScoreTier | 'all';
  source?: LeadSource | 'all';
}

export interface CreateLeadInput {
  name: string;
  title?: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  notes?: string;
  dealValue?: string;
  score?: number;
}
