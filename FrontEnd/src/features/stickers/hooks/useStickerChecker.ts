import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/features/stats/store/sessionStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useStickerStore } from '../store/stickerStore';
import { ALL_STICKERS } from '../data/catalog';
import type { SessionData } from '../data/catalog';
import { checkUnlocks, computeAggregateStats } from '@/lib/sticker-engine';
import { getEarnedStickers, insertEarnedSticker } from '@/services/database';

/**
 * Watches for new completed sessions and checks for sticker unlocks.
 * Should be mounted once at the app level (e.g. in HomePage).
 */
export function useStickerChecker() {
  const sessions = useSessionStore((s) => s.sessions);
  const user = useAuthStore((s) => s.user);
  const stickerActions = useStickerStore((s) => s.actions);
  const prevCountRef = useRef(sessions.length);
  const initializedRef = useRef(false);

  // Load earned stickers on auth
  useEffect(() => {
    if (initializedRef.current) return;

    if (user) {
      getEarnedStickers(user.id)
        .then((earned) => {
          stickerActions.loadEarned(earned.map((e) => e.sticker_id));
          initializedRef.current = true;
        })
        .catch((err) => {
          console.error('[StickerChecker] Failed to load earned stickers:', err);
          initializedRef.current = true;
        });
    } else {
      // Local-only mode — start with empty
      initializedRef.current = true;
    }
  }, [user, stickerActions]);

  // Check for new unlocks when a session is added
  useEffect(() => {
    const prevCount = prevCountRef.current;
    prevCountRef.current = sessions.length;

    // Only run when a new session was added (not on initial load)
    if (sessions.length <= prevCount || prevCount === 0) return;

    const latestSession = sessions[0];
    if (!latestSession) return;

    const earnedIds = useStickerStore.getState().earnedIds;

    // Build session data for the engine
    const sessionData: SessionData = {
      focus_seconds: latestSession.focusSeconds,
      sleepy_count: latestSession.sleepyCount,
      completed: latestSession.completed,
      start_time: new Date(latestSession.startTime).toISOString(),
    };

    // Compute aggregate stats (streak defaults to 0 for now — Phase 2c will add real streak)
    const stats = computeAggregateStats(sessions, 0, 0);

    // Check for new unlocks
    const newlyUnlocked = checkUnlocks(ALL_STICKERS, earnedIds, stats, sessionData);

    if (newlyUnlocked.length > 0) {
      console.log('[StickerChecker] New stickers unlocked:', newlyUnlocked.map((s) => s.id));

      // Queue animations
      stickerActions.queueUnlocks(newlyUnlocked);

      // Persist to Supabase
      if (user) {
        for (const sticker of newlyUnlocked) {
          insertEarnedSticker(user.id, sticker.id).catch((err) => {
            console.error('[StickerChecker] Failed to persist sticker:', err);
          });
        }
      }
    }
  }, [sessions, user, stickerActions]);
}
