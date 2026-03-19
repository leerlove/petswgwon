import Link from 'next/link';

interface QualityIssues {
  noImage: number;
  noBusinessHours: number;
  noPhone: number;
  noPetEtiquette: number;
}

export default function QualityAlert({ issues }: { issues: QualityIssues }) {
  const items = [
    { label: '이미지 없음', count: issues.noImage, field: 'thumbnail' },
    { label: '영업시간 없음', count: issues.noBusinessHours, field: 'business_hours' },
    { label: '전화번호 없음', count: issues.noPhone, field: 'phone' },
    { label: '펫 에티켓 없음', count: issues.noPetEtiquette, field: 'pet_etiquette' },
  ].filter((item) => item.count > 0);

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">데이터 품질 알림</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.field}
            href={`/admin/quality?field=${item.field}`}
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <span className="text-sm text-gray-600 group-hover:text-gray-900">{item.label}</span>
            <span className="text-sm font-medium text-red-500">{item.count.toLocaleString()}건</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
