import type { StickerDefinition, UserAggregateStats, SessionData } from '@/features/stickers/data/catalog';
import type { SessionRecord } from '@/features/stats/store/sessionStore';

/**
 * Check which stickers should be newly unlocked.
 * Pure function — no side effects.
 */
export function checkUnlocks(
  allStickers: StickerDefinition[],
  earnedIds: Set<string>,
  stats: UserAggregateStats,
  session?: SessionData,
): StickerDefinition[] {
  const newlyUnlocked: StickerDefinition[] = [];

  for (const sticker of allStickers) {
    if (earnedIds.has(sticker.id)) continue;

    if (sticker.evaluate(stats, session)) {
      newlyUnlocked.push(sticker);
    }
  }

  return newlyUnlocked;
}

/**
 * Compute aggregate stats from session records.
 * Used as input to the sticker engine.
 */
export function computeAggregateStats(
  sessions: SessionRecord[],
  currentStreak: number,
  longestStreak: number,
): UserAggregateStats {
  const completedSessions = sessions.filter((s) => s.completed);
  const totalFocusSeconds = sessions.reduce((sum, s) => sum + s.focusSeconds, 0);

  const today = new Date().toISOString().split('T')[0];
  const todayFocusSeconds = sessions
    .filter((s) => s.date === today)
    .reduce((sum, s) => sum + s.focusSeconds, 0);

  // Convert SessionRecords to SessionData for evaluate functions
  const recentSessions: SessionData[] = sessions.slice(0, 10).map((s) => ({
    focus_seconds: s.focusSeconds,
    sleepy_count: s.sleepyCount,
    completed: s.completed,
    start_time: new Date(s.startTime).toISOString(),
  }));

  return {
    totalSessions: completedSessions.length,
    totalFocusSeconds,
    currentStreak,
    longestStreak,
    todayFocusSeconds,
    recentSessions,
  };
}
