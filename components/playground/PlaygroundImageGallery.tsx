'use client';

import { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import type { Playground } from '@/types/playground';
import { excludeSectionImages } from '@/lib/admin/sectionImages';

const PRESETS = {
  gradients: ['from-green-100 to-emerald-50', 'from-emerald-50 to-teal-50', 'from-lime-50 to-green-50', 'from-teal-50 to-cyan-50', 'from-green-50 to-yellow-50'],
  icons: ['🏃', '🐕', '🌳', '🎾', '🏞️'],
  labels: ['전체 전경', '놀이 공간', '잔디밭', '운동 시설', '주변 환경'],
};

function PlaygroundImageGallery({ playground }: { playground: Playground }) {
  const [current, setCurrent] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const touchStartRef = useRef(0);
  const touchDiffRef = useRef(0);

  // 섹션에 배치된 이미지는 상단 갤러리에서 제외 (섹션으로 "이동"된 것으로 간주)
  const images = useMemo(
    () => excludeSectionImages(playground.images, playground.sections),
    [playground.images, playground.sections]
  );
  const hasImages = images.length > 0;
  const total = hasImages ? images.length : 5;

  useEffect(() => { setCurrent(0); setFailedImages(new Set()); }, [playground.id]);

  const handleImageError = useCallback((index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  }, []);

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

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `/api/image/${url}?w=1080`;
  };

  return (
    <div className="relative bg-warm-50">
      <div className="overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>
          {hasImages ? (
            images.map((img, i) => (
              <div key={i} className="w-full shrink-0 h-[240px] relative bg-warm-100">
                {failedImages.has(i) ? (
                  <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${PRESETS.gradients[i % PRESETS.gradients.length]}`}>
                    <span className="text-6xl mb-3 drop-shadow-sm">{PRESETS.icons[i % PRESETS.icons.length]}</span>
                    <span className="text-sm font-medium text-warm-400">{PRESETS.labels[i % PRESETS.labels.length]}</span>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={getImageUrl(img)}
                    alt={`${playground.name} ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => handleImageError(i)}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                )}
              </div>
            ))
          ) : (
            Array.from({ length: total }).map((_, i) => (
              <div key={i} className={`w-full shrink-0 h-[240px] flex flex-col items-center justify-center bg-gradient-to-br ${PRESETS.gradients[i]} relative`}>
                <span className="text-6xl mb-3 drop-shadow-sm">{PRESETS.icons[i]}</span>
                <span className="text-sm font-medium text-warm-400">{PRESETS.labels[i]}</span>
                <span className="text-[10px] text-warm-300 mt-1">{playground.name}</span>
              </div>
            ))
          )}
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

export default memo(PlaygroundImageGallery);
