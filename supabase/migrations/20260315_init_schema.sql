-- ============================================
-- 1. ENUM 타입
-- ============================================
CREATE TYPE category_type AS ENUM (
  'food_beverage',
  'medical_health',
  'accommodation_travel',
  'pet_service',
  'play_shopping'
);

CREATE TYPE sub_category_type AS ENUM (
  'restaurant', 'bar', 'cafe',
  'vet', 'pharmacy',
  'accommodation', 'travel', 'camping',
  'funeral', 'grooming', 'hotel_care',
  'supplies', 'playground'
);

-- ============================================
-- 2. places 테이블
-- ============================================
CREATE TABLE places (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text        NOT NULL,
  category       category_type     NOT NULL,
  sub_category   sub_category_type NOT NULL,
  address        text        NOT NULL DEFAULT '',
  address_jibun  text        NOT NULL DEFAULT '',
  phone          text        NOT NULL DEFAULT '',
  lat            double precision NOT NULL,
  lng            double precision NOT NULL,
  thumbnail      text        NOT NULL DEFAULT '',
  images         jsonb       NOT NULL DEFAULT '[]',
  tags           jsonb       NOT NULL DEFAULT '[]',
  business_hours jsonb       NOT NULL DEFAULT '{}',
  access_method  text        NOT NULL DEFAULT '',
  small_dog      boolean     NOT NULL DEFAULT true,
  medium_dog     boolean     NOT NULL DEFAULT true,
  large_dog      boolean     NOT NULL DEFAULT false,
  indoor_allowed boolean     NOT NULL DEFAULT false,
  pet_etiquette  jsonb       NOT NULL DEFAULT '[]',
  caution        text        NOT NULL DEFAULT '',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_places_category ON places (category);
CREATE INDEX idx_places_sub_category ON places (sub_category);
CREATE INDEX idx_places_location ON places (lat, lng);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_places_updated_at
  BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 3. blog_reviews 테이블
-- ============================================
CREATE TABLE blog_reviews (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id   uuid        NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  summary    text        NOT NULL,
  content    text        NOT NULL,
  source     text        NOT NULL DEFAULT '네이버블로그',
  source_url text        NOT NULL DEFAULT '#',
  author     text        NOT NULL,
  date       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_reviews_place_id ON blog_reviews (place_id);

-- ============================================
-- 4. bookmarks 테이블
-- ============================================
CREATE TABLE bookmarks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id   uuid        NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (place_id, user_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks (user_id);
