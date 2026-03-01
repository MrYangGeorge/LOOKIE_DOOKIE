const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface CircularProgressProps {
  timeRemaining: number;
  totalDuration: number;
  phase: 'idle' | 'focus' | 'break' | 'paused';
}

export function CircularProgress({ timeRemaining, totalDuration, phase }: CircularProgressProps) {
  const rawProgress = totalDuration > 0 ? timeRemaining / totalDuration : 0;
  const progress = Math.max(0, Math.min(1, rawProgress));
  const offset = CIRCUMFERENCE * (1 - progress);

  // Stroke color based on phase: focus=mint, break=lavender, idle/paused=muted
  const strokeColor =
    phase === 'focus' ? 'oklch(0.87 0.08 163)' :
    phase === 'break' ? 'oklch(0.78 0.07 300)' :
    'oklch(0.92 0.01 95)';

  const safeTime = Math.max(0, Math.floor(timeRemaining));
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const phaseLabel =
    phase === 'idle' ? 'Ready' :
    phase === 'focus' ? 'Focus' :
    phase === 'break' ? 'Break' :
    'Paused';

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <svg width="256" height="256" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100" cy="100" r={RADIUS}
          fill="none"
          stroke="oklch(0.96 0.005 95)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="100" cy="100" r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          className="transition-[stroke-dashoffset] duration-500 ease-linear"
        />
      </svg>
      {/* Time display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold text-foreground">{display}</span>
        <span className="text-sm text-muted-foreground mt-1 font-semibold">{phaseLabel}</span>
      </div>
    </div>
  );
}
