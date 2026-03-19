import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('magazine_posts')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 각 포스트의 추천 장소 조회
  const postsWithPlaces = await Promise.all(
    (posts ?? []).map(async (post) => {
      const { data: links } = await supabase
        .from('magazine_post_places')
        .select('sort_order, places(id, name, address, category, sub_category, tags, phone, lat, lng)')
        .eq('post_id', post.id)
        .order('sort_order');

      const places = (links ?? []).map((l: any) => ({
        ...l.places,
        sort_order: l.sort_order,
      }));

      return { ...post, places };
    })
  );

  return NextResponse.json({ posts: postsWithPlaces });
}
