import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/common/ErrorState';
import { KPIOverview } from './KPIOverview';
import { TeamPerformance } from './TeamPerformance';
import { ConversionOverview } from './ConversionOverview';
import { AttentionFeed } from './AttentionFeed';
import { RecentActivity } from './RecentActivity';
import {
  MOCK_MANAGER_KPIS,
  MOCK_TEAM_PERFORMANCE,
  MOCK_CONVERSION_TRENDS,
  MOCK_ATTENTION_ITEMS,
  MOCK_RECENT_ACTIVITIES,
} from '../dashboard.data';
import { APP_NAME } from '@/lib/constants';
import { RefreshCw, Play, Shield, Activity } from 'lucide-react';

export interface ManagerDashboardProps {
  initialState?: 'default' | 'loading' | 'empty' | 'error';
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  initialState = 'default',
}) => {
  const [viewState, setViewState] = useState<'default' | 'loading' | 'empty' | 'error'>(initialState);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Micro-delay simulation
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
        description="Team overview and operational performance."
        badge={
          <Badge variant="active" size="sm" dot>
            Manager Intelligence
          </Badge>
        }
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Operations' },
          { label: 'Manager Dashboard' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* Demo State Switcher for Phase 3 evaluation */}
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
              Sync Telemetry
            </Button>
          </div>
        }
      />

      {/* Error State Evaluation */}
      {isError ? (
        <ErrorState
          title="Telemetry Feed Interrupted"
          message="Unable to establish a secure stream with the sales execution cluster. Check proxy configuration and retry."
          onRetry={() => setViewState('default')}
          retryLabel="Reconnect Stream"
        />
      ) : (
        <>
          {/* Section 1: KPI Overview */}
          <section aria-labelledby="kpi-section-title">
            <h2 id="kpi-section-title" className="sr-only">
              Key Metrics Overview
            </h2>
            <KPIOverview
              kpis={isEmpty ? [] : MOCK_MANAGER_KPIS}
              isLoading={isLoading}
            />
          </section>

          {/* Section 2: Team Performance + Conversion Overview */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <TeamPerformance
                members={isEmpty ? [] : MOCK_TEAM_PERFORMANCE}
                isLoading={isLoading}
              />
            </div>
            <div className="lg:col-span-5">
              <ConversionOverview
                data={isEmpty ? [] : MOCK_CONVERSION_TRENDS}
                isLoading={isLoading}
              />
            </div>
          </section>

          {/* Section 3: Attention Feed + Recent Activity */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <AttentionFeed
                items={isEmpty ? [] : MOCK_ATTENTION_ITEMS}
                isLoading={isLoading}
                onItemAction={() => {}}
              />
            </div>
            <div className="lg:col-span-6">
              <RecentActivity
                activities={isEmpty ? [] : MOCK_RECENT_ACTIVITIES}
                isLoading={isLoading}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
};
