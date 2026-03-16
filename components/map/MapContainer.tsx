'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlaceStore } from '@/stores/placeStore';
import { useFilterStore } from '@/stores/filterStore';
import { useMapStore } from '@/stores/mapStore';
import { useUIStore } from '@/stores/uiStore';
import type { MapBounds } from '@/stores/mapStore';
import { getCategoryColor, CAT_EMOJI } from '@/data/categories';
import { escapeHtml } from '@/lib/escapeHtml';
import { loadKakaoMapSDK } from '@/lib/kakaoMap';
import type { Place, CategoryType } from '@/types';

// Cluster ID → places mapping for cluster click
const clusterPlacesMap = new Map<string, Place[]>();

declare global {
  interface Window {
    __pz_marker_click?: (placeId: string) => void;
    __pz_cluster_click?: (clusterId: string) => void;
  }
}

function getMapBounds(map: kakao.maps.Map): MapBounds {
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return { swLat: sw.getLat(), swLng: sw.getLng(), neLat: ne.getLat(), neLng: ne.getLng() };
}

function triggerLoad(bounds: MapBounds) {
  const { activeCategory, activeSubCategory, filters } = useFilterStore.getState();
  usePlaceStore.getState().loadPlaces({
    category: activeCategory !== 'all' ? activeCategory : undefined,
    sub_category: activeSubCategory || undefined,
    bounds,
    petSize: filters.petSize !== 'all' ? filters.petSize : undefined,
    indoor: filters.indoor,
  });
}

