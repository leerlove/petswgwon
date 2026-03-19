/**
 * JSON → Supabase 업로드 스크립트
 *
 * places-data.json 파일을 읽어서 Supabase에 배치 삽입합니다.
 * 로컬 머신에서 실행하세요.
 *
 * 사용법:
 *   node scripts/upload-to-supabase.mjs
 *
 * 필요:
 *   - .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 설정
 *   - scripts/places-data.json 파일
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
      const [key, ...rest] = trimmed.split('=');
      process.env[key.trim()] = rest.join('=').trim();
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase URL 또는 키가 없습니다. .env.local을 확인하세요.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BATCH_SIZE = 500;
const JSON_PATH = resolve(__dirname, 'places-data.json');

async function main() {
  console.log('🚀 Supabase 업로드 시작');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log('');

  if (!existsSync(JSON_PATH)) {
    console.error(`❌ ${JSON_PATH} 파일을 찾을 수 없습니다.`);
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(JSON_PATH, 'utf-8'));
  console.log(`📊 전체 데이터: ${data.length.toLocaleString()}건`);

  // 기존 데이터 확인
  const { count } = await supabase.from('places').select('id', { count: 'exact', head: true });
  if (count && count > 0) {
    console.log(`⚠️  Supabase에 이미 ${count}건의 데이터가 있습니다.`);
    console.log(`   중복 삽입될 수 있으니 확인 후 진행하세요.`);
    console.log('   3초 후 시작합니다...');
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log('');

  let inserted = 0;
  let errors = 0;
  const totalBatches = Math.ceil(data.length / BATCH_SIZE);

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    const { error } = await supabase.from('places').insert(batch);

    if (error) {
      console.error(`\n❌ 배치 ${batchNum}/${totalBatches} 실패: ${error.message}`);
      // 개별 삽입 재시도
      for (const item of batch) {
        const { error: e } = await supabase.from('places').insert(item);
        if (e) {
          errors++;
          if (errors <= 5) console.error(`   ${item.name}: ${e.message}`);
        } else {
          inserted++;
        }
      }
    } else {
      inserted += batch.length;
    }

    const pct = Math.min(100, Math.round((i + batch.length) / data.length * 100));
    process.stdout.write(`\r📤 업로드 중... ${pct}% (${inserted.toLocaleString()}건)`);
  }

  console.log('\n');
  console.log('━'.repeat(36));
  console.log(`✅ 업로드 완료!`);
  console.log(`   성공: ${inserted.toLocaleString()}건`);
  if (errors) console.log(`   실패: ${errors}건`);
  console.log('━'.repeat(36));
}

main().catch(err => {
  console.error('❌ 오류:', err);
  process.exit(1);
});
