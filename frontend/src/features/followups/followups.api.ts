import { FollowUp, FollowUpFormData, FollowUpFilters } from './followups.types';

export const INITIAL_FOLLOW_UPS: FollowUp[] = [
  {
    id: 'fu-1',
    leadId: 'lead-101',
    leadName: 'Elena Rostova',
    company: 'Apex Robotics',
    contactEmail: 'elena@apexrobotics.de',
    contactPhone: '+49 89 2018 4401',
    employeeId: 'emp-1',
    employeeName: 'Sarah Jenkins',
    type: 'Demo',
    priority: 'High',
    status: 'Due Today',
    dueDate: 'Today, Sep 19',
    dueTime: '10:00 AM CET',
    dueDateIso: '2026-09-19T10:00:00Z',
    notes: 'Deliver German GDPR & SOC2 compliance dossier ahead of executive pilot with VP of Engineering.',
    callId: 'call-901',
    callOutcome: 'Follow-up Required',
    previousCallDate: 'Sep 18, 2026',
    createdAt: '2026-09-18T16:52:00Z',
    timeline: [
      {
        id: 't1',
        time: 'Sep 18, 16:42',
        label: 'Telephony Session #call-901 Completed',
        description: 'Duration 04:18 recorded with prospect.',
        type: 'call',
      },
      {
        id: 't2',
        time: 'Sep 18, 16:50',
        label: 'AI Analysis & Trust Objection Flagged',
        description: 'Identified EU GDPR security questions at 02:05 timestamp.',
        type: 'analysis',
      },
      {
        id: 't3',
        time: 'Sep 18, 16:51',
        label: 'Disposition: Follow-up Required',
        description: 'Confirmed need for technical data residency pilot.',
        type: 'outcome',
      },
      {
        id: 't4',
        time: 'Sep 18, 16:52',
        label: 'Operational Commitment Logged',
        description: 'Assigned to Sarah Jenkins for today at 10:00 AM CET.',
        type: 'created',
      },
    ],
  },
  {
    id: 'fu-2',
    leadId: 'lead-102',
    leadName: 'Marcus Vance',
    company: 'Hyperion Dynamics',
    contactEmail: 'marcus.v@hyperiondyn.com',
    contactPhone: '+1 (415) 890-2341',
    employeeId: 'emp-2',
    employeeName: 'Alex Chen',
    type: 'Follow-up Call',
    priority: 'High',
    status: 'Due Today',
    dueDate: 'Today, Sep 19',
    dueTime: '03:00 PM EST',
    dueDateIso: '2026-09-19T15:00:00Z',
    notes: 'Walk through enterprise volume pricing schedules for 50+ sales engineer seats.',
    callId: 'call-902',
    callOutcome: 'Qualified',
    previousCallDate: 'Sep 18, 2026',
    createdAt: '2026-09-18T14:30:00Z',
    timeline: [
      {
        id: 't21',
        time: 'Sep 18, 14:15',
        label: 'Call #call-902 Inbound Completed',
        description: 'Duration 06:12 with Chief Revenue Officer.',
        type: 'call',
      },
      {
        id: 't22',
        time: 'Sep 18, 14:25',
        label: 'AI Evaluated Commercial Intent',
        description: 'Detected pricing inquiry and budget commitment.',
        type: 'analysis',
      },
      {
        id: 't23',
        time: 'Sep 18, 14:30',
        label: 'Follow-up Call Scheduled',
        description: 'Targeted pricing review scheduled.',
        type: 'scheduled',
      },
    ],
  },
  {
    id: 'fu-3',
    leadId: 'lead-104',
    leadName: 'Liam Becker',
    company: 'CyberNetix AG',
    contactEmail: 'l.becker@cybernetix.eu',
    contactPhone: '+49 30 9921 5520',
    employeeId: 'emp-3',
    employeeName: 'David Kim',
    type: 'Send Information',
    priority: 'Medium',
    status: 'Overdue',
    dueDate: 'Yesterday, Sep 18',
    dueTime: '02:00 PM CET',
    dueDateIso: '2026-09-18T14:00:00Z',
    notes: 'Deliver competitor benchmark comparison matrix regarding local LLM latency vs cloud endpoints.',
    callId: 'call-904',
    callOutcome: 'Not Interested',
    previousCallDate: 'Sep 17, 2026',
    createdAt: '2026-09-17T11:20:00Z',
  },
  {
    id: 'fu-4',
    leadId: 'lead-105',
    leadName: 'Aria Montgomery',
    company: 'Quantum Innovations',
    contactEmail: 'aria.m@quantuminnov.io',
    contactPhone: '+1 (650) 412-9988',
    employeeId: 'usr_emp_01',
    employeeName: 'Elena Rostova',
    type: 'Callback',
    priority: 'Medium',
    status: 'Pending',
    dueDate: 'Sep 22, 2026',
    dueTime: '11:30 AM PST',
    dueDateIso: '2026-09-22T11:30:00Z',
    notes: 'Q4 architectural sync with VP Infrastructure regarding API webhook rate limits.',
    callId: 'call-905',
    callOutcome: 'Callback Requested',
    previousCallDate: 'Sep 16, 2026',
    createdAt: '2026-09-16T17:00:00Z',
  },
  {
    id: 'fu-5',
    leadId: 'lead-103',
    leadName: 'Dr. Sophia Lin',
    company: 'Lumina Biotech',
    contactEmail: 's.lin@luminabio.com',
    contactPhone: '+1 (617) 554-1029',
    employeeId: 'emp-1',
    employeeName: 'Sarah Jenkins',
    type: 'Proposal',
    priority: 'Low',
    status: 'Completed',
    dueDate: 'Sep 17, 2026',
    dueTime: '04:00 PM EST',
    dueDateIso: '2026-09-17T16:00:00Z',
    notes: 'Delivered clinical data privacy SLA document and standard MSA package.',
    callId: 'call-903',
    callOutcome: 'Converted',
    previousCallDate: 'Sep 16, 2026',
    createdAt: '2026-09-16T10:00:00Z',
    completedAt: '2026-09-17T15:45:00Z',
  },
  {
    id: 'fu-6',
    leadId: 'lead-106',
    leadName: 'Vikram Mehta',
    company: 'Zenith Logistics',
    contactEmail: 'vmehta@zenithlog.com',
    contactPhone: '+1 (312) 441-8902',
    employeeId: 'emp-2',
    employeeName: 'Alex Chen',
    type: 'Check-in',
    priority: 'Low',
    status: 'Pending',
    dueDate: 'Sep 25, 2026',
    dueTime: '01:00 PM CST',
    dueDateIso: '2026-09-25T13:00:00Z',
    notes: 'Quarterly check-in on telematics recording volume and agent adoption quotas.',
    createdAt: '2026-09-15T09:00:00Z',
  },
];

