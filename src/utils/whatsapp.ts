import { KenzaeProduct } from '../types/catalog';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';
import { formatCurrencyINR } from './formatters';

export function getCleanWhatsAppNumber(rawNumber?: string): string {
  const num = rawNumber || KENZAE_STORE_CONFIG.whatsappNumber;
  return num.replace(/\D/g, '');
}

/**
 * Generates direct WhatsApp Click-to-Chat URL for product reservation/inquiry.
 * Natural, polite conversational tone reflecting authentic Kerala boutique etiquette.
 */
export function generateProductWhatsAppUrl(
  product: KenzaeProduct,
  customNote?: string,
  phoneNumber?: string
): string {
  const phone = getCleanWhatsAppNumber(phoneNumber);

  const lines = [
    `Hello Kenzae Boutique,`,
    ``,
    `I saw this piece on your digital catalog and would like to check availability:`,
    `• *${product.title}*`,
    `• SKU: ${product.sku}`,
    `• Price: ${formatCurrencyINR(product.price)}`,
    product.fabricDetails ? `• Fabric: ${product.fabricDetails}` : '',
    ``,
    `Could you please let me know if this is currently available at your Mulanthuruthy store?`,
    customNote ? `\nNote: ${customNote}` : '',
    `\nThank you!`
  ].filter(Boolean);

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Generates WhatsApp Click-to-Chat URL specifically requesting a fabric drape video.
 * Highly requested by NRI and distant shoppers in Kerala wanting to see sari fall and zari luster.
 */
export function generateFabricVideoWhatsAppUrl(
  product: KenzaeProduct,
  phoneNumber?: string
): string {
  const phone = getCleanWhatsAppNumber(phoneNumber);

  const lines = [
    `Hello Kenzae,`,
    ``,
    `Could you please share a quick fabric video showing the drape and border work for:`,
    `• *${product.title}* (${product.sku})`,
    `• Listed Price: ${formatCurrencyINR(product.price)}`,
    ``,
    `I would love to see how the fabric falls in natural light. Thank you!`
  ];

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Generates WhatsApp Click-to-Chat URL for inquiring about shortlisted items.
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
        `${idx + 1}. *${item.title}* (${item.sku}) — ${formatCurrencyINR(item.price)}`
    )
    .join('\n');

  const lines = [
    `Hello Kenzae Boutique,`,
    ``,
    `I have shortlisted these ${products.length} piece(s) from your catalog:`,
    ``,
    productList,
    ``,
    `• *Total Estimated Value:* ${formatCurrencyINR(totalPrice)}`,
    ``,
    `Could you please let me know which of these are available for trial or reservation at your Mulanthuruthy boutique?`,
    ``,
    `Thank you!`
  ];

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Generates WhatsApp Click-to-Chat URL for booking a trial / bridal consultation.
 */
export function generateStoreVisitWhatsAppUrl(phoneNumber?: string): string {
  const phone = getCleanWhatsAppNumber(phoneNumber);
  const lines = [
    `Hello Kenzae Boutique,`,
    ``,
    `I would like to visit your boutique in Mulanthuruthy for a trial / bridal consultation.`,
    `Could you please share convenient timings and available slots this week?`,
    ``,
    `Thank you!`
  ];

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}
