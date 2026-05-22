-- 역할 기반 RLS 강화: DB가 API와 동일한 권한 경계를 강제하도록 한다.
-- 기존 쓰기 정책은 "admin_users에 존재하면 허용"이라, playground 역할이 공개 anon key + 자기 JWT로
-- PostgREST에 직접 호출해 places/blog_reviews를 수정할 수 있는 권한상승 경로가 있었음.
--   - places / blog_reviews 쓰기  → 전체 관리자(admin, super_admin)만
--   - playgrounds 쓰기            → admin, super_admin, playground
--   - place-image 스토리지        → 관리자 역할만(비관리자 로그인 사용자 차단)
-- (SELECT auth.uid()) 형태는 RLS initplan 최적화 유지를 위함.

-- ── places: 전체 관리자만 쓰기 ──────────────────────────────
DROP POLICY IF EXISTS places_insert_admin ON public.places;
CREATE POLICY places_insert_admin ON public.places FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin')));

DROP POLICY IF EXISTS places_update_admin ON public.places;
CREATE POLICY places_update_admin ON public.places FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin')));

DROP POLICY IF EXISTS places_delete_admin ON public.places;
CREATE POLICY places_delete_admin ON public.places FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin')));

-- ── blog_reviews: 전체 관리자만 쓰기 ─────────────────────────
DROP POLICY IF EXISTS blog_reviews_insert_admin ON public.blog_reviews;
CREATE POLICY blog_reviews_insert_admin ON public.blog_reviews FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin')));

DROP POLICY IF EXISTS blog_reviews_update_admin ON public.blog_reviews;
CREATE POLICY blog_reviews_update_admin ON public.blog_reviews FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin')));

DROP POLICY IF EXISTS blog_reviews_delete_admin ON public.blog_reviews;
CREATE POLICY blog_reviews_delete_admin ON public.blog_reviews FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin')));

-- ── playgrounds: 전체 관리자 + playground 쓰기 ───────────────
DROP POLICY IF EXISTS playgrounds_insert_admin ON public.playgrounds;
CREATE POLICY playgrounds_insert_admin ON public.playgrounds FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin','playground')));

DROP POLICY IF EXISTS playgrounds_update_admin ON public.playgrounds;
CREATE POLICY playgrounds_update_admin ON public.playgrounds FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin','playground')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin','playground')));

DROP POLICY IF EXISTS playgrounds_delete_admin ON public.playgrounds;
CREATE POLICY playgrounds_delete_admin ON public.playgrounds FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin','playground')));

-- ── storage place-image: 관리자 역할만 (비관리자 로그인 사용자 차단) ──
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Admins manage place images insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'place-image' AND EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin','playground')));

DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
CREATE POLICY "Admins manage place images update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'place-image' AND EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin','playground')))
  WITH CHECK (bucket_id = 'place-image' AND EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin','playground')));

DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
CREATE POLICY "Admins manage place images delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'place-image' AND EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin','playground')));

DROP POLICY IF EXISTS "Authenticated users can list images" ON storage.objects;
CREATE POLICY "Admins manage place images select" ON storage.objects FOR SELECT
  USING (bucket_id = 'place-image' AND EXISTS (SELECT 1 FROM public.admin_users a
    WHERE a.id = (SELECT auth.uid()) AND a.role IN ('admin','super_admin','playground')));
