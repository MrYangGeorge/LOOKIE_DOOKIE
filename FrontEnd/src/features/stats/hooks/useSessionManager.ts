import { useEffect, useRef } from 'react';
import { useTimerStore } from '@/features/timer/store/timerStore';
import { useDetectionStore } from '@/features/detection/store/detectionStore';
import { useSessionStore } from '../store/sessionStore';

/**
 * Orchestrates session lifecycle across timer, detection, and session stores.
 *
 * Flow:
 *   idle -> focus (start)  : beginSession + resetDetection
 *   focus -> break          : accumulate focus seconds
 *   break -> focus          : (continue same session)
 *   focus/break -> idle     : endSession (completed or manual reset)
 *   any -> idle (reset)     : endSession (not completed)
 */
export function useSessionManager() {
  const phase = useTimerStore((s) => s.phase);
  const mode = useTimerStore((s) => s.mode);
  const focusDuration = useTimerStore((s) => s.focusDuration);
  const timeRemaining = useTimerStore((s) => s.timeRemaining);

  const sessionActions = useSessionStore((s) => s.actions);
  const detectionActions = useDetectionStore((s) => s.actions);

  const prevPhaseRef = useRef(phase);
  const focusPhaseStartRef = useRef<number | null>(null);

  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    // idle -> focus: new session starts
    if (prevPhase === 'idle' && phase === 'focus') {
      sessionActions.beginSession(mode);
      detectionActions.resetSession();
      focusPhaseStartRef.current = Date.now();
      return;
    }

    // focus -> break: accumulate the focus phase duration
    if (prevPhase === 'focus' && phase === 'break') {
      if (focusPhaseStartRef.current) {
        const elapsed = Math.floor((Date.now() - focusPhaseStartRef.current) / 1000);
        sessionActions.addFocusSeconds(elapsed);
        focusPhaseStartRef.current = null;
      }
      return;
    }

    // break -> focus: start tracking new focus phase within same session
    if (prevPhase === 'break' && phase === 'focus') {
      focusPhaseStartRef.current = Date.now();
      return;
    }

    // paused -> focus/break: resume tracking
    if (prevPhase === 'paused' && phase === 'focus') {
      focusPhaseStartRef.current = Date.now();
      return;
    }

    // focus -> paused: accumulate partial focus time
    if (prevPhase === 'focus' && phase === 'paused') {
      if (focusPhaseStartRef.current) {
        const elapsed = Math.floor((Date.now() - focusPhaseStartRef.current) / 1000);
        sessionActions.addFocusSeconds(elapsed);
        focusPhaseStartRef.current = null;
      }
      return;
    }

    // Any active phase -> idle: session ends
    if (
      (prevPhase === 'focus' || prevPhase === 'break' || prevPhase === 'paused') &&
      phase === 'idle'
    ) {
      // Accumulate any remaining focus time
      if (prevPhase === 'focus' && focusPhaseStartRef.current) {
        const elapsed = Math.floor((Date.now() - focusPhaseStartRef.current) / 1000);
        sessionActions.addFocusSeconds(elapsed);
        focusPhaseStartRef.current = null;
      }

      // Determine if session completed naturally (timeRemaining === 0)
      const completed = timeRemaining === 0;

      // Gather detection stats
      const { sleepyCount, sleepyTotalSeconds } = useDetectionStore.getState();

      // Save the session
      sessionActions.endSession(sleepyCount, sleepyTotalSeconds, completed);

      return;
    }
  }, [phase, mode, focusDuration, timeRemaining, sessionActions, detectionActions]);
}
