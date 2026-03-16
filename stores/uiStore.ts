import { create } from 'zustand';
import type { Place } from '@/types';

interface UIState {
  popupPlace: Place | null;
  detailPlace: Place | null;
  isDetailOpen: boolean;
  detailScrollPage: number;
  isSearchOpen: boolean;
  clusterPlaces: Place[];

  setPopupPlace: (place: Place | null) => void;
  openDetail: (place: Place) => void;
  closeDetail: () => void;
  setDetailScrollPage: (page: number) => void;
  setSearchOpen: (open: boolean) => void;
  openClusterList: (places: Place[]) => void;
  closeClusterList: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  popupPlace: null,
  detailPlace: null,
  isDetailOpen: false,
  detailScrollPage: 0,
  isSearchOpen: false,
  clusterPlaces: [],

  setPopupPlace: (place) => set({ popupPlace: place }),

  openDetail: (place) => set({
    detailPlace: place,
    isDetailOpen: true,
    detailScrollPage: 0,
    popupPlace: null,
    clusterPlaces: [],
  }),

  closeDetail: () => set({
    detailPlace: null,
    isDetailOpen: false,
    detailScrollPage: 0,
  }),

  setDetailScrollPage: (page) => set({ detailScrollPage: page }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  openClusterList: (places) => set({ clusterPlaces: places, popupPlace: null }),
  closeClusterList: () => set({ clusterPlaces: [] }),
}));
