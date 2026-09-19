import React from 'react';
import { cn } from '@/lib/utils';
import { CoachingGoal } from '../dashboard.data';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Award, Compass, Calendar, CheckCircle2 } from 'lucide-react';

export interface CoachingGoalsProps {
  goals: CoachingGoal[];
  isLoading?: boolean;
  className?: string;
}

export const CoachingGoals: React.FC<CoachingGoalsProps> = ({
  goals,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 p-5 space-y-4 animate-pulse', className)}>
        <div className="h-5 w-40 bg-white/[0.06] rounded" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/[0.04] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-xs p-5 flex flex-col justify-between',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
            Active Coaching Milestones
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manager-assigned speech techniques & AI adherence objectives
          </p>
        </div>
        <Badge variant="neutral" size="sm" dot>
          Sprint 38
        </Badge>
      </div>

      {/* Goals List */}
      <div className="divide-y divide-white/[0.04] mt-1">
        {goals.map((goal) => {
          const statusVariant =
            goal.status === 'achieved'
              ? 'success'
              : goal.status === 'on_track'
              ? 'processing'
              : 'warning';

          const percentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));

          return (
            <div
              key={goal.id}
              className="py-3.5 space-y-2 group hover:bg-white/[0.015] px-1 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    {goal.title}
                  </span>
                  <Badge variant={statusVariant} size="sm">
                    {goal.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Due {goal.dueDate}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {goal.description}
              </p>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">
                    Current: <strong className="text-white">{goal.currentValue}</strong> / Target: {goal.targetValue} {goal.unit}
                  </span>
                  <span className="text-slate-300 font-medium">{percentage}%</span>
                </div>
                <Progress
                  value={percentage}
                  size="sm"
                  variant={goal.status === 'achieved' ? 'success' : 'accent'}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
