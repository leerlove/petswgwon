'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MagazinePost {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  author: string;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  like_count: number;
  created_at: string;
}

export default function AdminMagazinePage() {
  const [posts, setPosts] = useState<MagazinePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/magazine')
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 매거진을 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/magazine/${id}`, { method: 'DELETE' });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const togglePublish = async (post: MagazinePost) => {
    const res = await fetch(`/api/admin/magazine/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !post.is_published }),
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, is_published: !p.is_published } : p))
      );
    }
  };

  const toggleFeatured = async (post: MagazinePost) => {
    const res = await fetch(`/api/admin/magazine/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: !post.is_featured }),
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, is_featured: !p.is_featured } : p))
      );
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">매거진 관리</h1>
          <p className="text-sm text-gray-500 mt-1">핫플레이스 탭에 표시되는 매거진 포스트를 관리합니다</p>
        </div>
        <Link
          href="/admin/magazine/new"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          + 새 매거진
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <span className="text-4xl block mb-3">📖</span>
          <p className="text-gray-500">등록된 매거진이 없습니다</p>
          <Link href="/admin/magazine/new" className="text-sm text-amber-600 font-semibold mt-2 inline-block">
            첫 매거진 만들기 →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">매거진</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600 w-20">추천</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600 w-20">공개</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600 w-20">순서</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600 w-16">좋아요</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 w-32">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${post.gradient} flex items-center justify-center text-lg shrink-0`}
                      >
                        {post.emoji}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/magazine/${post.id}`}
                          className="font-semibold text-gray-900 hover:text-amber-600 truncate block"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-400 truncate">{post.subtitle}</p>
                        <div className="flex gap-1 mt-1">
                          {(post.tags as string[]).slice(0, 3).map((t) => (
                            <span key={t} className="text-[10px] text-gray-400">#{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center px-3 py-3">
                    <button
                      onClick={() => toggleFeatured(post)}
                      className={`text-lg ${post.is_featured ? '' : 'opacity-30'}`}
                      title={post.is_featured ? '추천 해제' : '추천 설정'}
                    >
                      ⭐
                    </button>
                  </td>
                  <td className="text-center px-3 py-3">
                    <button
                      onClick={() => togglePublish(post)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        post.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {post.is_published ? '공개' : '비공개'}
                    </button>
                  </td>
                  <td className="text-center px-3 py-3 text-xs text-gray-500">{post.sort_order}</td>
                  <td className="text-center px-3 py-3 text-xs text-gray-500">{post.like_count}</td>
                  <td className="text-right px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/magazine/${post.id}`}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
