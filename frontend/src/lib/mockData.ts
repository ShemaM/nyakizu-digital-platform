export interface Category {
  id: number;
  name: string;
}

export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface DeviceModel {
  id: number;
  brandId: number;
  name: string;
}

export const categories: Category[] = [];

export const subcategories: Subcategory[] = [];

export const brands: Brand[] = [];

export const deviceModels: DeviceModel[] = [];

