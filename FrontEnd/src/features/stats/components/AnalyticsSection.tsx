import { AnalyticsLineChart } from './AnalyticsLineChart';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import {
  reactionTimeData,
  blinkRateData,
  brightnessAlertnessData,
  temperatureAlertnessData,
  periodAlertnessData,
} from '../data/chartMockData';

export function AnalyticsSection() {
  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-3">Study Analytics</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnalyticsLineChart
          title="Reaction Time vs Study Time"
          data={reactionTimeData}
          xDataKey="studyTime"
          yDataKey="reactionTime"
          xLabel="Study Time (min)"
          yLabel="Reaction (s)"
          strokeColor="#FFB7B2"
          gradientId="reactionGradient"
          tooltipFormatter={(v) => `${v.toFixed(2)}s`}
        />
        <AnalyticsLineChart
          title="Blink Rate vs Study Time"
          data={blinkRateData}
          xDataKey="studyTime"
          yDataKey="blinkRate"
          xLabel="Study Time (min)"
          yLabel="Blinks/min"
          strokeColor="#C3B1E1"
          gradientId="blinkGradient"
          tooltipFormatter={(v) => `${v.toFixed(1)}/min`}
        />
        <AnalyticsLineChart
          title="Alertness vs Brightness"
          data={brightnessAlertnessData}
          xDataKey="brightness"
          yDataKey="alertness"
          xLabel="Brightness (lux)"
          yLabel="Alertness"
          strokeColor="#A8E6CF"
          gradientId="brightnessGradient"
        />
        <AnalyticsLineChart
          title="Alertness vs Temperature"
          data={temperatureAlertnessData}
          xDataKey="temperature"
          yDataKey="alertness"
          xLabel="Temperature (°F)"
          yLabel="Alertness"
          strokeColor="var(--chart-4, #FFEAA7)"
          gradientId="temperatureGradient"
        />
        <div className="lg:col-span-2">
          <AnalyticsBarChart
            title="Alertness by Time of Day"
            data={periodAlertnessData}
            xDataKey="period"
            yDataKey="alertness"
            yLabel="Alertness"
            fillColor="#A8E6CF"
            gradientId="periodGradient"
          />
        </div>
      </div>
    </div>
  );
}
