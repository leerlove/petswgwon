'use client';

import { useState, useRef, useCallback, useEffect, memo } from 'react';
import type { Place, CategoryType } from '@/types';

const GALLERY_PRESETS: Record<CategoryType, { gradients: string[]; icons: string[]; labels: string[] }> = {
  food_beverage: { gradients: ['from-orange-100 to-amber-50', 'from-amber-50 to-yellow-50', 'from-rose-50 to-orange-50', 'from-orange-50 to-red-50', 'from-yellow-50 to-orange-50'], icons: ['☕', '🍰', '🐕', '🪑', '🌿'], labels: ['대표 메뉴', '디저트', '반려견 공간', '내부 인테리어', '야외 테라스'] },
  medical_health: { gradients: ['from-blue-50 to-cyan-50', 'from-cyan-50 to-teal-50', 'from-blue-100 to-blue-50', 'from-teal-50 to-green-50', 'from-sky-50 to-blue-50'], icons: ['🏥', '💊', '🩺', '🐾', '🅿️'], labels: ['병원 외관', '약국 내부', '진료실', '대기실', '주차장'] },
  accommodation_travel: { gradients: ['from-green-50 to-emerald-50', 'from-emerald-50 to-teal-50', 'from-lime-50 to-green-50', 'from-teal-50 to-cyan-50', 'from-green-100 to-green-50'], icons: ['🏨', '🛏️', '🐕', '🌲', '🏊'], labels: ['숙소 외관', '객실', '반려견 공간', '주변 환경', '부대 시설'] },
  pet_service: { gradients: ['from-purple-50 to-violet-50', 'from-violet-50 to-fuchsia-50', 'from-pink-50 to-purple-50', 'from-fuchsia-50 to-pink-50', 'from-purple-100 to-purple-50'], icons: ['✂️', '🛁', '🐩', '💅', '🎀'], labels: ['매장 전경', '미용 공간', '미용 후', '스파 시설', '대기 공간'] },
  play_shopping: { gradients: ['from-yellow-50 to-amber-50', 'from-amber-50 to-orange-50', 'from-lime-50 to-yellow-50', 'from-yellow-100 to-yellow-50', 'from-orange-50 to-yellow-50'], icons: ['🏃', '🐕', '🌳', '🎾', '🛍️'], labels: ['전체 전경', '놀이 공간', '잔디밭', '운동 시설', '매장 내부'] },
  etc: { gradients: ['from-gray-50 to-slate-50', 'from-slate-50 to-gray-50', 'from-gray-100 to-gray-50', 'from-zinc-50 to-gray-50', 'from-neutral-50 to-gray-50'], icons: ['📍', '🐾', '🏪', '🌟', '📷'], labels: ['장소 전경', '반려견 공간', '매장 내부', '시설', '기타'] },
};

function ImageGallery({ place }: { place: Place }) {
  const [current, setCurrent] = useState(0);
  const touchStartRef = useRef(0);
  const touchDiffRef = useRef(0);

  // Reset gallery index when place changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setCurrent(0); }, [place.id]);

  const preset = GALLERY_PRESETS[place.category] ?? GALLERY_PRESETS.food_beverage;
  const total = 5;

  const handleTouchStart = useCallback((e: React.TouchEvent) => { touchStartRef.current = e.touches[0].clientX; touchDiffRef.current = 0; }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => { touchDiffRef.current = e.touches[0].clientX - touchStartRef.current; }, []);
  const handleTouchEnd = useCallback(() => {
    if (Math.abs(touchDiffRef.current) > 50) {
      setCurrent((prev) => {
        if (touchDiffRef.current < 0 && prev < total - 1) return prev + 1;
        if (touchDiffRef.current > 0 && prev > 0) return prev - 1;
        return prev;
      });
    }
  }, [total]);

  return (
    <div className="relative bg-warm-50">
      <div className="overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`w-full shrink-0 h-[240px] flex flex-col items-center justify-center bg-gradient-to-br ${preset.gradients[i]} relative`}>
              <span className="text-6xl mb-3 drop-shadow-sm">{preset.icons[i]}</span>
              <span className="text-sm font-medium text-warm-400">{preset.labels[i]}</span>
              <span className="text-[10px] text-warm-300 mt-1">{place.name}</span>
            </div>
          ))}
        </div>
      </div>
      {current > 0 && (
        <button onClick={() => setCurrent(current - 1)} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/30 transition-colors" aria-label="이전 이미지">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
      )}
      {current < total - 1 && (
        <button onClick={() => setCurrent(current + 1)} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/30 transition-colors" aria-label="다음 이미지">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      )}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/15 backdrop-blur-sm rounded-full px-2.5 py-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all duration-300 ${i === current ? 'bg-white w-5 h-2' : 'bg-white/50 w-2 h-2'}`} aria-label={`이미지 ${i + 1}`} />
        ))}
      </div>
      <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] text-white font-medium">{current + 1} / {total}</div>
    </div>
  );
}

export default memo(ImageGallery);
