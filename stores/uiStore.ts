import { create } from 'zustand';
import type { Place } from '@/types';

interface UIState {
  popupPlace: Place | null;
  detailPlace: Place | null;
  isDetailOpen: boolean;
  detailScrollPage: number;
  isSearchOpen: boolean;
  clusterPlaces: Place[];
  activeClusterId: string | null;

  setPopupPlace: (place: Place | null) => void;
  openDetail: (place: Place) => void;
  closeDetail: () => void;
  setDetailScrollPage: (page: number) => void;
  setSearchOpen: (open: boolean) => void;
  openClusterList: (places: Place[], clusterId: string) => void;
  closeClusterList: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  popupPlace: null,
  detailPlace: null,
  isDetailOpen: false,
  detailScrollPage: 0,
  isSearchOpen: false,
  clusterPlaces: [],
  activeClusterId: null,

  setPopupPlace: (place) => set({ popupPlace: place }),

  openDetail: (place) => set({
    detailPlace: place,
    isDetailOpen: true,
    detailScrollPage: 0,
    popupPlace: null,
    clusterPlaces: [],
    activeClusterId: null,
  }),

  closeDetail: () => set({
    detailPlace: null,
    isDetailOpen: false,
    detailScrollPage: 0,
  }),

  setDetailScrollPage: (page) => set({ detailScrollPage: page }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  openClusterList: (places, clusterId) => set({ clusterPlaces: places, activeClusterId: clusterId, popupPlace: null }),
  closeClusterList: () => set({ clusterPlaces: [], activeClusterId: null }),
}));
