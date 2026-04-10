import { create } from 'zustand';
import type { Playground } from '@/types/playground';

interface PlaygroundState {
  playgrounds: Playground[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  loadPlaygrounds: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5분

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  playgrounds: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  loadPlaygrounds: async () => {
    const { lastFetchedAt, playgrounds, isLoading } = get();
    if (isLoading) return;
    if (lastFetchedAt && playgrounds.length > 0 && Date.now() - lastFetchedAt < CACHE_DURATION) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/playgrounds');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      set({ playgrounds: data.playgrounds ?? [], isLoading: false, lastFetchedAt: Date.now() });
    } catch {
      set({ error: '놀이터 목록을 불러오지 못했습니다.', isLoading: false });
    }
  },
}));
