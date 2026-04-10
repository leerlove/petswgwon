import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  const isPublic = searchParams.get('is_public');
  const isUnmanned = searchParams.get('is_unmanned');
  const petSize = searchParams.get('petSize');
  const indoor = searchParams.get('indoor');

  const supabase = await createClient();

  let query = supabase
    .from('playgrounds')
    .select('*', { count: 'exact' })
    .order('name');

  if (type) query = query.eq('playground_type', type);
  if (isPublic === 'true') query = query.eq('is_public', true);
  if (isUnmanned === 'true') query = query.eq('is_unmanned', true);

  if (petSize === 'small') query = query.eq('small_dog', true);
  else if (petSize === 'medium') query = query.eq('medium_dog', true);
  else if (petSize === 'large') query = query.eq('large_dog', true);

  if (indoor === 'true') query = query.eq('indoor_allowed', true);

  const { data, error, count } = await query;

  if (error) {
    console.error('[API] playgrounds fetch error:', error.message);
    return NextResponse.json({ playgrounds: [], total: 0 }, { status: 500 });
  }

  return NextResponse.json({ playgrounds: data ?? [], total: count ?? 0 });
}
