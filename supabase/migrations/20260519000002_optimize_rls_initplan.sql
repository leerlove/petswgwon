-- Refactor RLS policies to wrap auth.uid() with (SELECT auth.uid())
-- to avoid per-row re-evaluation (lint 0003_auth_rls_initplan).

-- admin_users
DROP POLICY IF EXISTS admin_users_select_self ON public.admin_users;
CREATE POLICY admin_users_select_self ON public.admin_users
  FOR SELECT USING ((SELECT auth.uid()) = id);

-- magazine_posts
DROP POLICY IF EXISTS magazine_posts_insert_admin ON public.magazine_posts;
CREATE POLICY magazine_posts_insert_admin ON public.magazine_posts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS magazine_posts_update_admin ON public.magazine_posts;
CREATE POLICY magazine_posts_update_admin ON public.magazine_posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS magazine_posts_delete_admin ON public.magazine_posts;
CREATE POLICY magazine_posts_delete_admin ON public.magazine_posts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

-- magazine_post_places
DROP POLICY IF EXISTS magazine_post_places_insert_admin ON public.magazine_post_places;
CREATE POLICY magazine_post_places_insert_admin ON public.magazine_post_places
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS magazine_post_places_update_admin ON public.magazine_post_places;
CREATE POLICY magazine_post_places_update_admin ON public.magazine_post_places
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS magazine_post_places_delete_admin ON public.magazine_post_places;
CREATE POLICY magazine_post_places_delete_admin ON public.magazine_post_places
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );
