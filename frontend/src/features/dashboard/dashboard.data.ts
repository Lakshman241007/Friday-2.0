export interface ManagerKPI {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  context: string;
  target?: string;
}

export interface TeamMemberPerformance {
  id: string;
  name: string;
  initials: string;
  role: string;
  calls: number;
  connected: number;
  conversions: number;
  conversionRate: number; // percentage
  qualityScore: number; // 0-100
  trend: 'up' | 'down' | 'steady';
  status: 'active' | 'in_call' | 'offline';
}

export interface ConversionDayData {
  day: string;
  calls: number;
  connected: number;
  conversions: number;
  conversionRate: number;
}

export interface AttentionItem {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: 'follow_up' | 'quality' | 'anomaly' | 'approval';
  timeAgo: string;
  entityName?: string;
  assignee?: string;
}

export interface RecentActivityItem {
  id: string;
  actor: string;
  actorInitials: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'call' | 'assignment' | 'ai_score' | 'contract';
  badgeLabel?: string;
}

export interface EmployeeLead {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  priority: 'urgent' | 'high' | 'medium';
  status: 'new' | 'contacted' | 'negotiation' | 'scheduled';
  nextAction: string;
  scheduledTime: string;
  dealValue: string;
}

export interface FollowUpItem {
  id: string;
  leadName: string;
  company: string;
  action: string;
  time: string;
  priority: 'urgent' | 'normal';
  isOverdue?: boolean;
}

export interface EmployeeMetric {
  label: string;
  current: number;
  target: number;
  unit: string;
  percentage: number;
}

export interface CoachingGoal {
  id: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: 'on_track' | 'needs_focus' | 'achieved';
  dueDate: string;
}

export const MOCK_MANAGER_KPIS: ManagerKPI[] = [
  {
    id: 'kpi_calls',
    label: 'Total Outbound Calls',
    value: '1,428',
    change: '+14.2%',
    isPositive: true,
    context: 'vs. previous cycle (1,250)',
    target: '1,500 target',
  },
  {
    id: 'kpi_connected',
    label: 'Connected Calls',
    value: '892',
    change: '+8.6%',
    isPositive: true,
    context: '62.5% effective connect rate',
    target: '60% benchmark',
  },
  {
    id: 'kpi_conversion',
    label: 'Deal Conversion Rate',
    value: '24.8%',
    change: '+2.4%',
    isPositive: true,
    context: '354 qualified appointments set',
    target: '22% quota',
  },
  {
    id: 'kpi_quality',
    label: 'AI Voice Quality Score',
    value: '88.4',
    change: '+3.1 pts',
    isPositive: true,
    context: 'Natural speech & objection handling',
    target: '85.0 target',
  },
];

export const MOCK_TEAM_PERFORMANCE: TeamMemberPerformance[] = [
  {
    id: 'tm_1',
    name: 'Elena Rostova',
    initials: 'ER',
    role: 'Sr. Account Executive',
    calls: 218,
    connected: 148,
    conversions: 44,
    conversionRate: 29.7,
    qualityScore: 93,
    trend: 'up',
    status: 'active',
  },
  {
    id: 'tm_2',
    name: 'Marcus Vance',
    initials: 'MV',
    role: 'Enterprise Rep',
    calls: 194,
    connected: 126,
    conversions: 36,
    conversionRate: 28.5,
    qualityScore: 90,
    trend: 'up',
    status: 'in_call',
  },
  {
    id: 'tm_3',
    name: 'Sofia Chen',
    initials: 'SC',
    role: 'Outbound Specialist',
    calls: 182,
    connected: 110,
    conversions: 28,
    conversionRate: 25.4,
    qualityScore: 88,
    trend: 'steady',
    status: 'active',
  },
  {
    id: 'tm_4',
    name: 'David Kim',
    initials: 'DK',
    role: 'Account Executive',
    calls: 165,
    connected: 98,
    conversions: 22,
    conversionRate: 22.4,
    qualityScore: 84,
    trend: 'down',
    status: 'active',
  },
  {
    id: 'tm_5',
    name: 'Priya Patel',
    initials: 'PP',
    role: 'SDR Outbound',
    calls: 145,
    connected: 88,
    conversions: 18,
    conversionRate: 20.4,
    qualityScore: 82,
    trend: 'steady',
    status: 'offline',
  },
];

