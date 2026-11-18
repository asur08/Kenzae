import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BoutiqueOrder } from '../types/orders';
import { formatCurrencyINR } from './formatters';
import { convertAmountToWords } from './numberToWords';

export interface InvoiceGeneratorOptions {
  autoDownload?: boolean;
}

/**
 * Generates an authentic, vector-crisp Indian GST Tax Invoice adhering strictly
 * to Kerala State GST & Central GST apparel standards (HSN 5007 / 6204).
 */
export function generateGSTTaxInvoicePDF(
  order: BoutiqueOrder,
  options: InvoiceGeneratorOptions = { autoDownload: true }
): { doc: jsPDF; filename: string; dataUrl: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  const isKerala = order.taxBreakdown.isKeralaIntrastate;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // --- BRAND HEADER BAR (Deep Regal Maroon & Brass Accent) ---
  doc.setFillColor(42, 8, 0); // Maroon-950
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gilded Brass Accent Line
  doc.setFillColor(197, 160, 89); // Brass-light
  doc.rect(0, 28, pageWidth, 1.2, 'F');

  // Brand Name
  doc.setTextColor(250, 248, 245);
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.text('KENZAE DESIGNER BOUTIQUE', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(212, 175, 55); // Gold
  doc.text('HAUTE COUTURE & HANDWOVEN KERALA ETHNIC WEAVES', margin, 17);

  doc.setTextColor(220, 220, 220);
  doc.setFontSize(7.5);
  doc.text(
    'Mulanthuruthy, Ernakulam District, Kerala – 682314 | GSTIN: 32AAACK1234F1ZX | State Code: 32',
    margin,
    22
  );

  // TAX INVOICE Title (Right Aligned in Header)
  doc.setTextColor(250, 248, 245);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TAX INVOICE', pageWidth - margin, 13, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(212, 175, 55);
  doc.text('(Original for Recipient)', pageWidth - margin, 18, { align: 'right' });
  doc.text(`Place of Supply: ${isKerala ? 'Kerala (32)' : `${order.customer.state}`}`, pageWidth - margin, 23, { align: 'right' });

  // --- INVOICE & CUSTOMER INFO BOXES ---
  const boxTop = 34;
  const colWidth = (pageWidth - margin * 2 - 6) / 2;

  // Box 1: Billed To / Shipped To
  doc.setDrawColor(220, 215, 205);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, boxTop, colWidth, 42, 2, 2, 'FD');

  doc.setFillColor(245, 242, 235);
  doc.roundedRect(margin, boxTop, colWidth, 7, 2, 2, 'F');
  doc.rect(margin, boxTop + 5, colWidth, 2, 'F');

  doc.setTextColor(42, 8, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('BILLED TO & DELIVERED TO:', margin + 4, boxTop + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text(order.customer.fullName || 'Valued Patron', margin + 4, boxTop + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(`Mobile: ${order.customer.phoneNumber || 'N/A'}`, margin + 4, boxTop + 18);
  doc.text(`${order.customer.streetAddress || ''}`, margin + 4, boxTop + 23);
  doc.text(
    `${order.customer.city || ''}, ${order.customer.state || 'Kerala'} – ${order.customer.pincode || ''}`,
    margin + 4,
    boxTop + 28
  );
  doc.text(`State Code: ${isKerala ? '32 (Kerala)' : 'Other'}`, margin + 4, boxTop + 33);
  if (order.customer.specialDeliveryNote) {
    doc.text(`Note: ${order.customer.specialDeliveryNote.slice(0, 42)}`, margin + 4, boxTop + 38);
  }

  // Box 2: Invoice Metadata & Payment Details
  const box2Left = margin + colWidth + 6;
  doc.roundedRect(box2Left, boxTop, colWidth, 42, 2, 2, 'FD');

  doc.setFillColor(245, 242, 235);
  doc.roundedRect(box2Left, boxTop, colWidth, 7, 2, 2, 'F');
  doc.rect(box2Left, boxTop + 5, colWidth, 2, 'F');

  doc.setTextColor(42, 8, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('INVOICE & ORDER DETAILS:', box2Left + 4, boxTop + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  const drawMetaRow = (label: string, value: string, yPos: number) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, box2Left + 4, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, box2Left + 35, yPos);
  };

  drawMetaRow('Invoice No:', order.invoiceNumber, boxTop + 13);
  drawMetaRow('Invoice Date:', invoiceDate, boxTop + 18);
  drawMetaRow('Order Ref:', `#${order.orderNumber}`, boxTop + 23);
  drawMetaRow('Payment Mode:', order.paymentMethod.replace('_', ' ').toUpperCase(), boxTop + 28);
  drawMetaRow('Payment Status:', order.paymentStatus.toUpperCase(), boxTop + 33);
  drawMetaRow('Reverse Charge:', 'No', boxTop + 38);

  // --- ITEM TABLE PREPARATION ---
  const tableRows: (string | number)[][] = [];

  order.items.forEach((item, index) => {
    const isSaree = item.category === 'Saris' || (item.subCategory && item.subCategory.toLowerCase().includes('silk'));
    const hsnCode = isSaree ? '5007' : '6204'; // HSN 5007: Woven Silk Fabrics; HSN 6204: Suits/Dresses

    let desc = `${item.title}\nSKU: ${item.sku}`;
    if (item.tailoring.type === 'saree') {
      if (item.tailoring.sareeFinishing === 'fall_and_pico') {
        desc += `\n[+ Fall & Pico Finishing: ₹${item.tailoring.additionalCost}]`;
      } else if (item.tailoring.sareeFinishing === 'custom_blouse_stitching') {
        desc += `\n[+ Custom Blouse Stitching: ₹${item.tailoring.additionalCost}]`;
      } else {
        desc += '\n[Standard Unstitched Blouse Piece]';
      }
    } else if (item.tailoring.selectedSize) {
      desc += `\n[Size: ${item.tailoring.selectedSize}]`;
    }

    const unitPriceWithTailoring = item.price + (item.tailoring.additionalCost || 0);
    const itemTotalGross = unitPriceWithTailoring * item.quantity;

    // In India, retail clothing prices include GST (5% slab: base = gross / 1.05)
    const gstRate = 0.05;
    const itemTaxable = Math.round((itemTotalGross / (1 + gstRate)) * 100) / 100;
    const totalGst = Math.round((itemTotalGross - itemTaxable) * 100) / 100;

    let cgstStr = '-';
    let sgstStr = '-';
    let igstStr = '-';

    if (isKerala) {
      const halfTax = (totalGst / 2).toFixed(2);
      cgstStr = `₹${halfTax}\n(2.5%)`;
      sgstStr = `₹${halfTax}\n(2.5%)`;
    } else {
      igstStr = `₹${totalGst.toFixed(2)}\n(5.0%)`;
    }

    tableRows.push([
      index + 1,
      desc,
      hsnCode,
      item.quantity,
      `₹${unitPriceWithTailoring}`,
      `₹${itemTaxable.toFixed(2)}`,
      cgstStr,
      sgstStr,
      igstStr,
      `₹${itemTotalGross}`,
    ]);
  });

  // Render Table using autoTable
  autoTable(doc, {
    startY: 81,
    margin: { left: margin, right: margin },
    head: [[
      'S.No',
      'Item Description & Specification',
      'HSN',
      'Qty',
      'Unit Rate',
      'Taxable Val',
      'CGST',
      'SGST',
      'IGST',
      'Total (₹)',
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      font: 'helvetica',
      textColor: [30, 30, 30],
      lineColor: [225, 220, 210],
      lineWidth: 0.1,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [42, 8, 0], // Maroon-950
      textColor: [245, 238, 225], // Brass-light
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7.5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 14 },
      3: { halign: 'center', cellWidth: 9 },
      4: { halign: 'right', cellWidth: 18 },
      5: { halign: 'right', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 16 },
      7: { halign: 'center', cellWidth: 16 },
      8: { halign: 'center', cellWidth: 16 },
      9: { halign: 'right', cellWidth: 20, fontStyle: 'bold' },
    },
  });

  // Capture position after table
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 4 : 160;

  // --- CALCULATION TOTALS SUMMARY (Right Aligned) ---
  const summaryWidth = 75;
  const summaryX = pageWidth - margin - summaryWidth;
  const rowHeight = 5.5;
  let currY = finalY;

  const drawSummaryRow = (label: string, value: string, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(isBold ? 42 : 60, isBold ? 8 : 60, isBold ? 0 : 60);
    doc.text(label, summaryX, currY);
    doc.text(value, pageWidth - margin, currY, { align: 'right' });
    currY += rowHeight;
  };

  // Border box around summary
  doc.setDrawColor(225, 220, 210);
  doc.rect(summaryX - 4, finalY - 2, summaryWidth + 4, 38, 'S');

  drawSummaryRow('Total Taxable Amount:', `₹${order.taxBreakdown.taxableAmount.toFixed(2)}`);
  if (isKerala) {
    drawSummaryRow('CGST (2.5%):', `₹${order.taxBreakdown.cgstAmount.toFixed(2)}`);
    drawSummaryRow('SGST (2.5%):', `₹${order.taxBreakdown.sgstAmount.toFixed(2)}`);
  } else {
    drawSummaryRow('IGST (5.0%):', `₹${order.taxBreakdown.igstAmount.toFixed(2)}`);
  }
  drawSummaryRow(
    'Courier Shipping Fee:',
    order.shippingFee === 0 ? 'FREE (Kerala)' : `₹${order.shippingFee.toFixed(2)}`
  );

  doc.setDrawColor(42, 8, 0);
  doc.line(summaryX - 4, currY - 1, pageWidth - margin, currY - 1);
  currY += 2;

  drawSummaryRow('Grand Total (Gross):', formatCurrencyINR(order.grandTotal), true);

  // --- AMOUNT IN WORDS & BANK DETAILS (Left Aligned) ---
  const leftBoxWidth = summaryX - margin - 6;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(225, 220, 210);
  doc.rect(margin, finalY - 2, leftBoxWidth, 38, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(42, 8, 0);
  doc.text('AMOUNT IN WORDS:', margin + 3, finalY + 3);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  const words = convertAmountToWords(order.grandTotal);
  doc.text(words, margin + 3, finalY + 8, { maxWidth: leftBoxWidth - 6 });

  // Bank Account Transfer Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(42, 8, 0);
  doc.text('BANK REMITTANCE DETAILS:', margin + 3, finalY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text('Bank: State Bank of India | Branch: Mulanthuruthy (0070154)', margin + 3, finalY + 23);
  doc.text('Account Name: Kenzae Designer Boutique', margin + 3, finalY + 27.5);
  doc.text('A/C Number: 38472910482 | IFSC Code: SBIN0070154', margin + 3, finalY + 32);

  // --- FOOTER DECLARATION & SIGNATORY ---
  const footerY = Math.max(currY + 8, 240);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Terms & Conditions:', margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(
    '1. All our saris and ensembles are authentic artisanal handloom creations. Minor weave slubs are proof of hand craftsmanship.',
    margin,
    footerY + 4
  );
  doc.text(
    '2. Alterations or blouse sizing adjustments can be facilitated at our Mulanthuruthy atelier within 7 days of delivery.',
    margin,
    footerY + 8
  );
  doc.text(
    '3. This is a computer-generated tax invoice issued in accordance with GST Rule 46.',
    margin,
    footerY + 12
  );

  // Signature Block
  const sigX = pageWidth - margin - 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(42, 8, 0);
  doc.text('For KENZAE DESIGNER BOUTIQUE', sigX, footerY + 2);

  doc.setDrawColor(180, 180, 180);
  doc.rect(sigX, footerY + 5, 48, 14, 'S');

  doc.setTextColor(140, 140, 140);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text('Digitally Verified & Sealed', sigX + 24, footerY + 13, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 40);
  doc.text('Authorized Signatory', sigX + 24, footerY + 23, { align: 'center' });

  const filename = `Kenzae_Tax_Invoice_${order.orderNumber}.pdf`;

  if (options.autoDownload) {
    doc.save(filename);
  }

  const dataUrl = doc.output('datauristring');
  return { doc, filename, dataUrl };
}
