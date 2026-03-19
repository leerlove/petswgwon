'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { categories } from '@/data/categories';

interface PlaceData {
  id?: string;
  name: string;
  category: string;
  sub_category: string;
  phone: string;
  address: string;
  address_jibun: string;
  lat: number;
  lng: number;
  business_hours: { hours?: string; closedDays?: string };
  small_dog: boolean;
  medium_dog: boolean;
  large_dog: boolean;
  indoor_allowed: boolean;
  access_method: string;
  pet_etiquette: string[];
  caution: string;
  thumbnail: string;
  images: string[];
  tags: string[];
}

const EMPTY_PLACE: PlaceData = {
  name: '', category: 'food_beverage', sub_category: 'restaurant',
  phone: '', address: '', address_jibun: '',
  lat: 37.5665, lng: 126.978,
  business_hours: {}, small_dog: true, medium_dog: true, large_dog: false,
  indoor_allowed: false, access_method: '',
  pet_etiquette: [], caution: '', thumbnail: '', images: [], tags: [],
};

interface PlaceFormProps {
  initialData?: PlaceData;
  isNew?: boolean;
}

export default function PlaceForm({ initialData, isNew = false }: PlaceFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PlaceData>(initialData ?? EMPTY_PLACE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [etiquetteInput, setEtiquetteInput] = useState('');

  const selectedCategory = categories.find((c) => c.id === form.category);
  const subCategories = selectedCategory?.subCategories ?? [];

  const updateField = <K extends keyof PlaceData>(key: K, value: PlaceData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const url = isNew ? '/api/admin/places' : `/api/admin/places/${form.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '저장 실패');
      }
      const saved = await res.json();
      router.push(`/admin/places/${saved.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 중 오류');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/admin/places/${form.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/places');
      router.refresh();
    }
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (v && !form.tags.includes(v)) {
      updateField('tags', [...form.tags, v]);
    }
    setTagInput('');
  };

  const addEtiquette = () => {
    const v = etiquetteInput.trim();
    if (v && !form.pet_etiquette.includes(v)) {
      updateField('pet_etiquette', [...form.pet_etiquette, v]);
    }
    setEtiquetteInput('');
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 outline-none';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6 max-w-3xl pb-24 sm:pb-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* 기본 정보 */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">기본 정보</h2>
        <div>
          <label className={labelCls}>이름 *</label>
          <input className={inputCls} value={form.name} onChange={(e) => updateField('name', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>카테고리</label>
            <select className={inputCls} value={form.category}
              onChange={(e) => { updateField('category', e.target.value); updateField('sub_category', ''); }}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>서브카테고리</label>
            <select className={inputCls} value={form.sub_category}
              onChange={(e) => updateField('sub_category', e.target.value)}>
              <option value="">선택</option>
              {subCategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>전화번호</label>
          <input className={inputCls} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>도로명주소</label>
          <input className={inputCls} value={form.address} onChange={(e) => updateField('address', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>지번주소</label>
          <input className={inputCls} value={form.address_jibun} onChange={(e) => updateField('address_jibun', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>위도</label>
            <input type="number" step="0.00000001" className={inputCls} value={form.lat}
              onChange={(e) => updateField('lat', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className={labelCls}>경도</label>
            <input type="number" step="0.00000001" className={inputCls} value={form.lng}
              onChange={(e) => updateField('lng', parseFloat(e.target.value) || 0)} />
          </div>
        </div>
      </section>

      {/* 영업시간 */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">영업시간</h2>
        <div>
          <label className={labelCls}>영업시간</label>
          <input className={inputCls} value={form.business_hours.hours ?? ''}
            onChange={(e) => updateField('business_hours', { ...form.business_hours, hours: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>휴무일</label>
          <input className={inputCls} value={form.business_hours.closedDays ?? ''}
            onChange={(e) => updateField('business_hours', { ...form.business_hours, closedDays: e.target.value })} />
        </div>
      </section>

      {/* 반려동물 정책 */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">반려동물 정책</h2>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6">
          {([['small_dog', '소형견'], ['medium_dog', '중형견'], ['large_dog', '대형견'], ['indoor_allowed', '실내입장']] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form[key] as boolean}
                onChange={(e) => updateField(key, e.target.checked)}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
              {label}
            </label>
          ))}
        </div>
        <div>
          <label className={labelCls}>입장 방식</label>
          <input className={inputCls} value={form.access_method}
            onChange={(e) => updateField('access_method', e.target.value)} placeholder="예: 목줄착용, 이동가방" />
        </div>
        <div>
          <label className={labelCls}>펫 에티켓</label>
          <div className="flex gap-2 mb-2">
            <input className={inputCls} value={etiquetteInput} onChange={(e) => setEtiquetteInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEtiquette())} placeholder="입력 후 엔터" />
            <button type="button" onClick={addEtiquette} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">추가</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {form.pet_etiquette.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-sm px-2 py-1 rounded">
                {item}
                <button type="button" onClick={() => updateField('pet_etiquette', form.pet_etiquette.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>주의사항</label>
          <textarea className={inputCls} rows={2} value={form.caution}
            onChange={(e) => updateField('caution', e.target.value)} />
        </div>
      </section>

      {/* 태그 */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">태그</h2>
        <div className="flex gap-2">
          <input className={inputCls} value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="태그 입력 후 엔터" />
          <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">추가</button>
        </div>
        <div className="flex flex-wrap gap-1">
          {form.tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-sm px-2 py-1 rounded">
              {tag}
              <button type="button" onClick={() => updateField('tags', form.tags.filter((_, j) => j !== i))}
                className="text-amber-400 hover:text-red-500">×</button>
            </span>
          ))}
        </div>
      </section>

      {/* 버튼 — 모바일에서 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 sm:static sm:border-0 sm:px-0 sm:py-0 sm:bg-transparent z-20">
        <button onClick={handleSave} disabled={saving}
          className="flex-1 sm:flex-none bg-amber-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors">
          {saving ? '저장 중...' : isNew ? '등록' : '저장'}
        </button>
        {!isNew && (
          <button onClick={handleDelete}
            className="text-red-500 text-sm hover:text-red-700 transition-colors px-3 py-2.5">
            삭제
          </button>
        )}
        <button onClick={() => router.back()} className="text-gray-500 text-sm hover:text-gray-700 transition-colors px-3 py-2.5">
          취소
        </button>
      </div>
    </div>
  );
}
