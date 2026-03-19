'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { usePlaceStore } from '@/stores/placeStore';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useBackButton } from '@/hooks/useBackButton';
import { sharePlace } from '@/lib/share';
import { openNavigation } from '@/lib/navigation';
import ImageGallery from './ImageGallery';
import PetConditionCard from './PetConditionCard';
import BlogReviewSection from './BlogReviewSection';
import PlaceInfoSection from './PlaceInfoSection';
import NearbyPlaces from './NearbyPlaces';
import { DetailSkeleton } from '@/components/ui/Skeleton';

function PlaceDetailSheet() {
  const detailPlace = useUIStore((s) => s.detailPlace);
  const isDetailOpen = useUIStore((s) => s.isDetailOpen);
  const closeDetail = useUIStore((s) => s.closeDetail);
  const toggleBookmarkAction = usePlaceStore((s) => s.toggleBookmark);
  const [showNavSheet, setShowNavSheet] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isBookmarkingRef = useRef(false);

  const { swipeOffset, handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture({
    threshold: 120,
    onSwipeDown: closeDetail,
    scrollContainerRef,
  });

  useBodyScrollLock(isDetailOpen);
  useEscapeKey(closeDetail, isDetailOpen && !showNavSheet);
  useBackButton(isDetailOpen, closeDetail);

  const handleToggleBookmark = useCallback(async () => {
    if (!detailPlace || isBookmarkingRef.current) return;
    isBookmarkingRef.current = true;
    try { await toggleBookmarkAction(detailPlace.id); } finally { isBookmarkingRef.current = false; }
  }, [detailPlace, toggleBookmarkAction]);

  useEffect(() => {
    if (isDetailOpen) {
      setIsLoaded(false);
      setShowNavSheet(false);
      scrollContainerRef.current?.scrollTo(0, 0);
      const t = setTimeout(() => setIsLoaded(true), 300);
      return () => clearTimeout(t);
    } else {
      setIsLoaded(false);
      setShowNavSheet(false);
    }
  }, [isDetailOpen, detailPlace?.id]);

  useEffect(() => { return () => { if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current); }; }, []);

  if (!isDetailOpen || !detailPlace) return null;

  const handleShare = async () => {
    const result = await sharePlace(detailPlace);
    if (result === 'copied') {
      setShowCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleNavigation = (app: 'kakao' | 'tmap' | 'naver') => {
    openNavigation(app, detailPlace);
    setShowNavSheet(false);
  };

  // Get the latest bookmark state from the store
  const currentPlace = usePlaceStore.getState().places.find(p => p.id === detailPlace.id);
  const isBookmarked = currentPlace?.is_bookmarked ?? detailPlace.is_bookmarked;

  return (
    <div
      className="absolute inset-0 z-40 bg-surface flex flex-col animate-slide-up"
      style={{
        transform: swipeOffset > 0 ? `translateY(${swipeOffset}px)` : undefined,
        transition: swipeOffset > 0 ? 'none' : 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
        opacity: swipeOffset > 0 ? Math.max(0.3, 1 - swipeOffset / 400) : undefined,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-center pt-2 pb-0"><div className="w-10 h-1 bg-warm-200 rounded-full" /></div>
      <header className="flex items-center justify-between px-4 py-2 border-b border-warm-50 bg-surface/95 backdrop-blur-sm sticky top-0 z-10 safe-top">
        <button onClick={closeDetail} className="flex items-center gap-1.5 text-warm-600 press-scale min-h-[44px] -ml-2 px-2" aria-label="뒤로가기">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          <span className="text-sm font-medium">뒤로</span>
        </button>
        <h2 className="font-bold text-[15px] text-warm-900 absolute left-1/2 -translate-x-1/2">매장상세</h2>
        <button onClick={handleToggleBookmark} className="min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 rounded-full hover:bg-warm-50 transition-colors press-scale" aria-label={isBookmarked ? '찜 취소' : '찜하기'}>
          {isBookmarked ? (
            <svg width="24" height="24" fill="#FF8A80" viewBox="0 0 24 24" className="animate-bounce-in"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="#A3B8B8" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          )}
        </button>
      </header>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scroll">
        {!isLoaded ? <DetailSkeleton /> : (
          <>
            <ImageGallery place={detailPlace} />
            <div className="px-4 pt-4 pb-3">
              <h1 className="text-xl font-bold text-warm-900 leading-tight line-clamp-2">{detailPlace.name}</h1>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {detailPlace.tags.map((tag) => (<span key={tag} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-sm shadow-primary/20">#{tag}</span>))}
              </div>
            </div>
            <div className="h-2 bg-surface-container" />
            <div className="px-4 py-4"><PetConditionCard place={detailPlace} /></div>
            <div className="h-2 bg-surface-container" />
            <div className="px-4 py-4"><BlogReviewSection place={detailPlace} /></div>
            <div className="h-2 bg-surface-container" />
            <div className="px-4 py-4"><PlaceInfoSection place={detailPlace} /></div>
            <div className="px-4 pb-4 flex gap-2.5">
              <button onClick={() => setShowNavSheet(true)} className="flex-1 bg-primary text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 press-scale">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>길안내
              </button>
              {(() => {
                const sanitizedPhone = detailPlace.phone?.replace(/[^\d+\-]/g, '') || '';
                return sanitizedPhone ? (
                  <a href={`tel:${sanitizedPhone}`} className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-colors press-scale bg-surface text-warm-700 border-warm-100 hover:bg-warm-50" aria-label="전화하기">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>전화
                  </a>
                ) : (
                  <div className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border bg-warm-50 text-warm-300 border-warm-100">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>전화
                  </div>
                );
              })()}
              <button onClick={handleShare} className="w-[52px] py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center border border-warm-100 bg-surface text-warm-700 hover:bg-warm-50 transition-colors press-scale relative" aria-label="공유하기">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
                {showCopied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-warm-900/90 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap animate-fade-in">복사됨!</span>}
              </button>
            </div>
            {detailPlace.pet_etiquette.length > 0 && (
              <><div className="h-2 bg-surface-container" /><div className="px-4 py-4">
                <h3 className="font-bold text-[15px] text-warm-900 mb-3 flex items-center gap-2"><span className="text-lg">🐕</span>펫티켓 안내</h3>
                <div className="bg-gradient-to-br from-warm-50 to-primary-50 rounded-2xl p-4 border border-warm-100">
                  {detailPlace.pet_etiquette.map((rule, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-dark shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-[13px] text-warm-600 leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div></>
            )}
            <div className="h-2 bg-surface-container" />
            <div className="px-4 py-4">
              <h3 className="font-bold text-[15px] text-warm-900 mb-3 flex items-center gap-2"><span className="text-lg">🗺️</span>매장 위치</h3>
              <a href={`https://map.kakao.com/link/map/${encodeURIComponent(detailPlace.name)},${detailPlace.lat},${detailPlace.lng}`} target="_blank" rel="noopener noreferrer" className="block w-full h-[180px] bg-warm-50 rounded-2xl overflow-hidden relative border border-warm-100 hover:border-warm-200 transition-colors group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center"><span className="text-4xl drop-shadow-md">📍</span><p className="text-xs font-medium text-warm-600 mt-1.5">{detailPlace.name}</p><p className="text-[10px] text-primary font-semibold mt-1 group-hover:underline">카카오맵에서 보기 →</p></div>
                </div>
              </a>
            </div>
            <div className="px-4 pb-3 flex items-center justify-between">
              <p className="text-[11px] text-warm-400">정보 갱신일 {detailPlace.updated_at}</p>
              <button className="text-[11px] text-warm-400 underline hover:text-warm-600 transition-colors min-h-[44px] flex items-center">정보 수정 요청</button>
            </div>
            {detailPlace.caution && (
              <><div className="h-2 bg-surface-container" /><div className="px-4 py-4">
                <h3 className="font-bold text-[15px] text-warm-900 mb-3 flex items-center gap-2"><span className="text-lg">⚠️</span>이용 시 주의사항</h3>
                <div className="bg-accent-rose/10 rounded-2xl p-4 border border-accent-rose/20"><p className="text-[13px] text-accent-rose leading-relaxed">{detailPlace.caution}</p></div>
              </div></>
            )}
            <div className="h-2 bg-surface-container" />
            <div className="px-4 py-4 pb-10"><NearbyPlaces currentPlace={detailPlace} /></div>
          </>
        )}
      </div>

      {showNavSheet && (
        <div className="absolute inset-0 z-50 flex items-end" onClick={() => setShowNavSheet(false)} role="dialog" aria-label="길안내 앱 선택" tabIndex={-1}>
          <div className="absolute inset-0 bg-warm-900/40 animate-fade-in" />
          <div className="relative w-full max-w-[430px] mx-auto bg-surface rounded-t-3xl p-5 pb-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-warm-200 rounded-full mx-auto mb-5" />
            <h3 className="font-bold text-base text-center text-warm-900 mb-5">길안내 앱 선택</h3>
            <div className="flex gap-3 justify-center mb-5">
              <button onClick={() => handleNavigation('kakao')} className="flex flex-col items-center gap-2.5 w-[88px] py-5 rounded-2xl bg-[#FEE500]/15 hover:bg-[#FEE500]/25 border-2 border-[#FEE500]/30 transition-colors press-scale"><div className="w-12 h-12 rounded-full bg-[#FEE500] flex items-center justify-center text-xl shadow-sm">🗺️</div><span className="text-sm font-semibold text-warm-700">카카오맵</span></button>
              <button onClick={() => handleNavigation('tmap')} className="flex flex-col items-center gap-2.5 w-[88px] py-5 rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-100 transition-colors press-scale"><div className="w-12 h-12 rounded-full bg-[#0064FF] flex items-center justify-center text-xl text-white shadow-sm">🚗</div><span className="text-sm font-semibold text-warm-700">T맵</span></button>
              <button onClick={() => handleNavigation('naver')} className="flex flex-col items-center gap-2.5 w-[88px] py-5 rounded-2xl bg-[#2DB400]/10 hover:bg-[#2DB400]/20 border-2 border-[#2DB400]/20 transition-colors press-scale"><div className="w-12 h-12 rounded-full bg-[#2DB400] flex items-center justify-center text-xl text-white shadow-sm">🧭</div><span className="text-sm font-semibold text-warm-700">네이버</span></button>
            </div>
            <button onClick={() => setShowNavSheet(false)} className="w-full py-3.5 rounded-2xl bg-warm-50 text-warm-500 font-semibold hover:bg-warm-100 transition-colors press-scale">취소</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(PlaceDetailSheet);
