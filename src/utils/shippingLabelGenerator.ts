import jsPDF from 'jspdf';
import { BoutiqueOrder } from '../types/orders';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';

/**
 * Generates an A6 / 4x6" thermal or A4 printable Shipping Label & Packing Slip
 * for DTDC, Speed Post, or courier dispatch from the Mulanthuruthy atelier.
 */
export function generateShippingLabelPDF(
  order: BoutiqueOrder,
  options: { autoDownload?: boolean } = { autoDownload: true }
): { doc: jsPDF; filename: string } {
  // Standard 4x6 inch (101.6mm x 152.4mm) shipping label format
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [102, 152],
  });

  const width = 102;
  const margin = 6;

  // Header Box
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(margin, margin, width - margin * 2, 140);

  // Top Bar: Courier & Tracking
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, margin, width - margin * 2, 12, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(
    `PREPAID EXPRESS • ${order.courierPartner || 'DTDC / SPEED POST'}`,
    width / 2,
    margin + 8,
    { align: 'center' }
  );

  // AWB & Barcode placeholder
  let currY = margin + 17;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.text('AWB / TRACKING:', margin + 3, currY);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(order.trackingAwb || 'PENDING AWB', margin + 34, currY);

  currY += 6;
  doc.setLineWidth(0.2);
  doc.line(margin, currY, width - margin, currY);

  // SHIP TO (Recipient) Box
  currY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DELIVER TO (RECIPIENT):', margin + 3, currY);

  currY += 5;
  doc.setFontSize(11);
  doc.text(order.customer.fullName, margin + 3, currY);

  currY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Phone: ${order.customer.phoneNumber}`, margin + 3, currY);

  currY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(order.customer.streetAddress, margin + 3, currY, { maxWidth: width - margin * 2 - 6 });

  currY += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(
    `${order.customer.city}, ${order.customer.state} – ${order.customer.pincode}`,
    margin + 3,
    currY
  );

  currY += 5;
  doc.setLineWidth(0.4);
  doc.line(margin, currY, width - margin, currY);

  // SHIP FROM (Boutique Sender)
  currY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('RETURN / DISPATCH FROM:', margin + 3, currY);

  currY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('KENZAE DESIGNER BOUTIQUE', margin + 3, currY);

  currY += 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    'Near Railway Station Road, Mulanthuruthy, Ernakulam District, Kerala – 682314',
    margin + 3,
    currY,
    { maxWidth: width - margin * 2 - 6 }
  );

  currY += 7;
  doc.text(`Phone: ${KENZAE_STORE_CONFIG.phoneDisplay} | GSTIN: 32AAACK1234F1ZX`, margin + 3, currY);

  currY += 5;
  doc.setLineWidth(0.2);
  doc.line(margin, currY, width - margin, currY);

  // PACKING SLIP & ITEM CHECKLIST
  currY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`PACKAGE CONTENTS (Order #${order.orderNumber}):`, margin + 3, currY);

  currY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  order.items.forEach((item) => {
    let tailoring = '';
    if (item.tailoring.sareeFinishing === 'fall_and_pico') tailoring = ' [+Fall&Pico]';
    if (item.tailoring.sareeFinishing === 'custom_blouse_stitching') tailoring = ' [+Custom Blouse]';
    if (item.tailoring.selectedSize) tailoring = ` [Size: ${item.tailoring.selectedSize}]`;

    doc.text(`[  ]  ${item.sku} - ${item.title.slice(0, 32)}${tailoring} (x${item.quantity})`, margin + 3, currY);
    currY += 4.5;
  });

  if (order.customer.specialDeliveryNote) {
    currY += 2;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.text(`Note: "${order.customer.specialDeliveryNote}"`, margin + 3, currY, {
      maxWidth: width - margin * 2 - 6,
    });
  }

  const filename = `Kenzae_Shipping_Label_${order.orderNumber}.pdf`;

  if (options.autoDownload) {
    doc.save(filename);
  }

  return { doc, filename };
}
