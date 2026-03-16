import { createClient } from '@/lib/supabase/server';
import AdminShell from '@/components/admin/layout/AdminShell';

export const metadata = {
  title: '관리자 — 펫세권',
};

/**
 * admin 레이아웃
 * 루트 레이아웃의 max-w-[430px] 모바일 컨테이너를 해제하기 위해
 * 부모 #main-content 에 admin-layout 클래스를 주입한다.
 * globals.css 에서 이 클래스를 통해 max-width/shadow 등을 리셋함.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 로그인 페이지는 AdminShell 없이 렌더링
  if (!user) {
    return (
      <div className="admin-layout-wrapper">
        {children}
      </div>
    );
  }

  return (
    <div className="admin-layout-wrapper">
      <AdminShell email={user.email ?? ''}>
        {children}
      </AdminShell>
    </div>
  );
}
