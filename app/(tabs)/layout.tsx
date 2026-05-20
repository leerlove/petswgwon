'use client';

import OfflineBanner from '@/components/shared/OfflineBanner';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col relative overflow-hidden">
      <OfflineBanner />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
