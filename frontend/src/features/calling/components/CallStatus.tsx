import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { CallStatus as CallStatusType } from '../calling.types';

export interface CallStatusProps {
  status: CallStatusType;
  className?: string;
}

export const CallStatus: React.FC<CallStatusProps> = ({ status, className }) => {
  const config: Record<
    CallStatusType,
    { label: string; variant: 'active' | 'processing' | 'success' | 'warning' | 'error' | 'neutral'; pulse?: boolean }
  > = {
    ready: { label: 'Line Idle / Ready', variant: 'neutral' },
    dialing: { label: 'Dialing Target...', variant: 'processing', pulse: true },
    ringing: { label: 'Ringing Endpoint...', variant: 'processing', pulse: true },
    connected: { label: 'Active Voice Link', variant: 'success', pulse: true },
    on_hold: { label: 'Session On Hold', variant: 'warning' },
    completed: { label: 'Call Terminated', variant: 'neutral' },
    failed: { label: 'Call Disconnected', variant: 'error' },
  };

  const current = config[status] || { label: status, variant: 'neutral' };

  return (
    <div className={`inline-flex items-center gap-2 ${className || ''}`}>
      <Badge
        variant={current.variant}
        size="md"
        dot
        className={current.pulse ? 'animate-pulse' : undefined}
      >
        {current.label}
      </Badge>
    </div>
  );
};
