import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/common/ErrorState';
import { AssignedLeads } from './AssignedLeads';
import { FollowUpOverview } from './FollowUpOverview';
import { PerformanceSummary } from './PerformanceSummary';
import { CoachingGoals } from './CoachingGoals';
import {
  MOCK_EMPLOYEE_LEADS,
  MOCK_FOLLOW_UPS,
  MOCK_EMPLOYEE_METRICS,
  MOCK_COACHING_GOALS,
} from '../dashboard.data';
import { APP_NAME } from '@/lib/constants';
import { RefreshCw, PhoneCall, Sparkles } from 'lucide-react';

export interface EmployeeDashboardProps {
  initialState?: 'default' | 'loading' | 'empty' | 'error';
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  initialState = 'default',
}) => {
  const [viewState, setViewState] = useState<'default' | 'loading' | 'empty' | 'error'>(initialState);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsRefreshing(false);
    setViewState('default');
  };

  const isLoading = viewState === 'loading' || isRefreshing;
  const isEmpty = viewState === 'empty';
  const isError = viewState === 'error';

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Your current activity, performance and goals."
        badge={
          <Badge variant="active" size="sm" dot>
            Individual Workstation
          </Badge>
        }
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Outbound Queue' },
          { label: 'My Dashboard' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* Demo State Switcher */}
            <div className="hidden md:flex items-center bg-[#0a0a0f] p-0.5 rounded-lg border border-white/[0.08] text-[11px] font-mono">
              {(['default', 'loading', 'empty', 'error'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewState(mode)}
                  className={`px-2 py-1 rounded transition-colors capitalize ${
                    viewState === mode
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Queue
            </Button>
          </div>
        }
      />

      {/* Error State */}
      {isError ? (
        <ErrorState
          title="Queue Synchronization Failure"
          message="Unable to refresh assigned leads from the lead dispatcher. Please try reconnecting."
          onRetry={() => setViewState('default')}
          retryLabel="Retry Queue Sync"
        />
      ) : (
        <>
          {/* Section 1: Assigned Leads Preview */}
          <section aria-labelledby="leads-section-title">
            <h2 id="leads-section-title" className="sr-only">
              Assigned Leads
            </h2>
            <AssignedLeads
              leads={isEmpty ? [] : MOCK_EMPLOYEE_LEADS}
              isLoading={isLoading}
            />
          </section>

          {/* Section 2: Follow-up Overview & Performance Summary */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <FollowUpOverview
                items={isEmpty ? [] : MOCK_FOLLOW_UPS}
                isLoading={isLoading}
              />
            </div>
            <div className="lg:col-span-6">
              <PerformanceSummary
                metrics={isEmpty ? [] : MOCK_EMPLOYEE_METRICS}
                isLoading={isLoading}
              />
            </div>
          </section>

          {/* Section 3: Coaching Goals */}
          <section aria-labelledby="coaching-section-title">
            <h2 id="coaching-section-title" className="sr-only">
              Coaching Goals
            </h2>
            <CoachingGoals
              goals={isEmpty ? [] : MOCK_COACHING_GOALS}
              isLoading={isLoading}
            />
          </section>
        </>
      )}
    </div>
  );
};
