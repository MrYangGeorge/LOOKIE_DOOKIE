import { create } from 'zustand';

export type AlarmReason = 'drowsiness' | 'navigation' | null;

interface DetectionState {
  eyesOpen: boolean;
  closedSince: number | null;
  isAlarmActive: boolean;
  sleepyThreshold: number;
  sleepyCount: number;
  sleepyTotalSeconds: number;
  isConnected: boolean;
  // After resume, skip detection until eyes open once to prevent immediate re-trigger
  ignoreEyeUntilOpen: boolean;
  // Distinguishes detection-caused pause from manual pause (keeps socket alive)
  pausedByDetection: boolean;
  // Reason for current alarm (drowsiness vs navigation away)
  alarmReason: AlarmReason;
  // Whether the user left the timer page during a focus session
  pausedByNavigation: boolean;
  // Whether the hardware dismiss button has been pressed (buzzer stopped)
  hardwareDismissed: boolean;

  actions: {
    updateEyeState: (eyesOpen: boolean, timestamp: number) => void;
    triggerAlarm: (reason: AlarmReason) => void;
    dismissAlarm: () => void;
    setThreshold: (seconds: number) => void;
    resetSession: () => void;
    setConnected: (connected: boolean) => void;
    setIgnoreEyeUntilOpen: (value: boolean) => void;
    setPausedByDetection: (value: boolean) => void;
    setPausedByNavigation: (value: boolean) => void;
    setHardwareDismissed: (value: boolean) => void;
  };
}

export const useDetectionStore = create<DetectionState>((set, get) => ({
  eyesOpen: true,
  closedSince: null,
  isAlarmActive: false,
  sleepyThreshold: 5,
  sleepyCount: 0,
  sleepyTotalSeconds: 0,
  isConnected: false,
  ignoreEyeUntilOpen: false,
  pausedByDetection: false,
  alarmReason: null,
  pausedByNavigation: false,
  hardwareDismissed: false,

  actions: {
    updateEyeState: (eyesOpen: boolean, timestamp: number) => {
      const state = get();

      if (eyesOpen) {
        // Eyes opened -- accumulate closed duration
        let additionalSeconds = 0;
        if (state.closedSince) {
          additionalSeconds = Math.floor((timestamp - state.closedSince) / 1000);
        }
        set({
          eyesOpen: true,
          closedSince: null,
          sleepyTotalSeconds: state.sleepyTotalSeconds + additionalSeconds,
          // Clear ignore flag once eyes are confirmed open
          ignoreEyeUntilOpen: false,
        });
      } else {
        // Eyes closed -- start tracking if not already
        if (!state.closedSince) {
          set({ eyesOpen: false, closedSince: timestamp });
        } else {
          set({ eyesOpen: false });
        }
      }
    },

    triggerAlarm: (reason: AlarmReason) => {
      const state = get();
      if (!state.isAlarmActive) {
        set({
          isAlarmActive: true,
          sleepyCount: state.sleepyCount + 1,
          alarmReason: reason,
          hardwareDismissed: false,
        });
      }
    },

    dismissAlarm: () => {
      set({
        isAlarmActive: false,
        closedSince: null,
        eyesOpen: true,
        ignoreEyeUntilOpen: true,
        pausedByDetection: false,
        alarmReason: null,
        pausedByNavigation: false,
        hardwareDismissed: false,
      });
    },

    setThreshold: (seconds: number) => {
      set({ sleepyThreshold: seconds });
    },

    resetSession: () => {
      set({
        eyesOpen: true,
        closedSince: null,
        isAlarmActive: false,
        sleepyCount: 0,
        sleepyTotalSeconds: 0,
        ignoreEyeUntilOpen: false,
        pausedByDetection: false,
        alarmReason: null,
        pausedByNavigation: false,
        hardwareDismissed: false,
      });
    },

    setConnected: (connected: boolean) => {
      set({ isConnected: connected });
    },

    setIgnoreEyeUntilOpen: (value: boolean) => {
      set({ ignoreEyeUntilOpen: value });
    },

    setPausedByDetection: (value: boolean) => {
      set({ pausedByDetection: value });
    },

    setPausedByNavigation: (value: boolean) => {
      set({ pausedByNavigation: value });
    },

    setHardwareDismissed: (value: boolean) => {
      set({ hardwareDismissed: value });
    },
  },
}));
