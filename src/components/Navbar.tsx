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
  { label: 'All Collections', value: 'All' },
  { label: 'Saris', value: 'Saris' },
  { label: 'Churidars & Salwar Sets', value: 'Churidars & Salwar Sets' },
  { label: 'Dress Materials', value: 'Unstitched Dress Materials' },
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
    const onScroll = () => setIsScrolled(window.scrollY > 12);
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
      className={`sticky top-0 z-40 backdrop-blur-md transition-all duration-300 w-full ${
        isScrolled
          ? 'bg-[#FAF8F5]/95 border-b border-maroon-900/15 shadow-sm'
          : 'bg-[#FAF8F5]/85 border-b border-[#EAE3D7]'
      }`}
    >
      {/* Top Couture Announcement Strip */}
      <div className="bg-maroon-950 text-brass-light py-1.5 px-4 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase font-medium">
        <div className="container mx-auto flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brass shrink-0" />
            <span className="truncate">Handcrafted Couture &amp; Bespoke Weaves</span>
            <span className="hidden md:inline text-brass/50">·</span>
            <span className="hidden md:inline text-white/85">Personal Styling &amp; Trials</span>
          </div>

          <button
            onClick={() => scrollToSection('store-locator')}
            className="flex items-center gap-1 text-brass-light hover:text-white transition-colors shrink-0 tracking-[0.14em]"
            title="Store Directions & Hours"
          >
            <MapPin className="w-3 h-3 text-brass" />
            <span>Visit Store</span>
          </button>
        </div>
      </div>

      {/* Main Architectural Navigation Row */}
      <div className="container mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between relative min-w-0">
        {/* Left: Mobile Menu / Desktop Navigation */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 -ml-1 rounded-full border border-canvas-border bg-white/80 text-maroon-950 hover:bg-white transition-colors"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-medium tracking-[0.16em] uppercase text-obsidian-slate">
            <button
              onClick={() => scrollToSection('catalog-section')}
              className="hover:text-maroon-900 transition-colors"
            >
              Collections
            </button>
            <button
              onClick={() => scrollToSection('atelier-story')}
              className="hover:text-maroon-900 transition-colors"
            >
              Our Craft
            </button>
            <button
              onClick={() => scrollToSection('store-locator')}
              className="hover:text-maroon-900 transition-colors"
            >
              Boutique
            </button>
          </nav>
        </div>

        {/* Center: Luxury Brand Wordmark */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <a href="#" className="group flex flex-col items-center leading-none">
            <span className="font-serif text-[22px] sm:text-[26px] md:text-[30px] font-normal tracking-[0.28em] text-maroon-950 group-hover:text-maroon-800 transition-colors uppercase pl-[0.28em]">
              KENZAE
            </span>
            <span className="text-[8px] sm:text-[9px] tracking-[0.38em] uppercase text-obsidian-slate font-medium mt-0.5 pl-[0.38em]">
              Designer Boutique
            </span>
          </a>
        </div>

        {/* Right: Currency + Filter (mobile) + Shortlist + Bag + Consult Concierge */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <CurrencySwitcher />

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="md:hidden p-2 rounded-full border border-canvas-border bg-white/80 text-maroon-950 hover:bg-white transition-colors"
            aria-label="Open Collection Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2 sm:p-2.5 rounded-full border border-canvas-border bg-white/80 text-obsidian hover:border-maroon-900/30 hover:text-maroon-900 transition-all group"
            aria-label="View Saved Shortlist"
          >
            <Heart className="w-4 h-4 transition-colors" />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-maroon-900 text-brass-light text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm tabular-nums">
                {wishlistIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 sm:p-2.5 rounded-full border border-canvas-border bg-white/80 text-obsidian hover:border-maroon-900/30 hover:text-maroon-900 transition-all group"
            aria-label="View Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4 transition-colors" />
            {totals.itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-maroon-900 text-brass-light text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm tabular-nums">
                {totals.itemCount}
              </span>
            )}
          </button>

          <button
            onClick={handleWhatsAppConsult}
            className="hidden sm:inline-flex items-center gap-2 bg-maroon-900 hover:bg-maroon-850 text-brass-light hover:text-white px-4 py-2 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase shadow-sm transition-all border border-brass/30"
          >
            <MessageCircle className="w-3.5 h-3.5 text-whatsapp" />
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
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="lg:hidden overflow-hidden border-t border-canvas-border bg-[#FAF8F5]"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleQuickCategory(cat.value)}
                    className="px-3 py-1.5 rounded-full bg-white border border-canvas-border text-xs font-medium text-obsidian hover:border-maroon-900/40 hover:text-maroon-900 transition-colors"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-canvas-border flex items-center justify-between text-xs font-medium text-obsidian-slate">
                <button
                  onClick={() => scrollToSection('atelier-story')}
                  className="py-1 hover:text-maroon-900"
                >
                  Our Craft &amp; Tailoring
                </button>
                <button
                  onClick={() => scrollToSection('store-locator')}
                  className="py-1 hover:text-maroon-900 flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-brass-dark" />
                  <span>Directions</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleWhatsAppConsult();
                  }}
                  className="py-1 text-maroon-900 font-semibold flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-whatsapp" />
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
