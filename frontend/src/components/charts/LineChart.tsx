import React from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface LineChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface LineChartProps {
  data: LineChartDataPoint[];
  height?: number;
  showGrid?: boolean;
  strokeColor?: string;
  secondaryStrokeColor?: string;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 240,
  showGrid = true,
  strokeColor = '#f8fafc',
  secondaryStrokeColor = '#64748b',
  className,
}) => {
  return (
    <div className={cn('w-full h-full min-h-[200px]', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLine data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="3 3"
              vertical={false}
            />
          )}
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
            contentStyle={{
              backgroundColor: '#0f0f15',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#f8fafc',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
            }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.8}
            dot={{ r: 3, fill: '#050507', stroke: strokeColor, strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: strokeColor, stroke: '#050507' }}
          />
          {data[0]?.secondaryValue !== undefined && (
            <Line
              type="monotone"
              dataKey="secondaryValue"
              stroke={secondaryStrokeColor}
              strokeWidth={1.4}
              strokeDasharray="4 4"
              dot={false}
            />
          )}
        </RechartsLine>
      </ResponsiveContainer>
    </div>
  );
};
