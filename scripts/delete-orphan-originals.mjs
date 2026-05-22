/**
 * webp 변환 후 DB에서 더 이상 참조되지 않는 원본(jpg/png/gif) 객체를 삭제한다.
 * convert-playground-jpg-to-webp.mjs 실행·검증 후에만 사용.
 * 대상: 변환된 7개 놀이터 폴더의 non-webp 객체.
 * 사용: node scripts/delete-orphan-originals.mjs [--dry-run]
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const BUCKET = 'place-image';
const DRY_RUN = process.argv.includes('--dry-run');
const FOLDERS = [
  '546ded00-e5d6-4f01-afe5-772e0ff49f0a', // 교원 키녹 호텔
  '81379b3b-9340-4ebf-a54e-a40ab7f85ad7', // 고양시 서구 반려동물공원
  'a6fe3fed-98fe-408a-a12d-e52065483e0f', // 화성시 동탄여울공원
  '79f0f06e-5b98-4749-a90b-dea22fa81e7d', // 화성시 백미힐링마당
  'a0b1a3ca-6e4e-4f7d-b446-fbb63c7ea67b', // 고양시 덕수공원
  '2a3b3254-c9a6-437e-9071-f0e4f72771de', // 동작반려견공원
  '6b0939c2-3407-4242-baa2-faed3796d053', // 탑골생태공원
];

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const main = async () => {
  const toDelete = [];
  for (const folder of FOLDERS) {
    const { data, error } = await sb.storage.from(BUCKET).list(folder, { limit: 1000 });
    if (error) { console.error(`list ${folder}: ${error.message}`); continue;
    }
    for (const obj of data) {
      if (!/\.webp$/i.test(obj.name)) toDelete.push(`${folder}/${obj.name}`);
    }
  }
  console.log(`삭제 대상 non-webp: ${toDelete.length}개`);
  if (DRY_RUN) { toDelete.forEach((k) => console.log('  ' + k)); return; }
  for (let i = 0; i < toDelete.length; i += 100) {
    const { error } = await sb.storage.from(BUCKET).remove(toDelete.slice(i, i + 100));
    if (error) console.error(`remove: ${error.message}`);
  }
  console.log(`삭제 완료: ${toDelete.length}개`);
};
main();
