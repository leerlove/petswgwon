import type { CategoryType, SubCategoryType, Place } from './place';

export type MagazineSeasonType = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';

export interface MagazineTheme {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  emoji: string;
  coverImage: string;
  gradient: string;
  accentColor: string;
  season: MagazineSeasonType;
  filter: {
    categories?: CategoryType[];
    subCategories?: SubCategoryType[];
    tags?: string[];
    requireLargeDog?: boolean;
    requireIndoor?: boolean;
  };
  collection: {
    searchKeywords: string[];
    naverSearchQuery: string;
    instagramHashtags: string[];
    priority: number;
  };
}

export interface MagazineIssue {
  theme: MagazineTheme;
  places: Place[];
  publishedAt: string;
  expiresAt: string;
}
