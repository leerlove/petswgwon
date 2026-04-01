import { create } from 'zustand';
import type { CategoryType, SubCategoryType } from '@/types';

interface FilterState {
  activeCategory: CategoryType | 'all';
  activeSubCategory: SubCategoryType | null;
  activeSubCategories: SubCategoryType[];
  filters: {
    petSize: 'all' | 'small' | 'medium' | 'large';
    indoor: boolean | null;
    parking: boolean | null;
  };

  setCategory: (cat: CategoryType | 'all') => void;
  setSubCategory: (sub: SubCategoryType | null) => void;
  toggleSubCategory: (sub: SubCategoryType) => void;
  setFilters: (filters: Partial<FilterState['filters']>) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  activeCategory: 'all',
  activeSubCategory: null,
  activeSubCategories: [],
  filters: { petSize: 'all', indoor: null, parking: null },

  setCategory: (cat) => set({ activeCategory: cat, activeSubCategory: null, activeSubCategories: [] }),
  setSubCategory: (sub) => set({ activeSubCategory: sub }),
  toggleSubCategory: (sub) => set((state) => {
    const current = state.activeSubCategories;
    const next = current.includes(sub)
      ? current.filter((s) => s !== sub)
      : [...current, sub];
    return {
      activeSubCategories: next,
      activeSubCategory: next.length === 1 ? next[0] : next.length === 0 ? null : state.activeSubCategory,
    };
  }),
  setFilters: (partial) => set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: { petSize: 'all', indoor: null, parking: null } }),
}));