class FollowUpsStore {
  private followUps: FollowUp[] = [...INITIAL_FOLLOW_UPS];
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getAll(): FollowUp[] {
    return [...this.followUps];
  }

  getById(id: string): FollowUp | undefined {
    return this.followUps.find((f) => f.id === id);
  }

  create(data: FollowUpFormData): FollowUp {
    const newFollowUp: FollowUp = {
      id: `fu-${Date.now()}`,
      ...data,
      status: 'Pending',
      dueDateIso: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      timeline: [
        {
          id: `t-${Date.now()}`,
          time: 'Just now',
          label: 'Operational Commitment Created',
          description: `Scheduled ${data.type} with ${data.leadName}.`,
          type: 'created',
        },
      ],
    };
    this.followUps = [newFollowUp, ...this.followUps];
    this.notify();
    return newFollowUp;
  }

  update(id: string, data: Partial<FollowUp>): FollowUp | undefined {
    const idx = this.followUps.findIndex((f) => f.id === id);
    if (idx === -1) return undefined;
    this.followUps[idx] = { ...this.followUps[idx], ...data };
    this.notify();
    return this.followUps[idx];
  }

  complete(id: string): FollowUp | undefined {
    const item = this.getById(id);
    if (!item) return undefined;
    const updated = this.update(id, {
      status: 'Completed',
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeline: [
        ...(item.timeline || []),
        {
          id: `t-comp-${Date.now()}`,
          time: 'Just now',
          label: 'Operational Commitment Completed',
          description: `Task marked fulfilled by ${item.employeeName}.`,
          type: 'completed',
        },
      ],
    });
    return updated;
  }

  delete(id: string): boolean {
    const initialLen = this.followUps.length;
    this.followUps = this.followUps.filter((f) => f.id !== id);
    if (this.followUps.length !== initialLen) {
      this.notify();
      return true;
    }
    return false;
  }
}

export const followUpsStore = new FollowUpsStore();

export const followupsApi = {
  async getFollowUps(filters?: FollowUpFilters): Promise<FollowUp[]> {
    await new Promise((r) => setTimeout(r, 60));
    let items = followUpsStore.getAll();
    if (!filters) return items;

    if (filters.status && filters.status !== 'all') {
      items = items.filter((i) => i.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters.priority && filters.priority !== 'all') {
      items = items.filter((i) => i.priority.toLowerCase() === filters.priority?.toLowerCase());
    }
    if (filters.type && filters.type !== 'all') {
      items = items.filter((i) => i.type.toLowerCase() === filters.type?.toLowerCase());
    }
    if (filters.employeeId) {
      items = items.filter((i) => i.employeeId === filters.employeeId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.leadName.toLowerCase().includes(q) ||
          i.company.toLowerCase().includes(q) ||
          i.employeeName.toLowerCase().includes(q) ||
          i.notes.toLowerCase().includes(q)
      );
    }
    return items;
  },

  async getFollowUp(id: string): Promise<FollowUp | undefined> {
    await new Promise((r) => setTimeout(r, 40));
    return followUpsStore.getById(id);
  },

  async createFollowUp(data: FollowUpFormData): Promise<FollowUp> {
    await new Promise((r) => setTimeout(r, 80));
    return followUpsStore.create(data);
  },

  async updateFollowUp(id: string, data: Partial<FollowUp>): Promise<FollowUp | undefined> {
    await new Promise((r) => setTimeout(r, 80));
    return followUpsStore.update(id, data);
  },

  async completeFollowUp(id: string): Promise<FollowUp | undefined> {
    await new Promise((r) => setTimeout(r, 80));
    return followUpsStore.complete(id);
  },

  async deleteFollowUp(id: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 60));
    return followUpsStore.delete(id);
  },
};
