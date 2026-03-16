'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { categories } from '@/data/categories';

interface PlaceRow {
  id: string;
  name: string;
  category: string;
  sub_category: string;
  address: string;
  phone: string;
  thumbnail: string;
  updated_at: string;
}

interface PlacesResponse {
  places: PlaceRow[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminPlacesPage() {
  const [data, setData] = useState<PlacesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [quality, setQuality] = useState('');

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '50');
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (quality) params.set('quality', quality);

    const res = await fetch(`/api/admin/places?${params}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, [page, search, category, quality]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPlaces();
  };

  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name ?? id;
  };

  const getSubName = (catId: string, subId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat?.subCategories.find((s) => s.id === subId)?.name ?? subId;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">장소 관리</h1>
        <Link
          href="/admin/places/new"
          className="bg-amber-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          + 새 장소
        </Link>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-3">
          <input
            type="text"
            placeholder="이름 또는 주소 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:flex-1 sm:min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 outline-none"
          />
          <div className="flex gap-2 sm:gap-3">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">전체 카테고리</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            <select
              value={quality}
              onChange={(e) => { setQuality(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">전체 품질</option>
              <option value="no_image">이미지 없음</option>
              <option value="no_hours">영업시간 없음</option>
              <option value="no_phone">전화번호 없음</option>
              <option value="no_etiquette">펫에티켓 없음</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            검색
          </button>
        </form>
      </div>

      {/* 리스트 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">로딩 중...</div>
        ) : !data || data.places.length === 0 ? (
          <div className="p-8 text-center text-gray-400">결과가 없습니다</div>
        ) : (
          <>
            {/* 모바일 카드 뷰 */}
            <div className="md:hidden divide-y divide-gray-100">
              {data.places.map((place) => (
                <Link
                  key={place.id}
                  href={`/admin/places/${place.id}`}
                  className="block px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-amber-700 truncate">{place.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getCategoryName(place.category)} · {getSubName(place.category, place.sub_category)}
                      </p>
                      {place.address && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{place.address}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex gap-0.5">
                        <span title="이미지">{place.thumbnail ? '🟢' : '🔴'}</span>
                        <span title="전화번호">{place.phone ? '🟢' : '🟠'}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">
                        {new Date(place.updated_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 데스크톱 테이블 뷰 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">이름</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">카테고리</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">주소</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">전화</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 w-16">품질</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">수정일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.places.map((place) => (
                    <tr key={place.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/places/${place.id}`} className="text-amber-700 font-medium hover:underline">
                          {place.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {getCategoryName(place.category)} / {getSubName(place.category, place.sub_category)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell truncate max-w-[200px]">
                        {place.address}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{place.phone || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <span title="이미지">{place.thumbnail ? '🟢' : '🔴'}</span>
                          <span title="전화번호">{place.phone ? '🟢' : '🟠'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(place.updated_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                총 {data.total.toLocaleString()}건 중 {((data.page - 1) * 50) + 1}-{Math.min(data.page * 50, data.total)}건
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-30 hover:bg-gray-50"
                >
                  이전
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  {data.page} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                  disabled={page >= data.totalPages}
                  className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-30 hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
