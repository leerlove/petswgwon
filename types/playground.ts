export type PlaygroundType = 'playground' | 'cafe' | 'hotel' | 'government' | 'other';

export interface Playground {
  id: string;
  name: string;
  playground_type: PlaygroundType;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  thumbnail: string;
  images: string[];
  business_hours: { hours?: string; closedDays?: string };
  is_unmanned: boolean;
  is_public: boolean;
  instagram: string;
  tags: string[];
  small_dog: boolean;
  medium_dog: boolean;
  large_dog: boolean;
  indoor_allowed: boolean;
  caution: string;
  sections: PlaygroundSection[];
  created_at: string;
  updated_at: string;
}

export interface SectionItem {
  name: string;
  subtitle?: string;
  description?: string;
  images: string[];
}

export interface PlaygroundSection {
  type: string;       // 'rooms' | 'facilities' | 'lobby' | custom
  title: string;
  items: SectionItem[];
}

export const SECTION_TYPE_LABELS: Record<string, string> = {
  rooms: '객실 안내',
  facilities: '부대시설',
  lobby: '로비 & 편의시설',
  custom: '기타',
};

export const PLAYGROUND_TYPE_LABELS: Record<PlaygroundType, string> = {
  playground: '놀이터',
  cafe: '카페',
  hotel: '호텔',
  government: '관공서',
  other: '기타',
};
