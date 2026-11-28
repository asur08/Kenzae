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
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-canvas-border px-4 py-1.5"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4 max-w-md mx-auto">
        <button
          onClick={handleDiscover}
          className="flex flex-col items-center justify-center gap-1 py-1.5 min-h-[44px] text-obsidian-slate hover:text-obsidian active:scale-[0.97] transition-[transform,color] duration-150"
          aria-label="Discover collections"
        >
          <Compass className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-xs font-normal">Discover</span>
        </button>

        <button
          onClick={() => setIsWishlistOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1.5 min-h-[44px] text-obsidian-slate hover:text-obsidian active:scale-[0.97] transition-[transform,color] duration-150"
          aria-label="Shortlist"
        >
          <div className="relative">
            <Heart className="w-4 h-4" strokeWidth={1.5} />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-[4px] bg-maroon-900 text-white text-[11px] font-medium flex items-center justify-center tabular-nums">
                {wishlistIds.length}
              </span>
            )}
          </div>
          <span className="text-xs font-normal">Saved</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1.5 min-h-[44px] text-maroon-950 active:scale-[0.97] transition-transform duration-150"
          aria-label="Shopping bag"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 text-maroon-900" strokeWidth={1.5} />
            {totals.itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-[4px] bg-maroon-900 text-white text-[11px] font-medium flex items-center justify-center tabular-nums">
                {totals.itemCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-maroon-900">Bag</span>
        </button>

        <button
          onClick={handleConsult}
          className="flex flex-col items-center justify-center gap-1 py-1.5 min-h-[44px] text-obsidian-slate hover:text-obsidian active:scale-[0.97] transition-[transform,color] duration-150"
          aria-label="Direct boutique consultation"
        >
          <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-xs font-normal">Consult</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomBar;
