import { useSessionStore } from '../store/sessionStore';
import { Clock, Moon, CheckCircle, XCircle } from 'lucide-react';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SessionHistory() {
  const sessions = useSessionStore((s) => s.sessions);

  if (sessions.length === 0) {
    return (
      <div className="mt-6 text-center py-12 text-muted-foreground">
        <p className="text-lg font-semibold">No sessions yet</p>
        <p className="text-sm mt-1">Complete a focus session to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-white rounded-2xl p-4 shadow-sm border border-border flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {session.completed ? (
              <CheckCircle size={18} className="text-green-500" />
            ) : (
              <XCircle size={18} className="text-muted-foreground" />
            )}
            <div>
              <p className="font-bold text-foreground text-sm">
                {session.mode === 'pomodoro' ? 'Pomodoro' : 'Custom'} Session
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-primary">
              <Clock size={14} />
              <span className="font-semibold">{formatDuration(session.focusSeconds)}</span>
            </div>
            {session.sleepyCount > 0 && (
              <div className="flex items-center gap-1 text-secondary">
                <Moon size={14} />
                <span className="font-semibold">{session.sleepyCount}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
