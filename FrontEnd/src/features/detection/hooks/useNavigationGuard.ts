import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTimerStore } from '@/features/timer/store/timerStore';
import { useDetectionStore } from '../store/detectionStore';
import { audioService } from '@/services/audioService';

/**
 * Hook that detects when the user leaves the timer page during a focus/break session.
 * Triggers a navigation alarm (amber overlay) and auto-navigates back to '/' on dismiss.
 *
 * Trigger sources:
 * 1. App-internal navigation (e.g. clicking Stats while timer is running)
 * 2. Browser tab/window switching (visibilitychange)
 */
export function useNavigationGuard() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const phase = useTimerStore((s) => s.phase);
  const isAlarmActive = useDetectionStore((s) => s.isAlarmActive);
  const alarmReason = useDetectionStore((s) => s.alarmReason);
  const actions = useDetectionStore((s) => s.actions);
  const timerActions = useTimerStore((s) => s.actions);

  const prevAlarmReasonRef = useRef(alarmReason);

  // Effect 1 — App-internal route change
  useEffect(() => {
    if (
      pathname !== '/' &&
      (phase === 'focus' || phase === 'break') &&
      !isAlarmActive
    ) {
      actions.setPausedByNavigation(true);
      timerActions.pause();
      actions.triggerAlarm('navigation');
      audioService.playAlarm();
    }
  }, [pathname, phase, isAlarmActive, actions, timerActions]);

  // Effect 2 — Browser tab/window visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) return;

      const { phase: currentPhase } = useTimerStore.getState();
      const { isAlarmActive: currentAlarmActive } = useDetectionStore.getState();

      if (
        (currentPhase === 'focus' || currentPhase === 'break') &&
        !currentAlarmActive
      ) {
        const detectionActions = useDetectionStore.getState().actions;
        const tmrActions = useTimerStore.getState().actions;

        detectionActions.setPausedByNavigation(true);
        tmrActions.pause();
        detectionActions.triggerAlarm('navigation');
        audioService.playAlarm();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Effect 3 — Auto-navigate to '/' when navigation alarm is dismissed via UI
  useEffect(() => {
    const prev = prevAlarmReasonRef.current;
    prevAlarmReasonRef.current = alarmReason;

    // Only navigate when reason transitions from 'navigation' to null (dismissed)
    if (prev === 'navigation' && alarmReason === null) {
      navigate('/');
    }
  }, [alarmReason, navigate]);
}
