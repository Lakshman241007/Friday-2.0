import React from 'react';
import { cn } from '@/lib/utils';
import { Recording } from './recordings.types';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Building2,
  Calendar,
  Clock,
  PhoneForwarded,
  Activity,
  FileAudio,
  HardDrive,
  Cpu,
} from 'lucide-react';

export interface RecordingMetadataViewProps {
  recording: Recording;
  className?: string;
}

export const RecordingMetadataView: React.FC<RecordingMetadataViewProps> = ({
  recording,
  className,
}) => {
  const meta = recording.metadata;

  return (
    <div
      className={cn(
        'rounded-xl bg-[#0c0c11]/80 border border-white/10 p-5 space-y-5',
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Session & Media Metadata
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          ID: {meta.callId}
        </span>
      </div>

      {/* Group 1: Participant Information */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          Participants & Routing
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
              <Building2 className="w-3.5 h-3.5" />
              <span>Target Lead / Org</span>
            </div>
            <div className="font-medium text-slate-100">{meta.leadName}</div>
            <div className="text-[11px] text-slate-400">{meta.company}</div>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
              <User className="w-3.5 h-3.5" />
              <span>Assigned Representative</span>
            </div>
            <div className="font-medium text-slate-100">{meta.employeeName}</div>
            <div className="text-[11px] text-slate-400 font-mono">Agent #{meta.employeeId}</div>
          </div>
        </div>
      </div>

      {/* Group 2: Call Lifecycle & Timeline */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          Timing & Outcome Disposition
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
              <Calendar className="w-3 h-3" />
              <span>Date</span>
            </div>
            <div className="font-mono text-slate-200 mt-1 font-medium truncate">
              {meta.callDate}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
              <Clock className="w-3 h-3" />
              <span>Duration</span>
            </div>
            <div className="font-mono text-emerald-400 mt-1 font-semibold">
              {meta.duration}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
              <PhoneForwarded className="w-3 h-3" />
              <span>Direction</span>
            </div>
            <div className="font-mono text-slate-200 mt-1 uppercase text-[11px]">
              {meta.direction}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
              <Activity className="w-3 h-3" />
              <span>Outcome</span>
            </div>
            <div className="text-slate-200 mt-1 font-medium truncate">
              {meta.callOutcome}
            </div>
          </div>
        </div>
      </div>

      {/* Group 3: Technical Audio Encoding Specification */}
      {meta.fileSize && (
        <div className="space-y-2 pt-1 border-t border-white/[0.04]">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Audio Payload Specification
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 p-2 rounded bg-white/[0.015]">
              <FileAudio className="w-3 h-3 text-slate-500" />
              <span>{meta.audioFormat}</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded bg-white/[0.015]">
              <HardDrive className="w-3 h-3 text-slate-500" />
              <span>{meta.fileSize}</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded bg-white/[0.015]">
              <Cpu className="w-3 h-3 text-slate-500" />
              <span>{meta.sampleRate || '48 kHz'}</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded bg-white/[0.015]">
              <span>{meta.channels === 2 ? 'Stereo Dual-Ch' : 'Mono Single-Ch'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
