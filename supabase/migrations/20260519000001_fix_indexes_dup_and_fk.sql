-- Drop duplicate index on places (idx_places_location ≡ idx_places_lat_lng, both on (lat, lng))
DROP INDEX IF EXISTS public.idx_places_location;

-- Add covering index for foreign key magazine_post_places.place_id
CREATE INDEX IF NOT EXISTS idx_magazine_post_places_place
  ON public.magazine_post_places (place_id);
