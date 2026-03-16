import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  const sp = request.nextUrl.searchParams;
  const page = parseInt(sp.get('page') ?? '1', 10);
  const limit = parseInt(sp.get('limit') ?? '50', 10);
  const category = sp.get('category');
  const subCategory = sp.get('sub_category');
  const search = sp.get('search');
  const quality = sp.get('quality');
  const sort = sp.get('sort') ?? 'updated_at';
  const order = sp.get('order') ?? 'desc';
  const offset = (page - 1) * limit;

  let query = supabase
    .from('places')
    .select('*', { count: 'exact' });

  if (category) query = query.eq('category', category);
  if (subCategory) query = query.eq('sub_category', subCategory);
  if (search) query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);

  // 품질 필터
  if (quality === 'no_image') query = query.eq('thumbnail', '');
  else if (quality === 'no_hours') query = query.eq('business_hours', {});
  else if (quality === 'no_phone') query = query.eq('phone', '');
  else if (quality === 'no_etiquette') query = query.eq('pet_etiquette', '[]');

  query = query
    .order(sort, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    places: data ?? [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  const body = await request.json();

  const { data, error } = await supabase
    .from('places')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
