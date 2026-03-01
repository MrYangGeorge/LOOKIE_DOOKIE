import { Flame, Trophy } from 'lucide-react';
import type { StreakInfo } from '../hooks/useStats';

interface StreakDisplayProps {
  streak: StreakInfo;
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
      <div className="flex items-center gap-5">
        {/* Current streak */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Flame size={24} className="text-secondary" />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-foreground">{streak.currentStreak}</p>
            <p className="text-xs font-semibold text-muted-foreground">day streak</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-border" />

        {/* Longest streak */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Trophy size={18} className="text-accent" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{streak.longestStreak}</p>
            <p className="text-xs text-muted-foreground">longest</p>
          </div>
        </div>
      </div>
    </div>
  );
}
