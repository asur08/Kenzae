import React, { useState } from 'react';
import {
  X,
  MapPin,
  CheckCircle,
  Lock,
  ShieldCheck,
  FileText,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import { useCatalog } from '../../context/CatalogContext';
import { formatCurrencyINR } from '../../utils/formatters';
import { initiateRazorpayPayment } from '../../utils/razorpay';
import { generateGSTTaxInvoicePDF } from '../../utils/invoiceGenerator';
import { BoutiqueOrder } from '../../types/orders';

interface MobileCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileCheckoutModal: React.FC<MobileCheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, totals, shippingAddress, setShippingAddress, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { products, updateProductStock } = useCatalog();

  const [form, setForm] = useState(shippingAddress);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<BoutiqueOrder | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.fullName.trim()) errs.fullName = 'Please enter your full name';
    if (!form.phoneNumber.trim() || form.phoneNumber.trim().length < 10) {
      errs.phoneNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (!form.streetAddress.trim()) errs.streetAddress = 'Please enter your delivery street address';
    if (!form.city.trim()) errs.city = 'Please enter your city / town';
    if (!form.pincode.trim() || form.pincode.trim().length < 6) {
      errs.pincode = 'Please enter a 6-digit postal code';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setShippingAddress(updated);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (cartItems.length === 0) return;

    setIsProcessing(true);
    setPaymentError(null);

    const itemsSummary = cartItems
      .map((it) => `${it.title} (${it.sku}) x${it.quantity}`)
      .join(', ');

    await initiateRazorpayPayment({
      totals,
      customer: form,
      itemsSummary,
      onSuccess: (paymentResp) => {
        // 1. Create order as PAID in Boutique Orders Pipeline with Razorpay reference
        const newOrder = createOrder(
          form,
          cartItems,
          'razorpay_online',
          'paid',
          paymentResp.razorpay_payment_id
        );

        // 2. Atomically deduct purchased quantities from catalog inventory
        cartItems.forEach((cartItem) => {
          const match = products.find((p) => p.id === cartItem.productId);
          if (match) {
            const currentQty = match.stockQuantity ?? (match.in_stock ? 1 : 0);
            const remaining = Math.max(0, currentQty - cartItem.quantity);
            updateProductStock(cartItem.productId, remaining);
          }
        });

        // 3. Clear Bag
        clearCart();
        setCompletedOrder(newOrder);
        setIsProcessing(false);
      },
      onDismiss: () => {
        setIsProcessing(false);
      },
      onError: (err) => {
        setIsProcessing(false);
        setPaymentError(err?.description || 'Payment authorization was cancelled or failed. Please retry.');
      },
    });
  };

  const handleDownloadInvoice = async () => {
    if (!completedOrder || isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      await generateGSTTaxInvoicePDF(completedOrder, { autoDownload: true });
    } catch (err) {
      console.error('Invoice generation failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Scrim */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-maroon-950/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#FAF8F5] text-obsidian rounded-2xl shadow-2xl border border-canvas-border overflow-hidden z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-white border-b border-canvas-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-maroon-50 text-maroon-900">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-maroon-950">
                  {completedOrder ? 'Order Confirmed' : 'Delivery & Secure Checkout'}
                </h3>
                <span className="text-[10px] text-obsidian-muted uppercase tracking-wider">
                  Kenzae Designer Boutique • Mulanthuruthy
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-canvas-subtle text-obsidian-slate hover:text-obsidian transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form / Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {completedOrder ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                  <CheckCircle className="w-9 h-9 stroke-[1.75]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Payment Successful • Confirmed
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-maroon-950 mt-2">
                    Thank You, {completedOrder.customer.fullName}!
                  </h4>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="font-mono text-xs font-bold text-obsidian px-2.5 py-0.5 rounded-md bg-canvas-subtle border border-canvas-border">
                      Order #{completedOrder.orderNumber}
                    </span>
                    <span className="font-mono text-xs text-obsidian-muted">
                      {completedOrder.invoiceNumber}
                    </span>
                  </div>
                  <p className="text-xs text-obsidian-slate mt-2 max-w-sm mx-auto leading-relaxed">
                    Your bespoke ensemble is being prepared at our Mulanthuruthy atelier. A confirmation copy and courier tracking details will be dispatched to your mobile.
                  </p>
                </div>

                {/* Download GST Tax Invoice Box */}
                <div className="p-4 bg-white rounded-xl border border-canvas-border text-left text-xs space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-maroon-950 uppercase tracking-wider block">
                        Official Tax Invoice
                      </span>
                      <span className="text-[10px] text-obsidian-muted">
                        GSTIN: 32AAACK1234F1ZX • Original for Recipient
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isGeneratingPdf}
                      onClick={handleDownloadInvoice}
                      className="px-3 py-1.5 rounded-lg bg-maroon-900 hover:bg-maroon-850 disabled:opacity-60 text-brass-light font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <FileText className={`w-3.5 h-3.5 ${isGeneratingPdf ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-canvas-border grid grid-cols-2 gap-2 text-[11px] text-obsidian-slate">
                    <div>
                      <span className="block text-obsidian-muted text-[10px]">Delivering To:</span>
                      <span className="font-semibold text-obsidian">{completedOrder.customer.city}, {completedOrder.customer.state}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-obsidian-muted text-[10px]">Total Paid:</span>
                      <span className="font-bold text-maroon-950 font-sans text-xs">{formatCurrencyINR(completedOrder.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-canvas-subtle hover:bg-white text-obsidian font-semibold text-xs uppercase tracking-wider transition-colors border border-canvas-border"
                >
                  Return to Storefront
                </button>
              </div>
            ) : (
              <form onSubmit={handleRazorpayPayment} className="space-y-4">
                {paymentError && (
                  <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                    <span className="font-bold">Error:</span> {paymentError}
                  </div>
                )}

                {/* Contact Fields */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-canvas-border shadow-luxury">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-maroon-950 block">
                    1. Contact Information
                  </span>

                  <div>
                    <label className="text-xs text-obsidian-slate block mb-1">
                      Full Name <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="e.g. Parvathy Menon"
                      className="w-full px-3 py-2 text-xs border border-canvas-border rounded-lg focus:outline-none focus:border-maroon-900 bg-canvas-subtle/50 font-medium"
                    />
                    {errors.fullName && (
                      <span className="text-[10px] text-terracotta mt-0.5 block">{errors.fullName}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-obsidian-slate block mb-1">
                      Mobile Number (for Courier &amp; Invoice) <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      placeholder="e.g. 9447012345"
                      className="w-full px-3 py-2 text-xs border border-canvas-border rounded-lg focus:outline-none focus:border-maroon-900 bg-canvas-subtle/50 font-medium"
                    />
                    {errors.phoneNumber && (
                      <span className="text-[10px] text-terracotta mt-0.5 block">{errors.phoneNumber}</span>
                    )}
                  </div>
                </div>

                {/* Delivery Address Fields */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-canvas-border shadow-luxury">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-maroon-950 block">
                    2. Shipping Address
                  </span>

                  <div>
                    <label className="text-xs text-obsidian-slate block mb-1">
                      Street Address / House Name <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.streetAddress}
                      onChange={(e) => handleChange('streetAddress', e.target.value)}
                      placeholder="House / Apartment name, landmark, and street"
                      className="w-full px-3 py-2 text-xs border border-canvas-border rounded-lg focus:outline-none focus:border-maroon-900 bg-canvas-subtle/50"
                    />
                    {errors.streetAddress && (
                      <span className="text-[10px] text-terracotta mt-0.5 block">{errors.streetAddress}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-obsidian-slate block mb-1">
                        City / Town <span className="text-terracotta">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="e.g. Kochi"
                        className="w-full px-3 py-2 text-xs border border-canvas-border rounded-lg focus:outline-none focus:border-maroon-900 bg-canvas-subtle/50 font-medium"
                      />
                      {errors.city && (
                        <span className="text-[10px] text-terracotta mt-0.5 block">{errors.city}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-obsidian-slate block mb-1">
                        Pincode <span className="text-terracotta">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                        placeholder="682314"
                        className="w-full px-3 py-2 text-xs font-mono font-bold tracking-wider border border-canvas-border rounded-lg focus:outline-none focus:border-maroon-900 bg-canvas-subtle/50"
                      />
                      {errors.pincode && (
                        <span className="text-[10px] text-terracotta mt-0.5 block">{errors.pincode}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-obsidian-slate block mb-1">
                      Special Tailoring / Delivery Note (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={form.specialDeliveryNote || ''}
                      onChange={(e) => handleChange('specialDeliveryNote', e.target.value)}
                      placeholder="e.g. Desired blouse neckline, delivery before specific festival..."
                      className="w-full px-3 py-2 text-xs border border-canvas-border rounded-lg focus:outline-none focus:border-maroon-900 bg-canvas-subtle/50"
                    />
                  </div>
                </div>

                {/* Order Summary & Pricing Pill */}
                <div className="p-3.5 rounded-xl bg-canvas-subtle border border-canvas-border space-y-2 text-xs">
                  <div className="flex justify-between text-obsidian-slate">
                    <span>{totals.itemCount} piece(s) in bag</span>
                    <span>{formatCurrencyINR(totals.subtotal)}</span>
                  </div>

                  {totals.tailoringTotal > 0 && (
                    <div className="flex justify-between text-obsidian-slate">
                      <span>Tailoring &amp; Finishing</span>
                      <span>+{formatCurrencyINR(totals.tailoringTotal)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-obsidian-slate">
                    <span>Courier Delivery</span>
                    <span>
                      {totals.shippingFee === 0 ? (
                        <span className="text-emerald-700 font-semibold">FREE (Kerala)</span>
                      ) : (
                        formatCurrencyINR(totals.shippingFee)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold text-maroon-950 pt-2 border-t border-canvas-border text-sm">
                    <span>Total Amount Payable</span>
                    <span className="font-sans text-base">{formatCurrencyINR(totals.grandTotal)}</span>
                  </div>
                </div>

                {/* Primary Payment Action: Razorpay Standard Checkout */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3.5 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all border active:scale-[0.98] ${
                    isProcessing
                      ? 'bg-canvas-subtle text-obsidian-muted border-canvas-border cursor-wait'
                      : 'bg-maroon-900 hover:bg-maroon-850 text-brass-light hover:text-white border-maroon-900 cursor-pointer'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brass" />
                      <span>Opening Secure Razorpay Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-brass" />
                      <span>Pay {formatCurrencyINR(totals.grandTotal)} via Razorpay</span>
                    </>
                  )}
                </button>

                {/* Supported Payment Logos & Trust Signals */}
                <div className="text-center space-y-1.5 pt-1">
                  <div className="flex items-center justify-center gap-2 text-[10px] text-obsidian-muted">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Instant UPI (GPay/PhonePe/Paytm) • Cards • NetBanking • EMI</span>
                  </div>
                  <p className="text-[9px] text-obsidian-muted font-light">
                    256-bit encrypted checkout • Zero card details stored on boutique servers
                  </p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MobileCheckoutModal;
