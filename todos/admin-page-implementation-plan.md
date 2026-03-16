# 관리자 페이지 상세 구현 계획

## 개요

펫세권 서비스의 데이터를 관리하기 위한 `/admin` 관리자 페이지.
Supabase Auth 기반 로그인, 대시보드, 장소 CRUD, 데이터 품질 모니터링, 리뷰 관리, 통계, JSON/엑셀 다운로드·업로드 기능을 포함한다.

---

## 현재 프로젝트 현황

### 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.1.6 (App Router) |
| 언어 | TypeScript 5 |
| DB | Supabase (PostgreSQL) |
| 인증 | Supabase Auth (Email/Password) |
| 스타일링 | Tailwind CSS 4 |
| 상태관리 | Zustand |
| 패키지매니저 | pnpm |

### DB 스키마 (Supabase)
**places** (12,608건)
```
id             uuid PK (auto)
name           text NOT NULL 
category       category_type ENUM
sub_category   sub_category_type ENUM
address        text
address_jibun  text
phone          text
lat            double precision
lng            double precision
thumbnail      text
images         jsonb (string[])
tags           jsonb (string[])
business_hours jsonb ({hours, closedDays})
access_method  text
small_dog      boolean
medium_dog     boolean
large_dog      boolean
indoor_allowed boolean
pet_etiquette  jsonb (string[])
caution        text
created_at     timestamptz
updated_at     timestamptz (auto trigger)
```

**blog_reviews** (0건)
```
id, place_id(FK), summary, content, source, source_url, author, date, created_at
```

**bookmarks** (0건)
```
id, place_id(FK), user_id, created_at / UNIQUE(place_id, user_id)
```

**admin_users** (신규 — Supabase Auth 연동)
```
id             uuid PK (auth.users.id 참조)
email          text NOT NULL UNIQUE
role           text NOT NULL DEFAULT 'admin' ('admin' | 'super_admin')
created_at     timestamptz
```
> Supabase Auth의 `auth.users` 테이블을 인증에 사용하고, `public.admin_users` 테이블로 관리자 권한을 관리한다.
> 회원가입은 UI에서 제공하지 않으며, Supabase Dashboard 또는 SQL로 직접 등록한다.

### ENUM 값

- **category_type**: food_beverage, medical_health, accommodation_travel, pet_service, play_shopping
- **sub_category_type**: restaurant, bar, cafe, vet, pharmacy, accommodation, travel, camping, funeral, grooming, hotel_care, supplies, playground

### 기존 프론트엔드 타입 (Place)

DB flat 필드 → 프론트에서는 `pet_conditions` 객체로 묶어 사용 (`transformPlace` 함수).
관리자 페이지에서는 **DB 필드 구조를 그대로 사용**하여 변환 없이 직접 조회/수정한다.

### 기존 API 라우트

| 경로 | 메서드 | 설명 |
|------|--------|------|
| `/api/places` | GET | 장소 목록 (필터, 페이지네이션) |
| `/api/places/[id]` | GET | 장소 상세 + 리뷰 + 근처장소 |
| `/api/places/search` | GET | 이름/주소 검색 |
| `/api/places/[id]/reviews` | GET, POST | 리뷰 조회/생성 |
| `/api/bookmarks` | POST | 북마크 토글 |
| `/api/magazine` | GET | 매거진 테마별 장소 |

### 현재 데이터 품질 현황

| 항목 | 상태 |
|------|------|
| 이미지/썸네일 | **12,608건 전부 없음 (100%)** |
| 펫 에티켓 | 11,761건 없음 (93%) |
| 영업시간 | 2,006건 없음 (16%) |
| 전화번호 | 1,496건 없음 (12%) |
| 입장방식 | 76건 없음 (<1%) |

---

## 파일 구조 계획

