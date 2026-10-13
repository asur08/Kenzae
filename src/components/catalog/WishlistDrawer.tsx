import React from 'react';
import { X, Trash2, MessageCircle, Heart, ArrowRight } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { formatCurrencyINR } from '../../utils/formatters';
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

  if (!isWishlistOpen) return null;

  const totalValue = wishlistProducts.reduce((sum, item) => sum + item.price, 0);

  const handleWhatsAppInquireAll = () => {
    const url = generateWishlistWhatsAppUrl(wishlistProducts);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Slide-in Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-canvas shadow-2xl flex flex-col border-l border-gold-500/30">
          
          {/* Header */}
          <div className="p-5 border-b border-canvas-dark flex items-center justify-between bg-canvas-subtle">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-gold-500 fill-current" />
              <div>
                <h2 className="font-serif text-xl font-bold text-emerald-950">
                  Your Curated Shortlist
                </h2>
                <p className="text-xs text-obsidian-muted">
                  {wishlistProducts.length} {wishlistProducts.length === 1 ? 'piece' : 'pieces'} saved
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 rounded-full hover:bg-canvas-muted text-obsidian transition-colors"
              aria-label="Close Wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {wishlistProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-canvas-subtle border border-canvas-dark flex items-center justify-center text-obsidian-muted">
                  <Heart className="w-8 h-8 text-canvas-dark" />
                </div>
                <h3 className="font-serif text-lg font-bold text-emerald-950">
                  Your Shortlist is Empty
                </h3>
                <p className="text-xs text-obsidian-muted max-w-xs">
                  Tap the heart icon on any sari, churidar, or dress material to save it to your curated boutique collection.
                </p>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="px-5 py-2.5 rounded-full gold-gradient-bg text-emerald-950 text-xs font-bold uppercase tracking-wider shadow-sm"
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
                  className="flex gap-3 p-3 bg-white rounded-xl border border-canvas-dark/60 hover:border-gold-500/40 transition-all cursor-pointer group shadow-sm"
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
                  <div className="flex-1 flex flex-col justify-between py-0.5">
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
                          className="text-obsidian-muted hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-obsidian line-clamp-1 group-hover:text-emerald-850">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-obsidian-muted">
                        {item.subCategory || item.category}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-bold text-emerald-950">
                        {formatCurrencyINR(item.price)}
                      </span>
                      <span className="text-[10px] text-emerald-850 flex items-center gap-1 font-medium">
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
            <div className="p-4 border-t border-canvas-dark bg-canvas-subtle space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wider text-obsidian-muted font-medium">
                  Estimated Value
                </span>
                <span className="text-xl font-bold text-emerald-950 font-sans">
                  {formatCurrencyINR(totalValue)}
                </span>
              </div>

              {/* Inquire All via WhatsApp Button */}
              <button
                onClick={handleWhatsAppInquireAll}
                className="w-full py-3.5 px-4 rounded-full bg-emerald-900 hover:bg-emerald-850 text-gold-300 hover:text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 border border-gold-500/40 active:scale-95"
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

        </div>
      </div>
    </div>
  );
};
