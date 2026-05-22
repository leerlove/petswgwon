/**
 * 관리자 역할(role) 정의와 접근 권한 판정 (순수 로직 — 서버/클라이언트/미들웨어 공용).
 *
 * - 'super_admin' / 'admin' : 전체 관리자 (모든 메뉴/ API)
 * - 'playground'            : 놀이터 업체 관리 전용 (PetPass 측 관리자).
 *                             대시보드 열람 + 놀이터 관리만 가능, 그 외는 차단.
 */
export type AdminRole = 'admin' | 'super_admin' | 'playground';

/** 전체 권한 역할 — requireAdmin 기본 허용 집합 */
export const FULL_ADMIN_ROLES: AdminRole[] = ['admin', 'super_admin'];

/** 놀이터 관련 API/페이지에 접근 가능한 역할 집합 */
export const PLAYGROUND_ALLOWED_ROLES: AdminRole[] = ['admin', 'super_admin', 'playground'];

/** playground 역할이 접근 가능한 admin 경로 prefix */
const PLAYGROUND_PATH_PREFIXES = ['/admin/playgrounds'];
/** playground 역할이 접근 가능한 정확 경로(하위 없음) */
const PLAYGROUND_EXACT_PATHS = ['/admin'];

/**
 * 주어진 역할이 해당 admin 경로에 접근 가능한지 판정.
 * - 전체 관리자(admin/super_admin)는 모든 /admin 경로 허용
 * - playground는 대시보드(/admin)와 /admin/playgrounds* 만 허용
 * 메뉴 노출 필터링과 미들웨어 페이지 가드에 공용으로 사용.
 */
export function canAccessAdminPath(role: AdminRole, pathname: string): boolean {
  if (role === 'admin' || role === 'super_admin') return true;
  if (role === 'playground') {
    if (PLAYGROUND_EXACT_PATHS.includes(pathname)) return true;
    return PLAYGROUND_PATH_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
  }
  return false;
}
