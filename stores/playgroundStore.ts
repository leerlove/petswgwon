import { create } from 'zustand';
import type { Place } from '@/types';

interface PlaygroundState {
  places: Place[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  loadPlaygrounds: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5분

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  places: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  loadPlaygrounds: async () => {
    const { lastFetchedAt, places, isLoading } = get();
    if (isLoading) return;
    if (lastFetchedAt && places.length > 0 && Date.now() - lastFetchedAt < CACHE_DURATION) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/places?sub_category=playground');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      set({ places: data.places ?? [], isLoading: false, lastFetchedAt: Date.now() });
    } catch {
      set({ error: '놀이터 목록을 불러오지 못했습니다.', isLoading: false });
    }
  },
}));
