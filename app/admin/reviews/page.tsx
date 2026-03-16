'use client';

import { useEffect, useState } from 'react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 리뷰는 현재 0건이므로 간단한 구현
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">리뷰 관리</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        {loading ? (
          <p className="text-gray-400">로딩 중...</p>
        ) : reviews.length === 0 ? (
          <div>
            <p className="text-gray-400 mb-2">등록된 리뷰가 없습니다</p>
            <p className="text-xs text-gray-300">리뷰가 추가되면 여기에 표시됩니다</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
