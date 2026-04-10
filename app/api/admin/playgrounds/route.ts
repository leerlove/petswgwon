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
  const type = sp.get('type');
  const isPublic = sp.get('is_public');
  const isUnmanned = sp.get('is_unmanned');
  const search = sp.get('search');
  const sort = sp.get('sort') ?? 'updated_at';
  const order = sp.get('order') ?? 'desc';
  const offset = (page - 1) * limit;

  let query = supabase
    .from('playgrounds')
    .select('*', { count: 'exact' });

  if (type) query = query.eq('playground_type', type);
  if (isPublic === 'true') query = query.eq('is_public', true);
  if (isUnmanned === 'true') query = query.eq('is_unmanned', true);
  if (search) query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);

  query = query
    .order(sort, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    playgrounds: data ?? [],
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
    .from('playgrounds')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