function createMarkerContent(place: Place, isActive: boolean): string {
  const color = getCategoryColor(place.category);
  const emoji = CAT_EMOJI[place.category] ?? '📍';
  const safeName = escapeHtml(place.name);
  const safeId = escapeHtml(place.id);
  const size = isActive ? 48 : 38;
  const fontSize = isActive ? '20px' : '14px';
  return `<div style="cursor:pointer;display:flex;flex-direction:column;align-items:center;transition:transform 0.2s;transform:${isActive ? 'scale(1.2)' : 'scale(1)'};" class="marker-pin" data-place-id="${safeId}" onclick="event.stopPropagation();window.__pz_marker_click&&window.__pz_marker_click('${safeId}')">
    ${isActive ? `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;background:${color}25;animation:marker-pulse 1.5s ease-in-out infinite;"></div>` : ''}
    ${isActive ? `<div style="position:absolute;bottom:calc(100% + 4px);left:50%;transform:translateX(-50%);padding:5px 12px;background:${color};color:white;font-size:12px;font-weight:700;border-radius:10px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:40;">${safeName}<svg width="10" height="6" viewBox="0 0 10 6" style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);"><polygon points="0,0 5,6 10,0" fill="${color}" /></svg></div>` : ''}
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:16px;background:${color};border:${isActive ? '3px solid white' : '2px solid white'};box-shadow:${isActive ? `0 0 0 3px ${color}, 0 4px 12px rgba(0,0,0,0.3)` : '0 2px 8px rgba(0,0,0,0.2)'};"><span style="font-size:${fontSize}">${emoji}</span>${isActive ? `<div style="position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;background:#22c55e;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.2);"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>` : ''}</div>
    <svg width="12" height="8" viewBox="0 0 12 8" style="margin-top:-1px"><polygon points="0,0 6,8 12,0" fill="${color}" /></svg>
    ${!isActive ? `<div style="position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);padding:4px 10px;background:rgba(17,24,39,0.9);color:white;font-size:11px;font-weight:500;border-radius:8px;white-space:nowrap;opacity:0;transition:opacity 0.2s;pointer-events:none;" class="marker-tooltip">${safeName}</div>` : ''}
  </div>`;
}

function createClusterContent(count: number, categoryBreakdown: { category: CategoryType; count: number }[], clusterId: string, isActive = false): string {
  const total = categoryBreakdown.reduce((s, b) => s + b.count, 0);
  if (total === 0) return '';
  const topCat = categoryBreakdown[0];
  const topColor = getCategoryColor(topCat.category);
  const baseSize = Math.min(64, Math.max(40, 32 + Math.log10(count + 1) * 12));
  const size = isActive ? baseSize + 10 : baseSize;
  const fontSize = isActive ? (count >= 1000 ? 13 : count >= 100 ? 14 : 16) : (count >= 1000 ? 11 : count >= 100 ? 12 : 14);
  const label = count >= 10000 ? `${(count / 1000).toFixed(0)}k` : count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
  const barW = Math.max(size, 48);
  const barH = 5;
  let barSegments = '';
  let barX = 0;
  categoryBreakdown.forEach((item) => {
    const w = (item.count / total) * barW;
    barSegments += `<rect x="${barX}" y="0" width="${w}" height="${barH}" fill="${getCategoryColor(item.category)}" />`;
    barX += w;
  });
  const badges = categoryBreakdown.slice(0, 3).map((item) => `<span style="font-size:${isActive ? '10px' : '8px'};line-height:1;">${CAT_EMOJI[item.category] ?? ''}</span>`).join('');
  const safeClusterId = clusterId.replace(/'/g, "\\'");
  const checkBadge = `<div style="position:absolute;top:-4px;right:-4px;width:18px;height:18px;border-radius:50%;background:#22c55e;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.2);"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`;
  return `<div style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;transition:transform 0.2s;transform:${isActive ? 'scale(1.15)' : 'scale(1)'};" class="cluster-marker" onmouseenter="if(!this.dataset.active)this.style.transform='scale(1.2)'" onmouseleave="if(!this.dataset.active)this.style.transform='scale(1)'" ${isActive ? 'data-active="1"' : ''} onclick="event.stopPropagation();window.__pz_cluster_click&&window.__pz_cluster_click('${safeClusterId}')">
    ${isActive ? `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${size + 20}px;height:${size + 20}px;border-radius:50%;background:${topColor}20;animation:marker-pulse 1.5s ease-in-out infinite;"></div>` : ''}
    <div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;background:white;border:${isActive ? '4px' : '3px'} solid ${topColor};box-shadow:${isActive ? `0 0 0 3px ${topColor}40, 0 4px 12px rgba(0,0,0,0.25)` : '0 2px 8px rgba(0,0,0,0.15)'};display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;">
      <span style="font-size:${fontSize}px;font-weight:800;color:${isActive ? topColor : '#1f2937'};line-height:1.1;">${label}</span>
      <div style="display:flex;gap:1px;margin-top:1px;">${badges}</div>
      ${isActive ? checkBadge : ''}
    </div>
    <svg width="${barW}" height="${barH}" style="overflow:hidden;border-radius:${barH / 2}px;pointer-events:none;">${barSegments}</svg>
  </div>`;
}

export default function MapContainer() {
  const mapCenter = useMapStore((s) => s.mapCenter);
  const zoomLevel = useMapStore((s) => s.zoomLevel);
  const setMapCenter = useMapStore((s) => s.setMapCenter);
  const setZoomLevel = useMapStore((s) => s.setZoomLevel);
  const activeMarkerId = usePlaceStore((s) => s.activeMarkerId);
  const selectMarker = usePlaceStore((s) => s.selectMarker);
  const isLoading = usePlaceStore((s) => s.isLoading);
  const totalCount = usePlaceStore((s) => s.totalCount);
  const places = usePlaceStore((s) => s.places);
  const activeCategory = useFilterStore((s) => s.activeCategory);
  const searchQuery = usePlaceStore((s) => s.searchQuery);
  const filters = useFilterStore((s) => s.filters);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const isSyncingRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeClusterId = useUIStore((s) => s.activeClusterId);

  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [hasMyLocation, setHasMyLocation] = useState(false);

  const toKakaoLevel = useCallback((storeLevel: number) => Math.max(1, Math.min(14, 24 - storeLevel)), []);
  const toStoreLevel = useCallback((kakaoLevel: number) => Math.max(10, Math.min(20, 24 - kakaoLevel)), []);

  // Client-side filtering for parking and search (server handles category, petSize, indoor)
  const filteredPlaces = (() => {
    let filtered = places;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filters.parking === true) filtered = filtered.filter((p) => p.tags.some((t) => t.includes('주차')));
    return filtered;
  })();

  useEffect(() => {
    let cancelled = false;
    loadKakaoMapSDK()
      .then(() => { if (!cancelled) setSdkReady(true); })
      .catch((err) => { if (!cancelled) setSdkError(err.message); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!sdkReady || !containerRef.current || mapRef.current) return;
    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(mapCenter.lat, mapCenter.lng),
      level: toKakaoLevel(zoomLevel),
    });
    mapRef.current = map;

    const idleHandler = () => {
      if (isSyncingRef.current) return;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        const center = map.getCenter();
        const newLat = center.getLat();
        const newLng = center.getLng();
        const newZoom = toStoreLevel(map.getLevel());
        const store = useMapStore.getState();
        const centerChanged = Math.abs(store.mapCenter.lat - newLat) > 0.00001 || Math.abs(store.mapCenter.lng - newLng) > 0.00001;
        if (centerChanged || store.zoomLevel !== newZoom) {
          if (centerChanged) useMapStore.setState({ mapCenter: { lat: newLat, lng: newLng } });
          if (store.zoomLevel !== newZoom) useMapStore.setState({ zoomLevel: newZoom });
        }
        // Update bounds and auto-load places for the new viewport
        const bounds = getMapBounds(map);
        useMapStore.setState({ bounds });
        triggerLoad(bounds);
      }, 500);
    };
    kakao.maps.event.addListener(map, 'idle', idleHandler);
    kakao.maps.event.addListener(map, 'click', () => {
      selectMarker(null);
      useUIStore.getState().closeClusterList();
    });

    // Initial load: use default bounds or geolocation
    const doInitialLoad = (m: kakao.maps.Map) => {
      setTimeout(() => {
        const bounds = getMapBounds(m);
        useMapStore.setState({ bounds });
        triggerLoad(bounds);
      }, 100);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setHasMyLocation(true);
          map.setCenter(new kakao.maps.LatLng(lat, lng));
          map.setLevel(5, { animate: false });
          useMapStore.setState({ mapCenter: { lat, lng }, zoomLevel: 19 });
          doInitialLoad(map);
        },
        () => {
          // Geolocation denied/failed - load with default center
          doInitialLoad(map);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      doInitialLoad(map);
    }

    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    isSyncingRef.current = true;
    mapRef.current.setCenter(new kakao.maps.LatLng(mapCenter.lat, mapCenter.lng));
    mapRef.current.setLevel(toKakaoLevel(zoomLevel), { animate: true });
    const t = setTimeout(() => { isSyncingRef.current = false; }, 400);
    return () => clearTimeout(t);
  }, [mapCenter.lat, mapCenter.lng, zoomLevel, toKakaoLevel]);

  const renderMarkers = useCallback(() => {
    if (!mapRef.current) return;
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];
    const map = mapRef.current;
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const latPad = (ne.getLat() - sw.getLat()) * 0.1;
    const lngPad = (ne.getLng() - sw.getLng()) * 0.1;
    const viewportPlaces = filteredPlaces.filter((p) =>
      p.lat >= sw.getLat() - latPad && p.lat <= ne.getLat() + latPad &&
      p.lng >= sw.getLng() - lngPad && p.lng <= ne.getLng() + lngPad
    );
    const kakaoLevel = map.getLevel();
    const hasFilter = activeCategory !== 'all';
    let gridSize: number;
    if (kakaoLevel <= 3) gridSize = 0.0005;
    else if (kakaoLevel <= 5) gridSize = hasFilter ? 0.002 : 0.005;
    else if (kakaoLevel <= 8) gridSize = hasFilter ? 0.01 : 0.03;
    else gridSize = hasFilter ? 0.05 : 0.15;
    const clusterMap = new Map<string, Place[]>();
    viewportPlaces.forEach((p) => {
      const key = `${Math.floor(p.lat / gridSize)}_${Math.floor(p.lng / gridSize)}`;
      if (!clusterMap.has(key)) clusterMap.set(key, []);
      clusterMap.get(key)!.push(p);
    });
    clusterPlacesMap.clear();
    const MAX_OVERLAYS = hasFilter ? 80 : 50;
    let overlayCount = 0;
    let clusterIdx = 0;
    const clusterMinSize = kakaoLevel <= 3 ? 5 : kakaoLevel <= 5 ? 3 : 2;
    const sortedClusters = Array.from(clusterMap.values()).sort((a, b) => b.length - a.length);
    for (const clusterPlaces of sortedClusters) {
      if (overlayCount >= MAX_OVERLAYS) break;
      if (clusterPlaces.length >= clusterMinSize) {
        const clusterId = `cluster_${clusterIdx++}`;
        clusterPlacesMap.set(clusterId, clusterPlaces);
        const avgLat = clusterPlaces.reduce((s, p) => s + p.lat, 0) / clusterPlaces.length;
        const avgLng = clusterPlaces.reduce((s, p) => s + p.lng, 0) / clusterPlaces.length;
        const catCount = new Map<CategoryType, number>();
        clusterPlaces.forEach((p) => catCount.set(p.category, (catCount.get(p.category) || 0) + 1));
        const categoryBreakdown = Array.from(catCount.entries()).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
        const isClusterActive = activeClusterId === clusterId;
        const content = createClusterContent(clusterPlaces.length, categoryBreakdown, clusterId, isClusterActive);
        const overlay = new kakao.maps.CustomOverlay({ position: new kakao.maps.LatLng(avgLat, avgLng), content, clickable: true, xAnchor: 0.5, yAnchor: 0.5, zIndex: isClusterActive ? 30 : 5 });
        overlay.setMap(map);
        overlaysRef.current.push(overlay);
      } else {
        for (const place of clusterPlaces) {
          if (overlayCount >= MAX_OVERLAYS) break;
          const content = createMarkerContent(place, activeMarkerId === place.id);
          const overlay = new kakao.maps.CustomOverlay({ position: new kakao.maps.LatLng(place.lat, place.lng), content, clickable: true, xAnchor: 0.5, yAnchor: 1, zIndex: activeMarkerId === place.id ? 30 : 10 });
          overlay.setMap(map);
          overlaysRef.current.push(overlay);
          overlayCount++;
        }
        continue;
      }
      overlayCount++;
    }
  }, [filteredPlaces, activeMarkerId, activeClusterId, activeCategory]);

  useEffect(() => { renderMarkers(); }, [renderMarkers]);

  useEffect(() => {
    window.__pz_marker_click = (placeId: string) => {
      useUIStore.getState().closeClusterList();
      selectMarker(placeId);
    };
    window.__pz_cluster_click = (clusterId: string) => {
      selectMarker(null);
      const places = clusterPlacesMap.get(clusterId);
      if (places && places.length > 0) {
        useUIStore.getState().openClusterList(places, clusterId);
      }
    };
    return () => { delete window.__pz_marker_click; delete window.__pz_cluster_click; };
  }, [selectMarker]);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setZoomLevel(19);
      setHasMyLocation(true);
      setIsLocating(false);
    }, () => { setIsLocating(false); }, { enableHighAccuracy: true, timeout: 5000 });
  }, [setMapCenter, setZoomLevel]);

  if (sdkError) {
    const span = 0.03;
    return (
      <div className="relative w-full h-full overflow-hidden select-none bg-[#EEF4F4]">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 20 }).map((_, i) => { const pct = (i / 19) * 100; return (<g key={i}><line x1={`${pct}%`} y1="0" x2={`${pct}%`} y2="100%" stroke="#d5e8e6" strokeWidth={i % 5 === 0 ? 2 : 1} /><line x1="0" y1={`${pct}%`} x2="100%" y2={`${pct}%`} stroke="#d5e8e6" strokeWidth={i % 5 === 0 ? 2 : 1} /></g>); })}
        </svg>
        {filteredPlaces.slice(0, 30).map((place) => {
          const x = ((place.lng - (mapCenter.lng - span)) / (span * 2)) * 100;
          const y = (1 - (place.lat - (mapCenter.lat - span)) / (span * 2)) * 100;
          if (x < -5 || x > 105 || y < -5 || y > 105) return null;
          const color = getCategoryColor(place.category);
          const isActive = activeMarkerId === place.id;
          return (
            <button key={place.id} onClick={() => selectMarker(place.id)} className="absolute transition-transform duration-200" style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -100%) ${isActive ? 'scale(1.2)' : 'scale(1)'}`, zIndex: isActive ? 30 : 10 }}>
              <div className="flex items-center justify-center rounded-2xl border-2 border-white shadow-lg" style={{ background: color, width: isActive ? 44 : 36, height: isActive ? 44 : 36 }}>
                <span style={{ fontSize: isActive ? 18 : 14 }}>{CAT_EMOJI[place.category] ?? '📍'}</span>
              </div>
            </button>
          );
        })}
        <div className="absolute top-3 left-3 z-20 bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-warm-100"><p className="text-[11px] text-warm-400 font-medium">가상 지도 모드</p></div>
        {!isLoading && filteredPlaces.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"><div className="bg-surface/80 backdrop-blur-sm rounded-2xl px-8 py-5 text-center shadow-lg border border-warm-100"><span className="text-4xl block mb-2">🔍</span><p className="text-sm font-medium text-warm-600">이 지역에 등록된 장소가 없습니다</p></div></div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={containerRef} className="absolute inset-0" />
      {!sdkReady && (<div className="absolute inset-0 flex items-center justify-center bg-warm-50 z-10"><div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /><p className="text-sm text-warm-400">지도 로딩 중...</p></div></div>)}
      <div className="absolute right-3 bottom-36 flex flex-col gap-0 z-20 rounded-xl overflow-hidden shadow-float">
        <button onClick={() => { if (mapRef.current) mapRef.current.setLevel(Math.max(1, mapRef.current.getLevel() - 1), { animate: true }); }} className="w-11 h-11 bg-surface flex items-center justify-center text-warm-500 hover:bg-warm-50 active:bg-warm-100 border-b border-warm-50" aria-label="확대"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
        <button onClick={() => { if (mapRef.current) mapRef.current.setLevel(Math.min(14, mapRef.current.getLevel() + 1), { animate: true }); }} className="w-11 h-11 bg-surface flex items-center justify-center text-warm-500 hover:bg-warm-50 active:bg-warm-100" aria-label="축소"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button>
      </div>
      <button onClick={handleMyLocation} className={`absolute right-3 bottom-[88px] w-11 h-11 rounded-xl shadow-float flex items-center justify-center z-20 hover:bg-warm-50 transition-colors ${hasMyLocation ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-surface'}`} aria-label="내 위치">
        {isLocating ? (<div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />) : (<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="#3B82F6" /><circle cx="12" cy="12" r="7" stroke="#3B82F6" strokeWidth="2" fill="none" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#3B82F6" strokeWidth="2" /></svg>)}
      </button>
      {sdkReady && isLoading && (<div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none"><div className="bg-surface/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-float flex items-center gap-2 border border-warm-100"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /><span className="text-xs font-medium text-warm-400">장소 불러오는 중...</span></div></div>)}
      {sdkReady && !isLoading && filteredPlaces.length === 0 && (<div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"><div className="glass rounded-2xl px-8 py-5 text-center shadow-float animate-scale-in border border-warm-100"><span className="text-4xl block mb-2">🔍</span><p className="text-sm font-medium text-warm-600">이 지역에 등록된 장소가 없습니다</p></div></div>)}
      {sdkReady && !isLoading && totalCount > 1000 && (<div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none"><div className="bg-surface/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-float border border-warm-100"><span className="text-xs font-medium text-warm-400">결과가 많습니다. 지도를 확대해주세요</span></div></div>)}
    </div>
  );
}
