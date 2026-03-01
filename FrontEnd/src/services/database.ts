import { supabase } from './supabaseClient';

// ─── Types matching Supabase tables ───────────────────────────────────────

export interface DbUserSettings {
  user_id: string;
  focus_duration: number;
  break_duration: number;
  pomodoro_enabled: boolean;
  sleepy_threshold_sec: number;
  alarm_sound: string | null;
  ambient_preference: string | null;
}

export interface DbSession {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string | null;
  focus_seconds: number;
  sleepy_count: number;
  sleepy_total_seconds: number;
  mode: 'pomodoro' | 'custom';
  completed: boolean;
}

// ─── User Settings ────────────────────────────────────────────────────────

export async function getUserSettings(userId: string): Promise<DbUserSettings | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // PGRST116 = no rows found
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as DbUserSettings;
}

export async function upsertUserSettings(
  settings: Partial<DbUserSettings> & { user_id: string },
): Promise<DbUserSettings | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ ...settings, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data as DbUserSettings;
}

// ─── Sessions ─────────────────────────────────────────────────────────────

export async function insertSession(
  session: Omit<DbSession, 'id'>,
): Promise<DbSession | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('sessions')
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data as DbSession;
}

export async function getRecentSessions(
  userId: string,
  limit = 50,
): Promise<DbSession[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as DbSession[];
}

// ─── Earned Stickers ──────────────────────────────────────────────────────

export interface DbEarnedSticker {
  id: string;
  user_id: string;
  sticker_id: string;
  unlocked_at: string;
}

export async function getEarnedStickers(userId: string): Promise<DbEarnedSticker[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('earned_stickers')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []) as DbEarnedSticker[];
}

export async function insertEarnedSticker(
  userId: string,
  stickerId: string,
): Promise<DbEarnedSticker | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('earned_stickers')
    .insert({ user_id: userId, sticker_id: stickerId })
    .select()
    .single();

  if (error) throw error;
  return data as DbEarnedSticker;
}

// ─── Streaks ──────────────────────────────────────────────────────────────

export interface DbStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_focus_date: string | null;
}

export async function getStreak(userId: string): Promise<DbStreak | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as DbStreak;
}

export async function upsertStreak(streak: DbStreak): Promise<DbStreak | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('streaks')
    .upsert({ ...streak, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data as DbStreak;
}

// ─── New User Init ────────────────────────────────────────────────────────

export async function initializeNewUser(userId: string): Promise<void> {
  if (!supabase) return;

  await Promise.all([
    upsertUserSettings({
      user_id: userId,
      focus_duration: 1500,
      break_duration: 300,
      pomodoro_enabled: true,
      sleepy_threshold_sec: 5,
      alarm_sound: null,
      ambient_preference: null,
    }),
    upsertStreak({
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      last_focus_date: null,
    }),
  ]);
}
