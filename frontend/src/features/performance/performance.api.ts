import {
  TeamPerformanceData,
  EmployeePerformance,
  PerformanceOverviewData,
  PerformanceTrendPoint,
  PerformanceMetric,
} from './performance.types';

export const INITIAL_PERFORMANCE_TREND: PerformanceTrendPoint[] = [
  { date: 'Sep 12', qualityScore: 82, callsCount: 38, qualifiedCount: 14, convertedCount: 5 },
  { date: 'Sep 13', qualityScore: 84, callsCount: 42, qualifiedCount: 16, convertedCount: 6 },
  { date: 'Sep 14', qualityScore: 81, callsCount: 35, qualifiedCount: 11, convertedCount: 4 },
  { date: 'Sep 15', qualityScore: 86, callsCount: 48, qualifiedCount: 19, convertedCount: 8 },
  { date: 'Sep 16', qualityScore: 88, callsCount: 52, qualifiedCount: 22, convertedCount: 9 },
  { date: 'Sep 17', qualityScore: 85, callsCount: 46, qualifiedCount: 18, convertedCount: 7 },
  { date: 'Sep 18', qualityScore: 89, callsCount: 54, qualifiedCount: 24, convertedCount: 10 },
];

export const INITIAL_EMPLOYEES_PERFORMANCE: EmployeePerformance[] = [
  {
    employeeId: 'emp-1',
    employeeName: 'Sarah Jenkins',
    role: 'Senior Account Executive',
    avatarInitials: 'SJ',
    totalCalls: 142,
    connectedCalls: 128,
    conversionRate: '28.4%',
    conversionPercentage: 28.4,
    callQualityScore: 91,
    followUpCompletionRate: '96.2%',
    followUpCompletionPercentage: 96.2,
    aiOutcomeAgreement: '94.0%',
    avgCallDuration: '04:45',
    topStrengths: ['Regulatory Framing', 'Technical Objection Handling', 'Consistent Follow-through'],
    dimensions: [
      { dimension: 'Opening & Rapport', score: 94, target: 85, description: 'Clear context framing and professional tone.' },
      { dimension: 'Needs Discovery', score: 92, target: 85, description: 'Thorough exploration of telephony requirements.' },
      { dimension: 'Objection Handling', score: 89, target: 80, description: 'Addressed German GDPR compliance effectively.' },
      { dimension: 'Closing Commitment', score: 90, target: 80, description: 'Explicit next-step calendar agreements.' },
    ],
    recentCalls: [
      { id: 'call-901', leadName: 'Elena Rostova', company: 'Apex Robotics', outcome: 'Follow-up Required', qualityScore: 92, date: 'Sep 18, 2026' },
      { id: 'call-903', leadName: 'Dr. Sophia Lin', company: 'Lumina Biotech', outcome: 'Converted', qualityScore: 95, date: 'Sep 16, 2026' },
    ],
  },
  {
    employeeId: 'emp-2',
    employeeName: 'Alex Chen',
    role: 'Outbound Specialist',
    avatarInitials: 'AC',
    totalCalls: 165,
    connectedCalls: 139,
    conversionRate: '23.1%',
    conversionPercentage: 23.1,
    callQualityScore: 86,
    followUpCompletionRate: '88.5%',
    followUpCompletionPercentage: 88.5,
    aiOutcomeAgreement: '91.2%',
    avgCallDuration: '05:12',
    topStrengths: ['High Call Velocity', 'Discovery Rigor', 'Clear Solution Mapping'],
    dimensions: [
      { dimension: 'Opening & Rapport', score: 88, target: 85, description: 'Effective pattern interrupts on outbound connects.' },
      { dimension: 'Needs Discovery', score: 87, target: 85, description: 'Identifies buying committee roles early.' },
      { dimension: 'Objection Handling', score: 82, target: 80, description: 'Pricing objection navigation requires firmer anchoring.' },
      { dimension: 'Closing Commitment', score: 86, target: 80, description: 'Reliable callback lock-in.' },
    ],
    recentCalls: [
      { id: 'call-902', leadName: 'Marcus Vance', company: 'Hyperion Dynamics', outcome: 'Qualified', qualityScore: 87, date: 'Sep 18, 2026' },
    ],
  },
  {
    employeeId: 'emp-3',
    employeeName: 'David Kim',
    role: 'Solutions Engineer',
    avatarInitials: 'DK',
    totalCalls: 98,
    connectedCalls: 89,
    conversionRate: '21.5%',
    conversionPercentage: 21.5,
    callQualityScore: 84,
    followUpCompletionRate: '82.0%',
    followUpCompletionPercentage: 82.0,
    aiOutcomeAgreement: '89.5%',
    avgCallDuration: '06:30',
    topStrengths: ['Architecture Deep Dives', 'Security Documentation', 'API Integration Clarifications'],
    dimensions: [
      { dimension: 'Opening & Rapport', score: 82, target: 85, description: 'Can introduce business value earlier before technical specs.' },
      { dimension: 'Needs Discovery', score: 85, target: 85, description: 'Detailed infrastructure audit.' },
      { dimension: 'Objection Handling', score: 85, target: 80, description: 'Competitor comparison handling is solid.' },
      { dimension: 'Closing Commitment', score: 83, target: 80, description: 'Ensure SLA turnaround for follow-up assets.' },
    ],
    recentCalls: [
      { id: 'call-904', leadName: 'Liam Becker', company: 'CyberNetix AG', outcome: 'Not Interested', qualityScore: 81, date: 'Sep 17, 2026' },
    ],
  },
  {
    employeeId: 'usr_emp_01',
    employeeName: 'Elena Rostova',
    role: 'Account Executive',
    avatarInitials: 'ER',
    totalCalls: 122,
    connectedCalls: 110,
    conversionRate: '25.4%',
    conversionPercentage: 25.4,
    callQualityScore: 88,
    followUpCompletionRate: '93.0%',
    followUpCompletionPercentage: 93.0,
    aiOutcomeAgreement: '92.8%',
    avgCallDuration: '04:10',
    topStrengths: ['Rapid Engagement', 'Active Diarization Response', 'Disciplined CRM Logging'],
    dimensions: [
      { dimension: 'Opening & Rapport', score: 91, target: 85, description: 'Warm and concise opening framing.' },
      { dimension: 'Needs Discovery', score: 89, target: 85, description: 'Pinpoints software tool stack quickly.' },
      { dimension: 'Objection Handling', score: 86, target: 80, description: 'Effective timeline negotiation.' },
      { dimension: 'Closing Commitment', score: 87, target: 80, description: 'Secures explicit date and time commitments.' },
    ],
    recentCalls: [
      { id: 'call-905', leadName: 'Aria Montgomery', company: 'Quantum Innovations', outcome: 'Callback Requested', qualityScore: 89, date: 'Sep 16, 2026' },
    ],
  },
];

