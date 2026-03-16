import type { MagazineTheme, MagazineSeasonType } from '@/types';

export const MAGAZINE_THEMES: MagazineTheme[] = [
  {
    id: 'brunch_with_dog',
    title: '강아지랑 브런치',
    subtitle: '반려견과 함께하는 감성 브런치 카페 모음',
    summary: '주말 아침, 사랑하는 반려견과 함께 여유로운 브런치를 즐겨보세요. 테라스 석에서 햇살을 받으며 커피 한 잔, 우리 아이에겐 특별한 펫 메뉴까지!',
    emoji: '🥐',
    coverImage: '/images/magazine/brunch.svg',
    gradient: 'from-amber-400 to-orange-500',
    accentColor: '#F59E0B',
    season: 'all',
    filter: { categories: ['food_beverage'], subCategories: ['cafe', 'restaurant'], tags: ['브런치', '카페', '테라스', '펫메뉴'] },
    collection: { searchKeywords: ['반려견 동반 브런치', '강아지 카페 브런치', '펫프렌들리 카페'], naverSearchQuery: '반려견 동반 브런치 카페 추천', instagramHashtags: ['#강아지브런치', '#댕댕이카페', '#펫프렌들리카페'], priority: 4 },
  },
  {
    id: 'drive_course',
    title: '댕댕이와 드라이브',
    subtitle: '차로 1~2시간, 반려견과 떠나는 당일치기',
    summary: '먼 여행은 부담스럽지만, 가까운 근교라면 괜찮아요. 넓은 주차장과 반려견 동반 가능한 맛집까지 알짜 드라이브 코스를 소개합니다.',
    emoji: '🚗',
    coverImage: '/images/magazine/drive.svg',
    gradient: 'from-sky-400 to-blue-500',
    accentColor: '#3B82F6',
    season: 'all',
    filter: { categories: ['accommodation_travel', 'food_beverage'], subCategories: ['travel', 'cafe', 'restaurant'], tags: ['주차가능', '드라이브', '당일치기', '근교'] },
    collection: { searchKeywords: ['반려견 당일치기 드라이브', '강아지 근교 나들이', '반려동물 드라이브 코스'], naverSearchQuery: '강아지와 당일치기 드라이브 코스', instagramHashtags: ['#강아지드라이브', '#댕댕이나들이', '#반려견여행'], priority: 3 },
  },
  {
    id: 'walk_restaurant',
    title: '산책 후 맛집',
    subtitle: '산책 마치고 바로 들르는 동반 맛집',
    summary: '산책길에 출출해진 우리와 반려견을 위한 맛집 리스트. 테라스에서 편하게 식사하고, 우리 아이도 옆에서 함께 쉴 수 있는 곳만 골랐어요.',
    emoji: '🦮',
    coverImage: '/images/magazine/walk_food.svg',
    gradient: 'from-green-400 to-emerald-500',
    accentColor: '#10B981',
    season: 'all',
    filter: { categories: ['food_beverage'], subCategories: ['restaurant', 'cafe'], tags: ['테라스', '펫메뉴', '산책', '소형견가능'] },
    collection: { searchKeywords: ['반려견 동반 식당', '강아지 데리고 갈수있는 맛집', '산책 후 반려견 카페'], naverSearchQuery: '산책 후 반려견 동반 맛집', instagramHashtags: ['#강아지맛집', '#반려견동반식당', '#산책후맛집'], priority: 5 },
  },
  {
    id: 'large_dog_ok',
    title: '대형견도 환영!',
    subtitle: '대형견 입장 가능한 넓고 편한 공간',
    summary: '골든리트리버, 사모예드, 래브라도르… 대형견 집사들의 고민을 해결해드립니다. 넓은 공간에서 대형견도 편하게 이용할 수 있는 장소만 모았어요.',
    emoji: '🐕‍🦺',
    coverImage: '/images/magazine/large_dog.svg',
    gradient: 'from-violet-400 to-purple-600',
    accentColor: '#8B5CF6',
    season: 'all',
    filter: { requireLargeDog: true, tags: ['대형견가능', '대형견', '넓은공간'] },
    collection: { searchKeywords: ['대형견 동반 카페', '대형견 입장가능 식당', '대형견 캠핑'], naverSearchQuery: '대형견 동반 가능한 장소 추천', instagramHashtags: ['#대형견카페', '#대형견동반', '#골든리트리버맛집'], priority: 4 },
  },
  {
    id: 'cat_friendly',
    title: '냥이와 함께하는 숙소',
    subtitle: '고양이 동반 가능한 숙소 (정말 희귀!)',
    summary: '강아지는 되는데 고양이는 안 된다고요? 고양이 집사를 위한 특별 큐레이션! 캐리어만 있으면 함께 입실 가능한 소중한 숙소들입니다.',
    emoji: '🐱',
    coverImage: '/images/magazine/cat_hotel.svg',
    gradient: 'from-pink-400 to-rose-500',
    accentColor: '#F43F5E',
    season: 'all',
    filter: { categories: ['accommodation_travel'], subCategories: ['accommodation'], tags: ['고양이', '캐리어', '실내'] },
    collection: { searchKeywords: ['고양이 동반 숙소', '고양이 펜션', '반려묘 여행'], naverSearchQuery: '고양이 동반 가능 펜션 숙소', instagramHashtags: ['#고양이숙소', '#냥이여행', '#반려묘펜션'], priority: 3 },
  },
  {
    id: 'spring_blossom',
    title: '봄꽃 산책로',
    subtitle: '벚꽃길, 유채꽃밭 반려동물 산책 스팟',
    summary: '봄바람과 함께 만개한 벚꽃 아래를 반려견과 나란히 걸어보세요. 인생샷은 덤! 전국 반려동물 동반 가능한 봄꽃 명소를 엄선했습니다.',
    emoji: '🌸',
    coverImage: '/images/magazine/spring.svg',
    gradient: 'from-pink-300 to-rose-400',
    accentColor: '#FB7185',
    season: 'spring',
    filter: { tags: ['산책', '꽃길', '공원', '잔디밭'] },
    collection: { searchKeywords: ['강아지 벚꽃 산책', '반려견 봄 나들이', '벚꽃 반려동물'], naverSearchQuery: '봄 반려견 벚꽃길 산책 추천', instagramHashtags: ['#강아지벚꽃', '#댕댕이봄산책', '#반려견꽃길'], priority: 5 },
  },
  {
    id: 'summer_water',
    title: '여름 물놀이 스팟',
    subtitle: '댕댕이와 함께 첨벙! 물놀이 천국',
    summary: '더운 여름, 시원한 계곡과 해변에서 반려견과 함께 물놀이를! 반려동물 전용 수영장부터 자연 계곡까지, 안전하게 놀 수 있는 곳을 모았습니다.',
    emoji: '🏖️',
    coverImage: '/images/magazine/summer_water.svg',
    gradient: 'from-cyan-400 to-blue-500',
    accentColor: '#06B6D4',
    season: 'summer',
    filter: { tags: ['수영장', '계곡', '물놀이', '해변', '워터파크'], categories: ['accommodation_travel', 'play_shopping'] },
    collection: { searchKeywords: ['강아지 물놀이', '반려견 수영', '반려동물 계곡', '강아지 해수욕장'], naverSearchQuery: '여름 강아지 물놀이 장소', instagramHashtags: ['#강아지물놀이', '#댕댕이수영', '#반려견계곡'], priority: 5 },
  },
  {
    id: 'autumn_camping',
    title: '가을 단풍 캠핑',
    subtitle: '단풍 명소 근처 반려동물 캠핑장',
    summary: '울긋불긋 단풍 아래서 바베큐를 굽고, 반려견은 낙엽 위를 신나게 뛰어다니는 가을 캠핑. 반려동물 동반 가능한 인기 캠핑장을 소개합니다.',
    emoji: '🍂',
    coverImage: '/images/magazine/autumn_camp.svg',
    gradient: 'from-orange-400 to-red-500',
    accentColor: '#EA580C',
    season: 'autumn',
    filter: { subCategories: ['camping'], tags: ['캠핑', '단풍', '바베큐', '가을'] },
    collection: { searchKeywords: ['반려견 캠핑장', '강아지 동반 캠핑', '가을 캠핑 반려동물'], naverSearchQuery: '가을 반려견 동반 캠핑장 추천', instagramHashtags: ['#강아지캠핑', '#반려견캠핑', '#댕댕이가을캠핑'], priority: 4 },
  },
  {
    id: 'winter_indoor',
    title: '겨울 실내 놀이터',
    subtitle: '추운 날에도 신나게! 실내 독파크',
    summary: '영하의 날씨에도 우리 아이의 에너지는 넘치죠. 따뜻한 실내에서 마음껏 뛰어놀 수 있는 독파크와 실내 놀이터를 모았습니다.',
    emoji: '⛄',
    coverImage: '/images/magazine/winter_indoor.svg',
    gradient: 'from-slate-400 to-blue-600',
    accentColor: '#475569',
    season: 'winter',
    filter: { requireIndoor: true, subCategories: ['playground'], tags: ['실내', '놀이터', '독파크'] },
    collection: { searchKeywords: ['강아지 실내 놀이터', '겨울 반려견 실내', '독파크'], naverSearchQuery: '겨울 강아지 실내 놀이터 독파크', instagramHashtags: ['#강아지실내놀이터', '#독파크', '#겨울강아지'], priority: 4 },
  },
  {
    id: 'handmade_treat',
    title: '수제간식 클래스',
    subtitle: '우리 아이를 위한 수제 쿠키 원데이클래스',
    summary: '직접 만든 건강한 간식을 우리 아이에게! 첨가물 없는 수제 쿠키, 케이크를 만들어볼 수 있는 원데이클래스를 찾아보세요.',
    emoji: '🍪',
    coverImage: '/images/magazine/treat_class.svg',
    gradient: 'from-yellow-400 to-amber-500',
    accentColor: '#D97706',
    season: 'all',
    filter: { tags: ['수제간식', '원데이클래스', '베이킹', '체험'], categories: ['pet_service'] },
    collection: { searchKeywords: ['반려견 수제간식 클래스', '강아지 쿠키 만들기', '펫 베이킹 클래스'], naverSearchQuery: '반려견 수제간식 원데이클래스', instagramHashtags: ['#강아지수제간식', '#펫베이킹', '#반려견간식만들기'], priority: 3 },
  },
  {
    id: 'pet_photo_spot',
    title: '펫 포토존 BEST',
    subtitle: '인생샷 건지는 반려동물 포토 스팟',
    summary: 'SNS 감성 폭발! 우리 아이와 함께 인생 사진을 남길 수 있는 포토존과 전문 스튜디오. 프로필 사진 찍기 딱 좋은 곳만 모았어요.',
    emoji: '📸',
    coverImage: '/images/magazine/photo_spot.svg',
    gradient: 'from-fuchsia-400 to-pink-600',
    accentColor: '#D946EF',
    season: 'all',
    filter: { tags: ['포토존', '사진', '스튜디오', '인생샷'] },
    collection: { searchKeywords: ['반려동물 사진 스튜디오', '강아지 포토존', '펫 촬영 명소'], naverSearchQuery: '반려동물 포토존 사진 스팟 추천', instagramHashtags: ['#강아지포토존', '#펫사진', '#반려동물인생샷'], priority: 3 },
  },
  {
    id: 'birthday_party',
    title: '생일파티 장소',
    subtitle: '특별한 날, 반려동물 생일파티 & 돌잔치',
    summary: '1년에 한 번뿐인 우리 아이 생일! 반려동물 전용 케이크와 파티룸이 준비된 곳에서 잊지 못할 생일파티를 열어보세요.',
    emoji: '🎂',
    coverImage: '/images/magazine/birthday.svg',
    gradient: 'from-rose-400 to-pink-500',
    accentColor: '#F472B6',
    season: 'all',
    filter: { tags: ['생일파티', '파티룸', '돌잔치', '케이크'], categories: ['food_beverage', 'pet_service'] },
    collection: { searchKeywords: ['반려견 생일파티', '강아지 돌잔치', '펫 파티 장소'], naverSearchQuery: '반려견 생일파티 장소 추천', instagramHashtags: ['#강아지생일', '#반려견돌잔치', '#펫파티'], priority: 2 },
  },
  {
    id: 'dog_swimming',
    title: '반려견 수영 교실',
    subtitle: '독 스위밍 & 하이드로테라피 체험',
    summary: '수영은 관절에 무리 없는 최고의 운동! 전문 트레이너와 함께하는 반려견 수영 교실과 재활 수중치료 시설을 만나보세요.',
    emoji: '🏊',
    coverImage: '/images/magazine/dog_swim.svg',
    gradient: 'from-teal-400 to-cyan-500',
    accentColor: '#14B8A6',
    season: 'summer',
    filter: { tags: ['수영', '하이드로', '수중재활', '독스위밍'], categories: ['pet_service', 'medical_health'] },
    collection: { searchKeywords: ['강아지 수영', '반려견 수중재활', '독 스위밍', '하이드로테라피'], naverSearchQuery: '강아지 수영 교실 독스위밍', instagramHashtags: ['#강아지수영', '#독스위밍', '#반려견수중재활'], priority: 3 },
  },
  {
    id: 'night_hospital',
    title: '야간 진료 동물병원',
    subtitle: '밤에도 열려있는 24시 응급 동물병원',
    summary: '반려동물 응급상황은 시간을 가리지 않죠. 밤늦은 시간에도 진료 가능한 24시 동물병원을 미리 알아두세요. 위치와 전화번호를 한눈에!',
    emoji: '🏥',
    coverImage: '/images/magazine/night_vet.svg',
    gradient: 'from-red-400 to-rose-600',
    accentColor: '#EF4444',
    season: 'all',
    filter: { categories: ['medical_health'], subCategories: ['vet'], tags: ['24시진료', '야간진료', '응급진료', '24시'] },
    collection: { searchKeywords: ['24시 동물병원', '야간 진료 동물병원', '응급 동물병원'], naverSearchQuery: '24시 야간 진료 동물병원 추천', instagramHashtags: ['#24시동물병원', '#야간동물병원', '#응급동물병원'], priority: 5 },
  },
  {
    id: 'senior_dog_care',
    title: '노견 케어 전문',
    subtitle: '시니어독 재활, 물리치료, 특수 돌봄',
    summary: '나이 든 우리 아이에게 필요한 건 전문적인 케어. 노견 재활 치료, 물리치료, 특수 식이관리까지 시니어독 전문 시설을 모았습니다.',
    emoji: '🐶',
    coverImage: '/images/magazine/senior_dog.svg',
    gradient: 'from-stone-400 to-zinc-600',
    accentColor: '#78716C',
    season: 'all',
    filter: { categories: ['medical_health', 'pet_service'], tags: ['노견', '재활', '물리치료', '시니어독', '노령견'] },
    collection: { searchKeywords: ['노견 케어', '시니어독 재활', '반려견 물리치료', '노령견 전문 병원'], naverSearchQuery: '노견 재활 물리치료 전문 병원', instagramHashtags: ['#노견케어', '#시니어독', '#반려견재활'], priority: 3 },
  },
  {
    id: 'skin_allergy_vet',
    title: '피부·알러지 전문',
    subtitle: '아토피, 알러지 치료 잘하는 병원 모음',
    summary: '긁고 또 긁는 우리 아이, 피부 트러블로 고생하고 계신가요? 아토피, 알러지 치료에 정평 있는 동물 피부과 전문 병원을 소개합니다.',
    emoji: '💊',
    coverImage: '/images/magazine/skin_vet.svg',
    gradient: 'from-emerald-400 to-teal-500',
    accentColor: '#059669',
    season: 'all',
    filter: { categories: ['medical_health'], subCategories: ['vet'], tags: ['피부', '알러지', '아토피', '피부과'] },
    collection: { searchKeywords: ['강아지 아토피 병원', '반려견 알러지 치료', '동물 피부과'], naverSearchQuery: '강아지 아토피 피부 알러지 동물병원', instagramHashtags: ['#강아지아토피', '#반려견피부과', '#동물알러지'], priority: 3 },
  },
  {
    id: 'solo_pet_owner',
    title: '혼펫족을 위한 장소',
    subtitle: '혼자+반려동물, 부담 없이 가는 1인 친화 공간',
    summary: '혼자서도 괜찮아요! 1인석이 편한 카페부터 부담 없는 식당까지, 혼펫족이 반려견과 함께 편하게 방문할 수 있는 공간을 골랐습니다.',
    emoji: '🧑‍🦯',
    coverImage: '/images/magazine/solo_pet.svg',
    gradient: 'from-indigo-400 to-blue-500',
    accentColor: '#6366F1',
    season: 'all',
    filter: { categories: ['food_beverage'], subCategories: ['cafe', 'restaurant'], tags: ['1인', '혼밥', '소형견가능', '조용한'] },
    collection: { searchKeywords: ['혼펫족 카페', '혼자 강아지 데리고 갈곳', '1인 반려동물 동반'], naverSearchQuery: '혼펫족 1인 반려견 동반 카페', instagramHashtags: ['#혼펫족', '#1인반려견카페', '#솔로펫맘'], priority: 3 },
  },
  {
    id: 'night_walk',
    title: '야간 산책 코스',
    subtitle: '조명 좋고 안전한 저녁 산책 루트',
    summary: '퇴근 후 반려견과 함께하는 저녁 산책. 가로등이 밝고 안전한 산책로, CCTV가 설치된 공원 등 안심하고 걸을 수 있는 코스를 추천합니다.',
    emoji: '🌙',
    coverImage: '/images/magazine/night_walk.svg',
    gradient: 'from-indigo-500 to-violet-700',
    accentColor: '#7C3AED',
    season: 'all',
    filter: { tags: ['야간산책', '산책로', '공원', '조명', '안전'] },
    collection: { searchKeywords: ['강아지 야간 산책', '반려견 저녁 산책 코스', '퇴근 후 산책'], naverSearchQuery: '반려견 야간 산책로 코스 추천', instagramHashtags: ['#강아지야간산책', '#퇴근후산책', '#반려견산책로'], priority: 4 },
  },
  {
    id: 'parking_friendly',
    title: '주차 걱정 없는 곳',
    subtitle: '넓은 주차장 완비, 편하게 방문하세요',
    summary: '반려견과 외출할 때 가장 중요한 건 주차! 넓은 주차장이 있어 짐 많은 반려인도 편하게 방문할 수 있는 장소만 선별했습니다.',
    emoji: '🅿️',
    coverImage: '/images/magazine/parking.svg',
    gradient: 'from-blue-400 to-indigo-500',
    accentColor: '#4F46E5',
    season: 'all',
    filter: { tags: ['주차가능', '넓은주차장', '무료주차'] },
    collection: { searchKeywords: ['주차 가능 반려견 카페', '주차 넓은 반려동물 동반', '반려견 주차 편한곳'], naverSearchQuery: '주차 넓은 반려견 동반 장소', instagramHashtags: ['#주차가능카페', '#주차편한곳', '#반려견주차'], priority: 3 },
  },
  {
    id: 'off_leash',
    title: '오프리쉬 가능한 곳',
    subtitle: '목줄 없이 자유롭게 뛰어놀 수 있는 공간',
    summary: '넓은 잔디밭에서 목줄 없이 마음껏 뛰어다니는 우리 아이의 행복한 모습! 안전한 울타리 안에서 자유롭게 놀 수 있는 오프리쉬 공간입니다.',
    emoji: '🐾',
    coverImage: '/images/magazine/off_leash.svg',
    gradient: 'from-lime-400 to-green-500',
    accentColor: '#65A30D',
    season: 'all',
    filter: { subCategories: ['playground'], tags: ['오프리쉬', '자유', '잔디밭', '운동장', '독파크'] },
    collection: { searchKeywords: ['반려견 오프리쉬', '강아지 놀이터 자유', '독파크 운동장'], naverSearchQuery: '반려견 오프리쉬 놀이터 독파크', instagramHashtags: ['#오프리쉬', '#강아지놀이터', '#독파크'], priority: 4 },
  },
  {
    id: 'pet_camping',
    title: '반려견과 캠핑',
    subtitle: '자연 속에서 반려견과 함께하는 캠핑',
    summary: '탁 트인 자연 속에서 반려견과 함께하는 캠핑은 최고의 힐링! 바베큐 가능하고 계곡이 가까운 반려동물 동반 캠핑장을 소개합니다.',
    emoji: '⛺',
    coverImage: '/images/magazine/camping.svg',
    gradient: 'from-green-500 to-emerald-600',
    accentColor: '#16A34A',
    season: 'all',
    filter: { subCategories: ['camping'], tags: ['캠핑', '바베큐', '전기사용가능', '계곡'] },
    collection: { searchKeywords: ['반려견 캠핑장', '강아지 동반 캠핑', '펫 캠핑'], naverSearchQuery: '반려견 동반 캠핑장 추천', instagramHashtags: ['#강아지캠핑', '#반려견캠핑', '#펫캠핑'], priority: 4 },
  },
  {
    id: 'premium_hotel',
    title: '럭셔리 펫 호텔',
    subtitle: 'CCTV, 24시 케어, 프리미엄 위탁 서비스',
    summary: '출장이나 여행 중에도 우리 아이가 걱정된다면, CCTV 실시간 모니터링과 전문 돌보미가 있는 프리미엄 펫 호텔을 이용해보세요.',
    emoji: '🏨',
    coverImage: '/images/magazine/pet_hotel.svg',
    gradient: 'from-amber-500 to-yellow-600',
    accentColor: '#B45309',
    season: 'all',
    filter: { categories: ['pet_service'], subCategories: ['hotel_care'], tags: ['24시케어', 'CCTV', '프리미엄', '산책서비스'] },
    collection: { searchKeywords: ['반려견 호텔', '펫 호텔 프리미엄', '강아지 위탁 CCTV'], naverSearchQuery: '프리미엄 반려견 호텔 위탁', instagramHashtags: ['#펫호텔', '#강아지호텔', '#반려견위탁'], priority: 3 },
  },
];

