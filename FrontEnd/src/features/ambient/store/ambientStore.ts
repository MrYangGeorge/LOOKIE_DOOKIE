import { create } from 'zustand';
import { audioService } from '@/services/audioService';

interface AmbientState {
  // Map of sound ID -> volume (0.0 to 1.0), only active sounds
  activeSounds: Map<string, number>;

  actions: {
    toggle: (id: string) => void;
    setVolume: (id: string, volume: number) => void;
    stopAll: () => void;
  };
}

const SOUND_FILES: Record<string, string> = {
  'white-noise': '/sounds/white-noise.mp3',
  rain: '/sounds/rain.mp3',
  cafe: '/sounds/cafe.mp3',
  nature: '/sounds/nature.mp3',
};

const DEFAULT_VOLUME = 0.5;

export const useAmbientStore = create<AmbientState>((set, get) => ({
  activeSounds: new Map(),

  actions: {
    toggle: (id: string) => {
      const { activeSounds } = get();
      const newMap = new Map(activeSounds);

      if (newMap.has(id)) {
        audioService.stopAmbient(id);
        newMap.delete(id);
      } else {
        const src = SOUND_FILES[id];
        if (src) {
          audioService.playAmbient(id, src, DEFAULT_VOLUME);
          newMap.set(id, DEFAULT_VOLUME);
        }
      }

      set({ activeSounds: newMap });
    },

    setVolume: (id: string, volume: number) => {
      const { activeSounds } = get();
      if (!activeSounds.has(id)) return;

      audioService.setAmbientVolume(id, volume);
      const newMap = new Map(activeSounds);
      newMap.set(id, volume);
      set({ activeSounds: newMap });
    },

    stopAll: () => {
      audioService.stopAllAmbient();
      set({ activeSounds: new Map() });
    },
  },
}));
