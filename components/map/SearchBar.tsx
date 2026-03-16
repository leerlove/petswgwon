'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePlaceStore } from '@/stores/placeStore';
import { useUIStore } from '@/stores/uiStore';
import { useFilterStore } from '@/stores/filterStore';
import { useMapStore } from '@/stores/mapStore';
import { categories, CAT_EMOJI, getCategoryColor } from '@/data/categories';
import type { CategoryType } from '@/types';
import { getRecentPlaces, clearRecentPlaces, type RecentPlace } from '@/lib/recentPlaces';

const STORAGE_KEY = 'petzone_recent_searches';
const CATEGORY_CHIPS: { label: string; value: CategoryType | 'all' }[] = [
  { label: '전체', value: 'all' },
  ...categories.map((c) => ({ label: c.name, value: c.id as CategoryType })),
];
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === 'string').slice(0, MAX_RECENT);
  } catch { return []; }
}

function saveRecentSearch(term: string) {
  try {
    const list = getRecentSearches().filter((s) => s !== term);
    list.unshift(term);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch { /* localStorage disabled */ }
}

function removeRecentSearch(term: string) {
  try {
    const list = getRecentSearches().filter((s) => s !== term);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch { /* localStorage disabled */ }
}

export default function SearchBar() {
  const searchQuery = usePlaceStore((s) => s.searchQuery);
  const setSearchQuery = usePlaceStore((s) => s.setSearchQuery);
  const selectMarker = usePlaceStore((s) => s.selectMarker);
  const places = usePlaceStore((s) => s.places);
  const isSearchOpen = useUIStore((s) => s.isSearchOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const openDetail = useUIStore((s) => s.openDetail);
  const activeCategory = useFilterStore((s) => s.activeCategory);
  const setCategory = useFilterStore((s) => s.setCategory);
  const filters = useFilterStore((s) => s.filters);
  const setMapCenter = useMapStore((s) => s.setMapCenter);
  const setZoomLevel = useMapStore((s) => s.setZoomLevel);

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentViewedPlaces, setRecentViewedPlaces] = useState<RecentPlace[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isSearchOpen) {
      const searches = getRecentSearches();
      const viewed = getRecentPlaces();
      const t = setTimeout(() => {
        setRecentSearches(searches);
        setRecentViewedPlaces(viewed);
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isSearchOpen]);

  useEffect(() => { return () => { if (debounceRef.current) clearTimeout(debounceRef.current); }; }, []);

  const filterByQuery = useCallback((q: string) => {
    if (!q.trim()) return [];
    const term = q.trim().toLowerCase();
    return places.filter((p) =>
      p.name.toLowerCase().includes(term) ||
      p.address.toLowerCase().includes(term) ||
      p.tags.some((t) => t.toLowerCase().includes(term))
    );
  }, [places]);

  const filteredPlaces = isSearchOpen ? filterByQuery(localQuery) : [];
  const resultCount = filteredPlaces.length;

  const handleSearch = useCallback(() => {
    const q = localQuery.trim();
    if (q) { saveRecentSearch(q); setRecentSearches(getRecentSearches()); }
    setSearchQuery(q);
    setSearchOpen(false);
    selectMarker(null);
    if (q) {
      const results = filterByQuery(q);
      if (results.length > 0) {
        const avgLat = results.reduce((s, p) => s + p.lat, 0) / results.length;
        const avgLng = results.reduce((s, p) => s + p.lng, 0) / results.length;
        setMapCenter({ lat: avgLat, lng: avgLng });
        setZoomLevel(results.length <= 3 ? 17 : results.length <= 20 ? 15 : 13);
      }
    }
  }, [localQuery, setSearchQuery, setSearchOpen, selectMarker, filterByQuery, setMapCenter, setZoomLevel]);

  const handleClearSearch = useCallback(() => { setLocalQuery(''); setSearchQuery(''); }, [setSearchQuery]);

  const handleQuickSearch = useCallback((term: string) => {
    setLocalQuery(term);
    saveRecentSearch(term);
    setSearchQuery(term);
    setSearchOpen(false);
    selectMarker(null);
  }, [setSearchQuery, setSearchOpen, selectMarker]);

  const handleRemoveRecent = useCallback((term: string) => { removeRecentSearch(term); setRecentSearches(getRecentSearches()); }, []);

  const handleInputChange = useCallback((value: string) => {
    setLocalQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(value.trim()), 300);
  }, [setSearchQuery]);

  if (isSearchOpen) {
    return (
      <div className="absolute inset-0 bg-surface z-50 flex flex-col animate-fade-in">
        <div className="flex items-center gap-2 p-3 border-b border-warm-100">
          <button onClick={() => { setSearchOpen(false); setLocalQuery(searchQuery); }} className="w-11 h-11 flex items-center justify-center text-warm-600 hover:bg-warm-100 rounded-full transition-colors -ml-1.5" aria-label="닫기">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <h2 className="font-bold text-[15px] text-warm-900 flex-1 text-center">펫세권</h2>
          <div className="w-11" />
        </div>
        <div className="px-6 pt-8 pb-4"><p className="text-[15px] text-warm-500 text-center leading-relaxed">전국 32,000곳의 동반장소를 검색해보세요.</p></div>
        <div className="px-4 pb-4">
          <div className="relative">
            <input ref={inputRef} value={localQuery} onChange={(e) => handleInputChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="지역 또는 장소명 입력하세요." className="w-full text-[15px] outline-none bg-surface rounded-xl px-4 py-3.5 pr-12 border border-warm-200 focus:border-primary transition-colors placeholder:text-warm-400" />
            <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-warm-400 hover:text-warm-600" aria-label="검색">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
            </button>
          </div>
        </div>
        {localQuery.trim() && (
          <div className={`mx-4 mb-3 px-4 py-2.5 rounded-xl ${resultCount > 0 ? 'bg-primary-100' : 'bg-accent-rose/10'}`} role="status" aria-live="polite">
            <p className={`text-sm font-medium ${resultCount > 0 ? 'text-primary-dark' : 'text-accent-rose'}`}>
              {resultCount > 0 ? `${resultCount}개의 장소를 찾았어요` : '검색 결과가 없어요. 다른 키워드로 검색해보세요.'}
            </p>
          </div>
        )}
        <div className="px-4 flex-1 overflow-y-auto">
          {localQuery.trim() && resultCount > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-3">검색 결과</p>
              <div className="flex flex-col gap-1">
                {filteredPlaces.slice(0, 5).map((place) => (
                  <button key={place.id} onClick={() => { saveRecentSearch(localQuery.trim()); setSearchOpen(false); setMapCenter({ lat: place.lat, lng: place.lng }); setZoomLevel(17); selectMarker(place.id); }} className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-warm-100/60 transition-colors text-left">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0" style={{ backgroundColor: getCategoryColor(place.category) + '20' }}>{CAT_EMOJI[place.category] ?? '📍'}</span>
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-warm-900 truncate">{place.name}</p><p className="text-xs text-warm-400 truncate">{place.address}</p></div>
                    <svg width="16" height="16" fill="none" stroke="#A3B8B8" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                ))}
                {resultCount > 5 && (<button onClick={handleSearch} className="text-center py-2.5 text-sm text-primary font-semibold hover:bg-primary/5 rounded-xl transition-colors">전체 {resultCount}개 결과 보기</button>)}
              </div>
            </div>
          )}
          {!localQuery.trim() && recentSearches.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-3">최근 검색</p>
              <div className="flex flex-col gap-0.5">
                {recentSearches.map((term) => (
                  <div key={term} className="flex items-center justify-between py-2.5 group">
                    <button onClick={() => handleQuickSearch(term)} className="flex items-center gap-3 flex-1 text-left">
                      <svg width="16" height="16" fill="none" stroke="#7A9494" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
                      <span className="text-sm text-warm-700">{term}</span>
                    </button>
                    <button onClick={() => handleRemoveRecent(term)} className="p-1.5 text-warm-300 hover:text-warm-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`${term} 삭제`}>
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.3 5.7a1 1 0 00-1.4 0L12 10.6 7.1 5.7a1 1 0 00-1.4 1.4L10.6 12l-4.9 4.9a1 1 0 001.4 1.4L12 13.4l4.9 4.9a1 1 0 001.4-1.4L13.4 12l4.9-4.9a1 1 0 000-1.4z"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!localQuery.trim() && recentViewedPlaces.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-warm-500 uppercase tracking-wider">최근 본 장소</p>
                <button onClick={() => { clearRecentPlaces(); setRecentViewedPlaces([]); }} className="text-[11px] text-warm-400 hover:text-warm-600">전체 삭제</button>
              </div>
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
                {recentViewedPlaces.slice(0, 5).map((rp) => {
                  const placeData = places.find((p) => p.id === rp.id);
                  return (
                    <button key={rp.id} onClick={() => { setSearchOpen(false); if (placeData) { setMapCenter({ lat: placeData.lat, lng: placeData.lng }); setZoomLevel(17); selectMarker(placeData.id); openDetail(placeData); } }} className="flex flex-col items-center gap-1.5 shrink-0 w-[72px] press-scale">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: getCategoryColor(rp.category as CategoryType) + '18' }}>{CAT_EMOJI[rp.category as CategoryType] ?? '📍'}</div>
                      <span className="text-[11px] text-warm-700 font-medium text-center leading-tight line-clamp-2 w-full">{rp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {!localQuery.trim() && (
            <div>
              <p className="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-3">추천 검색어</p>
              <div className="flex flex-wrap gap-2">
                {['강남 카페', '동물병원', '캠핑장', '대형견', '주차가능', '24시'].map((kw) => (
                  <button key={kw} onClick={() => handleQuickSearch(kw)} className="px-3.5 py-2 bg-warm-100 rounded-full text-sm text-warm-700 hover:bg-warm-200 border border-warm-200 transition-colors press-scale">{kw}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-warm-100 px-3 py-2.5 safe-bottom">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORY_CHIPS.map((chip) => {
              const isActive = activeCategory === chip.value;
              return (
                <button key={chip.value} onClick={() => setCategory(chip.value)} className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border shrink-0 transition-colors press-scale ${isActive ? 'bg-primary text-white border-primary' : 'border-warm-200 text-warm-600 bg-surface hover:bg-warm-100'}`}>
                  {chip.value !== 'all' && <span className="mr-1">{CAT_EMOJI[chip.value as CategoryType]}</span>}{chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setSearchOpen(true)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSearchOpen(true); } }} role="button" tabIndex={0} className="w-full bg-surface/95 backdrop-blur-sm rounded-xl shadow-card px-4 py-3 flex items-center gap-3 border border-warm-200 press-scale cursor-pointer">
      <span className={`text-[14px] flex-1 text-left ${searchQuery ? 'text-warm-800 font-medium' : 'text-warm-400'}`}>{searchQuery || '검색 · 지역 또는 장소명 입력'}</span>
      {searchQuery ? (
        <button onClick={(e) => { e.stopPropagation(); handleClearSearch(); }} className="p-1 text-warm-400 hover:text-warm-600 rounded-full" aria-label="검색 초기화" type="button">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.7 13.3a1 1 0 01-1.4 1.4L12 13.4l-3.3 3.3a1 1 0 01-1.4-1.4L10.6 12 7.3 8.7a1 1 0 011.4-1.4L12 10.6l3.3-3.3a1 1 0 011.4 1.4L13.4 12l3.3 3.3z"/></svg>
        </button>
      ) : (
        <svg width="18" height="18" fill="none" stroke="#7A9494" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
      )}
    </div>
  );
}