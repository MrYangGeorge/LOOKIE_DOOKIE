import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAlertnessStore } from '../store/alertnessStore';
import { getAlertnessColor, getAlertnessLabel } from '@/features/detection/telemetry/metrics.utils';

export function LiveAlertnessChart() {
  const dataPoints = useAlertnessStore((s) => s.dataPoints);
  const current = useAlertnessStore((s) => s.current);

  const latestScore = current?.alertnessScore ?? null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">Live Alertness</h3>
        {latestScore !== null && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: getAlertnessColor(latestScore),
              backgroundColor: `${getAlertnessColor(latestScore)}18`,
            }}
          >
            {getAlertnessLabel(latestScore)} · {Math.round(latestScore)}
          </span>
        )}
      </div>
      {dataPoints.length >= 2 ? (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={dataPoints}>
            <defs>
              <linearGradient id="liveAlertnessGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A8E6CF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A8E6CF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis
              dataKey="studyTime"
              tick={{ fontSize: 11, fill: '#636E72' }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Time (min)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#636E72' }}
            />
            <YAxis
              domain={[0, 100]}
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
              formatter={(value) => [value, 'Alertness']}
            />
            <Line
              type="monotone"
              dataKey="alertness"
              stroke="#A8E6CF"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              fill="url(#liveAlertnessGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
          Collecting data...
        </div>
      )}
    </div>
  );
}
