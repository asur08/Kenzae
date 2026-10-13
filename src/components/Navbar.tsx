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
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FAF8F5]/85 border-b border-[#EFECE6] transition-all">
      {/* Top Luxury Announcement Ribbon */}
      <div className="bg-emerald-950 text-brass-light py-1 px-4 text-[11px] tracking-widest uppercase font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brass animate-pulse"></span>
            <span className="hidden sm:inline">Handcrafted Couture & Bespoke Weaves</span>
            <span className="sm:hidden">Kenzae Boutique</span>
            <span className="text-brass/60">•</span>
            <span className="text-white/90">Mulanthuruthy, Ernakulam</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] lowercase tracking-normal">
            <button 
              onClick={handleDirections}
              className="flex items-center gap-1 text-brass-light hover:text-white transition-colors"
            >
              <MapPin className="w-3 h-3 text-brass" />
              <span>Location Pin</span>
            </button>
            <span className="text-brass/40">•</span>
            <button
              onClick={() => setIsManagerOpen(true)}
              className="flex items-center gap-1 text-brass-light/80 hover:text-white transition-colors"
              title="Catalog Manager (Staff CMS Mode)"
            >
              <Settings className="w-3 h-3" />
              <span className="hidden md:inline">Staff Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar with Centered Wordmark */}
      <div className="container mx-auto px-4 py-3.5 flex items-center justify-between relative">
        
        {/* Left Side: Category jump or filter button on mobile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="md:hidden p-2 rounded-full border border-canvas-border text-obsidian hover:bg-canvas-subtle transition-colors"
            aria-label="Open Filter Drawer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={handleDirections}
            className="hidden md:flex items-center gap-1.5 text-xs text-obsidian-slate hover:text-obsidian tracking-wider uppercase transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-brass-dark" />
            <span>Mulanthuruthy Store</span>
          </button>
        </div>

        {/* Centered Luxury Wordmark */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-auto">
          <a href="#" className="group flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-2xl md:text-3xl font-normal tracking-[0.3em] text-obsidian group-hover:text-emerald-950 transition-colors uppercase">
                KENZAE
              </span>
            </div>
            <span className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-obsidian-slate font-medium">
              Mulanthuruthy
            </span>
          </a>
        </div>

        {/* Right Side: Wishlist & Floating Contact */}
        <div className="flex items-center gap-2.5">
          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2.5 rounded-full border border-canvas-border text-obsidian hover:border-brass hover:text-brass-dark transition-all group"
            aria-label="View Saved Shortlist"
          >
            <Heart className="w-4 h-4 text-obsidian group-hover:text-brass-dark transition-colors" />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brass-dark text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* Floating Contact Button */}
          <button
            onClick={handleWhatsAppConsult}
            className="hidden sm:inline-flex items-center gap-2 bg-emerald-900 hover:bg-emerald-850 text-white px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase shadow-sm transition-all border border-brass/30"
          >
            <MessageCircle className="w-3.5 h-3.5 text-whatsapp" />
            <span>Consult Boutique</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
