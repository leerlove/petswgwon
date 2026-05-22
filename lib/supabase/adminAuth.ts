import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { FULL_ADMIN_ROLES, type AdminRole } from '@/lib/supabase/adminRole';

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
};

/**
 * 관리자 API 인증 + 역할 인가 체크 헬퍼
 * - getUser()로 JWT를 서버에서 재검증 (가장 안전)
 * - admin_users 테이블에서 관리자 여부 확인
 * - allowRoles에 포함된 역할만 통과 (기본: 전체 관리자만 → 제한 역할은 명시적으로 opt-in해야 통과)
 *
 * 예) 놀이터 전용 라우트: requireAdmin(PLAYGROUND_ALLOWED_ROLES)
 */
export async function requireAdmin(allowRoles: AdminRole[] = FULL_ADMIN_ROLES) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, email, role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return {
      error: NextResponse.json({ error: 'Forbidden — 관리자 권한이 없습니다' }, { status: 403 }),
    };
  }

  if (!allowRoles.includes((adminUser as AdminUser).role)) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden — 이 기능에 접근할 권한이 없습니다' },
        { status: 403 }
      ),
    };
  }

  return { user: adminUser as AdminUser, supabase };
}

/**
 * 현재 로그인한 관리자의 역할을 반환 (관리자가 아니면 null).
 * 레이아웃/페이지에서 메뉴 노출·UI 분기에 사용. 요청 단위로 캐시.
 */
export const getCurrentAdminRole = cache(async (): Promise<AdminRole | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();

  return (data?.role as AdminRole | undefined) ?? null;
});
