'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { id: 'playground', label: '반려동물 놀이터', href: '/playground' },
  { id: 'petzone', label: '펫세권', href: '/petzone' },
  { id: 'hotplace', label: '핫플레이스', href: '/hotplace' },
] as const;

export default function GNBTabBar() {
  const pathname = usePathname();

  return (
    <nav className="flex bg-surface border-b border-warm-100 relative z-30 shrink-0" role="tablist" aria-label="메인 탭">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex-1 py-3 text-[14px] font-semibold text-center transition-colors relative ${
              isActive ? 'text-warm-900' : 'text-warm-400'
            }`}
            role="tab"
            aria-selected={isActive}
          >
            {tab.label}
            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[2px] bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
