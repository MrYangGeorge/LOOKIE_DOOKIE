import { create } from 'zustand';
import type { MetricsPacket } from '@/features/detection/telemetry/metrics.types';
import { smoothValue } from '@/features/detection/telemetry/metrics.utils';

// ─── Types ────────────────────────────────────────────────────────────────

export interface AlertnessPoint {
  studyTime: number;
  alertness: number;
}

interface AlertnessState {
  current: MetricsPacket | null;
  dataPoints: AlertnessPoint[];

  actions: {
    /** Ingest a raw MetricsPacket from the socket, smooth alertness, and append to history */
    pushMetrics: (packet: MetricsPacket, studyTimeMin: number) => void;
    reset: () => void;
  };
}

// ─── Store ────────────────────────────────────────────────────────────────

export const useAlertnessStore = create<AlertnessState>((set, get) => ({
  current: null,
  dataPoints: [],

  actions: {
    pushMetrics: (packet, studyTimeMin) => {
      const prev = get().current;
      const smoothedScore = prev
        ? smoothValue(prev.alertnessScore, packet.alertnessScore)
        : packet.alertnessScore;

      const smoothedPacket: MetricsPacket = { ...packet, alertnessScore: smoothedScore };

      set((state) => ({
        current: smoothedPacket,
        dataPoints: [
          ...state.dataPoints,
          {
            studyTime: Math.round(studyTimeMin * 10) / 10,
            alertness: Math.round(smoothedScore),
          },
        ],
      }));
    },

    reset: () => set({ current: null, dataPoints: [] }),
  },
}));