```
app/
  admin/
    login/
      page.tsx                    # 로그인 페이지
    layout.tsx                    # 관리자 레이아웃 (인증 체크 + 사이드바 + 헤더)
    page.tsx                      # 대시보드
    places/
      page.tsx                    # 장소 목록
      [id]/
        page.tsx                  # 장소 수정
      new/
        page.tsx                  # 장소 신규 등록
    reviews/
      page.tsx                    # 리뷰 관리
    quality/
      page.tsx                    # 데이터 품질 모니터링
    stats/
      page.tsx                    # 통계
    data/
      page.tsx                    # 데이터 다운로드/업로드
  api/
    admin/
      places/
        route.ts                  # 관리자용 장소 CRUD
        [id]/
          route.ts                # 개별 장소 수정/삭제
      places/export/
        route.ts                  # JSON/엑셀 다운로드
      places/import/
        route.ts                  # JSON/엑셀 업로드
      reviews/
        route.ts                  # 리뷰 관리 API
      stats/
        route.ts                  # 통계 데이터 API
      quality/
        route.ts                  # 품질 현황 API
    auth/
      login/
        route.ts                  # 로그인 처리
      logout/
        route.ts                  # 로그아웃 처리
      me/
        route.ts                  # 현재 로그인 사용자 정보
  auth/
    callback/
      route.ts                    # Supabase Auth 콜백 (OAuth용, 향후 확장)

middleware.ts                       # 루트 미들웨어 — /admin/** 경로 인증 체크

components/
  admin/
    layout/
      AdminSidebar.tsx            # 사이드바 네비게이션
      AdminHeader.tsx             # 상단 헤더 (사용자 정보, 로그아웃)
    auth/
      LoginForm.tsx               # 이메일/비밀번호 로그인 폼
    dashboard/
      StatCard.tsx                # 요약 카드 (숫자 + 아이콘)
      QualityAlert.tsx            # 데이터 품질 경고 카드
      RecentActivity.tsx          # 최근 활동 목록
    places/
      PlaceTable.tsx              # 장소 목록 테이블
      PlaceFilters.tsx            # 필터 바 (카테고리, 지역, 품질)
      PlaceForm.tsx               # 장소 수정/생성 폼
      PlaceBulkActions.tsx        # 일괄 작업 (삭제, 태그 추가 등)
    reviews/
      ReviewTable.tsx             # 리뷰 목록 테이블
    quality/
      QualityOverview.tsx         # 전체 품질 현황 차트
      MissingFieldTable.tsx       # 누락 필드별 장소 목록
      StaleDataTable.tsx          # 오래된 데이터 목록
    stats/
      CategoryChart.tsx           # 카테고리별 분포 차트
      RegionChart.tsx             # 지역별 분포 차트
    data/
      ExportPanel.tsx             # 다운로드 패널
      ImportPanel.tsx             # 업로드 + 미리보기 + 검증
      ImportPreview.tsx           # 업로드 미리보기 테이블
      ValidationResult.tsx        # 유효성 검증 결과 표시

lib/
  supabase/
    middleware.ts                 # 미들웨어용 Supabase 클라이언트 (쿠키 기반)
    admin.ts                      # 관리자 전용 서버 클라이언트 (SERVICE_ROLE_KEY)

stores/
  adminStore.ts                   # 관리자 페이지 전용 zustand store (필터, 선택 상태)
```

---

## 상세 구현 계획

### Phase 0: 인증 (Supabase Auth)

#### 0-1. DB 마이그레이션

**`supabase/migrations/20260316_admin_users.sql`**

```sql
-- 관리자 사용자 테이블
CREATE TABLE admin_users (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL UNIQUE,
  role       text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 본인 레코드만 읽기 가능
CREATE POLICY "admin_users_select_own"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

-- places 테이블 RLS
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능 (기존 프론트엔드 호환)
CREATE POLICY "places_select_all"
  ON places FOR SELECT
  USING (true);

-- admin_users에 등록된 사용자만 수정/삭제/추가 가능
CREATE POLICY "places_insert_admin"
  ON places FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "places_update_admin"
  ON places FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "places_delete_admin"
  ON places FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- blog_reviews 테이블 RLS (동일 패턴)
ALTER TABLE blog_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_reviews_select_all"
  ON blog_reviews FOR SELECT USING (true);

CREATE POLICY "blog_reviews_insert_admin"
  ON blog_reviews FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "blog_reviews_delete_admin"
  ON blog_reviews FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- bookmarks는 일반 사용자 기능이므로 RLS 별도 관리
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookmarks_all"
  ON bookmarks FOR ALL USING (true) WITH CHECK (true);
```

#### 0-2. 초기 관리자 등록 (수동)

Supabase Dashboard 또는 SQL로 직접 등록:

```sql
-- 1) Supabase Dashboard > Authentication > Users > "Add user" 로 이메일/비밀번호 생성
-- 2) 생성된 user의 id를 admin_users에 추가
INSERT INTO admin_users (id, email, role) VALUES (
  '<auth.users에서 생성된 uuid>',
  'admin@petswgwon.com',
  'super_admin'
);
```

> 회원가입 UI는 제공하지 않는다. 관리자 추가는 super_admin이 Supabase Dashboard 또는 향후 관리자 설정 페이지에서 수행.

#### 0-3. Supabase 클라이언트 설정

