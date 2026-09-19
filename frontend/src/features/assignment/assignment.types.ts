export type AssignmentStatus =
  | 'assigned'
  | 'unassigned'
  | 'pending_transfer'
  | 'reassigned';

export interface EmployeeSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  activeLeads: number;
  capacity: number;
  status: 'active' | 'in_call' | 'offline';
}

export interface Assignment {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  employeeInitials: string;
  status: AssignmentStatus;
  assignedDate: string;
  assignedBy: string;
  priority: 'urgent' | 'high' | 'medium';
  lastInteraction?: string;
}

export interface AssignmentHistoryItem {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  previousEmployeeName: string;
  newEmployeeName: string;
  changedBy: string;
  date: string;
  reason?: string;
}
