import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '@/lib/utils';

export interface DonutChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  data: DonutChartDataPoint[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
}

const DEFAULT_MONO_COLORS = ['#f8fafc', '#cbd5e1', '#94a3b8', '#475569', '#1e293b'];

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  height = 240,
  innerRadius = 60,
  outerRadius = 80,
  centerLabel,
  centerValue,
  className,
}) => {
  return (
    <div className={cn('relative w-full h-full min-h-[200px] flex items-center justify-center', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <RechartsTooltip
            contentStyle={{
              backgroundColor: '#0f0f15',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#f8fafc',
            }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_MONO_COLORS[index % DEFAULT_MONO_COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <span className="text-xl font-bold font-mono text-white tracking-tight">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
