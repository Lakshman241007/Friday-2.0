import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { NAVIGATION_ITEMS, NavItemConfig, APP_NAME } from '@/lib/constants';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { useAuth } from '@/hooks/useAuth';
import { Login } from '@/features/auth/pages/Login';
import { Unauthorized } from '@/features/auth/pages/Unauthorized';
import { ManagerDashboard } from '@/features/dashboard/manager/ManagerDashboard';
import { EmployeeDashboard } from '@/features/dashboard/employee/EmployeeDashboard';
import { LeadsPage } from '@/features/leads/pages/LeadsPage';
import { CreateLeadPage } from '@/features/leads/pages/CreateLeadPage';
import { LeadDetailsPage } from '@/features/leads/pages/LeadDetailsPage';
import { AssignmentPage } from '@/features/assignment/pages/AssignmentPage';
import { DialerPage } from '@/features/calling/pages/DialerPage';
import { CallDetailsPage } from '@/features/calling/pages/CallDetailsPage';
import { RecordingsPage } from '@/features/recordings/pages/RecordingsPage';
import { TranscriptsPage } from '@/features/transcripts/pages/TranscriptsPage';
import { AnalysisPage } from '@/features/ai-analysis/pages/AnalysisPage';
import { OutcomesPage } from '@/features/outcomes/pages/OutcomesPage';
import { FollowUpsPage } from '@/features/followups/pages/FollowUpsPage';
import { AlertsPage } from '@/features/alerts/pages/AlertsPage';
import { TeamPerformancePage } from '@/features/performance/pages/TeamPerformancePage';
import { EmployeePerformancePage } from '@/features/performance/pages/EmployeePerformancePage';
import { CoachingPage } from '@/features/coaching/pages/CoachingPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { NotFound } from './NotFound';
import { Sparkles, Terminal } from 'lucide-react';

export interface RoutePlaceholderProps {
  item: NavItemConfig;
}

export const RoutePlaceholder: React.FC<RoutePlaceholderProps> = ({ item }) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title={item.label}
        description={item.description}
        badge={
          <Badge variant="neutral" size="sm" dot>
            Roadmap Reserved
          </Badge>
        }
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: item.group },
          { label: item.label },
        ]}
        metadata={
          <div className="flex items-center gap-3">
            <span>Route: {item.path}</span>
            <span>•</span>
            <span>Module: {item.id}</span>
            {item.roles && (
              <>
                <span>•</span>
                <span>Restricted: {item.roles.join(', ')}</span>
              </>
            )}
          </div>
        }
      />

      {/* Minimal Shell-Testing Content State */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0c0c11]/70 backdrop-blur-xs p-8 sm:p-14 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 shadow-xs">
          <Terminal className="w-5 h-5 text-slate-300" />
        </div>

        <div className="space-y-1">
          <div className="font-mono text-xs uppercase tracking-widest text-slate-500 font-semibold">
            {APP_NAME}
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Workspace foundation active.
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
          Application shell and navigation verified for <span className="text-slate-200 font-medium">{item.label}</span>.
          Feature functionality is scheduled for upcoming roadmap phases.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono text-slate-400 bg-white/[0.03] border border-white/[0.06]">
            <Sparkles className="w-3 h-3 text-slate-400" />
            Atmosphere: Galaxy Active
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            Navigation: Verified
          </span>
        </div>
      </div>
    </div>
  );
};

export interface RouteRegistryProps {
  currentPath: string;
}

/**
 * RouteRegistry (Phase 3)
 *
 * Directs routing between:
 * - /login -> Login Page
 * - /unauthorized -> Unauthorized Page
 * - /dashboard -> Role-aware Manager or Employee Dashboard
 * - Other routes -> Role-gated RoutePlaceholder views
 */
