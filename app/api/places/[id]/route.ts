import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transformPlace } from '@/lib/supabase/transformPlace';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // 장소 조회
  const { data: place, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !place) {
    return NextResponse.json({ error: 'Place not found' }, { status: 404 });
  }

  // 리뷰 조회
  const { data: reviews } = await supabase
    .from('blog_reviews')
    .select('*')
    .eq('place_id', id)
    .order('created_at', { ascending: false });

  // 근처 장소 조회 (같은 카테고리, 거리순 5개)
  const RADIUS = 0.05; // 약 5km
  const { data: nearbyRaw } = await supabase
    .from('places')
    .select('id, name, thumbnail, lat, lng')
    .neq('id', id)
    .gte('lat', place.lat - RADIUS)
    .lte('lat', place.lat + RADIUS)
    .gte('lng', place.lng - RADIUS)
    .lte('lng', place.lng + RADIUS)
    .limit(5);

  const nearby = (nearbyRaw ?? []).map((n) => {
    const dLat = n.lat - place.lat;
    const dLng = n.lng - place.lng;
    const distance_km = Math.round(
      Math.sqrt(dLat * dLat + dLng * dLng) * 111 * 10
    ) / 10;
    return { id: n.id, name: n.name, thumbnail: n.thumbnail ?? '', distance_km };
  });

  return NextResponse.json({
    place: transformPlace(place),
    reviews: reviews ?? [],
    nearby,
  });
}
