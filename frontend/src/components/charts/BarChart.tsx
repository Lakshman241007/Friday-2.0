import React from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface BarChartDataPoint {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  barColor?: string;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 240,
  barColor = '#e2e8f0',
  className,
}) => {
  return (
    <div className={cn('w-full h-full min-h-[200px]', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBar data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            stroke="rgba(255, 255, 255, 0.3)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis
            stroke="rgba(255, 255, 255, 0.3)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <RechartsTooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            contentStyle={{
              backgroundColor: '#0f0f15',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#f8fafc',
            }}
          />
          <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={36} />
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
};
