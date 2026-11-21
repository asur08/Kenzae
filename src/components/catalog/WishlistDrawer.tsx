import React from 'react';
import { X, Trash2, MessageCircle, Heart, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCatalog } from '../../context/CatalogContext';
import { useCurrency } from '../../context/CurrencyContext';
import { generateWishlistWhatsAppUrl } from '../../utils/whatsapp';

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlistProducts,
    toggleWishlist,
    clearWishlist,
    setSelectedProduct,
  } = useCatalog();
  const { currentCurrency, formatPrice } = useCurrency();

  React.useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isWishlistOpen]);

  const totalValue = wishlistProducts.reduce((sum, item) => sum + item.price, 0);

  const handleWhatsAppInquireAll = () => {
    const url = generateWishlistWhatsAppUrl(wishlistProducts);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setIsWishlistOpen(false)}
          />

          {/* Slide-in Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="w-screen max-w-md bg-canvas shadow-2xl flex flex-col border-l border-brass/30"
            >
              {/* Header */}
              <div className="p-5 border-b border-canvas-border flex items-center justify-between bg-canvas-subtle">
                <div className="flex items-center gap-2.5">
                  <Heart className="w-5 h-5 text-maroon-900 fill-current" />
                  <div>
                    <h2 className="font-serif text-xl font-medium text-maroon-950">
                      Your Curated Shortlist
                    </h2>
                    <p className="text-xs text-obsidian-slate">
                      {wishlistProducts.length} {wishlistProducts.length === 1 ? 'piece' : 'pieces'} saved
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="p-2 rounded-full hover:bg-canvas-border text-obsidian transition-colors"
                  aria-label="Close Wishlist"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* List or Empty State */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {wishlistProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-maroon-50 border border-maroon-200 flex items-center justify-center text-maroon-900/50">
                      <Heart className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-xl font-medium text-maroon-950">
                      Your Shortlist is Empty
                    </h3>
                    <p className="text-xs text-obsidian-slate max-w-xs leading-relaxed">
                      Tap the heart icon on any sari, churidar, or dress material to save pieces for boutique comparison or WhatsApp inquiry.
                    </p>
                    <button
                      onClick={() => setIsWishlistOpen(false)}
                      className="px-5 py-2.5 rounded-full bg-maroon-900 hover:bg-maroon-850 text-brass-light text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors"
                    >
                      Explore Collection
                    </button>
                  </div>
                ) : (
                  wishlistProducts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedProduct(item);
                        setIsWishlistOpen(false);
                      }}
                      className="flex gap-3 p-3 bg-white rounded-xl border border-canvas-border hover:border-maroon-900/35 transition-all cursor-pointer group shadow-xs"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-24 rounded-lg overflow-hidden bg-canvas-subtle shrink-0">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-obsidian-muted uppercase">
                              {item.sku}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(item);
                              }}
                              className="text-obsidian-muted hover:text-rose-700 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <h4 className="font-serif text-sm font-medium text-obsidian line-clamp-1 group-hover:text-maroon-900">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-obsidian-muted truncate">
                            {item.subCategory || item.category}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-semibold text-maroon-950 tabular-nums">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-[10px] text-maroon-900 flex items-center gap-1 font-medium">
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Actions if items present */}
              {wishlistProducts.length > 0 && (
                <div className="p-4 border-t border-canvas-border bg-canvas-subtle space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-obsidian-slate font-medium">
                        Estimated Value
                      </span>
                      {currentCurrency !== 'INR' && (
                        <span className="block text-[10px] text-obsidian-muted">
                          ≈ ₹{totalValue.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <span className="text-xl font-bold text-maroon-950 font-sans tabular-nums">
                      {formatPrice(totalValue)}
                    </span>
                  </div>

                  <button
                    onClick={handleWhatsAppInquireAll}
                    className="w-full py-3.5 px-4 rounded-full bg-maroon-900 hover:bg-maroon-850 text-brass-light hover:text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 border border-brass/35 active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 text-whatsapp" />
                    <span>Inquire Entire Shortlist via WhatsApp</span>
                  </button>

                  <div className="flex justify-center">
                    <button
                      onClick={clearWishlist}
                      className="text-[11px] text-obsidian-muted hover:text-rose-700 underline underline-offset-2"
                    >
                      Clear All Saved Items
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