export const MOCK_CONVERSION_TRENDS: ConversionDayData[] = [
  { day: 'Mon', calls: 220, connected: 140, conversions: 32, conversionRate: 22.8 },
  { day: 'Tue', calls: 245, connected: 158, conversions: 40, conversionRate: 25.3 },
  { day: 'Wed', calls: 260, connected: 172, conversions: 48, conversionRate: 27.9 },
  { day: 'Thu', calls: 235, connected: 152, conversions: 38, conversionRate: 25.0 },
  { day: 'Fri', calls: 278, connected: 188, conversions: 54, conversionRate: 28.7 },
  { day: 'Sat', calls: 105, connected: 46, conversions: 18, conversionRate: 39.1 },
  { day: 'Sun', calls: 85, connected: 36, conversions: 14, conversionRate: 38.8 },
];

export const MOCK_ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: 'att_1',
    title: 'Urgent Callback Overdue',
    description: 'Enterprise demo follow-up with Apex Global overdue by 2h 15m.',
    severity: 'high',
    category: 'follow_up',
    timeAgo: '12m ago',
    entityName: 'Apex Global Corp',
    assignee: 'David Kim',
  },
  {
    id: 'att_2',
    title: 'High Customer Hesitation Detected',
    description: 'AI sentiment analysis flagged pricing objection pattern on 3 calls today.',
    severity: 'medium',
    category: 'quality',
    timeAgo: '45m ago',
    entityName: 'CloudScale Inc',
    assignee: 'Marcus Vance',
  },
  {
    id: 'att_3',
    title: 'Executive Contract Sign-off',
    description: 'Nexus Dynamics closed $114,000 ARR contract awaiting manager countersignature.',
    severity: 'high',
    category: 'approval',
    timeAgo: '1h ago',
    entityName: 'Nexus Dynamics',
    assignee: 'Elena Rostova',
  },
  {
    id: 'att_4',
    title: 'Midwest Queue Connect Drop',
    description: 'Connect rate fell below 45% on Midwest batch. Routing adjustment recommended.',
    severity: 'low',
    category: 'anomaly',
    timeAgo: '2h ago',
  },
];

export const MOCK_RECENT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act_1',
    actor: 'Elena Rostova',
    actorInitials: 'ER',
    action: 'Logged successful 38m discovery call',
    target: 'BioSphere Innovations',
    timestamp: '8 mins ago',
    type: 'call',
    badgeLabel: 'Demo Scheduled',
  },
  {
    id: 'act_2',
    actor: 'FRIDAY Voice AI',
    actorInitials: 'AI',
    action: 'Scored call recording #FR-8891 (94/100)',
    target: 'Apex Global Corp',
    timestamp: '24 mins ago',
    type: 'ai_score',
    badgeLabel: 'Score: 94',
  },
  {
    id: 'act_3',
    actor: 'Marcus Vance',
    actorInitials: 'MV',
    action: 'Transferred high-intent lead to senior closer',
    target: 'Starlight Retail',
    timestamp: '42 mins ago',
    type: 'assignment',
    badgeLabel: 'Escalated',
  },
  {
    id: 'act_4',
    actor: 'Sofia Chen',
    actorInitials: 'SC',
    action: 'Sent formal master services agreement',
    target: 'Vanguard Systems',
    timestamp: '1h 15m ago',
    type: 'contract',
    badgeLabel: '$68,000 ARR',
  },
];

