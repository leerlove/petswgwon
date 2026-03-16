import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

// 매거진 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  const { data: post, error } = await supabase
    .from('magazine_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  // 연결된 장소 조회
  const { data: links } = await supabase
    .from('magazine_post_places')
    .select('place_id, sort_order, places(id, name, address, category, sub_category, tags)')
    .eq('post_id', id)
    .order('sort_order');

  return NextResponse.json({ post, places: links ?? [] });
}

// 매거진 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  const body = await request.json();
  const { place_ids, ...postData } = body;

  const { data: post, error } = await supabase
    .from('magazine_posts')
    .update(postData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 장소 연결 갱신
  if (place_ids !== undefined) {
    await supabase.from('magazine_post_places').delete().eq('post_id', id);
    if (place_ids.length > 0) {
      const links = place_ids.map((pid: string, i: number) => ({
        post_id: id,
        place_id: pid,
        sort_order: i,
      }));
      await supabase.from('magazine_post_places').insert(links);
    }
  }

  return NextResponse.json({ post });
}

// 매거진 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  const { error } = await supabase
    .from('magazine_posts')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
