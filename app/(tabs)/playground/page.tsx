'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { usePlaygroundStore } from '@/stores/playgroundStore';
import { PLAYGROUND_TYPE_LABELS } from '@/types/playground';
import { SkeletonBox } from '@/components/ui/Skeleton';
import PlaygroundDetailSheet from '@/components/playground/PlaygroundDetailSheet';
import type { Playground } from '@/types/playground';

type SortMode = 'distance' | 'name' | 'dog_size';
type FilterMode = 'all' | 'large' | 'indoor' | 'public' | 'unmanned' | 'staffed' | 'outdoor' | 'cafe' | 'hotel';

const PAGE_SIZE = 10;

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export default function PlaygroundPage() {
  const allPlaygrounds = usePlaygroundStore((s) => s.playgrounds);
  const isLoading = usePlaygroundStore((s) => s.isLoading);
  const error = usePlaygroundStore((s) => s.error);
  const loadPlaygrounds = usePlaygroundStore((s) => s.loadPlaygrounds);
  const [sortBy, setSortBy] = useState<SortMode>('distance');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      setSortBy('name');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { setLocationError(true); setSortBy('name'); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => { loadPlaygrounds(); }, [loadPlaygrounds]);

  const distanceMap = useMemo(() => {
    if (!userLocation) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const p of allPlaygrounds) {
      map.set(p.id, getDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng));
    }
    return map;
  }, [userLocation, allPlaygrounds]);

  const playgrounds = useMemo(() => {
    return allPlaygrounds
      .filter((p) => {
        if (filter === 'large') return p.large_dog;
        if (filter === 'indoor') return p.indoor_allowed;
        if (filter === 'outdoor') return !p.indoor_allowed;
        if (filter === 'public') return p.is_public;
        if (filter === 'unmanned') return p.is_unmanned;
        if (filter === 'staffed') return !p.is_unmanned;
        if (filter === 'cafe') return p.playground_type === 'cafe';
        if (filter === 'hotel') return p.playground_type === 'hotel';
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance' && userLocation) {
          return (distanceMap.get(a.id) ?? Infinity) - (distanceMap.get(b.id) ?? Infinity);
        }
        if (sortBy === 'dog_size') {
          const score = (p: Playground) => (p.large_dog ? 3 : p.medium_dog ? 2 : 1);
          return score(b) - score(a);
        }
        return a.name.localeCompare(b.name, 'ko');
      });
  }, [allPlaygrounds, filter, sortBy, userLocation, distanceMap]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filter, sortBy]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, playgrounds.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [playgrounds.length]);

  const visiblePlaygrounds = playgrounds.slice(0, visibleCount);
  const hasMore = visibleCount < playgrounds.length;

  const sortLabel = sortBy === 'distance' ? '거리순' : sortBy === 'name' ? '이름순' : '크기순';
  const nextSort = (): SortMode => {
    if (sortBy === 'distance') return 'name';
    if (sortBy === 'name') return 'dog_size';
    return userLocation ? 'distance' : 'name';
  };

  const selectedPlayground = selectedId ? allPlaygrounds.find((p) => p.id === selectedId) : null;

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-warm-50">
        <div className="bg-gradient-to-br from-primary to-primary-dark p-6 pb-8 text-white">
          <span className="text-4xl block mb-2">🐕</span>
          <h2 className="text-xl font-bold mb-1">반려동물 놀이터</h2>
          <p className="text-sm text-white/80">전국 반려동물 놀이터와 운동장을 한눈에!</p>
          {allPlaygrounds.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">총 {allPlaygrounds.length}곳</span>
              {userLocation && (
                <span className="bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">📍 내 위치 기준</span>
              )}
            </div>
          )}
        </div>
        {allPlaygrounds.length > 0 && (
          <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {([
              { id: 'all' as const, label: '전체' },
              { id: 'public' as const, label: '🏛️ 공공' },
              { id: 'unmanned' as const, label: '🤖 무인' },
              { id: 'staffed' as const, label: '👤 유인' },
              { id: 'outdoor' as const, label: '🌳 실외' },
              { id: 'indoor' as const, label: '🏠 실내' },
              { id: 'cafe' as const, label: '☕ 카페' },
              { id: 'hotel' as const, label: '🏨 호텔' },
            ] satisfies { id: FilterMode; label: string }[]).map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${filter === f.id ? 'bg-primary text-white border-primary' : 'bg-surface text-warm-600 border-warm-200 hover:border-warm-300'}`}>{f.label}</button>
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
                {visiblePlaygrounds.map((pg, idx) => {
                  const hours = pg.business_hours.hours || '정보 없음';
                  const isClosed = hours === '정보 없음';
                  const dist = distanceMap.get(pg.id);
                  return (
                    <button key={pg.id} onClick={() => setSelectedId(pg.id)} className="bg-surface rounded-2xl overflow-hidden shadow-card border border-warm-100 text-left press-scale hover:shadow-card-hover transition-shadow animate-fade-in-up" style={{ animationDelay: `${Math.min(idx, 10) * 40}ms`, animationFillMode: 'both' }} aria-label={`${pg.name} 상세보기`}>
                      <div className="relative w-full h-32 bg-gradient-to-br from-primary/15 to-primary-50 flex items-center justify-center overflow-hidden">
                        {pg.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/api/image/${pg.thumbnail}?w=640`} alt={pg.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="text-center"><span className="text-4xl block">🏃</span><p className="text-xs text-primary-dark/60 mt-1 font-medium">{pg.name}</p></div>
                        )}
                        <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold backdrop-blur-sm ${!isClosed ? 'bg-primary/90 text-white' : 'bg-warm-400/90 text-white'}`}>{!isClosed ? '영업중' : '정보없음'}</span>
                          {dist != null && (
                            <span className="text-[10px] px-2 py-1 rounded-full font-bold backdrop-blur-sm bg-black/50 text-white">
                              📍 {formatDistance(dist)}
                            </span>
                          )}
                          {pg.is_public && (
                            <span className="text-[10px] px-2 py-1 rounded-full font-bold backdrop-blur-sm bg-blue-500/90 text-white">공공</span>
                          )}
                          {pg.is_unmanned && (
                            <span className="text-[10px] px-2 py-1 rounded-full font-bold backdrop-blur-sm bg-purple-500/90 text-white">무인</span>
                          )}
                          {pg.playground_type !== 'playground' && (
                            <span className="text-[10px] px-2 py-1 rounded-full font-bold backdrop-blur-sm bg-amber-500/90 text-white">{PLAYGROUND_TYPE_LABELS[pg.playground_type]}</span>
                          )}
                        </div>
                      </div>
                      <div className="p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-warm-900 truncate">{pg.name}</h3>
                          <div className="flex gap-0.5 shrink-0">
                            {[{ ok: pg.small_dog, label: 'S' }, { ok: pg.medium_dog, label: 'M' }, { ok: pg.large_dog, label: 'L' }].map((d) => (
                              <span key={d.label} className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center ${d.ok ? 'bg-primary-100 text-primary-dark border border-primary/30' : 'bg-warm-100 text-warm-300 border border-warm-200'}`}>{d.label}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-warm-500 mt-1 truncate">{pg.address}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[11px] text-warm-400">{pg.indoor_allowed ? '🏠 실내' : '🌳 실외'}</span>
                          {pg.phone && (
                            <>
                              <span className="text-warm-300">·</span>
                              <span className="text-[11px] text-warm-400">{pg.phone}</span>
                            </>
                          )}
                        </div>
                        {pg.business_hours.hours && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[11px] text-warm-500">🕐 {pg.business_hours.hours}</span>
                            {pg.business_hours.closedDays && (
                              <>
                                <span className="text-warm-300">·</span>
                                <span className="text-[11px] text-warm-400">휴무: {pg.business_hours.closedDays}</span>
                              </>
                            )}
                          </div>
                        )}
                        {pg.instagram && (
                          <p className="text-[11px] text-pink-500 mt-1">@{pg.instagram}</p>
                        )}
                        {pg.tags.length > 0 && (
                          <div className="flex gap-1 mt-2.5 overflow-hidden">
                            {pg.tags.slice(0, 3).map((tag: string) => (<span key={tag} className="px-2 py-0.5 bg-primary-50 text-primary-dark rounded-full text-[10px] font-semibold border border-primary/20">#{tag}</span>))}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
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
          ) : allPlaygrounds.length > 0 ? (
            <div className="bg-surface rounded-2xl p-8 text-center shadow-card border border-warm-100">
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-sm font-medium text-warm-700">조건에 맞는 놀이터가 없어요</p>
              <button onClick={() => setFilter('all')} className="text-xs text-primary font-semibold mt-2 hover:underline">필터 초기화</button>
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

      <PlaygroundDetailSheet
        playground={selectedPlayground ?? null}
        isOpen={!!selectedPlayground}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
