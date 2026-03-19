'use client';

import { memo } from 'react';
import { usePlaceStore } from '@/stores/placeStore';
import { useUIStore } from '@/stores/uiStore';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { getCategoryColor, CAT_EMOJI } from '@/data/categories';

function BookmarkSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const places = usePlaceStore((s) => s.places);
  const openDetail = useUIStore((s) => s.openDetail);
  const bookmarkedPlaces = places.filter((p) => p.is_bookmarked);

  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-surface flex flex-col animate-fade-in">
      <header className="flex items-center justify-between px-4 py-3 border-b border-warm-50 safe-top shrink-0">
        <button onClick={onClose} className="w-11 h-11 flex items-center justify-center text-warm-500 hover:bg-warm-50 rounded-full transition-colors -ml-2" aria-label="닫기">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <h2 className="font-bold text-[15px] text-warm-900 absolute left-1/2 -translate-x-1/2">내 찜 목록</h2>
        <span className="text-sm text-warm-300 font-medium">{bookmarkedPlaces.length}곳</span>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {bookmarkedPlaces.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {bookmarkedPlaces.map((place, idx) => (
              <button
                key={place.id}
                onClick={() => { onClose(); setTimeout(() => openDetail(place), 150); }}
                className="flex items-center gap-3 p-3.5 bg-surface rounded-2xl border border-warm-50 shadow-card text-left press-scale hover:shadow-card-hover transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: getCategoryColor(place.category) + '15' }}
                >
                  {CAT_EMOJI[place.category] ?? '📍'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-warm-900 truncate">{place.name}</h3>
                  <p className="text-xs text-warm-400 mt-0.5 truncate">{place.address}</p>
                  <div className="flex gap-1 mt-1.5">
                    {place.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">#{tag}</span>
                    ))}
                  </div>
                </div>
                <svg width="16" height="16" fill="#FF8A80" viewBox="0 0 24 24" className="shrink-0">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg width="80" height="80" viewBox="0 0 120 120" fill="none" className="mb-4 opacity-60">
              <circle cx="60" cy="60" r="50" fill="#EEF4F4"/>
              <path d="M60 85l-2.18-1.98C45.84 72.02 38 64.94 38 56.25 38 49.21 43.46 43.5 50.25 43.5c3.83 0 7.5 1.79 9.75 4.62C62.25 45.29 65.92 43.5 69.75 43.5 76.54 43.5 82 49.21 82 56.25c0 8.69-7.84 15.77-19.82 26.77L60 85z" fill="#CDDCDC"/>
            </svg>
            <p className="text-sm font-medium text-warm-500">아직 찜한 장소가 없어요</p>
            <p className="text-xs text-warm-300 mt-1">마음에 드는 장소를 하트로 저장해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(BookmarkSheet);
