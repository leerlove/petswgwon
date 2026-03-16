'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU_ITEMS = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/places', label: '장소 관리', icon: '📍' },
  { href: '/admin/magazine', label: '매거진 관리', icon: '📖' },
  { href: '/admin/reviews', label: '리뷰 관리', icon: '💬' },
  { href: '/admin/quality', label: '데이터 품질', icon: '🔍' },
  { href: '/admin/stats', label: '통계', icon: '📈' },
  { href: '/admin/data', label: '데이터 관리', icon: '📦' },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const sidebar = (
    <nav className="flex flex-col h-full bg-gray-900 text-white w-64">
      {/* 로고 */}
      <div className="px-5 py-4 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2" onClick={onClose}>
          <span className="text-xl">🐾</span>
          <span className="font-bold text-lg">펫세권 관리자</span>
        </Link>
      </div>

      {/* 메뉴 */}
      <div className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(item.href)
                ? 'bg-amber-600 text-white font-medium'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* 하단 */}
      <div className="px-5 py-4 border-t border-gray-800">
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← 사이트로 돌아가기
        </Link>
      </div>
    </nav>
  );

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside className="hidden lg:flex h-screen sticky top-0">
        {sidebar}
      </aside>

      {/* 모바일 사이드바 (오버레이) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative h-full w-64">
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}
