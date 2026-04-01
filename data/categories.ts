import type { Category, CategoryType } from '@/types';

export const categories: Category[] = [
  {
    id: 'food_beverage',
    name: '식음료',
    icon: '🍽️',
    subCategories: [
      { id: 'restaurant', name: '음식점' },
      { id: 'bar', name: '주점' },
      { id: 'cafe', name: '카페' },
    ],
  },
  {
    id: 'medical_health',
    name: '의료/건강',
    icon: '🏥',
    subCategories: [
      { id: 'vet', name: '동물병원' },
      { id: 'pharmacy', name: '동물약국' },
    ],
  },
  {
    id: 'accommodation_travel',
    name: '숙박/여행',
    icon: '🏨',
    subCategories: [
      { id: 'accommodation', name: '숙박' },
      { id: 'travel', name: '여행' },
      { id: 'camping', name: '캠핑' },
    ],
  },
  {
    id: 'pet_service',
    name: '반려동물서비스',
    icon: '🐾',
    subCategories: [
      { id: 'funeral', name: '동물장묘업' },
      { id: 'grooming', name: '미용' },
      { id: 'hotel_care', name: '호텔링/위탁관리' },
    ],
  },
  {
    id: 'play_shopping',
    name: '놀이/쇼핑',
    icon: '🛍️',
    subCategories: [
      { id: 'pet_supplies', name: '펫용품' },
      { id: 'playground', name: '운동장' },
      { id: 'shopping', name: '쇼핑' },
    ],
  },
  {
    id: 'etc',
    name: '기타',
    icon: '📌',
    subCategories: [
      { id: 'pending', name: '입력대기' },
    ],
  },
];

/** UI에 표시할 카테고리만 (기타 제외) */
const HIDDEN_CATEGORIES: CategoryType[] = ['etc'];
export const visibleCategories = categories.filter(
  (c) => !HIDDEN_CATEGORIES.includes(c.id),
);

export const categoryColorMap: Record<CategoryType, string> = {
  food_beverage: '#FF6B35',
  medical_health: '#4A90D9',
  accommodation_travel: '#22C55E',
  pet_service: '#A855F7',
  play_shopping: '#F59E0B',
  etc: '#6B7280',
};

export const CAT_EMOJI: Record<CategoryType, string> = {
  food_beverage: '🍽️',
  medical_health: '🏥',
  accommodation_travel: '🏨',
  pet_service: '🐾',
  play_shopping: '🛍️',
  etc: '📌',
};

/**
 * 지도 마커 & HTML 삽입용 인라인 SVG 문자열
 * stroke="white"가 기본 — 카테고리 색상 배경 위에 표시됨
 * size는 사용처에서 width/height로 조절
 */
function svgIcon(paths: string, size = 20): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

export const CAT_SVG: Record<CategoryType, string> = {
  food_beverage: svgIcon(
    '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>'
  ),
  medical_health: svgIcon(
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5v6"/><path d="M9 8h6"/>'
  ),
  accommodation_travel: svgIcon(
    '<rect x="4" y="8" width="16" height="13" rx="2"/><path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>'
  ),
  pet_service: svgIcon(
    '<ellipse cx="8.5" cy="5.5" rx="1.5" ry="2"/><ellipse cx="15.5" cy="5.5" rx="1.5" ry="2"/><ellipse cx="5.5" cy="10" rx="1.5" ry="2"/><ellipse cx="18.5" cy="10" rx="1.5" ry="2"/><path d="M12 17c-2.5 0-4.5-1.5-5-3.5a3.5 3.5 0 0 1 3-4.5c1-.2 1.5.3 2 .8.5-.5 1-.9 2-.8a3.5 3.5 0 0 1 3 4.5c-.5 2-2.5 3.5-5 3.5Z"/>'
  ),
  play_shopping: svgIcon(
    '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>'
  ),
  etc: svgIcon(
    '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
  ),
};

export function getCategoryInfo(categoryId: CategoryType) {
  return categories.find((c) => c.id === categoryId);
}

export function getCategoryColor(categoryId: CategoryType): string {
  return categoryColorMap[categoryId] || '#6B7280';
}

export function getSubCategoryName(subId: string): string {
  for (const cat of categories) {
    const sub = cat.subCategories.find((s) => s.id === subId);
    if (sub) return sub.name;
  }
  return subId;
}
