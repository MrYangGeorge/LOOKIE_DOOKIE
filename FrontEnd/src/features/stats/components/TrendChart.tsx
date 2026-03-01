import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TrendDataPoint } from '../hooks/useStats';

interface TrendChartProps {
  weeklyData: TrendDataPoint[];
  monthlyData: TrendDataPoint[];
}

export function TrendChart({ weeklyData, monthlyData }: TrendChartProps) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const data = period === 'week' ? weeklyData : monthlyData;

  const hasData = data.some((d) => d.focusHours > 0);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
      {/* Header with period toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">Focus Trend</h3>
        <div className="flex gap-0.5 bg-muted rounded-full p-0.5">
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              period === 'week'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              period === 'month'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A8E6CF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A8E6CF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#636E72' }}
              axisLine={false}
              tickLine={false}
              interval={period === 'month' ? 4 : 0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#636E72' }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value}h`, 'Focus']}
            />
            <Area
              type="monotone"
              dataKey="focusHours"
              stroke="#A8E6CF"
              strokeWidth={2}
              fill="url(#focusGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
          No focus data yet. Complete some sessions to see your trend!
        </div>
      )}
    </div>
  );
}
