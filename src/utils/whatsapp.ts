import { KenzaeProduct } from '../types/catalog';
import { CartItem, CartTotals, ShippingAddress } from '../types/cart';
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
    `Hello Kenzae,`,
    ``,
    `I saw this piece on your digital catalog and would like to check availability:`,
    `• *${product.title}*`,
    `• SKU: ${product.sku}`,
    `• Price: ${formatCurrencyINR(product.price)}`,
    product.fabricDetails ? `• Fabric: ${product.fabricDetails}` : '',
    ``,
    `Could you please let me know if this is currently available at your boutique?`,
    customNote ? `\nNote: ${customNote}` : '',
    `\nThank you!`
  ].filter(Boolean);

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
    `Hello Kenzae,`,
    ``,
    `I have shortlisted these ${products.length} piece(s) from your catalog:`,
    ``,
    productList,
    ``,
    `• *Total Estimated Value:* ${formatCurrencyINR(totalPrice)}`,
    ``,
    `Could you please let me know which of these are available for trial or reservation?`,
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
    `Hello Kenzae,`,
    ``,
    `I would like to visit your boutique for a trial / bridal consultation.`,
    `Could you please share convenient timings and available slots this week?`,
    ``,
    `Thank you!`
  ];

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Generates direct WhatsApp Order & Reservation payload from the shopping bag.
 * Seamlessly formats all items, tailoring specifications, address, and total amounts.
 */
export function generateCartOrderWhatsAppUrl(
  items: CartItem[],
  totals: CartTotals,
  address?: ShippingAddress,
  phoneNumber?: string
): string {
  const phone = getCleanWhatsAppNumber(phoneNumber);

  if (items.length === 0) {
    return `https://wa.me/${phone}`;
  }

  const formattedItems = items.map((item, idx) => {
    const tailoringNotes: string[] = [];
    if (item.tailoring.type === 'saree') {
      if (item.tailoring.sareeFinishing === 'fall_and_pico') {
        tailoringNotes.push(`+ Fall & Pico Finishing (₹${item.tailoring.additionalCost})`);
      } else if (item.tailoring.sareeFinishing === 'custom_blouse_stitching') {
        tailoringNotes.push(`+ Custom Blouse Stitching (₹${item.tailoring.additionalCost})`);
      } else {
        tailoringNotes.push(`Standard (Unstitched Blouse Piece)`);
      }
    } else if (item.tailoring.selectedSize) {
      tailoringNotes.push(`Size: ${item.tailoring.selectedSize}`);
    }

    const noteStr = tailoringNotes.length > 0 ? ` [${tailoringNotes.join(', ')}]` : '';
    return `${idx + 1}. *${item.title}* (${item.sku}) x${item.quantity}\n   ${formatCurrencyINR(item.itemTotal)}${noteStr}`;
  }).join('\n\n');

  const lines = [
    `Namaste Kenzae Boutique! ✨`,
    ``,
    `I would like to place an order / reserve the following bag items:`,
    ``,
    formattedItems,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🛍️ Items Subtotal: ${formatCurrencyINR(totals.subtotal)}`,
    totals.tailoringTotal > 0 ? `✂️ Tailoring/Finishing: ${formatCurrencyINR(totals.tailoringTotal)}` : '',
    `🚚 Delivery: ${totals.shippingFee === 0 ? 'FREE (Kerala Delivery)' : formatCurrencyINR(totals.shippingFee)}`,
    `💰 *Total Amount: ${formatCurrencyINR(totals.grandTotal)}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    address?.fullName ? `\n👤 *Customer Details:*` : '',
    address?.fullName ? `Name: ${address.fullName}` : '',
    address?.phoneNumber ? `Phone: ${address.phoneNumber}` : '',
    address?.streetAddress ? `Address: ${address.streetAddress}, ${address.city}, ${address.state} - ${address.pincode}` : '',
    address?.specialDeliveryNote ? `Note: ${address.specialDeliveryNote}` : '',
    ``,
    `Could you please confirm piece availability and share payment options (UPI / Bank transfer) or boutique pickup details?`,
    ``,
    `Thank you!`
  ].filter(Boolean);

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}
