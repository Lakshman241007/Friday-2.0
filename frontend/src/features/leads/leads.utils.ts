import { Lead, LeadFilterOptions, LeadScoreTier, LeadStatus } from './leads.types';

export const LEAD_STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; badgeVariant: 'active' | 'processing' | 'success' | 'warning' | 'error' | 'neutral' }
> = {
  new: { label: 'New', badgeVariant: 'neutral' },
  contacted: { label: 'Contacted', badgeVariant: 'processing' },
  qualified: { label: 'Qualified', badgeVariant: 'active' },
  interested: { label: 'Interested', badgeVariant: 'active' },
  converted: { label: 'Converted', badgeVariant: 'success' },
  lost: { label: 'Lost', badgeVariant: 'error' },
  'follow-up': { label: 'Follow-up', badgeVariant: 'warning' },
};

export function getLeadStatusLabel(status: LeadStatus): string {
  return LEAD_STATUS_CONFIG[status]?.label || status;
}

export function getLeadStatusBadgeVariant(
  status: LeadStatus
): 'active' | 'processing' | 'success' | 'warning' | 'error' | 'neutral' {
  return LEAD_STATUS_CONFIG[status]?.badgeVariant || 'neutral';
}

export function getLeadScoreTier(score: number): LeadScoreTier {
  if (score >= 75) return 'hot';
  if (score >= 45) return 'warm';
  return 'cold';
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function filterLeads(leads: Lead[], filters: LeadFilterOptions): Lead[] {
  return leads.filter((lead) => {
    // Search query matching
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      const matches =
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        (lead.assignedEmployeeName && lead.assignedEmployeeName.toLowerCase().includes(q));
      if (!matches) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (lead.status !== filters.status) return false;
    }

    // Source filter
    if (filters.source && filters.source !== 'all') {
      if (lead.source !== filters.source) return false;
    }

    // Score tier filter
    if (filters.scoreTier && filters.scoreTier !== 'all') {
      const tier = getLeadScoreTier(lead.score);
      if (tier !== filters.scoreTier) return false;
    }

    // Assigned To filter
    if (filters.assignedTo && filters.assignedTo !== 'all') {
      if (filters.assignedTo === 'unassigned') {
        if (lead.assignedEmployeeId) return false;
      } else {
        if (lead.assignedEmployeeId !== filters.assignedTo) return false;
      }
    }

    return true;
  });
}

export function calculateLeadMetrics(leads: Lead[]) {
  const total = leads.length;
  const qualified = leads.filter((l) => l.status === 'qualified' || l.status === 'interested').length;
  const converted = leads.filter((l) => l.status === 'converted').length;
  const avgScore = total > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / total) : 0;
  const hotLeads = leads.filter((l) => l.score >= 75).length;

  return {
    total,
    qualified,
    converted,
    avgScore,
    hotLeads,
  };
}
