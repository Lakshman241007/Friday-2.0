import {
  CoachingProfile,
  Strength,
  ImprovementArea,
  CoachingGoal,
  BestPracticeCall,
  CoachingFeedbackItem,
} from './coaching.types';

export const INITIAL_COACHING_PROFILES: Record<string, CoachingProfile> = {
  'emp-1': {
    employeeId: 'emp-1',
    employeeName: 'Sarah Jenkins',
    role: 'Senior Account Executive',
    department: 'Enterprise Telematics',
    overallScore: 91,
    summaryFeedback:
      'Consistently demonstrates exceptional regulatory fluency and high conversational trust. Strong closing structure on complex enterprise pilots with disciplined next-step commitments.',
    strengths: [
      {
        id: 'str-1',
        title: 'Regulatory & Data Sovereignty Framing',
        category: 'objection',
        description: 'Effortlessly de-escalates security and compliance friction by clearly explaining encryption safeguards.',
        evidence: 'Handled German GDPR inquiry in call-901 at 02:05 without hesitation, converting caution into pilot interest.',
        callId: 'call-901',
        metric: '92% Objection Win Rate',
      },
      {
        id: 'str-2',
        title: 'Disciplined Calendar Commitments',
        category: 'closing',
        description: 'Never ends an exploratory session without explicit agreement on day, time, and stakeholder attendance.',
        evidence: 'Secured VP Engineering pilot slot in call-901 and locked contract onboarding in call-903.',
        callId: 'call-903',
        metric: '96.2% Follow-up Completion',
      },
      {
        id: 'str-3',
        title: 'Active Listening & Diarization Alignment',
        category: 'discovery',
        description: 'Mirrors prospect terminology and uses open-ended prompts to reveal latent CRM pain points.',
        evidence: 'Pinpointed ERP synchronization bottlenecks in Munich robotics hub within first 60 seconds.',
        callId: 'call-901',
        metric: '94% Diarization Match',
      },
    ],
    improvementAreas: [
      {
        id: 'imp-1',
        area: 'Earlier Commercial Budget Anchoring',
        category: 'pricing',
        evidence: 'In technical deep dives, pricing ranges are often deferred to the secondary pilot meeting.',
        suggestedPractice: 'Introduce ballpark annual tiers by minute 3 of discovery to pre-qualify budget authority.',
        relatedCallId: 'call-901',
        priority: 'Medium',
      },
      {
        id: 'imp-2',
        area: 'Pre-meeting Calendar Confirmation Notes',
        category: 'followup_timing',
        evidence: 'Follow-ups are logged reliably but calendar invitations occasionally omit the agenda outline.',
        suggestedPractice: 'Use standard 3-bullet pilot agenda template directly in the calendar invite description.',
        priority: 'Low',
      },
    ],
    goals: [
      {
        id: 'g-1',
        title: 'Deliver 10 Enterprise Compliance Dossiers',
        metricTarget: '10 Dossiers',
        currentValue: 8,
        targetValue: 10,
        deadline: 'Sep 30, 2026',
        status: 'In Progress',
        category: 'Compliance',
        notes: 'Targeting DACH region enterprise accounts.',
      },
      {
        id: 'g-2',
        title: 'Maintain >95% Follow-up Completion Rate',
        metricTarget: '95% On-Time',
        currentValue: 96,
        targetValue: 95,
        deadline: 'Ongoing Q3',
        status: 'Achieved',
        category: 'Operational SLA',
        notes: 'Current pace is 96.2%.',
      },
      {
        id: 'g-3',
        title: 'Pre-qualify Budget on 100% of New Pilots',
        metricTarget: '100% Prequalified',
        currentValue: 65,
        targetValue: 100,
        deadline: 'Oct 15, 2026',
        status: 'Needs Attention',
        category: 'Discovery',
        notes: 'Focus on enterprise procurement tiers early in call.',
      },
    ],
    feedback: [
      {
        id: 'fb-1',
        timestamp: 'Sep 18, 2026',
        author: 'Lakshman M.',
        authorRole: 'Operations Lead',
        callId: 'call-901',
        statement: 'Superb handling of Elena Rostova regarding Munich compliance restrictions.',
        evidenceReference: 'Audio section 02:05 - 03:10 in session #call-901.',
        actionableRecommendation: 'Ensure the engineering pilot packet is sent 24 hours in advance.',
      },
    ],
    bestPracticeCalls: [
      {
        id: 'bp-1',
        callId: 'call-903',
        leadName: 'Dr. Sophia Lin',
        company: 'Lumina Biotech',
        employeeId: 'emp-1',
        employeeName: 'Sarah Jenkins',
        date: 'Sep 16, 2026',
        duration: '07:15',
        outcome: 'Converted',
        relevantStrength: 'Clinical SLA Defense & Contract Closing',
        takeaway: 'Model example of answering regulatory privacy concerns and securing same-day MSA execution.',
        audioTimestampSeconds: 140,
      },
      {
        id: 'bp-2',
        callId: 'call-901',
        leadName: 'Elena Rostova',
        company: 'Apex Robotics',
        employeeId: 'emp-1',
        employeeName: 'Sarah Jenkins',
        date: 'Sep 18, 2026',
        duration: '04:18',
        outcome: 'Follow-up Required',
        relevantStrength: 'Trust Objection Handling',
        takeaway: 'Clear explanation of GDPR data residency without defensive pushback.',
        audioTimestampSeconds: 125,
      },
    ],
  },

  'emp-2': {
    employeeId: 'emp-2',
    employeeName: 'Alex Chen',
    role: 'Outbound Specialist',
    department: 'Mid-Market Velocity',
    overallScore: 86,
    summaryFeedback:
      'High outbound energy and rapid connect-to-qualification conversion. Opportunity to reinforce value anchoring when prospects push back on seat pricing.',
    strengths: [
      {
        id: 'str-201',
        title: 'High Velocity Qualification',
        category: 'discovery',
        description: 'Quickly assesses prospect technical fit within the first 90 seconds of outbound connection.',
        evidence: 'Qualified Marcus Vance (Hyperion Dynamics) in call-902 and surfaced 50-seat expansion potential.',
        callId: 'call-902',
        metric: '165 Calls / Week',
      },
      {
        id: 'str-202',
        title: 'Discovery Question Structure',
        category: 'discovery',
        description: 'Systematically maps telephony architecture and identifies existing CRM stack constraints.',
        evidence: 'Identified fragmented dialer logs as primary pain point in call-902.',
        callId: 'call-902',
        metric: '87% Discovery Depth',
      },
    ],
    improvementAreas: [
      {
        id: 'imp-201',
        area: 'Pricing Defense & Value Anchoring',
        category: 'pricing',
        evidence: 'Prospect pushed back on per-seat pricing at 01:45 in call-902; Alex conceded discounting possibility too early.',
        suggestedPractice: 'Anchor on engineering hours saved per agent before discussing volume price concessions.',
        relatedCallId: 'call-902',
        priority: 'High',
      },
      {
        id: 'imp-202',
        area: 'Follow-up SLA Adherence',
        category: 'followup_timing',
        evidence: 'Follow-up completion rate currently at 88.5%, trailing the 95% target.',
        suggestedPractice: 'Set 15-minute post-dial calendar block to process all pending callback logs.',
        priority: 'Medium',
      },
    ],
    goals: [
      {
        id: 'g-201',
        title: 'Elevate Follow-up Completion to 95%',
        metricTarget: '95% On-Time',
        currentValue: 88,
        targetValue: 95,
        deadline: 'Oct 01, 2026',
        status: 'In Progress',
        category: 'Operational SLA',
        notes: 'Reduce backlog in callback queue.',
      },
      {
        id: 'g-202',
        title: 'Complete 5 Value Anchoring Roleplays',
        metricTarget: '5 Sessions',
        currentValue: 3,
        targetValue: 5,
        deadline: 'Sep 25, 2026',
        status: 'In Progress',
        category: 'Skill Building',
        notes: 'Focus on enterprise per-seat objection playbooks.',
      },
    ],
    feedback: [
      {
        id: 'fb-201',
        timestamp: 'Sep 18, 2026',
        author: 'Lakshman M.',
        authorRole: 'Operations Lead',
        callId: 'call-902',
        statement: 'Great energy engaging Marcus Vance on outbound connect.',
        evidenceReference: 'Timestamp 00:30 in session #call-902.',
        actionableRecommendation: 'Anchor enterprise ROI metrics before answering pricing inquiries.',
      },
    ],
    bestPracticeCalls: [
      {
        id: 'bp-201',
        callId: 'call-903',
        leadName: 'Dr. Sophia Lin',
        company: 'Lumina Biotech',
        employeeId: 'emp-1',
        employeeName: 'Sarah Jenkins',
        date: 'Sep 16, 2026',
        duration: '07:15',
        outcome: 'Converted',
        relevantStrength: 'Price Defense & Contract Closing',
        takeaway: 'Study how Sarah defends pricing by tying cost to clinical trial velocity.',
        audioTimestampSeconds: 210,
      },
    ],
  },

  'emp-3': {
    employeeId: 'emp-3',
    employeeName: 'David Kim',
    role: 'Solutions Engineer',
    department: 'Technical Architectures',
    overallScore: 84,
    summaryFeedback:
      'Deep architectural acumen on webhook protocols and telematics pipelines. Needs to balance technical precision with commercial urgency to avoid prolonged deal cycles.',
    strengths: [
      {
        id: 'str-301',
        title: 'In-Depth API & Protocol Clarification',
        category: 'discovery',
        description: 'Instills confidence in technical buyers regarding latency, webhooks, and audio buffering.',
        evidence: 'Handled deep infrastructure inquiry on call-904 with CyberNetix engineering lead.',
        callId: 'call-904',
        metric: '89% Technical Credibility',
      },
    ],
    improvementAreas: [
      {
        id: 'imp-301',
        area: 'Follow-up Delivery Speed on Comparison Assets',
        category: 'followup_timing',
        evidence: 'Competitor comparison matrix for Liam Becker was 24 hours late (triggering overdue alert alt-101).',
        suggestedPractice: 'Use pre-approved product matrix templates rather than authoring custom technical docs from scratch.',
        relatedCallId: 'call-904',
        priority: 'High',
      },
    ],
    goals: [
      {
        id: 'g-301',
        title: 'Zero Overdue SLA Alerts in September',
        metricTarget: '0 Breaches',
        currentValue: 1,
        targetValue: 0,
        deadline: 'Sep 30, 2026',
        status: 'Needs Attention',
        category: 'Operational SLA',
      },
    ],
    feedback: [],
    bestPracticeCalls: [],
  },

  'usr_emp_01': {
    employeeId: 'usr_emp_01',
    employeeName: 'Elena Rostova',
    role: 'Account Executive',
    department: 'Outbound Velocity',
    overallScore: 88,
    summaryFeedback:
      'Strong communicative empathy, thorough discovery discipline, and disciplined calendar execution. Excellent conversational rapport with high conversion momentum.',
    strengths: [
      {
        id: 'str-401',
        title: 'High-Impact Rapport & Empathy',
        category: 'opening',
        description: 'Creates rapid conversational trust and surfaces prospect challenges organically.',
        evidence: 'Engaged Aria Montgomery (Quantum Innovations) in call-905 seamlessly.',
        callId: 'call-905',
        metric: '91% Rapport Score',
      },
      {
        id: 'str-402',
        title: 'Operational Follow-up Reliability',
        category: 'followup',
        description: 'Ranks among the top quartile for prompt follow-up documentation and CRM hygiene.',
        evidence: 'Logged Q4 architectural sync immediately post-call.',
        callId: 'call-905',
        metric: '93% Completion Rate',
      },
    ],
    improvementAreas: [
      {
        id: 'imp-401',
        area: 'Technical Webhook Escalation Protocols',
        category: 'discovery',
        evidence: 'When technical infrastructure questions arise, looping solutions engineering earlier prevents delays.',
        suggestedPractice: 'Invite Solutions Engineer (David Kim) directly into the first technical sync.',
        relatedCallId: 'call-905',
        priority: 'Medium',
      },
    ],
    goals: [
      {
        id: 'g-401',
        title: 'Book 15 Technical Architecture Syncs',
        metricTarget: '15 Syncs',
        currentValue: 11,
        targetValue: 15,
        deadline: 'Sep 30, 2026',
        status: 'In Progress',
        category: 'Pipeline',
      },
      {
        id: 'g-402',
        title: 'Maintain >90% AI Outcome Concordance',
        metricTarget: '90% Concordance',
        currentValue: 93,
        targetValue: 90,
        deadline: 'Ongoing Q3',
        status: 'Achieved',
        category: 'Quality',
      },
    ],
    feedback: [
      {
        id: 'fb-401',
        timestamp: 'Sep 17, 2026',
        author: 'Lakshman M.',
        authorRole: 'Operations Lead',
        callId: 'call-905',
        statement: 'Seamless engagement with Quantum Innovations; crisp calendar lock.',
        evidenceReference: 'Session #call-905 closing minutes.',
        actionableRecommendation: 'Loop David Kim into the follow-up demo for API rate limit questions.',
      },
    ],
    bestPracticeCalls: [
      {
        id: 'bp-401',
        callId: 'call-901',
        leadName: 'Elena Rostova',
        company: 'Apex Robotics',
        employeeId: 'emp-1',
        employeeName: 'Sarah Jenkins',
        date: 'Sep 18, 2026',
        duration: '04:18',
        outcome: 'Follow-up Required',
        relevantStrength: 'Regulatory Objection Handling',
        takeaway: 'Notice how Sarah addresses GDPR queries with factual poise.',
        audioTimestampSeconds: 125,
      },
    ],
  },
};

