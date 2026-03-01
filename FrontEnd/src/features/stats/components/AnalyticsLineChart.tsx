import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsLineChartProps {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xDataKey: string;
  yDataKey: string;
  xLabel?: string;
  yLabel?: string;
  strokeColor?: string;
  gradientId: string;
  tooltipFormatter?: (value: number) => string;
}

export function AnalyticsLineChart({
  title,
  data,
  xDataKey,
  yDataKey,
  xLabel,
  yLabel,
  strokeColor = '#A8E6CF',
  gradientId,
  tooltipFormatter,
}: AnalyticsLineChartProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
      <h3 className="text-sm font-bold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis
            dataKey={xDataKey}
            tick={{ fontSize: 11, fill: '#636E72' }}
            axisLine={false}
            tickLine={false}
            label={
              xLabel
                ? { value: xLabel, position: 'insideBottom', offset: -2, fontSize: 11, fill: '#636E72' }
                : undefined
            }
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#636E72' }}
            axisLine={false}
            tickLine={false}
            width={40}
            label={
              yLabel
                ? { value: yLabel, angle: -90, position: 'insideLeft', offset: 4, fontSize: 11, fill: '#636E72' }
                : undefined
            }
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '12px',
            }}
            formatter={(value) => [
              tooltipFormatter ? tooltipFormatter(Number(value)) : value,
              yLabel ?? yDataKey,
            ]}
          />
          <Line
            type="monotone"
            dataKey={yDataKey}
            stroke={strokeColor}
            strokeWidth={2}
            dot={{ r: 3, fill: strokeColor }}
            activeDot={{ r: 5 }}
            fill={`url(#${gradientId})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
