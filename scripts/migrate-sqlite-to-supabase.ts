/**
 * SQLite → Supabase 마이그레이션 스크립트
 *
 * 기존 petswgwon-prto-temp의 SQLite 데이터(12,608건)를
 * 새 프로젝트의 Supabase PostgreSQL로 이관합니다.
 *
 * 사용법:
 *   npx tsx scripts/migrate-sqlite-to-supabase.ts
 *
 * 환경변수 (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  (또는 SUPABASE_SERVICE_ROLE_KEY 권장)
 */

import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import path from 'path';

// ── 설정 ──
const SQLITE_PATH = path.resolve(
  __dirname,
  '../docs/petswgwon-prto-temp/prisma/dev.db'
);
const BATCH_SIZE = 500; // Supabase upsert 배치 크기

// ── Supabase 클라이언트 ──
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL 또는 키가 설정되지 않았습니다.');
  console.error('   .env.local 파일을 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── 타입 정의 ──
interface SQLitePlace {
  id: string;
  name: string;
  category: string;
  sub_category: string;
  address: string;
  address_jibun: string;
  phone: string;
  lat: number;
  lng: number;
  thumbnail: string;
  images: string;
  tags: string;
  business_hours: string;
  access_method: string;
  small_dog: number;
  medium_dog: number;
  large_dog: number;
  indoor_allowed: number;
  pet_etiquette: string;
  caution: string;
  updated_at: number;
  created_at: number;
}

// ── 유효한 ENUM 값 목록 ──
const VALID_CATEGORIES = new Set([
  'food_beverage',
  'medical_health',
  'accommodation_travel',
  'pet_service',
  'play_shopping',
]);

const VALID_SUB_CATEGORIES = new Set([
  'restaurant', 'bar', 'cafe',
  'vet', 'pharmacy',
  'accommodation', 'travel', 'camping',
  'funeral', 'grooming', 'hotel_care',
  'supplies', 'playground',
]);

// ── JSON 파싱 헬퍼 ──
function safeParseJson(str: string, fallback: unknown): unknown {
  if (!str || str === '') return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// ── 밀리초 타임스탬프 → ISO 문자열 ──
function msToIso(ms: number): string {
  if (!ms || ms <= 0) return new Date().toISOString();
  return new Date(ms).toISOString();
}

// ── 변환 함수 ──
function transformPlace(row: SQLitePlace) {
  // category/sub_category 유효성 확인
  if (!VALID_CATEGORIES.has(row.category)) {
    return null; // 스킵
  }
  if (!VALID_SUB_CATEGORIES.has(row.sub_category)) {
    return null; // 스킵
  }

  return {
    // id: Supabase에서 uuid로 자동 생성 (기존 cuid는 사용 안 함)
    name: row.name,
    category: row.category,
    sub_category: row.sub_category,
    address: row.address || '',
    address_jibun: row.address_jibun || '',
    phone: row.phone || '',
    lat: row.lat,
    lng: row.lng,
    thumbnail: row.thumbnail || '',
    images: safeParseJson(row.images, []),
    tags: safeParseJson(row.tags, []),
    business_hours: safeParseJson(row.business_hours, {}),
    access_method: row.access_method || '',
    small_dog: Boolean(row.small_dog),
    medium_dog: Boolean(row.medium_dog),
    large_dog: Boolean(row.large_dog),
    indoor_allowed: Boolean(row.indoor_allowed),
    pet_etiquette: safeParseJson(row.pet_etiquette, []),
    caution: row.caution || '',
    created_at: msToIso(row.created_at),
    updated_at: msToIso(row.updated_at),
  };
}

// ── 메인 ──
async function main() {
  console.log('🚀 마이그레이션 시작');
  console.log(`   SQLite: ${SQLITE_PATH}`);
  console.log(`   Supabase: ${supabaseUrl}`);
  console.log('');

  // 1. SQLite 연결
  const db = new Database(SQLITE_PATH, { readonly: true });
  const totalCount = (
    db.prepare('SELECT COUNT(*) as cnt FROM places').get() as { cnt: number }
  ).cnt;
  console.log(`📊 SQLite places 테이블: ${totalCount.toLocaleString()}건`);

  // 2. 전체 데이터 읽기
  const rows = db.prepare('SELECT * FROM places').all() as SQLitePlace[];
  db.close();

  // 3. 변환
  const transformed = [];
  let skipped = 0;

  for (const row of rows) {
    const place = transformPlace(row);
    if (place) {
      transformed.push(place);
    } else {
      skipped++;
    }
  }

  console.log(`✅ 변환 완료: ${transformed.length.toLocaleString()}건`);
  if (skipped > 0) {
    console.log(`⚠️  스킵됨 (유효하지 않은 카테고리): ${skipped}건`);
  }
  console.log('');

  // 4. 배치 삽입
  let inserted = 0;
  let errors = 0;
  const totalBatches = Math.ceil(transformed.length / BATCH_SIZE);

  for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
    const batch = transformed.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    const { data, error } = await supabase
      .from('places')
      .insert(batch)
      .select('id');

    if (error) {
      console.error(
        `❌ 배치 ${batchNum}/${totalBatches} 실패:`,
        error.message
      );
      // 개별 삽입으로 재시도
      for (const item of batch) {
        const { error: singleError } = await supabase
          .from('places')
          .insert(item);
        if (singleError) {
          errors++;
          if (errors <= 5) {
            console.error(`   개별 실패: ${item.name} - ${singleError.message}`);
          }
        } else {
          inserted++;
        }
      }
    } else {
      inserted += data?.length ?? batch.length;
    }

    // 진행률 표시
    const progress = Math.min(100, Math.round(((i + batch.length) / transformed.length) * 100));
    process.stdout.write(`\r📤 업로드 중... ${progress}% (${inserted.toLocaleString()}건 완료)`);
  }

  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 마이그레이션 완료!`);
  console.log(`   성공: ${inserted.toLocaleString()}건`);
  if (errors > 0) {
    console.log(`   실패: ${errors}건`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch((err) => {
  console.error('❌ 마이그레이션 오류:', err);
  process.exit(1);
});
