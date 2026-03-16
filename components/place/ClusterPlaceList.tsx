'use client';

import { memo, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { usePlaceStore } from '@/stores/placeStore';
import { getCategoryColor, CAT_EMOJI, getSubCategoryName } from '@/data/categories';
import type { Place } from '@/types';

function ClusterPlaceList() {
  const clusterPlaces = useUIStore((s) => s.clusterPlaces);
  const closeClusterList = useUIStore((s) => s.closeClusterList);
  const openDetail = useUIStore((s) => s.openDetail);
  const selectMarker = usePlaceStore((s) => s.selectMarker);

  const handleSelect = useCallback((place: Place) => {
    selectMarker(place.id);
    closeClusterList();
    openDetail(place);
  }, [selectMarker, closeClusterList, openDetail]);

  if (clusterPlaces.length === 0) return null;

  return (
    <div className="absolute bottom-[60px] left-0 right-0 z-30 px-3 animate-slide-up">
      <div className="w-full bg-white rounded-2xl shadow-popup overflow-hidden border border-warm-50 max-h-[360px] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-warm-50 shrink-0">
          <p className="text-sm font-bold text-warm-900">{clusterPlaces.length}개의 장소</p>
          <button onClick={closeClusterList} className="w-7 h-7 rounded-full bg-warm-50 flex items-center justify-center text-warm-300 hover:text-warm-500 active:scale-90 transition-all" aria-label="닫기">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M18.3 5.7a1 1 0 00-1.4 0L12 10.6 7.1 5.7a1 1 0 00-1.4 1.4L10.6 12l-4.9 4.9a1 1 0 001.4 1.4L12 13.4l4.9 4.9a1 1 0 001.4-1.4L13.4 12l4.9-4.9a1 1 0 000-1.4z" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {clusterPlaces.map((place) => {
            const catColor = getCategoryColor(place.category);
            const emoji = CAT_EMOJI[place.category] ?? '📍';
            const subName = getSubCategoryName(place.sub_category);
            const cond = place.pet_conditions;
            const sizeTag = cond.large_dog ? '대형견' : cond.medium_dog ? '중형견' : cond.small_dog ? '소형견' : '';

            return (
              <button
                key={place.id}
                onClick={() => handleSelect(place)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-warm-50 active:bg-warm-100 transition-colors border-b border-warm-50 last:border-b-0"
              >
                <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-lg" style={{ backgroundColor: catColor + '14' }}>
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10.5px] font-bold tracking-tight" style={{ color: catColor }}>{subName}</p>
                  <p className="text-[13px] font-bold text-warm-900 truncate">{place.name}</p>
                  <p className="text-[11px] text-warm-400 truncate">{place.address}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {sizeTag && (
                    <span className="px-2 py-[2px] rounded-md text-[10px] font-semibold" style={{ backgroundColor: catColor + '14', color: catColor }}>{sizeTag}</span>
                  )}
                  {cond.indoor_allowed && (
                    <span className="px-2 py-[2px] rounded-md text-[10px] font-semibold bg-warm-50 text-warm-500">실내</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(ClusterPlaceList);
