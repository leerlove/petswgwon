import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // getUser()로 JWT를 서버에서 재검증
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  // 관리자 경로가 아니면 통과
  if (!isAdminRoute) return response;

  // 로그인 페이지 — 미인증 상태에서만 접근 가능
  if (isLoginPage) {
    if (user) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return response;
  }

  // 미인증 → 로그인 페이지로 리다이렉트
  if (!user) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 관리자 권한은 미들웨어에서 DB 조회하지 않음 (성능)
  // → API 레이어의 requireAdmin()에서 체크
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
