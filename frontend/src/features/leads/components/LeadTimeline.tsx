import React from 'react';
import { cn } from '@/lib/utils';
import { LeadTimelineEvent } from '../leads.types';
import {
  Sparkles,
  UserCheck,
  PhoneCall,
  CheckCircle2,
  CalendarClock,
  FileEdit,
} from 'lucide-react';

export interface LeadTimelineProps {
  events: LeadTimelineEvent[];
  className?: string;
}

export const LeadTimeline: React.FC<LeadTimelineProps> = ({ events, className }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-500">
        No recorded timeline events.
      </div>
    );
  }

  const getEventIcon = (type: LeadTimelineEvent['type']) => {
    switch (type) {
      case 'created':
        return <Sparkles className="w-3.5 h-3.5 text-slate-300" />;
      case 'assigned':
        return <UserCheck className="w-3.5 h-3.5 text-indigo-400" />;
      case 'call':
        return <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />;
      case 'status_change':
        return <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'follow_up':
        return <CalendarClock className="w-3.5 h-3.5 text-cyan-400" />;
      case 'note':
      default:
        return <FileEdit className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className={cn('relative space-y-4 pl-4 border-l border-white/[0.08] ml-2', className)}>
      {events.map((event) => (
        <div key={event.id} className="relative group">
          {/* Timeline Node Dot */}
          <div className="absolute -left-[23px] top-1 w-4.5 h-4.5 rounded-full bg-[#0d0d12] border border-white/20 flex items-center justify-center shadow-xs">
            {getEventIcon(event.type)}
          </div>

          {/* Event Content */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                {event.title}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {event.timestamp}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {event.description}
            </p>

            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pt-0.5">
              <span>Actor:</span>
              <span className="text-slate-400">{event.actor}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
