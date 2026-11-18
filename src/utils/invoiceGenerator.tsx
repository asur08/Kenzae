import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { BoutiqueOrder } from '../types/orders';
import { convertAmountToWords } from './numberToWords';

export interface InvoiceGeneratorOptions {
  autoDownload?: boolean;
}

// Brand Luxury Palette (Haute Couture Editorial Standards)
const COLORS = {
  maroonDark: '#2A0800',
  maroonLight: '#3D0C00',
  goldAccent: '#C5A059',
  goldMuted: '#9B7B38',
  ivoryBg: '#FAF8F5',
  linenBg: '#F5F2EB',
  charcoal: '#1A1A1A',
  mutedText: '#666666',
  borderLight: '#E8E1D5',
  borderGold: '#D4AF37',
  white: '#FFFFFF',
  greenPaid: '#1B5E20',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingBottom: 26,
    paddingLeft: 32,
    paddingRight: 32,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: COLORS.charcoal,
  },
  // Top Double Hairline Gold Banner
  topGoldBar1: {
    height: 1.5,
    backgroundColor: COLORS.goldAccent,
    marginBottom: 1.5,
  },
  topGoldBar2: {
    height: 0.5,
    backgroundColor: COLORS.goldAccent,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 8,
    borderBottomWidth: 0.8,
    borderBottomColor: COLORS.borderLight,
    borderBottomStyle: 'solid',
  },
  brandBlock: {
    width: '60%',
  },
  brandName: {
    fontFamily: 'Times-Bold',
    fontSize: 20,
    letterSpacing: 2.5,
    color: COLORS.maroonDark,
    marginBottom: 2,
  },
  brandTagline: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.8,
    letterSpacing: 1.5,
    color: COLORS.goldMuted,
    marginBottom: 3.5,
    textTransform: 'uppercase',
  },
  brandAddress: {
    fontSize: 7,
    color: COLORS.mutedText,
    lineHeight: 1.35,
  },
  invoiceMetaBlock: {
    width: '38%',
    alignItems: 'flex-end',
  },
  taxInvoiceTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 16,
    letterSpacing: 1.5,
    color: COLORS.maroonDark,
    marginBottom: 2,
  },
  invoiceSubtitle: {
    fontSize: 6.8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    color: COLORS.goldMuted,
    marginBottom: 3,
  },
  supplyDetails: {
    fontSize: 7,
    color: COLORS.mutedText,
    textAlign: 'right',
    lineHeight: 1.35,
  },

  // 2-Column Info Cards
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  infoCard: {
    width: '48.5%',
    backgroundColor: COLORS.ivoryBg,
    borderWidth: 0.6,
    borderColor: COLORS.borderLight,
    borderRadius: 2,
    padding: 7,
  },
  cardTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.8,
    letterSpacing: 0.8,
    color: COLORS.goldMuted,
    textTransform: 'uppercase',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 3,
    marginBottom: 5,
  },
  customerName: {
    fontFamily: 'Times-Bold',
    fontSize: 9.5,
    color: COLORS.maroonDark,
    marginBottom: 2.5,
  },
  cardLine: {
    fontSize: 7.2,
    color: COLORS.charcoal,
    lineHeight: 1.35,
  },
  noteText: {
    fontSize: 6.8,
    fontFamily: 'Helvetica-Oblique',
    color: COLORS.mutedText,
    marginTop: 3,
    paddingTop: 3,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.borderLight,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1.6,
    borderBottomWidth: 0.4,
    borderBottomColor: '#F0ECE4',
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#555555',
  },
  metaValue: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: COLORS.charcoal,
  },
  paidBadge: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    backgroundColor: COLORS.greenPaid,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 1,
  },

  // Product Catalog Table
  tableContainer: {
    marginTop: 3,
    borderWidth: 0.6,
    borderColor: COLORS.borderLight,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.maroonDark,
    paddingVertical: 4.5,
    paddingHorizontal: 6,
  },
  thCol0: { width: '6%', textAlign: 'center' },
  thCol1: { width: '48%' },
  thCol2: { width: '12%', textAlign: 'center' },
  thCol3: { width: '8%', textAlign: 'center' },
  thCol4: { width: '13%', textAlign: 'right' },
  thCol5: { width: '13%', textAlign: 'right' },
  thText: {
    color: '#FAF8F5',
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.8,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5.5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    backgroundColor: '#FCFAF7',
  },
  itemTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 8.5,
    color: COLORS.maroonDark,
    marginBottom: 1.5,
  },
  itemSku: {
    fontSize: 6.8,
    color: COLORS.mutedText,
  },
  tailoringTag: {
    fontSize: 6.8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.goldMuted,
    marginTop: 2,
  },
  tdTextCenter: {
    fontSize: 7.5,
    textAlign: 'center',
    color: COLORS.charcoal,
  },
  tdTextRight: {
    fontSize: 7.5,
    textAlign: 'right',
    color: COLORS.charcoal,
  },
  tdAmountBold: {
    fontSize: 7.8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    color: COLORS.maroonDark,
  },

  // Tax Summary Schedule Strip
  taxScheduleStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.linenBg,
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderWidth: 0.6,
    borderColor: COLORS.borderLight,
    marginTop: 3,
  },
  taxScheduleText: {
    fontSize: 6.8,
    color: '#555555',
  },
  taxScheduleTextBold: {
    fontFamily: 'Helvetica-Bold',
    color: COLORS.charcoal,
  },

  // Summary & Remittance Section
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  bottomLeftCol: {
    width: '53%',
  },
  wordsCard: {
    backgroundColor: COLORS.ivoryBg,
    borderWidth: 0.6,
    borderColor: COLORS.borderLight,
    borderRadius: 2,
    padding: 6.5,
    marginBottom: 5,
  },
  wordsTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.5,
    letterSpacing: 0.8,
    color: COLORS.goldMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  wordsValue: {
    fontFamily: 'Times-Italic',
    fontSize: 8,
    color: COLORS.maroonDark,
    lineHeight: 1.25,
  },
  bankCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: COLORS.borderLight,
    borderRadius: 2,
    padding: 6.5,
  },
  bankTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.5,
    letterSpacing: 0.8,
    color: COLORS.goldMuted,
    textTransform: 'uppercase',
    marginBottom: 2.5,
  },
  bankDetailText: {
    fontSize: 6.8,
    color: '#444444',
    lineHeight: 1.3,
  },

  // Right Calculation Box
  summaryCard: {
    width: '44%',
    backgroundColor: COLORS.ivoryBg,
    borderWidth: 0.8,
    borderColor: COLORS.borderGold,
    borderRadius: 2,
    padding: 7,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1.8,
  },
  summaryLabel: {
    fontSize: 7,
    color: '#555555',
  },
  summaryVal: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: COLORS.charcoal,
  },
  freeShipping: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#2E7D32',
  },
  grandTotalDivider: {
    height: 0.8,
    backgroundColor: COLORS.goldAccent,
    marginVertical: 3.5,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: 1,
  },
  grandTotalLabel: {
    fontFamily: 'Times-Bold',
    fontSize: 9.5,
    color: COLORS.maroonDark,
  },
  grandTotalValue: {
    fontFamily: 'Times-Bold',
    fontSize: 11.5,
    color: COLORS.maroonDark,
  },
  gstNote: {
    fontSize: 5.8,
    color: COLORS.mutedText,
    textAlign: 'right',
    marginTop: 1.5,
  },

  // Footer Policies & Stamp
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 0.8,
    borderTopColor: COLORS.borderLight,
  },
  termsCol: {
    width: '64%',
  },
  termsTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.5,
    letterSpacing: 0.5,
    color: '#444444',
    marginBottom: 2,
  },
  termItem: {
    fontSize: 6,
    color: '#666666',
    lineHeight: 1.3,
    marginBottom: 1.2,
  },
  stampCol: {
    width: '33%',
    alignItems: 'center',
  },
  forBrand: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.8,
    color: COLORS.maroonDark,
    marginBottom: 3,
    textAlign: 'center',
  },
  sealBox: {
    width: 115,
    borderWidth: 0.8,
    borderColor: COLORS.goldAccent,
    borderRadius: 2,
    paddingVertical: 5,
    paddingHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#FCFAF7',
  },
  sealText1: {
    fontFamily: 'Times-Bold',
    fontSize: 6.8,
    letterSpacing: 0.8,
    color: COLORS.goldMuted,
    marginBottom: 1,
  },
  sealText2: {
    fontFamily: 'Helvetica',
    fontSize: 5.5,
    color: '#777777',
    marginBottom: 1.5,
  },
  signatoryTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.2,
    color: COLORS.maroonDark,
    marginTop: 2,
  },
});

