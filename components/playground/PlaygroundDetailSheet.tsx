'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useBackButton } from '@/hooks/useBackButton';
import { openNavigation } from '@/lib/navigation';
import MiniMap from '@/components/place/MiniMap';
import { DetailSkeleton } from '@/components/ui/Skeleton';
import { PLAYGROUND_TYPE_LABELS } from '@/types/playground';
import type { Playground } from '@/types/playground';
import PlaygroundImageGallery from './PlaygroundImageGallery';
import PlaygroundInfoSection from './PlaygroundInfoSection';
import PlaygroundPetCard from './PlaygroundPetCard';
import PlaygroundReviewSection from './PlaygroundReviewSection';
import NearbyPlaygrounds from './NearbyPlaygrounds';
import PlaygroundSections from './PlaygroundSections';

function formatRelativeDate(dateStr: string): string {
  const diffMs = new Date().getTime() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '오늘 업데이트';
  if (diffDays === 1) return '어제 업데이트';
  if (diffDays < 7) return `${diffDays}일 전 업데이트`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전 업데이트`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전 업데이트`;
  return `${Math.floor(diffDays / 365)}년 전 업데이트`;
}

function getFreshnessBadge(dateStr: string): { label: string; color: string } {
  const diffMs = new Date().getTime() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return { label: '최신', color: 'bg-green-100 text-green-700' };
  if (diffDays <= 30) return { label: '보통', color: 'bg-yellow-100 text-yellow-700' };
  return { label: '오래됨', color: 'bg-warm-100 text-warm-500' };
}

interface Props {
  playground: Playground | null;
  isOpen: boolean;
  onClose: () => void;
}

function PlaygroundDetailSheet({ playground, isOpen, onClose }: Props) {
  const [showNavSheet, setShowNavSheet] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { swipeOffset, handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture({
    threshold: 120,
    onSwipeDown: onClose,
    scrollContainerRef,
  });

  useBodyScrollLock(isOpen);
  useEscapeKey(onClose, isOpen && !showNavSheet);
  useBackButton(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setIsLoaded(false);
      setShowNavSheet(false);
      scrollContainerRef.current?.scrollTo(0, 0);
      const t = setTimeout(() => setIsLoaded(true), 300);
      return () => clearTimeout(t);
    } else {
      setIsLoaded(false);
      setShowNavSheet(false);
    }
  }, [isOpen, playground?.id]);

  useEffect(() => { return () => { if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current); }; }, []);

  if (!isOpen || !playground) return null;

  const handleShare = async () => {
    const text = `${playground.name}\n${playground.address}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: playground.name, text });
      } else {
        await navigator.clipboard.writeText(text);
        setShowCopied(true);
        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = setTimeout(() => setShowCopied(false), 2000);
      }
    } catch { /* cancelled */ }
  };

  const handleNavigation = (app: 'kakao' | 'tmap' | 'naver') => {
    openNavigation(app, { name: playground.name, lat: playground.lat, lng: playground.lng });
    setShowNavSheet(false);
  };

  const badge = getFreshnessBadge(playground.updated_at);

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
        <button onClick={onClose} className="flex items-center gap-1.5 text-warm-600 press-scale min-h-[44px] -ml-2 px-2" aria-label="뒤로가기">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          <span className="text-sm font-medium">뒤로</span>
        </button>
        <h2 className="font-bold text-[15px] text-warm-900 absolute left-1/2 -translate-x-1/2">놀이터 상세</h2>
        <div className="min-h-[44px] min-w-[44px]" />
      </header>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scroll">
        {!isLoaded ? <DetailSkeleton /> : (
          <>
            {/* 이미지 갤러리 */}
            <PlaygroundImageGallery playground={playground} />

            {/* 기본 정보 헤더 */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.color}`}>{badge.label}</span>
                <span className="text-xs text-warm-500">{formatRelativeDate(playground.updated_at)}</span>
              </div>
              <h1 className="text-xl font-bold text-warm-900 leading-tight line-clamp-2">{playground.name}</h1>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm shadow-amber-500/20">
                  {PLAYGROUND_TYPE_LABELS[playground.playground_type]}
                </span>
                {playground.is_public && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm shadow-blue-500/20">공공시설</span>
                )}
                {playground.is_unmanned ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white shadow-sm shadow-purple-500/20">무인</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500 text-white shadow-sm shadow-teal-500/20">유인</span>
                )}
                {playground.indoor_allowed ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500 text-white shadow-sm shadow-pink-500/20">실내</span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-sm shadow-green-500/20">실외</span>
                )}
                {playground.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-sm shadow-primary/20">#{tag}</span>
                ))}
              </div>
            </div>

            <div className="h-2 bg-surface-container" />

            {/* 반려견 동반 조건 */}
            <div className="px-4 py-4"><PlaygroundPetCard playground={playground} /></div>

            <div className="h-2 bg-surface-container" />

            {/* 장소 정보 (주소, 전화, 영업시간, 휴무, 인스타) */}
            <div className="px-4 py-4"><PlaygroundInfoSection playground={playground} /></div>

            {/* 섹션 (객실/부대시설 등) */}
            {playground.sections && playground.sections.length > 0 && (
              <PlaygroundSections sections={playground.sections} />
            )}

            {/* 길안내 / 전화 / 공유 버튼 */}
            <div className="px-4 pb-4 flex gap-2.5">
              <button onClick={() => setShowNavSheet(true)} className="flex-1 bg-primary text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 press-scale">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>길안내
              </button>
              {(() => {
                const sanitizedPhone = playground.phone?.replace(/[^\d+\-]/g, '') || '';
                return sanitizedPhone ? (
                  <a href={`tel:${sanitizedPhone}`} className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-colors press-scale bg-surface text-warm-700 border-warm-100 hover:bg-warm-50">
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

            <div className="h-2 bg-surface-container" />

            {/* 놀이터 위치 지도 */}
            <div className="px-4 py-4">
              <h3 className="font-bold text-[15px] text-warm-900 mb-3 flex items-center gap-2"><span className="text-lg">🗺️</span>놀이터 위치</h3>
              <MiniMap lat={playground.lat} lng={playground.lng} name={playground.name} height={180} />
            </div>

            <div className="h-2 bg-surface-container" />

            {/* 블로그 후기 */}
            <div className="px-4 py-4"><PlaygroundReviewSection playground={playground} /></div>

            <div className="h-2 bg-surface-container" />

            {/* 주변 놀이터 */}
            <div className="px-4 py-4 pb-10"><NearbyPlaygrounds currentPlayground={playground} /></div>
          </>
        )}
      </div>

      {/* 길안내 앱 선택 시트 */}
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

export default memo(PlaygroundDetailSheet);
