import { useDetectionStore } from '../store/detectionStore';
import { useTimerStore } from '@/features/timer/store/timerStore';

export function ConnectionStatus() {
  const isConnected = useDetectionStore((s) => s.isConnected);
  const phase = useTimerStore((s) => s.phase);

  // Only show during active phases (focus, break, paused)
  if (phase === 'idle') return null;

  return (
    <div className="flex items-center gap-2 text-sm mt-4">
      <span
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
        }`}
      />
      <span className="text-muted-foreground">
        {isConnected ? 'Arduino Connected' : 'Disconnected'}
      </span>
    </div>
  );
}
