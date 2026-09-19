import { Lead } from './leads.types';
import { Assignment, AssignmentHistoryItem, EmployeeSummary } from '../assignment/assignment.types';
import { CallHistoryItem } from '../calling/calling.types';

export const INITIAL_EMPLOYEES: EmployeeSummary[] = [
  {
    id: 'emp_1',
    name: 'Elena Rostova',
    email: 'elena.rostova@friday.ai',
    role: 'Sr. Account Executive',
    initials: 'ER',
    activeLeads: 14,
    capacity: 25,
    status: 'active',
  },
  {
    id: 'emp_2',
    name: 'Marcus Vance',
    email: 'marcus.vance@friday.ai',
    role: 'Enterprise Rep',
    initials: 'MV',
    activeLeads: 18,
    capacity: 25,
    status: 'in_call',
  },
  {
    id: 'emp_3',
    name: 'Sofia Chen',
    email: 'sofia.chen@friday.ai',
    role: 'Outbound Specialist',
    initials: 'SC',
    activeLeads: 12,
    capacity: 20,
    status: 'active',
  },
  {
    id: 'emp_4',
    name: 'Alex Rivera',
    email: 'alex.rivera@friday.ai',
    role: 'Sales Development Rep',
    initials: 'AR',
    activeLeads: 9,
    capacity: 20,
    status: 'active',
  },
  {
    id: 'emp_5',
    name: 'David Kim',
    email: 'david.kim@friday.ai',
    role: 'Account Executive',
    initials: 'DK',
    activeLeads: 15,
    capacity: 25,
    status: 'offline',
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-101',
    name: 'Sarah Jenkins',
    title: 'VP of Technology',
    company: 'Apex Logistics Corp',
    email: 'sarah.jenkins@apexlogistics.io',
    phone: '+1 (415) 890-2134',
    source: 'inbound',
    status: 'qualified',
    score: 92,
    assignedEmployeeId: 'emp_1',
    assignedEmployeeName: 'Elena Rostova',
    lastContact: 'Today, 11:20 AM',
    nextAction: 'Product Architecture Review',
    dealValue: '$48,000 ARR',
    notes: 'Inbound evaluation of autonomous voice workflows. Seeking multi-region telephony failover.',
    createdAt: '2026-03-10T09:30:00Z',
    updatedAt: '2026-03-18T11:20:00Z',
    callCount: 3,
    timeline: [
      {
        id: 'tl-1',
        type: 'created',
        title: 'Lead Ingested',
        description: 'Lead submitted enterprise demo inquiry on homepage.',
        timestamp: 'Mar 10, 09:30 AM',
        actor: 'System',
      },
      {
        id: 'tl-2',
        type: 'assigned',
        title: 'Assigned to Elena Rostova',
        description: 'Auto-routed based on Enterprise SLA policy.',
        timestamp: 'Mar 10, 09:45 AM',
        actor: 'Routing Engine',
      },
      {
        id: 'tl-3',
        type: 'call',
        title: 'Discovery Call Completed',
        description: '14 min duration. Validated budget and telephony integration requirements.',
        timestamp: 'Mar 14, 02:15 PM',
        actor: 'Elena Rostova',
      },
      {
        id: 'tl-4',
        type: 'status_change',
        title: 'Status Updated to Qualified',
        description: 'High purchase intent confirmed by VP Tech.',
        timestamp: 'Mar 14, 02:30 PM',
        actor: 'Elena Rostova',
      },
    ],
  },
  {
    id: 'lead-102',
    name: 'David Vance',
    title: 'Chief Operating Officer',
    company: 'Vanguard Healthcare Tech',
    email: 'david.vance@vanguardhealth.com',
    phone: '+1 (650) 433-8891',
    source: 'outbound',
    status: 'interested',
    score: 84,
    assignedEmployeeId: 'emp_2',
    assignedEmployeeName: 'Marcus Vance',
    lastContact: 'Yesterday',
    nextAction: 'Executive Proposal Follow-up',
    dealValue: '$72,000 ARR',
    notes: 'HIPAA compliance verified. Requesting security package and custom prompt sandbox.',
    createdAt: '2026-03-11T14:10:00Z',
    updatedAt: '2026-03-17T16:45:00Z',
    callCount: 2,
    timeline: [
      {
        id: 'tl-5',
        type: 'created',
        title: 'Lead Created',
        description: 'Created via outbound research target list.',
        timestamp: 'Mar 11, 02:10 PM',
        actor: 'Marcus Vance',
      },
      {
        id: 'tl-6',
        type: 'call',
        title: 'Introduction Call',
        description: 'Connected with COO directly. High interest in autonomous triage.',
        timestamp: 'Mar 15, 10:00 AM',
        actor: 'Marcus Vance',
      },
    ],
  },
  {
    id: 'lead-103',
    name: 'Michael Chang',
    title: 'Director of Global Revenue',
    company: 'FinScale Solutions',
    email: 'mchang@finscalesolutions.com',
    phone: '+1 (212) 555-0198',
    source: 'referral',
    status: 'contacted',
    score: 78,
    assignedEmployeeId: 'emp_3',
    assignedEmployeeName: 'Sofia Chen',
    lastContact: '2 days ago',
    nextAction: 'Schedule Technical Evaluation',
    dealValue: '$36,000 ARR',
    notes: 'Referred by advisory board. Evaluating outbound voice automation for 40-seat sales floor.',
    createdAt: '2026-03-12T11:00:00Z',
    updatedAt: '2026-03-16T14:20:00Z',
    callCount: 1,
    timeline: [
      {
        id: 'tl-7',
        type: 'created',
        title: 'Lead Ingested',
        description: 'Referred by FinScale advisory board member.',
        timestamp: 'Mar 12, 11:00 AM',
        actor: 'Sofia Chen',
      },
      {
        id: 'tl-8',
        type: 'call',
        title: 'Initial Outreach Call',
        description: 'Brief discussion; requested technical spec sheet.',
        timestamp: 'Mar 16, 02:15 PM',
        actor: 'Sofia Chen',
      },
    ],
  },
  {
    id: 'lead-104',
    name: 'Rachel Sterling',
    title: 'Managing Partner',
    company: 'Sterling & Croft Advisory',
    email: 'rsterling@sterlingcroft.com',
    phone: '+1 (312) 809-4412',
    source: 'event',
    status: 'new',
    score: 65,
    assignedEmployeeId: 'emp_4',
    assignedEmployeeName: 'Alex Rivera',
    lastContact: 'Never',
    nextAction: 'First Discovery Call',
    dealValue: '$24,000 ARR',
    notes: 'Met at FinTech Summit 2026. Expressed curiosity in autonomous callback booking.',
    createdAt: '2026-03-16T08:00:00Z',
    updatedAt: '2026-03-16T08:00:00Z',
    callCount: 0,
    timeline: [
      {
        id: 'tl-9',
        type: 'created',
        title: 'Lead Created',
        description: 'Contact collected at FinTech Summit 2026.',
        timestamp: 'Mar 16, 08:00 AM',
        actor: 'Alex Rivera',
      },
    ],
  },
  {
    id: 'lead-105',
    name: 'Thomas Wright',
    title: 'Head of Customer Experience',
    company: 'Elevate Commerce Group',
    email: 't.wright@elevatecommerce.co',
    phone: '+1 (404) 912-7801',
    source: 'website',
    status: 'converted',
    score: 96,
    assignedEmployeeId: 'emp_1',
    assignedEmployeeName: 'Elena Rostova',
    lastContact: '3 days ago',
    nextAction: 'Kickoff & Deployment Review',
    dealValue: '$55,000 ARR',
    notes: 'Contract executed. Setting up speech model fine-tuning environment.',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-15T17:00:00Z',
    callCount: 4,
    timeline: [
      {
        id: 'tl-10',
        type: 'created',
        title: 'Lead Ingested',
        description: 'Enterprise consultation requested.',
        timestamp: 'Mar 01, 10:00 AM',
        actor: 'System',
      },
      {
        id: 'tl-11',
        type: 'status_change',
        title: 'Deal Converted',
        description: 'Annual service contract executed.',
        timestamp: 'Mar 15, 05:00 PM',
        actor: 'Elena Rostova',
      },
    ],
  },
  {
    id: 'lead-106',
    name: 'Olivia Martinez',
    title: 'Director of Growth',
    company: 'Quantum Dynamics Inc',
    email: 'omartinez@quantumdynamics.io',
    phone: '+1 (303) 771-9022',
    source: 'partner',
    status: 'follow-up',
    score: 72,
    assignedEmployeeId: 'emp_3',
    assignedEmployeeName: 'Sofia Chen',
    lastContact: 'Yesterday, 04:00 PM',
    nextAction: 'Follow up on Budget Cycle Approval',
    dealValue: '$42,000 ARR',
    notes: 'Q2 fiscal budget review pending board sign-off on April 1st.',
    createdAt: '2026-03-08T12:00:00Z',
    updatedAt: '2026-03-17T16:00:00Z',
    callCount: 2,
    timeline: [
      {
        id: 'tl-12',
        type: 'created',
        title: 'Lead Ingested',
        description: 'Introduced via Cloud Partner Ecosystem.',
        timestamp: 'Mar 08, 12:00 PM',
        actor: 'Sofia Chen',
      },
      {
        id: 'tl-13',
        type: 'call',
        title: 'Follow-up Call',
        description: 'Discussed timeline; requested follow-up reminder next week.',
        timestamp: 'Mar 17, 04:00 PM',
        actor: 'Sofia Chen',
      },
    ],
  },
  {
    id: 'lead-107',
    name: 'Brandon Cole',
    title: 'VP Operations',
    company: 'Horizon Freight Global',
    email: 'bcole@horizonfreight.net',
    phone: '+1 (206) 492-3310',
    source: 'outbound',
    status: 'lost',
    score: 34,
    assignedEmployeeId: 'emp_2',
    assignedEmployeeName: 'Marcus Vance',
    lastContact: '5 days ago',
    nextAction: 'Nurture Campaign 6-Month Review',
    dealValue: '$18,000 ARR',
    notes: 'Current legacy provider contract locked through end of year. Added to nurture queue.',
    createdAt: '2026-03-05T15:00:00Z',
    updatedAt: '2026-03-13T10:00:00Z',
    callCount: 2,
    timeline: [
      {
        id: 'tl-14',
        type: 'created',
        title: 'Lead Created',
        description: 'Outbound prospect identified.',
        timestamp: 'Mar 05, 03:00 PM',
        actor: 'Marcus Vance',
      },
      {
        id: 'tl-15',
        type: 'status_change',
        title: 'Marked as Lost',
        description: 'Contract timing mismatched with fiscal cycle.',
        timestamp: 'Mar 13, 10:00 AM',
        actor: 'Marcus Vance',
      },
    ],
  },
  {
    id: 'lead-108',
    name: 'Jessica Reynolds',
    title: 'Chief Strategy Officer',
    company: 'Nexus Capital Partners',
    email: 'jreynolds@nexuscapital.com',
    phone: '+1 (617) 991-5501',
    source: 'inbound',
    status: 'new',
    score: 88,
    assignedEmployeeId: undefined,
    assignedEmployeeName: undefined,
    lastContact: 'Never',
    nextAction: 'Assign Rep & Schedule Introductory Call',
    dealValue: '$60,000 ARR',
    notes: 'High-intent enterprise inbound inquiry. Needs priority sales distribution.',
    createdAt: '2026-03-18T08:15:00Z',
    updatedAt: '2026-03-18T08:15:00Z',
    callCount: 0,
    timeline: [
      {
        id: 'tl-16',
        type: 'created',
        title: 'Lead Ingested',
        description: 'Direct inquiry via enterprise web portal.',
        timestamp: 'Mar 18, 08:15 AM',
        actor: 'System',
      },
    ],
  },
];

