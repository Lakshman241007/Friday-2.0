import React from 'react';
import { CallHistoryItem } from '../calling.types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { History, PhoneCall, ExternalLink, Clock } from 'lucide-react';
import { formatPhoneNumber } from '@/features/leads/leads.utils';

export interface CallHistoryProps {
  history: CallHistoryItem[];
  onSelectCall?: (call: CallHistoryItem) => void;
  className?: string;
}

export const CallHistory: React.FC<CallHistoryProps> = ({
  history,
  onSelectCall,
  className,
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
        No call records logged in this session yet.
      </div>
    );
  }

  const getOutcomeBadge = (outcome: CallHistoryItem['outcome']) => {
    switch (outcome) {
      case 'converted':
        return <Badge variant="success" size="sm">Converted</Badge>;
      case 'interested':
        return <Badge variant="active" size="sm">Interested</Badge>;
      case 'follow_up_required':
        return <Badge variant="warning" size="sm">Follow-up</Badge>;
      case 'connected':
        return <Badge variant="active" size="sm">Connected</Badge>;
      case 'no_answer':
        return <Badge variant="neutral" size="sm">No Answer</Badge>;
      case 'busy':
        return <Badge variant="neutral" size="sm">Line Busy</Badge>;
      case 'not_interested':
      default:
        return <Badge variant="error" size="sm">Not Interested</Badge>;
    }
  };

  return (
    <div className={`space-y-3 ${className || ''}`}>
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Session Call Log & Dispositions ({history.length})
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Auto-synchronized with CRM
        </span>
      </div>

      <div className="divide-y divide-white/[0.05] border border-white/[0.08] rounded-xl bg-[#0c0c11]/70 overflow-hidden">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-white/[0.02] transition-colors"
          >
            {/* Left: Lead and Telephony Meta */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-100">
                  {item.leadName}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{item.company}</span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-slate-300">
                  {formatPhoneNumber(item.phoneNumber)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="text-slate-500">{item.date}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono text-slate-300">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {item.duration}
                </span>
                <span>•</span>
                <span>Rep: {item.employeeName}</span>
              </div>

              {item.notes && (
                <p className="text-[11px] text-slate-400 italic line-clamp-1 pt-0.5">
                  "{item.notes}"
                </p>
              )}
            </div>

            {/* Right: Outcome Badge & Action */}
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
              {getOutcomeBadge(item.outcome)}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onSelectCall) {
                    onSelectCall(item);
                  } else {
                    window.location.hash = `/calling/${item.id}`;
                  }
                }}
                className="h-7 text-xs px-2.5 text-slate-300 hover:text-white"
              >
                Details
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
