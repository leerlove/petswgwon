import type { CategoryType, SubCategoryType } from './place';

export interface Category {
  id: CategoryType;
  name: string;
  icon: string;
  subCategories: { id: SubCategoryType; name: string }[];
}
