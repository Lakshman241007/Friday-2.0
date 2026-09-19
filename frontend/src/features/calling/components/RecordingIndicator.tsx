import React from 'react';
import { cn } from '@/lib/utils';
import { Circle, Shield } from 'lucide-react';

export type RecordingStatus = 'not_recording' | 'recording' | 'processing';

export interface RecordingIndicatorProps {
  status: RecordingStatus;
  className?: string;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  status,
  className,
}) => {
  if (status === 'not_recording') {
    return (
      <div className={cn('inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500', className)}>
        <Circle className="w-2 h-2 fill-slate-600 text-slate-600" />
        <span>REC Inactive</span>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className={cn('inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-400', className)}>
        <Circle className="w-2 h-2 fill-amber-400 text-amber-400 animate-spin" />
        <span>Saving Stream...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/25 text-red-400 text-[11px] font-mono',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      <span className="font-semibold tracking-wide">REC ACTIVE</span>
      <Shield className="w-3 h-3 text-red-400/80 ml-0.5" />
    </div>
  );
};
