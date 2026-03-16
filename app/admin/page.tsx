import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/admin/dashboard/StatCard';
import QualityAlert from '@/components/admin/dashboard/QualityAlert';
import Link from 'next/link';
import { categories, categoryColorMap } from '@/data/categories';
import type { CategoryType } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 병렬 데이터 조회
  const [
    { count: totalPlaces },
    { count: totalReviews },
    { count: totalBookmarks },
    { count: noPhone },
    { count: noBusinessHours },
    { count: noImage },
    { count: noPetEtiquette },
    { data: recentUpdates },
  ] = await Promise.all([
    supabase.from('places').select('*', { count: 'exact', head: true }),
    supabase.from('blog_reviews').select('*', { count: 'exact', head: true }),
    supabase.from('bookmarks').select('*', { count: 'exact', head: true }),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('phone', ''),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('business_hours', {}),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('thumbnail', ''),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('pet_etiquette', '[]'),
    supabase.from('places').select('id, name, category, sub_category, updated_at').order('updated_at', { ascending: false }).limit(5),
  ]);

  // 카테고리별 집계
  const categoryCounts = await Promise.all(
    categories.map(async (cat) => {
      const { count } = await supabase.from('places').select('*', { count: 'exact', head: true }).eq('category', cat.id);
      return { id: cat.id as CategoryType, name: cat.name, icon: cat.icon, count: count ?? 0 };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">대시보드</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="전체 장소" value={totalPlaces ?? 0} icon="📍" />
        <StatCard label="전체 리뷰" value={totalReviews ?? 0} icon="💬" color="bg-blue-50 text-blue-600" />
        <StatCard label="전체 북마크" value={totalBookmarks ?? 0} icon="⭐" color="bg-yellow-50 text-yellow-600" />
        <StatCard
          label="데이터 품질 이슈"
          value={`${((noImage ?? 0) + (noPhone ?? 0) + (noBusinessHours ?? 0)).toLocaleString()}건`}
          icon="⚠️"
          color="bg-red-50 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 카테고리 분포 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">카테고리별 분포</h3>
          <div className="space-y-3">
            {categoryCounts.map((cat) => {
              const pct = totalPlaces ? Math.round((cat.count / totalPlaces) * 100) : 0;
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{cat.icon} {cat.name}</span>
                    <span className="font-medium text-gray-900">{cat.count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: categoryColorMap[cat.id],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 데이터 품질 알림 */}
        <QualityAlert
          issues={{
            noImage: noImage ?? 0,
            noBusinessHours: noBusinessHours ?? 0,
            noPhone: noPhone ?? 0,
            noPetEtiquette: noPetEtiquette ?? 0,
          }}
        />
      </div>

      {/* 최근 수정된 장소 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">최근 수정된 장소</h3>
          <Link href="/admin/places" className="text-xs text-amber-600 hover:text-amber-700">
            전체 보기 →
          </Link>
        </div>
        {recentUpdates && recentUpdates.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentUpdates.map((place) => (
              <Link
                key={place.id}
                href={`/admin/places/${place.id}`}
                className="flex items-center justify-between py-3 sm:py-2.5 hover:bg-gray-50 active:bg-gray-100 -mx-2 px-2 rounded transition-colors"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{place.name}</p>
                  <p className="text-xs text-gray-500">{place.category} / {place.sub_category}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(place.updated_at).toLocaleDateString('ko-KR')}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">최근 수정된 장소가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
