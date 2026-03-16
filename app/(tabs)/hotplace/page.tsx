'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useMagazineStore, type MagazinePlace, type MagazinePost } from '@/stores/magazineStore';
import { SkeletonBox } from '@/components/ui/Skeleton';
import PlaceDetailSheet from '@/components/place/PlaceDetailSheet';
import { transformPlace } from '@/lib/supabase/transformPlace';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useBackButton } from '@/hooks/useBackButton';

type Tab = 'latest' | 'popular' | 'archive';

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function HotPlacePage() {
  const openDetail = useUIStore((s) => s.openDetail);
  const posts = useMagazineStore((s) => s.posts);
  const isLoading = useMagazineStore((s) => s.isLoading);
  const error = useMagazineStore((s) => s.error);
  const loadPosts = useMagazineStore((s) => s.loadPosts);
  const [activeTab, setActiveTab] = useState<Tab>('latest');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [viewingPost, setViewingPost] = useState<MagazinePost | null>(null);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const now = Date.now();

  const recentPosts = useMemo(
    () => posts.filter((p) => now - new Date(p.created_at).getTime() <= ONE_MONTH_MS),
    [posts, now]
  );
  const archivePosts = useMemo(
    () => posts.filter((p) => now - new Date(p.created_at).getTime() > ONE_MONTH_MS),
    [posts, now]
  );

  const featured = useMemo(() => {
    const sorted = [...recentPosts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted.find((p) => p.is_featured) ?? sorted[0] ?? null;
  }, [recentPosts]);

  const displayPosts = useMemo(() => {
    if (activeTab === 'latest') {
      return [...recentPosts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
    }
    if (activeTab === 'popular') {
      return [...recentPosts].sort((a, b) => b.like_count - a.like_count);
    }
    let filtered = [...archivePosts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          (p.tags as string[]).some((t) => t.toLowerCase().includes(q))
      );
    }
    if (selectedTag) {
      filtered = filtered.filter((p) => (p.tags as string[]).includes(selectedTag));
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [activeTab, recentPosts, archivePosts, searchQuery, selectedTag]);

  // 태그를 빈도순으로 정렬
  const { topTags, restTags } = useMemo(() => {
    const source = archivePosts.length > 0 ? archivePosts : posts;
    const countMap = new Map<string, number>();
    source.forEach((p) => (p.tags as string[]).forEach((t) => countMap.set(t, (countMap.get(t) ?? 0) + 1)));
    const sorted = Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]);
    return {
      topTags: sorted.slice(0, 6).map(([t]) => t),
      restTags: sorted.slice(6).map(([t]) => t),
    };
  }, [archivePosts, posts]);

  const handlePlaceClick = (place: MagazinePlace) => {
    openDetail(
      transformPlace({
        ...place,
        address_jibun: '',
        thumbnail: '',
        images: [],
        business_hours: {},
        access_method: '',
        small_dog: true,
        medium_dog: true,
        large_dog: false,
        indoor_allowed: false,
        pet_etiquette: [],
        caution: '',
        created_at: '',
        updated_at: '',
      })
    );
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'latest', label: '최신' },
    { id: 'popular', label: '인기' },
    { id: 'archive', label: '지난 매거진' },
  ];

  return (
    <>
      {/* ─── 글 상세 읽기 뷰 ─── */}
      {viewingPost && (
        <PostDetailView
          post={viewingPost}
          onClose={() => setViewingPost(null)}
          onPlaceClick={(place) => {
            setViewingPost(null);
            setTimeout(() => handlePlaceClick(place), 150);
          }}
          liked={!!liked[viewingPost.id]}
          onToggleLike={() =>
            setLiked((prev) => ({ ...prev, [viewingPost.id]: !prev[viewingPost.id] }))
          }
        />
      )}

      {!viewingPost && <div className="flex-1 overflow-y-auto bg-warm-50 relative">
        {/* 헤더 */}
        <div className="bg-surface px-4 pt-5 pb-0 border-b border-warm-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📖</span>
            <h2 className="text-lg font-bold text-warm-900">핫플레이스</h2>
          </div>
          <p className="text-xs text-warm-400 mb-4">매주 새로운 반려동물 트렌드와 추천 장소</p>
          <div className="flex gap-0 border-b border-warm-200 -mx-4 px-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                  setSelectedTag('');
                }}
                className={`px-4 py-2.5 text-sm font-semibold relative transition-colors ${
                  activeTab === tab.id ? 'text-warm-900' : 'text-warm-400'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-warm-900 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface rounded-2xl border border-warm-100 p-4 flex gap-3">
                <SkeletonBox className="w-20 h-20 rounded-xl shrink-0" />
                <div className="flex-1">
                  <SkeletonBox className="w-2/3 h-4 mb-2" />
                  <SkeletonBox className="w-full h-3" />
                  <SkeletonBox className="w-1/2 h-3 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="bg-surface rounded-2xl p-8 text-center border border-warm-100">
              <span className="text-3xl block mb-2">⚠️</span>
              <p className="text-sm text-warm-700 font-medium">{error}</p>
              <button onClick={loadPosts} className="mt-3 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">
                다시 시도
              </button>
            </div>
          </div>
        ) : (
          <div className="pb-6">
            {/* ─── 최신 탭: 추천 배너 ─── */}
            {activeTab === 'latest' && featured && (
              <div className="p-4 pb-0">
                <button
                  className={`w-full text-left bg-gradient-to-br ${featured.gradient} rounded-2xl overflow-hidden relative`}
                  onClick={() => setViewingPost(featured)}
                >
                  <span className="absolute -right-4 -bottom-4 text-8xl opacity-20">{featured.emoji}</span>
                  <div className="p-5 relative z-10">
                    <span className="bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-pink-600 mb-2 inline-block">
                      이번 주 추천
                    </span>
                    <h3 className="text-white text-lg font-bold leading-snug">{featured.title}</h3>
                    <p className="text-white/80 text-xs mt-1">{featured.subtitle}</p>
                    <p className="text-white/70 text-[13px] mt-2 leading-relaxed line-clamp-2">{featured.summary}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-white/60 text-[10px]">{formatDate(featured.created_at)}</span>
                      <span className="text-white/40">·</span>
                      <span className="text-white/60 text-[10px]">{featured.read_time} 읽기</span>
                      <span className="text-white/40">·</span>
                      <span className="text-white/60 text-[10px]">❤️ {featured.like_count}</span>
                      {featured.places.length > 0 && (
                        <>
                          <span className="text-white/40">·</span>
                          <span className="text-white/60 text-[10px]">{featured.places.length}곳 추천</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 추천 장소 미리보기 */}
                  {featured.places.length > 0 && (
                    <div className="bg-black/20 backdrop-blur-sm px-5 py-3 relative z-10">
                      <p className="text-[10px] font-bold text-white/70 mb-1.5">📍 추천 장소</p>
                      <div className="flex gap-2 overflow-hidden">
                        {featured.places.slice(0, 3).map((place) => (
                          <span key={place.id} className="text-[11px] text-white/80 bg-white/15 px-2.5 py-1 rounded-full truncate">
                            {place.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* ─── 지난 매거진 탭: 검색 + 태그 필터 ─── */}
            {activeTab === 'archive' && (
              <div className="px-4 pt-4 space-y-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="매거진 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface border border-warm-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-warm-900 placeholder:text-warm-400 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setSelectedTag('')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      !selectedTag ? 'bg-warm-900 text-white' : 'bg-surface text-warm-600 border border-warm-200'
                    }`}
                  >
                    전체
                  </button>
                  {topTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedTag === tag ? 'bg-warm-900 text-white' : 'bg-surface text-warm-600 border border-warm-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                  {restTags.length > 0 && (
                    <select
                      value={restTags.includes(selectedTag) ? selectedTag : ''}
                      onChange={(e) => setSelectedTag(e.target.value || '')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors appearance-none cursor-pointer outline-none ${
                        restTags.includes(selectedTag)
                          ? 'bg-warm-900 text-white'
                          : 'bg-surface text-warm-600 border border-warm-200'
                      }`}
                    >
                      <option value="">+ 더보기</option>
                      {restTags.map((tag) => (
                        <option key={tag} value={tag}>#{tag}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* ─── 포스트 목록 ─── */}
            <div className="px-4 pt-4 flex flex-col gap-3">
              {displayPosts.map((post) => (
                <CompactCard
                  key={post.id}
                  post={post}
                  liked={!!liked[post.id]}
                  onToggleLike={() => setLiked((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                  onPlaceClick={handlePlaceClick}
                  onOpenPost={() => setViewingPost(post)}
                />
              ))}

              {displayPosts.length === 0 && (
                <div className="bg-surface rounded-2xl p-8 text-center border border-warm-100">
                  <span className="text-3xl block mb-2">{activeTab === 'archive' ? '🔍' : '📭'}</span>
                  <p className="text-sm text-warm-600 font-medium">
                    {activeTab === 'archive'
                      ? searchQuery || selectedTag ? '검색 결과가 없습니다' : '지난 매거진이 없습니다'
                      : '등록된 매거진이 없어요'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>}
      <PlaceDetailSheet />
    </>
  );
}

/* ─── 글 상세 읽기 뷰 ─── */
function PostDetailView({
  post,
  onClose,
  onPlaceClick,
  liked,
  onToggleLike,
}: {
  post: MagazinePost;
  onClose: () => void;
  onPlaceClick: (place: MagazinePlace) => void;
  liked: boolean;
  onToggleLike: () => void;
}) {
  useEscapeKey(onClose);
  useBackButton(true, onClose);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 30);
  };

  return (
    <div className="flex-1 z-50 bg-surface flex flex-col animate-slide-up overflow-hidden">
      {/* 커버 — 스크롤 시 축소 */}
      <div className="relative shrink-0">
        <div
          className={`relative w-full bg-gradient-to-br ${post.gradient} overflow-hidden transition-all duration-300 ease-out ${
            scrolled ? 'h-14' : 'aspect-[16/10]'
          }`}
        >
          <span
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 transition-all duration-300 ${
              scrolled ? 'text-2xl' : 'text-7xl'
            }`}
          >
            {post.emoji}
          </span>
          <div className={`absolute inset-0 transition-opacity duration-300 ${scrolled ? 'bg-black/30' : 'bg-gradient-to-t from-black/60 via-transparent to-transparent'}`} />
        </div>
        {/* 뒤로가기 버튼 — 커버 위에 겹쳐 배치 (overflow 영향 없음) */}
        <button
          onClick={onClose}
          className={`absolute z-10 left-3 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 ${
            scrolled ? 'top-2' : 'top-3'
          }`}
          aria-label="뒤로가기"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="14,6 8,12 14,18" />
          </svg>
        </button>

        {/* 펼쳐진 상태: 제목 + 부제목 */}
        <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {post.is_featured && (
            <span className="bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-pink-600 mb-2 inline-block">
              이번 주 추천
            </span>
          )}
          <h1 className="text-white text-xl font-bold leading-tight">{post.title}</h1>
          <p className="text-white/80 text-sm mt-1">{post.subtitle}</p>
        </div>

        {/* 축소된 상태: 한 줄 제목 */}
        <div className={`absolute inset-0 flex items-center pl-14 pr-4 transition-all duration-300 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <h1 className="text-white text-sm font-bold truncate">{post.title}</h1>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {/* 작성자 + 날짜 */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-warm-100">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base"
            style={{ backgroundColor: post.accent_color + '15' }}
          >
            {post.emoji}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-warm-900">{post.author}</p>
            <p className="text-xs text-warm-400">
              {new Date(post.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {' · '}
              {post.read_time} 읽기
            </p>
          </div>
          <button onClick={onToggleLike} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warm-50 border border-warm-200">
            <span className="text-sm">{liked ? '❤️' : '🤍'}</span>
            <span className="text-xs font-medium text-warm-600">{post.like_count + (liked ? 1 : 0)}</span>
          </button>
        </div>

        {/* 태그 */}
        <div className="px-5 py-3 flex gap-1.5 flex-wrap border-b border-warm-50">
          {(post.tags as string[]).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
              style={{
                borderColor: post.accent_color + '30',
                color: post.accent_color,
                backgroundColor: post.accent_color + '08',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 요약 */}
        <div className="px-5 py-4 border-b border-warm-100">
          <p className="text-[15px] text-warm-700 leading-relaxed font-medium">{post.summary}</p>
        </div>

        {/* 본문 내용 */}
        {post.content && (
          <div className="px-5 py-4 border-b border-warm-100">
            <RichContent content={post.content} />
          </div>
        )}

        {/* 추천 장소 */}
        {post.places.length > 0 && (
          <div className="px-4 py-4">
            <h2 className="font-bold text-base text-warm-900 mb-4 flex items-center gap-2 px-1">
              <span className="w-1 h-5 rounded-full" style={{ backgroundColor: post.accent_color }} />
              추천 장소 ({post.places.length}곳)
            </h2>
            <div className="flex flex-col gap-3">
              {post.places.map((place, i) => (
                <button
                  key={place.id}
                  onClick={() => onPlaceClick(place)}
                  className="flex gap-3.5 p-4 bg-warm-50 rounded-2xl border border-warm-100 text-left hover:bg-warm-100/60 transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 font-extrabold"
                    style={{ backgroundColor: post.accent_color + '15', color: post.accent_color }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-warm-900">{place.name}</h3>
                    <p className="text-xs text-warm-500 mt-0.5 truncate">{place.address}</p>
                    <div className="flex gap-1 mt-2">
                      {(place.tags as string[]).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ backgroundColor: post.accent_color + '10', color: post.accent_color }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="#D1D5DB" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-3">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="h-20" />
      </div>
    </div>
  );
}

/* ─── 리치 콘텐츠 렌더러 (텍스트 + 이미지) ─── */
function RichContent({ content }: { content: string }) {
  // {{IMG:url}} 패턴을 이미지로, ## 제목을 h3로 렌더링
  const parts = content.split(/({{IMG:[^}]+}})/g);

  return (
    <div className="space-y-4">
      {parts.map((part, i) => {
        const imgMatch = part.match(/^{{IMG:(.+)}}$/);
        if (imgMatch) {
          return (
            <div key={i} className="rounded-xl overflow-hidden -mx-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgMatch[1]}
                alt=""
                className="w-full h-auto object-cover rounded-xl"
                loading="lazy"
              />
            </div>
          );
        }
        if (!part.trim()) return null;
        // 줄 단위로 파싱 (## 헤더, - 리스트, 일반 텍스트)
        return (
          <div key={i} className="space-y-2">
            {part.split('\n').map((line, j) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={j} className="h-2" />;
              if (trimmed.startsWith('## ')) {
                return <h3 key={j} className="text-base font-bold text-warm-900 mt-4 mb-1">{trimmed.slice(3)}</h3>;
              }
              if (trimmed.startsWith('### ')) {
                return <h4 key={j} className="text-sm font-bold text-warm-800 mt-3 mb-1">{trimmed.slice(4)}</h4>;
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('✅') || trimmed.startsWith('✓')) {
                return (
                  <p key={j} className="text-sm text-warm-600 leading-relaxed pl-3 flex gap-2">
                    <span className="text-warm-400 shrink-0">{trimmed.startsWith('✅') ? '✅' : '·'}</span>
                    <span>{trimmed.startsWith('- ') ? trimmed.slice(2) : trimmed.startsWith('✅') ? trimmed.slice(2) : trimmed}</span>
                  </p>
                );
              }
              if (/^\d+\./.test(trimmed)) {
                return <p key={j} className="text-sm text-warm-600 leading-relaxed pl-3">{trimmed}</p>;
              }
              // 볼드 처리 **text**
              const boldParsed = trimmed.split(/(\*\*[^*]+\*\*)/g).map((seg, k) => {
                if (seg.startsWith('**') && seg.endsWith('**')) {
                  return <strong key={k} className="font-semibold text-warm-800">{seg.slice(2, -2)}</strong>;
                }
                return <span key={k}>{seg}</span>;
              });
              return <p key={j} className="text-sm text-warm-600 leading-relaxed">{boldParsed}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ─── 컴팩트 카드 ─── */
function CompactCard({
  post,
  liked,
  onToggleLike,
  onPlaceClick,
  onOpenPost,
}: {
  post: MagazinePost;
  liked: boolean;
  onToggleLike: () => void;
  onPlaceClick: (place: MagazinePlace) => void;
  onOpenPost: () => void;
}) {
  const firstPlace = post.places[0];

  return (
    <article className="bg-surface rounded-2xl border border-warm-100 overflow-hidden">
      <button className="w-full flex items-stretch text-left" onClick={onOpenPost}>
        {/* 왼쪽 썸네일 */}
        <div className={`w-24 shrink-0 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
          <span className="text-3xl">{post.emoji}</span>
        </div>

        {/* 오른쪽 정보 */}
        <div className="flex-1 min-w-0 p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-warm-400">{formatDate(post.created_at)}</span>
          </div>
          <h3 className="text-sm font-bold text-warm-900 leading-snug line-clamp-2">{post.title}</h3>
          <div className="flex gap-1 mt-1.5">
            {(post.tags as string[]).slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] font-medium" style={{ color: post.accent_color }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </button>

      {/* 하단 메타 (카드 밖 클릭 영역) */}
      <div className="px-3 pb-2.5 flex items-center gap-3 ml-24">
        {firstPlace && (
          <button
            onClick={(e) => { e.stopPropagation(); onPlaceClick(firstPlace); }}
            className="flex items-center gap-1 text-left group"
          >
            <span className="text-[10px]">📍</span>
            <span className="text-[11px] font-semibold text-warm-600 group-hover:text-primary truncate max-w-[120px]">
              {firstPlace.name}
            </span>
          </button>
        )}
        {post.places.length > 1 && (
          <span className="text-[10px] text-warm-400">+{post.places.length - 1}곳</span>
        )}
        <div className="flex-1" />
        <button onClick={(e) => { e.stopPropagation(); onToggleLike(); }} className="flex items-center gap-1">
          <span className="text-[11px]">{liked ? '❤️' : '🤍'}</span>
          <span className="text-[10px] text-warm-500">{post.like_count + (liked ? 1 : 0)}</span>
        </button>
        <span className="text-[10px] text-warm-400">{post.read_time}</span>
      </div>
    </article>
  );
}
