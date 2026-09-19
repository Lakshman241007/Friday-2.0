import React from 'react';
import { cn } from '@/lib/utils';
import { CoachingGoal } from '../coaching.types';
import { Progress } from '@/components/ui/Progress';
import { Target, Calendar, CheckCircle2, Clock } from 'lucide-react';

export interface GoalProgressProps {
  goals: CoachingGoal[];
  className?: string;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goals, className }) => {
  return (
    <div className={cn('p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-4', className)}>
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Development Velocity & Goal Milestones
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          Target Tracking
        </span>
      </div>

      <div className="space-y-4">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentValue / (g.targetValue || 1)) * 100));
          const isDone = g.status === 'Achieved';

          return (
            <div key={g.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{g.title}</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white/[0.04] px-1.5 py-0.2 rounded">
                    {g.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-slate-400">
                    {g.currentValue} / {g.targetValue} ({pct}%)
                  </span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded border',
                      isDone
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                        : g.status === 'Needs Attention'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                        : 'bg-sky-500/10 text-sky-300 border-sky-500/25'
                    )}
                  >
                    {g.status}
                  </span>
                </div>
              </div>

              <Progress
                value={g.currentValue}
                max={g.targetValue}
                variant={isDone ? 'success' : 'accent'}
                className="h-1.5 bg-white/10"
              />

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>Target Deadline: {g.deadline}</span>
                </span>
                {g.notes && <span>{g.notes}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
