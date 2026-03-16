import { createClient } from '@/lib/supabase/server';
import PlaceForm from '@/components/admin/places/PlaceForm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminPlaceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: place, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !place) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">장소 수정</h1>
      <PlaceForm initialData={place} />
    </div>
  );
}
