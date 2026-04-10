'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PlaygroundForm from '@/components/admin/playgrounds/PlaygroundForm';

export default function EditPlaygroundPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/playgrounds/${id}`)
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">로딩 중...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-gray-400">놀이터를 찾을 수 없습니다</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">놀이터 수정</h1>
      <PlaygroundForm initialData={data} />
    </div>
  );
}
