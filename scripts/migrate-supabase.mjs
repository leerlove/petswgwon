import { createClient } from '@supabase/supabase-js';

// Old Supabase
const OLD_URL = 'https://moqxgvhhtijoqzjbbxdm.supabase.co';
const OLD_KEY = 'sb_publishable_PwrKx1ooqqxt6UGn8ZtNDA_eRkPZF2Z';

// New Supabase
const NEW_URL = 'https://yngzeshxngfeyiabxeyi.supabase.co';
const NEW_KEY = 'sb_publishable_3zauWrzjkRY6OR9zAVtXgA_LKCElbHl';

const oldClient = createClient(OLD_URL, OLD_KEY);
const newClient = createClient(NEW_URL, NEW_KEY);

// SQL for creating tables (run via Supabase SQL editor or REST)
const SCHEMA_SQL = `
-- ENUM types
DO $$ BEGIN
  CREATE TYPE category_type AS ENUM (
    'food_beverage','medical_health','accommodation_travel','pet_service','play_shopping'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sub_category_type AS ENUM (
    'restaurant','bar','cafe','vet','pharmacy','accommodation','travel','camping',
    'funeral','grooming','hotel_care','supplies','playground'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- places table
CREATE TABLE IF NOT EXISTS places (
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

CREATE INDEX IF NOT EXISTS idx_places_category ON places (category);
CREATE INDEX IF NOT EXISTS idx_places_sub_category ON places (sub_category);
CREATE INDEX IF NOT EXISTS idx_places_location ON places (lat, lng);
CREATE INDEX IF NOT EXISTS idx_places_lat_lng ON places (lat, lng);
CREATE INDEX IF NOT EXISTS idx_places_category_lat_lng ON places (category, lat, lng);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_places_updated_at ON places;
CREATE TRIGGER tr_places_updated_at
  BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- blog_reviews table
CREATE TABLE IF NOT EXISTS blog_reviews (
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

CREATE INDEX IF NOT EXISTS idx_blog_reviews_place_id ON blog_reviews (place_id);

-- bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id   uuid        NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (place_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks (user_id);
`;

async function createSchema() {
  console.log('📋 새 Supabase에 테이블 생성 중...');
  const { error } = await newClient.rpc('exec_sql', { sql: SCHEMA_SQL });
  if (error) {
    // rpc가 없을 수 있으므로 REST API로 직접 실행
    console.log('⚠️  rpc exec_sql 사용 불가, REST SQL 실행 시도...');

    // Supabase REST API로 SQL 실행
    const response = await fetch(`${NEW_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': NEW_KEY,
        'Authorization': `Bearer ${NEW_KEY}`,
      },
      body: JSON.stringify({ sql: SCHEMA_SQL }),
    });

    if (!response.ok) {
      console.log('⚠️  REST SQL도 실패. 수동으로 SQL을 실행해야 합니다.');
      console.log('📝 Supabase Dashboard > SQL Editor에서 아래 SQL을 실행해주세요:');
      console.log('='.repeat(60));
      console.log(SCHEMA_SQL);
      console.log('='.repeat(60));
      console.log('\n테이블 생성 후 이 스크립트를 --data-only 플래그로 다시 실행해주세요.');
      return false;
    }
  }
  console.log('✅ 테이블 생성 완료');
  return true;
}

async function fetchAll(client, table) {
  const rows = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await client
      .from(table)
      .select('*')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error(`❌ ${table} 조회 실패:`, error.message);
      return rows;
    }

    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

async function migrateData() {
  // 1. 기존 데이터 추출
  console.log('\n📤 기존 Supabase에서 데이터 추출 중...');

  const places = await fetchAll(oldClient, 'places');
  console.log(`  places: ${places.length}건`);

  const blogReviews = await fetchAll(oldClient, 'blog_reviews');
  console.log(`  blog_reviews: ${blogReviews.length}건`);

  const bookmarks = await fetchAll(oldClient, 'bookmarks');
  console.log(`  bookmarks: ${bookmarks.length}건`);

  if (places.length === 0) {
    console.log('⚠️  기존 DB에 데이터가 없습니다.');
    return;
  }

  // 2. 새 DB에 데이터 삽입 (places 먼저, FK 때문에)
  console.log('\n📥 새 Supabase에 데이터 삽입 중...');

  // places - batch insert
  const BATCH = 500;
  for (let i = 0; i < places.length; i += BATCH) {
    const batch = places.slice(i, i + BATCH);
    const { error } = await newClient.from('places').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`❌ places 삽입 실패 (${i}~${i + batch.length}):`, error.message);
      return;
    }
  }
  console.log(`  ✅ places: ${places.length}건 삽입 완료`);

  // blog_reviews
  if (blogReviews.length > 0) {
    for (let i = 0; i < blogReviews.length; i += BATCH) {
      const batch = blogReviews.slice(i, i + BATCH);
      const { error } = await newClient.from('blog_reviews').upsert(batch, { onConflict: 'id' });
      if (error) {
        console.error(`❌ blog_reviews 삽입 실패:`, error.message);
        return;
      }
    }
    console.log(`  ✅ blog_reviews: ${blogReviews.length}건 삽입 완료`);
  }

  // bookmarks
  if (bookmarks.length > 0) {
    for (let i = 0; i < bookmarks.length; i += BATCH) {
      const batch = bookmarks.slice(i, i + BATCH);
      const { error } = await newClient.from('bookmarks').upsert(batch, { onConflict: 'id' });
      if (error) {
        console.error(`❌ bookmarks 삽입 실패:`, error.message);
        return;
      }
    }
    console.log(`  ✅ bookmarks: ${bookmarks.length}건 삽입 완료`);
  }

  // 3. 검증
  console.log('\n🔍 데이터 검증 중...');
  const { count: newPlacesCount } = await newClient.from('places').select('*', { count: 'exact', head: true });
  const { count: newReviewsCount } = await newClient.from('blog_reviews').select('*', { count: 'exact', head: true });
  const { count: newBookmarksCount } = await newClient.from('bookmarks').select('*', { count: 'exact', head: true });

  console.log(`  places: ${places.length} → ${newPlacesCount}`);
  console.log(`  blog_reviews: ${blogReviews.length} → ${newReviewsCount}`);
  console.log(`  bookmarks: ${bookmarks.length} → ${newBookmarksCount}`);

  console.log('\n🎉 마이그레이션 완료!');
}

async function main() {
  const dataOnly = process.argv.includes('--data-only');

  if (!dataOnly) {
    const schemaOk = await createSchema();
    if (!schemaOk) {
      return;
    }
  }

  await migrateData();
}

main().catch(console.error);
