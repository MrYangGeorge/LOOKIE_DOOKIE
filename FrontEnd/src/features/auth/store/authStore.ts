import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;

  actions: {
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setInitialized: () => void;
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  actions: {
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    setInitialized: () => set({ initialized: true, loading: false }),
  },
}));
