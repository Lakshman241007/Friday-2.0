import React from 'react';
import { cn } from '@/lib/utils';
import { ConversionReportData } from '../reports.types';
import { DonutChart } from '@/components/charts/DonutChart';
import { Target, CheckCircle2, PhoneCall, Clock, XCircle, ArrowRight } from 'lucide-react';

export interface ConversionReportProps {
  data: ConversionReportData;
  className?: string;
}

export const ConversionReport: React.FC<ConversionReportProps> = ({ data, className }) => {
  const donutData = data.stages.map((s) => ({
    name: s.stage,
    value: s.count,
    color: s.color,
  }));

  return (
    <div className={cn('space-y-5', className)}>
      {/* Top Conversion Funnel Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Total Sessions</div>
          <div className="text-xl font-bold font-mono text-white">{data.total}</div>
          <div className="text-[10px] text-slate-500 font-mono">100% Inbound/Outbound</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[10px] font-mono text-sky-400 uppercase">Qualified</div>
          <div className="text-xl font-bold font-mono text-sky-300">{data.qualified}</div>
          <div className="text-[10px] text-slate-500 font-mono">34.9% pipeline rate</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[10px] font-mono text-emerald-400 uppercase">Converted Deals</div>
          <div className="text-xl font-bold font-mono text-emerald-300">{data.converted}</div>
          <div className="text-[10px] text-slate-500 font-mono">24.9% win rate</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[10px] font-mono text-amber-400 uppercase">Follow-up Req.</div>
          <div className="text-xl font-bold font-mono text-amber-300">{data.followUpRequired}</div>
          <div className="text-[10px] text-slate-500 font-mono">21.3% active queues</div>
        </div>

        <div className="p-3.5 rounded-xl border border-white/10 bg-[#0c0c11]/80 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Not Interested</div>
          <div className="text-xl font-bold font-mono text-slate-400">{data.notInterested}</div>
          <div className="text-[10px] text-slate-500 font-mono">6.8% churned leads</div>
        </div>
      </div>

      {/* Visual Chart & Breakdown List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Donut Chart */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs flex flex-col items-center justify-center">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 self-start mb-2">
            Disposition Distribution
          </h4>
          <div className="w-full h-[220px]">
            <DonutChart
              data={donutData}
              height={220}
              innerRadius={55}
              outerRadius={80}
              centerLabel="Total Calls"
              centerValue={data.total}
            />
          </div>
        </div>

        {/* Right: Stage Table Breakdown */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-3.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Stage Velocity & Breakdown
          </h4>

          <div className="space-y-3">
            {data.stages.map((stage) => (
              <div key={stage.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color || '#94a3b8' }}
                    />
                    <span className="font-semibold text-slate-200">{stage.stage}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-300">{stage.count} sessions</span>
                    <span className="text-slate-500 font-semibold">{stage.percentage}%</span>
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${stage.percentage}%`,
                      backgroundColor: stage.color || '#94a3b8',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Aggregated across all verified telephony channels</span>
            <span className="text-emerald-400 font-medium">93.2% Resolution Accuracy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