export const INITIAL_CALL_HISTORY: CallHistoryItem[] = [
  {
    id: 'call-901',
    date: 'Today, 11:20 AM',
    leadId: 'lead-101',
    leadName: 'Sarah Jenkins',
    company: 'Apex Logistics Corp',
    employeeName: 'Elena Rostova',
    phoneNumber: '+1 (415) 890-2134',
    duration: '04:12',
    durationSeconds: 252,
    status: 'completed',
    outcome: 'interested',
    notes: 'Reviewed technical requirements. Sarah requested follow-up meeting on Friday with VP Infrastructure.',
  },
  {
    id: 'call-902',
    date: 'Yesterday, 04:00 PM',
    leadId: 'lead-106',
    leadName: 'Olivia Martinez',
    company: 'Quantum Dynamics Inc',
    employeeName: 'Sofia Chen',
    phoneNumber: '+1 (303) 771-9022',
    duration: '02:45',
    durationSeconds: 165,
    status: 'completed',
    outcome: 'follow_up_required',
    notes: 'Olivia mentioned budget sign-off is scheduled for next Monday. Sent collateral summary.',
  },
  {
    id: 'call-903',
    date: 'Yesterday, 02:15 PM',
    leadId: 'lead-102',
    leadName: 'David Vance',
    company: 'Vanguard Healthcare Tech',
    employeeName: 'Marcus Vance',
    phoneNumber: '+1 (650) 433-8891',
    duration: '06:30',
    durationSeconds: 390,
    status: 'completed',
    outcome: 'converted',
    notes: 'Security clearance verified. Verbal agreement on $72k tier.',
  },
  {
    id: 'call-904',
    date: 'Mar 16, 03:40 PM',
    leadId: 'lead-103',
    leadName: 'Michael Chang',
    company: 'FinScale Solutions',
    employeeName: 'Sofia Chen',
    phoneNumber: '+1 (212) 555-0198',
    duration: '01:10',
    durationSeconds: 70,
    status: 'completed',
    outcome: 'no_answer',
    notes: 'Left professional voicemail detailing AI voice pilot.',
  },
];

