import PlaygroundForm from '@/components/admin/playgrounds/PlaygroundForm';

export default function NewPlaygroundPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">새 놀이터 등록</h1>
      <PlaygroundForm isNew />
    </div>
  );
}
