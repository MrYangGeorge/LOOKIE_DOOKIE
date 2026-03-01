import { useEffect, useRef } from 'react';
import { useTimerStore } from '@/features/timer/store/timerStore';
import { useDetectionStore } from '../store/detectionStore';
import { socketService } from '@/services/socketService';
import { audioService } from '@/services/audioService';
import { useAlertnessStore } from '@/features/stats/store/alertnessStore';

/**
 * Hook that bridges timerStore and detectionStore.
 * Manages Socket.IO connection lifecycle and drowsiness threshold checking.
 *
 * Socket stays connected during focus phase AND when paused by detection
 * (to receive hardware alarm_dismissed events).
 */
export function useDetection() {
  const phase = useTimerStore((s) => s.phase);
  const pausedByDetection = useDetectionStore((s) => s.pausedByDetection);
  const pausedByNavigation = useDetectionStore((s) => s.pausedByNavigation);
  const actions = useDetectionStore((s) => s.actions);
  const timerActions = useTimerStore((s) => s.actions);
  const checkIntervalRef = useRef<number | null>(null);

  // Keep socket alive during focus OR when paused by detection/navigation
  const shouldSocketBeConnected =
    phase === 'focus' ||
    (phase === 'paused' && (pausedByDetection || pausedByNavigation));

  // Connect/disconnect socket based on timer phase
  useEffect(() => {
    if (shouldSocketBeConnected) {
      socketService.connect();
      actions.setConnected(true);

      socketService.onEyeState((payload) => {
        actions.updateEyeState(payload.eyes_open, payload.timestamp);
      });
      socketService.onEyeState((payload) => {
  console.log("EYE STATE RECEIVED", payload);
});

      socketService.onAlarmDismissed(() => {
        // Step 1 of 3: hardware button only stops buzzer, overlay stays
        audioService.stopAlarm();
        actions.setHardwareDismissed(true);
      });

      /*
      socketService.onMetrics((packet) => {
        const timer = useTimerStore.getState();
        const elapsed = timer.totalDuration - timer.timeRemaining;
        const studyTimeMin = elapsed / 60;
        useAlertnessStore.getState().actions.pushMetrics(packet, studyTimeMin);
      });*/
      let lastTime = 0;

socketService.onMetrics((packet) => {
  console.log(packet);
  const now = Date.now();

  if (lastTime !== 0) {
    console.log("Metrics interval:", now - lastTime, "ms");
  }

  lastTime = now;

  const timer = useTimerStore.getState();
  const elapsed = timer.totalDuration - timer.timeRemaining;
  const studyTimeMin = elapsed / 60;

  useAlertnessStore.getState().actions.pushMetrics(packet, studyTimeMin);
});
    } else {
      // Disconnect during break, idle, or manual pause
      socketService.disconnect();
      actions.setConnected(false);

      // If alarm was active during phase transition, auto-dismiss
      const { isAlarmActive } = useDetectionStore.getState();
      if (isAlarmActive) {
        audioService.stopAlarm();
        actions.dismissAlarm();
      }
    }

    return () => {
      socketService.disconnect();
      actions.setConnected(false);
    };
  }, [shouldSocketBeConnected, actions, timerActions]);

  // Check drowsiness threshold every 1000ms during focus phase
  useEffect(() => {
    if (phase !== 'focus') {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    checkIntervalRef.current = window.setInterval(() => {
      const { closedSince, sleepyThreshold, isAlarmActive, ignoreEyeUntilOpen } =
        useDetectionStore.getState();

      // Skip check while waiting for eyes to open after resume
      if (ignoreEyeUntilOpen) return;

      if (closedSince && !isAlarmActive) {
        const closedDuration = (Date.now() - closedSince) / 1000;
        if (closedDuration >= sleepyThreshold) {
          // Order matters: mark pausedByDetection BEFORE pause() to keep socket alive
          useDetectionStore.getState().actions.setPausedByDetection(true);
          useTimerStore.getState().actions.pause();
          useDetectionStore.getState().actions.triggerAlarm('drowsiness');
          audioService.playAlarm();
        }
      }
    }, 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [phase]);
}
