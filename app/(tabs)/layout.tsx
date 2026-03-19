'use client';

import GNBTabBar from '@/components/shared/GNBTabBar';
import OfflineBanner from '@/components/shared/OfflineBanner';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <OfflineBanner />
      <GNBTabBar />
      <div className="sr-only" role="status" aria-live="polite">탭 전환됨</div>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
