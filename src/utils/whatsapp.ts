import { KenzaeProduct } from '../types/catalog';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';
import { formatCurrencyINR } from './formatters';

export function getCleanWhatsAppNumber(rawNumber?: string): string {
  const num = rawNumber || KENZAE_STORE_CONFIG.whatsappNumber;
  return num.replace(/\D/g, '');
}

/**
 * Generates direct WhatsApp Click-to-Chat URL for a single product inquiry/reservation
 */
export function generateProductWhatsAppUrl(
  product: KenzaeProduct,
  customMessage?: string,
  phoneNumber?: string
): string {
  const phone = getCleanWhatsAppNumber(phoneNumber);
  
  if (product.whatsappMessage && !customMessage) {
    const text = encodeURIComponent(product.whatsappMessage);
    return `https://wa.me/${phone}?text=${text}`;
  }

  const message = [
    `Namaste Kenzae Boutique! ✨`,
    ``,
    `I would like to inquire about reserving this piece from your catalog:`,
    `👗 *Item:* ${product.title}`,
    `🏷️ *SKU:* ${product.sku}`,
    `💰 *Price:* ${formatCurrencyINR(product.price)}`,
    product.fabricDetails ? `🧵 *Fabric:* ${product.fabricDetails}` : '',
    ``,
    `📍 *Store Pickup:* Mulanthuruthy Boutique / Home Courier`,
    ``,
    `Could you please confirm availability and provide details for reservation?`,
    customMessage ? `\nNote: ${customMessage}` : ''
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates WhatsApp Click-to-Chat URL for inquiring about multiple shortlisted items
 */
export function generateWishlistWhatsAppUrl(
  products: KenzaeProduct[],
  phoneNumber?: string
): string {
  const phone = getCleanWhatsAppNumber(phoneNumber);

  if (products.length === 0) {
    return `https://wa.me/${phone}`;
  }

  const totalPrice = products.reduce((sum, item) => sum + item.price, 0);

  const productList = products
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.title}* (SKU: ${item.sku}) — ${formatCurrencyINR(item.price)}`
    )
    .join('\n');

  const message = [
    `Namaste Kenzae Boutique! ✨`,
    ``,
    `I have shortlisted the following ${products.length} piece(s) from your digital catalog:`,
    ``,
    productList,
    ``,
    `🏷️ *Total Estimated Value:* ${formatCurrencyINR(totalPrice)}`,
    ``,
    `Could you please check availability for these items at your Mulanthuruthy boutique? I would like to schedule a trial / reserve them.`
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates WhatsApp Click-to-Chat URL for booking a trial / boutique consultation
 */
export function generateStoreVisitWhatsAppUrl(phoneNumber?: string): string {
  const phone = getCleanWhatsAppNumber(phoneNumber);
  const message = [
    `Namaste Kenzae Boutique! ✨`,
    ``,
    `I would like to schedule a boutique visit / bridal consultation at your Mulanthuruthy store.`,
    `Could you please confirm your available slots and boutique timings?`
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
