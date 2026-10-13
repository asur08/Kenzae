import { ProductCategory } from '../types/catalog';

const VALID_CATEGORIES: ProductCategory[] = [
  'Saris',
  'Churidars & Salwar Sets',
  'Unstitched Dress Materials',
  'Kurthis & Ready-to-Wear'
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateProduct(item: unknown, index?: number): { isValid: boolean; error?: string } {
  const prefix = index !== undefined ? `Product at index ${index}` : 'Product';
  
  if (!item || typeof item !== 'object') {
    return { isValid: false, error: `${prefix} is not a valid object.` };
  }

  const p = item as Record<string, unknown>;

  if (typeof p.id !== 'string' || !p.id.trim()) {
    return { isValid: false, error: `${prefix}: missing or invalid required string property 'id'.` };
  }

  if (typeof p.sku !== 'string' || !p.sku.trim()) {
    return { isValid: false, error: `${prefix} (${p.id}): missing or invalid required string property 'sku'.` };
  }

  if (typeof p.title !== 'string' || !p.title.trim()) {
    return { isValid: false, error: `${prefix} (${p.id}): missing or invalid required string property 'title'.` };
  }

  if (typeof p.category !== 'string' || !VALID_CATEGORIES.includes(p.category as ProductCategory)) {
    return { 
      isValid: false, 
      error: `${prefix} (${p.id}): category '${p.category}' is invalid. Must be one of: ${VALID_CATEGORIES.join(', ')}.` 
    };
  }

  if (typeof p.price !== 'number' || isNaN(p.price) || p.price < 0) {
    return { isValid: false, error: `${prefix} (${p.id}): missing or invalid numeric property 'price'.` };
  }

  if (!Array.isArray(p.images) || p.images.length === 0) {
    return { isValid: false, error: `${prefix} (${p.id}): 'images' must be a non-empty array of image URLs.` };
  }

  for (let i = 0; i < p.images.length; i++) {
    if (typeof p.images[i] !== 'string' || !p.images[i].trim()) {
      return { isValid: false, error: `${prefix} (${p.id}): image at index ${i} is not a valid string URL.` };
    }
  }

  if (typeof p.in_stock !== 'boolean') {
    return { isValid: false, error: `${prefix} (${p.id}): missing or invalid boolean property 'in_stock'.` };
  }

  return { isValid: true };
}

export function validateCatalog(catalog: unknown): ValidationResult {
  if (!Array.isArray(catalog)) {
    return {
      isValid: false,
      errors: ['Catalog root must be an array of KenzaeProduct items.']
    };
  }

  const errors: string[] = [];

  catalog.forEach((item, index) => {
    const res = validateProduct(item, index);
    if (!res.isValid && res.error) {
      errors.push(res.error);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
