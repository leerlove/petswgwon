'use client';

import { useMemo, useState, useCallback } from 'react';
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

  const handleCategoryClick = useCallback((id: string) => {
    setCategory(id as CategoryType | 'all');
    setShowFilters(false);
  }, [setCategory]);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {/* 필터 바텀시트 */}
      {showFilters && (
        <div className="absolute bottom-full left-0 right-0 mb-1 mx-3 animate-slide-up">
          <div className="bg-surface rounded-2xl shadow-popup border border-warm-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-warm-900">상세 필터</h3>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-xs text-primary font-semibold hover:underline">초기화</button>
              )}
            </div>
            <div className="mb-3">
              <p className="text-[11px] font-semibold text-warm-400 mb-1.5">반려동물 크기</p>
              <div className="flex gap-1.5">
                {([
                  { value: 'all' as const, label: '무관' },
                  { value: 'small' as const, label: '소형견' },
                  { value: 'medium' as const, label: '중형견' },
                  { value: 'large' as const, label: '대형견' },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilters({ petSize: opt.value })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                      filters.petSize === opt.value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-warm-50 text-warm-500 border-warm-100 hover:bg-warm-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <p className="text-[11px] font-semibold text-warm-400 mb-1.5">이용 환경</p>
              <div className="flex gap-1.5">
                {([
                  { value: null, label: '무관' },
                  { value: true, label: '🏠 실내 가능' },
                  { value: false, label: '🌳 실외만' },
                ] as const).map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => setFilters({ indoor: opt.value })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                      filters.indoor === opt.value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-warm-50 text-warm-500 border-warm-100 hover:bg-warm-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-warm-400 mb-1.5">편의시설</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilters({ parking: filters.parking ? null : true })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                    filters.parking
                      ? 'bg-primary text-white border-primary'
                      : 'bg-warm-50 text-warm-500 border-warm-100 hover:bg-warm-100'
                  }`}
                >
                  🅿️ 주차가능
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 서브카테고리 바 — 카테고리 선택 시에만 표시 */}
      {activeCat && activeCatColor && !showFilters && (
        <div className="mx-3 mb-1 animate-slide-up">
          <div className="bg-surface/95 backdrop-blur-sm rounded-full shadow-popup border border-warm-100 px-1.5 py-1.5 flex gap-1 overflow-x-auto scrollbar-hide">
            {activeCat.subCategories.map((sub) => {
              const isActive = activeSubCategory === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSubCategory(isActive ? null : sub.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-warm-600 hover:bg-warm-100'
                  }`}
                  style={isActive ? { backgroundColor: activeCatColor } : undefined}
                  aria-pressed={isActive}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 카테고리 아이콘 그리드 — 항상 1줄 고정 */}
      <div className="bg-surface border-t border-warm-100 safe-bottom">
        <div className="grid grid-cols-7 py-1.5 px-1">
          {tabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            const count = categoryCounts[tab.id] ?? 0;
            return (
              <button
                key={tab.id}
                onClick={() => handleCategoryClick(tab.id)}
                className="flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all duration-200"
                aria-pressed={isActive}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all duration-200 ${
                    isActive ? 'scale-110 shadow-sm' : ''
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: tab.color, boxShadow: `0 2px 8px ${tab.color}40` }
                      : { backgroundColor: tab.color + '12' }
                  }
                >
                  <span className={isActive ? 'brightness-0 invert' : ''}>{tab.emoji}</span>
                </div>
                <span
                  className={`text-[10px] font-semibold leading-tight ${
                    isActive ? 'text-warm-900' : 'text-warm-400'
                  }`}
                >
                  {tab.name}
                </span>
                {count > 0 && (
                  <span
                    className="text-[9px] font-bold leading-none"
                    style={{ color: isActive ? tab.color : tab.color + '80' }}
                  >
                    {count >= 1000 ? `${(count / 1000).toFixed(0)}k` : count}
                  </span>
                )}
              </button>
            );
          })}

          {/* 필터 버튼 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all duration-200 relative"
            aria-label="상세 필터"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? 'bg-primary scale-110 shadow-sm'
                  : 'bg-warm-100'
              }`}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke={showFilters || hasActiveFilters ? 'white' : '#9CA3AF'}
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
            </div>
            <span
              className={`text-[10px] font-semibold leading-tight ${
                showFilters || hasActiveFilters ? 'text-primary' : 'text-warm-400'
              }`}
            >
              필터
            </span>
            {hasActiveFilters && (
              <span className="absolute top-1 right-1/2 translate-x-3.5 w-2 h-2 rounded-full bg-primary border-2 border-surface" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
