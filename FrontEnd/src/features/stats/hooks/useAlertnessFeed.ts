import { useEffect, useRef } from 'react';
import { useTimerStore } from '@/features/timer/store/timerStore';
import { useAlertnessStore } from '../store/alertnessStore';

/**
 * Manages alertness data lifecycle based on timer phase.
 * Resets data when a new focus session starts (idle → focus).
 *
 * Actual data is pushed by the Arduino `metrics` socket event
 * via useDetection → alertnessStore.pushMetrics().
 */
export function useAlertnessFeed() {
  const phase = useTimerStore((s) => s.phase);
  const prevPhaseRef = useRef(phase);

  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    // Reset data when starting a new session (idle → focus)
    if (prevPhase === 'idle' && phase === 'focus') {
      useAlertnessStore.getState().actions.reset();
    }
  }, [phase]);
}