export const INITIAL_TEAM_PERFORMANCE: TeamPerformanceData = {
  overview: {
    totalCalls: 527,
    connectedCalls: 466,
    connectionRate: '88.4%',
    avgDuration: '05:08',
    conversionRate: '24.9%',
    followUpCompletionRate: '90.3%',
    avgCallQualityScore: 87,
    aiOutcomeAgreementRate: '92.1%',
    period: 'Trailing 7 Days (Sep 12 – Sep 18, 2026)',
  },
  metrics: [
    {
      id: 'm1',
      label: 'Total Sessions Logged',
      value: 527,
      change: '+14.2%',
      isPositive: true,
      description: 'Telephony sessions captured across all channels',
    },
    {
      id: 'm2',
      label: 'Connected Rate',
      value: '88.4%',
      change: '+2.1%',
      isPositive: true,
      description: 'Prospect pickup and audio stream connection',
    },
    {
      id: 'm3',
      label: 'Conversion Velocity',
      value: '24.9%',
      change: '+3.8%',
      isPositive: true,
      description: 'Calls advancing to qualified, demo, or contract status',
    },
    {
      id: 'm4',
      label: 'Average Quality Score',
      value: 87,
      change: '+4 pts',
      isPositive: true,
      description: 'Composite conversational structure benchmark (0-100)',
    },
  ],
  trend: INITIAL_PERFORMANCE_TREND,
  employees: INITIAL_EMPLOYEES_PERFORMANCE,
};

export const performanceApi = {
  async getTeamPerformance(): Promise<TeamPerformanceData> {
    await new Promise((r) => setTimeout(r, 60));
    return INITIAL_TEAM_PERFORMANCE;
  },

  async getEmployeePerformance(employeeId: string): Promise<EmployeePerformance | undefined> {
    await new Promise((r) => setTimeout(r, 50));
    return INITIAL_EMPLOYEES_PERFORMANCE.find(
      (e) => e.employeeId === employeeId || (employeeId === 'current' && e.employeeId === 'usr_emp_01')
    );
  },

  async getPerformanceTrend(): Promise<PerformanceTrendPoint[]> {
    await new Promise((r) => setTimeout(r, 40));
    return INITIAL_PERFORMANCE_TREND;
  },

  async getEmployeeList(): Promise<{ id: string; name: string; role: string }[]> {
    await new Promise((r) => setTimeout(r, 30));
    return INITIAL_EMPLOYEES_PERFORMANCE.map((e) => ({
      id: e.employeeId,
      name: e.employeeName,
      role: e.role,
    }));
  },
};
