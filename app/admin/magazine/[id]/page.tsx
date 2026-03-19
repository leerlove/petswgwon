'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MagazineForm from '@/components/admin/magazine/MagazineForm';

export default function EditMagazinePage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [placeIds, setPlaceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/magazine/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data.post);
        setPlaceIds((data.places ?? []).map((l: any) => l.place_id));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-400">로딩 중...</div>;
  if (!post) return <div className="p-8 text-center text-gray-500">매거진을 찾을 수 없습니다</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">매거진 수정</h1>
      <MagazineForm initialData={post} initialPlaceIds={placeIds} />
    </div>
  );
}
