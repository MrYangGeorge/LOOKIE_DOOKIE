import { useEffect } from 'react';
import { useTimerStore } from '@/features/timer/store/timerStore';
import { useAmbientStore } from '@/features/ambient/store/ambientStore';

/**
 * Auto-stops ambient sounds when the timer phase becomes idle.
 * Sounds keep playing during pauses and breaks.
 */
export function useAmbientAutoStop() {
  const phase = useTimerStore((s) => s.phase);
  const stopAll = useAmbientStore((s) => s.actions.stopAll);

  useEffect(() => {
    if (phase === 'idle') {
      stopAll();
    }
  }, [phase, stopAll]);
}
