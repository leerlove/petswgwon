import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { supabase } = auth;

  // 병렬 쿼리
  const [
    { count: totalPlaces },
    { count: totalReviews },
    { count: totalBookmarks },
    { count: noPhone },
    { count: noBusinessHours },
    { count: noImage },
    { count: noPetEtiquette },
    { data: recentUpdates },
    { data: categoryDist },
  ] = await Promise.all([
    supabase.from('places').select('*', { count: 'exact', head: true }),
    supabase.from('blog_reviews').select('*', { count: 'exact', head: true }),
    supabase.from('bookmarks').select('*', { count: 'exact', head: true }),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('phone', ''),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('business_hours', {}),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('thumbnail', ''),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('pet_etiquette', '[]'),
    supabase.from('places').select('id, name, category, updated_at').order('updated_at', { ascending: false }).limit(5),
    supabase.rpc('get_category_distribution').select('*'),
  ]);

  // rpc가 없으면 fallback
  let categoryDistribution = categoryDist;
  if (!categoryDistribution) {
    // 카테고리별 집계 (rpc 없을 때 수동)
    const categories = ['food_beverage', 'medical_health', 'accommodation_travel', 'pet_service', 'play_shopping'];
    const counts = await Promise.all(
      categories.map(async (cat) => {
        const { count } = await supabase.from('places').select('*', { count: 'exact', head: true }).eq('category', cat);
        return { category: cat, count: count ?? 0 };
      })
    );
    categoryDistribution = counts;
  }

  return NextResponse.json({
    totalPlaces: totalPlaces ?? 0,
    totalReviews: totalReviews ?? 0,
    totalBookmarks: totalBookmarks ?? 0,
    qualityIssues: {
      noImage: noImage ?? 0,
      noBusinessHours: noBusinessHours ?? 0,
      noPhone: noPhone ?? 0,
      noPetEtiquette: noPetEtiquette ?? 0,
    },
    categoryDistribution,
    recentUpdates: recentUpdates ?? [],
  });
}
