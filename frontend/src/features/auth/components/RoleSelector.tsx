import React from 'react';
import { cn } from '@/lib/utils';
import { UserRole } from '../auth.types';
import { Shield, User as UserIcon } from 'lucide-react';

export interface RoleSelectorProps {
  selectedRole: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  className?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onChange,
  disabled = false,
  className,
}) => {
  const roles: Array<{ id: UserRole; label: string; description: string; icon: React.ComponentType<{ className?: string }> }> = [
    {
      id: 'manager',
      label: 'Manager',
      description: 'Operations & team telemetry',
      icon: Shield,
    },
    {
      id: 'employee',
      label: 'Employee',
      description: 'Active calls & assigned leads',
      icon: UserIcon,
    },
  ];

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-400 select-none">
          Demo Workspace Role
        </label>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          Simulation
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Select Demo Role"
        className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-[#0a0a0f] border border-white/[0.08]"
      >
        {roles.map((r) => {
          const isSelected = selectedRole === r.id;
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(r.id)}
              className={cn(
                'flex items-center gap-2 p-2 rounded-md text-left transition-all duration-150 outline-none focus-visible:ring-1 focus-visible:ring-white/30',
                isSelected
                  ? 'bg-white/10 text-white border border-white/20 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent',
                disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors',
                  isSelected ? 'bg-white/15 text-white' : 'bg-white/[0.04] text-slate-400'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold leading-tight">{r.label}</div>
                <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                  {r.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
