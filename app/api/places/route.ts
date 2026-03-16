import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transformPlace } from '@/lib/supabase/transformPlace';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');
  const subCategory = searchParams.get('sub_category');
  const swLat = searchParams.get('swLat');
  const swLng = searchParams.get('swLng');
  const neLat = searchParams.get('neLat');
  const neLng = searchParams.get('neLng');
  const petSize = searchParams.get('petSize');
  const indoor = searchParams.get('indoor');
  const limit = parseInt(searchParams.get('limit') ?? '1000', 10);

  const supabase = await createClient();

  let query = supabase
    .from('places')
    .select('*', { count: 'exact' })
    .limit(limit)
    .order('name');

  if (category) {
    query = query.eq('category', category);
  }
  if (subCategory) {
    query = query.eq('sub_category', subCategory);
  }

  if (swLat && swLng && neLat && neLng) {
    query = query
      .gte('lat', parseFloat(swLat))
      .lte('lat', parseFloat(neLat))
      .gte('lng', parseFloat(swLng))
      .lte('lng', parseFloat(neLng));
  }

  if (petSize === 'small') query = query.eq('small_dog', true);
  else if (petSize === 'medium') query = query.eq('medium_dog', true);
  else if (petSize === 'large') query = query.eq('large_dog', true);

  if (indoor === 'true') query = query.eq('indoor_allowed', true);
  else if (indoor === 'false') query = query.eq('indoor_allowed', false);

  const { data, error, count } = await query;

  if (error) {
    console.error('[API] places fetch error:', error.message);
    return NextResponse.json({ places: [], total: 0 }, { status: 500 });
  }

  const places = (data ?? []).map(transformPlace);
  return NextResponse.json({ places, total: count ?? places.length });
}
