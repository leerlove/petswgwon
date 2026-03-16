export interface Place {
  id: string;
  name: string;
  category: CategoryType;
  sub_category: SubCategoryType;
  address: string;
  address_jibun: string;
  phone: string;
  lat: number;
  lng: number;
  thumbnail: string;
  images: string[];
  tags: string[];
  business_hours: Record<string, string>;
  pet_conditions: {
    small_dog: boolean;
    medium_dog: boolean;
    large_dog: boolean;
    access_method: string;
    indoor_allowed: boolean;
  };
  pet_etiquette: string[];
  caution: string;
  updated_at: string;
  is_bookmarked: boolean;
}

export interface BlogReview {
  id: string;
  summary: string;
  content: string;
  source: string;
  source_url: string;
  author: string;
  date: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  thumbnail: string;
  distance_km: number;
}

export interface ClusterData {
  lat: number;
  lng: number;
  count: number;
  color: 'blue' | 'orange' | 'red';
}

export type CategoryType =
  | 'food_beverage'
  | 'medical_health'
  | 'accommodation_travel'
  | 'pet_service'
  | 'play_shopping';

export type SubCategoryType =
  | 'restaurant' | 'bar' | 'cafe'
  | 'vet' | 'pharmacy'
  | 'accommodation' | 'travel' | 'camping'
  | 'funeral' | 'grooming' | 'hotel_care'
  | 'supplies' | 'playground';

export type GNBTab = 'petzone' | 'playground' | 'hotplace';