export const INITIAL_ASSIGNMENT_HISTORY: AssignmentHistoryItem[] = [
  {
    id: 'ah-1',
    leadId: 'lead-101',
    leadName: 'Sarah Jenkins',
    company: 'Apex Logistics Corp',
    previousEmployeeName: 'Unassigned',
    newEmployeeName: 'Elena Rostova',
    changedBy: 'Routing Engine (SLA Policy)',
    date: 'Mar 10, 09:45 AM',
    reason: 'Auto-distribution for High Tier Lead ($48k ARR)',
  },
  {
    id: 'ah-2',
    leadId: 'lead-103',
    leadName: 'Michael Chang',
    company: 'FinScale Solutions',
    previousEmployeeName: 'Alex Rivera',
    newEmployeeName: 'Sofia Chen',
    changedBy: 'Manager Console',
    date: 'Mar 13, 11:30 AM',
    reason: 'Reassigned for specialized FinTech account expertise',
  },
  {
    id: 'ah-3',
    leadId: 'lead-106',
    leadName: 'Olivia Martinez',
    company: 'Quantum Dynamics Inc',
    previousEmployeeName: 'David Kim',
    newEmployeeName: 'Sofia Chen',
    changedBy: 'David Kim (Capacity Rebalance)',
    date: 'Mar 14, 04:00 PM',
    reason: 'Workload load-balancing prior to scheduled PTO',
  },
];

