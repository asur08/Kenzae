export type SareeFinishingOption = 'unstitched' | 'fall_and_pico' | 'custom_blouse_stitching';
export type GarmentSizeOption = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'custom_measurements';

export interface CustomBlouseMeasurements {
  bust?: number;
  waist?: number;
  blouseLength?: number;
  sleeveLength?: number;
  frontNeckDepth?: number;
  backNeckDepth?: number;
  specialInstructions?: string;
}

export interface TailoringSelection {
  type: 'saree' | 'stitched_suit' | 'unstitched_material' | 'standard';
  sareeFinishing?: SareeFinishingOption;
  selectedSize?: GarmentSizeOption;
  customMeasurements?: CustomBlouseMeasurements;
  additionalCost: number;
}

export interface CartItem {
  id: string; // Unique composite key: `${productId}__${tailoringSignature}`
  productId: string;
  sku: string;
  title: string;
  category: string;
  subCategory?: string;
  price: number;
  image: string;
  quantity: number;
  tailoring: TailoringSelection;
  itemTotal: number;
}

export type ShippingTier = 'domestic_standard' | 'international_express';

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  countryCode?: string; // e.g. "+91", "+971", "+1", "+44"
  country?: string; // e.g. "India", "United Arab Emirates", etc.
  streetAddress: string;
  city: string;
  state: string; // Defaults to "Kerala" (or Emirate / Province)
  pincode: string;
  shippingTier?: ShippingTier;
  specialDeliveryNote?: string;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  tailoringTotal: number;
  shippingFee: number;
  shippingTier: ShippingTier;
  grandTotal: number;
  isKeralaDelivery: boolean;
  isInternationalDelivery: boolean;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
}
