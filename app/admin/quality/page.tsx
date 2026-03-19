'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface QualitySummary {
  field: string;
  total: number;
  filled: number;
  empty: number;
  fillRate: number;
}

const FIELD_LABELS: Record<string, string> = {
  thumbnail: '이미지',
  phone: '전화번호',
  business_hours: '영업시간',
  pet_etiquette: '펫 에티켓',
  images: '이미지 목록',
};

export default function AdminQualityPage() {
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<QualitySummary[]>([]);
  const [selectedField, setSelectedField] = useState(searchParams.get('field') ?? '');
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedField) params.set('field', selectedField);
    fetch(`/api/admin/quality?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary ?? []);
        setPlaces(data.places ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedField]);

  if (loading) return <div className="p-8 text-center text-gray-400">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">데이터 품질</h1>

      {/* 품질 바 차트 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">필드별 채움율</h3>
        {summary.map((s) => (
          <button
            key={s.field}
            onClick={() => setSelectedField(s.field === selectedField ? '' : s.field)}
            className={`w-full text-left ${s.field === selectedField ? 'ring-2 ring-amber-300 rounded-lg p-2 -m-2' : ''}`}
          >
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{FIELD_LABELS[s.field] ?? s.field}</span>
              <span className="font-medium">{Math.round(s.fillRate * 100)}% ({s.filled.toLocaleString()}/{s.total.toLocaleString()})</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${s.fillRate * 100}%`,
                  backgroundColor: s.fillRate > 0.8 ? '#22C55E' : s.fillRate > 0.5 ? '#F59E0B' : '#EF4444',
                }}
              />
            </div>
          </button>
        ))}
      </div>

      {/* 선택된 필드의 빈 장소 목록 */}
      {selectedField && places.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">
              {FIELD_LABELS[selectedField]} 없는 장소
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {places.map((p: any) => (
              <Link
                key={p.id}
                href={`/admin/places/${p.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.address}</p>
                </div>
                <span className="text-xs text-gray-400">수정 →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
