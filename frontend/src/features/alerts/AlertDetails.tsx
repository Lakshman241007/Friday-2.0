import React from 'react';
import { cn } from '@/lib/utils';
import { Alert } from './alerts.types';
import { Button } from '@/components/ui/Button';
import {
  AlertCircle,
  Building2,
  CalendarClock,
  Clock,
  ExternalLink,
  PhoneCall,
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';

export interface AlertDetailsProps {
  alert: Alert | null;
  onClose: () => void;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
  className?: string;
}

export const AlertDetails: React.FC<AlertDetailsProps> = ({
  alert,
  onClose,
  onDismiss,
  onMarkRead,
  className,
}) => {
  if (!alert) return null;

  const handleNavigate = (url?: string) => {
    if (url) {
      window.location.hash = url.replace('#', '');
      onClose();
    }
  };

  return (
    <div className={cn('p-5 rounded-2xl border border-white/10 bg-[#0d0d14]/95 backdrop-blur-md space-y-5', className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
              {alert.priority} Priority Alert
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {alert.timestamp}
            </span>
          </div>
          <h3 className="text-base font-semibold text-white">
            {alert.title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Origin Reasoning & Cause */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
          System Cause & Telemetry Origin
        </span>
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-200 leading-relaxed space-y-2">
          <p>{alert.description}</p>
          {alert.reasoning && (
            <p className="text-[11px] text-slate-400 font-mono pt-2 border-t border-white/[0.05]">
              Logic: {alert.reasoning}
            </p>
          )}
        </div>
      </div>

      {/* Connected Entities Context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {alert.leadName && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Target Lead
            </div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>{alert.leadName}</span>
            </div>
            {alert.company && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-500" />
                <span>{alert.company}</span>
              </div>
            )}
          </div>
        )}

        {alert.employeeName && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              Responsible Agent
            </div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <User className="w-3 h-3 text-slate-400" />
              <span>{alert.employeeName}</span>
            </div>
            {alert.callId && (
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-slate-500" />
                <span>Origin Call #{alert.callId}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recommended Next Action */}
      {alert.recommendedAction && (
        <div className="p-3.5 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Recommended Operational Action</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {alert.recommendedAction}
          </p>
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          {alert.actionUrl && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleNavigate(alert.actionUrl)}
              className="text-xs bg-white text-zinc-950 hover:bg-slate-200"
            >
              <span>{alert.actionLabel || 'Execute Action'}</span>
              <ArrowRight className="w-3 h-3 ml-1.5" />
            </Button>
          )}

          {alert.status === 'unread' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(alert.id)}
              className="text-xs text-slate-400 hover:text-white"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Mark as read
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onDismiss(alert.id);
            onClose();
          }}
          className="text-xs text-rose-300 border-rose-500/30 hover:bg-rose-950/20"
        >
          Dismiss Alert
        </Button>
      </div>
    </div>
  );
};
