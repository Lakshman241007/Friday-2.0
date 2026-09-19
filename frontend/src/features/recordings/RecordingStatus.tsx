import React from 'react';
import { cn } from '@/lib/utils';
import { RecordingStatus as RecordingStatusType } from './recordings.types';
import {
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Slash,
  Volume2,
} from 'lucide-react';

export type ExtendedRecordingStatus = RecordingStatusType | 'playing';

export interface RecordingStatusProps {
  status: ExtendedRecordingStatus;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export const RecordingStatus: React.FC<RecordingStatusProps> = ({
  status,
  size = 'md',
  className,
  showIcon = true,
}) => {
  const configs: Record<
    ExtendedRecordingStatus,
    {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      containerStyle: string;
      iconStyle: string;
      dotStyle: string;
      ariaLabel: string;
    }
  > = {
    available: {
      label: 'Available',
      icon: CheckCircle2,
      containerStyle: 'bg-emerald-950/30 text-emerald-300 border-emerald-500/25',
      iconStyle: 'text-emerald-400',
      dotStyle: 'bg-emerald-400',
      ariaLabel: 'Recording is processed and available for playback',
    },
    playing: {
      label: 'Playing',
      icon: Volume2,
      containerStyle: 'bg-white/10 text-white border-white/30 shadow-xs shadow-white/5',
      iconStyle: 'text-white animate-pulse',
      dotStyle: 'bg-white animate-ping',
      ariaLabel: 'Recording is currently playing',
    },
    processing: {
      label: 'Processing',
      icon: Loader2,
      containerStyle: 'bg-amber-950/30 text-amber-300 border-amber-500/25',
      iconStyle: 'text-amber-400 animate-spin',
      dotStyle: 'bg-amber-400 animate-pulse',
      ariaLabel: 'Recording is currently being ingested or processed',
    },
    failed: {
      label: 'Failed',
      icon: AlertTriangle,
      containerStyle: 'bg-red-950/30 text-red-300 border-red-500/25',
      iconStyle: 'text-red-400',
      dotStyle: 'bg-red-400',
      ariaLabel: 'Recording capture failed',
    },
    unavailable: {
      label: 'Unavailable',
      icon: Slash,
      containerStyle: 'bg-white/[0.03] text-slate-400 border-white/[0.08]',
      iconStyle: 'text-slate-500',
      dotStyle: 'bg-slate-500',
      ariaLabel: 'Recording is unavailable for this session',
    },
  };

  const current = configs[status] || configs.unavailable;
  const IconComponent = current.icon;

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1.5'
      : 'text-xs px-2.5 py-1 gap-2';

  const iconSizes = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      role="status"
      aria-label={current.ariaLabel}
      className={cn(
        'inline-flex items-center font-mono font-medium rounded-full border select-none transition-all duration-150',
        sizeClasses,
        current.containerStyle,
        className
      )}
    >
      {showIcon && (
        <span className="flex items-center shrink-0" aria-hidden="true">
          <IconComponent className={cn(iconSizes, current.iconStyle)} />
        </span>
      )}

      <span>{current.label}</span>
    </span>
  );
};