> **중요**: 현재 `lib/supabase/server.ts`는 `@supabase/supabase-js`의 `createClient`를 사용하여
> 쿠키에 접근하지 못한다. 이 상태에서는 서버 사이드에서 `auth.getUser()`를 호출해도
> 항상 `null`이 반환되므로, **`@supabase/ssr`의 `createServerClient`로 교체**해야 한다.

**`lib/supabase/server.ts`** (수정 — 쿠키 기반으로 교체)

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
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
```

> **주의**: 기존 `createServerClient()` → `createClient()`로 이름 변경 + `async` 함수로 변경.
> 기존 API Route(`/api/places`, `/api/bookmarks` 등)에서 `createServerClient()` 호출부를
> `await createClient()`로 일괄 수정 필요. 이들은 인증 불필요한 SELECT 쿼리이므로
> 쿠키가 없어도 ANON_KEY로 정상 동작한다.

**`lib/supabase/middleware.ts`** (신규)

Next.js 미들웨어에서 사용할 쿠키 기반 Supabase 클라이언트.
`@supabase/ssr` 패키지의 `createServerClient`를 사용하여 요청/응답 쿠키를 자동 관리한다.

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return { supabase, response };
}
```

**`lib/supabase/admin.ts`** (신규)

관리자 API에서 RLS를 우회하여 데이터를 수정할 때 사용하는 SERVICE_ROLE 클라이언트.

```typescript
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

#### 0-4. 미들웨어 (`middleware.ts`)

프로젝트 루트에 생성. `/admin` 하위 경로(로그인 페이지 제외)에 접근할 때 인증 상태를 확인한다.

> **보안 핵심**: Supabase 공식 문서에 따르면 서버 코드에서는 `getSession()` 대신
> `getClaims()`를 사용해야 한다. `getSession()`은 JWT를 재검증하지 않아 쿠키 조작으로
> 위변조 가능하지만, `getClaims()`는 JWT 서명을 검증하여 토큰 진위를 확인한다.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // getClaims()는 JWT 서명을 검증 — getSession()보다 안전
  const { data: { claims }, error } = await supabase.auth.getClaims();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  // 관리자 경로가 아니면 통과
  if (!isAdminRoute) return response;

  const isAuthenticated = !error && claims?.sub;

  // 로그인 페이지는 미인증 상태에서 접근 가능
  if (isLoginPage) {
    if (isAuthenticated) {
      // 이미 로그인 → 대시보드로 리다이렉트
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return response;
  }

  // 미인증 → 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 관리자 권한은 미들웨어에서 DB 조회하지 않음 (성능 이슈)
  // → API 레이어의 requireAdmin()에서 체크
  // → 비관리자가 페이지를 보더라도 API 호출 시 403 반환

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

> **미들웨어에서 admin_users DB 조회를 제거한 이유**:
> 미들웨어는 모든 `/admin` 요청(페이지, 이미지, CSS 등)마다 실행된다.
> 매번 DB를 조회하면 성능이 떨어지고, Edge Runtime에서 DB 연결 문제가 생길 수 있다.
> 대신 인증 여부만 미들웨어에서 확인하고, 관리자 권한은 API에서 체크한다.
> 비관리자가 페이지 UI를 보더라도 데이터를 조회/수정할 수 없으므로 보안에 문제없다.

#### 0-5. 로그인 페이지 (`/admin/login`)

**`app/admin/login/page.tsx`**

- 관리자 전용 로그인 화면 (일반 사용자 앱과 분리된 디자인)
- 이메일 + 비밀번호 입력 폼
- 로그인 실패 시 에러 메시지 표시
- `redirect` 쿼리 파라미터가 있으면 로그인 후 해당 경로로 이동
- 회원가입 링크 없음 (관리자만 접근)

**`components/admin/auth/LoginForm.tsx`**

```typescript
// 주요 동작
'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

