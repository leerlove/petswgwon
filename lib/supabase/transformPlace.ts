import type { Place } from '@/types';

/**
 * DB에 한글로 저장된 sub_category / category를 영문 ID로 정규화
 * (데이터 소스에 따라 한글 이름이 들어올 수 있음)
 */
const SUB_CATEGORY_KO_TO_ID: Record<string, string> = {
  '음식점': 'restaurant',
  '주점': 'bar',
  '카페': 'cafe',
  '동물병원': 'vet',
  '동물약국': 'pharmacy',
  '숙박': 'accommodation',
  '여행': 'travel',
  '캠핑': 'camping',
  '동물장묘업': 'funeral',
  '미용': 'grooming',
  '호텔링/위탁관리': 'hotel_care',
  '용품판매': 'supplies',
  '운동장': 'playground',
};

const CATEGORY_KO_TO_ID: Record<string, string> = {
  '식음료': 'food_beverage',
  '의료/건강': 'medical_health',
  '숙박/여행': 'accommodation_travel',
  '반려동물서비스': 'pet_service',
  '놀이/쇼핑': 'play_shopping',
};

function normalizeCategory(value: string): string {
  return CATEGORY_KO_TO_ID[value] ?? value;
}

function normalizeSubCategory(value: string): string {
  return SUB_CATEGORY_KO_TO_ID[value] ?? value;
}

/**
 * Supabase DB 행 → 프론트엔드 Place 타입 변환
 *
 * DB에는 flat 컬럼(small_dog, medium_dog, ...)으로 저장되어 있고,
 * 프론트엔드 Place 타입은 pet_conditions 객체로 묶여 있으므로 변환 필요.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformPlace(row: any): Place {
  return {
    id: row.id,
    name: row.name,
    category: normalizeCategory(row.category ?? ''),
    sub_category: normalizeSubCategory(row.sub_category ?? ''),
    address: row.address ?? '',
    address_jibun: row.address_jibun ?? '',
    phone: row.phone ?? '',
    lat: row.lat,
    lng: row.lng,
    thumbnail: row.thumbnail ?? '',
    images: row.images ?? [],
    tags: row.tags ?? [],
    business_hours: row.business_hours ?? {},
    pet_conditions: {
      small_dog: row.small_dog ?? true,
      medium_dog: row.medium_dog ?? true,
      large_dog: row.large_dog ?? false,
      access_method: row.access_method ?? '',
      indoor_allowed: row.indoor_allowed ?? false,
    },
    pet_etiquette: row.pet_etiquette ?? [],
    caution: row.caution ?? '',
    updated_at: row.updated_at ?? '',
    is_bookmarked: false, // 별도 조회 필요
  };
}
