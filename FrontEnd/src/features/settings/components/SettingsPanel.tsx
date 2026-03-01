import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Clock, Moon, Timer, Shield, Volume2 } from 'lucide-react';
import { useTimerStore } from '@/features/timer/store/timerStore';
import { useDetectionStore } from '@/features/detection/store/detectionStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { upsertUserSettings } from '@/services/database';
import { SoundMixer } from '@/features/ambient/components/SoundMixer';

export function SettingsPanel() {
  const user = useAuthStore((s) => s.user);

  const focusDuration = useTimerStore((s) => s.focusDuration);
  const breakDuration = useTimerStore((s) => s.breakDuration);
  const mode = useTimerStore((s) => s.mode);
  const timerActions = useTimerStore((s) => s.actions);

  const sleepyThreshold = useDetectionStore((s) => s.sleepyThreshold);
  const detectionActions = useDetectionStore((s) => s.actions);

  // Local form state
  const [focusMin, setFocusMin] = useState(Math.round(focusDuration / 60));
  const [breakMin, setBreakMin] = useState(Math.round(breakDuration / 60));
  const [pomodoroEnabled, setPomodoroEnabled] = useState(mode === 'pomodoro');
  const [threshold, setThreshold] = useState(sleepyThreshold);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync local state when store values change (e.g. on auth load)
  useEffect(() => {
    setFocusMin(Math.round(focusDuration / 60));
    setBreakMin(Math.round(breakDuration / 60));
    setPomodoroEnabled(mode === 'pomodoro');
    setThreshold(sleepyThreshold);
  }, [focusDuration, breakDuration, mode, sleepyThreshold]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    // Apply to local stores
    timerActions.setFocusDuration(focusMin * 60);
    timerActions.setBreakDuration(breakMin * 60);
    timerActions.switchMode(pomodoroEnabled ? 'pomodoro' : 'custom');
    detectionActions.setThreshold(threshold);

    // Persist to Supabase if authenticated
    if (user) {
      try {
        await upsertUserSettings({
          user_id: user.id,
          focus_duration: focusMin * 60,
          break_duration: breakMin * 60,
          pomodoro_enabled: pomodoroEnabled,
          sleepy_threshold_sec: threshold,
        });
      } catch (err) {
        console.error('[Settings] Failed to save to Supabase:', err);
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Timer Settings */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Timer size={18} className="text-primary" />
          <h3 className="font-bold text-foreground">Timer</h3>
        </div>

        <div className="space-y-4">
          {/* Focus Duration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                Focus Duration
              </label>
              <span className="text-sm font-bold text-primary">{focusMin} min</span>
            </div>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={focusMin}
              onChange={(e) => setFocusMin(Number(e.target.value))}
              className="w-full h-2 bg-primary/20 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Break Duration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Moon size={14} className="text-secondary" />
                Break Duration
              </label>
              <span className="text-sm font-bold text-secondary">{breakMin} min</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={breakMin}
              onChange={(e) => setBreakMin(Number(e.target.value))}
              className="w-full h-2 bg-secondary/20 rounded-full appearance-none cursor-pointer accent-secondary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 min</span>
              <span>30 min</span>
            </div>
          </div>

          {/* Pomodoro Toggle */}
          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-semibold text-foreground">Pomodoro Mode</label>
            <button
              type="button"
              role="switch"
              aria-checked={pomodoroEnabled}
              onClick={() => setPomodoroEnabled(!pomodoroEnabled)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                pomodoroEnabled ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
                  pomodoroEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Detection Settings */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-accent" />
          <h3 className="font-bold text-foreground">Drowsiness Detection</h3>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-foreground">Alert Threshold</label>
            <span className="text-sm font-bold text-accent">{threshold} sec</span>
          </div>
          <input
            type="range"
            min={2}
            max={15}
            step={1}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-2 bg-accent/20 rounded-full appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>2 sec (sensitive)</span>
            <span>15 sec (relaxed)</span>
          </div>
        </div>
      </section>

      {/* Ambient Sounds */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Volume2 size={18} className="text-primary" />
          <h3 className="font-bold text-foreground">Ambient Sounds</h3>
        </div>
        <SoundMixer />
      </section>

      {/* Account Info */}
      {user && (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <h3 className="font-bold text-foreground mb-3">Account</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </section>
      )}

      {/* Save Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-full hover:brightness-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          'Saving...'
        ) : saved ? (
          'Saved!'
        ) : (
          <>
            <Save size={16} />
            Save Settings
          </>
        )}
      </motion.button>
    </div>
  );
}
