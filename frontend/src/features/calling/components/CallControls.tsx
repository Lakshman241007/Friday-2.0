import React from 'react';
import { Button } from '@/components/ui/Button';
import { CallStatus } from '../calling.types';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export interface CallControlsProps {
  status: CallStatus;
  isMuted: boolean;
  isOnHold: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onCallAgain: () => void;
  onSaveOutcome?: () => void;
  onViewDetails?: () => void;
  hasPhoneNumber?: boolean;
}

export const CallControls: React.FC<CallControlsProps> = ({
  status,
  isMuted,
  isOnHold,
  onStartCall,
  onEndCall,
  onToggleMute,
  onToggleHold,
  onCallAgain,
  onSaveOutcome,
  onViewDetails,
  hasPhoneNumber = true,
}) => {
  // Before call state: ready
  if (status === 'ready') {
    return (
      <div className="flex items-center justify-center w-full">
        <Button
          variant="primary"
          size="lg"
          disabled={!hasPhoneNumber}
          onClick={onStartCall}
          className="w-full max-w-sm h-12 text-sm bg-emerald-600 hover:bg-emerald-500 font-semibold shadow-lg shadow-emerald-950/40"
        >
          <Phone className="w-4 h-4 mr-2" />
          Initiate Outbound Session
        </Button>
      </div>
    );
  }

  // Dialing or Ringing state
  if (status === 'dialing' || status === 'ringing') {
    return (
      <div className="flex items-center justify-center w-full">
        <Button
          variant="destructive"
          size="lg"
          onClick={onEndCall}
          className="w-full max-w-sm h-12 text-sm font-semibold bg-red-600 hover:bg-red-500"
        >
          <PhoneOff className="w-4 h-4 mr-2" />
          Cancel Dialing
        </Button>
      </div>
    );
  }

  // Active call states: connected or on_hold
  if (status === 'connected' || status === 'on_hold') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md mx-auto">
        {/* Mute Button */}
        <Button
          variant="outline"
          size="md"
          onClick={onToggleMute}
          className={`flex-1 h-11 text-xs border ${
            isMuted
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'text-slate-200 hover:text-white border-white/10'
          }`}
        >
          {isMuted ? (
            <>
              <MicOff className="w-4 h-4 mr-1.5 text-amber-400" />
              Unmute
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-1.5" />
              Mute Mic
            </>
          )}
        </Button>

        {/* Hold Button */}
        <Button
          variant="outline"
          size="md"
          onClick={onToggleHold}
          className={`flex-1 h-11 text-xs border ${
            isOnHold
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'text-slate-200 hover:text-white border-white/10'
          }`}
        >
          {isOnHold ? (
            <>
              <Play className="w-4 h-4 mr-1.5 text-amber-400" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 mr-1.5" />
              Hold Call
            </>
          )}
        </Button>

        {/* End Call Button */}
        <Button
          variant="destructive"
          size="md"
          onClick={onEndCall}
          className="flex-1 h-11 text-xs bg-red-600 hover:bg-red-500 text-white font-semibold"
        >
          <PhoneOff className="w-4 h-4 mr-1.5" />
          End Session
        </Button>
      </div>
    );
  }

  // Completed or Failed state
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md mx-auto">
      <Button
        variant="outline"
        size="md"
        onClick={onCallAgain}
        className="flex-1 h-11 text-xs text-slate-200 hover:text-white"
      >
        <RotateCcw className="w-4 h-4 mr-1.5" />
        Redial Target
      </Button>

      {onSaveOutcome && (
        <Button
          variant="primary"
          size="md"
          onClick={onSaveOutcome}
          className="flex-1 h-11 text-xs bg-emerald-600 hover:bg-emerald-500"
        >
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          Log & Save Outcome
        </Button>
      )}

      {onViewDetails && (
        <Button
          variant="secondary"
          size="md"
          onClick={onViewDetails}
          className="flex-1 h-11 text-xs"
        >
          <FileText className="w-4 h-4 mr-1.5" />
          View Details
        </Button>
      )}
    </div>
  );
};
