import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transformPlace } from '@/lib/supabase/transformPlace';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  const category = request.nextUrl.searchParams.get('category');

  const supabase = await createClient();

  if (!q) {
    let query = supabase.from('places').select('*').limit(100).order('name');
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    const { data } = await query;
    return NextResponse.json((data ?? []).map(transformPlace));
  }

  // ilike로 이름/주소 검색
  let query = supabase
    .from('places')
    .select('*')
    .or(`name.ilike.%${q}%,address.ilike.%${q}%`)
    .limit(100)
    .order('name');

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[API] search error:', error.message);
    return NextResponse.json([]);
  }

  return NextResponse.json((data ?? []).map(transformPlace));
}
