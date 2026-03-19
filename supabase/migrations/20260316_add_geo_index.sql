-- Index for viewport-based bounding box queries
CREATE INDEX IF NOT EXISTS idx_places_lat_lng ON places (lat, lng);
CREATE INDEX IF NOT EXISTS idx_places_category_lat_lng ON places (category, lat, lng);
