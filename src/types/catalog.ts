export type ProductCategory = 
  | 'Saris'
  | 'Churidars & Salwar Sets'
  | 'Unstitched Dress Materials'
  | 'Kurthis & Ready-to-Wear';

export interface KenzaeProduct {
  id: string;
  sku: string;
  title: string;
  category: ProductCategory;
  subCategory?: string;
  price: number;
  currency: 'INR' | string;
  description?: string;
  fabricDetails?: string;
  color?: string;
  images: string[];
  in_stock: boolean;
  isFeatured?: boolean;
  whatsappMessage?: string;
}

export interface CatalogFilterState {
  searchQuery: string;
  category: ProductCategory | 'All';
  subCategory: string | 'All';
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export interface StoreContactInfo {
  storeName: string;
  locality: string;
  district: string;
  state: string;
  pincode: string;
  googleMapsUrl: string;
  googleMapsDirectionsUrl?: string;
  whatsappNumber: string;
  phoneDisplay: string;
  timings: string;
  instagramHandle: string;
}
