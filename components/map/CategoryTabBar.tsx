'use client';

import { useMemo, useState } from 'react';
import { usePlaceStore } from '@/stores/placeStore';
import { useFilterStore } from '@/stores/filterStore';
import { categories, getCategoryColor, CAT_EMOJI } from '@/data/categories';
import type { CategoryType } from '@/types';

export default function CategoryTabBar() {
  const activeCategory = useFilterStore((s) => s.activeCategory);
  const activeSubCategory = useFilterStore((s) => s.activeSubCategory);
  const setCategory = useFilterStore((s) => s.setCategory);
  const setSubCategory = useFilterStore((s) => s.setSubCategory);
  const filters = useFilterStore((s) => s.filters);
  const setFilters = useFilterStore((s) => s.setFilters);
  const resetFilters = useFilterStore((s) => s.resetFilters);
  const places = usePlaceStore((s) => s.places);

  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = filters.petSize !== 'all' || filters.indoor !== null || filters.parking !== null;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: places.length };
    categories.forEach((c) => { counts[c.id] = places.filter((p) => p.category === c.id).length; });
    return counts;
  }, [places]);

  const tabs = [
    { id: 'all' as const, name: '전체', color: '#1f2937', emoji: '🗺️' },
    ...categories.map((c) => ({ id: c.id, name: c.name, color: getCategoryColor(c.id), emoji: CAT_EMOJI[c.id] ?? '📍' })),
  ];

  const activeCat = categories.find((c) => c.id === activeCategory);
  const activeCatColor = activeCategory !== 'all' ? getCategoryColor(activeCategory as CategoryType) : undefined;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {showFilters && (
        <div className="mx-3 mb-2 animate-slide-up">
          <div className="bg-surface rounded-2xl shadow-popup border border-warm-50 p-3.5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-warm-900">상세 필터</h3>
              {hasActiveFilters && (<button onClick={resetFilters} className="text-xs text-primary font-semibold hover:underline">초기화</button>)}
            </div>
            <div className="mb-3">
              <p className="text-[11px] font-semibold text-warm-400 mb-1.5">반려동물 크기</p>
              <div className="flex gap-1.5">
                {([{ value: 'all' as const, label: '무관' }, { value: 'small' as const, label: '소형견' }, { value: 'medium' as const, label: '중형견' }, { value: 'large' as const, label: '대형견' }]).map((opt) => (
                  <button key={opt.value} onClick={() => setFilters({ petSize: opt.value })} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${filters.petSize === opt.value ? 'bg-primary text-white border-primary' : 'bg-warm-50 text-warm-500 border-warm-100 hover:bg-warm-100'}`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <p className="text-[11px] font-semibold text-warm-400 mb-1.5">이용 환경</p>
              <div className="flex gap-1.5">
                {([{ value: null, label: '무관' }, { value: true, label: '🏠 실내 가능' }, { value: false, label: '🌳 실외만' }] as const).map((opt) => (
                  <button key={String(opt.value)} onClick={() => setFilters({ indoor: opt.value })} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${filters.indoor === opt.value ? 'bg-primary text-white border-primary' : 'bg-warm-50 text-warm-500 border-warm-100 hover:bg-warm-100'}`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-warm-400 mb-1.5">편의시설</p>
              <div className="flex gap-1.5">
                <button onClick={() => setFilters({ parking: filters.parking ? null : true })} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${filters.parking ? 'bg-primary text-white border-primary' : 'bg-warm-50 text-warm-500 border-warm-100 hover:bg-warm-100'}`}>🅿️ 주차가능</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeCat && activeCatColor && !showFilters && (
        <div className="mx-3 mb-2 animate-slide-up">
          <div className="bg-surface rounded-2xl shadow-popup border border-warm-50 p-3" style={{ borderTop: `3px solid ${activeCatColor}` }}>
            <div className="flex flex-wrap gap-2">
              {activeCat.subCategories.map((sub) => {
                const isActive = activeSubCategory === sub.id;
                return (
                  <button key={sub.id} onClick={() => setSubCategory(isActive ? null : sub.id)} className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 press-scale ${isActive ? 'text-white shadow-sm' : 'bg-warm-50 text-warm-700 hover:bg-warm-100 border border-warm-200'}`} style={isActive ? { backgroundColor: activeCatColor } : undefined} aria-pressed={isActive}>{sub.name}</button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="bg-surface border-t border-warm-50 px-3 py-2.5 safe-bottom">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1 px-3 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all duration-200 press-scale border ${showFilters || hasActiveFilters ? 'bg-primary text-white border-primary' : 'bg-surface text-warm-500 border-warm-100 hover:bg-warm-50'}`} aria-label="필터">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </button>
          {tabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button key={tab.id} onClick={() => setCategory(tab.id as CategoryType | 'all')} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0 press-scale border ${isActive ? 'text-white shadow-sm' : 'bg-surface text-warm-500 hover:bg-warm-50'}`} style={isActive ? { backgroundColor: tab.color, borderColor: tab.color } : { borderColor: tab.color + '40' }} aria-pressed={isActive}>
                <span className="text-sm">{tab.emoji}</span><span>{tab.name}</span>
                {categoryCounts[tab.id] > 0 && (<span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center leading-none" style={isActive ? { backgroundColor: 'rgba(255,255,255,0.3)', color: 'white' } : { backgroundColor: tab.color + '18', color: tab.color }}>{categoryCounts[tab.id] >= 1000 ? `${(categoryCounts[tab.id] / 1000).toFixed(0)}k` : categoryCounts[tab.id]}</span>)}
                {!isActive && !categoryCounts[tab.id] && (<span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tab.color }} />)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}