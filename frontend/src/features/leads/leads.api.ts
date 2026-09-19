import { Lead, CreateLeadInput, LeadFilterOptions } from './leads.types';
import { phase4Store } from './leads.data';
import { filterLeads } from './leads.utils';

export const leadsApi = {
  async getLeads(filters?: LeadFilterOptions): Promise<Lead[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const all = phase4Store.getLeads();
    if (!filters) return all;
    return filterLeads(all, filters);
  },

  async getLead(id: string): Promise<Lead | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return phase4Store.getLeadById(id);
  },

  async createLead(input: CreateLeadInput): Promise<Lead> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return phase4Store.addLead({
      name: input.name,
      title: input.title || 'Decision Maker',
      company: input.company,
      email: input.email,
      phone: input.phone,
      source: input.source,
      status: input.status,
      score: input.score ?? 70,
      assignedEmployeeId: input.assignedEmployeeId,
      assignedEmployeeName: input.assignedEmployeeName,
      dealValue: input.dealValue || '$25,000 ARR',
      notes: input.notes,
      nextAction: 'Initial Discovery Call',
    });
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return phase4Store.updateLead(id, updates);
  },

  async deleteLead(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return phase4Store.deleteLead(id);
  },
};
