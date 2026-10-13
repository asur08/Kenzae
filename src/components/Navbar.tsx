import React from 'react';
import { Heart, MapPin, MessageCircle, SlidersHorizontal, Settings } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';
import { generateStoreVisitWhatsAppUrl } from '../utils/whatsapp';

export const Navbar: React.FC = () => {
  const { 
    wishlistIds, 
    setIsWishlistOpen, 
    setIsFilterDrawerOpen, 
    setIsManagerOpen 
  } = useCatalog();

  const handleWhatsAppConsult = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleDirections = () => {
    const section = document.getElementById('store-locator');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open(KENZAE_STORE_CONFIG.googleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-canvas-dark/60 transition-all">
      {/* Top Luxury Announcement Ribbon */}
      <div className="bg-emerald-950 text-gold-300 py-1.5 px-4 text-xs tracking-widest uppercase font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
            <span className="hidden sm:inline">Designer Ethnic Wear & Couture</span>
            <span className="sm:hidden">Kenzae Boutique</span>
            <span className="text-gold-500/60">•</span>
            <span className="text-gold-200">Mulanthuruthy, Kerala</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] lowercase tracking-normal">
            <button 
              onClick={handleDirections}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <MapPin className="w-3 h-3 text-gold-400" />
              <span>Directions</span>
            </button>
            <span className="text-gold-500/60">•</span>
            <button
              onClick={() => setIsManagerOpen(true)}
              className="flex items-center gap-1 hover:text-white transition-colors text-gold-300/80"
              title="Catalog Manager (Staff CMS Mode)"
            >
              <Settings className="w-3 h-3" />
              <span className="hidden md:inline">Staff Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
        {/* Brand Emblem & Typography */}
        <div className="flex items-center gap-3">
          <a href="#" className="group flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-[0.25em] text-emerald-950 group-hover:text-emerald-850 transition-colors uppercase">
                KENZAE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 self-center mb-1"></span>
            </div>
            <span className="text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-obsidian-muted font-medium">
              Boutique • Mulanthuruthy
            </span>
          </a>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="md:hidden p-2 rounded-full border border-canvas-dark text-emerald-950 hover:bg-canvas-subtle transition-colors"
            aria-label="Open Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2.5 rounded-full border border-canvas-dark text-emerald-950 hover:border-gold-500 hover:text-gold-600 transition-all group"
            aria-label="View Saved Shortlist"
          >
            <Heart className="w-5 h-5 text-emerald-950 group-hover:text-gold-600 transition-colors" />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold-500 text-emerald-950 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* Quick WhatsApp Inquiry Button */}
          <button
            onClick={handleWhatsAppConsult}
            className="hidden sm:flex items-center gap-2 bg-emerald-900 hover:bg-emerald-850 text-gold-300 hover:text-white px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase shadow-sm transition-all border border-gold-500/30"
          >
            <MessageCircle className="w-4 h-4 text-whatsapp" />
            <span>Consult Boutique</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
