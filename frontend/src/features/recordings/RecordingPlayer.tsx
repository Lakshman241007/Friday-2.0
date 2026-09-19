import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Recording, PlaybackState } from './recordings.types';
import { RecordingStatus } from './RecordingStatus';
import { Button } from '@/components/ui/Button';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Gauge,
  Info,
  Sliders,
} from 'lucide-react';

export interface RecordingPlayerProps {
  recording: Recording;
  seekTime?: number | null;
  onTimeUpdate?: (timeInSeconds: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  className?: string;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;

export const RecordingPlayer: React.FC<RecordingPlayerProps> = ({
  recording,
  seekTime,
  onTimeUpdate,
  onPlayStateChange,
  className,
}) => {
  const isAvailable = recording.status === 'available';
  const totalDuration = recording.durationSeconds || 180;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Sync external seek requests (e.g. clicking transcript message)
  useEffect(() => {
    if (seekTime !== undefined && seekTime !== null && isAvailable) {
      const boundedTime = Math.min(Math.max(0, seekTime), totalDuration);
      setCurrentTime(boundedTime);
      if (audioRef.current && recording.audioUrl) {
        audioRef.current.currentTime = boundedTime;
      }
      onTimeUpdate?.(boundedTime);
    }
  }, [seekTime, totalDuration, isAvailable, onTimeUpdate, recording.audioUrl]);

  // Handle play/pause lifecycle
  useEffect(() => {
    onPlayStateChange?.(isPlaying);

    if (!isAvailable) {
      setIsPlaying(false);
      return;
    }

    if (isPlaying) {
      if (audioRef.current && recording.audioUrl) {
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play().catch(() => {
          // Fallback to simulated playback if file is unplayable
        });
      }

      // Timer ticker for synchronized playback (advances by 0.25s every 250ms * playbackRate)
      const intervalStepMs = 250;
      tickerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const increment = (intervalStepMs / 1000) * playbackRate;
          const next = prev + increment;
          if (next >= totalDuration) {
            setIsPlaying(false);
            onTimeUpdate?.(totalDuration);
            return totalDuration;
          }
          onTimeUpdate?.(next);
          return next;
        });
      }, intervalStepMs);
    } else {
      if (audioRef.current && recording.audioUrl) {
        audioRef.current.pause();
      }
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
    }

