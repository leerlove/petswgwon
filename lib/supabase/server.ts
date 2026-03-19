import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 서버 사이드(API Routes, Server Components)용 Supabase 클라이언트
 * @supabase/ssr 기반 — 쿠키를 통해 세션을 관리한다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // Server Component에서 호출 시 무시 가능
            // (미들웨어에서 세션 갱신을 처리하므로)
          }
        },
      },
    }
  );
}

/**
 * 하위 호환 — 기존 API Route에서 createServerClient() 호출부 대응
 * @deprecated createClient()를 대신 사용하세요
 */
export async function createServerClient_compat() {
  return createClient();
}