function getCurrentSeason(): MagazineSeasonType {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function hashSeed(seed: number): number {
  let h = seed;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return Math.abs(h);
}

export function getActiveThemes(
  mode: 'biweekly' | 'monthly' = 'biweekly',
  count = 3
): { themes: MagazineTheme[]; periodLabel: string; nextRotation: string } {
  const now = new Date();
  const season = getCurrentSeason();

  let periodSeed: number;
  let periodLabel: string;
  let nextRotation: string;

  if (mode === 'monthly') {
    periodSeed = now.getFullYear() * 100 + (now.getMonth() + 1);
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    periodLabel = `${now.getFullYear()}년 ${monthNames[now.getMonth()]}`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    nextRotation = `${nextMonth.getFullYear()}.${String(nextMonth.getMonth() + 1).padStart(2, '0')}.01`;
  } else {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
    const biweekNum = Math.floor(dayOfYear / 14);
    periodSeed = now.getFullYear() * 100 + biweekNum;
    const biweekStart = new Date(startOfYear.getTime() + biweekNum * 14 * 86400000);
    const biweekEnd = new Date(biweekStart.getTime() + 13 * 86400000);
    periodLabel = `${biweekStart.getMonth() + 1}.${biweekStart.getDate()} ~ ${biweekEnd.getMonth() + 1}.${biweekEnd.getDate()}`;
    const nextStart = new Date(biweekStart.getTime() + 14 * 86400000);
    nextRotation = `${nextStart.getFullYear()}.${String(nextStart.getMonth() + 1).padStart(2, '0')}.${String(nextStart.getDate()).padStart(2, '0')}`;
  }

  const seasonalThemes = MAGAZINE_THEMES.filter((t) => t.season === season);
  const yearRoundThemes = MAGAZINE_THEMES.filter((t) => t.season === 'all');
  const pool = [...seasonalThemes, ...yearRoundThemes];

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = hashSeed(periodSeed + i) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const seen = new Set<string>();
  const selected: MagazineTheme[] = [];
  for (const theme of shuffled) {
    if (seen.has(theme.id)) continue;
    seen.add(theme.id);
    selected.push(theme);
    if (selected.length >= count) break;
  }

  return { themes: selected, periodLabel, nextRotation };
}

export function matchesTheme(
  place: { category: string; sub_category: string; tags: string[]; pet_conditions: { large_dog: boolean; indoor_allowed: boolean } },
  theme: MagazineTheme
): boolean {
  const { filter } = theme;
  if (filter.categories && filter.categories.length > 0) {
    if (!filter.categories.includes(place.category as never)) return false;
  }
  if (filter.subCategories && filter.subCategories.length > 0) {
    if (!filter.subCategories.includes(place.sub_category as never)) return false;
  }
  if (filter.requireLargeDog && !place.pet_conditions.large_dog) return false;
  if (filter.requireIndoor && !place.pet_conditions.indoor_allowed) return false;
  if (filter.tags && filter.tags.length > 0) {
    const placeTags = place.tags.map((t) => t.toLowerCase());
    const hasMatchingTag = filter.tags.some((ft) =>
      placeTags.some((pt) => pt.includes(ft.toLowerCase()))
    );
    if (!hasMatchingTag && !filter.categories && !filter.subCategories) return false;
  }
  return true;
}
