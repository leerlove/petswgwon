-- 관리자 대시보드 통합 집계 함수: places 13회 count(exact) → 2회 스캔으로 대체
CREATE OR REPLACE FUNCTION public.admin_place_stats()
RETURNS json
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  WITH p AS (
    SELECT
      count(*) AS total,
      count(*) FILTER (WHERE phone = '') AS no_phone,
      count(*) FILTER (WHERE business_hours = '{}'::jsonb) AS no_hours,
      count(*) FILTER (WHERE thumbnail = '') AS no_image,
      count(*) FILTER (WHERE pet_etiquette = '[]'::jsonb) AS no_etiquette
    FROM public.places
  ),
  c AS (
    SELECT coalesce(json_object_agg(category, cnt), '{}'::json) AS by_category
    FROM (SELECT category::text AS category, count(*) AS cnt FROM public.places GROUP BY category) s
  )
  SELECT json_build_object(
    'total', p.total,
    'no_phone', p.no_phone,
    'no_hours', p.no_hours,
    'no_image', p.no_image,
    'no_etiquette', p.no_etiquette,
    'by_category', c.by_category,
    'reviews', (SELECT count(*) FROM public.blog_reviews),
    'bookmarks', (SELECT count(*) FROM public.bookmarks)
  )
  FROM p, c;
$$;