// 상태: email, password, error, loading
// onSubmit:
//   const supabase = createClient();
//   const { error } = await supabase.auth.signInWithPassword({ email, password });
//   if (error) → 에러 표시 ('이메일 또는 비밀번호가 올바르지 않습니다')
//   else → router.push(redirect || '/admin')
//   router.refresh() 호출하여 미들웨어 재실행
```

**UI 구성**
- 중앙 정렬 카드 형태 (모바일 430px 제한 없이 풀스크린)
- 상단: 펫세권 로고 + "관리자 로그인" 텍스트
- 이메일 input (type="email")
- 비밀번호 input (type="password")
- 로그인 버튼 (로딩 시 스피너)
- 에러 메시지 영역 (빨간 배경 박스)
- `not_admin` 에러: "관리자 권한이 없는 계정입니다"

**API: `POST /api/admin/auth/login`**

> 클라이언트 사이드에서 `supabase.auth.signInWithPassword()`를 직접 호출하므로 별도 API 라우트는 선택사항.
> 다만 서버 사이드 로그인이 필요한 경우를 대비해 둔다.

```typescript
// app/api/admin/auth/login/route.ts
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const supabase = createServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  // admin_users 테이블 확인
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (!adminUser) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: '관리자 권한이 없습니다' }, { status: 403 });
  }

  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email, role: adminUser.role }
  });
}
```

**API: `POST /api/admin/auth/logout`**

```typescript
// 세션 종료 후 로그인 페이지로 리다이렉트
const supabase = createServerClient();
await supabase.auth.signOut();
return NextResponse.json({ success: true });
```

**API: `GET /api/admin/auth/me`**

```typescript
// 현재 로그인 사용자 정보 반환 (헤더 표시용)
// → { user: { id, email, role } } 또는 { user: null }
```

#### 0-6. 관리자 레이아웃 인증 연동

**`app/admin/layout.tsx`** 수정

```typescript
// 서버 컴포넌트에서 현재 사용자 확인
// (미들웨어에서 이미 체크하므로 여기선 사용자 정보 조회용)
// → AdminHeader에 사용자 이메일, 로그아웃 버튼 전달
```

**`components/admin/layout/AdminHeader.tsx`** 수정

- 우측에 현재 로그인 이메일 표시
- 로그아웃 버튼: `supabase.auth.signOut()` → `/admin/login` 리다이렉트

#### 0-7. 관리자 API 인증 보호

모든 `/api/admin/*` 라우트에 인증 체크 헬퍼 적용:

```typescript
// lib/supabase/adminAuth.ts (신규)
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
  const supabase = await createClient();

  // getUser()는 JWT를 서버에서 재검증 — API에서는 이 방식이 가장 안전
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  // admin_users 테이블에서 관리자 권한 확인
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, email, role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user: adminUser, supabase };
}

// 사용 예시 (각 admin API route에서):
// const auth = await requireAdmin();
// if ('error' in auth) return auth.error;
// const { user, supabase } = auth;
```

> **미들웨어 vs API의 인증 방식 차이**:
> - 미들웨어: `getClaims()` (JWT 서명 로컬 검증, 빠름, 인증 여부만 판단)
> - API Route: `getUser()` (Auth 서버 재검증, 확실함, 권한까지 체크)
> - 이중 보호를 통해 미들웨어 우회 시도에도 API에서 차단

#### 0-8. 환경변수 추가

**`.env.local`** 에 추가 필요:

```
SUPABASE_SERVICE_ROLE_KEY=<Supabase Dashboard → Settings → API → service_role key>
```

> `NEXT_PUBLIC_` 접두사 없이 서버에서만 사용. 절대 클라이언트에 노출하지 않는다.

#### 0-9. Supabase Dashboard 보안 설정

Supabase Dashboard → Authentication → Settings에서 아래 항목을 설정한다.

**필수 설정**

| 항목 | 설정값 | 이유 |
|------|--------|------|
| Disable sign-ups | **ON** | 관리자만 수동 등록, 아무나 가입 불가 |
| Minimum password length | **12** 이상 | 브루트포스 방어 |
| Password requirements | 대소문자+숫자+특수문자 | 비밀번호 강도 확보 |
| Enable HIBP check | **ON** | 유출된 비밀번호 차단 (Have I Been Pwned) |
| JWT expiry | **3600** (1시간) | 탈취된 토큰의 유효 시간 제한 |
| Refresh token rotation | **ON** | 리프레시 토큰 재사용 공격 방지 |

**권장 설정**

| 항목 | 설정값 | 이유 |
|------|--------|------|
| Rate limit (email sent) | **5**/hour | 비밀번호 재설정 요청 남용 방지 |
| Session inactivity timeout | **3600** (1시간) | 미사용 세션 자동 만료 |
| Sessions single per user | **ON** (선택) | 동시 로그인 방지 |
| Confirm email | **ON** | 이메일 인증 필수 |
| Secure email change | **ON** | 이메일 변경 시 기존+신규 이메일 모두 인증 |
| Require reauthentication for password update | **ON** | 비밀번호 변경 시 현재 비밀번호 확인 |

#### 0-10. 보안 체크리스트

구현 완료 후 아래 항목을 모두 확인한다.

