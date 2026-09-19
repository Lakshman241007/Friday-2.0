export type FollowUpStatus = 'Pending' | 'Due Today' | 'Completed' | 'Overdue' | 'Cancelled';

export type FollowUpPriority = 'Low' | 'Medium' | 'High';

export type FollowUpType =
  | 'Callback'
  | 'Demo'
  | 'Send Information'
  | 'Follow-up Call'
  | 'Proposal'
  | 'Check-in'
  | 'Renewal'
  | 'Other';

export interface FollowUpTimelineEvent {
  id: string;
  time: string;
  label: string;
  description: string;
  type: 'call' | 'analysis' | 'outcome' | 'created' | 'scheduled' | 'completed';
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  contactEmail?: string;
  contactPhone?: string;
  employeeId: string;
  employeeName: string;
  type: FollowUpType;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  dueDate: string; // e.g. '2026-09-19' or 'Tomorrow'
  dueTime: string; // e.g. '10:00 AM'
  dueDateIso: string;
  notes: string;
  callId?: string;
  callOutcome?: string;
  previousCallDate?: string;
  createdAt: string;
  completedAt?: string;
  timeline?: FollowUpTimelineEvent[];
}

export interface FollowUpFormData {
  leadId: string;
  leadName: string;
  company: string;
  employeeId: string;
  employeeName: string;
  type: FollowUpType;
  priority: FollowUpPriority;
  dueDate: string;
  dueTime: string;
  notes: string;
  callId?: string;
}

export interface FollowUpFilters {
  status?: string;
  priority?: string;
  type?: string;
  employeeId?: string;
  search?: string;
}
