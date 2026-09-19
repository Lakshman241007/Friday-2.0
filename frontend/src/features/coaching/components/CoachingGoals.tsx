import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { CoachingGoal, GoalStatus } from '../coaching.types';
import { Button } from '@/components/ui/Button';
import { Target, CheckCircle2, AlertCircle, Clock, Plus } from 'lucide-react';

export interface CoachingGoalsProps {
  goals: CoachingGoal[];
  onStatusChange?: (goalId: string, newStatus: GoalStatus) => void;
  onAddGoal?: (goal: CoachingGoal) => void;
  className?: string;
}

export const CoachingGoals: React.FC<CoachingGoalsProps> = ({
  goals,
  onStatusChange,
  onAddGoal,
  className,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState(10);
  const [deadline, setDeadline] = useState('Oct 15, 2026');
  const [category, setCategory] = useState('Discovery');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddGoal?.({
      id: `g-${Date.now()}`,
      title,
      metricTarget: `${targetValue} units`,
      currentValue: 0,
      targetValue: Number(targetValue),
      deadline,
      status: 'In Progress',
      category,
    });

    setTitle('');
    setIsAdding(false);
  };

  const getStatusBadge = (status: GoalStatus) => {
    switch (status) {
      case 'Achieved':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
      case 'Needs Attention':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
      case 'In Progress':
      default:
        return 'bg-sky-500/10 text-sky-300 border-sky-500/25';
    }
  };

  const nextStatus = (curr: GoalStatus): GoalStatus => {
    if (curr === 'In Progress') return 'Achieved';
    if (curr === 'Achieved') return 'Needs Attention';
    return 'In Progress';
  };

  return (
    <div className={cn('p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-4', className)}>
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Active Professional Objectives
          </h4>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="h-6 px-2 text-[11px] text-slate-300 hover:text-white"
        >
          <Plus className="w-3 h-3 mr-1" />
          <span>{isAdding ? 'Cancel' : 'Add Objective'}</span>
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="p-3 rounded-lg bg-white/[0.03] border border-white/10 space-y-3">
          <div className="text-xs font-semibold text-white">Set New Development Goal</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="e.g. Conduct 5 technical pilot reviews"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#121218] border border-white/10 text-xs text-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-white/30"
              required
            />
            <input
              type="text"
              placeholder="Deadline: e.g. Oct 30, 2026"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-[#121218] border border-white/10 text-xs text-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-white/30"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(false)}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="h-7 text-xs bg-white text-zinc-950">
              Save Goal
            </Button>
          </div>
        </form>
      )}

      <div className="divide-y divide-white/[0.05]">
        {goals.map((goal) => (
          <div key={goal.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-200">{goal.title}</div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <span>Target: {goal.metricTarget}</span>
                <span>•</span>
                <span>Deadline: {goal.deadline}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStatusChange?.(goal.id, nextStatus(goal.status))}
              className={cn(
                'font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded border transition-all cursor-pointer hover:opacity-80',
                getStatusBadge(goal.status)
              )}
              title="Click to cycle status"
            >
              {goal.status}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