export const MOCK_EMPLOYEE_LEADS: EmployeeLead[] = [
  {
    id: 'lead_1',
    name: 'Sarah Montgomery',
    title: 'VP of Revenue Operations',
    company: 'Apex Global Corp',
    phone: '+1 (415) 890-2341',
    priority: 'urgent',
    status: 'scheduled',
    nextAction: 'Executive Demo & AI Walkthrough',
    scheduledTime: 'Today at 2:00 PM',
    dealValue: '$96,000',
  },
  {
    id: 'lead_2',
    name: 'Jonathan Reynolds',
    title: 'Chief Technology Officer',
    company: 'CloudScale Infrastructure',
    phone: '+1 (206) 431-8976',
    priority: 'high',
    status: 'negotiation',
    nextAction: 'Security Architecture Review',
    scheduledTime: 'Today at 3:30 PM',
    dealValue: '$72,000',
  },
  {
    id: 'lead_3',
    name: 'Amanda Lindqvist',
    title: 'Head of Outbound Sales',
    company: 'Nordic Velocity Group',
    phone: '+1 (312) 554-1029',
    priority: 'high',
    status: 'contacted',
    nextAction: 'Review Team Pilot Proposal',
    scheduledTime: 'Tomorrow at 10:00 AM',
    dealValue: '$48,000',
  },
  {
    id: 'lead_4',
    name: 'Devon Hayes',
    title: 'Director of Business Development',
    company: 'Echo Logistics',
    phone: '+1 (512) 670-9812',
    priority: 'medium',
    status: 'new',
    nextAction: 'Initial Outbound Discovery',
    scheduledTime: 'Tomorrow at 1:15 PM',
    dealValue: '$36,000',
  },
];

export const MOCK_FOLLOW_UPS: FollowUpItem[] = [
  {
    id: 'fu_1',
    leadName: 'Sarah Montgomery',
    company: 'Apex Global Corp',
    action: 'Demo confirmation & attendee checklist',
    time: 'In 45 mins',
    priority: 'urgent',
    isOverdue: false,
  },
  {
    id: 'fu_2',
    leadName: 'Michael Vance',
    company: 'Quantum Logistics',
    action: 'Send revised SOC2 Type II compliance pack',
    time: '1h overdue',
    priority: 'urgent',
    isOverdue: true,
  },
  {
    id: 'fu_3',
    leadName: 'Jonathan Reynolds',
    company: 'CloudScale Infrastructure',
    action: 'Share custom benchmark latency report',
    time: 'Today at 3:15 PM',
    priority: 'normal',
    isOverdue: false,
  },
  {
    id: 'fu_4',
    leadName: 'Clarissa Wu',
    company: 'Hyperion BioLabs',
    action: 'Follow up on Q3 pilot license approval',
    time: 'Tomorrow 9:00 AM',
    priority: 'normal',
    isOverdue: false,
  },
];

export const MOCK_EMPLOYEE_METRICS: EmployeeMetric[] = [
  {
    label: 'Daily Outbound Calls',
    current: 28,
    target: 35,
    unit: 'calls',
    percentage: 80,
  },
  {
    label: 'Live Connect Rate',
    current: 68,
    target: 60,
    unit: '%',
    percentage: 100,
  },
  {
    label: 'Qualified Meetings Set',
    current: 5,
    target: 6,
    unit: 'demos',
    percentage: 83,
  },
  {
    label: 'AI Pitch Adherence',
    current: 92,
    target: 85,
    unit: 'score',
    percentage: 100,
  },
];

export const MOCK_COACHING_GOALS: CoachingGoal[] = [
  {
    id: 'cg_1',
    title: 'Objection Handling: Pricing Pushback',
    description: 'Shift conversation from per-seat cost to ROI multiplier before quoting tier prices.',
    currentValue: 84,
    targetValue: 90,
    unit: '% adherence',
    status: 'on_track',
    dueDate: 'Sep 24, 2026',
  },
  {
    id: 'cg_2',
    title: 'Elevator Hook Velocity',
    description: 'Deliver problem statement and trigger resonance within first 35 seconds of call.',
    currentValue: 31,
    targetValue: 35,
    unit: 'sec duration',
    status: 'achieved',
    dueDate: 'Sep 21, 2026',
  },
  {
    id: 'cg_3',
    title: 'Executive Multi-Threading',
    description: 'Secure secondary stakeholder introduction on at least 60% of qualified calls.',
    currentValue: 48,
    targetValue: 60,
    unit: '% calls',
    status: 'needs_focus',
    dueDate: 'Sep 28, 2026',
  },
];
