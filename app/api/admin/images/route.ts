import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

/**
 * POST - 이미지 업로드
 * FormData: file, entityId (UUID), setThumbnail? (boolean)
 * 저장 경로: place-image/{entityId}/{timestamp}-{random}.{ext}
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

  const ext = file.name.split('.').pop() || 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `${entityId}/${fileName}`;

  const { error } = await supabase.storage
    .from('place-image')
    .upload(filePath, file, {
      contentType: file.type,
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
