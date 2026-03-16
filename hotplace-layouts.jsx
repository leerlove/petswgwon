import { useState } from "react";

// 샘플 데이터
const SAMPLE_POSTS = [
  {
    id: 1,
    title: "봄맞이 반려견과 떠나는 벚꽃 브런치 투어",
    subtitle: "서울 근교 펫프렌들리 브런치 카페 5곳",
    summary: "벚꽃 시즌, 반려견과 함께 즐기는 브런치는 특별합니다. 테라스에서 꽃잎 날리는 풍경을 감상하며 여유로운 주말 아침을 보내보세요.",
    content: "봄바람이 불어오는 3월, 사랑하는 반려견과 함께 특별한 브런치 타임을 즐겨보세요. 오늘은 서울 근교에서 벚꽃을 감상하며 반려견과 함께할 수 있는 브런치 카페를 소개합니다...",
    coverImage: null,
    emoji: "🌸",
    gradient: "from-pink-300 to-rose-400",
    accentColor: "#F472B6",
    author: "펫세권 에디터",
    date: "2026.03.09",
    weekLabel: "3월 2주차",
    tags: ["봄", "브런치", "벚꽃", "카페"],
    places: [
      { name: "카페 블룸", category: "카페", distance: "2.3km", tags: ["테라스", "펫메뉴"] },
      { name: "더가든브런치", category: "음식점", distance: "5.1km", tags: ["브런치", "정원"] },
      { name: "봄날의카페", category: "카페", distance: "3.8km", tags: ["벚꽃뷰", "대형견가능"] },
    ],
    readTime: "3분",
    likeCount: 42,
  },
  {
    id: 2,
    title: "대형견도 환영! 넓은 독파크 BEST 5",
    subtitle: "골든리트리버, 사모예드도 마음껏 뛰어노는 곳",
    summary: "대형견 집사라면 꼭 알아야 할 넓은 독파크를 소개합니다. 울타리 안에서 오프리쉬로 자유롭게!",
    content: "대형견을 키우는 집사들의 가장 큰 고민, '어디서 마음껏 뛰어놀게 해줄까?' 오늘은 대형견도 넉넉하게 뛰어놀 수 있는 넓은 독파크를 소개합니다...",
    coverImage: null,
    emoji: "🐕‍🦺",
    gradient: "from-violet-400 to-purple-600",
    accentColor: "#8B5CF6",
    author: "펫세권 에디터",
    date: "2026.03.02",
    weekLabel: "3월 1주차",
    tags: ["대형견", "독파크", "오프리쉬"],
    places: [
      { name: "멍멍파크 잠실", category: "운동장", distance: "1.2km", tags: ["오프리쉬", "대형견"] },
      { name: "해피독런 일산", category: "운동장", distance: "12km", tags: ["넓은잔디밭", "주차가능"] },
    ],
    readTime: "4분",
    likeCount: 89,
  },
  {
    id: 3,
    title: "우리 아이 피부가 간지러워요 - 알러지 대처법",
    subtitle: "반려견 아토피·알러지 전문 동물병원 추천",
    summary: "환절기마다 심해지는 피부 트러블, 전문 병원에서 정확한 진단을 받아보세요.",
    content: "봄이 오면 반려견 피부 트러블도 함께 찾아옵니다. 아토피, 식이 알러지, 접촉성 피부염 등 다양한 원인이 있는데요...",
    coverImage: null,
    emoji: "🏥",
    gradient: "from-emerald-400 to-teal-500",
    accentColor: "#14B8A6",
    author: "펫세권 에디터",
    date: "2026.02.24",
    weekLabel: "2월 4주차",
    tags: ["피부", "알러지", "동물병원"],
    places: [
      { name: "더피부동물병원", category: "동물병원", distance: "4.2km", tags: ["피부과전문", "알러지검사"] },
    ],
    readTime: "5분",
    likeCount: 67,
  },
];

