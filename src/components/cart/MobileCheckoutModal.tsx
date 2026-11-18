import React, { useState } from 'react';
import {
  X,
  MapPin,
  MessageCircle,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import { formatCurrencyINR } from '../../utils/formatters';
import { generateCartOrderWhatsAppUrl } from '../../utils/whatsapp';

interface MobileCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileCheckoutModal: React.FC<MobileCheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, totals, shippingAddress, setShippingAddress, clearCart } = useCart();
  const { createOrder } = useOrders();

  const [form, setForm] = useState(shippingAddress);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('');

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.fullName.trim()) errs.fullName = 'Please enter your name';
    if (!form.phoneNumber.trim() || form.phoneNumber.trim().length < 10) {
      errs.phoneNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (!form.streetAddress.trim()) errs.streetAddress = 'Please enter your delivery address';
    if (!form.city.trim()) errs.city = 'Please enter your city/town';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Record order in boutique database/order pipeline
    const order = createOrder(form, cartItems, 'whatsapp_upi', 'pending');
    setCreatedOrderNumber(order.orderNumber);

    // Trigger WhatsApp Checkout with the confirmed address
    const url = generateCartOrderWhatsAppUrl(cartItems, totals, form);
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsSubmitted(true);
    clearCart();
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
                  Delivery & Order Booking
                </h3>
                <span className="text-[10px] text-obsidian-muted uppercase tracking-wider">
                  Kenzae Mulanthuruthy Dispatch
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
            {isSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-medium text-maroon-950">
                    Order Recorded at Atelier
                  </h4>
                  {createdOrderNumber && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-maroon-100 text-maroon-950 mt-1">
                      Order #{createdOrderNumber}
                    </span>
                  )}
                  <p className="text-xs text-obsidian-slate mt-1 max-w-sm mx-auto leading-relaxed">
                    Thank you, <span className="font-semibold text-obsidian">{form.fullName}</span>! Your pieces, tailoring preferences, and delivery address have been transmitted to our boutique team.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-canvas-border max-w-xs mx-auto text-xs text-left space-y-1">
                  <div className="text-[10px] uppercase font-bold text-maroon-900 tracking-wider">
                    Next Step
                  </div>
                  <p className="text-obsidian-slate leading-snug">
                    Our master draper is reviewing your fabric specifications and will share direct payment details and dispatch timings with you on WhatsApp.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    onClose();
                  }}
                  className="py-2.5 px-6 rounded-lg bg-maroon-900 text-brass-light text-xs font-semibold uppercase tracking-wider hover:bg-maroon-850 transition-all"
                >
                  Return to Store
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="w-full px-3 py-2 text-xs border border-canvas-border rounded-lg focus:outline-none focus:border-maroon-900 bg-canvas-subtle/50"
                    />
                    {errors.fullName && (
                      <span className="text-[10px] text-terracotta mt-0.5 block">{errors.fullName}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-obsidian-slate block mb-1">
                      Mobile Number (WhatsApp) <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      placeholder="e.g. 9447012345"
                      className="w-full px-3 py-2 text-xs border border-canvas-border rounded-lg focus:outline-none focus:border-maroon-900 bg-canvas-subtle/50"
                    />
                    {errors.phoneNumber && (
                      <span className="text-[10px] text-terracotta mt-0.5 block">{errors.phoneNumber}</span>
                    )}
                  </div>
                </div>

                {/* Delivery Address Fields */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-canvas-border shadow-luxury">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-maroon-950 block">
                    2. Delivery Address
                  </span>

                  <div>
                    <label className="text-xs text-obsidian-slate block mb-1">
                      Street Address / House Name <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.streetAddress}
                      onChange={(e) => handleChange('streetAddress', e.target.value)}
                      placeholder="House / Flat / Villa name & street"
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
                        placeholder="e.g. Ernakulam"
                        className="w-full px-3 py-2 text-xs border border-canvas-border rounded-lg focus:outline-none focus:border-maroon-900 bg-canvas-subtle/50"
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
                        className="w-full px-3 py-2 text-xs font-mono border border-canvas-border rounded-lg focus:outline-none focus:border-maroon-900 bg-canvas-subtle/50"
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
                      placeholder="e.g. Deliver before Friday, or custom blouse neckline request"
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
                      <span>Tailoring & Finishing</span>
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
                    <span>Total Amount</span>
                    <span className="font-sans text-base">{formatCurrencyINR(totals.grandTotal)}</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-maroon-900 hover:bg-maroon-850 active:scale-[0.98] text-brass-light hover:text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all border border-maroon-900"
                >
                  <MessageCircle className="w-4 h-4 text-whatsapp" />
                  <span>Confirm Order on WhatsApp ({formatCurrencyINR(totals.grandTotal)})</span>
                </button>

                <p className="text-[10px] text-center text-obsidian-muted">
                  Your pieces will be reserved by our Mulanthuruthy atelier immediately.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MobileCheckoutModal;
