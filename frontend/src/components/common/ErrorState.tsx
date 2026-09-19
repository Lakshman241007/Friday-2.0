import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Disruption Detected',
  message = 'An unexpected signal interruption prevented loading this section.',
  onRetry,
  retryLabel = 'Retry Connection',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center rounded-xl border border-red-500/20 bg-red-950/15 backdrop-blur-xs',
        className
      )}
    >
      <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3.5">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-red-200 tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="border-red-500/20 text-red-300 hover:bg-red-500/10"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