// ─── 레이아웃 A: 카드 매거진 (세로 스크롤, 큰 커버) ───
function LayoutA() {
  const [liked, setLiked] = useState({});
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 p-5 pb-7 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-white/70 tracking-wider uppercase">Weekly Magazine</p>
            <h2 className="text-xl font-bold mt-0.5">핫플레이스</h2>
          </div>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">3월 2주차</span>
        </div>
        <p className="text-sm text-white/80">매주 새로운 테마로 만나는 반려동물 큐레이션</p>
      </div>

      {/* 이번 주 메인 포스트 (크게) */}
      <div className="p-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className={`w-full aspect-[16/9] bg-gradient-to-br ${SAMPLE_POSTS[0].gradient} flex items-center justify-center relative`}>
            <span className="text-6xl">{SAMPLE_POSTS[0].emoji}</span>
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur-sm text-pink-600 px-2.5 py-1 rounded-full text-[10px] font-bold">이번 주 매거진</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 pt-10">
              <h3 className="text-white text-lg font-bold leading-snug">{SAMPLE_POSTS[0].title}</h3>
              <p className="text-white/80 text-xs mt-1">{SAMPLE_POSTS[0].subtitle}</p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 leading-relaxed">{SAMPLE_POSTS[0].summary}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{SAMPLE_POSTS[0].date}</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">{SAMPLE_POSTS[0].readTime} 읽기</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{SAMPLE_POSTS[0].places.length}곳 추천</span>
                <button onClick={() => setLiked(p => ({...p, 0: !p[0]}))} className="flex items-center gap-1">
                  <span className="text-sm">{liked[0] ? '❤️' : '🤍'}</span>
                  <span className="text-xs text-gray-500">{SAMPLE_POSTS[0].likeCount + (liked[0] ? 1 : 0)}</span>
                </button>
              </div>
            </div>
          </div>
          {/* 추천 장소 미리보기 */}
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[11px] font-bold text-gray-500 mb-2">📍 추천 장소</p>
              <div className="flex gap-2 overflow-x-auto">
                {SAMPLE_POSTS[0].places.map((p, i) => (
                  <div key={i} className="bg-white rounded-lg px-3 py-2 border border-gray-100 shrink-0 min-w-[140px]">
                    <p className="text-xs font-bold text-gray-800">{p.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{p.category} · {p.distance}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 지난 포스트들 (작게) */}
      <div className="px-4 pb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-3">지난 매거진</h3>
        <div className="flex flex-col gap-3">
          {SAMPLE_POSTS.slice(1).map((post, idx) => (
            <button key={post.id} onClick={() => setExpanded(expanded === idx ? null : idx)} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left">
              <div className="flex items-stretch">
                <div className={`w-24 shrink-0 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                  <span className="text-3xl">{post.emoji}</span>
                </div>
                <div className="p-3 flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium">{post.weekLabel}</p>
                  <h4 className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-2 leading-snug">{post.title}</h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-gray-400">{post.readTime} 읽기</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[10px] text-gray-400">{post.places.length}곳 추천</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[10px] text-gray-400">❤️ {post.likeCount}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 레이아웃 B: 인스타그램/브런치 스타일 (풀폭 이미지 + 텍스트 오버레이) ───
function LayoutB() {
  const [liked, setLiked] = useState({});

  return (
    <div className="flex-1 overflow-y-auto bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 미니멀 헤더 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">핫플레이스</h2>
          <p className="text-[10px] text-gray-400">매주 월요일 업데이트</p>
        </div>
        <span className="bg-gray-100 px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-600">3월 2주차</span>
      </div>

      {/* 포스트 피드 */}
      <div className="flex flex-col">
        {SAMPLE_POSTS.map((post, idx) => (
          <article key={post.id} className="border-b border-gray-100">
            {/* 커버 영역 */}
            <div className={`w-full aspect-[4/3] bg-gradient-to-br ${post.gradient} relative`}>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl opacity-30">{post.emoji}</span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ color: post.accentColor }}>{post.weekLabel}</span>
                <span className="text-white/80 text-xs">{post.readTime} 읽기</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white text-xl font-bold leading-tight">{post.title}</h3>
                <p className="text-white/70 text-sm mt-1">{post.subtitle}</p>
              </div>
            </div>

            {/* 본문 프리뷰 */}
            <div className="px-4 py-4">
              <p className="text-sm text-gray-700 leading-relaxed">{post.summary}</p>

              {/* 추천 장소 */}
              <div className="mt-4">
                {post.places.map((place, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: post.accentColor + '15', color: post.accentColor }}>{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{place.name}</p>
                      <p className="text-xs text-gray-400">{place.category} · {place.distance}</p>
                    </div>
                    <svg width="16" height="16" fill="none" stroke="#D1D5DB" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                ))}
              </div>

              {/* 하단 액션 */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <button onClick={() => setLiked(p => ({...p, [idx]: !p[idx]}))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className="text-sm">{liked[idx] ? '❤️' : '🤍'}</span>
                    <span className="text-xs font-medium text-gray-600">{post.likeCount + (liked[idx] ? 1 : 0)}</span>
                  </button>
                  <span className="text-xs text-gray-400">{post.tags.map(t => `#${t}`).join(' ')}</span>
                </div>
                <button className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: post.accentColor + '10', color: post.accentColor }}>더 읽기</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── 레이아웃 C: 네이버 블로그/포스트 스타일 (타이포 중심, 깔끔) ───
function LayoutC() {
  const [liked, setLiked] = useState({});
  const [activeTab, setActiveTab] = useState("latest");

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 헤더 */}
      <div className="bg-white px-4 pt-5 pb-0 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📖</span>
          <h2 className="text-lg font-bold text-gray-900">핫플레이스</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">매주 새로운 반려동물 트렌드와 추천 장소</p>
        <div className="flex gap-0 border-b border-gray-200 -mx-4 px-4">
          {[{ id: "latest", label: "최신" }, { id: "popular", label: "인기" }, { id: "nearby", label: "내 주변" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold relative transition-colors ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-400'}`}>
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gray-900 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* 이번 주 추천 배너 */}
      <div className="p-4">
        <div className={`bg-gradient-to-r ${SAMPLE_POSTS[0].gradient} rounded-2xl p-5 relative overflow-hidden`}>
          <span className="absolute -right-4 -bottom-4 text-8xl opacity-20">{SAMPLE_POSTS[0].emoji}</span>
          <span className="bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-pink-600 mb-2 inline-block">이번 주 추천</span>
          <h3 className="text-white text-lg font-bold leading-snug relative z-10">{SAMPLE_POSTS[0].title}</h3>
          <p className="text-white/80 text-xs mt-1.5 relative z-10">{SAMPLE_POSTS[0].subtitle}</p>
          <div className="flex items-center gap-2 mt-3 relative z-10">
            <span className="text-white/60 text-[10px]">{SAMPLE_POSTS[0].date}</span>
            <span className="text-white/40">·</span>
            <span className="text-white/60 text-[10px]">{SAMPLE_POSTS[0].readTime} 읽기</span>
            <span className="text-white/40">·</span>
            <span className="text-white/60 text-[10px]">❤️ {SAMPLE_POSTS[0].likeCount}</span>
          </div>
        </div>
      </div>

      {/* 포스트 목록 */}
      <div className="px-4 pb-6 flex flex-col gap-4">
        {SAMPLE_POSTS.map((post, idx) => (
          <article key={post.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* 포스트 헤더 */}
            <div className="p-4 pb-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: post.accentColor + '15' }}>
                  {post.emoji}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-800">{post.author}</p>
                  <p className="text-[10px] text-gray-400">{post.date} · {post.weekLabel}</p>
                </div>
              </div>

              {/* 제목 + 본문 */}
              <h3 className="text-base font-bold text-gray-900 leading-snug">{post.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mt-2">{post.summary}</p>
            </div>

            {/* 태그 */}
            <div className="px-4 mt-3 flex gap-1.5 flex-wrap">
              {post.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-semibold border" style={{ borderColor: post.accentColor + '30', color: post.accentColor, backgroundColor: post.accentColor + '08' }}>#{tag}</span>
              ))}
            </div>

            {/* 추천 장소 카드 */}
            <div className="px-4 mt-3">
              <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-600">📍 추천 장소 {post.places.length}곳</span>
                  <span className="text-[10px] text-gray-400">모두 보기 →</span>
                </div>
                {post.places.map((place, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-[11px] font-bold w-5 text-center" style={{ color: post.accentColor }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800">{place.name}</p>
                      <div className="flex gap-1 mt-0.5">
                        {place.tags.map(t => (
                          <span key={t} className="text-[9px] text-gray-400">#{t}</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">{place.distance}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 액션 */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50 mt-3">
              <div className="flex items-center gap-4">
                <button onClick={() => setLiked(p => ({...p, [idx]: !p[idx]}))} className="flex items-center gap-1">
                  <span className="text-sm">{liked[idx] ? '❤️' : '🤍'}</span>
                  <span className="text-xs text-gray-500">{post.likeCount + (liked[idx] ? 1 : 0)}</span>
                </button>
                <span className="text-xs text-gray-400">{post.readTime} 읽기</span>
              </div>
              <button className="text-xs font-bold text-gray-700 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">자세히 보기</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── 메인: 탭으로 3개 레이아웃 전환 ───
export default function HotplaceLayoutPreview() {
  const [layout, setLayout] = useState("A");

  const descriptions = {
    A: "카드 매거진형 — 이번 주 메인 포스트를 크게 강조, 지난 포스트는 컴팩트하게",
    B: "인스타/브런치형 — 풀폭 이미지 피드, 스크롤하며 읽는 몰입감 있는 구조",
    C: "네이버 블로그형 — 타이포 중심, 깔끔한 카드 리스트, 탭으로 정렬 전환",
  };

  return (
    <div className="w-full max-w-md mx-auto h-screen flex flex-col bg-gray-100" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 레이아웃 선택 탭 */}
      <div className="bg-white border-b border-gray-200 px-3 pt-3 pb-2 shrink-0">
        <p className="text-[10px] text-gray-400 mb-2 font-medium">레이아웃 미리보기</p>
        <div className="flex gap-2">
          {["A", "B", "C"].map((id) => (
            <button
              key={id}
              onClick={() => setLayout(id)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${layout === id ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {id === "A" ? "A. 카드 매거진" : id === "B" ? "B. 인스타/브런치" : "C. 블로그형"}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">{descriptions[layout]}</p>
      </div>

      {/* 선택된 레이아웃 렌더링 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {layout === "A" && <LayoutA />}
        {layout === "B" && <LayoutB />}
        {layout === "C" && <LayoutC />}
      </div>
    </div>
  );
}
