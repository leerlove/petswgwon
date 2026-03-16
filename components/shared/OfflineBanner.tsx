'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return !navigator.onLine;
}

function getServerSnapshot() {
  return false;
}

export default function OfflineBanner() {
  const isOffline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none animate-slide-down">
      <div className="mx-auto max-w-[430px] w-full px-3 pt-2 pointer-events-auto">
        <div className="bg-warm-900/95 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-float safe-top">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 text-accent-rose">
            <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/>
          </svg>
          <p className="text-[13px] font-medium flex-1">네트워크 연결이 끊겼습니다</p>
        </div>
      </div>
    </div>
  );
}
