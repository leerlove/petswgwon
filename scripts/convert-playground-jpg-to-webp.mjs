/**
 * 놀이터(playgrounds) 이미지 중 webp가 아닌(jpg/png/gif) 원본을 webp로 변환해 재저장하고,
 * thumbnail / images / sections 의 경로 참조를 함께 갱신한다.
 *
 * 1단계(기본): 변환 + 업로드 + DB 경로 갱신 (원본은 보존 — 비파괴)
 * 2단계: 검증 후 `--delete-originals` 로 원본 jpg/png/gif 객체 삭제
 *
 * 사용: node scripts/convert-playground-jpg-to-webp.mjs [--delete-originals] [--dry-run]
 * 환경: .env.local 의 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import fs from 'node:fs';

const BUCKET = 'place-image';
const MAX_EDGE = 1920;
const WEBP_QUALITY = 80;
const DELETE_ORIGINALS = process.argv.includes('--delete-originals');
const DRY_RUN = process.argv.includes('--dry-run');

// .env.local 로드
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error('env 누락'); process.exit(1); }

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const isConvertible = (p) => typeof p === 'string' && /\.(jpe?g|png|gif)$/i.test(p);
const toWebpKey = (p) => p.replace(/\.(jpe?g|png|gif)$/i, '.webp');
const remap = (p, map) => (map.has(p) ? map.get(p) : p);

async function convertOne(key) {
  const { data, error } = await sb.storage.from(BUCKET).download(key);
  if (error) throw new Error(`download ${key}: ${error.message}`);
  const input = Buffer.from(await data.arrayBuffer());
  const out = await sharp(input, { animated: true })
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  const newKey = toWebpKey(key);
  if (!DRY_RUN) {
    const { error: upErr } = await sb.storage.from(BUCKET).upload(newKey, out, { contentType: 'image/webp', upsert: true });
    if (upErr) throw new Error(`upload ${newKey}: ${upErr.message}`);
  }
  return { newKey, inBytes: input.length, outBytes: out.length };
}

async function main() {
  const { data: pgs, error } = await sb.from('playgrounds').select('id,name,thumbnail,images,sections');
  if (error) { console.error(error.message); process.exit(1); }

  let totalConverted = 0, totalIn = 0, totalOut = 0, touchedPgs = 0;
  const allOriginals = [];

  for (const pg of pgs) {
    const images = Array.isArray(pg.images) ? pg.images : [];
    const sections = Array.isArray(pg.sections) ? pg.sections : [];

    // 변환 대상 경로 수집 (thumbnail + images + sections.items.images)
    const sources = new Set();
    if (isConvertible(pg.thumbnail)) sources.add(pg.thumbnail);
    for (const p of images) if (isConvertible(p)) sources.add(p);
    for (const s of sections) for (const it of (s.items ?? [])) for (const p of (it.images ?? [])) if (isConvertible(p)) sources.add(p);
    if (sources.size === 0) continue;

    touchedPgs++;
    console.log(`\n[${pg.name}] 변환 대상 ${sources.size}개`);
    const map = new Map();
    for (const key of sources) {
      try {
        const { newKey, inBytes, outBytes } = await convertOne(key);
        map.set(key, newKey);
        allOriginals.push(key);
        totalConverted++; totalIn += inBytes; totalOut += outBytes;
        console.log(`  ✓ ${key} → ${newKey} (${(inBytes/1024).toFixed(0)}KB → ${(outBytes/1024).toFixed(0)}KB)`);
      } catch (e) { console.error(`  ✗ ${key}: ${e.message}`); }
    }

    // DB 경로 갱신
    const newThumbnail = remap(pg.thumbnail, map);
    const newImages = images.map((p) => remap(p, map));
    const newSections = sections.map((s) => ({
      ...s,
      items: (s.items ?? []).map((it) => ({ ...it, images: (it.images ?? []).map((p) => remap(p, map)) })),
    }));
    if (!DRY_RUN) {
      const { error: updErr } = await sb.from('playgrounds')
        .update({ thumbnail: newThumbnail, images: newImages, sections: newSections })
        .eq('id', pg.id);
      if (updErr) console.error(`  DB update 실패: ${updErr.message}`);
      else console.log(`  DB 갱신 완료`);
    }
  }

  console.log(`\n=== 요약 ===`);
  console.log(`놀이터 ${touchedPgs}곳 / 이미지 ${totalConverted}개 변환`);
  console.log(`용량 ${(totalIn/1024/1024).toFixed(1)}MB → ${(totalOut/1024/1024).toFixed(1)}MB`);

  if (DELETE_ORIGINALS && !DRY_RUN && allOriginals.length > 0) {
    console.log(`\n원본 ${allOriginals.length}개 삭제 중...`);
    // 100개씩 배치 삭제
    for (let i = 0; i < allOriginals.length; i += 100) {
      const batch = allOriginals.slice(i, i + 100);
      const { error: delErr } = await sb.storage.from(BUCKET).remove(batch);
      if (delErr) console.error(`삭제 실패: ${delErr.message}`);
    }
    console.log('원본 삭제 완료');
  } else if (!DELETE_ORIGINALS) {
    console.log('\n원본 보존됨. 검증 후 --delete-originals 로 재실행하면 원본 jpg/png/gif 삭제.');
  }
}

main();
