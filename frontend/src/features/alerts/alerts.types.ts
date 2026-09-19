export type AlertType =
  | 'follow_up_overdue'
  | 'follow_up_due'
  | 'negative_sentiment'
  | 'high_priority_lead'
  | 'analysis_failed'
  | 'objection_detected'
  | 'call_quality'
  | 'system';

export type AlertPriority = 'high' | 'medium' | 'info';

export type AlertStatus = 'unread' | 'read' | 'dismissed';

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  title: string;
  description: string;
  timestamp: string;
  createdAt: string;
  leadId?: string;
  leadName?: string;
  company?: string;
  callId?: string;
  employeeId?: string;
  employeeName?: string;
  followUpId?: string;
  recommendedAction?: string;
  actionLabel?: string;
  actionUrl?: string;
  reasoning?: string;
}

export interface AlertFilters {
  priority?: string;
  type?: string;
  status?: string;
  search?: string;
}
