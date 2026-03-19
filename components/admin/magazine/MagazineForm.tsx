'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const GRADIENTS = [
  { label: '핑크', value: 'from-pink-300 to-rose-400' },
  { label: '보라', value: 'from-violet-400 to-purple-600' },
  { label: '초록', value: 'from-emerald-400 to-teal-500' },
  { label: '파랑', value: 'from-blue-400 to-indigo-500' },
  { label: '주황', value: 'from-orange-300 to-amber-500' },
  { label: '빨강', value: 'from-red-400 to-rose-600' },
  { label: '하늘', value: 'from-cyan-300 to-sky-500' },
  { label: '라임', value: 'from-lime-300 to-green-500' },
];

const ACCENT_COLORS = [
  '#F472B6', '#8B5CF6', '#14B8A6', '#3B82F6',
  '#F59E0B', '#EF4444', '#06B6D4', '#84CC16',
];

interface MagazineFormProps {
  initialData?: any;
  initialPlaceIds?: string[];
}

export default function MagazineForm({ initialData, initialPlaceIds = [] }: MagazineFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    subtitle: initialData?.subtitle ?? '',
    summary: initialData?.summary ?? '',
    content: initialData?.content ?? '',
    emoji: initialData?.emoji ?? '📖',
    gradient: initialData?.gradient ?? GRADIENTS[0].value,
    accent_color: initialData?.accent_color ?? ACCENT_COLORS[0],
    cover_image: initialData?.cover_image ?? '',
    author: initialData?.author ?? '펫세권 에디터',
    tags: (initialData?.tags ?? []).join(', '),
    read_time: initialData?.read_time ?? '3분',
    is_featured: initialData?.is_featured ?? false,
    is_published: initialData?.is_published ?? true,
    sort_order: initialData?.sort_order ?? 0,
  });

  const [placeSearch, setPlaceSearch] = useState('');
  const [placeResults, setPlaceResults] = useState<any[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // 초기 장소 로드
  useState(() => {
    if (initialPlaceIds.length > 0) {
      Promise.all(
        initialPlaceIds.map((pid) =>
          fetch(`/api/places/${pid}`).then((r) => r.json()).then((d) => d.place).catch(() => null)
        )
      ).then((places) => setSelectedPlaces(places.filter(Boolean)));
    }
  });

  const searchPlaces = async (q: string) => {
    setPlaceSearch(q);
    if (q.length < 2) { setPlaceResults([]); return; }
    const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    // API가 배열을 직접 반환하거나 { places: [] } 형태일 수 있음
    setPlaceResults(Array.isArray(data) ? data : data.places ?? []);
  };

  const addPlace = (place: any) => {
    if (selectedPlaces.find((p) => p.id === place.id)) return;
    setSelectedPlaces((prev) => [...prev, place]);
    setPlaceSearch('');
    setPlaceResults([]);
  };

  const removePlace = (id: string) => {
    setSelectedPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  // 이미지 업로드 → URL 반환
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/magazine/upload', { method: 'POST', body: formData });
      if (!res.ok) { alert('이미지 업로드 실패'); return null; }
      const { url } = await res.json();
      return url;
    } catch {
      alert('이미지 업로드 실패');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  // 커서 위치에 텍스트 삽입
  const insertAtCursor = useCallback((text: string) => {
    const ta = contentRef.current;
    if (!ta) { update('content', form.content + text); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = form.content.slice(0, start);
    const after = form.content.slice(end);
    const newContent = before + text + after;
    update('content', newContent);
    // 커서 위치 복원
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + text.length;
    });
  }, [form.content]);

  // 붙여넣기 핸들러 (이미지 감지)
  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) return;
        insertAtCursor('\n[이미지 업로드 중...]\n');
        const url = await uploadImage(file);
        if (url) {
          // 업로드 중 플레이스홀더를 실제 이미지 태그로 교체
          update('content', form.content.replace('[이미지 업로드 중...]', `{{IMG:${url}}}`));
        } else {
          update('content', form.content.replace('\n[이미지 업로드 중...]\n', ''));
        }
        return;
      }
    }
  }, [form.content, insertAtCursor, uploadImage]);

  // URL로 이미지 삽입
  const handleInsertImageUrl = useCallback(() => {
    const url = prompt('이미지 URL을 입력하세요:');
    if (url) insertAtCursor(`\n{{IMG:${url}}}\n`);
  }, [insertAtCursor]);

  // 파일 선택으로 이미지 업로드
  const handleFileSelect = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadImage(file);
      if (url) insertAtCursor(`\n{{IMG:${url}}}\n`);
    };
    input.click();
  }, [uploadImage, insertAtCursor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      sort_order: Number(form.sort_order),
      place_ids: selectedPlaces.map((p) => p.id),
    };

    const url = isEdit ? `/api/admin/magazine/${initialData.id}` : '/api/admin/magazine';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push('/admin/magazine');
    } else {
      const err = await res.json();
      alert(err.error ?? '저장 실패');
    }
    setSaving(false);
  };

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* 미리보기 */}
      <div className={`w-full aspect-[16/9] rounded-xl bg-gradient-to-br ${form.gradient} flex items-center justify-center relative overflow-hidden`}>
        <span className="text-6xl">{form.emoji}</span>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 pt-10">
          <h3 className="text-white text-lg font-bold">{form.title || '매거진 제목'}</h3>
          <p className="text-white/80 text-xs mt-1">{form.subtitle || '부제목'}</p>
        </div>
        {form.is_featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 text-pink-600 px-2.5 py-1 rounded-full text-[10px] font-bold">이번 주 추천</span>
          </div>
        )}
      </div>

      {/* 기본 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">기본 정보</h3>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">제목 *</label>
          <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none" required />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">부제목</label>
          <input type="text" value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">요약</label>
          <textarea value={form.summary} onChange={(e) => update('summary', e.target.value)} rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none resize-none" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">본문</label>
            <div className="flex items-center gap-2">
              {uploading && <span className="text-xs text-amber-600 animate-pulse">업로드 중...</span>}
              <button type="button" onClick={handleFileSelect}
                className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors" title="이미지 파일 선택">
                📷 이미지
              </button>
              <button type="button" onClick={handleInsertImageUrl}
                className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors" title="URL로 이미지 삽입">
                🔗 URL
              </button>
              <button type="button" onClick={() => setShowPreview(!showPreview)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${showPreview ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {showPreview ? '편집' : '미리보기'}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">이미지를 복사해서 붙여넣기(Ctrl+V) 할 수 있습니다. ## 제목, **볼드**, - 리스트 문법을 지원합니다.</p>

          {showPreview ? (
            <div className="w-full border border-gray-200 rounded-lg px-4 py-3 min-h-[300px] bg-gray-50 overflow-y-auto max-h-[500px]">
              <ContentPreview content={form.content} />
            </div>
          ) : (
            <textarea
              ref={contentRef}
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              onPaste={handlePaste}
              rows={15}
              placeholder="본문을 작성하세요...&#10;&#10;이미지를 복사해서 붙여넣으면 자동으로 업로드됩니다.&#10;## 제목, **볼드**, - 리스트 문법을 사용할 수 있습니다."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none resize-y font-mono leading-relaxed"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">작성자</label>
            <input type="text" value={form.author} onChange={(e) => update('author', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">읽기 시간</label>
            <input type="text" value={form.read_time} onChange={(e) => update('read_time', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">태그 (쉼표 구분)</label>
          <input type="text" value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="봄, 브런치, 카페"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none" />
        </div>
      </div>

      {/* 스타일 설정 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">스타일 설정</h3>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">이모지</label>
          <input type="text" value={form.emoji} onChange={(e) => update('emoji', e.target.value)}
            className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-center text-2xl focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">그라데이션</label>
          <div className="flex flex-wrap gap-2">
            {GRADIENTS.map((g) => (
              <button key={g.value} type="button" onClick={() => update('gradient', g.value)}
                className={`w-16 h-10 rounded-lg bg-gradient-to-br ${g.value} border-2 transition-all ${form.gradient === g.value ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                title={g.label} />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">강조 색상</label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => update('accent_color', c)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${form.accent_color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">커버 이미지 URL</label>
          <input type="text" value={form.cover_image} onChange={(e) => update('cover_image', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none" placeholder="https://..." />
        </div>
      </div>

      {/* 추천 장소 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">추천 장소 ({selectedPlaces.length}곳)</h3>

        <div className="relative">
          <input type="text" value={placeSearch} onChange={(e) => searchPlaces(e.target.value)}
            placeholder="장소 이름으로 검색..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none" />
          {placeResults.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {placeResults.map((p: any) => (
                <button key={p.id} type="button" onClick={() => addPlace(p)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.address}</p>
                  </div>
                  {selectedPlaces.find((sp) => sp.id === p.id) && (
                    <span className="text-xs text-green-600 font-medium">추가됨</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedPlaces.length > 0 && (
          <div className="space-y-2">
            {selectedPlaces.map((place, i) => (
              <div key={place.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-bold text-gray-400 w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{place.name}</p>
                  <p className="text-xs text-gray-400 truncate">{place.address}</p>
                </div>
                <button type="button" onClick={() => removePlace(place.id)}
                  className="text-red-400 hover:text-red-600 text-xs font-medium shrink-0">제거</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 발행 설정 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">발행 설정</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">정렬 순서</label>
            <input type="number" value={form.sort_order} onChange={(e) => update('sort_order', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent outline-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-300" />
            <span className="text-sm text-gray-700">이번 주 추천</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={(e) => update('is_published', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-300" />
            <span className="text-sm text-gray-700">공개</span>
          </label>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors">
          {saving ? '저장 중...' : isEdit ? '수정 완료' : '등록하기'}
        </button>
        <button type="button" onClick={() => router.push('/admin/magazine')}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
          취소
        </button>
      </div>
    </form>
  );
}

/* ─── 본문 미리보기 (admin용) ─── */
function ContentPreview({ content }: { content: string }) {
  if (!content) return <p className="text-sm text-gray-400">본문이 비어있습니다</p>;

  const parts = content.split(/({{IMG:[^}]+}})/g);
  return (
    <div className="space-y-3">
      {parts.map((part, i) => {
        const imgMatch = part.match(/^{{IMG:(.+)}}$/);
        if (imgMatch) {
          return (
            <div key={i} className="rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgMatch[1]} alt="" className="w-full h-auto rounded-lg max-h-[300px] object-cover" loading="lazy" />
            </div>
          );
        }
        if (!part.trim()) return null;
        return (
          <div key={i} className="space-y-1.5">
            {part.split('\n').map((line, j) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={j} className="h-1.5" />;
              if (trimmed.startsWith('## ')) return <h3 key={j} className="text-base font-bold text-gray-900 mt-3">{trimmed.slice(3)}</h3>;
              if (trimmed.startsWith('### ')) return <h4 key={j} className="text-sm font-bold text-gray-800 mt-2">{trimmed.slice(4)}</h4>;
              if (trimmed.startsWith('- ')) return <p key={j} className="text-sm text-gray-600 pl-3">· {trimmed.slice(2)}</p>;
              const boldParsed = trimmed.split(/(\*\*[^*]+\*\*)/g).map((seg, k) => {
                if (seg.startsWith('**') && seg.endsWith('**')) return <strong key={k} className="font-semibold">{seg.slice(2, -2)}</strong>;
                return <span key={k}>{seg}</span>;
              });
              return <p key={j} className="text-sm text-gray-600 leading-relaxed">{boldParsed}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}
