'use client';

import { useState, useRef, useCallback, useEffect, memo } from 'react';
import type { Place, CategoryType } from '@/types';

const GALLERY_PRESETS: Record<CategoryType, { gradient: string; icon: string; label: string }> = {
  food_beverage: { gradient: 'from-orange-100 to-amber-50', icon: '🍽️', label: '식음료' },
  medical_health: { gradient: 'from-blue-50 to-cyan-50', icon: '🏥', label: '의료/건강' },
  accommodation_travel: { gradient: 'from-green-50 to-emerald-50', icon: '🏨', label: '숙박/여행' },
  pet_service: { gradient: 'from-purple-50 to-violet-50', icon: '🐾', label: '반려동물서비스' },
  play_shopping: { gradient: 'from-yellow-50 to-amber-50', icon: '🛍️', label: '놀이/쇼핑' },
  etc: { gradient: 'from-gray-50 to-slate-50', icon: '📍', label: '기타' },
};

function ImageGallery({ place }: { place: Place }) {
  const [current, setCurrent] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});
  const touchStartRef = useRef(0);
  const touchDiffRef = useRef(0);

  // 실제 이미지 목록: thumbnail + images 배열에서 유효한 URL만 추출
  const realImages = [place.thumbnail, ...(place.images || [])]
    .filter((url): url is string => !!url && url.trim().length > 0);
  const hasRealImages = realImages.length > 0;
  const total = hasRealImages ? realImages.length : 1;

  // Reset gallery index when place changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setCurrent(0); setImgError({}); }, [place.id]);

  const preset = GALLERY_PRESETS[place.category] ?? GALLERY_PRESETS.etc;

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

  // 플레이스홀더 슬라이드 (이미지 없을 때 또는 이미지 로드 실패 시)
  const renderPlaceholder = () => (
    <div className={`w-full shrink-0 h-[240px] flex flex-col items-center justify-center bg-gradient-to-br ${preset.gradient} relative`}>
      <span className="text-6xl mb-3 drop-shadow-sm">{preset.icon}</span>
      <span className="text-sm font-medium text-warm-400">{place.name}</span>
      <span className="text-[10px] text-warm-300 mt-1">{preset.label}</span>
    </div>
  );

  return (
    <div className="relative bg-warm-50">
      <div className="overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>
          {hasRealImages ? (
            realImages.map((url, i) => (
              <div key={i} className="w-full shrink-0 h-[240px] relative bg-warm-100">
                {imgError[i] ? renderPlaceholder() : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={`${place.name} 이미지 ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    onError={() => setImgError((prev) => ({ ...prev, [i]: true }))}
                  />
                )}
              </div>
            ))
          ) : (
            renderPlaceholder()
          )}
        </div>
      </div>
      {total > 1 && current > 0 && (
        <button onClick={() => setCurrent(current - 1)} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/30 transition-colors" aria-label="이전 이미지">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
      )}
      {total > 1 && current < total - 1 && (
        <button onClick={() => setCurrent(current + 1)} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/30 transition-colors" aria-label="다음 이미지">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      )}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/15 backdrop-blur-sm rounded-full px-2.5 py-1.5">
          {realImages.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all duration-300 ${i === current ? 'bg-white w-5 h-2' : 'bg-white/50 w-2 h-2'}`} aria-label={`이미지 ${i + 1}`} />
          ))}
        </div>
      )}
      {total > 1 && (
        <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] text-white font-medium">{current + 1} / {total}</div>
      )}
    </div>
  );
}

export default memo(ImageGallery);
