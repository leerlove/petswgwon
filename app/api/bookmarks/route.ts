import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const ANONYMOUS_USER = '00000000-0000-0000-0000-000000000000';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = await createClient();
  const placeId = body.placeId;

  // 기존 북마크 확인
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('place_id', placeId)
    .eq('user_id', ANONYMOUS_USER)
    .maybeSingle();

  if (existing) {
    // 이미 있으면 삭제 (토글)
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    return NextResponse.json({ bookmarked: false, placeId });
  }

  // 없으면 추가
  const { error } = await supabase
    .from('bookmarks')
    .insert({ place_id: placeId, user_id: ANONYMOUS_USER });

  if (error) {
    console.error('[API] bookmark error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookmarked: true, placeId });
}
