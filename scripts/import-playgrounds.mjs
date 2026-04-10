/**
 * 놀이터 엑셀 → Supabase 업로드 스크립트
 *
 * data/petpass/놀이터 정보.xlsx 파일을 읽어서
 * 카카오 지오코딩 후 Supabase playgrounds 테이블에 삽입합니다.
 *
 * 사용법:
 *   node scripts/import-playgrounds.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// .env.local 로드
const envPath = resolve(projectRoot, '.env.local');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const eqIdx = trimmed.indexOf('=');
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase URL 또는 키가 없습니다. .env.local을 확인하세요.');
  process.exit(1);
}
if (!KAKAO_KEY) {
  console.error('❌ 카카오 API 키가 없습니다. .env.local을 확인하세요.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// xlsx 동적 로드
let XLSX;
try {
  XLSX = (await import('xlsx')).default ?? (await import('xlsx'));
} catch {
  console.error('❌ xlsx 모듈이 없습니다. npm install xlsx --no-save 실행 후 재시도하세요.');
  process.exit(1);
}

const EXCEL_PATH = resolve(projectRoot, 'data/petpass/놀이터 정보.xlsx');

// 분류 → playground_type 매핑
const TYPE_MAP = {
  '놀이터': 'playground',
  '카페': 'cafe',
  '호텔': 'hotel',
  '대덕구청': 'government',
};

// 운영시간 파싱
function parseBusinessHours(raw) {
  if (!raw || !raw.trim()) return {};
  const text = raw.trim();

  // "예약운영" 같은 단순 텍스트
  if (!text.includes('~') && !text.includes('-')) {
    return { hours: text };
  }

  // 시간 부분과 휴무 부분 분리
  // 예: "09:00 ~ 20:00 (동절기 12~2월 휴장) / 매월 마지막주 월요일"
  const slashIdx = text.indexOf('/');
  let hoursPart = text;
  let closedDays = '';

  if (slashIdx !== -1) {
    hoursPart = text.slice(0, slashIdx).trim();
    closedDays = text.slice(slashIdx + 1).trim();
  }

  // 괄호 안의 내용을 closedDays에 추가
  const parenMatch = hoursPart.match(/\(([^)]+)\)/);
  if (parenMatch) {
    closedDays = closedDays ? `${parenMatch[1]}, ${closedDays}` : parenMatch[1];
    hoursPart = hoursPart.replace(/\s*\([^)]+\)/, '').trim();
  }

  const result = {};
  if (hoursPart) result.hours = hoursPart;
  if (closedDays) result.closedDays = closedDays;
  return result;
}

// 카카오 지오코딩
async function geocode(address) {
  if (!address || !address.trim()) return { lat: 0, lng: 0 };

  try {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
    });
    const data = await res.json();

    if (data.documents && data.documents.length > 0) {
      const doc = data.documents[0];
      return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
    }

    // 주소 검색 실패 시 키워드 검색 시도
    const url2 = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(address)}`;
    const res2 = await fetch(url2, {
      headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
    });
    const data2 = await res2.json();

    if (data2.documents && data2.documents.length > 0) {
      const doc = data2.documents[0];
      return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
    }
  } catch (err) {
    console.error(`   지오코딩 실패 (${address}): ${err.message}`);
  }

  return { lat: 0, lng: 0 };
}

async function main() {
  console.log('🚀 놀이터 데이터 임포트 시작');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log('');

  if (!existsSync(EXCEL_PATH)) {
    console.error(`❌ ${EXCEL_PATH} 파일을 찾을 수 없습니다.`);
    process.exit(1);
  }

  // 엑셀 파싱
  const wb = XLSX.readFile(EXCEL_PATH);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  // 빈 행 필터링
  const validRows = rows.filter(r => r['놀이터명'] && r['놀이터명'].toString().trim());
  console.log(`📊 유효 데이터: ${validRows.length}건`);
  console.log('');

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < validRows.length; i++) {
    const row = validRows[i];
    const name = (row['놀이터명'] || '').toString().trim();
    const address = (row['주소'] || '').toString().trim();

    // 중복 체크
    const { data: existing } = await supabase
      .from('playgrounds')
      .select('id')
      .eq('name', name)
      .eq('address', address)
      .limit(1);

    if (existing && existing.length > 0) {
      skipped++;
      process.stdout.write(`\r⏭️  ${i + 1}/${validRows.length} (건너뜀: ${name})`);
      continue;
    }

    // 지오코딩
    const coords = await geocode(address);
    if (coords.lat === 0 && coords.lng === 0) {
      console.log(`\n⚠️  좌표 변환 실패: ${name} (${address})`);
    }

    // 분류 매핑
    const rawType = (row['분류'] || '').toString().trim();
    const playgroundType = TYPE_MAP[rawType] || 'other';

    const record = {
      name,
      playground_type: playgroundType,
      address,
      phone: (row['연락처'] || '').toString().trim(),
      lat: coords.lat,
      lng: coords.lng,
      business_hours: parseBusinessHours((row['운영시간'] || '').toString()),
      is_unmanned: row['무인'] === 1 || row['무인'] === '1',
      is_public: row['공공'] === 1 || row['공공'] === '1',
      instagram: (row['인스타'] || '').toString().trim(),
      tags: [],
      thumbnail: '',
      images: [],
    };

    const { error } = await supabase.from('playgrounds').insert(record);

    if (error) {
      errors++;
      console.error(`\n❌ 삽입 실패 (${name}): ${error.message}`);
    } else {
      inserted++;
    }

    process.stdout.write(`\r📤 임포트 중... ${i + 1}/${validRows.length} (성공: ${inserted}, 실패: ${errors})`);

    // API 호출 제한 방지
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n');
  console.log('━'.repeat(36));
  console.log('✅ 임포트 완료!');
  console.log(`   성공: ${inserted}건`);
  if (skipped) console.log(`   건너뜀(중복): ${skipped}건`);
  if (errors) console.log(`   실패: ${errors}건`);
  console.log('━'.repeat(36));
}

main().catch(err => {
  console.error('❌ 오류:', err);
  process.exit(1);
});
