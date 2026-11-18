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

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string; // Defaults to "Kerala"
  pincode: string;
  specialDeliveryNote?: string;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  tailoringTotal: number;
  shippingFee: number;
  grandTotal: number;
  isKeralaDelivery: boolean;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
}
