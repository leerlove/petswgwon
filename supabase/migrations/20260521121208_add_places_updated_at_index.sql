-- Index for admin places listing default sort: ORDER BY updated_at DESC + range pagination
-- (/api/admin/places defaults to sort=updated_at, order=desc on 22.6k rows)
CREATE INDEX IF NOT EXISTS idx_places_updated_at
  ON public.places (updated_at DESC);
