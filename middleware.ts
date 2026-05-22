import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';
import { canAccessAdminPath, type AdminRole } from '@/lib/supabase/adminRole';

const SUBDOMAIN_ROUTES: Record<string, string> = {
  petzone: '/petzone',
  hotplace: '/hotplace',
  playground: '/playground',
};

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  // 서브도메인 라우팅: petzone/hotplace/playground.aipetdoctor.co.kr
  if (subdomain in SUBDOMAIN_ROUTES && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = SUBDOMAIN_ROUTES[subdomain];
    return NextResponse.rewrite(url);
  }

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

  // 역할 기반 페이지 접근 제한 (playground 역할은 대시보드/놀이터 외 차단)
  // 관리자 여부/세부 인가는 API 레이어 requireAdmin()이 최종 강제한다.
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single();
  const role = adminRow?.role as AdminRole | undefined;
  if (role && !canAccessAdminPath(role, request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/admin/playgrounds', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/', '/admin/:path*'],
};
