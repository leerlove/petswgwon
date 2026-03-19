import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yngzeshxngfeyiabxeyi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3zauWrzjkRY6OR9zAVtXgA_LKCElbHl';

let supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 관리자로 로그인하여 RLS 통과
const { error: authErr } = await supabase.auth.signInWithPassword({
  email: 'inervet@inervet.com',
  password: 'Qa485024!@!@',
});
if (authErr) {
  console.error('❌ 로그인 실패:', authErr.message);
  process.exit(1);
}
console.log('🔑 관리자 로그인 성공\n');

const MAGAZINE_POSTS = [
  {
    title: '봄맞이 반려견과 떠나는 벚꽃 브런치 투어',
    subtitle: '서울 근교 펫프렌들리 브런치 카페 5곳',
    summary: '벚꽃 시즌, 반려견과 함께 즐기는 브런치는 특별합니다. 테라스에서 꽃잎 날리는 풍경을 감상하며 여유로운 주말 아침을 보내보세요.',
    content: '봄바람이 불어오는 3월, 사랑하는 반려견과 함께 특별한 브런치 타임을 즐겨보세요.',
    emoji: '🌸', gradient: 'from-pink-300 to-rose-400', accent_color: '#F472B6',
    tags: ['봄', '브런치', '벚꽃', '카페'], read_time: '3분', like_count: 42,
    is_featured: true, sort_order: 20, place_query: 'cafe',
  },
  {
    title: '대형견도 환영! 넓은 독파크 BEST',
    subtitle: '골든리트리버, 사모예드도 마음껏 뛰어노는 곳',
    summary: '대형견 집사라면 꼭 알아야 할 넓은 독파크를 소개합니다.',
    content: '대형견을 키우는 집사들의 가장 큰 고민, 어디서 마음껏 뛰어놀게 해줄까?',
    emoji: '🐕‍🦺', gradient: 'from-violet-400 to-purple-600', accent_color: '#8B5CF6',
    tags: ['대형견', '독파크', '오프리쉬'], read_time: '4분', like_count: 89,
    sort_order: 19, place_query: 'playground',
  },
  {
    title: '우리 아이 피부가 간지러워요 - 알러지 대처법',
    subtitle: '반려견 아토피·알러지 전문 동물병원 추천',
    summary: '환절기마다 심해지는 피부 트러블, 전문 병원에서 정확한 진단을 받아보세요.',
    content: '봄이 오면 반려견 피부 트러블도 함께 찾아옵니다.',
    emoji: '🏥', gradient: 'from-emerald-400 to-teal-500', accent_color: '#14B8A6',
    tags: ['피부', '알러지', '동물병원'], read_time: '5분', like_count: 67,
    sort_order: 18, place_query: 'vet',
  },
  {
    title: '비 오는 날 실내에서 즐기는 펫카페 투어',
    subtitle: '날씨 걱정 없는 실내 펫프렌들리 카페',
    summary: '비가 와도 걱정 없어요! 실내에서 반려견과 함께 즐길 수 있는 카페를 모았습니다.',
    content: '장마철, 우중충한 날씨에도 반려견과 즐거운 시간을 보낼 수 있는 곳들을 소개합니다.',
    emoji: '☔', gradient: 'from-blue-400 to-indigo-500', accent_color: '#3B82F6',
    tags: ['실내', '카페', '비오는날'], read_time: '3분', like_count: 55,
    sort_order: 17, place_query: 'cafe',
  },
  {
    title: '반려견과 함께하는 캠핑 가이드',
    subtitle: '펫 동반 가능한 캠핑장 & 준비물 체크리스트',
    summary: '자연 속에서 반려견과 함께하는 캠핑, 어떻게 준비해야 할까요?',
    content: '봄, 가을 캠핑 시즌에 맞춰 반려견 동반 캠핑 준비물과 추천 캠핑장을 정리했습니다.',
    emoji: '⛺', gradient: 'from-lime-300 to-green-500', accent_color: '#84CC16',
    tags: ['캠핑', '자연', '준비물'], read_time: '6분', like_count: 103,
    sort_order: 16, place_query: 'camping',
  },
  {
    title: '강아지 미용, 어디서 할까?',
    subtitle: '견종별 추천 미용실 & 스타일 가이드',
    summary: '우리 아이에게 딱 맞는 미용실 찾기, 견종별 추천 미용 스타일까지!',
    content: '반려견 미용은 단순 외모 관리가 아닌 건강 관리의 시작입니다.',
    emoji: '✂️', gradient: 'from-orange-300 to-amber-500', accent_color: '#F59E0B',
    tags: ['미용', '그루밍', '스타일'], read_time: '4분', like_count: 71,
    sort_order: 15, place_query: 'grooming',
  },
  {
    title: '서울 한강 산책 코스 TOP 5',
    subtitle: '반려견과 함께 걷기 좋은 한강 둔치',
    summary: '한강변 산책은 반려견에게 최고의 선물! 코스별 특징과 주의사항을 알려드립니다.',
    content: '서울에서 반려견과 산책하기 가장 좋은 한강 코스를 소개합니다.',
    emoji: '🌊', gradient: 'from-cyan-300 to-sky-500', accent_color: '#06B6D4',
    tags: ['한강', '산책', '서울'], read_time: '4분', like_count: 128,
    sort_order: 14, place_query: 'playground',
  },
  {
    title: '반려견 건강검진, 이것만은 꼭!',
    subtitle: '연령별 필수 검진 항목과 추천 병원',
    summary: '우리 아이 건강을 지키는 첫걸음, 정기 검진의 모든 것을 알려드립니다.',
    content: '반려견도 사람처럼 정기 건강검진이 필요합니다.',
    emoji: '💉', gradient: 'from-red-400 to-rose-600', accent_color: '#EF4444',
    tags: ['건강검진', '동물병원', '예방접종'], read_time: '5분', like_count: 94,
    sort_order: 13, place_query: 'vet',
  },
  {
    title: '펫프렌들리 숙소에서 보내는 주말 여행',
    subtitle: '반려견 동반 가능한 호텔·펜션 추천',
    summary: '반려견과 함께 특별한 주말을 보낼 수 있는 숙소를 엄선했습니다.',
    content: '여행은 반려견과 함께해야 더 즐겁습니다.',
    emoji: '🏨', gradient: 'from-violet-400 to-purple-600', accent_color: '#8B5CF6',
    tags: ['숙박', '여행', '펜션', '호텔'], read_time: '5분', like_count: 156,
    sort_order: 12, place_query: 'accommodation',
  },
  {
    title: '강아지 간식 맛집 탐방',
    subtitle: '수제 간식부터 펫 베이커리까지',
    summary: '우리 아이가 좋아하는 건강한 간식을 직접 구매할 수 있는 매장을 소개합니다.',
    content: '반려견 간식도 퀄리티가 중요한 시대! 믿을 수 있는 수제 간식 매장을 찾아봤습니다.',
    emoji: '🦴', gradient: 'from-orange-300 to-amber-500', accent_color: '#F59E0B',
    tags: ['간식', '수제간식', '베이커리'], read_time: '3분', like_count: 78,
    sort_order: 11, place_query: 'supplies',
  },
  {
    title: '소형견 집사를 위한 안전한 놀이터',
    subtitle: '소형견 전용 공간이 있는 곳',
    summary: '대형견이 무서운 소형견 친구들도 안심하고 뛰어놀 수 있는 전용 공간을 모았습니다.',
    content: '소형견 집사들의 가장 큰 걱정, 대형견과의 충돌! 소형견 전용 공간을 소개합니다.',
    emoji: '🐶', gradient: 'from-pink-300 to-rose-400', accent_color: '#F472B6',
    tags: ['소형견', '놀이터', '안전'], read_time: '3분', like_count: 63,
    sort_order: 10, place_query: 'playground',
  },
  {
    title: '반려견 수영장 오픈! 여름 물놀이 스팟',
    subtitle: '강아지도 시원하게! 펫 수영장 추천',
    summary: '더운 여름, 반려견과 함께 시원하게 물놀이를 즐길 수 있는 곳을 소개합니다.',
    content: '무더운 여름, 반려견도 물놀이로 더위를 식혀보세요!',
    emoji: '🏊', gradient: 'from-cyan-300 to-sky-500', accent_color: '#06B6D4',
    tags: ['여름', '수영장', '물놀이'], read_time: '4분', like_count: 112,
    sort_order: 9, place_query: 'playground',
  },
  {
    title: '노견 케어 가이드',
    subtitle: '나이 든 반려견을 위한 특별한 관리법',
    summary: '시니어 반려견에게 필요한 건강관리와 생활 팁을 정리했습니다.',
    content: '함께한 세월만큼 더 세심한 케어가 필요한 시니어 반려견.',
    emoji: '🤍', gradient: 'from-emerald-400 to-teal-500', accent_color: '#14B8A6',
    tags: ['노견', '시니어', '건강관리'], read_time: '6분', like_count: 87,
    sort_order: 8, place_query: 'vet',
  },
  {
    title: '반려견과 드라이브! 차로 떠나는 근교 여행',
    subtitle: '경기도 펫프렌들리 드라이브 코스',
    summary: '주말에 반려견과 함께 차를 타고 떠나는 근교 여행 코스를 소개합니다.',
    content: '창문 밖 바람을 맞으며 신나는 반려견! 함께 떠나는 드라이브 여행.',
    emoji: '🚗', gradient: 'from-blue-400 to-indigo-500', accent_color: '#3B82F6',
    tags: ['드라이브', '근교', '경기도'], read_time: '4분', like_count: 95,
    sort_order: 7, place_query: 'travel',
  },
  {
    title: '댕댕이와 함께하는 가을 단풍 나들이',
    subtitle: '반려견과 걷기 좋은 단풍 명소',
    summary: '빨갛고 노란 단풍길을 반려견과 함께 걸어보세요.',
    content: '가을의 정취를 반려견과 함께 즐길 수 있는 단풍 산책로를 모았습니다.',
    emoji: '🍁', gradient: 'from-orange-300 to-amber-500', accent_color: '#F59E0B',
    tags: ['가을', '단풍', '산책'], read_time: '3분', like_count: 74,
    sort_order: 6, place_query: 'travel',
  },
  {
    title: '강아지 호텔링, 어디가 좋을까?',
    subtitle: '출장·여행 시 믿고 맡길 수 있는 호텔링',
    summary: '잠깐 떨어져 있어야 할 때, 안심하고 맡길 수 있는 호텔링을 소개합니다.',
    content: '부득이하게 반려견을 맡겨야 할 때, 꼼꼼하게 비교해보세요.',
    emoji: '🏠', gradient: 'from-violet-400 to-purple-600', accent_color: '#8B5CF6',
    tags: ['호텔링', '위탁', '펫시터'], read_time: '4분', like_count: 66,
    sort_order: 5, place_query: 'hotel_care',
  },
  {
    title: '반려견 동반 레스토랑 BEST',
    subtitle: '사람도 만족, 강아지도 만족하는 맛집',
    summary: '반려견과 함께 식사할 수 있는 퀄리티 높은 레스토랑을 엄선했습니다.',
    content: '좋은 음식을 반려견과 함께 즐기고 싶은 집사들을 위한 맛집 가이드.',
    emoji: '🍽️', gradient: 'from-red-400 to-rose-600', accent_color: '#EF4444',
    tags: ['맛집', '레스토랑', '식사'], read_time: '4분', like_count: 143,
    sort_order: 4, place_query: 'restaurant',
  },
  {
    title: '겨울철 반려견 건강 지키기',
    subtitle: '추운 날씨 대비 건강 관리 & 용품 추천',
    summary: '겨울철 반려견 건강을 위해 꼭 알아야 할 관리법과 필수 용품을 소개합니다.',
    content: '영하의 날씨에도 건강하게! 겨울철 반려견 케어 가이드.',
    emoji: '❄️', gradient: 'from-blue-400 to-indigo-500', accent_color: '#3B82F6',
    tags: ['겨울', '건강', '용품'], read_time: '5분', like_count: 58,
    sort_order: 3, place_query: 'supplies',
  },
  {
    title: '펫티켓 완전 정복',
    subtitle: '공공장소에서 지켜야 할 반려견 에티켓',
    summary: '함께 사는 세상, 반려견과 비반려인 모두 행복해지는 펫티켓을 알아봅니다.',
    content: '카페, 공원, 대중교통 등 장소별 펫티켓 가이드.',
    emoji: '🎓', gradient: 'from-emerald-400 to-teal-500', accent_color: '#14B8A6',
    tags: ['펫티켓', '에티켓', '매너'], read_time: '4분', like_count: 91,
    sort_order: 2, place_query: 'cafe',
  },
  {
    title: '강아지 생일 파티 플래닝',
    subtitle: '반려견 생일을 특별하게 보내는 방법',
    summary: '우리 아이 생일, 특별한 케이크와 함께 축하해주세요!',
    content: '반려견 생일 파티를 위한 펫 케이크, 장소, 준비물 가이드.',
    emoji: '🎂', gradient: 'from-pink-300 to-rose-400', accent_color: '#F472B6',
    tags: ['생일', '파티', '케이크'], read_time: '3분', like_count: 84,
    sort_order: 1, place_query: 'cafe',
  },
];

