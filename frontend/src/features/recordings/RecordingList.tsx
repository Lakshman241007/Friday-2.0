import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Recording, RecordingStatus as RecordingStatusType } from './recordings.types';
import { RecordingStatus } from './RecordingStatus';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/common/SearchBar';
import {
  Play,
  FileText,
  Clock,
  Building2,
  Calendar,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export interface RecordingListProps {
  recordings: Recording[];
  selectedRecordingId?: string;
  onSelectRecording: (recording: Recording) => void;
  onOpenTranscript?: (recording: Recording) => void;
  isLoading?: boolean;
  className?: string;
}

export const RecordingList: React.FC<RecordingListProps> = ({
  recordings,
  selectedRecordingId,
  onSelectRecording,
  onOpenTranscript,
  isLoading = false,
  className,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RecordingStatusType>('all');

  const filtered = useMemo(() => {
    return recordings.filter((rec) => {
      if (statusFilter !== 'all' && rec.status !== statusFilter) {
        return false;
      }
      if (search.trim() !== '') {
        const q = search.toLowerCase();
        return (
          rec.leadName.toLowerCase().includes(q) ||
          rec.company.toLowerCase().includes(q) ||
          rec.employeeName.toLowerCase().includes(q) ||
          rec.callId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [recordings, statusFilter, search]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls Bar: Search & Filter Tabs */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0c0c11]/80 backdrop-blur-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by prospect, company, agent or session ID..."
          className="max-w-md w-full"
        />

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1 bg-[#09090d] p-1 rounded-lg border border-white/10 overflow-x-auto">
          {(['all', 'available', 'processing', 'failed', 'unavailable'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setStatusFilter(mode)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded capitalize whitespace-nowrap transition-colors',
                statusFilter === mode
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Recordings Table */}
      <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#0c0c11]/80">
        <Table
          isLoading={isLoading}
          isEmpty={filtered.length === 0}
          emptyMessage={
            search || statusFilter !== 'all'
              ? 'No recordings match your current filters.'
              : 'No audio recordings logged in the archive.'
          }
        >
          <TableHeader>
            <tr>
              <TableHead className="w-[30%]">Lead & Organization</TableHead>
              <TableHead className="w-[20%]">Representative</TableHead>
              <TableHead className="w-[18%]">Session Date & Time</TableHead>
              <TableHead className="w-[12%]">Duration</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[8%] text-right">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filtered.map((rec) => {
              const isSelected = rec.id === selectedRecordingId;
              const isAvailable = rec.status === 'available';

              return (
                <TableRow
                  key={rec.id}
                  onClick={() => onSelectRecording(rec)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-white/[0.08]'
                      : 'hover:bg-white/[0.03]'
                  )}
                >
                  {/* Lead & Company */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100">
                        {rec.leadName}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>{rec.company}</span>
                        <span className="text-slate-600 font-mono">•</span>
                        <span className="font-mono text-[10px] text-slate-500">
                          #{rec.callId}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Representative */}
                  <TableCell>
                    <div className="text-xs font-medium text-slate-200">
                      {rec.employeeName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Agent #{rec.employeeId}
                    </div>
                  </TableCell>

                  {/* Date & Time */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{rec.date}</span>
                    </div>
                  </TableCell>

                  {/* Duration */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{rec.duration}</span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <RecordingStatus status={rec.status} size="sm" />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant={isSelected ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => onSelectRecording(rec)}
                        className="h-7 px-2.5 text-xs"
                        title="Open in Recording Workspace"
                      >
                        <Play className="w-3 h-3 mr-1 fill-current" />
                        {isSelected ? 'Selected' : 'Review'}
                      </Button>

                      {rec.transcriptId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onSelectRecording(rec);
                            onOpenTranscript?.(rec);
                          }}
                          className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                          title="Jump to Transcript"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
