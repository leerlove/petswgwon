import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export type AdminUser = {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
};

/**
 * 관리자 API 인증 체크 헬퍼
 * - getUser()로 JWT를 서버에서 재검증 (가장 안전)
 * - admin_users 테이블에서 관리자 권한 확인
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, email, role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden — 관리자 권한이 없습니다' },
        { status: 403 }
      ),
    };
  }

  return { user: adminUser as AdminUser, supabase };
}
