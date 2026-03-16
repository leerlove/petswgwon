'use client';

import { useEffect } from 'react';
import { usePlaceStore } from '@/stores/placeStore';
import { useFilterStore } from '@/stores/filterStore';
import { useMapStore } from '@/stores/mapStore';
import { useUIStore } from '@/stores/uiStore';
import SearchBar from '@/components/map/SearchBar';
import CategoryTabBar from '@/components/map/CategoryTabBar';
import MapContainer from '@/components/map/MapContainer';
import PlacePopup from '@/components/place/PlacePopup';
import ClusterPlaceList from '@/components/place/ClusterPlaceList';
import PlaceDetailSheet from '@/components/place/PlaceDetailSheet';

export default function PetZonePage() {
  const isSearchOpen = useUIStore((s) => s.isSearchOpen);
  const loadPlaces = usePlaceStore((s) => s.loadPlaces);
  const loadError = usePlaceStore((s) => s.loadError);
  const isLoading = usePlaceStore((s) => s.isLoading);
  const activeCategory = useFilterStore((s) => s.activeCategory);
  const activeSubCategory = useFilterStore((s) => s.activeSubCategory);
  const filters = useFilterStore((s) => s.filters);

  // Re-fetch when category, subcategory, or filters change (but only if map bounds are ready)
  useEffect(() => {
    const bounds = useMapStore.getState().bounds;
    if (!bounds) return; // Map not initialized yet - MapContainer handles first load
    loadPlaces({
      category: activeCategory !== 'all' ? activeCategory : undefined,
      sub_category: activeSubCategory || undefined,
      bounds,
      petSize: filters.petSize !== 'all' ? filters.petSize : undefined,
      indoor: filters.indoor,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeSubCategory, filters]);

  const handleRetry = () => {
    const bounds = useMapStore.getState().bounds;
    if (!bounds) return;
    loadPlaces({
      category: activeCategory !== 'all' ? activeCategory : undefined,
      sub_category: activeSubCategory || undefined,
      bounds,
      petSize: filters.petSize !== 'all' ? filters.petSize : undefined,
      indoor: filters.indoor,
    });
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      <div className="flex-1 relative">
        <MapContainer />
        {!isSearchOpen && (<div className="absolute top-0 left-0 right-0 z-20 p-3"><SearchBar /></div>)}
        {isSearchOpen && (<div className="absolute inset-0 z-50"><SearchBar /></div>)}
        {loadError && !isLoading && (
          <div className="absolute top-16 left-3 right-3 z-20 animate-fade-in">
            <div className="bg-accent-rose/10 border border-accent-rose/30 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className="text-lg shrink-0">⚠️</span>
              <p className="text-sm text-accent-rose flex-1">{loadError}</p>
              <button onClick={handleRetry} className="px-3 py-1.5 bg-accent-rose/15 hover:bg-accent-rose/25 text-accent-rose rounded-lg text-xs font-semibold transition-colors press-scale shrink-0">재시도</button>
            </div>
          </div>
        )}
        <PlacePopup />
        <ClusterPlaceList />
        <CategoryTabBar />
      </div>
      <PlaceDetailSheet />
    </div>
  );
}
