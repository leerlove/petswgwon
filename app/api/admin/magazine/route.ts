import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

// 매거진 목록 조회
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  const sp = request.nextUrl.searchParams;
  const page = parseInt(sp.get('page') ?? '1', 10);
  const limit = parseInt(sp.get('limit') ?? '50', 10);
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('magazine_posts')
    .select('*', { count: 'exact' })
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    posts: data,
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}

// 매거진 생성
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  const body = await request.json();
  const { place_ids, ...postData } = body;

  const { data: post, error } = await supabase
    .from('magazine_posts')
    .insert(postData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 추천 장소 연결
  if (place_ids && place_ids.length > 0) {
    const links = place_ids.map((pid: string, i: number) => ({
      post_id: post.id,
      place_id: pid,
      sort_order: i,
    }));
    await supabase.from('magazine_post_places').insert(links);
  }

  return NextResponse.json({ post }, { status: 201 });
}
