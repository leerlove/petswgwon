'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PLAYGROUND_TYPE_LABELS } from '@/types/playground';
import type { PlaygroundType } from '@/types/playground';
import ImageManager from '@/components/admin/ImageManager';
import SectionEditor from '@/components/admin/playgrounds/SectionEditor';
import { collectSectionImagePaths } from '@/lib/admin/sectionImages';
import type { PlaygroundSection } from '@/types/playground';

interface PlaygroundData {
  id?: string;
  name: string;
  playground_type: PlaygroundType;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  business_hours: { hours?: string; closedDays?: string };
  is_unmanned: boolean;
  is_public: boolean;
  instagram: string;
  small_dog: boolean;
  medium_dog: boolean;
  large_dog: boolean;
  indoor_allowed: boolean;
  caution: string;
  thumbnail: string;
  images: string[];
  tags: string[];
  sections: PlaygroundSection[];
}

const EMPTY_PLAYGROUND: PlaygroundData = {
  name: '', playground_type: 'playground',
  phone: '', address: '',
  lat: 37.5665, lng: 126.978,
  business_hours: {}, is_unmanned: false, is_public: false,
  instagram: '',
  small_dog: true, medium_dog: true, large_dog: false,
  indoor_allowed: false, caution: '',
  thumbnail: '', images: [], tags: [], sections: [],
};

interface PlaygroundFormProps {
  initialData?: PlaygroundData;
  isNew?: boolean;
}

export default function PlaygroundForm({ initialData, isNew = false }: PlaygroundFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PlaygroundData>(initialData ?? EMPTY_PLAYGROUND);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tagInput, setTagInput] = useState('');

  const updateField = <K extends keyof PlaygroundData>(key: K, value: PlaygroundData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const url = isNew ? '/api/admin/playgrounds' : `/api/admin/playgrounds/${form.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const payload = JSON.stringify(form);
      console.log('[PlaygroundForm] save:', method, url, 'payload size:', payload.length);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      console.log('[PlaygroundForm] response status:', res.status);
      const saved = await res.json();
      console.log('[PlaygroundForm] response body:', saved);
      if (!res.ok) {
        throw new Error(saved.error || '저장 실패');
      }
      router.push(isNew ? `/admin/playgrounds/${saved.id}` : '/admin/playgrounds');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 중 오류');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/admin/playgrounds/${form.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/playgrounds');
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

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 outline-none';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6 max-w-3xl pb-24 sm:pb-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">{success}</div>
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
            <label className={labelCls}>분류</label>
            <select className={inputCls} value={form.playground_type}
              onChange={(e) => updateField('playground_type', e.target.value as PlaygroundType)}>
              {(Object.entries(PLAYGROUND_TYPE_LABELS) as [PlaygroundType, string][]).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>전화번호</label>
            <input className={inputCls} value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>주소</label>
          <input className={inputCls} value={form.address} onChange={(e) => updateField('address', e.target.value)} />
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

      {/* 특성 */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">운영 특성</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_public}
              onChange={(e) => updateField('is_public', e.target.checked)}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
            공공시설
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_unmanned}
              onChange={(e) => updateField('is_unmanned', e.target.checked)}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
            무인 운영
          </label>
        </div>
        <div>
          <label className={labelCls}>인스타그램</label>
          <input className={inputCls} value={form.instagram}
            onChange={(e) => updateField('instagram', e.target.value)} placeholder="@없이 핸들만 입력" />
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
          <label className={labelCls}>주의사항</label>
          <textarea className={inputCls} rows={2} value={form.caution}
            onChange={(e) => updateField('caution', e.target.value)} />
        </div>
      </section>

      {/* 이미지 */}
      {form.id && (
        <ImageManager
          entityId={form.id}
          thumbnail={form.thumbnail}
          images={form.images}
          onThumbnailChange={(v) => updateField('thumbnail', v)}
          onImagesChange={(v) => updateField('images', v)}
          excludePaths={Array.from(collectSectionImagePaths(form.sections))}
        />
      )}
      {!form.id && (
        <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">이미지 관리</h2>
          <p className="text-xs text-gray-400">먼저 등록 후 이미지를 업로드할 수 있습니다.</p>
        </section>
      )}

      {/* 섹션 (객실/부대시설 등) */}
      {form.id ? (
        <SectionEditor
          entityId={form.id}
          sections={form.sections}
          onChange={(v) => updateField('sections', v)}
        />
      ) : (
        <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">섹션 관리</h2>
          <p className="text-xs text-gray-400">먼저 등록 후 섹션을 추가할 수 있습니다.</p>
        </section>
      )}

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

      {/* 버튼 */}
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
