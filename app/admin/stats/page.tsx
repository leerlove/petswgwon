import { createClient } from '@/lib/supabase/server';
import { categories, categoryColorMap } from '@/data/categories';
import type { CategoryType } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminStatsPage() {
  const supabase = await createClient();

  // 카테고리별 집계
  const categoryCounts = await Promise.all(
    categories.map(async (cat) => {
      const { count } = await supabase.from('places').select('*', { count: 'exact', head: true }).eq('category', cat.id);
      return { id: cat.id as CategoryType, name: cat.name, icon: cat.icon, count: count ?? 0 };
    })
  );

  // 서브카테고리별 집계
  const subCounts = await Promise.all(
    categories.flatMap((cat) =>
      cat.subCategories.map(async (sub) => {
        const { count } = await supabase.from('places').select('*', { count: 'exact', head: true }).eq('sub_category', sub.id);
        return { category: cat.name, sub: sub.name, count: count ?? 0 };
      })
    )
  );

  // 반려견 정책 통계
  const total = categoryCounts.reduce((sum, c) => sum + c.count, 0);
  const [{ count: largeDog }, { count: indoorAllowed }] = await Promise.all([
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('large_dog', true),
    supabase.from('places').select('*', { count: 'exact', head: true }).eq('indoor_allowed', true),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">통계</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 카테고리 분포 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">카테고리별 장소 수</h3>
          <div className="space-y-3">
            {categoryCounts.sort((a, b) => b.count - a.count).map((cat) => {
              const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
              return (
                <div key={cat.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{cat.icon} {cat.name}</span>
                    <span className="font-medium">{cat.count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: categoryColorMap[cat.id] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 반려견 정책 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">반려견 정책</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>대형견 허용</span>
                <span className="font-medium">{((largeDog ?? 0) / total * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(largeDog ?? 0) / total * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>실내 입장 허용</span>
                <span className="font-medium">{((indoorAllowed ?? 0) / total * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(indoorAllowed ?? 0) / total * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 서브카테고리 상세 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">서브카테고리별 장소 수</h3>

        {/* 모바일: 리스트 */}
        <div className="sm:hidden divide-y divide-gray-100">
          {subCounts.sort((a, b) => b.count - a.count).map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm text-gray-900">{s.sub}</p>
                <p className="text-xs text-gray-500">{s.category}</p>
              </div>
              <span className="text-sm font-medium text-gray-900">{s.count.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* 데스크톱: 테이블 */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">카테고리</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">서브카테고리</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">장소 수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subCounts.sort((a, b) => b.count - a.count).map((s, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 text-gray-600">{s.category}</td>
                  <td className="px-4 py-2">{s.sub}</td>
                  <td className="px-4 py-2 text-right font-medium">{s.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
