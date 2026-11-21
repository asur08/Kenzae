import { BoutiqueOrder, CourierPartner } from '../types/orders';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';
import { formatCurrencyINR } from './formatters';

export function getCleanPhoneNumber(rawNumber?: string): string {
  if (!rawNumber) return '';
  const digits = rawNumber.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/**
 * Returns direct parcel tracking URL for Indian logistics partners.
 */
export function generateTrackingUrl(partner: CourierPartner, awb: string): string {
  const cleanAwb = encodeURIComponent(awb.trim());
  switch (partner) {
    case 'DTDC':
      return `https://www.dtdc.in/tracking/shipment-tracking.asp?tracking_no=${cleanAwb}`;
    case 'Speed Post (India Post)':
      return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;
    case 'Delhivery':
      return `https://www.delhivery.com/track/package/${cleanAwb}`;
    case 'Professional Couriers':
      return `https://www.tpcindia.com/`;
    case 'Kerala Express':
      return `https://keralaexpress.in/track?awb=${cleanAwb}`;
    case 'DHL Express':
      return `https://www.dhl.com/en-in/home/tracking.html?tracking-id=${cleanAwb}`;
    case 'Aramex Worldwide':
      return `https://www.aramex.com/track/results?shipmentNumber=${cleanAwb}`;
    default:
      return '';
  }
}

/**
 * Generates customer WhatsApp message with dispatch details and tracking links.
 */
export function generateDispatchWhatsAppUrl(order: BoutiqueOrder): string {
  const customerPhone = getCleanPhoneNumber(order.customer.phoneNumber);
  const trackingLink = order.trackingUrl || (order.courierPartner && order.trackingAwb ? generateTrackingUrl(order.courierPartner, order.trackingAwb) : '');

  const itemsSummary = order.items
    .map((it) => `• ${it.title} (${it.sku}) x${it.quantity}`)
    .join('\n');

  const lines = [
    `Namaste ${order.customer.fullName}! ✨`,
    ``,
    `Exciting news from *Kenzae Designer Boutique, Mulanthuruthy*!`,
    `Your order *#${order.orderNumber}* has been carefully inspected, packaged, and dispatched! 📦👗`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👗 *Ensemble Dispatched:*`,
    itemsSummary,
    ``,
    `🚚 *Logistics Partner:* ${order.courierPartner || 'Speed Post / Courier'}`,
    order.trackingAwb ? `🔖 *Tracking / AWB Number:* ${order.trackingAwb}` : '',
    trackingLink ? `🔗 *Track Parcel Live:* ${trackingLink}` : '',
    `📍 *Delivery City:* ${order.customer.city}, ${order.customer.state} (${order.customer.pincode})`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Your tax invoice (${order.invoiceNumber}) is enclosed with your parcel package.`,
    ``,
    `We hope you cherish draping this handcrafted creation! Please feel free to reach out to our Mulanthuruthy atelier for any alteration, fall/pico, or styling queries.`,
    ``,
    `With warm regards,`,
    `*Kenzae Boutique Team*`,
    `📞 ${KENZAE_STORE_CONFIG.phoneDisplay}`
  ].filter(Boolean);

  return `https://wa.me/${customerPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Generates an alert to the boutique owner's WhatsApp when a new order is booked.
 */
export function generateBoutiqueOwnerOrderAlertWhatsAppUrl(order: BoutiqueOrder): string {
  const ownerPhone = KENZAE_STORE_CONFIG.whatsappNumber.replace(/\D/g, '');

  const itemsList = order.items
    .map((it) => {
      const tailoring = it.tailoring.sareeFinishing === 'fall_and_pico'
        ? ' [+Fall & Pico]'
        : it.tailoring.sareeFinishing === 'custom_blouse_stitching'
        ? ' [+Custom Blouse]'
        : it.tailoring.selectedSize
        ? ` [Size: ${it.tailoring.selectedSize}]`
        : '';
      return `• ${it.sku}: ${it.title}${tailoring} (x${it.quantity}) - ${formatCurrencyINR(it.itemTotal)}`;
    })
    .join('\n');

  const lines = [
    `🚨 *NEW BOUTIQUE ORDER RECEIVED!*`,
    ``,
    `Order No: *#${order.orderNumber}*`,
    `Amount: *${formatCurrencyINR(order.grandTotal)}* (${order.paymentStatus.toUpperCase()})`,
    `Payment Method: ${order.paymentMethod}`,
    ``,
    `👤 *Customer Details:*`,
    `Name: ${order.customer.fullName}`,
    `Phone: ${order.customer.phoneNumber}`,
    `Address: ${order.customer.streetAddress}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`,
    order.customer.specialDeliveryNote ? `Notes: "${order.customer.specialDeliveryNote}"` : '',
    ``,
    `📦 *Items to Pull from Boutique Rack:*`,
    itemsList,
    ``,
    `Open Staff Portal to process & dispatch:`,
    `👉 https://kenzae.com/staff`
  ].filter(Boolean);

  return `https://wa.me/${ownerPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
}
