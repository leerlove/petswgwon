'use client';

import MagazineForm from '@/components/admin/magazine/MagazineForm';

export default function NewMagazinePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">새 매거진 등록</h1>
      <MagazineForm />
    </div>
  );
}
