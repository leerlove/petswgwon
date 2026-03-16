import { create } from 'zustand';
import type { CategoryType, SubCategoryType } from '@/types';

interface FilterState {
  activeCategory: CategoryType | 'all';
  activeSubCategory: SubCategoryType | null;
  filters: {
    petSize: 'all' | 'small' | 'medium' | 'large';
    indoor: boolean | null;
    parking: boolean | null;
  };

  setCategory: (cat: CategoryType | 'all') => void;
  setSubCategory: (sub: SubCategoryType | null) => void;
  setFilters: (filters: Partial<FilterState['filters']>) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  activeCategory: 'all',
  activeSubCategory: null,
  filters: { petSize: 'all', indoor: null, parking: null },

  setCategory: (cat) => set({ activeCategory: cat, activeSubCategory: null }),
  setSubCategory: (sub) => set({ activeSubCategory: sub }),
  setFilters: (partial) => set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: { petSize: 'all', indoor: null, parking: null } }),
}));
