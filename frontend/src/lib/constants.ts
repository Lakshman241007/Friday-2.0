import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  PhoneCall,
  Disc,
  FileText,
  BrainCircuit,
  Target,
  CalendarClock,
  BellRing,
  Gauge,
  GraduationCap,
  BarChart3,
} from 'lucide-react';

export const APP_NAME = 'FRIDAY';
export const APP_VERSION = '2.0.0-shell';

export type UserRole = 'manager' | 'employee' | 'admin';

export type NavGroup = 'MAIN' | 'INTELLIGENCE' | 'MANAGEMENT';

export interface NavItemConfig {
  id: string;
  path: string;
  label: string;
  iconName: string;
  group: NavGroup;
  roles?: UserRole[];
  badge?: string;
  badgeVariant?: 'neutral' | 'active' | 'success' | 'warning';
  description?: string;
}

export const NAV_GROUPS: { id: NavGroup; label: string }[] = [
  { id: 'MAIN', label: 'Main' },
  { id: 'INTELLIGENCE', label: 'Intelligence' },
  { id: 'MANAGEMENT', label: 'Management' },
];

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  // MAIN GROUP
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    iconName: 'LayoutDashboard',
    group: 'MAIN',
    description: 'Central workspace and real-time operations overview.',
  },
  {
    id: 'leads',
    path: '/leads',
    label: 'Leads',
    iconName: 'Users',
    group: 'MAIN',
    description: 'Lead repository, contact profiles, and qualification statuses.',
  },
  {
    id: 'assignments',
    path: '/assignments',
    label: 'Assignments',
    iconName: 'UserCheck',
    group: 'MAIN',
    roles: ['manager', 'admin'],
    description: 'Lead distribution, routing policies, and agent workload queues.',
  },
  {
    id: 'calling',
    path: '/calling',
    label: 'Calling',
    iconName: 'PhoneCall',
    group: 'MAIN',
    description: 'Active call management, dialer interface, and live session stream.',
  },

  // INTELLIGENCE GROUP
  {
    id: 'recordings',
    path: '/recordings',
    label: 'Recordings',
    iconName: 'Disc',
    group: 'INTELLIGENCE',
    description: 'Audio repository, dual-channel audio waveforms, and playback.',
  },
  {
    id: 'transcripts',
    path: '/transcripts',
    label: 'Transcripts',
    iconName: 'FileText',
    group: 'INTELLIGENCE',
    description: 'Timestamped conversational transcripts with speaker diarization.',
  },
  {
    id: 'analysis',
    path: '/analysis',
    label: 'AI Analysis',
    iconName: 'BrainCircuit',
    group: 'INTELLIGENCE',
    description: 'Autonomous dialogue evaluation, objection detection, and sentiment vectors.',
  },
  {
    id: 'outcomes',
    path: '/outcomes',
    label: 'Outcomes',
    iconName: 'Target',
    group: 'INTELLIGENCE',
    description: 'Call resolution categorization, disposition logging, and conversion scoring.',
  },

  // MANAGEMENT GROUP
  {
    id: 'followups',
    path: '/followups',
    label: 'Follow-ups',
    iconName: 'CalendarClock',
    group: 'MANAGEMENT',
    description: 'Scheduled reminders, pending customer commitments, and callback queue.',
  },
  {
    id: 'alerts',
    path: '/alerts',
    label: 'Alerts',
    iconName: 'BellRing',
    group: 'MANAGEMENT',
    description: 'Critical conversational alerts, compliance flags, and escalation triggers.',
  },
  {
    id: 'performance',
    path: '/performance',
    label: 'Performance',
    iconName: 'Gauge',
    group: 'MANAGEMENT',
    description: 'Agent telemetry, conversation benchmarks, and conversion velocity.',
  },
  {
    id: 'coaching',
    path: '/coaching',
    label: 'Coaching',
    iconName: 'GraduationCap',
    group: 'MANAGEMENT',
    description: 'Personalized AI coaching insights, recommended playbooks, and feedback loops.',
  },
  {
    id: 'reports',
    path: '/reports',
    label: 'Reports',
    iconName: 'BarChart3',
    group: 'MANAGEMENT',
    roles: ['manager', 'admin'],
    description: 'Comprehensive operational summaries, export pipelines, and aggregate trends.',
  },
];

export const NAV_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  UserCheck,
  PhoneCall,
  Disc,
  FileText,
  BrainCircuit,
  Target,
  CalendarClock,
  BellRing,
  Gauge,
  GraduationCap,
  BarChart3,
};

export const DEFAULT_ROUTE = '/dashboard';
