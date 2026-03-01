import { useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { getUserSettings, getRecentSessions } from '@/services/database';
import { useTimerStore } from '@/features/timer/store/timerStore';
import { useDetectionStore } from '@/features/detection/store/detectionStore';
import { useSessionStore } from '@/features/stats/store/sessionStore';

/**
 * Initializes authentication state from Supabase and loads user data.
 * When Supabase is not configured, immediately marks as initialized (local-only mode).
 */
export function useAuthInit() {
  const { setUser, setInitialized } = useAuthStore((s) => s.actions);

  useEffect(() => {
    if (!supabase) {
      // No Supabase configured — run in local-only mode
      setInitialized();
      return;
    }

    // Check existing session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setInitialized();

      if (user) {
        loadUserData(user.id);
      }
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      if (newUser) {
        loadUserData(newUser.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setInitialized]);
}

/**
 * Loads user settings and recent sessions from Supabase into local stores.
 */
async function loadUserData(userId: string) {
  try {
    // Load settings and sessions in parallel
    const [settings, sessions] = await Promise.all([
      getUserSettings(userId),
      getRecentSessions(userId),
    ]);

    // Apply settings to stores
    if (settings) {
      const timerActions = useTimerStore.getState().actions;
      timerActions.setFocusDuration(settings.focus_duration);
      timerActions.setBreakDuration(settings.break_duration);

      if (settings.pomodoro_enabled) {
        timerActions.switchMode('pomodoro');
      } else {
        timerActions.switchMode('custom');
      }

      useDetectionStore.getState().actions.setThreshold(settings.sleepy_threshold_sec);
    }

    // Load session history
    if (sessions.length > 0) {
      useSessionStore.getState().actions.loadSessions(
        sessions.map((s) => ({
          id: s.id,
          date: s.date,
          startTime: new Date(s.start_time).getTime(),
          endTime: s.end_time ? new Date(s.end_time).getTime() : Date.now(),
          focusSeconds: s.focus_seconds,
          sleepyCount: s.sleepy_count,
          sleepyTotalSeconds: s.sleepy_total_seconds,
          mode: s.mode,
          completed: s.completed,
        })),
      );
    }
  } catch (err) {
    console.error('[Auth] Failed to load user data:', err);
  }
}
