import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { formatCurrencyINR } from '../../utils/formatters';
import { generateCartOrderWhatsAppUrl } from '../../utils/whatsapp';

interface CartDrawerProps {
  onOpenCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totals,
    shippingAddress,
    setShippingAddress,
  } = useCart();

  const [pincodeInput, setPincodeInput] = useState(shippingAddress.pincode);

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingAddress((prev) => ({
      ...prev,
      pincode: pincodeInput.trim(),
    }));
  };

  const handleWhatsAppCheckout = () => {
    const url = generateCartOrderWhatsAppUrl(cartItems, totals, shippingAddress);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleProceedCheckout = () => {
    if (onOpenCheckout) {
      onOpenCheckout();
    } else {
      handleWhatsAppCheckout();
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-maroon-950/40 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-[#FAF8F5] text-obsidian shadow-2xl flex flex-col h-full z-10 border-l border-canvas-border"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-canvas-border bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-maroon-50 text-maroon-900">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-medium text-maroon-950">
                    Boutique Bag
                  </h2>
                  <span className="text-[11px] text-obsidian-muted uppercase tracking-wider">
                    {totals.itemCount} {totals.itemCount === 1 ? 'Piece' : 'Pieces'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-canvas-subtle text-obsidian-slate hover:text-obsidian transition-colors"
                aria-label="Close Bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator (Kerala) */}
            {totals.itemCount > 0 && (
              <div className="bg-maroon-900/5 border-b border-maroon-900/10 px-5 py-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-maroon-950">
                    <Truck className="w-4 h-4 text-brass-dark" />
                    <span>
                      {totals.shippingFee === 0
                        ? '🎉 Free Courier Delivery Qualified (Kerala)'
                        : `Add ${formatCurrencyINR(totals.amountNeededForFreeShipping)} more for FREE Delivery in Kerala`}
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-canvas-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-maroon-900 transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (totals.subtotal / totals.freeShippingThreshold) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Scrollable Items Container */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-canvas-subtle border border-canvas-border flex items-center justify-center text-obsidian-muted">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-maroon-950 font-medium">
                      Your bag is empty
                    </h3>
                    <p className="text-xs text-obsidian-slate mt-1 max-w-xs leading-relaxed">
                      Discover our curated handwoven saris, bespoke churidars, and unstitched artisanal fabrics.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="py-2.5 px-6 rounded-lg bg-maroon-900 text-brass-light text-xs font-semibold uppercase tracking-wider hover:bg-maroon-850 active:scale-95 transition-all shadow-xs"
                  >
                    Explore Collections
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-3 border border-canvas-border shadow-luxury flex gap-3 relative group"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-24 rounded-lg overflow-hidden bg-canvas-subtle shrink-0 border border-canvas-border">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif text-sm font-medium text-obsidian line-clamp-1">
                            {item.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-obsidian-muted hover:text-terracotta transition-colors p-1"
                            title="Remove from bag"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-obsidian-muted">
                          {item.sku}
                        </span>

                        {/* Tailoring Badge */}
                        <div className="mt-1">
                          {item.tailoring.type === 'saree' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-canvas-subtle text-maroon-950 border border-canvas-border">
                              {item.tailoring.sareeFinishing === 'fall_and_pico'
                                ? `+ Fall & Pico (₹${item.tailoring.additionalCost})`
                                : item.tailoring.sareeFinishing === 'custom_blouse_stitching'
                                ? `+ Custom Blouse (₹${item.tailoring.additionalCost})`
                                : 'Standard Unstitched'}
                            </span>
                          )}

                          {item.tailoring.selectedSize && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-canvas-subtle text-maroon-950 border border-canvas-border">
                              Size: {item.tailoring.selectedSize}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pricing and Quantity */}
                      <div className="flex items-center justify-between pt-2 border-t border-canvas-border mt-2">
                        <span className="text-xs font-semibold text-maroon-950 font-sans">
                          {formatCurrencyINR(item.itemTotal)}
                        </span>

                        <div className="flex items-center border border-canvas-border rounded-lg bg-canvas-subtle overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-white text-obsidian transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold tabular-nums text-obsidian">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-white text-obsidian transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Calculation & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-5 bg-white border-t border-canvas-border space-y-3 shrink-0 shadow-lg">
                {/* Pincode & Delivery Area Check */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-canvas-border">
                  <div className="flex items-center gap-1.5 text-obsidian-slate">
                    <MapPin className="w-3.5 h-3.5 text-brass-dark" />
                    <span>Deliver to Pincode:</span>
                  </div>

                  <form onSubmit={handlePincodeSubmit} className="flex items-center gap-1">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 682314"
                      className="w-20 px-2 py-1 text-xs border border-canvas-border rounded font-mono text-center focus:outline-none focus:border-maroon-900"
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 text-[10px] font-semibold uppercase bg-canvas-subtle hover:bg-maroon-900 hover:text-white rounded border border-canvas-border transition-colors"
                    >
                      Check
                    </button>
                  </form>
                </div>

                {/* Subtotals & Delivery */}
                <div className="space-y-1.5 text-xs text-obsidian-slate">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-sans font-medium text-obsidian">
                      {formatCurrencyINR(totals.subtotal)}
                    </span>
                  </div>

                  {totals.tailoringTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Tailoring & Finishing</span>
                      <span className="font-sans font-medium text-obsidian">
                        +{formatCurrencyINR(totals.tailoringTotal)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Courier Delivery</span>
                    <span className="font-sans font-medium text-obsidian">
                      {totals.shippingFee === 0 ? (
                        <span className="text-emerald-700 font-semibold">FREE</span>
                      ) : (
                        `+${formatCurrencyINR(totals.shippingFee)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-maroon-950 pt-2 border-t border-canvas-border">
                    <span>Total Amount</span>
                    <span className="text-base font-sans">
                      {formatCurrencyINR(totals.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Dual Conversion Actions */}
                <div className="space-y-2 pt-1">
                  {/* Primary 1-Tap WhatsApp Checkout */}
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3 px-4 rounded-xl bg-maroon-900 hover:bg-maroon-850 active:scale-[0.98] text-brass-light hover:text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all border border-maroon-900"
                  >
                    <MessageCircle className="w-4 h-4 text-whatsapp" />
                    <span>Order via WhatsApp ({formatCurrencyINR(totals.grandTotal)})</span>
                  </button>

                  {/* Secondary Instant Checkout / Modal trigger */}
                  {onOpenCheckout && (
                    <button
                      onClick={handleProceedCheckout}
                      className="w-full py-2.5 px-4 rounded-xl bg-canvas-subtle hover:bg-white active:scale-[0.98] text-obsidian font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-canvas-border transition-all"
                    >
                      <span>Proceed with Shipping Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-obsidian-muted" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-obsidian-muted pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brass-dark" />
                  <span>100% Authentic Handloom • Mulanthuruthy Boutique Atelier</span>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
