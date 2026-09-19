import { Alert, AlertFilters } from './alerts.types';

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-101',
    type: 'follow_up_overdue',
    priority: 'high',
    status: 'unread',
    title: 'Overdue Follow-up Commitment',
    description: 'Competitive comparison sheet for Liam Becker (CyberNetix AG) is 1 day overdue.',
    timestamp: '1 day ago',
    createdAt: '2026-09-18T14:00:00Z',
    leadId: 'lead-104',
    leadName: 'Liam Becker',
    company: 'CyberNetix AG',
    callId: 'call-904',
    employeeId: 'emp-3',
    employeeName: 'David Kim',
    followUpId: 'fu-3',
    recommendedAction: 'Deliver benchmark comparison matrix or reassign commitment queue.',
    actionLabel: 'Review Follow-up',
    actionUrl: '#/followups',
    reasoning: 'Customer noted competitor pricing at 01:14 in call-904 and requested comparison documentation within 24 hours.',
  },
  {
    id: 'alt-102',
    type: 'follow_up_due',
    priority: 'high',
    status: 'unread',
    title: 'High-Value Pricing Review Due Today',
    description: 'Marcus Vance (Hyperion Dynamics) scheduled for executive volume pricing call at 03:00 PM EST.',
    timestamp: '2 hours ago',
    createdAt: '2026-09-19T08:00:00Z',
    leadId: 'lead-102',
    leadName: 'Marcus Vance',
    company: 'Hyperion Dynamics',
    callId: 'call-902',
    employeeId: 'emp-2',
    employeeName: 'Alex Chen',
    followUpId: 'fu-2',
    recommendedAction: 'Verify enterprise volume discount approval tier with sales director before dial-in.',
    actionLabel: 'Open Call Session',
    actionUrl: '#/calling/call-902',
    reasoning: 'AI detected commercial budget authority of $120k+ ARR with high closing velocity.',
  },
  {
    id: 'alt-103',
    type: 'objection_detected',
    priority: 'medium',
    status: 'unread',
    title: 'Data Sovereignty Objection Flagged',
    description: 'Elena Rostova (Apex Robotics) questioned German GDPR compliance & customer-managed encryption.',
    timestamp: 'Yesterday',
    createdAt: '2026-09-18T16:55:00Z',
    leadId: 'lead-101',
    leadName: 'Elena Rostova',
    company: 'Apex Robotics',
    callId: 'call-901',
    employeeId: 'emp-1',
    employeeName: 'Sarah Jenkins',
    followUpId: 'fu-1',
    recommendedAction: 'Ensure EU SOC2/GDPR certification packet is attached to calendar pilot invitation.',
    actionLabel: 'Inspect Analysis',
    actionUrl: '#/analysis/call-901',
    reasoning: 'Confidence score 89% on Trust/Regulatory objection category at timestamp 02:05.',
  },
  {
    id: 'alt-104',
    type: 'high_priority_lead',
    priority: 'info',
    status: 'read',
    title: 'High Intent Account Qualified',
    description: 'Apex Robotics confirmed immediate budget expansion for Munich facility telematics automation.',
    timestamp: 'Yesterday',
    createdAt: '2026-09-18T16:50:00Z',
    leadId: 'lead-101',
    leadName: 'Elena Rostova',
    company: 'Apex Robotics',
    callId: 'call-901',
    employeeId: 'emp-1',
    employeeName: 'Sarah Jenkins',
    recommendedAction: 'Prioritize solutions architect assignment for Tuesday technical pilot.',
    actionLabel: 'View Lead Profile',
    actionUrl: '#/leads',
    reasoning: 'Prospect evaluated dual-channel real-time transcription and confirmed enterprise need.',
  },
  {
    id: 'alt-105',
    type: 'negative_sentiment',
    priority: 'medium',
    status: 'unread',
    title: 'Sentiment Dip Detected During Pricing Segment',
    description: 'Prospect tone registered cautious sentiment during per-seat rate discussion.',
    timestamp: '2 days ago',
    createdAt: '2026-09-17T15:30:00Z',
    leadId: 'lead-102',
    leadName: 'Marcus Vance',
    company: 'Hyperion Dynamics',
    callId: 'call-902',
    employeeId: 'emp-2',
    employeeName: 'Alex Chen',
    recommendedAction: 'Review coaching playbook on value-anchoring before discounting.',
    actionLabel: 'Coaching Playbook',
    actionUrl: '#/coaching/emp-2',
    reasoning: 'Sentiment vector moved from Positive to Mixed between 01:45 and 02:30.',
  },
  {
    id: 'alt-106',
    type: 'call_quality',
    priority: 'info',
    status: 'read',
    title: 'Telephony Buffer Jitter Warning',
    description: 'Minor audio packet jitter (84ms) detected on PSTN bridge for session #call-904.',
    timestamp: '3 days ago',
    createdAt: '2026-09-16T11:05:00Z',
    callId: 'call-904',
    recommendedAction: 'No operational action required; automated failover completed seamlessly.',
    actionLabel: 'Inspect Recording',
    actionUrl: '#/recordings/call-904',
    reasoning: 'Adaptive jitter buffer mitigated audio loss; transcript diarization accuracy remained 94%.',
  },
];

class AlertsStore {
  private alerts: Alert[] = [...INITIAL_ALERTS];
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

  getAll(): Alert[] {
    return [...this.alerts];
  }

  getUnreadCount(): number {
    return this.alerts.filter((a) => a.status === 'unread').length;
  }

  getById(id: string): Alert | undefined {
    return this.alerts.find((a) => a.id === id);
  }

  markRead(id: string): Alert | undefined {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) return undefined;
    alert.status = 'read';
    this.notify();
    return alert;
  }

  markAllRead(): void {
    this.alerts.forEach((a) => {
      if (a.status === 'unread') a.status = 'read';
    });
    this.notify();
  }

  dismiss(id: string): boolean {
    const initialLen = this.alerts.length;
    this.alerts = this.alerts.filter((a) => a.id !== id);
    if (this.alerts.length !== initialLen) {
      this.notify();
      return true;
    }
    return false;
  }
}

export const alertsStore = new AlertsStore();

export const alertsApi = {
  async getAlerts(filters?: AlertFilters): Promise<Alert[]> {
    await new Promise((r) => setTimeout(r, 50));
    let items = alertsStore.getAll();
    if (!filters) return items;

    if (filters.priority && filters.priority !== 'all') {
      items = items.filter((a) => a.priority === filters.priority);
    }
    if (filters.status && filters.status !== 'all') {
      items = items.filter((a) => a.status === filters.status);
    }
    if (filters.type && filters.type !== 'all') {
      items = items.filter((a) => a.type === filters.type);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.leadName && a.leadName.toLowerCase().includes(q)) ||
          (a.company && a.company.toLowerCase().includes(q))
      );
    }
    return items;
  },

  async getAlert(id: string): Promise<Alert | undefined> {
    await new Promise((r) => setTimeout(r, 30));
    return alertsStore.getById(id);
  },

  async markRead(id: string): Promise<Alert | undefined> {
    await new Promise((r) => setTimeout(r, 40));
    return alertsStore.markRead(id);
  },

  async markAllRead(): Promise<void> {
    await new Promise((r) => setTimeout(r, 40));
    alertsStore.markAllRead();
  },

  async dismiss(id: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 40));
    return alertsStore.dismiss(id);
  },
};