class CoachingStore {
  private profiles: Record<string, CoachingProfile> = { ...INITIAL_COACHING_PROFILES };
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

  getProfile(employeeId: string): CoachingProfile | undefined {
    return this.profiles[employeeId] || this.profiles['emp-1'];
  }

  updateGoal(
    employeeId: string,
    goalId: string,
    data: Partial<CoachingGoal>
  ): CoachingGoal | undefined {
    const profile = this.getProfile(employeeId);
    if (!profile) return undefined;
    const goalIdx = profile.goals.findIndex((g) => g.id === goalId);
    if (goalIdx === -1) return undefined;
    profile.goals[goalIdx] = { ...profile.goals[goalIdx], ...data };
    this.notify();
    return profile.goals[goalIdx];
  }

  addGoal(employeeId: string, goal: CoachingGoal): CoachingGoal {
    const profile = this.getProfile(employeeId);
    if (profile) {
      profile.goals.push(goal);
      this.notify();
    }
    return goal;
  }
}

export const coachingStore = new CoachingStore();

export const coachingApi = {
  async getCoaching(employeeId: string): Promise<CoachingProfile> {
    await new Promise((r) => setTimeout(r, 60));
    return coachingStore.getProfile(employeeId) || INITIAL_COACHING_PROFILES['emp-1'];
  },

  async getStrengths(employeeId: string): Promise<Strength[]> {
    await new Promise((r) => setTimeout(r, 40));
    const profile = coachingStore.getProfile(employeeId);
    return profile?.strengths || [];
  },

  async getImprovementAreas(employeeId: string): Promise<ImprovementArea[]> {
    await new Promise((r) => setTimeout(r, 40));
    const profile = coachingStore.getProfile(employeeId);
    return profile?.improvementAreas || [];
  },

  async getGoals(employeeId: string): Promise<CoachingGoal[]> {
    await new Promise((r) => setTimeout(r, 40));
    const profile = coachingStore.getProfile(employeeId);
    return profile?.goals || [];
  },

  async getBestPracticeCalls(employeeId: string): Promise<BestPracticeCall[]> {
    await new Promise((r) => setTimeout(r, 40));
    const profile = coachingStore.getProfile(employeeId);
    return profile?.bestPracticeCalls || [];
  },

  async updateGoal(
    employeeId: string,
    goalId: string,
    data: Partial<CoachingGoal>
  ): Promise<CoachingGoal | undefined> {
    await new Promise((r) => setTimeout(r, 60));
    return coachingStore.updateGoal(employeeId, goalId, data);
  },
};