// sub_category 매핑
const QUERY_TO_SUBCATEGORY = {
  cafe: 'cafe',
  playground: 'playground',
  vet: 'vet',
  camping: 'camping',
  grooming: 'grooming',
  accommodation: 'accommodation',
  supplies: 'supplies',
  travel: 'travel',
  hotel_care: 'hotel_care',
  restaurant: 'restaurant',
};

async function main() {
  console.log('📖 매거진 샘플 데이터 등록 시작...\n');

  for (const postData of MAGAZINE_POSTS) {
    const { place_query, ...post } = postData;

    // 1. 매거진 포스트 생성
    const { data: created, error } = await supabase
      .from('magazine_posts')
      .insert(post)
      .select()
      .single();

    if (error) {
      console.error(`❌ "${post.title}" 생성 실패:`, error.message);
      continue;
    }

    console.log(`✅ "${post.title}" 생성 (${created.id})`);

    // 2. 관련 장소 3개 연결
    const subCat = QUERY_TO_SUBCATEGORY[place_query];
    const { data: places } = await supabase
      .from('places')
      .select('id')
      .eq('sub_category', subCat)
      .limit(3);

    if (places && places.length > 0) {
      const links = places.map((p, i) => ({
        post_id: created.id,
        place_id: p.id,
        sort_order: i,
      }));

      const { error: linkErr } = await supabase
        .from('magazine_post_places')
        .insert(links);

      if (linkErr) {
        console.log(`   ⚠️ 장소 연결 실패: ${linkErr.message}`);
      } else {
        console.log(`   📍 ${places.length}곳 연결됨`);
      }
    } else {
      console.log('   ⚠️ 매칭 장소 없음');
    }
  }

  // 검증
  const { count } = await supabase
    .from('magazine_posts')
    .select('*', { count: 'exact', head: true });
  console.log(`\n🎉 완료! 총 ${count}건 등록됨`);
}

main().catch(console.error);
