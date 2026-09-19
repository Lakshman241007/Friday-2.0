import React from 'react';
import { cn } from '@/lib/utils';
import { FollowUpTimelineEvent } from '../followups.types';
import { PhoneCall, Sparkles, Target, CalendarPlus, CheckCircle2, Clock } from 'lucide-react';

export interface FollowUpTimelineProps {
  events?: FollowUpTimelineEvent[];
  className?: string;
  onCallClick?: (callId: string) => void;
  callId?: string;
}

export const FollowUpTimeline: React.FC<FollowUpTimelineProps> = ({
  events,
  className,
  onCallClick,
  callId,
}) => {
  const defaultEvents: FollowUpTimelineEvent[] = [
    {
      id: 'e1',
      time: '08:42',
      label: 'Telephony Session Completed',
      description: 'Audio capture duration 04:18 recorded with prospect.',
      type: 'call',
    },
    {
      id: 'e2',
      time: '08:51',
      label: 'AI Dialogue Analysis',
      description: 'Diarization & intent vector processed with 91% confidence.',
      type: 'analysis',
    },
    {
      id: 'e3',
      time: '08:52',
      label: 'Outcome Classified: Follow-up Required',
      description: 'Customer requested technical GDPR dossier and architecture check.',
      type: 'outcome',
    },
    {
      id: 'e4',
      time: '09:00',
      label: 'Operational Commitment Created',
      description: 'Follow-up registered in representative queue.',
      type: 'created',
    },
    {
      id: 'e5',
      time: 'Next Day 10:00 AM',
      label: 'Executive Demo Scheduled',
      description: 'Calendar invite delivered with technical meeting link.',
      type: 'scheduled',
    },
  ];

  const activeEvents = events && events.length > 0 ? events : defaultEvents;

  const getIcon = (type: FollowUpTimelineEvent['type']) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-slate-300" />;
      case 'analysis':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      case 'outcome':
        return <Target className="w-3.5 h-3.5 text-amber-400" />;
      case 'created':
        return <CalendarPlus className="w-3.5 h-3.5 text-sky-400" />;
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'scheduled':
      default:
        return <Clock className="w-3.5 h-3.5 text-emerald-300" />;
    }
  };

  return (
    <div className={cn('p-4 rounded-xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-4', className)}>
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Lifecycle & Evolution Pipeline
          </h4>
        </div>
        {callId && (
          <button
            type="button"
            onClick={() => onCallClick?.(callId)}
            className="text-[11px] font-mono text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
          >
            Call #{callId}
          </button>
        )}
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
        {activeEvents.map((evt, idx) => (
          <div key={evt.id || idx} className="relative group">
            {/* Step dot / icon */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#121218] border border-white/20 flex items-center justify-center">
              {getIcon(evt.type)}
            </div>

            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 font-semibold bg-white/[0.04] px-1.5 py-0.5 rounded">
                  {evt.time}
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {evt.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {evt.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
