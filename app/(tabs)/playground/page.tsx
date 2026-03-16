'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { SkeletonBox } from '@/components/ui/Skeleton';
import PlaceDetailSheet from '@/components/place/PlaceDetailSheet';
import type { Place } from '@/types';

type SortMode = 'distance' | 'name' | 'dog_size';

const PAGE_SIZE = 10;

/** Haversine 공식으로 두 좌표 간 거리(km) 계산 */
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 거리를 사람이 읽기 좋은 문자열로 변환 */
function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export default function PlaygroundPage() {
  const openDetail = useUIStore((s) => s.openDetail);
  const [playgroundPlaces, setPlaygroundPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>('distance');
  const [filterDog, setFilterDog] = useState<'all' | 'large' | 'indoor'>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 현재 위치 가져오기
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      setSortBy('name');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocationError(true);
        setSortBy('name');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  const loadPlaygrounds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/places?sub_category=playground');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPlaygroundPlaces(data.places ?? []);
    } catch {
      setError('놀이터 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadPlaygrounds(); }, [loadPlaygrounds]);

  // 각 장소별 거리 계산 (메모이제이션)
  const distanceMap = useMemo(() => {
    if (!userLocation) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const p of playgroundPlaces) {
      map.set(p.id, getDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng));
    }
    return map;
  }, [userLocation, playgroundPlaces]);

  const playgrounds = useMemo(() => {
    return playgroundPlaces
      .filter((p) => {
        if (filterDog === 'large') return p.pet_conditions.large_dog;
        if (filterDog === 'indoor') return p.pet_conditions.indoor_allowed;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance' && userLocation) {
          return (distanceMap.get(a.id) ?? Infinity) - (distanceMap.get(b.id) ?? Infinity);
        }
        if (sortBy === 'dog_size') {
          const score = (p: Place) => (p.pet_conditions.large_dog ? 3 : p.pet_conditions.medium_dog ? 2 : 1);
          return score(b) - score(a);
        }
        return a.name.localeCompare(b.name, 'ko');
      });
  }, [playgroundPlaces, filterDog, sortBy, userLocation, distanceMap]);

  // 필터/정렬 변경 시 visibleCount 초기화
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filterDog, sortBy]);

  // IntersectionObserver로 무한 스크롤
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => {
            const next = prev + PAGE_SIZE;
            return next > playgrounds.length ? playgrounds.length : next;
          });
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [playgrounds.length]);

  const visiblePlaygrounds = playgrounds.slice(0, visibleCount);
  const hasMore = visibleCount < playgrounds.length;

  const todayKey = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const)[new Date().getDay()];

  const sortLabel = sortBy === 'distance' ? '거리순' : sortBy === 'name' ? '이름순' : '크기순';
  const nextSort = (): SortMode => {
    if (sortBy === 'distance') return 'name';
    if (sortBy === 'name') return 'dog_size';
    return userLocation ? 'distance' : 'name';
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-warm-50">
        <div className="bg-gradient-to-br from-primary to-primary-dark p-6 pb-8 text-white">
          <span className="text-4xl block mb-2">🐕</span>
          <h2 className="text-xl font-bold mb-1">반려동물 놀이터</h2>
          <p className="text-sm text-white/80">전국 반려동물 놀이터와 운동장을 한눈에!</p>
          {playgroundPlaces.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">총 {playgroundPlaces.length}곳</span>
              {userLocation && (
                <span className="bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">📍 내 위치 기준</span>
              )}
            </div>
          )}
        </div>
        {playgroundPlaces.length > 0 && (
          <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all' as const, label: '전체' },
              { id: 'large' as const, label: '🐕‍🦺 대형견 가능' },
              { id: 'indoor' as const, label: '🏠 실내' },
            ].map((f) => (
              <button key={f.id} onClick={() => setFilterDog(f.id)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${filterDog === f.id ? 'bg-primary text-white border-primary' : 'bg-surface text-warm-600 border-warm-200 hover:border-warm-300'}`}>{f.label}</button>
            ))}
            <div className="w-px bg-warm-200 shrink-0 my-1" />
            <button onClick={() => setSortBy(nextSort())} className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-surface text-warm-600 border border-warm-200 hover:border-warm-300 transition-colors flex items-center gap-1">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M7 12h10M10 18h4"/></svg>
              {sortLabel}
            </button>
          </div>
        )}
        <div className="p-4 safe-bottom">
          {isLoading ? (
            <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => (<div key={i} className="bg-surface rounded-2xl overflow-hidden shadow-card border border-warm-100"><SkeletonBox className="w-full h-32 rounded-none" /><div className="p-3.5"><SkeletonBox className="w-2/3 h-4 mb-2" /><SkeletonBox className="w-full h-3 mb-1.5" /><SkeletonBox className="w-1/2 h-3" /></div></div>))}</div>
          ) : error ? (
            <div className="bg-surface rounded-2xl p-8 text-center shadow-card border border-warm-100">
              <span className="text-4xl block mb-3">⚠️</span>
              <p className="text-sm font-medium text-warm-700">{error}</p>
              <button onClick={loadPlaygrounds} className="text-xs text-primary font-semibold mt-2 hover:underline">다시 시도</button>
            </div>
          ) : visiblePlaygrounds.length > 0 ? (
            <>
              <div className="flex flex-col gap-3">
                {visiblePlaygrounds.map((place, idx) => {
                  const hours = place.business_hours[todayKey] || '정보 없음';
                  const isOpen = hours !== '휴무' && hours !== '정보 없음';
                  const dist = distanceMap.get(place.id);
                  return (
                    <button key={place.id} onClick={() => openDetail(place)} className="bg-surface rounded-2xl overflow-hidden shadow-card border border-warm-100 text-left press-scale hover:shadow-card-hover transition-shadow animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 40}ms`, animationFillMode: 'both' }} aria-label={`${place.name} 상세보기`}>
                      <div className="relative w-full h-32 bg-gradient-to-br from-primary/15 to-primary-50 flex items-center justify-center">
                        <div className="text-center"><span className="text-4xl block">🏃</span><p className="text-xs text-primary-dark/60 mt-1 font-medium">{place.name}</p></div>
                        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold backdrop-blur-sm ${isOpen ? 'bg-primary/90 text-white' : 'bg-accent-rose/90 text-white'}`}>{isOpen ? '영업중' : '휴무'}</span>
                          {dist != null && (
                            <span className="text-[10px] px-2 py-1 rounded-full font-bold backdrop-blur-sm bg-black/50 text-white">
                              📍 {formatDistance(dist)}
                            </span>
                          )}
                        </div>
                        {place.is_bookmarked && <div className="absolute top-2.5 right-2.5"><span className="text-sm">❤️</span></div>}
                      </div>
                      <div className="p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-warm-900 truncate">{place.name}</h3>
                          <div className="flex gap-0.5 shrink-0">
                            {[{ ok: place.pet_conditions.small_dog, label: 'S' }, { ok: place.pet_conditions.medium_dog, label: 'M' }, { ok: place.pet_conditions.large_dog, label: 'L' }].map((d) => (
                              <span key={d.label} className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center ${d.ok ? 'bg-primary-100 text-primary-dark border border-primary/30' : 'bg-warm-100 text-warm-300 border border-warm-200'}`}>{d.label}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-warm-500 mt-1 truncate">{place.address}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[11px] text-warm-400">{place.pet_conditions.indoor_allowed ? '🏠 실내 가능' : '🌳 실외'}</span>
                          <span className="text-warm-300">·</span>
                          <span className="text-[11px] text-warm-400">{place.pet_conditions.access_method}</span>
                        </div>
                        <div className="flex gap-1 mt-2.5 overflow-hidden">
                          {place.tags.slice(0, 3).map((tag) => (<span key={tag} className="px-2 py-0.5 bg-primary-50 text-primary-dark rounded-full text-[10px] font-semibold border border-primary/20">#{tag}</span>))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* 무한 스크롤 센티넬 */}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-6">
                  <div className="flex items-center gap-2 text-warm-400">
                    <div className="w-4 h-4 border-2 border-warm-300 border-t-primary rounded-full animate-spin" />
                    <span className="text-xs">{visibleCount} / {playgrounds.length}곳 표시 중</span>
                  </div>
                </div>
              )}
              {!hasMore && playgrounds.length > PAGE_SIZE && (
                <p className="text-center text-[11px] text-warm-400 py-4">모든 놀이터를 표시했습니다 ({playgrounds.length}곳)</p>
              )}
            </>
          ) : playgroundPlaces.length > 0 ? (
            <div className="bg-surface rounded-2xl p-8 text-center shadow-card border border-warm-100">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-sm font-medium text-warm-700">조건에 맞는 놀이터가 없어요</p>
              <button onClick={() => setFilterDog('all')} className="text-xs text-primary font-semibold mt-2 hover:underline">필터 초기화</button>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl p-8 text-center shadow-card border border-warm-100">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-sm font-medium text-warm-700">등록된 놀이터가 없어요</p>
              <p className="text-xs text-warm-400 mt-1">곧 업데이트됩니다!</p>
            </div>
          )}
          {locationError && (
            <p className="text-center text-[11px] text-warm-400 mt-3">위치 권한이 없어 거리순 정렬을 사용할 수 없습니다.</p>
          )}
        </div>
      </div>
      <PlaceDetailSheet />
    </>
  );
}
