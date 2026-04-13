'use client';

import { useState, useRef } from 'react';
import { SECTION_TYPE_LABELS } from '@/types/playground';
import type { PlaygroundSection, SectionItem } from '@/types/playground';

interface SectionEditorProps {
  entityId: string;
  sections: PlaygroundSection[];
  onChange: (sections: PlaygroundSection[]) => void;
}

export default function SectionEditor({ entityId, sections, onChange }: SectionEditorProps) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<{ sectionIdx: number; itemIdx: number } | null>(null);

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 outline-none';
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

  const addSection = (type: string) => {
    const title = SECTION_TYPE_LABELS[type] || '새 섹션';
    onChange([...sections, { type, title, items: [] }]);
  };

  const updateSection = (idx: number, updates: Partial<PlaygroundSection>) => {
    const updated = sections.map((s, i) => i === idx ? { ...s, ...updates } : s);
    onChange(updated);
  };

  const removeSection = (idx: number) => {
    if (!confirm('이 섹션을 삭제하시겠습니까?')) return;
    onChange(sections.filter((_, i) => i !== idx));
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const updated = [...sections];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    onChange(updated);
  };

  const addItem = (sectionIdx: number) => {
    const updated = [...sections];
    updated[sectionIdx] = {
      ...updated[sectionIdx],
      items: [...updated[sectionIdx].items, { name: '', images: [] }],
    };
    onChange(updated);
  };

  const updateItem = (sectionIdx: number, itemIdx: number, updates: Partial<SectionItem>) => {
    const updated = [...sections];
    updated[sectionIdx] = {
      ...updated[sectionIdx],
      items: updated[sectionIdx].items.map((item, i) =>
        i === itemIdx ? { ...item, ...updates } : item
      ),
    };
    onChange(updated);
  };

  const removeItem = (sectionIdx: number, itemIdx: number) => {
    const updated = [...sections];
    updated[sectionIdx] = {
      ...updated[sectionIdx],
      items: updated[sectionIdx].items.filter((_, i) => i !== itemIdx),
    };
    onChange(updated);
  };

  const moveItem = (sectionIdx: number, itemIdx: number, dir: -1 | 1) => {
    const newIdx = itemIdx + dir;
    const items = sections[sectionIdx].items;
    if (newIdx < 0 || newIdx >= items.length) return;
    const updated = [...sections];
    const newItems = [...items];
    [newItems[itemIdx], newItems[newIdx]] = [newItems[newIdx], newItems[itemIdx]];
    updated[sectionIdx] = { ...updated[sectionIdx], items: newItems };
    onChange(updated);
  };

  const triggerUpload = (sectionIdx: number, itemIdx: number) => {
    uploadTargetRef.current = { sectionIdx, itemIdx };
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const target = uploadTargetRef.current;
    if (!files || files.length === 0 || !target) return;

    const key = `${target.sectionIdx}-${target.itemIdx}`;
    setUploadingKey(key);

    const newPaths: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'heif'];
      if (!file.type.startsWith('image/') && !allowedExts.includes(ext)) continue;
      if (file.size > 20 * 1024 * 1024) continue;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityId', entityId);
      try {
        const res = await fetch('/api/admin/images', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          newPaths.push(data.path);
        }
      } catch { /* ignore */ }
    }

    if (newPaths.length > 0) {
      const currentImages = sections[target.sectionIdx].items[target.itemIdx].images;
      updateItem(target.sectionIdx, target.itemIdx, { images: [...currentImages, ...newPaths] });
    }

    setUploadingKey(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (sectionIdx: number, itemIdx: number, imgIdx: number) => {
    const images = sections[sectionIdx].items[itemIdx].images.filter((_, i) => i !== imgIdx);
    updateItem(sectionIdx, itemIdx, { images });
  };

  const getPreviewUrl = (path: string) => `/api/image/${path}`;

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">섹션 관리 (객실/부대시설 등)</h2>
        <span className="text-xs text-gray-400">{sections.length}개 섹션</span>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif,.webp,.png,.jpg,.jpeg,.gif,.avif" multiple onChange={handleFileUpload} className="hidden" />

      {sections.map((section, sIdx) => (
        <div key={sIdx} className="border border-gray-200 rounded-xl overflow-hidden">
          {/* 섹션 헤더 */}
          <div className="bg-gray-50 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1">
              <button type="button" onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▲</button>
              <button type="button" onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sections.length - 1}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▼</button>
            </div>
            <input
              className="flex-1 bg-transparent font-semibold text-sm text-gray-900 outline-none"
              value={section.title}
              onChange={(e) => updateSection(sIdx, { title: e.target.value })}
              placeholder="섹션 제목"
            />
            <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full">{section.type}</span>
            <button type="button" onClick={() => removeSection(sIdx)}
              className="text-red-400 hover:text-red-600 text-sm ml-1">✕</button>
          </div>

          {/* 항목 목록 */}
          <div className="p-3 space-y-3">
            {section.items.map((item, iIdx) => (
              <div key={iIdx} className="border border-gray-100 rounded-lg p-3 space-y-2 bg-white">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveItem(sIdx, iIdx, -1)} disabled={iIdx === 0}
                      className="text-gray-300 hover:text-gray-500 disabled:opacity-30 text-[10px]">▲</button>
                    <button type="button" onClick={() => moveItem(sIdx, iIdx, 1)} disabled={iIdx === section.items.length - 1}
                      className="text-gray-300 hover:text-gray-500 disabled:opacity-30 text-[10px]">▼</button>
                  </div>
                  <input
                    className={inputCls + ' flex-1'}
                    value={item.name}
                    onChange={(e) => updateItem(sIdx, iIdx, { name: e.target.value })}
                    placeholder="항목 이름 (예: KINOCK DELUXE A)"
                  />
                  <button type="button" onClick={() => removeItem(sIdx, iIdx)}
                    className="text-red-400 hover:text-red-600 text-xs">삭제</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>부제목</label>
                    <input className={inputCls} value={item.subtitle || ''}
                      onChange={(e) => updateItem(sIdx, iIdx, { subtitle: e.target.value })}
                      placeholder="예: 55인치 TV" />
                  </div>
                  <div>
                    <label className={labelCls}>설명</label>
                    <input className={inputCls} value={item.description || ''}
                      onChange={(e) => updateItem(sIdx, iIdx, { description: e.target.value })}
                      placeholder="간단한 설명" />
                  </div>
                </div>

                {/* 이미지 */}
                <div>
                  <label className={labelCls}>이미지 ({item.images.length}개)</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {item.images.map((img, imgIdx) => (
                      <div key={imgIdx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getPreviewUrl(img)} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(sIdx, iIdx, imgIdx)}
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <span className="text-white text-xs font-bold">✕</span>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => triggerUpload(sIdx, iIdx)}
                      disabled={uploadingKey === `${sIdx}-${iIdx}`}
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-amber-400 hover:text-amber-500 transition-colors"
                    >
                      {uploadingKey === `${sIdx}-${iIdx}` ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      ) : (
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" onClick={() => addItem(sIdx)}
              className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors flex items-center justify-center gap-1">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
              항목 추가
            </button>
          </div>
        </div>
      ))}

      {/* 섹션 추가 버튼들 */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(SECTION_TYPE_LABELS).map(([type, label]) => (
          <button key={type} type="button" onClick={() => addSection(type)}
            className="px-3 py-2 border border-dashed border-amber-300 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors">
            + {label}
          </button>
        ))}
      </div>
    </section>
  );
}
