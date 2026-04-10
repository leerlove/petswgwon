'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PLAYGROUND_TYPE_LABELS } from '@/types/playground';
import type { PlaygroundType } from '@/types/playground';

interface PlaygroundRow {
  id: string;
  name: string;
  playground_type: PlaygroundType;
  address: string;
  phone: string;
  is_unmanned: boolean;
  is_public: boolean;
  thumbnail: string;
  updated_at: string;
}

interface PlaygroundsResponse {
  playgrounds: PlaygroundRow[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminPlaygroundsPage() {
  const [data, setData] = useState<PlaygroundsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const fetchPlaygrounds = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '50');
    if (search) params.set('search', search);
    if (type) params.set('type', type);

    const res = await fetch(`/api/admin/playgrounds?${params}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, [page, search, type]);

  useEffect(() => {
    fetchPlaygrounds();
  }, [fetchPlaygrounds]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPlaygrounds();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">놀이터 관리</h1>
        <Link
          href="/admin/playgrounds/new"
          className="bg-amber-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          + 새 놀이터
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
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="w-full sm:w-auto rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">전체 분류</option>
            {Object.entries(PLAYGROUND_TYPE_LABELS).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
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
        ) : !data || data.playgrounds.length === 0 ? (
          <div className="p-8 text-center text-gray-400">결과가 없습니다</div>
        ) : (
          <>
            {/* 모바일 카드 뷰 */}
            <div className="md:hidden divide-y divide-gray-100">
              {data.playgrounds.map((pg) => (
                <Link
                  key={pg.id}
                  href={`/admin/playgrounds/${pg.id}`}
                  className="block px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-amber-700 truncate">{pg.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {PLAYGROUND_TYPE_LABELS[pg.playground_type]}
                        {pg.is_public && ' · 공공'}
                        {pg.is_unmanned && ' · 무인'}
                      </p>
                      {pg.address && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{pg.address}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(pg.updated_at).toLocaleDateString('ko-KR')}
                    </span>
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
                    <th className="text-left px-4 py-3 font-medium text-gray-600">분류</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">주소</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 w-16">공공</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600 w-16">무인</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">수정일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.playgrounds.map((pg) => (
                    <tr key={pg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/playgrounds/${pg.id}`} className="text-amber-700 font-medium hover:underline">
                          {pg.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {PLAYGROUND_TYPE_LABELS[pg.playground_type]}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell truncate max-w-[200px]">
                        {pg.address}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {pg.is_public ? '🟢' : '⚪'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {pg.is_unmanned ? '🟢' : '⚪'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(pg.updated_at).toLocaleDateString('ko-KR')}
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