```
[ ] Supabase Dashboard에서 "Disable sign-ups" 활성화됨
[ ] .env.local의 SUPABASE_SERVICE_ROLE_KEY가 NEXT_PUBLIC_ 접두사 없음
[ ] SERVICE_ROLE_KEY가 클라이언트 번들에 포함되지 않음 (next build 후 .next/ 검색)
[ ] lib/supabase/server.ts가 @supabase/ssr의 createServerClient 사용 + cookies() 연동
[ ] 미들웨어에서 getClaims() 사용 (getSession() 아님)
[ ] 모든 /api/admin/* 라우트에 requireAdmin() 적용됨
[ ] RLS가 places, blog_reviews, bookmarks, admin_users 테이블에 활성화됨
[ ] admin_users SELECT 정책이 본인 레코드만 허용 (auth.uid() = id)
[ ] 로그인 폼에 입력값 trim + 최대 길이 제한 적용
[ ] 로그인 실패 메시지가 "이메일 또는 비밀번호" (어떤 것이 틀렸는지 구분 불가)
[ ] 비밀번호 초기화 시 Supabase 내장 이메일 사용 (커스텀 엔드포인트 아님)
[ ] HTTPS 환경에서만 운영 (쿠키 Secure 플래그)
```

---

### Phase 1: 기반 구조 + 대시보드

#### 1-1. 관리자 레이아웃

**`app/admin/layout.tsx`**

- 좌측 사이드바 + 우측 콘텐츠 영역의 2컬럼 레이아웃
- 사이드바 메뉴: 대시보드, 장소 관리, 리뷰 관리, 데이터 품질, 통계, 데이터 관리
- 현재 경로에 맞춰 active 상태 표시
- 모바일 반응형: 햄버거 메뉴로 사이드바 토글

**`components/admin/layout/AdminSidebar.tsx`**

```
메뉴 구조:
├── 📊 대시보드           /admin
├── 📍 장소 관리          /admin/places
├── 💬 리뷰 관리          /admin/reviews
├── 🔍 데이터 품질        /admin/quality
├── 📈 통계              /admin/stats
└── 📦 데이터 관리        /admin/data
```

#### 1-2. 대시보드 (`/admin`)

**요약 카드 4개 (StatCard)**
- 전체 장소 수 (Supabase count)
- 오늘 수정된 장소 수 (updated_at >= today)
- 전체 리뷰 수
- 전체 북마크 수

**데이터 품질 경고 (QualityAlert)**
- 이미지 없는 장소: 12,608건
- 영업시간 없는 장소: 2,006건
- 전화번호 없는 장소: 1,496건
- 각 항목 클릭 → `/admin/quality`로 이동

**카테고리별 분포** (간단한 가로 바 차트)
- `data/categories.ts`의 카테고리명 + 색상 활용

**최근 활동 (RecentActivity)**
- 최근 수정된 장소 5건 (updated_at DESC)
- 최근 추가된 리뷰 5건

**API: `GET /api/admin/stats`**
```typescript
// 응답
{
  totalPlaces: number;
  todayUpdated: number;
  totalReviews: number;
  totalBookmarks: number;
  categoryDistribution: { category: string; count: number }[];
  qualityIssues: {
    noImage: number;
    noBusinessHours: number;
    noPhone: number;
    noPetEtiquette: number;
  };
  recentUpdates: Place[];    // 최근 5건
  recentReviews: BlogReview[]; // 최근 5건
}
```

---

### Phase 2: 장소 관리 (CRUD)

#### 2-1. 장소 목록 (`/admin/places`)

**PlaceTable**
- 컬럼: 이름, 카테고리, 서브카테고리, 주소(시/도만), 전화번호, 수정일, 품질상태
- 품질상태: 이미지/영업시간/전화번호 등의 채움 정도를 아이콘으로 표시
- 행 클릭 → `/admin/places/[id]` 수정 페이지로 이동
- 체크박스 선택 → 일괄 작업 활성화

**PlaceFilters**
- 카테고리 드롭다운 (categories.ts 기반)
- 서브카테고리 드롭다운 (카테고리 선택에 연동)
- 지역 드롭다운 (시/도: 주소 앞 2글자 기준)
- 품질 필터: 전체 / 이미지 없음 / 영업시간 없음 / 전화번호 없음
- 이름·주소 텍스트 검색
- 정렬: 이름순, 최신순, 수정일순

**PlaceBulkActions**
- 선택된 장소에 대해: 일괄 삭제, 카테고리 변경, 태그 추가/제거
- 삭제 시 확인 모달

**페이지네이션**
- 한 페이지 50건
- Supabase `.range(offset, offset + limit - 1)` 사용

**API: `GET /api/admin/places`**
```typescript
// 쿼리 파라미터
{
  page?: number;        // 기본 1
  limit?: number;       // 기본 50
  category?: string;
  sub_category?: string;
  region?: string;      // 주소 ilike 필터
  quality?: 'no_image' | 'no_hours' | 'no_phone' | 'no_etiquette';
  search?: string;      // 이름/주소 ilike
  sort?: 'name' | 'updated_at' | 'created_at';
  order?: 'asc' | 'desc';
}

// 응답
{
  places: PlaceRow[];   // DB 필드 그대로 (transformPlace 미적용)
  total: number;
  page: number;
  totalPages: number;
}
```

#### 2-2. 장소 수정 (`/admin/places/[id]`)

**PlaceForm** — 탭 또는 섹션으로 구분

**기본 정보 섹션**
- 이름 (text input)
- 카테고리 (select → ENUM)
- 서브카테고리 (select → 카테고리에 연동)
- 전화번호 (text input)
- 도로명주소 (text input)
- 지번주소 (text input)
- 위도/경도 (number input, 소수점 8자리)

**영업시간 섹션**
- 영업시간 (text input) — DB: `business_hours.hours`
- 휴무일 (text input) — DB: `business_hours.closedDays`

**반려동물 정책 섹션**
- 소형견 허용 (toggle)
- 중형견 허용 (toggle)
- 대형견 허용 (toggle)
- 실내 입장 허용 (toggle)
- 입장 방식 (select: 자유, 목줄착용, 이동가방, 안고입장)
- 펫 에티켓 (텍스트 배열 — 추가/삭제 가능)
- 주의사항 (textarea)

**미디어 섹션**
- 썸네일 URL (text input)
- 이미지 URL 목록 (텍스트 배열 — 추가/삭제 가능)

**태그 섹션**
- 현재 태그 표시 (Chip)
- 태그 추가 (input + 엔터)
- 태그 삭제 (X 클릭)

**저장 / 삭제 버튼**

**API: `GET /api/admin/places/[id]`** — 단일 장소 조회 (DB raw)
**API: `PUT /api/admin/places/[id]`** — 수정
**API: `DELETE /api/admin/places/[id]`** — 삭제

```typescript
// PUT 요청 body
{
  name?: string;
  category?: CategoryType;
  sub_category?: SubCategoryType;
  phone?: string;
  address?: string;
  address_jibun?: string;
  lat?: number;
  lng?: number;
  business_hours?: { hours?: string; closedDays?: string };
  small_dog?: boolean;
  medium_dog?: boolean;
  large_dog?: boolean;
  indoor_allowed?: boolean;
  access_method?: string;
  pet_etiquette?: string[];
  caution?: string;
  thumbnail?: string;
  images?: string[];
  tags?: string[];
}
```

#### 2-3. 장소 신규 등록 (`/admin/places/new`)

- PlaceForm과 동일한 UI, id 없이 POST
- **API: `POST /api/admin/places`** — 신규 등록
- 등록 후 `/admin/places/[id]`로 리다이렉트

---

### Phase 3: 데이터 품질 모니터링

#### 3-1. 품질 대시보드 (`/admin/quality`)

**QualityOverview**
- 필드별 채움율 바 차트:
  - 이름: 100%, 주소: 100%, 위치좌표: 100%
  - 전화번호: 88%, 영업시간: 84%, 태그: 100%
  - 이미지: 0%, 펫에티켓: 7%
- 전체 품질 점수 (채움율 가중 평균)

**MissingFieldTable**
- 필드 선택 → 해당 필드가 비어있는 장소 목록 표시
- 행 클릭 → 수정 페이지로 이동
- 필터: 카테고리, 지역

**StaleDataTable**
- 마지막 수정일 기준 구간별 (30일/90일/180일+) 장소 수
- 카페/식당/미용실 등 폐업 가능성 높은 업종 우선 표시
- "확인 필요" 마킹 기능 (향후 확장)

**API: `GET /api/admin/quality`**
```typescript
// 쿼리 파라미터
{
  field?: 'thumbnail' | 'phone' | 'business_hours' | 'pet_etiquette' | 'images';
  category?: string;
  region?: string;
  stale_days?: number;   // N일 이상 미갱신
  page?: number;
  limit?: number;
}

// 응답
{
  summary: {
    field: string;
    total: number;
    filled: number;
    empty: number;
    fillRate: number;   // 0~1
  }[];
  staleSummary: {
    range: string;       // "30일 이내", "30~90일", "90~180일", "180일+"
    count: number;
  }[];
  places?: PlaceRow[];  // field 파라미터 지정 시
  total?: number;
}
```

---

### Phase 4: 리뷰 관리

#### 4-1. 리뷰 목록 (`/admin/reviews`)

**ReviewTable**
- 컬럼: 장소명, 요약, 작성자, 출처, 작성일
- 장소명 클릭 → 장소 수정 페이지
- 삭제 버튼 (확인 모달)
- 필터: 장소명 검색, 출처 필터, 기간 필터

