import { Assignment, AssignmentHistoryItem, EmployeeSummary } from './assignment.types';
import { phase4Store } from '../leads/leads.data';

export const assignmentApi = {
  async getAssignments(): Promise<Assignment[]> {
    await new Promise((r) => setTimeout(r, 150));
    return phase4Store.getAssignments();
  },

  async getEmployees(): Promise<EmployeeSummary[]> {
    await new Promise((r) => setTimeout(r, 100));
    return phase4Store.getEmployees();
  },

  async assignLead(leadId: string, employeeId: string, changedBy?: string, reason?: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 200));
    return phase4Store.assignLead(leadId, employeeId, changedBy, reason);
  },

  async reassignLead(leadId: string, employeeId: string, changedBy?: string, reason?: string): Promise<boolean> {
    return this.assignLead(leadId, employeeId, changedBy, reason);
  },

  async getAssignmentHistory(): Promise<AssignmentHistoryItem[]> {
    await new Promise((r) => setTimeout(r, 100));
    return phase4Store.getAssignmentHistory();
  },
};
