import { useMemo } from 'react';
import { useSessionStore, type SessionRecord } from '../store/sessionStore';

// ─── Types ────────────────────────────────────────────────────────────────

export interface TodayStats {
  totalFocusSeconds: number;
  sleepyCount: number;
  sessionsCompleted: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
}

export interface TrendDataPoint {
  date: string;
  label: string;
  focusHours: number;
  sleepyCount: number;
}

// ─── Streak Computation ───────────────────────────────────────────────────

function computeStreak(sessions: SessionRecord[]): StreakInfo {
  // Get unique dates with completed sessions, sorted descending
  const completedDates = [
    ...new Set(sessions.filter((s) => s.completed).map((s) => s.date)),
  ].sort().reverse();

  if (completedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Compute longest streak across all dates
  let longest = 1;
  let streak = 1;
  const sortedAsc = [...completedDates].reverse();

  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = new Date(sortedAsc[i - 1]);
    const curr = new Date(sortedAsc[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);

    if (diffDays === 1) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 1;
    }
  }

  // Compute current streak (must include today or yesterday)
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];

  if (completedDates[0] !== today && completedDates[0] !== yesterday) {
    return { currentStreak: 0, longestStreak: longest };
  }

  let current = 1;
  for (let i = 1; i < completedDates.length; i++) {
    const prev = new Date(completedDates[i - 1]);
    const curr = new Date(completedDates[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86_400_000);

    if (diffDays === 1) {
      current++;
    } else {
      break;
    }
  }

  return { currentStreak: current, longestStreak: Math.max(current, longest) };
}

// ─── Trend Data Computation ──────────────────────────────────────────────

function computeTrendData(
  sessions: SessionRecord[],
  daysBack: number,
): TrendDataPoint[] {
  const byDate = new Map<string, { focusSeconds: number; sleepyCount: number }>();

  // Initialize all dates in range
  for (let i = 0; i <= daysBack; i++) {
    const d = new Date();
    d.setDate(d.getDate() - daysBack + i);
    const key = d.toISOString().split('T')[0];
    byDate.set(key, { focusSeconds: 0, sleepyCount: 0 });
  }

  // Aggregate session data
  for (const session of sessions) {
    const existing = byDate.get(session.date);
    if (existing) {
      existing.focusSeconds += session.focusSeconds;
      existing.sleepyCount += session.sleepyCount;
    }
  }

  return Array.from(byDate.entries()).map(([date, vals]) => ({
    date,
    label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    focusHours: Math.round((vals.focusSeconds / 3600) * 100) / 100,
    sleepyCount: vals.sleepyCount,
  }));
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useStats() {
  const sessions = useSessionStore((s) => s.sessions);

  const todayStats = useMemo<TodayStats>(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter((s) => s.date === today);

    return {
      totalFocusSeconds: todaySessions.reduce((sum, s) => sum + s.focusSeconds, 0),
      sleepyCount: todaySessions.reduce((sum, s) => sum + s.sleepyCount, 0),
      sessionsCompleted: todaySessions.filter((s) => s.completed).length,
    };
  }, [sessions]);

  const streak = useMemo<StreakInfo>(() => computeStreak(sessions), [sessions]);

  const weeklyTrend = useMemo<TrendDataPoint[]>(
    () => computeTrendData(sessions, 7),
    [sessions],
  );

  const monthlyTrend = useMemo<TrendDataPoint[]>(
    () => computeTrendData(sessions, 30),
    [sessions],
  );

  const allTimeStats = useMemo(() => {
    const completed = sessions.filter((s) => s.completed);
    return {
      totalSessions: completed.length,
      totalFocusSeconds: sessions.reduce((sum, s) => sum + s.focusSeconds, 0),
    };
  }, [sessions]);

  return { todayStats, streak, weeklyTrend, monthlyTrend, allTimeStats };
}