function formatPdfNumber(val: number): string {
  return val.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function formatPdfCurrency(val: number): string {
  return `Rs. ${val.toLocaleString('en-IN')}`;
}

export const KenzaeTaxInvoiceDocument: React.FC<{ order: BoutiqueOrder }> = ({ order }) => {
  const isKerala = order.taxBreakdown.isKeralaIntrastate;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const amountInWords = convertAmountToWords(order.grandTotal);
  const totalGstAmount =
    order.taxBreakdown.cgstAmount + order.taxBreakdown.sgstAmount + order.taxBreakdown.igstAmount;

  return (
    <Document title={`Kenzae_Tax_Invoice_${order.orderNumber}`} author="Kenzae Designer Boutique">
      <Page size="A4" style={styles.page}>
        {/* Top Gold Double Accent Lines */}
        <View style={styles.topGoldBar1} />
        <View style={styles.topGoldBar2} />

        {/* Brand & Invoice Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>KENZAE</Text>
            <Text style={styles.brandTagline}>Haute Couture & Handwoven Kerala Ethnic Weaves</Text>
            <Text style={styles.brandAddress}>
              Mulanthuruthy, Ernakulam District, Kerala – 682314{'\n'}
              GSTIN: 32AAACK1234F1ZX | State Code: 32 (Kerala){'\n'}
              Concierge: +91 94470 12345 | Boutique Desk: kenzaeboutique@gmail.com
            </Text>
          </View>

          <View style={styles.invoiceMetaBlock}>
            <Text style={styles.taxInvoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.invoiceSubtitle}>ORIGINAL FOR RECIPIENT</Text>
            <Text style={styles.supplyDetails}>
              Invoice No: {order.invoiceNumber}{'\n'}
              Date: {invoiceDate}{'\n'}
              Place of Supply: {isKerala ? 'Kerala (32)' : `${order.customer.state}`}{'\n'}
              Reverse Charge: No
            </Text>
          </View>
        </View>

        {/* 2-Column Info Cards */}
        <View style={styles.infoCardsContainer}>
          {/* Card 1: Billed / Shipped To */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Billed To & Delivered To</Text>
            <Text style={styles.customerName}>{order.customer.fullName || 'Valued Patron'}</Text>
            <Text style={styles.cardLine}>Mobile: {order.customer.phoneNumber || 'N/A'}</Text>
            <Text style={styles.cardLine}>{order.customer.streetAddress || ''}</Text>
            <Text style={styles.cardLine}>
              {order.customer.city || ''}, {order.customer.state || 'Kerala'} – {order.customer.pincode || ''}
            </Text>
            <Text style={styles.cardLine}>
              State Code: {isKerala ? '32 (Kerala)' : order.customer.state}
            </Text>
            {order.customer.specialDeliveryNote ? (
              <Text style={styles.noteText}>
                Patron Note: "{order.customer.specialDeliveryNote}"
              </Text>
            ) : null}
          </View>

          {/* Card 2: Order & Transaction Particulars */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Order & Payment Particulars</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Order Reference:</Text>
              <Text style={styles.metaValue}>#{order.orderNumber}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice Date:</Text>
              <Text style={styles.metaValue}>{invoiceDate}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Payment Gateway:</Text>
              <Text style={styles.metaValue}>
                {order.paymentMethod.replace('_', ' ').toUpperCase()}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Transaction ID:</Text>
              <Text style={styles.metaValue}>
                {order.razorpayPaymentId || 'VERIFIED_DIRECT_REMITTANCE'}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Payment Status:</Text>
              <Text style={styles.paidBadge}>{order.paymentStatus.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Product Catalog Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={styles.thCol0}><Text style={styles.thText}>No.</Text></View>
            <View style={styles.thCol1}><Text style={styles.thText}>Ensemble & Bespoke Finishing</Text></View>
            <View style={styles.thCol2}><Text style={styles.thText}>HSN</Text></View>
            <View style={styles.thCol3}><Text style={styles.thText}>Qty</Text></View>
            <View style={styles.thCol4}><Text style={styles.thText}>Rate</Text></View>
            <View style={styles.thCol5}><Text style={styles.thText}>Amount</Text></View>
          </View>

          {order.items.map((item, idx) => {
            const isSaree =
              item.category === 'Saris' ||
              (item.subCategory && item.subCategory.toLowerCase().includes('silk'));
            const hsnCode = isSaree ? '5007' : '6204';
            const unitPrice = item.price + (item.tailoring.additionalCost || 0);
            const lineTotal = unitPrice * item.quantity;

            return (
              <View
                key={idx}
                style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <View style={styles.thCol0}>
                  <Text style={styles.tdTextCenter}>{idx + 1}</Text>
                </View>
                <View style={styles.thCol1}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSku}>SKU: {item.sku} · {item.category}</Text>
                  {item.tailoring.type === 'saree' &&
                  item.tailoring.sareeFinishing === 'fall_and_pico' ? (
                    <Text style={styles.tailoringTag}>
                      + Bespoke Finishing: Saree Fall & Pico (Rs. {item.tailoring.additionalCost})
                    </Text>
                  ) : null}
                  {item.tailoring.type === 'saree' &&
                  item.tailoring.sareeFinishing === 'custom_blouse_stitching' ? (
                    <Text style={styles.tailoringTag}>
                      + Bespoke Tailoring: Custom Blouse Stitching (Rs. {item.tailoring.additionalCost})
                    </Text>
                  ) : null}
                  {item.tailoring.selectedSize ? (
                    <Text style={styles.tailoringTag}>
                      + Selected Ensemble Size: {item.tailoring.selectedSize}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.thCol2}>
                  <Text style={styles.tdTextCenter}>{hsnCode}</Text>
                </View>
                <View style={styles.thCol3}>
                  <Text style={styles.tdTextCenter}>{item.quantity}</Text>
                </View>
                <View style={styles.thCol4}>
                  <Text style={styles.tdTextRight}>{formatPdfCurrency(unitPrice)}</Text>
                </View>
                <View style={styles.thCol5}>
                  <Text style={styles.tdAmountBold}>{formatPdfCurrency(lineTotal)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* GST Tax Schedule Mini Strip */}
        <View style={styles.taxScheduleStrip}>
          <Text style={styles.taxScheduleText}>
            <Text style={styles.taxScheduleTextBold}>GST Schedule (HSN 5007 / 6204): </Text>
            Taxable Value: Rs. {formatPdfNumber(order.taxBreakdown.taxableAmount)}  |  
            {isKerala ? (
              ` CGST (2.5%): Rs. ${formatPdfNumber(order.taxBreakdown.cgstAmount)}  |  SGST (2.5%): Rs. ${formatPdfNumber(order.taxBreakdown.sgstAmount)}`
            ) : (
              ` IGST (5.0%): Rs. ${formatPdfNumber(order.taxBreakdown.igstAmount)}`
            )}
            {`  |  Total Tax: Rs. ${formatPdfNumber(totalGstAmount)}`}
          </Text>
        </View>

        {/* Bottom Section: Left (Words + Bank) & Right (Totals) */}
        <View style={styles.bottomContainer}>
          {/* Left Column */}
          <View style={styles.bottomLeftCol}>
            {/* Amount in Words */}
            <View style={styles.wordsCard}>
              <Text style={styles.wordsTitle}>Invoice Value in Words</Text>
              <Text style={styles.wordsValue}>{amountInWords}</Text>
            </View>

            {/* Bank Remittance Details */}
            <View style={styles.bankCard}>
              <Text style={styles.bankTitle}>Bank Remittance & NEFT Settlement</Text>
              <Text style={styles.bankDetailText}>
                Beneficiary: Kenzae Designer Boutique{'\n'}
                Bank: State Bank of India · Branch: Mulanthuruthy (0070154){'\n'}
                Account Number: 38472910482 · IFSC: SBIN0070154
              </Text>
            </View>
          </View>

          {/* Right Column: Calculation Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Taxable Value:</Text>
              <Text style={styles.summaryVal}>
                Rs. {formatPdfNumber(order.taxBreakdown.taxableAmount)}
              </Text>
            </View>

            {isKerala ? (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>CGST (2.5%):</Text>
                  <Text style={styles.summaryVal}>
                    Rs. {formatPdfNumber(order.taxBreakdown.cgstAmount)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>SGST (2.5%):</Text>
                  <Text style={styles.summaryVal}>
                    Rs. {formatPdfNumber(order.taxBreakdown.sgstAmount)}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>IGST (5.0%):</Text>
                <Text style={styles.summaryVal}>
                  Rs. {formatPdfNumber(order.taxBreakdown.igstAmount)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Insured Express Shipping:</Text>
              <Text style={order.shippingFee === 0 ? styles.freeShipping : styles.summaryVal}>
                {order.shippingFee === 0
                  ? 'FREE (Kerala Express)'
                  : `Rs. ${formatPdfNumber(order.shippingFee)}`}
              </Text>
            </View>

            <View style={styles.grandTotalDivider} />

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total:</Text>
              <Text style={styles.grandTotalValue}>
                {formatPdfCurrency(order.grandTotal)}
              </Text>
            </View>
            <Text style={styles.gstNote}>Inclusive of all applicable Central & State GST</Text>
          </View>
        </View>

        {/* Footer Terms & Signatory Stamp */}
        <View style={styles.footerContainer}>
          <View style={styles.termsCol}>
            <Text style={styles.termsTitle}>Authenticity Guarantee & Boutique Policies:</Text>
            <Text style={styles.termItem}>
              1. All saris and ensembles are authentic artisanal handloom creations. Minor weave slubs are proof of hand craftsmanship.
            </Text>
            <Text style={styles.termItem}>
              2. Sizing adjustments or blouse finishing can be facilitated at our Mulanthuruthy atelier within 7 days of delivery.
            </Text>
            <Text style={styles.termItem}>
              3. Computer-generated tax invoice issued in accordance with Section 31 of CGST Act read with GST Rule 46.
            </Text>
          </View>

          <View style={styles.stampCol}>
            <Text style={styles.forBrand}>For KENZAE DESIGNER BOUTIQUE</Text>
            <View style={styles.sealBox}>
              <Text style={styles.sealText1}>★ DIGITALLY SEALED ★</Text>
              <Text style={styles.sealText2}>MULANTHURUTHY ATELIER</Text>
              <Text style={styles.signatoryTitle}>Authorized Signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Generates an authentic, vector-crisp Indian GST Tax Invoice adhering strictly
 * to Kerala State GST & Central GST apparel standards (HSN 5007 / 6204).
 */
export async function generateGSTTaxInvoicePDF(
  order: BoutiqueOrder,
  options: InvoiceGeneratorOptions = { autoDownload: true }
): Promise<{ filename: string; blob: Blob; url: string }> {
  const filename = `Kenzae_Tax_Invoice_${order.orderNumber}.pdf`;

  const doc = <KenzaeTaxInvoiceDocument order={order} />;
  const instance = pdf(doc as any);
  const blob = await instance.toBlob();
  const url = URL.createObjectURL(blob);

  if (options.autoDownload && typeof window !== 'undefined') {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Cleanup object URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  return { filename, blob, url };
}
