import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface TrendChartProps {
  data: number[];
  height?: number;
  direction?: 'up' | 'down' | 'neutral';
  percentageChange?: string | number;
  label?: string;
  className?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  height = 48,
  direction = 'up',
  percentageChange,
  label,
  className,
}) => {
  const chartData = data.map((val, idx) => ({ index: idx, value: val }));

  const colorConfig = {
    up: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.12)', text: 'text-emerald-400' },
    down: { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.12)', text: 'text-rose-400' },
    neutral: { stroke: '#94a3b8', fill: 'rgba(148, 163, 184, 0.12)', text: 'text-slate-400' },
  };

  const current = colorConfig[direction];

  return (
    <div className={cn('flex items-center gap-3 w-full', className)}>
      <div className="flex-1" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <defs>
              <linearGradient id={`trendGrad-${direction}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={current.stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={current.stroke} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={current.stroke}
              strokeWidth={1.5}
              fill={`url(#trendGrad-${direction})`}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {(percentageChange !== undefined || label) && (
        <div className="flex flex-col items-end shrink-0">
          {percentageChange !== undefined && (
            <div className={cn('flex items-center gap-1 text-xs font-semibold font-mono', current.text)}>
              {direction === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {direction === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {direction === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              <span>{percentageChange}%</span>
            </div>
          )}
          {label && <span className="text-[10px] text-slate-500">{label}</span>}
        </div>
      )}
    </div>
  );
};
