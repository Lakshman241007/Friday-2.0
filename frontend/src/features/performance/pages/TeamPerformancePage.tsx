import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PerformanceOverview } from '../components/PerformanceOverview';
import { PerformanceMetrics } from '../components/PerformanceMetrics';
import { CallQualityTrend } from '../components/CallQualityTrend';
import { ConversionTrend } from '../components/ConversionTrend';
import { EmployeeComparison } from '../components/EmployeeComparison';
import { performanceApi } from '../performance.api';
import { TeamPerformanceData } from '../performance.types';
import { APP_NAME } from '@/lib/constants';
import { Gauge, Users, GraduationCap, BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const TeamPerformancePage: React.FC = () => {
  const [data, setData] = useState<TeamPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    performanceApi.getTeamPerformance().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  const handleSelectEmployee = (employeeId: string) => {
    window.location.hash = `/performance/employee/${employeeId}`;
  };

  const handleNavigateToCoaching = (employeeId: string) => {
    window.location.hash = `/coaching/${employeeId}`;
  };

  const handleNavigateToReports = () => {
    window.location.hash = '/reports';
  };

  if (isLoading || !data) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-xs">
        Loading operational telemetry metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title="Team Operational Performance"
        description="Comprehensive conversation telemetry, quality benchmarks, and representative conversion velocity."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Management' },
          { label: 'Performance' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToReports}
              className="h-8 text-xs text-slate-300 hover:text-white"
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              <span>Full Reports</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigateToCoaching('emp-1')}
              className="h-8 text-xs text-slate-300 hover:text-white"
            >
              <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
              <span>Coaching Workspace</span>
            </Button>
          </div>
        }
      />

      {/* COMPREHENSIVE OVERVIEW BAR */}
      <PerformanceOverview data={data.overview} />

      {/* HIGH LEVEL STAT CARDS */}
      <PerformanceMetrics metrics={data.metrics} />

      {/* TREND VISUALIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CallQualityTrend trend={data.trend} />
        <ConversionTrend trend={data.trend} />
      </div>

      {/* DESCRIPTIVE EMPLOYEE BENCHMARK COMPARISON */}
      <EmployeeComparison
        employees={data.employees}
        onSelectEmployee={handleSelectEmployee}
        onNavigateToCoaching={handleNavigateToCoaching}
      />
    </div>
  );
};
