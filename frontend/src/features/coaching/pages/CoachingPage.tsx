import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Strengths } from '../components/Strengths';
import { ImprovementAreas } from '../components/ImprovementAreas';
import { CoachingGoals } from '../components/CoachingGoals';
import { GoalProgress } from '../components/GoalProgress';
import { CoachingFeedback } from '../components/CoachingFeedback';
import { BestPracticeCall } from '../components/BestPracticeCall';
import { coachingApi, coachingStore } from '../coaching.api';
import { CoachingProfile, GoalStatus, CoachingGoal } from '../coaching.types';
import { performanceApi } from '@/features/performance/performance.api';
import { authStore } from '@/features/auth/auth.store';
import { APP_NAME } from '@/lib/constants';
import {
  GraduationCap,
  User,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  Target,
  BarChart2,
} from 'lucide-react';

export interface CoachingPageProps {
  employeeId?: string;
}

export const CoachingPage: React.FC<CoachingPageProps> = ({ employeeId = 'emp-1' }) => {
  const [currentEmpId, setCurrentEmpId] = useState(employeeId);
  const [profile, setProfile] = useState<CoachingProfile | null>(null);
  const [employeesList, setEmployeesList] = useState<{ id: string; name: string; role: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const auth = authStore.getState();
  const isManager = auth.role === 'manager' || auth.role === 'admin';

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      coachingApi.getCoaching(currentEmpId),
      performanceApi.getEmployeeList(),
    ]).then(([coachingData, list]) => {
      setProfile(coachingData);
      setEmployeesList(list);
      setIsLoading(false);
    });

    const unsubscribe = coachingStore.subscribe(() => {
      setProfile(coachingStore.getProfile(currentEmpId) || null);
    });
    return unsubscribe;
  }, [currentEmpId]);

  const handleSelectEmployee = (id: string) => {
    setCurrentEmpId(id);
    window.location.hash = `/coaching/${id}`;
  };

  const handleGoalStatusChange = (goalId: string, status: GoalStatus) => {
    coachingStore.updateGoal(currentEmpId, goalId, { status });
  };

  const handleAddGoal = (goal: CoachingGoal) => {
    coachingStore.addGoal(currentEmpId, goal);
  };

  const handleNavigateToCall = (callId: string) => {
    window.location.hash = `/calling/${callId}`;
  };

  const handleNavigateToRecording = (callId: string) => {
    window.location.hash = `/recordings/${callId}`;
  };

  const handleNavigateToTranscript = (callId: string) => {
    window.location.hash = `/transcripts`;
  };

  const handleNavigateToAnalysis = (callId: string) => {
    window.location.hash = `/analysis/${callId}`;
  };

  if (isLoading || !profile) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-xs">
        Loading personalized coaching recommendations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHeader
        title={`AI Coaching Workspace — ${profile.employeeName}`}
        description="Evidence-based conversational feedback, capability rubrics, and targeted developmental goals."
        breadcrumbs={[
          { label: APP_NAME, href: '#/dashboard' },
          { label: 'Management' },
          { label: 'Coaching' },
          { label: profile.employeeName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.hash = `/performance/employee/${currentEmpId}`;
              }}
              className="h-8 text-xs text-slate-300 hover:text-white"
            >
              <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Performance Telemetry</span>
            </Button>
          </div>
        }
      />

      {/* REPRESENTATIVE SELECTOR (MANAGER MODE / QUICK SWITCH) */}
      <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>Active Representative:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {employeesList.map((emp) => (
            <button
              key={emp.id}
              type="button"
              onClick={() => handleSelectEmployee(emp.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                emp.id === currentEmpId
                  ? 'bg-white text-zinc-950 font-semibold'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <span>{emp.name}</span>
              <span className="text-[10px] font-mono text-slate-500 opacity-80">
                ({emp.role.split(' ')[0]})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* EXECUTIVE SUMMARY OVERVIEW CARD */}
      <div className="p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white">
                {profile.employeeName}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                • {profile.role} ({profile.department})
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {profile.summaryFeedback}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/[0.06] border border-purple-500/20 text-center min-w-[130px]">
            <div className="text-[10px] font-mono uppercase text-purple-300">
              Coaching Index
            </div>
            <div className="text-2xl font-bold font-mono text-purple-200 mt-0.5">
              {profile.overallScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: STRENGTHS & IMPROVEMENT AREAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Strengths
          strengths={profile.strengths}
          onNavigateToCall={handleNavigateToCall}
        />
        <ImprovementAreas
          improvementAreas={profile.improvementAreas}
          onNavigateToCall={handleNavigateToCall}
        />
      </div>

      {/* GOAL MILESTONES & INTERACTIVE OBJECTIVES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GoalProgress goals={profile.goals} />
        <CoachingGoals
          goals={profile.goals}
          onStatusChange={handleGoalStatusChange}
          onAddGoal={handleAddGoal}
        />
      </div>

      {/* EXEMPLAR BENCHMARK CALLS */}
      <BestPracticeCall
        calls={profile.bestPracticeCalls}
        onNavigateToRecording={handleNavigateToRecording}
        onNavigateToTranscript={handleNavigateToTranscript}
        onNavigateToAnalysis={handleNavigateToAnalysis}
      />

      {/* QUALITATIVE SUPERVISOR OBSERVATIONS */}
      {profile.feedback.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Supervisor Notes & Dialogue Debriefs
            </h4>
          </div>
          <CoachingFeedback
            feedback={profile.feedback}
            onNavigateToCall={handleNavigateToCall}
          />
        </div>
      )}
    </div>
  );
};
