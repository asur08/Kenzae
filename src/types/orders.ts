import { CartItem, ShippingAddress } from './cart';

export type PaymentMethod = 'razorpay_online' | 'whatsapp_upi' | 'boutique_cash';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export type FulfillmentStatus = 
  | 'new'
  | 'tailoring'
  | 'ready_for_dispatch'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type CourierPartner = 
  | 'DTDC'
  | 'Speed Post (India Post)'
  | 'Delhivery'
  | 'Professional Couriers'
  | 'Kerala Express'
  | 'Boutique Handover'
  | 'Other';

export interface TaxBreakdown {
  taxableAmount: number;
  isKeralaIntrastate: boolean;
  cgstRate: number; // e.g. 2.5
  cgstAmount: number;
  sgstRate: number; // e.g. 2.5
  sgstAmount: number;
  igstRate: number; // e.g. 5.0
  igstAmount: number;
  totalTax: number;
}

export interface BoutiqueOrder {
  id: string;
  orderNumber: string; // e.g. KZ-2026-1042
  invoiceNumber: string; // e.g. KZ-INV-2026-1042
  customer: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  tailoringTotal: number;
  shippingFee: number;
  grandTotal: number;
  taxBreakdown: TaxBreakdown;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  courierPartner?: CourierPartner;
  trackingAwb?: string;
  trackingUrl?: string;
  staffNotes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  dispatchedAt?: string; // ISO
}
