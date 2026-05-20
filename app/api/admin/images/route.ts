import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import convertHeic from 'heic-convert';
import { requireAdmin } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'heif'];
const HEIC_EXTS = ['heic', 'heif'];
const MAX_BYTES = 25 * 1024 * 1024; // 25MB server-side guard
const MAX_EDGE = 1920; // longest-edge cap
const WEBP_QUALITY = 80;

/**
 * POST - 이미지 업로드 (서버측 최적화)
 * FormData: file, entityId (UUID)
 * 처리: 포맷 검증 → (HEIC면 JPEG 디코딩) → sharp WebP 변환/리사이즈 → 저장
 * 저장 경로: place-image/{entityId}/{timestamp}-{random}.webp
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const entityId = formData.get('entityId') as string;

  if (!file || !entityId) {
    return NextResponse.json({ error: 'file과 entityId가 필요합니다' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const isImageMime = file.type.startsWith('image/');
  if (!isImageMime && !ALLOWED_EXTS.includes(ext)) {
    return NextResponse.json(
      { error: `지원하지 않는 형식입니다. 허용: ${ALLOWED_EXTS.join(', ')}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: '파일 크기는 25MB 이하만 가능합니다.' }, { status: 400 });
  }

  let inputBuffer = Buffer.from(await file.arrayBuffer());

  // HEIC/HEIF는 sharp(Vercel 빌드)가 디코딩 못 하므로 먼저 JPEG로 변환
  const isHeic = HEIC_EXTS.includes(ext) || file.type === 'image/heic' || file.type === 'image/heif';
  if (isHeic) {
    try {
      const out = await convertHeic({ buffer: inputBuffer, format: 'JPEG', quality: 0.92 });
      inputBuffer = Buffer.from(out);
    } catch {
      return NextResponse.json({ error: 'HEIC 이미지를 변환하지 못했습니다.' }, { status: 422 });
    }
  }

  let optimized: Buffer;
  try {
    optimized = await sharp(inputBuffer, { animated: true })
      .rotate() // EXIF 방향 보정
      .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: '이미지 처리에 실패했습니다.' }, { status: 422 });
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const filePath = `${entityId}/${fileName}`;

  const { error } = await supabase.storage
    .from('place-image')
    .upload(filePath, optimized, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ path: filePath });
}

/**
 * DELETE - 이미지 삭제
 * Body: { path: string }
 */
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  const { path } = await request.json();

  if (!path) {
    return NextResponse.json({ error: 'path가 필요합니다' }, { status: 400 });
  }

  const { error } = await supabase.storage
    .from('place-image')
    .remove([path]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * GET - 엔티티의 이미지 목록 조회
 * Query: entityId
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  const entityId = request.nextUrl.searchParams.get('entityId');

  if (!entityId) {
    return NextResponse.json({ error: 'entityId가 필요합니다' }, { status: 400 });
  }

  const { data, error } = await supabase.storage
    .from('place-image')
    .list(entityId, { limit: 100, sortBy: { column: 'created_at', order: 'asc' } });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const files = (data ?? [])
    .filter((f) => f.name !== '.emptyFolderPlaceholder')
    .map((f) => ({
      name: f.name,
      path: `${entityId}/${f.name}`,
      size: f.metadata?.size ?? 0,
      created_at: f.created_at,
    }));

  return NextResponse.json({ files });
}