export const RouteRegistry: React.FC<RouteRegistryProps> = ({ currentPath }) => {
  const { role } = useAuth();
  const normalizedPath = currentPath === '/' ? '/dashboard' : currentPath;

  if (normalizedPath === '/login') {
    return <Login />;
  }

  if (normalizedPath === '/unauthorized') {
    return <Unauthorized />;
  }

  const [basePath] = normalizedPath.split('?');

  if (normalizedPath === '/dashboard') {
    return (
      <ProtectedRoute>
        {role === 'employee' ? <EmployeeDashboard /> : <ManagerDashboard />}
      </ProtectedRoute>
    );
  }

  // --- PHASE 4: LEADS ROUTES ---
  if (basePath === '/leads') {
    return (
      <ProtectedRoute>
        <LeadsPage />
      </ProtectedRoute>
    );
  }

  if (basePath === '/leads/create') {
    return (
      <ProtectedRoute>
        <CreateLeadPage />
      </ProtectedRoute>
    );
  }

  if (basePath.startsWith('/leads/')) {
    const leadId = basePath.replace('/leads/', '');
    return (
      <ProtectedRoute>
        <LeadDetailsPage leadId={leadId} />
      </ProtectedRoute>
    );
  }

  // --- PHASE 4: ASSIGNMENTS ROUTE (MANAGER / ADMIN GATED) ---
  if (basePath === '/assignments') {
    return (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['manager', 'admin']}>
          <AssignmentPage />
        </RoleRoute>
      </ProtectedRoute>
    );
  }

  // --- PHASE 4: CALLING ROUTES ---
  if (basePath === '/calling') {
    return (
      <ProtectedRoute>
        <DialerPage />
      </ProtectedRoute>
    );
  }

  if (basePath.startsWith('/calling/')) {
    const callId = basePath.replace('/calling/', '');
    return (
      <ProtectedRoute>
        <CallDetailsPage callId={callId} />
      </ProtectedRoute>
    );
  }

  // --- PHASE 5: RECORDINGS & TRANSCRIPTS ROUTES ---
  if (basePath === '/recordings') {
    return (
      <ProtectedRoute>
        <RecordingsPage />
      </ProtectedRoute>
    );
  }

  if (basePath.startsWith('/recordings/')) {
    const recordingId = basePath.replace('/recordings/', '');
    return (
      <ProtectedRoute>
        <RecordingsPage initialRecordingId={recordingId} defaultView="workspace" />
      </ProtectedRoute>
    );
  }

  if (basePath === '/transcripts') {
    return (
      <ProtectedRoute>
        <TranscriptsPage />
      </ProtectedRoute>
    );
  }

  // --- PHASE 6: AI ANALYSIS & OUTCOMES ROUTES ---
  if (basePath === '/analysis') {
    return (
      <ProtectedRoute>
        <AnalysisPage />
      </ProtectedRoute>
    );
  }

  if (basePath.startsWith('/analysis/')) {
    const callId = basePath.replace('/analysis/', '');
    return (
      <ProtectedRoute>
        <AnalysisPage callId={callId} />
      </ProtectedRoute>
    );
  }

  if (basePath === '/outcomes') {
    return (
      <ProtectedRoute>
        <OutcomesPage />
      </ProtectedRoute>
    );
  }

  // --- PHASE 7: FOLLOW-UPS & ALERTS ROUTES ---
  if (basePath === '/followups') {
    return (
      <ProtectedRoute>
        <FollowUpsPage />
      </ProtectedRoute>
    );
  }

  if (basePath === '/alerts') {
    return (
      <ProtectedRoute>
        <AlertsPage />
      </ProtectedRoute>
    );
  }

  // --- PHASE 7: PERFORMANCE & COACHING & REPORTS ROUTES ---
  if (basePath === '/performance') {
    return (
      <ProtectedRoute>
        <TeamPerformancePage />
      </ProtectedRoute>
    );
  }

  if (basePath.startsWith('/performance/employee/')) {
    const employeeId = basePath.replace('/performance/employee/', '');
    return (
      <ProtectedRoute>
        <EmployeePerformancePage employeeId={employeeId} />
      </ProtectedRoute>
    );
  }

  if (basePath === '/coaching') {
    return (
      <ProtectedRoute>
        <CoachingPage />
      </ProtectedRoute>
    );
  }

  if (basePath.startsWith('/coaching/')) {
    const employeeId = basePath.replace('/coaching/', '');
    return (
      <ProtectedRoute>
        <CoachingPage employeeId={employeeId} />
      </ProtectedRoute>
    );
  }

  if (basePath === '/reports') {
    return (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['manager', 'admin']}>
          <ReportsPage />
        </RoleRoute>
      </ProtectedRoute>
    );
  }

  if (basePath === '/404') {
    return (
      <ProtectedRoute>
        <NotFound attemptedPath={normalizedPath} />
      </ProtectedRoute>
    );
  }

  const currentItem = NAVIGATION_ITEMS.find((item) => item.path === normalizedPath);

  if (!currentItem) {
    return (
      <ProtectedRoute>
        <NotFound attemptedPath={normalizedPath} />
      </ProtectedRoute>
    );
  }

  const content = <RoutePlaceholder item={currentItem} />;

  // Wrap in RoleRoute if item has role requirements
  const roleGatedContent = currentItem.roles ? (
    <RoleRoute allowedRoles={currentItem.roles}>
      {content}
    </RoleRoute>
  ) : (
    content
  );

  return <ProtectedRoute>{roleGatedContent}</ProtectedRoute>;
};
