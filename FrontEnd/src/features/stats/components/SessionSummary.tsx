import { motion, AnimatePresence } from 'framer-motion';
import { useSessionStore } from '../store/sessionStore';
import { useTimerStore } from '@/features/timer/store/timerStore';
import { Clock, Moon, CheckCircle, XCircle } from 'lucide-react';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function SessionSummary() {
  const phase = useTimerStore((s) => s.phase);
  const sessions = useSessionStore((s) => s.sessions);
  const latestSession = sessions[0];

  // Only show when idle and there is a recent session
  if (phase !== 'idle' || !latestSession) return null;

  // Only show sessions from the last 30 seconds (just finished)
  const isRecent = Date.now() - latestSession.endTime < 30_000;
  if (!isRecent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="mt-6 bg-white rounded-2xl p-5 shadow-md border border-border"
      >
        <div className="flex items-center gap-2 mb-4">
          {latestSession.completed ? (
            <CheckCircle size={20} className="text-green-500" />
          ) : (
            <XCircle size={20} className="text-muted-foreground" />
          )}
          <h3 className="font-bold text-foreground">
            {latestSession.completed ? 'Session Complete!' : 'Session Ended'}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-primary/10 rounded-xl p-3">
            <Clock size={16} className="mx-auto text-primary mb-1" />
            <p className="text-lg font-extrabold text-foreground">
              {formatDuration(latestSession.focusSeconds)}
            </p>
            <p className="text-xs text-muted-foreground font-semibold">Focus</p>
          </div>

          <div className="bg-secondary/10 rounded-xl p-3">
            <Moon size={16} className="mx-auto text-secondary mb-1" />
            <p className="text-lg font-extrabold text-foreground">
              {latestSession.sleepyCount}
            </p>
            <p className="text-xs text-muted-foreground font-semibold">Sleepy</p>
          </div>

          <div className="bg-accent/10 rounded-xl p-3">
            <span className="block text-sm mb-1">
              {latestSession.mode === 'pomodoro' ? 'P' : 'C'}
            </span>
            <p className="text-lg font-extrabold text-foreground">
              {latestSession.mode === 'pomodoro' ? 'Pomodoro' : 'Custom'}
            </p>
            <p className="text-xs text-muted-foreground font-semibold">Mode</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
