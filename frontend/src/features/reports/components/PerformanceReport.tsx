import React from 'react';
import { cn } from '@/lib/utils';
import { PerformanceReportData } from '../reports.types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { LineChart, LineChartDataPoint } from '@/components/charts/LineChart';
import { PhoneCall, CheckCircle2, Target, Sparkles, Calendar } from 'lucide-react';

export interface PerformanceReportProps {
  data: PerformanceReportData;
  className?: string;
}

export const PerformanceReport: React.FC<PerformanceReportProps> = ({ data, className }) => {
  const chartData: LineChartDataPoint[] = data.dailyRows
    .slice()
    .reverse()
    .map((r) => ({
      label: r.date.split(',')[0],
      value: r.calls,
      secondaryValue: r.connected,
    }));

  return (
    <div className={cn('space-y-5', className)}>
      {/* Top High Level Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Calls Volume</span>
            <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {data.totalCalls}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {data.connectedCalls} connected ({data.connectionRate})
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Conversion Rate</span>
            <Target className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            {data.conversionRate}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Qualified pipeline velocity
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Follow-up Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {data.followUpCompletionRate}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {data.totalFollowUps} total commitments
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Average Quality</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {data.avgQualityScore} <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Composite AI rubric
          </div>
        </div>
      </div>

      {/* Daily Volume Trend Chart */}
      <div className="p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Session Volume & Connection Trend
          </h4>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-slate-200 rounded-full" />
              <span>Total Dialed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-sky-400 rounded-full" />
              <span>Connected</span>
            </span>
          </div>
        </div>

        <div className="pt-2">
          <LineChart
            data={chartData}
            height={200}
            strokeColor="#f8fafc"
            secondaryStrokeColor="#38bdf8"
          />
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#0c0c11]/80">
        <Table>
          <TableHeader>
            <tr>
              <TableHead className="w-[28%]">Calendar Date</TableHead>
              <TableHead className="w-[18%]">Dialed Sessions</TableHead>
              <TableHead className="w-[18%]">Connected Streams</TableHead>
              <TableHead className="w-[18%]">Follow-ups Logged</TableHead>
              <TableHead className="w-[18%] text-right">Avg Quality Score</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {data.dailyRows.map((row) => (
              <TableRow key={row.date} className="hover:bg-white/[0.02] transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{row.date}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-slate-200">{row.calls}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-sky-300">{row.connected}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-slate-300">{row.followUps}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-xs font-semibold text-purple-300">
                    {row.quality} / 100
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
