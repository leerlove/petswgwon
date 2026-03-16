'use client';

import { useState, useRef } from 'react';

export default function AdminDataPage() {
  const [uploading, setUploading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [preview, setPreview] = useState<{ count: number; sample: Record<string, unknown>[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDownload = async (format: 'json' | 'csv') => {
    setDownloadLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/data?format=${format}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '다운로드 실패');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `places_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setResult({ type: 'success', message: `${format.toUpperCase()} 다운로드 완료` });
    } catch (err) {
      setResult({ type: 'error', message: (err as Error).message });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    setPreview(null);

    try {
      const text = await file.text();
      let data: unknown[];

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // 간단한 CSV 파싱 (header + rows)
        const lines = text.split('\n').filter((l) => l.trim());
        if (lines.length < 2) throw new Error('CSV에 헤더와 데이터가 필요합니다.');
        const headers = lines[0].split(',').map((h) => h.trim());
        data = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = values[i] ?? '';
          });
          return obj;
        });
      } else {
        throw new Error('JSON 또는 CSV 파일만 지원합니다.');
      }

      if (!Array.isArray(data)) throw new Error('데이터가 배열 형식이 아닙니다.');

      setPreview({
        count: data.length,
        sample: data.slice(0, 3) as Record<string, unknown>[],
      });
    } catch (err) {
      setResult({ type: 'error', message: (err as Error).message });
    }
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      let data: unknown[];

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else {
        const lines = text.split('\n').filter((l) => l.trim());
        const headers = lines[0].split(',').map((h) => h.trim());
        data = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = values[i] ?? '';
          });
          return obj;
        });
      }

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || '업로드 실패');
      }

      setResult({ type: 'success', message: result.message });
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setResult({ type: 'error', message: (err as Error).message });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">데이터 관리</h1>

      {/* 알림 */}
      {result && (
        <div
          className={`p-4 rounded-lg text-sm ${
            result.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {result.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 다운로드 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">데이터 다운로드</h3>
          <p className="text-xs text-gray-500 mb-4">
            전체 장소 데이터를 JSON 또는 CSV 형식으로 내보냅니다.
          </p>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => handleDownload('json')}
              disabled={downloadLoading}
              className="flex-1 bg-gray-800 text-white text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {downloadLoading ? '...' : 'JSON'}
            </button>
            <button
              onClick={() => handleDownload('csv')}
              disabled={downloadLoading}
              className="flex-1 bg-gray-800 text-white text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {downloadLoading ? '...' : 'CSV'}
            </button>
          </div>
        </div>

        {/* 업로드 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">데이터 업로드</h3>
          <p className="text-xs text-gray-500 mb-4">
            JSON 배열 파일을 업로드하여 데이터를 추가/수정합니다. (최대 5,000건)
            <br />
            id가 일치하는 기존 데이터는 업데이트됩니다.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
          />
        </div>
      </div>

      {/* 업로드 미리보기 */}
      {preview && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-4">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              업로드 미리보기 — {preview.count.toLocaleString()}건
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex-1 sm:flex-none text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 sm:flex-none text-sm px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {uploading ? '업로드 중...' : `${preview.count.toLocaleString()}건 업로드`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(preview.sample[0] ?? {}).slice(0, 8).map((key) => (
                    <th key={key} className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap">
                      {key}
                    </th>
                  ))}
                  {Object.keys(preview.sample[0] ?? {}).length > 8 && (
                    <th className="text-left px-3 py-2 font-medium text-gray-400">...</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.sample.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).slice(0, 8).map((val, j) => (
                      <td key={j} className="px-3 py-2 text-gray-600 max-w-[150px] truncate">
                        {val === null ? <span className="text-gray-300">null</span> : String(val)}
                      </td>
                    ))}
                    {Object.keys(row).length > 8 && (
                      <td className="px-3 py-2 text-gray-400">...</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.count > 3 && (
            <p className="text-xs text-gray-400">... 외 {(preview.count - 3).toLocaleString()}건</p>
          )}
        </div>
      )}

      {/* 안내 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-amber-900 mb-2">업로드 안내</h3>
        <div className="text-xs text-amber-800 space-y-1">
          <p>• JSON 형식: 장소 객체의 배열 ([ &#123;...&#125;, &#123;...&#125; ])</p>
          <p>• CSV 형식: 첫 줄은 헤더, 이후 줄은 데이터</p>
          <p>• id 필드가 기존 장소와 일치하면 해당 장소를 업데이트합니다.</p>
          <p>• id 필드가 없거나 일치하지 않으면 새 장소로 생성됩니다.</p>
          <p>• created_at, updated_at 필드는 자동 처리됩니다.</p>
          <p>• 한 번에 최대 5,000건까지 업로드할 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
