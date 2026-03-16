'use client';

import { useCallback, useRef, memo } from 'react';
import { usePlaceStore } from '@/stores/placeStore';
import { useUIStore } from '@/stores/uiStore';
import { getSubCategoryName, getCategoryColor, CAT_EMOJI } from '@/data/categories';

function PlacePopup() {
  const places = usePlaceStore((s) => s.places);
  const activeMarkerId = usePlaceStore((s) => s.activeMarkerId);
  const selectMarker = usePlaceStore((s) => s.selectMarker);
  const toggleBookmarkAction = usePlaceStore((s) => s.toggleBookmark);
  const openDetail = useUIStore((s) => s.openDetail);
  const isBookmarkingRef = useRef(false);

  const popupPlace = activeMarkerId ? places.find(p => p.id === activeMarkerId) : null;

  const handleDetail = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (popupPlace) openDetail(popupPlace);
  }, [popupPlace, openDetail]);

  const handleCall = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!popupPlace?.phone) return;
    const sanitized = popupPlace.phone.replace(/[^\d+\-]/g, '');
    if (sanitized) window.location.href = `tel:${sanitized}`;
  }, [popupPlace]);

  const handleNavigation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!popupPlace) return;
    window.open(`https://map.kakao.com/link/to/${encodeURIComponent(popupPlace.name)},${popupPlace.lat},${popupPlace.lng}`, '_blank', 'noopener,noreferrer');
  }, [popupPlace]);

  const handleBookmark = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!popupPlace || isBookmarkingRef.current) return;
    isBookmarkingRef.current = true;
    try { await toggleBookmarkAction(popupPlace.id); } finally { isBookmarkingRef.current = false; }
  }, [popupPlace, toggleBookmarkAction]);

  const handleClose = useCallback((e: React.MouseEvent) => { e.stopPropagation(); selectMarker(null); }, [selectMarker]);

  if (!popupPlace) return null;

  const catColor = getCategoryColor(popupPlace.category);
  const subName = getSubCategoryName(popupPlace.sub_category);
  const cond = popupPlace.pet_conditions;
  const conditionTags: string[] = [];
  if (cond.access_method && cond.access_method !== '자유') conditionTags.push(cond.access_method);
  if (cond.indoor_allowed) conditionTags.push('실내이용');
  if (cond.large_dog) conditionTags.push('대형견가능');
  else if (cond.medium_dog) conditionTags.push('중형견까지');
  else if (cond.small_dog) conditionTags.push('소형견만');
  const sanitizedPhone = popupPlace.phone?.replace(/[^\d+\-]/g, '') ?? '';
  const hasPhone = sanitizedPhone.length > 0;
  const emoji = CAT_EMOJI[popupPlace.category] ?? '📍';

  return (
    <div className="absolute bottom-[60px] left-0 right-0 z-30 px-3 animate-slide-up" role="dialog" aria-label={`${popupPlace.name} 팝업`}>
      <div className="w-full bg-white rounded-2xl shadow-popup overflow-hidden border border-warm-50">
        <div className="h-[3px]" style={{ backgroundColor: catColor }} />
        <button onClick={handleDetail} className="w-full p-3.5 pb-2 flex gap-3 text-left active:bg-warm-50 transition-colors">
          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] font-bold tracking-tight mb-0.5" style={{ color: catColor }}>{subName}</p>
            <h3 className="font-extrabold text-[15px] text-warm-900 truncate leading-snug tracking-tight">{popupPlace.name}</h3>
            <p className="text-[11px] text-warm-400 mt-1 truncate flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-warm-300"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span className="truncate">{popupPlace.address}</span>
            </p>
            {conditionTags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {conditionTags.map((tag) => (<span key={tag} className="px-2 py-[3px] rounded-md text-[10px] font-semibold leading-none" style={{ backgroundColor: catColor + '14', color: catColor }}>{tag}</span>))}
              </div>
            )}
          </div>
          <div className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center text-[26px] relative overflow-hidden" style={{ backgroundColor: catColor + '12' }}>
            <span>{emoji}</span>
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/[0.04]" />
          </div>
        </button>
        <div className="px-3.5 pb-3.5 flex items-center gap-2">
          {hasPhone && (<button onClick={handleCall} className="w-[44px] h-[44px] rounded-full bg-warm-50 flex items-center justify-center hover:bg-warm-100 active:scale-90 transition-all" aria-label="전화"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-warm-500"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg></button>)}
          <button onClick={handleNavigation} className="w-[44px] h-[44px] rounded-full bg-warm-50 flex items-center justify-center hover:bg-warm-100 active:scale-90 transition-all" aria-label="길찾기"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-warm-500"><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg></button>
          <button onClick={handleBookmark} className="w-[44px] h-[44px] rounded-full flex items-center justify-center active:scale-90 transition-all" style={{ backgroundColor: popupPlace.is_bookmarked ? catColor + '18' : '#EEF4F4' }} aria-label={popupPlace.is_bookmarked ? '찜 해제' : '찜하기'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={popupPlace.is_bookmarked ? catColor : 'none'} stroke={popupPlace.is_bookmarked ? catColor : '#9ca3af'} strokeWidth="2" className={popupPlace.is_bookmarked ? 'animate-bounce-in' : ''}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
          </button>
          <button onClick={handleDetail} className="flex-1 h-[44px] rounded-xl flex items-center justify-center gap-1 text-white text-[13px] font-bold tracking-tight active:scale-[0.97] transition-all" style={{ backgroundColor: catColor, boxShadow: `0 2px 10px ${catColor}30` }}>
            상세보기<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>
      <button onClick={handleClose} className="absolute top-3 right-5 w-7 h-7 bg-white rounded-full shadow-sm border border-warm-100 flex items-center justify-center text-warm-300 hover:text-warm-500 active:scale-90 transition-all" aria-label="닫기">
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M18.3 5.7a1 1 0 00-1.4 0L12 10.6 7.1 5.7a1 1 0 00-1.4 1.4L10.6 12l-4.9 4.9a1 1 0 001.4 1.4L12 13.4l4.9 4.9a1 1 0 001.4-1.4L13.4 12l4.9-4.9a1 1 0 000-1.4z" /></svg>
      </button>
    </div>
  );
}

export default memo(PlacePopup);
