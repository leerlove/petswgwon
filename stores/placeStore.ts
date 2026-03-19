import { create } from 'zustand';
import type { Place } from '@/types';
import type { FetchPlacesParams } from '@/lib/api';
import { fetchPlaces, searchPlaces as searchPlacesApi, toggleBookmark } from '@/lib/api';
import { useMapStore } from '@/stores/mapStore';

let searchRequestId = 0;
let loadRequestId = 0;

interface PlaceState {
  places: Place[];
  totalCount: number;
  isLoading: boolean;
  loadError: string | null;
  searchQuery: string;
  activeMarkerId: string | null;

  setPlaces: (places: Place[]) => void;
  setSearchQuery: (query: string) => void;
  selectMarker: (id: string | null) => void;
  toggleBookmark: (placeId: string) => void;
  loadPlaces: (params?: FetchPlacesParams) => Promise<void>;
  searchPlaces: (query: string, category?: string) => Promise<void>;
}

export const usePlaceStore = create<PlaceState>((set, get) => ({
  places: [],
  totalCount: 0,
  isLoading: false,
  loadError: null,
  searchQuery: '',
  activeMarkerId: null,

  setPlaces: (places) => set({ places }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectMarker: (id) => {
    if (!id) {
      set({ activeMarkerId: null });
      return;
    }
    const place = get().places.find((p) => p.id === id);
    if (!place) {
      set({ activeMarkerId: null });
      return;
    }
    set({ activeMarkerId: id });
  },

  toggleBookmark: async (placeId) => {
    const current = get().places.find((p) => p.id === placeId);
    const previousValue = current?.is_bookmarked ?? false;

    const updateBookmark = (places: Place[], bookmarked: boolean) =>
      places.map((p) => p.id === placeId ? { ...p, is_bookmarked: bookmarked } : p);

    set((state) => ({ places: updateBookmark(state.places, !previousValue) }));

    try {
      const result = await toggleBookmark(placeId);
      if (result.bookmarked === previousValue) {
        set((state) => ({ places: updateBookmark(state.places, result.bookmarked) }));
      }
    } catch {
      set((state) => ({ places: updateBookmark(state.places, previousValue) }));
    }
  },

  loadPlaces: async (params) => {
    const reqId = ++loadRequestId;
    set({ isLoading: true, loadError: null });
    try {
      const { places, total } = await fetchPlaces(params);
      if (reqId === loadRequestId) {
        set({ places, totalCount: total, isLoading: false, loadError: null });
        const mapState = useMapStore.getState();
        useMapStore.setState({
          mapMoved: false,
          lastLoadCenter: mapState.mapCenter,
        });
      }
    } catch {
      if (reqId === loadRequestId) {
        set({ isLoading: false, loadError: '장소를 불러오지 못했습니다.' });
      }
    }
  },

  searchPlaces: async (query, category) => {
    if (!query.trim()) return;
    const reqId = ++searchRequestId;
    set({ isLoading: true, searchQuery: query, loadError: null });
    try {
      const data = await searchPlacesApi(query, category);
      if (reqId === searchRequestId) {
        set({ places: data, isLoading: false, loadError: null });
      }
    } catch {
      if (reqId === searchRequestId) {
        set({ isLoading: false, loadError: '검색에 실패했습니다.' });
      }
    }
  },
}));
