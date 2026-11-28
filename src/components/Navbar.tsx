import React, { useState, useEffect } from 'react';
import { Heart, MapPin, MessageCircle, Menu, X, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';
import { CurrencySwitcher } from './CurrencySwitcher';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';
import { generateStoreVisitWhatsAppUrl } from '../utils/whatsapp';
import { ProductCategory } from '../types/catalog';

const QUICK_CATEGORIES: { label: string; value: ProductCategory | 'All' }[] = [
  { label: 'All collections', value: 'All' },
  { label: 'Saris', value: 'Saris' },
  { label: 'Churidars & salwar sets', value: 'Churidars & Salwar Sets' },
  { label: 'Dress materials', value: 'Unstitched Dress Materials' },
  { label: 'Kurthis', value: 'Kurthis & Ready-to-Wear' },
];

export const Navbar: React.FC = () => {
  const {
    wishlistIds,
    setIsWishlistOpen,
    setIsFilterDrawerOpen,
    setFilterState,
  } = useCatalog();
  const { totals, setIsCartOpen } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleWhatsAppConsult = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'store-locator') {
      window.open(KENZAE_STORE_CONFIG.googleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleQuickCategory = (category: ProductCategory | 'All') => {
    setFilterState((prev) => ({ ...prev, category, subCategory: 'All' }));
    scrollToSection('catalog-section');
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-canvas-border transition-colors duration-150 ${
        isScrolled ? 'bg-canvas' : 'bg-canvas'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative min-w-0">
        {/* Left: Mobile Menu Trigger & Desktop Links */}
        <div className="flex items-center gap-6 min-w-0">
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-[8px] border border-canvas-border bg-white text-obsidian hover:bg-canvas-subtle active:scale-[0.98] transition-[transform,background-color] duration-150"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-obsidian-slate" strokeWidth={1.5} />
            ) : (
              <Menu className="w-4 h-4 text-obsidian-slate" strokeWidth={1.5} />
            )}
          </button>

          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-6 text-[14px] font-normal text-obsidian-slate"
          >
            <button
              onClick={() => scrollToSection('catalog-section')}
              className="py-2 hover:text-obsidian transition-colors duration-150"
            >
              Collections
            </button>
            <button
              onClick={() => scrollToSection('atelier-story')}
              className="py-2 hover:text-obsidian transition-colors duration-150"
            >
              Craft
            </button>
            <button
              onClick={() => scrollToSection('store-locator')}
              className="py-2 hover:text-obsidian transition-colors duration-150"
            >
              Boutique
            </button>
          </nav>
        </div>

        {/* Center: Architectural Wordmark */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <a href="#" className="inline-flex items-center gap-2 py-1">
            <span className="font-serif text-[26px] sm:text-[28px] font-medium tracking-[0.04em] text-maroon-950 leading-none">
              Kenzae
            </span>
          </a>
        </div>

        {/* Right: Utility Controls & Primary Consult Action */}
        <div className="flex items-center gap-2 shrink-0">
          <CurrencySwitcher />

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-[8px] border border-canvas-border bg-white text-obsidian-slate hover:bg-canvas-subtle hover:text-obsidian active:scale-[0.98] transition-[transform,background-color,color] duration-150"
            aria-label="Open collection filters"
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative h-10 min-w-[40px] px-2.5 flex items-center justify-center gap-1.5 rounded-[8px] border border-canvas-border bg-white text-obsidian-slate hover:bg-canvas-subtle hover:text-obsidian active:scale-[0.98] transition-[transform,background-color,color] duration-150"
            aria-label="View saved shortlist"
          >
            <Heart className="w-4 h-4" strokeWidth={1.5} />
            {wishlistIds.length > 0 && (
              <span className="text-xs font-medium text-maroon-950 tabular-nums">
                {wishlistIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative h-10 min-w-[40px] px-2.5 flex items-center justify-center gap-1.5 rounded-[8px] border border-canvas-border bg-white text-obsidian-slate hover:bg-canvas-subtle hover:text-obsidian active:scale-[0.98] transition-[transform,background-color,color] duration-150"
            aria-label="View shopping bag"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
            {totals.itemCount > 0 && (
              <span className="text-xs font-medium text-maroon-950 tabular-nums">
                {totals.itemCount}
              </span>
            )}
          </button>

          <button
            onClick={handleWhatsAppConsult}
            className="hidden sm:inline-flex items-center gap-2 bg-maroon-900 hover:bg-maroon-850 text-white px-4 h-9 rounded-[8px] text-[13px] font-medium active:scale-[0.98] transition-[transform,background-color] duration-150"
          >
            <MessageCircle className="w-4 h-4 text-white/85" strokeWidth={1.5} />
            <span>Consult</span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Navigation Sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden border-t border-canvas-border bg-canvas"
          >
            <div className="px-4 py-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {QUICK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleQuickCategory(cat.value)}
                    className="px-3 py-2 rounded-[8px] bg-white border border-canvas-border text-[13px] font-normal text-obsidian hover:bg-canvas-subtle transition-colors duration-150"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-canvas-border flex items-center justify-between text-[13px] font-normal text-obsidian-slate">
                <button
                  onClick={() => scrollToSection('atelier-story')}
                  className="py-1.5 hover:text-obsidian"
                >
                  Craft &amp; tailoring
                </button>
                <button
                  onClick={() => scrollToSection('store-locator')}
                  className="py-1.5 hover:text-obsidian flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4 text-obsidian-muted" strokeWidth={1.5} />
                  <span>Directions</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleWhatsAppConsult();
                  }}
                  className="py-1.5 text-maroon-900 font-medium flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