// Reactive Store Implementation for Phase 4
class Phase4DataStore {
  private leads: Lead[] = [...INITIAL_LEADS];
  private employees: EmployeeSummary[] = [...INITIAL_EMPLOYEES];
  private callHistory: CallHistoryItem[] = [...INITIAL_CALL_HISTORY];
  private assignmentHistory: AssignmentHistoryItem[] = [...INITIAL_ASSIGNMENT_HISTORY];
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- LEADS ---
  getLeads(): Lead[] {
    return [...this.leads];
  }

  getLeadById(id: string): Lead | undefined {
    return this.leads.find((l) => l.id === id);
  }

  addLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'callCount'> & Partial<Pick<Lead, 'id'>>): Lead {
    const newLead: Lead = {
      ...data,
      id: data.id || `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      callCount: 0,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          type: 'created',
          title: 'Lead Created',
          description: `Lead profile created manually in workspace.`,
          timestamp: 'Just now',
          actor: 'Current User',
        },
      ],
    };

    if (newLead.assignedEmployeeId && newLead.assignedEmployeeName) {
      newLead.timeline.push({
        id: `tl-${Date.now() + 1}`,
        type: 'assigned',
        title: `Assigned to ${newLead.assignedEmployeeName}`,
        description: 'Assigned during lead creation.',
        timestamp: 'Just now',
        actor: 'Current User',
      });
    }

    this.leads = [newLead, ...this.leads];
    this.notify();
    return newLead;
  }

  updateLead(id: string, updates: Partial<Lead>): Lead | undefined {
    const lead = this.getLeadById(id);
    if (!lead) return undefined;

    const updatedLead: Lead = {
      ...lead,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.leads = this.leads.map((l) => (l.id === id ? updatedLead : l));
    this.notify();
    return updatedLead;
  }

  deleteLead(id: string): boolean {
    const initialLen = this.leads.length;
    this.leads = this.leads.filter((l) => l.id !== id);
    if (this.leads.length !== initialLen) {
      this.notify();
      return true;
    }
    return false;
  }

  // --- EMPLOYEES ---
  getEmployees(): EmployeeSummary[] {
    return [...this.employees];
  }

  // --- ASSIGNMENTS ---
  getAssignments(): Assignment[] {
    return this.leads.map((lead) => {
      const emp = this.employees.find((e) => e.id === lead.assignedEmployeeId);
      return {
        id: `asg-${lead.id}`,
        leadId: lead.id,
        leadName: lead.name,
        company: lead.company,
        employeeId: lead.assignedEmployeeId || 'unassigned',
        employeeName: lead.assignedEmployeeName || 'Unassigned',
        employeeRole: emp?.role || 'Awaiting Distribution',
        employeeInitials: emp?.initials || '??',
        status: lead.assignedEmployeeId ? 'assigned' : 'unassigned',
        assignedDate: lead.createdAt,
        assignedBy: 'System Engine',
        priority: lead.score >= 80 ? 'urgent' : lead.score >= 50 ? 'high' : 'medium',
        lastInteraction: lead.lastContact,
      };
    });
  }

  assignLead(leadId: string, employeeId: string, changedBy: string = 'Current User', reason?: string): boolean {
    const lead = this.getLeadById(leadId);
    const employee = this.employees.find((e) => e.id === employeeId);
    if (!lead || !employee) return false;

    const previousEmployeeName = lead.assignedEmployeeName || 'Unassigned';

    // Update lead
    const updatedTimeline = [
      ...lead.timeline,
      {
        id: `tl-${Date.now()}`,
        type: 'assigned' as const,
        title: `Assigned to ${employee.name}`,
        description: reason || `Reassigned from ${previousEmployeeName} to ${employee.name}`,
        timestamp: 'Just now',
        actor: changedBy,
      },
    ];

    this.updateLead(leadId, {
      assignedEmployeeId: employee.id,
      assignedEmployeeName: employee.name,
      timeline: updatedTimeline,
    });

    // Add assignment history record
    const historyItem: AssignmentHistoryItem = {
      id: `ah-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      company: lead.company,
      previousEmployeeName,
      newEmployeeName: employee.name,
      changedBy,
      date: 'Just now',
      reason: reason || 'Manual queue assignment',
    };

    this.assignmentHistory = [historyItem, ...this.assignmentHistory];
    this.notify();
    return true;
  }

  getAssignmentHistory(): AssignmentHistoryItem[] {
    return [...this.assignmentHistory];
  }

  // --- CALLING ---
  getCallHistory(): CallHistoryItem[] {
    return [...this.callHistory];
  }

  getCallById(id: string): CallHistoryItem | undefined {
    return this.callHistory.find((c) => c.id === id);
  }

  addCallRecord(call: Omit<CallHistoryItem, 'id' | 'date'> & Partial<Pick<CallHistoryItem, 'id' | 'date'>>): CallHistoryItem {
    const newRecord: CallHistoryItem = {
      ...call,
      id: call.id || `call-${Date.now()}`,
      date: call.date || 'Just now',
    };

    this.callHistory = [newRecord, ...this.callHistory];

    // Update lead if leadId is associated
    const lead = this.getLeadById(call.leadId);
    if (lead) {
      const updatedTimeline = [
        ...lead.timeline,
        {
          id: `tl-${Date.now()}`,
          type: 'call' as const,
          title: `Call: ${call.outcome.replace('_', ' ').toUpperCase()} (${call.duration})`,
          description: call.notes || 'Outbound call session logged.',
          timestamp: 'Just now',
          actor: call.employeeName,
        },
      ];

      this.updateLead(lead.id, {
        lastContact: 'Just now',
        callCount: (lead.callCount || 0) + 1,
        timeline: updatedTimeline,
      });
    }

    this.notify();
    return newRecord;
  }
}

export const phase4Store = new Phase4DataStore();
