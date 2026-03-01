import { create } from 'zustand';
import { insertSession } from '@/services/database';
import { useAuthStore } from '@/features/auth/store/authStore';

export interface SessionRecord {
  id: string;
  date: string;
  startTime: number;
  endTime: number;
  focusSeconds: number;
  sleepyCount: number;
  sleepyTotalSeconds: number;
  mode: 'pomodoro' | 'custom';
  completed: boolean;
}

interface SessionState {
  // Current active session tracking
  currentSessionStart: number | null;
  currentSessionMode: 'pomodoro' | 'custom' | null;

  // Accumulated focus seconds for the current session (across pomodoro cycles)
  accumulatedFocusSeconds: number;

  // Completed session history (in-memory + Supabase sync)
  sessions: SessionRecord[];

  actions: {
    beginSession: (mode: 'pomodoro' | 'custom') => void;
    addFocusSeconds: (seconds: number) => void;
    endSession: (sleepyCount: number, sleepyTotalSeconds: number, completed: boolean) => void;
    loadSessions: (sessions: SessionRecord[]) => void;
    clearSessions: () => void;
  };
}

let nextId = 1;

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSessionStart: null,
  currentSessionMode: null,
  accumulatedFocusSeconds: 0,
  sessions: [],

  actions: {
    beginSession: (mode) => {
      set({
        currentSessionStart: Date.now(),
        currentSessionMode: mode,
        accumulatedFocusSeconds: 0,
      });
    },

    addFocusSeconds: (seconds) => {
      set((s) => ({
        accumulatedFocusSeconds: s.accumulatedFocusSeconds + seconds,
      }));
    },

    endSession: (sleepyCount, sleepyTotalSeconds, completed) => {
      const state = get();
      if (!state.currentSessionStart || !state.currentSessionMode) return;

      const now = Date.now();
      const record: SessionRecord = {
        id: `local-${nextId++}`,
        date: new Date().toISOString().split('T')[0],
        startTime: state.currentSessionStart,
        endTime: now,
        focusSeconds: state.accumulatedFocusSeconds,
        sleepyCount,
        sleepyTotalSeconds,
        mode: state.currentSessionMode,
        completed,
      };

      set((s) => ({
        sessions: [record, ...s.sessions],
        currentSessionStart: null,
        currentSessionMode: null,
        accumulatedFocusSeconds: 0,
      }));

      console.log('[SessionStore] Session saved:', record);

      // Persist to Supabase (fire-and-forget)
      const user = useAuthStore.getState().user;
      if (user) {
        insertSession({
          user_id: user.id,
          date: record.date,
          start_time: new Date(record.startTime).toISOString(),
          end_time: new Date(record.endTime).toISOString(),
          focus_seconds: record.focusSeconds,
          sleepy_count: record.sleepyCount,
          sleepy_total_seconds: record.sleepyTotalSeconds,
          mode: record.mode,
          completed: record.completed,
        }).catch((err) => {
          console.error('[SessionStore] Failed to persist session to Supabase:', err);
        });
      }
    },

    loadSessions: (sessions) => {
      set({ sessions });
    },

    clearSessions: () => {
      set({ sessions: [] });
    },
  },
}));
