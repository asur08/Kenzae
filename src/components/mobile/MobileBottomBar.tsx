import React from 'react';
import { Compass, Heart, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { useCart } from '../../context/CartContext';
import { generateStoreVisitWhatsAppUrl } from '../../utils/whatsapp';

export const MobileBottomBar: React.FC = () => {
  const { wishlistIds, setIsWishlistOpen } = useCatalog();
  const { totals, setIsCartOpen } = useCart();

  const handleConsult = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleDiscover = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-canvas-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 py-2"
      aria-label="Mobile Navigation Bar"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Discover */}
        <button
          onClick={handleDiscover}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 min-h-[44px] text-obsidian-slate hover:text-maroon-900 active:scale-[0.94] transition-transform duration-120"
          aria-label="Discover Collections"
        >
          <Compass className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px] font-semibold tracking-wider uppercase">Discover</span>
        </button>

        {/* Shortlist / Wishlist */}
        <button
          onClick={() => setIsWishlistOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 min-h-[44px] text-obsidian-slate hover:text-maroon-900 active:scale-[0.94] transition-transform duration-120 relative"
          aria-label="Shortlist"
        >
          <div className="relative">
            <Heart className="w-5 h-5 stroke-[1.75]" />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-maroon-900 text-brass-light text-[9px] font-bold flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-wider uppercase">Saved</span>
        </button>

        {/* Bag */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 min-h-[44px] text-maroon-950 active:scale-[0.94] transition-transform duration-120 relative"
          aria-label="Shopping Bag"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[2] text-maroon-900" />
            {totals.itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-maroon-900 text-brass-light text-[9px] font-bold flex items-center justify-center shadow-xs">
                {totals.itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-maroon-900">Bag</span>
        </button>

        {/* Consult / WhatsApp */}
        <button
          onClick={handleConsult}
          className="flex flex-col items-center justify-center gap-1 py-1 px-3 min-h-[44px] text-emerald-800 hover:text-emerald-700 active:scale-[0.94] transition-transform duration-120"
          aria-label="Direct Boutique Consultation"
        >
          <MessageCircle className="w-5 h-5 stroke-[1.75] text-whatsapp" />
          <span className="text-[10px] font-semibold tracking-wider uppercase">Consult</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomBar;
