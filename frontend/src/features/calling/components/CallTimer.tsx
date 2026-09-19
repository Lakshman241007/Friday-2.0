import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CallStatus } from '../calling.types';

export interface CallTimerProps {
  status: CallStatus;
  initialSeconds?: number;
  onTick?: (seconds: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CallTimer: React.FC<CallTimerProps> = ({
  status,
  initialSeconds = 0,
  onTick,
  className,
  size = 'md',
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (status === 'ready' || status === 'dialing' || status === 'ringing') {
      setSeconds(0);
      return;
    }

    if (status === 'connected') {
      const interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          onTick?.(next);
          return next;
        });
      }, 1000);

      return () => clearInterval(interval);
    }

    // on_hold or completed -> maintain current timer value
  }, [status, onTick]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    return `${formattedMins}:${formattedSecs}`;
  };

  const sizeStyles = {
    sm: 'text-xs font-mono',
    md: 'text-base font-mono font-semibold',
    lg: 'text-2xl sm:text-3xl font-mono font-bold tracking-tight',
  }[size];

  return (
    <div
      className={cn(
        'tabular-nums text-slate-100 flex items-center justify-center select-none',
        status === 'connected' ? 'text-white' : status === 'on_hold' ? 'text-amber-300' : 'text-slate-400',
        sizeStyles,
        className
      )}
    >
      {formatTime(seconds)}
    </div>
  );
};
