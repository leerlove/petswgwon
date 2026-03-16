'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  email: string;
  onMenuToggle: () => void;
}

export default function AdminHeader({ email, onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* 모바일 햄버거 */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
        aria-label="메뉴 열기"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      {/* 사용자 정보 + 로그아웃 */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 hidden sm:block">{email}</span>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded transition-colors"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
