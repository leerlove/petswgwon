-- Enable RLS on places, blog_reviews, playgrounds, bookmarks.
-- Policies mirror magazine_posts: public SELECT, admin-only writes.
-- bookmarks uses anonymous-user model (single ANONYMOUS_USER UUID for all anon clients).

-- ── places ────────────────────────────────────────────────────────────
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

CREATE POLICY places_select_all ON public.places
  FOR SELECT USING (true);

CREATE POLICY places_insert_admin ON public.places
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

CREATE POLICY places_update_admin ON public.places
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

CREATE POLICY places_delete_admin ON public.places
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

-- ── playgrounds ───────────────────────────────────────────────────────
ALTER TABLE public.playgrounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY playgrounds_select_all ON public.playgrounds
  FOR SELECT USING (true);

CREATE POLICY playgrounds_insert_admin ON public.playgrounds
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

CREATE POLICY playgrounds_update_admin ON public.playgrounds
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

CREATE POLICY playgrounds_delete_admin ON public.playgrounds
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

-- ── blog_reviews ──────────────────────────────────────────────────────
ALTER TABLE public.blog_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY blog_reviews_select_all ON public.blog_reviews
  FOR SELECT USING (true);

CREATE POLICY blog_reviews_insert_admin ON public.blog_reviews
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

CREATE POLICY blog_reviews_update_admin ON public.blog_reviews
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

CREATE POLICY blog_reviews_delete_admin ON public.blog_reviews
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid()))
  );

-- ── bookmarks ─────────────────────────────────────────────────────────
-- Current app design: single ANONYMOUS_USER UUID shared across all anon clients.
-- Restrict writes to that user_id to prevent spoofing other user IDs.
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookmarks_select_all ON public.bookmarks
  FOR SELECT USING (true);

CREATE POLICY bookmarks_insert_anon_or_self ON public.bookmarks
  FOR INSERT WITH CHECK (
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
    OR user_id = (SELECT auth.uid())
  );

CREATE POLICY bookmarks_delete_anon_or_self ON public.bookmarks
  FOR DELETE USING (
    user_id = '00000000-0000-0000-0000-000000000000'::uuid
    OR user_id = (SELECT auth.uid())
  );
