-- ============================================================
-- 관리자 인증 & RLS 마이그레이션
-- 실행: Supabase Dashboard > SQL Editor 에서 실행
-- ============================================================

-- 1. admin_users 테이블 생성
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- admin_users 테이블 RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- admin_users: 관리자만 읽기 가능
CREATE POLICY "admin_users_select_self" ON public.admin_users
  FOR SELECT USING (auth.uid() = id);

-- 2. places 테이블 RLS 정책
-- (이미 RLS가 활성화되어 있다면 ALTER TABLE은 무시됨)
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 SELECT 허용 (공개 데이터)
CREATE POLICY "places_select_all" ON public.places
  FOR SELECT USING (true);

-- 관리자만 INSERT 가능
CREATE POLICY "places_insert_admin" ON public.places
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- 관리자만 UPDATE 가능
CREATE POLICY "places_update_admin" ON public.places
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- 관리자만 DELETE 가능
CREATE POLICY "places_delete_admin" ON public.places
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- 3. blog_reviews 테이블 RLS 정책
ALTER TABLE public.blog_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_reviews_select_all" ON public.blog_reviews
  FOR SELECT USING (true);

CREATE POLICY "blog_reviews_insert_admin" ON public.blog_reviews
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "blog_reviews_update_admin" ON public.blog_reviews
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "blog_reviews_delete_admin" ON public.blog_reviews
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- 4. 현재 로그인된 계정을 admin_users에 추가
-- ⚠️ 아래 쿼리를 별도로 실행하세요. YOUR_USER_ID를 실제 auth.users의 id로 교체
-- Supabase Dashboard > Authentication > Users 에서 id 확인 가능
--
-- INSERT INTO public.admin_users (id, email, role)
-- VALUES ('YOUR_USER_ID', 'your@email.com', 'super_admin');
