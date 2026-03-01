// ─── Types ────────────────────────────────────────────────────────────────

export type StickerCategory =
  | 'milestone'
  | 'hours'
  | 'streak'
  | 'performance'
  | 'time'
  | 'intensity';

export interface StickerDefinition {
  id: string;
  name: string;
  description: string;
  category: StickerCategory;
  icon: string; // Emoji

  /** Evaluate whether this sticker should be unlocked. */
  evaluate: (stats: UserAggregateStats, session?: SessionData) => boolean;
}

export interface UserAggregateStats {
  totalSessions: number;
  totalFocusSeconds: number;
  currentStreak: number;
  longestStreak: number;
  todayFocusSeconds: number;
  recentSessions: SessionData[];
}

export interface SessionData {
  focus_seconds: number;
  sleepy_count: number;
  completed: boolean;
  start_time: string; // ISO timestamp
}

// ─── Sticker Catalog (19 stickers) ───────────────────────────────────────

export const ALL_STICKERS: StickerDefinition[] = [
  // === Milestone ===
  {
    id: 'first_focus',
    name: 'First Focus',
    description: 'Complete your very first focus session',
    category: 'milestone',
    icon: '⭐',
    evaluate: (stats) => stats.totalSessions >= 1,
  },
  {
    id: 'baby_steps',
    name: 'Baby Steps',
    description: 'Complete 3 focus sessions',
    category: 'milestone',
    icon: '👣',
    evaluate: (stats) => stats.totalSessions >= 3,
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Complete 5 focus sessions',
    category: 'milestone',
    icon: '🚀',
    evaluate: (stats) => stats.totalSessions >= 5,
  },

  // === Hours ===
  {
    id: '1h_club',
    name: '1 Hour Club',
    description: 'Accumulate 1 hour of total focus time',
    category: 'hours',
    icon: '⏰',
    evaluate: (stats) => stats.totalFocusSeconds >= 3600,
  },
  {
    id: '5h_hero',
    name: '5 Hour Hero',
    description: 'Accumulate 5 hours of total focus time',
    category: 'hours',
    icon: '🛡️',
    evaluate: (stats) => stats.totalFocusSeconds >= 18_000,
  },
  {
    id: '10h_champion',
    name: '10 Hour Champion',
    description: 'Accumulate 10 hours of total focus time',
    category: 'hours',
    icon: '🏆',
    evaluate: (stats) => stats.totalFocusSeconds >= 36_000,
  },
  {
    id: '25h_master',
    name: '25 Hour Master',
    description: 'Accumulate 25 hours of total focus time',
    category: 'hours',
    icon: '👑',
    evaluate: (stats) => stats.totalFocusSeconds >= 90_000,
  },
  {
    id: '50h_legend',
    name: '50 Hour Legend',
    description: 'Accumulate 50 hours of total focus time',
    category: 'hours',
    icon: '💎',
    evaluate: (stats) => stats.totalFocusSeconds >= 180_000,
  },
  {
    id: '100h_mythic',
    name: '100 Hour Mythic',
    description: 'Accumulate 100 hours of total focus time',
    category: 'hours',
    icon: '✨',
    evaluate: (stats) => stats.totalFocusSeconds >= 360_000,
  },

  // === Streak ===
  {
    id: '3d_fire',
    name: '3-Day Fire',
    description: 'Maintain a 3-day focus streak',
    category: 'streak',
    icon: '🔥',
    evaluate: (stats) => stats.currentStreak >= 3,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day focus streak',
    category: 'streak',
    icon: '⚔️',
    evaluate: (stats) => stats.currentStreak >= 7,
  },
  {
    id: '2w_titan',
    name: 'Two Week Titan',
    description: 'Maintain a 14-day focus streak',
    category: 'streak',
    icon: '🏔️',
    evaluate: (stats) => stats.currentStreak >= 14,
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day focus streak',
    category: 'streak',
    icon: '📅',
    evaluate: (stats) => stats.currentStreak >= 30,
  },

  // === Performance ===
  {
    id: 'wide_awake',
    name: 'Wide Awake',
    description: 'Complete a session with zero sleepy events',
    category: 'performance',
    icon: '👁️',
    evaluate: (_stats, session) =>
      session !== undefined && session.completed && session.sleepy_count === 0,
  },
  {
    id: 'laser_focus',
    name: 'Laser Focus',
    description: 'Complete 5 consecutive sessions with zero sleepy events',
    category: 'performance',
    icon: '🎯',
    evaluate: (stats) => {
      const recent = stats.recentSessions.slice(0, 5);
      return (
        recent.length >= 5 &&
        recent.every((s) => s.completed && s.sleepy_count === 0)
      );
    },
  },

  // === Time of Day ===
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Start a focus session before 6:00 AM',
    category: 'time',
    icon: '🌅',
    evaluate: (_stats, session) => {
      if (!session) return false;
      return new Date(session.start_time).getHours() < 6;
    },
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Start a focus session after 10:00 PM',
    category: 'time',
    icon: '🌙',
    evaluate: (_stats, session) => {
      if (!session) return false;
      return new Date(session.start_time).getHours() >= 22;
    },
  },

  // === Intensity ===
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Accumulate 2 hours of focus in a single day',
    category: 'intensity',
    icon: '⏱️',
    evaluate: (stats) => stats.todayFocusSeconds >= 7200,
  },
  {
    id: 'ultramarathon',
    name: 'Ultramarathon',
    description: 'Accumulate 4 hours of focus in a single day',
    category: 'intensity',
    icon: '⚡',
    evaluate: (stats) => stats.todayFocusSeconds >= 14_400,
  },
];

// ─── Category Labels ─────────────────────────────────────────────────────

export const STICKER_CATEGORIES = [
  { key: 'milestone' as const, label: 'Milestones' },
  { key: 'hours' as const, label: 'Focus Hours' },
  { key: 'streak' as const, label: 'Streaks' },
  { key: 'performance' as const, label: 'Performance' },
  { key: 'time' as const, label: 'Time of Day' },
  { key: 'intensity' as const, label: 'Intensity' },
];
