import { Clock, Moon, Flame, CheckCircle } from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { StatCard } from './StatCard';
import { TrendChart } from './TrendChart';
import { StreakDisplay } from './StreakDisplay';
import { SessionHistory } from './SessionHistory';
import { AnalyticsSection } from './AnalyticsSection';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function Dashboard() {
  const { todayStats, streak, weeklyTrend, monthlyTrend, allTimeStats } = useStats();

  return (
    <div className="space-y-6">
      {/* Today's stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Clock size={18} />}
          label="Today's Focus"
          value={formatDuration(todayStats.totalFocusSeconds)}
          color="primary"
        />
        <StatCard
          icon={<Moon size={18} />}
          label="Sleepy Count"
          value={todayStats.sleepyCount}
          color="secondary"
        />
        <StatCard
          icon={<Flame size={18} />}
          label="Streak"
          value={`${streak.currentStreak}d`}
          color="accent"
        />
        <StatCard
          icon={<CheckCircle size={18} />}
          label="Sessions Today"
          value={todayStats.sessionsCompleted}
          color="primary"
        />
      </div>

      {/* All-time summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-border flex items-center justify-around text-center">
        <div>
          <p className="text-lg font-extrabold text-foreground">{allTimeStats.totalSessions}</p>
          <p className="text-xs text-muted-foreground font-semibold">Total Sessions</p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div>
          <p className="text-lg font-extrabold text-foreground">
            {formatDuration(allTimeStats.totalFocusSeconds)}
          </p>
          <p className="text-xs text-muted-foreground font-semibold">Total Focus</p>
        </div>
      </div>

      {/* Streak display */}
      <StreakDisplay streak={streak} />

      {/* Trend chart */}
      <TrendChart weeklyData={weeklyTrend} monthlyData={monthlyTrend} />

      {/* Session history */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Recent Sessions</h3>
        <SessionHistory />
      </div>

      {/* Study analytics charts */}
      <AnalyticsSection />
    </div>
  );
}
