'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import OfflineBanner from '@/components/shared/OfflineBanner';

const TABS = [
  { href: '/m/petzone', label: '펫플레이스 지도' },
  { href: '/m/hotplace', label: '핫플레이스' },
  { href: '/m/playground', label: '놀이터' },
] as const;

const APP_PRIMARY = '#22C5CE';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-dvh flex flex-col relative overflow-hidden">
      <OfflineBanner />
      {/* Bookmark tab bar — app-only */}
      <nav
        className="flex shrink-0 border-b"
        style={{ borderColor: `${APP_PRIMARY}30`, backgroundColor: '#fff' }}
      >
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 text-center py-3 text-sm font-semibold relative transition-colors"
              style={{ color: active ? APP_PRIMARY : '#9CA3AF' }}
            >
              {tab.label}
              {active && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-full"
                  style={{ backgroundColor: APP_PRIMARY, width: '40%' }}
                />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
