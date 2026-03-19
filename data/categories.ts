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
      { id: 'supplies', name: '용품판매' },
      { id: 'shopping', name: '쇼핑' },
      { id: 'pet_supplies', name: '펫용품' },
      { id: 'playground', name: '운동장' },
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
