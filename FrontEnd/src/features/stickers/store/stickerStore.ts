import { create } from 'zustand';
import type { StickerDefinition } from '../data/catalog';

interface StickerState {
  earnedIds: Set<string>;
  pendingUnlock: StickerDefinition | null;
  unlockQueue: StickerDefinition[];

  actions: {
    loadEarned: (ids: string[]) => void;
    addEarned: (id: string) => void;
    queueUnlocks: (stickers: StickerDefinition[]) => void;
    showNextUnlock: () => void;
    dismissUnlock: () => void;
  };
}

export const useStickerStore = create<StickerState>((set, get) => ({
  earnedIds: new Set<string>([
  "first_focus",
  "early_bird",
  "focus_30min",
  "baby_steps",
]),
  pendingUnlock: null,
  unlockQueue: [],

  actions: {
    loadEarned: (ids) => {
      set({ earnedIds: new Set(ids) });
    },

    addEarned: (id) => {
      set((s) => {
        const next = new Set(s.earnedIds);
        next.add(id);
        return { earnedIds: next };
      });
    },

    queueUnlocks: (stickers) => {
      if (stickers.length === 0) return;

      const state = get();
      // Add all to earned immediately
      const next = new Set(state.earnedIds);
      for (const s of stickers) next.add(s.id);

      // Queue for animation
      const newQueue = [...state.unlockQueue, ...stickers];

      set({ earnedIds: next, unlockQueue: newQueue });

      // Show first if nothing is currently showing
      if (!state.pendingUnlock) {
        set({ pendingUnlock: newQueue[0], unlockQueue: newQueue.slice(1) });
      }
    },

    showNextUnlock: () => {
      const { unlockQueue } = get();
      if (unlockQueue.length > 0) {
        set({ pendingUnlock: unlockQueue[0], unlockQueue: unlockQueue.slice(1) });
      } else {
        set({ pendingUnlock: null });
      }
    },

    dismissUnlock: () => {
      get().actions.showNextUnlock();
    },
  },
}));