**API: `GET /api/admin/reviews`**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;     // 장소명 or 내용 검색
  source?: string;     // 출처 필터
  sort?: 'created_at' | 'date';
  order?: 'asc' | 'desc';
}
```
**API: `DELETE /api/admin/reviews/[id]`** — 리뷰 삭제

---

### Phase 5: 통계

#### 5-1. 통계 대시보드 (`/admin/stats`)

**카테고리 분포 (CategoryChart)**
- 도넛 차트 또는 가로 바 차트
- 카테고리 → 서브카테고리 드릴다운

**지역별 분포 (RegionChart)**
- 시/도별 장소 수 가로 바 차트
- 데이터 부족 지역 강조 표시

**반려견 정책 통계**
- 대형견 허용 비율, 실내 허용 비율, 입장방식 분포

**시간별 추이** (향후 데이터 쌓이면)
- 월별 신규 등록/수정/삭제 트렌드

**API: `GET /api/admin/stats`** — 위 대시보드 API 확장 사용

---

### Phase 6: 데이터 다운로드/업로드

#### 6-1. 다운로드 (`/admin/data` — ExportPanel)

**JSON 다운로드**
- 전체 또는 필터 적용 후 다운로드
- 필터: 카테고리, 서브카테고리, 지역
- DB 필드 그대로 JSON 배열로 내보냄
- 파일명: `places_export_YYYYMMDD.json`

**엑셀 다운로드**
- JSON 필드를 펼쳐서 엑셀 친화적으로 변환:
  - `business_hours` → `영업시간`, `휴무일` 2개 컬럼
  - `tags` → 쉼표 구분 문자열 (`"카페, 실내, 주차가능"`)
  - `pet_etiquette` → 쉼표 구분 문자열
  - `images` → 쉼표 구분 문자열 (URL)
  - boolean → "O" / "X"
  - `category` → 한글명 병기 (`food_beverage (식음료)`)
- 파일명: `places_export_YYYYMMDD.xlsx`
- 엑셀 생성 라이브러리: SheetJS (xlsx) — `pnpm add xlsx`

**API: `GET /api/admin/places/export`**
```typescript
// 쿼리 파라미터
{
  format: 'json' | 'xlsx';
  category?: string;
  sub_category?: string;
  region?: string;
}

// 응답
// format=json → Content-Type: application/json, Content-Disposition: attachment
// format=xlsx → Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

#### 6-2. 업로드 (`/admin/data` — ImportPanel)

**JSON 업로드 흐름**
1. 파일 선택 (`.json`)
2. 파싱 → 미리보기 (ImportPreview)
3. 유효성 검증 (ValidationResult)
   - 필수 필드 체크 (name, category, sub_category, lat, lng)
   - ENUM 값 검증 (category, sub_category)
   - 좌표 범위 검증 (한국: lat 33~39, lng 124~132)
   - 중복 체크 (같은 이름+주소 존재 여부)
4. 검증 결과 표시:
   - 신규 추가 예정: N건 (초록)
   - 수정 예정: N건 (노랑, id 매칭)
   - 오류: N건 (빨강, 상세 사유 표시)
5. "적용" 클릭 → 배치 upsert (500건씩)
6. 결과 리포트

**엑셀 업로드 흐름**
1. 파일 선택 (`.xlsx`)
2. SheetJS로 파싱 → 역변환:
   - `영업시간` + `휴무일` → `business_hours` JSON
   - 쉼표 구분 문자열 → 배열
   - "O"/"X" → boolean
   - 한글 카테고리명 → ENUM 코드
3. 이후 JSON 업로드와 동일한 검증/적용 흐름

**API: `POST /api/admin/places/import`**
```typescript
// 요청 body
{
  mode: 'insert' | 'upsert';  // 신규만 / 기존 수정 포함
  places: PlaceRow[];          // 검증 통과한 데이터
}

// 응답
{
  inserted: number;
  updated: number;
  errors: { index: number; name: string; reason: string }[];
}
```

---

## 구현 우선순위

| 순서 | Phase | 예상 작업량 | 설명 |
|------|-------|------------|------|
| 1 | Phase 0 | 중 | 인증 (Supabase Auth + 로그인 + 미들웨어 + RLS) |
| 2 | Phase 1 | 중 | 레이아웃 + 대시보드 (기반 구조) |
| 3 | Phase 2 | 대 | 장소 CRUD (핵심 기능) |
| 4 | Phase 6 | 중 | JSON/엑셀 다운로드·업로드 (일괄 관리) |
| 5 | Phase 3 | 중 | 데이터 품질 모니터링 |
| 6 | Phase 4 | 소 | 리뷰 관리 |
| 7 | Phase 5 | 소 | 통계 |

