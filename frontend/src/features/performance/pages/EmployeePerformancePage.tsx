import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { performanceApi } from '../performance.api';
import { EmployeePerformance } from '../performance.types';
import { APP_NAME } from '@/lib/constants';
import {
  User,
  GraduationCap,
  ArrowLeft,
  Sparkles,
  PhoneCall,
  Target,
  CheckCircle2,
  Clock,
  Building2,
  Bot,
  ExternalLink,
} from 'lucide-react';

export interface EmployeePerformancePageProps {
  employeeId?: string;
}

export const EmployeePerformancePage: React.FC<EmployeePerformancePageProps> = ({
  employeeId = 'emp-1',
}) => {
  const [employee, setEmployee] = useState<EmployeePerformance | null>(null);
  const [allEmployees, setAllEmployees] = useState<{ id: string; name: string; role: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      performanceApi.getEmployeePerformance(employeeId),
      performanceApi.getEmployeeList(),
    ]).then(([empData, list]) => {
      setEmployee(empData || null);
      setAllEmployees(list);
      setIsLoading(false);
    });
  }, [employeeId]);

  const handleSelectOtherEmployee = (id: string) => {
    window.location.hash = `/performance/employee/${id}`;
  };

  const handleNavigateBack = () => {
    window.location.hash = '/performance';
  };

  const handleNavigateToCoaching = () => {
    if (employee) {
      window.location.hash = `/coaching/${employee.employeeId}`;
    }
  };

  const handleNavigateToCall = (callId: string) => {
    window.location.hash = `/calling/${callId}`;
  };

  if (isLoading || !employee) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-xs">
        Loading representative performance profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title={`${employee.employeeName} — Performance Telemetry`}
        description={`Individual benchmarks, call quality evaluation, and conversion progression for ${employee.role}.`}
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Management' },
          { label: 'Performance', href: '#/performance' },
          { label: employee.employeeName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateBack}
              className="h-8 text-xs text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Team Overview</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleNavigateToCoaching}
              className="h-8 text-xs bg-white text-zinc-950 hover:bg-slate-200"
            >
              <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
              <span>View Coaching Profile</span>
            </Button>
          </div>
        }
      />

      {/* REPRESENTATIVE SWITCHER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-xs">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>Switch Representative:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {allEmployees.map((emp) => (
            <button
              key={emp.id}
              type="button"
              onClick={() => handleSelectOtherEmployee(emp.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                emp.id === employee.employeeId
                  ? 'bg-white text-zinc-950 font-semibold'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {emp.name}
            </button>
          ))}
        </div>
      </div>

      {/* CORE OBSERVABLE KPI TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Calls Logged</span>
            <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {employee.totalCalls}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {employee.connectedCalls} connected
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Conversion Rate</span>
            <Target className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-300">
            {employee.conversionRate}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Team avg: 24.9%
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Quality Score</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300">
            {employee.callQualityScore}/100
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Benchmark: 80
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Follow-up Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {employee.followUpCompletionRate}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            On-time fulfillment
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>AI Agreement</span>
            <Bot className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono text-teal-300">
            {employee.aiOutcomeAgreement}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Disposition consistency
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Avg Duration</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">
            {employee.avgCallDuration}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Per connected session
          </div>
        </div>
      </div>

      {/* DIMENSIONAL CONVERSATION QUALITY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-4">
          <div className="space-y-0.5 pb-2 border-b border-white/[0.08]">
            <h3 className="text-sm font-semibold text-white">
              Call Quality Dimensions
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated conversational stages against standard operational rubrics.
            </p>
          </div>

          <div className="space-y-3.5">
            {employee.dimensions.map((dim, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium">{dim.dimension}</span>
                  <span className="font-mono text-purple-300 font-semibold">
                    {dim.score} <span className="text-slate-500 text-[10px]">/ 100</span>
                  </span>
                </div>
                <Progress value={dim.score} max={100} className="h-1.5 bg-white/10" />
                <p className="text-[11px] text-slate-400 leading-tight">
                  {dim.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT OBSERVED SESSIONS */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-4">
          <div className="space-y-0.5 pb-2 border-b border-white/[0.08]">
            <h3 className="text-sm font-semibold text-white">
              Recent Representative Sessions
            </h3>
            <p className="text-xs text-slate-400">
              Analyzed audio sessions with automated disposition and quality scoring.
            </p>
          </div>

          <div className="space-y-2.5">
            {employee.recentCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => handleNavigateToCall(call.id)}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-100 group-hover:text-white">
                      {call.leadName}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      #{call.id}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>{call.company}</span>
                    <span>•</span>
                    <span>{call.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="space-y-0.5">
                    <div className="font-mono text-xs font-semibold text-purple-300">
                      {call.qualityScore} pts
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400">
                      {call.outcome}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-200 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {/* Top competencies tags */}
          <div className="pt-2 border-t border-white/[0.05] space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
              Demonstrated Competencies
            </span>
            <div className="flex flex-wrap gap-1.5">
              {employee.topStrengths.map((st, i) => (
                <span
                  key={i}
                  className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-slate-300"
                >
                  {st}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
