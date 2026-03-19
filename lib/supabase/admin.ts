import { createClient } from '@supabase/supabase-js';

/**
 * SERVICE_ROLE_KEY 클라이언트 — RLS를 우회하여 데이터를 수정
 * 대량 import 등 관리자 전용 서버 작업에만 사용한다.
 * 절대 클라이언트에 노출하지 않을 것.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  return createClient(url, key);
}