    return () => {
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
      }
    };
  }, [isPlaying, isAvailable, playbackRate, totalDuration, recording.audioUrl, onPlayStateChange, onTimeUpdate]);

  // Keyboard navigation & accessibility controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting keystrokes if focused in inputs/textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isAvailable) {
          setIsPlaying((prev) => !prev);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeekRelative(-5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeekRelative(5);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAvailable, currentTime, totalDuration]);

  const handleTogglePlay = () => {
    if (!isAvailable) return;
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
      onTimeUpdate?.(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleSeekRelative = (seconds: number) => {
    if (!isAvailable) return;
    setCurrentTime((prev) => {
      const next = Math.min(Math.max(0, prev + seconds), totalDuration);
      if (audioRef.current && recording.audioUrl) {
        audioRef.current.currentTime = next;
      }
      onTimeUpdate?.(next);
      return next;
    });
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAvailable) return;
    const targetSeconds = parseFloat(e.target.value);
    setCurrentTime(targetSeconds);
    if (audioRef.current && recording.audioUrl) {
      audioRef.current.currentTime = targetSeconds;
    }
    onTimeUpdate?.(targetSeconds);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val;
    }
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, totalDuration - currentTime);
  const progressPercent = Math.min(100, (currentTime / Math.max(1, totalDuration)) * 100);

  return (
    <div
      className={cn(
        'rounded-xl bg-[#0c0c11]/90 border border-white/10 p-5 sm:p-6 backdrop-blur-xs space-y-5 select-none transition-all duration-200',
        className
      )}
      aria-label="Audio Recording Player"
    >
      {/* Hidden native audio element if audioUrl exists */}
      {recording.audioUrl && (
        <audio
          ref={audioRef}
          src={recording.audioUrl}
          preload="metadata"
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(totalDuration);
          }}
        />
      )}

      {/* Header Info & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Audio Telemetry
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-medium text-slate-200">
              Session #{recording.callId}
            </span>
          </div>
          <div className="text-sm font-semibold text-white">
            {recording.leadName} ({recording.company})
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <RecordingStatus
            status={isPlaying ? 'playing' : recording.status}
            size="md"
          />
        </div>
      </div>

      {/* Scrubber / Waveform Progress Area */}
      <div className="space-y-2">
        <div
          ref={progressBarRef}
          className="relative group w-full flex items-center h-5 cursor-pointer"
        >
          {/* Track background */}
          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden relative">
            {/* Filled Progress Bar */}
            <div
              className={cn(
                'h-full transition-all duration-75 rounded-full',
                isAvailable
                  ? 'bg-slate-100 group-hover:bg-white'
                  : 'bg-slate-600'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Range input for scrubbing */}
          <input
            type="range"
            min={0}
            max={totalDuration}
            step={0.5}
            value={currentTime}
            onChange={handleScrubberChange}
            disabled={!isAvailable}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Seek audio position"
            aria-valuemin={0}
            aria-valuemax={totalDuration}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(totalDuration)}`}
          />

          {/* Scrubber thumb handle indicator */}
          {isAvailable && (
            <div
              className="absolute w-3 h-3 rounded-full bg-white shadow-md shadow-black pointer-events-none transition-transform group-hover:scale-125"
              style={{
                left: `calc(${progressPercent}% - 6px)`,
              }}
            />
          )}
        </div>

        {/* Time Labels: Elapsed, Remaining, Total */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 tabular-nums">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{formatTime(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span>{formatTime(totalDuration)}</span>
          </div>

          <div className="text-[11px] text-slate-500">
            -{formatTime(remainingSeconds)} remaining
          </div>
        </div>
      </div>

      {/* Main Transport Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Left: Transport Buttons (Back 5s, Play/Pause, Fwd 5s) */}
        <div className="flex items-center gap-2 self-center sm:self-auto">
          <button
            type="button"
            onClick={() => handleSeekRelative(-5)}
            disabled={!isAvailable}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Rewind 5 seconds (Left Arrow)"
            aria-label="Rewind 5 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={!isAvailable}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 select-none shadow-md',
              isAvailable
                ? isPlaying
                  ? 'bg-white text-zinc-950 hover:bg-slate-200 active:scale-95'
                  : 'bg-white text-zinc-950 hover:bg-slate-100 active:scale-95'
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            )}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSeekRelative(5)}
            disabled={!isAvailable}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Forward 5 seconds (Right Arrow)"
            aria-label="Forward 5 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Speed Multiplier & Volume Slider */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          {/* Playback Rate Selector */}
          <div className="flex items-center gap-1 bg-[#09090d] p-1 rounded-lg border border-white/10">
            {PLAYBACK_SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setPlaybackRate(speed)}
                disabled={!isAvailable}
                className={cn(
                  'px-2 py-1 text-[11px] font-mono rounded transition-colors disabled:opacity-40',
                  playbackRate === speed
                    ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                )}
                aria-label={`Set speed to ${speed}x`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-amber-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              aria-label="Volume slider"
            />
          </div>
        </div>
      </div>

      {/* Unavailable State Notice */}
      {!isAvailable && (
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            {recording.status === 'processing'
              ? 'This recording is currently undergoing ingestion. Waveform audio will be available upon completion.'
              : recording.status === 'failed'
              ? 'Audio capture failed due to a network or SIP disconnect. No audio payload is available.'
              : 'Recording was disabled or opted out for this call session.'}
          </span>
        </div>
      )}
    </div>
  );
};
