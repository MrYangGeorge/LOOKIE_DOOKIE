import { create } from 'zustand';

type TimerPhase = 'idle' | 'focus' | 'break' | 'paused';
type TimerMode = 'pomodoro' | 'custom';

interface TimerState {
  mode: TimerMode;
  phase: TimerPhase;
  timeRemaining: number;
  totalDuration: number;
  pomodoroCount: number;
  pomodoroTotal: number;
  focusDuration: number;
  breakDuration: number;
  phaseBeforePause: TimerPhase | null;
  actions: {
    start: () => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    tick: () => void;
    switchMode: (mode: TimerMode) => void;
    setFocusDuration: (seconds: number) => void;
    setBreakDuration: (seconds: number) => void;
  };
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'pomodoro',
  phase: 'idle',
  timeRemaining: 1500,
  totalDuration: 1500,
  pomodoroCount: 1,
  pomodoroTotal: 4,
  focusDuration: 1500,
  breakDuration: 300,
  phaseBeforePause: null,

  actions: {
    start: () => {
      const { focusDuration, mode } = get();
      set({
        phase: 'focus',
        timeRemaining: focusDuration,
        totalDuration: focusDuration,
        pomodoroCount: mode === 'pomodoro' ? 1 : 1,
        phaseBeforePause: null,
      });
    },

    pause: () => {
      const { phase } = get();
      if (phase === 'focus' || phase === 'break') {
        set({ phase: 'paused', phaseBeforePause: phase });
      }
    },

    resume: () => {
      const { phaseBeforePause } = get();
      if (phaseBeforePause) {
        set({ phase: phaseBeforePause, phaseBeforePause: null });
      }
    },

    reset: () => {
      const { focusDuration } = get();
      set({
        phase: 'idle',
        timeRemaining: focusDuration,
        totalDuration: focusDuration,
        pomodoroCount: 1,
        phaseBeforePause: null,
      });
    },

    tick: () => {
      const state = get();
      if (state.phase !== 'focus' && state.phase !== 'break') return;

      const newTime = state.timeRemaining - 1;

      if (newTime <= 0) {
        if (state.phase === 'focus' && state.mode === 'pomodoro') {
          if (state.pomodoroCount < state.pomodoroTotal) {
            // Transition to break
            set({
              phase: 'break',
              timeRemaining: state.breakDuration,
              totalDuration: state.breakDuration,
            });
          } else {
            // All cycles complete
            set({ phase: 'idle', timeRemaining: 0 });
          }
        } else if (state.phase === 'break') {
          // Transition to next focus cycle
          set({
            phase: 'focus',
            timeRemaining: state.focusDuration,
            totalDuration: state.focusDuration,
            pomodoroCount: state.pomodoroCount + 1,
          });
        } else {
          // Custom mode complete
          set({ phase: 'idle', timeRemaining: 0 });
        }
      } else {
        set({ timeRemaining: newTime });
      }
    },

    switchMode: (mode: TimerMode) => {
      const { focusDuration } = get();
      set({
        mode,
        phase: 'idle',
        timeRemaining: focusDuration,
        totalDuration: focusDuration,
        pomodoroCount: 1,
        phaseBeforePause: null,
      });
    },

    setFocusDuration: (seconds: number) => {
      const { phase } = get();
      if (phase === 'idle') {
        set({ focusDuration: seconds, timeRemaining: seconds, totalDuration: seconds });
      } else {
        set({ focusDuration: seconds });
      }
    },

    setBreakDuration: (seconds: number) => {
      set({ breakDuration: seconds });
    },
  },
}));
