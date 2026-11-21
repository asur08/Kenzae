/**
 * Kenzae Boutique Telemetry & Ad Attribution Engine
 * Standardized Google Analytics 4 (GA4) & Meta Pixel (fbq) Event Bus
 * Safe execution: never throws errors if analytics scripts or ad blockers are present.
 */

import { KenzaeProduct } from '../types/catalog';
import { CartItem, CartTotals } from '../types/cart';
import { BoutiqueOrder } from '../types/orders';
import { CurrencyCode } from './currencyService';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

export type TelemetryEventName =
  | 'view_item_list'
  | 'view_item'
  | 'add_to_wishlist'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'whatsapp_inquiry'
  | 'purchase';

export interface TelemetryPayload {
  eventName: TelemetryEventName;
  params: Record<string, unknown>;
  timestamp: string;
}

// In-memory debug telemetry ring buffer for boutique audits
const TELEMETRY_LOG_LIMIT = 50;
export const telemetryLog: TelemetryPayload[] = [];

function recordEvent(eventName: TelemetryEventName, params: Record<string, unknown>): void {
  const entry: TelemetryPayload = {
    eventName,
    params,
    timestamp: new Date().toISOString(),
  };

  telemetryLog.unshift(entry);
  if (telemetryLog.length > TELEMETRY_LOG_LIMIT) {
    telemetryLog.pop();
  }

  // Safe GA4 dispatch
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch {
    // Silent fail
  }

  // Safe Meta Pixel dispatch
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      const fbEventMap: Partial<Record<TelemetryEventName, string>> = {
        view_item: 'ViewContent',
        add_to_wishlist: 'AddToWishlist',
        add_to_cart: 'AddToCart',
        begin_checkout: 'InitiateCheckout',
        purchase: 'Purchase',
        whatsapp_inquiry: 'Contact',
      };
      const fbEvent = fbEventMap[eventName];
      if (fbEvent) {
        window.fbq('track', fbEvent, params);
      }
    }
  } catch {
    // Silent fail
  }

  // Debug logging in development
  if (import.meta.env?.DEV) {
    console.debug(`[Telemetry: ${eventName}]`, params);
  }
}

/**
 * 1. View Item List (Browsing catalog or filtering by category)
 */
export function trackViewItemList(category: string, itemCount: number): void {
  recordEvent('view_item_list', {
    item_list_name: category,
    items_count: itemCount,
  });
}

/**
 * 2. View Item (Product Modal opened or deep-linked)
 */
export function trackViewItem(product: KenzaeProduct, currency: CurrencyCode = 'INR'): void {
  recordEvent('view_item', {
    currency,
    value: product.price,
    items: [
      {
        item_id: product.sku,
        item_name: product.title,
        item_category: product.category,
        item_category2: product.subCategory,
        price: product.price,
      },
    ],
  });
}

/**
 * 3. Add to Wishlist / Shortlist
 */
export function trackAddToWishlist(product: KenzaeProduct): void {
  recordEvent('add_to_wishlist', {
    currency: 'INR',
    value: product.price,
    items: [
      {
        item_id: product.sku,
        item_name: product.title,
        item_category: product.category,
        price: product.price,
      },
    ],
  });
}

/**
 * 4. Add to Cart (with tailoring configuration)
 */
export function trackAddToCart(item: CartItem, currency: CurrencyCode = 'INR'): void {
  recordEvent('add_to_cart', {
    currency,
    value: item.itemTotal,
    items: [
      {
        item_id: item.sku,
        item_name: item.title,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
        tailoring_type: item.tailoring.type,
      },
    ],
  });
}

/**
 * 5. Begin Checkout (Checkout Modal opened)
 */
export function trackBeginCheckout(
  items: CartItem[],
  totals: CartTotals,
  currency: CurrencyCode = 'INR'
): void {
  recordEvent('begin_checkout', {
    currency,
    value: totals.grandTotal,
    coupon: '',
    items: items.map((it) => ({
      item_id: it.sku,
      item_name: it.title,
      item_category: it.category,
      price: it.price,
      quantity: it.quantity,
    })),
  });
}

/**
 * 6. WhatsApp Inquiry / Concierge Trigger
 */
export function trackWhatsAppInquiry(
  product: KenzaeProduct,
  inquiryType: 'single_item' | 'drape_video' | 'bridal_consult' | 'wishlist_batch' = 'single_item'
): void {
  recordEvent('whatsapp_inquiry', {
    inquiry_type: inquiryType,
    item_id: product.sku,
    item_name: product.title,
    price: product.price,
  });
}

/**
 * 7. Completed Purchase
 */
export function trackPurchase(order: BoutiqueOrder, currency: CurrencyCode = 'INR'): void {
  recordEvent('purchase', {
    transaction_id: order.orderNumber,
    value: order.grandTotal,
    currency,
    tax: order.taxBreakdown.totalTax,
    shipping: order.shippingFee,
    items: order.items.map((it) => ({
      item_id: it.sku,
      item_name: it.title,
      item_category: it.category,
      price: it.price,
      quantity: it.quantity,
    })),
  });
}
