import React from 'react';
import { cn } from '@/lib/utils';
import { PerformanceOverviewData } from '../performance.types';
import {
  PhoneCall,
  PhoneForwarded,
  Clock,
  Target,
  CheckCircle2,
  Sparkles,
  Bot,
  Info,
} from 'lucide-react';

export interface PerformanceOverviewProps {
  data: PerformanceOverviewData;
  className?: string;
}

export const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ data, className }) => {
  const items = [
    {
      label: 'Total Calls Logged',
      value: data.totalCalls.toString(),
      sub: `${data.connectedCalls} connected (${data.connectionRate})`,
      icon: PhoneCall,
      color: 'text-sky-400',
    },
    {
      label: 'Average Duration',
      value: data.avgDuration,
      sub: 'Standard deviation ±1m 14s',
      icon: Clock,
      color: 'text-amber-400',
    },
    {
      label: 'Conversion Rate',
      value: data.conversionRate,
      sub: 'Qualified, demo, or closed pipeline',
      icon: Target,
      color: 'text-indigo-400',
    },
    {
      label: 'Follow-up Completion',
      value: data.followUpCompletionRate,
      sub: 'Fulfilled within SLA schedule',
      icon: CheckCircle2,
      color: 'text-emerald-400',
    },
    {
      label: 'Average Quality Score',
      value: `${data.avgCallQualityScore}/100`,
      sub: 'Composite multi-dimension score',
      icon: Sparkles,
      color: 'text-purple-400',
    },
    {
      label: 'AI Outcome Agreement',
      value: data.aiOutcomeAgreementRate,
      sub: 'Autonomous vs human disposition match',
      icon: Bot,
      color: 'text-teal-400',
    },
  ];

  return (
    <div className={cn('p-5 rounded-2xl border border-white/10 bg-[#0c0c11]/80 backdrop-blur-xs space-y-4', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Operational Telemetry Overview
          </h3>
          <p className="text-xs text-slate-400">
            System-wide benchmarks across active calling queues and AI evaluations.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-300">
          <span>{data.period}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/15 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-mono truncate">{item.label}</span>
                <Icon className={cn('w-3.5 h-3.5', item.color)} />
              </div>
              <div className="text-xl font-bold font-mono text-white tracking-tight">
                {item.value}
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                {item.sub}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 pt-1">
        <Info className="w-3 h-3 text-slate-400 shrink-0" />
        <span>
          Sample Data Mode: Telemetry figures represent current sandbox validation cohorts.
        </span>
      </div>
    </div>
  );
};
