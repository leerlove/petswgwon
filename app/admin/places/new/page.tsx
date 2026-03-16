import PlaceForm from '@/components/admin/places/PlaceForm';

export default function AdminPlaceNewPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">장소 신규 등록</h1>
      <PlaceForm isNew />
    </div>
  );
}
