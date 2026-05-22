'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { proxyImageUrl } from '@/lib/imageProxy';

interface ImageFile {
  name: string;
  path: string;
  size: number;
  created_at: string;
}

interface ImageManagerProps {
  entityId: string;
  thumbnail: string;
  images: string[];
  onThumbnailChange: (path: string) => void;
  onImagesChange: (paths: string[]) => void;
}

export default function ImageManager({ entityId, thumbnail, images, onThumbnailChange, onImagesChange }: ImageManagerProps) {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/images?entityId=${entityId}`);
      if (res.ok) {
        const data = await res.json();
        const fetched: ImageFile[] = data.files ?? [];
        setFiles(fetched);

        // Storage에 파일이 있지만 폼의 images가 비어있으면 자동 동기화
        if (fetched.length > 0 && images.length === 0) {
          const storagePaths = fetched.map((f) => f.path);
          onImagesChange(storagePaths);
          if (!thumbnail) {
            onThumbnailChange(storagePaths[0]);
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [entityId]); // images, thumbnail 의도적 제외 — 초기 로드 시에만 동기화

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setError('');
    const newPaths: string[] = [];

    for (const file of Array.from(selectedFiles)) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'heif'];
      if (!file.type.startsWith('image/') && !allowedExts.includes(ext)) continue;
      if (file.size > 20 * 1024 * 1024) {
        setError('파일 크기는 20MB 이하만 가능합니다.');
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityId', entityId);

      try {
        const res = await fetch('/api/admin/images', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          newPaths.push(data.path);
        } else {
          const data = await res.json();
          setError(data.error || '업로드 실패');
        }
      } catch {
        setError('업로드 중 오류 발생');
      }
    }

    if (newPaths.length > 0) {
      const updated = [...images, ...newPaths];
      onImagesChange(updated);
      if (!thumbnail) {
        onThumbnailChange(newPaths[0]);
      }
      setFiles((prev) => [
        ...prev,
        ...newPaths.map((p) => ({ name: p.split('/').pop() || '', path: p, size: 0, created_at: new Date().toISOString() })),
      ]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploading(false);
  };

  const handleDelete = async (path: string) => {

    const res = await fetch('/api/admin/images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });

    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.path !== path));
      const updated = images.filter((p) => p !== path);
      onImagesChange(updated);
      if (thumbnail === path) {
        onThumbnailChange(updated[0] || '');
      }
    }
  };

  const setAsThumbnail = (path: string) => {
    onThumbnailChange(path);
  };

  const getPreviewUrl = (path: string) => proxyImageUrl(path, 400);

  const allPaths = new Set([...images, ...files.map((f) => f.path)]);
  const displayPaths = Array.from(allPaths);

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 outline-none';

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">이미지 관리</h2>
        <span className="text-xs text-gray-400">{displayPaths.length}개</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{error}</div>
      )}

      {/* 업로드 버튼 */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif,.webp,.png,.jpg,.jpeg,.gif,.avif"
          multiple
          onChange={handleUpload}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed rounded-xl text-sm font-medium cursor-pointer transition-colors ${
            uploading
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'border-amber-300 text-amber-600 hover:bg-amber-50'
          }`}
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              업로드 중...
            </>
          ) : (
            <>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              이미지 업로드 (20MB 이하, 복수 선택 가능)
            </>
          )}
        </label>
      </div>

      {/* 이미지 그리드 */}
      {loading ? (
        <div className="text-center text-gray-400 text-sm py-4">로딩 중...</div>
      ) : displayPaths.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-4">등록된 이미지가 없습니다</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {displayPaths.map((path) => {
            const isThumbnail = thumbnail === path;
            return (
              <div
                key={path}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-petplace-image', path);
                  e.dataTransfer.setData('text/plain', path);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                title="드래그해서 아래 섹션 항목에 넣을 수 있어요"
                aria-label="섹션으로 드래그할 수 있는 이미지"
                className={`relative group rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing ${isThumbnail ? 'border-amber-500' : 'border-gray-100'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPreviewUrl(path)}
                  alt=""
                  className="w-full h-24 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                />
                {isThumbnail && (
                  <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">대표</span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                  {!isThumbnail && (
                    <button
                      onClick={() => setAsThumbnail(path)}
                      className="bg-white text-amber-600 text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-amber-50"
                    >
                      대표 설정
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(path)}
                    className="bg-white text-red-500 text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 썸네일 경로 (수동 입력도 가능) */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">썸네일 경로</label>
        <input className={inputCls} value={thumbnail} onChange={(e) => onThumbnailChange(e.target.value)} placeholder="이미지 업로드 시 자동 설정" />
      </div>
    </section>
  );
}
