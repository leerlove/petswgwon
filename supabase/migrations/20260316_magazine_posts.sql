-- 매거진 포스트 테이블
CREATE TABLE magazine_posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  subtitle     text        NOT NULL DEFAULT '',
  summary      text        NOT NULL DEFAULT '',
  content      text        NOT NULL DEFAULT '',
  emoji        text        NOT NULL DEFAULT '📖',
  gradient     text        NOT NULL DEFAULT 'from-pink-300 to-rose-400',
  accent_color text        NOT NULL DEFAULT '#F472B6',
  cover_image  text        NOT NULL DEFAULT '',
  author       text        NOT NULL DEFAULT '펫세권 에디터',
  tags         jsonb       NOT NULL DEFAULT '[]',
  read_time    text        NOT NULL DEFAULT '3분',
  like_count   integer     NOT NULL DEFAULT 0,
  is_featured  boolean     NOT NULL DEFAULT false,
  is_published boolean     NOT NULL DEFAULT true,
  sort_order   integer     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 매거진 포스트에 연결된 추천 장소
CREATE TABLE magazine_post_places (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES magazine_posts(id) ON DELETE CASCADE,
  place_id     uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, place_id)
);

CREATE INDEX idx_magazine_posts_published ON magazine_posts (is_published, sort_order DESC);
CREATE INDEX idx_magazine_posts_featured ON magazine_posts (is_featured, is_published);
CREATE INDEX idx_magazine_post_places_post ON magazine_post_places (post_id, sort_order);

-- updated_at trigger
CREATE TRIGGER tr_magazine_posts_updated_at
  BEFORE UPDATE ON magazine_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE magazine_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "magazine_posts_select_all" ON magazine_posts FOR SELECT USING (true);
CREATE POLICY "magazine_posts_insert_admin" ON magazine_posts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "magazine_posts_update_admin" ON magazine_posts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "magazine_posts_delete_admin" ON magazine_posts FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

ALTER TABLE magazine_post_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "magazine_post_places_select_all" ON magazine_post_places FOR SELECT USING (true);
CREATE POLICY "magazine_post_places_insert_admin" ON magazine_post_places FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "magazine_post_places_update_admin" ON magazine_post_places FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "magazine_post_places_delete_admin" ON magazine_post_places FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