---

## 기술 결정사항

### 차트 라이브러리
- recharts (React 친화적, 번들 사이즈 적절)
- 또는 순수 Tailwind CSS 바 차트 (외부 의존성 없이)

### 엑셀 처리 라이브러리
- **SheetJS (xlsx)**: `pnpm add xlsx`
- 다운로드: 서버에서 Buffer 생성 → 클라이언트에서 Blob 다운로드
- 업로드: 클라이언트에서 파싱 → 서버로 JSON 전송

### 상태 관리
- 관리자 페이지 전용 zustand store 생성
- `stores/adminStore.ts` — 필터 상태, 선택된 장소 목록 등 (신규 디렉토리 생성 필요)

### 인증 & 보안
- **Supabase Auth** (Email/Password) 기반 로그인
- `middleware.ts`에서 `/admin/**` 경로 접근 시 세션 체크
- `admin_users` 테이블로 관리자 권한 분리 (일반 Supabase Auth 사용자 ≠ 관리자)
- 회원가입 UI 없음 — 관리자 계정은 Supabase Dashboard에서 직접 생성
- 모든 admin API에 `requireAdmin()` 헬퍼로 이중 인증 체크
- 데이터 읽기: `ANON_KEY` (RLS SELECT 정책으로 모든 사용자 허용)
- 데이터 수정/삭제: 로그인된 관리자의 세션 토큰 사용 (RLS INSERT/UPDATE/DELETE 정책 적용)
- 대량 작업(import 등): `SERVICE_ROLE_KEY`로 RLS 우회 (`lib/supabase/admin.ts`)
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 환경변수 (`NEXT_PUBLIC_` 접두사 없음)

---

## 필요한 추가 패키지

```bash
pnpm add @supabase/ssr # 쿠키 기반 SSR 인증 (미들웨어, 서버 컴포넌트)
pnpm add xlsx          # 엑셀 파싱/생성 (SheetJS)
pnpm add recharts      # 차트 (선택)
```

---

## Supabase RLS 정책

Phase 0에서 RLS를 활성화하고 아래 정책을 적용한다.

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `places` | 모든 사용자 | admin_users만 | admin_users만 | admin_users만 |
| `blog_reviews` | 모든 사용자 | admin_users만 | — | admin_users만 |
| `bookmarks` | 모든 사용자 | 모든 사용자 | — | 모든 사용자 |
| `admin_users` | 본인만 | — (수동 등록) | — | — |

**기존 프론트엔드 영향**: `places`, `blog_reviews`, `bookmarks`의 SELECT는 모두 허용이므로 기존 API(`/api/places` 등)는 ANON_KEY로 계속 동작한다.

**관리자 API 동작 방식**:
- 일반 CRUD: 로그인 세션 기반 토큰으로 RLS 통과 (admin_users 존재 여부 체크)
- 대량 import/export: `createAdminClient()` (SERVICE_ROLE_KEY)로 RLS 우회

---

## 참고: 기존 파일과의 관계

| 기존 파일 | 관리자 페이지에서의 활용 |
|-----------|------------------------|
| `data/categories.ts` | 카테고리 ENUM ↔ 한글명 매핑에 재사용 |
| `lib/supabase/client.ts` | 클라이언트 사이드 로그인(`signInWithPassword`) 등에 사용 |
| `lib/supabase/server.ts` | **수정 필요** — `@supabase/ssr` + cookies()로 교체, 관리자 API에서 세션 인증에 사용 |
| `lib/supabase/transformPlace.ts` | 관리자에서는 미사용 (DB raw 필드 직접 사용) |
| `types/place.ts` | `CategoryType`, `SubCategoryType` 타입 재사용 |

## 신규 파일 요약

| 파일 | 역할 |
|------|------|
| `middleware.ts` | `/admin/**` 경로 인증 체크, 미인증 시 로그인 리다이렉트 |
| `lib/supabase/middleware.ts` | 미들웨어용 쿠키 기반 Supabase 클라이언트 |
| `lib/supabase/admin.ts` | SERVICE_ROLE_KEY 클라이언트 (RLS 우회) |
| `lib/supabase/adminAuth.ts` | `requireAdmin()` 헬퍼 (API 인증 체크) |
| `app/admin/login/page.tsx` | 관리자 로그인 페이지 |
| `components/admin/auth/LoginForm.tsx` | 로그인 폼 컴포넌트 |
| `supabase/migrations/20260316_admin_users.sql` | admin_users 테이블 + RLS 정책 |
