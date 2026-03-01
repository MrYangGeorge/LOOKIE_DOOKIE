import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimerStore } from '../store/timerStore';
import { CircularProgress } from './CircularProgress';
// import { PomodoroStepper } from './PomodoroStepper';

export function FocusTimer() {
  const {
    mode, phase, timeRemaining, totalDuration,
    focusDuration, breakDuration,
    actions,
  } = useTimerStore();

  const handleResume = () => {
    actions.resume();
  };

  // Drift-corrected tick interval
  useEffect(() => {
    if (phase !== 'focus' && phase !== 'break') return;

    let lastTick = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastTick) / 1000);
      lastTick = now;

      for (let i = 0; i < elapsed; i++) {
        actions.tick();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, actions]);

  const isRunning = phase === 'focus' || phase === 'break';
  const isPaused = phase === 'paused';
  const isIdle = phase === 'idle';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mode switcher — only when idle */}
      {isIdle && (
        <div className="flex gap-2">
          <button
            onClick={() => actions.switchMode('pomodoro')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
              mode === 'pomodoro'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => actions.switchMode('custom')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
              mode === 'custom'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Custom
          </button>
        </div>
      )}

      {/* Duration settings — only when idle */}
      {isIdle && (
        <div className="w-full max-w-xs space-y-3">
          <div>
            <label className="text-sm text-muted-foreground font-semibold">
              Focus: {Math.floor(focusDuration / 60)} min
            </label>
            <input
              type="range"
              min={60} max={5400} step={60}
              value={focusDuration}
              onChange={(e) => actions.setFocusDuration(Number(e.target.value))}
              className="w-full mt-1 accent-primary"
            />
          </div>
          {mode === 'pomodoro' && (
            <div>
              <label className="text-sm text-muted-foreground font-semibold">
                Break: {Math.floor(breakDuration / 60)} min
              </label>
              <input
                type="range"
                min={60} max={1800} step={60}
                value={breakDuration}
                onChange={(e) => actions.setBreakDuration(Number(e.target.value))}
                className="w-full mt-1 accent-accent"
              />
            </div>
          )}
        </div>
      )}

      {/* Circular progress */}
      <CircularProgress
        timeRemaining={timeRemaining}
        totalDuration={totalDuration}
        phase={phase}
      />

      {/* Pomodoro dots */}
      {/* {mode === 'pomodoro' && !isIdle && (
        <PomodoroStepper current={pomodoroCount} total={pomodoroTotal} />
      )} */}

      {/* Controls */}
      <div className="flex gap-3">
        {isIdle && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={actions.start}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold text-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <Play size={20} fill="currentColor" />
            Start Focus
          </motion.button>
        )}

        {isRunning && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={actions.pause}
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-bold shadow-md hover:shadow-lg transition-shadow"
          >
            <Pause size={20} />
            Pause
          </motion.button>
        )}

        {isPaused && (
          <>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleResume}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-md hover:shadow-lg transition-shadow"
            >
              <Play size={20} fill="currentColor" />
              Resume
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={actions.reset}
              className="flex items-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-full font-bold shadow-md hover:shadow-lg transition-shadow"
            >
              <RotateCcw size={18} />
              Reset
            </motion.button>
          </>
        )}

        {(isRunning) && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={actions.reset}
            className="flex items-center gap-2 px-4 py-3 bg-muted text-muted-foreground rounded-full font-bold hover:bg-muted/80 transition-colors"
          >
            <RotateCcw size={18} aria-hidden="true" />
            <span className="sr-only">Reset timer</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
