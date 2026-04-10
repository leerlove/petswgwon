-- ============================================
-- playgrounds 테이블 (놀이터 전용)
-- ============================================

-- 놀이터 하위 분류
CREATE TYPE playground_type AS ENUM ('playground', 'cafe', 'hotel', 'government', 'other');

CREATE TABLE playgrounds (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text             NOT NULL,
  playground_type playground_type  NOT NULL DEFAULT 'playground',
  address         text             NOT NULL DEFAULT '',
  phone           text             NOT NULL DEFAULT '',
  lat             double precision NOT NULL DEFAULT 0,
  lng             double precision NOT NULL DEFAULT 0,
  thumbnail       text             NOT NULL DEFAULT '',
  images          jsonb            NOT NULL DEFAULT '[]',
  business_hours  jsonb            NOT NULL DEFAULT '{}',
  is_unmanned     boolean          NOT NULL DEFAULT false,
  is_public       boolean          NOT NULL DEFAULT false,
  instagram       text             NOT NULL DEFAULT '',
  tags            jsonb            NOT NULL DEFAULT '[]',
  small_dog       boolean          NOT NULL DEFAULT true,
  medium_dog      boolean          NOT NULL DEFAULT true,
  large_dog       boolean          NOT NULL DEFAULT false,
  indoor_allowed  boolean          NOT NULL DEFAULT false,
  caution         text             NOT NULL DEFAULT '',
  created_at      timestamptz      NOT NULL DEFAULT now(),
  updated_at      timestamptz      NOT NULL DEFAULT now()
);

CREATE INDEX idx_playgrounds_type ON playgrounds (playground_type);
CREATE INDEX idx_playgrounds_location ON playgrounds (lat, lng);

-- updated_at 자동 갱신 (기존 update_updated_at 함수 재사용)
CREATE TRIGGER tr_playgrounds_updated_at
  BEFORE UPDATE ON playgrounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
