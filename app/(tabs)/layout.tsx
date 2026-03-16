'use client';

import { useState } from 'react';
import GNBTabBar from '@/components/shared/GNBTabBar';
import OfflineBanner from '@/components/shared/OfflineBanner';
import BookmarkSheet from '@/components/shared/BookmarkSheet';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const [showBookmarks, setShowBookmarks] = useState(false);

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <OfflineBanner />
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-warm-100 safe-top relative z-30 shrink-0">
        <div className="w-8" />
        <h1 className="font-bold text-[17px] text-warm-900 absolute left-1/2 -translate-x-1/2">펫세권</h1>
        <button
          onClick={() => setShowBookmarks(true)}
          className="w-8 h-8 flex items-center justify-center text-warm-600 hover:bg-warm-100 rounded-full transition-colors"
          aria-label="찜 목록"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      </header>
      <GNBTabBar />
      <div className="sr-only" role="status" aria-live="polite">탭 전환됨</div>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </div>
      <BookmarkSheet isOpen={showBookmarks} onClose={() => setShowBookmarks(false)} />
    </div>
  );
}
