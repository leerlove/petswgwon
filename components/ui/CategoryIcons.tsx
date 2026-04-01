/**
 * 카테고리별 SVG 라인 아이콘 (Lucide 스타일)
 * stroke-based, 24x24 viewBox
 */

import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const defaultProps: IconProps = { size: 20, color: 'currentColor' };

/** 🗺️ 전체 — 지도 핀 */
function IconAll({ size = 20, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/** 🍽️ 식음료 — 커피컵 + 포크 */
function IconFoodBeverage({ size = 20, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  );
}

/** 🏥 의료/건강 — 하트 + 십자가 */
function IconMedicalHealth({ size = 20, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M12 5v6" />
      <path d="M9 8h6" />
    </svg>
  );
}

/** 🏨 숙박/여행 — 여행 가방 */
function IconAccommodationTravel({ size = 20, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="8" width="16" height="13" rx="2" />
      <path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}

/** 🐾 반려동물서비스 — 발바닥 */
function IconPetService({ size = 20, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="8.5" cy="5.5" rx="1.5" ry="2" />
      <ellipse cx="15.5" cy="5.5" rx="1.5" ry="2" />
      <ellipse cx="5.5" cy="10" rx="1.5" ry="2" />
      <ellipse cx="18.5" cy="10" rx="1.5" ry="2" />
      <path d="M12 17c-2.5 0-4.5-1.5-5-3.5a3.5 3.5 0 0 1 3-4.5c1-.2 1.5.3 2 .8.5-.5 1-.9 2-.8a3.5 3.5 0 0 1 3 4.5c-.5 2-2.5 3.5-5 3.5Z" />
    </svg>
  );
}

/** 🛍️ 놀이/쇼핑 — 쇼핑백 */
function IconPlayShopping({ size = 20, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

/** 필터 — 슬라이더 */
function IconFilter({ size = 20, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="12" y1="18" x2="20" y2="18" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="10" cy="18" r="2" />
    </svg>
  );
}

/** 카테고리 ID → 아이콘 컴포넌트 매핑 */
const ICON_MAP: Record<string, (props: IconProps) => React.ReactElement> = {
  all: IconAll,
  food_beverage: IconFoodBeverage,
  medical_health: IconMedicalHealth,
  accommodation_travel: IconAccommodationTravel,
  pet_service: IconPetService,
  play_shopping: IconPlayShopping,
};

export function CategoryIcon({
  categoryId,
  ...props
}: IconProps & { categoryId: string }) {
  const Icon = ICON_MAP[categoryId];
  if (!Icon) return <IconAll {...defaultProps} {...props} />;
  return <Icon {...defaultProps} {...props} />;
}

export { IconFilter };
