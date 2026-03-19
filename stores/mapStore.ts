import { create } from 'zustand';

export interface MapBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

interface MapState {
  mapCenter: { lat: number; lng: number };
  zoomLevel: number;
  mapMoved: boolean;
  lastLoadCenter: { lat: number; lng: number } | null;
  bounds: MapBounds | null;

  setMapCenter: (center: { lat: number; lng: number }) => void;
  setZoomLevel: (level: number) => void;
  setMapMoved: (moved: boolean) => void;
  setLastLoadCenter: (center: { lat: number; lng: number }) => void;
  setBounds: (bounds: MapBounds) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  mapCenter: { lat: 37.5065, lng: 127.0350 },
  zoomLevel: 14,
  mapMoved: false,
  lastLoadCenter: null,
  bounds: null,

  setMapCenter: (center) => {
    set({ mapCenter: center });
    const last = get().lastLoadCenter;
    if (last) {
      const dist = Math.abs(last.lat - center.lat) + Math.abs(last.lng - center.lng);
      if (dist > 0.005) {
        set({ mapMoved: true });
      }
    }
  },
  setZoomLevel: (level) => set({ zoomLevel: level }),
  setMapMoved: (moved) => set({ mapMoved: moved }),
  setLastLoadCenter: (center) => set({ lastLoadCenter: center }),
  setBounds: (bounds) => set({ bounds }),
}));
