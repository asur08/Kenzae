import React from 'react';
import { MapPin, Phone, MessageCircle, Heart, ExternalLink } from 'lucide-react';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';
import { generateStoreVisitWhatsAppUrl } from '../utils/whatsapp';
import { useCatalog } from '../context/CatalogContext';
import { ProductCategory } from '../types/catalog';

export const Footer: React.FC = () => {
  const { setFilterState } = useCatalog();

  const handleCategoryClick = (category: ProductCategory) => {
    setFilterState((prev) => ({
      ...prev,
      category,
      subCategory: 'All',
    }));
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWhatsAppConsult = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-emerald-950 text-canvas border-t border-gold-500/30 pt-16 pb-12">
      <div className="container mx-auto px-4">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          
          {/* Brand & Story (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-[0.25em] text-gold-300 uppercase">
                KENZAE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
            </div>
            <p className="text-xs uppercase tracking-widest text-gold-200/80 font-medium">
              Designer Boutique • Mulanthuruthy, Kerala
            </p>
            <p className="text-xs text-canvas/70 leading-relaxed max-w-sm font-light">
              Celebrating India's finest handloom traditions. Kenzae curates bespoke Banarasi silks, Kasavu organza, artisanal salwar suits, and unstitched dress materials for celebrations, weddings, and everyday grace.
            </p>
            
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleWhatsAppConsult}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900 hover:bg-emerald-850 text-gold-300 text-xs font-semibold tracking-wider uppercase border border-gold-500/30 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-whatsapp" />
                <span>WhatsApp Boutique</span>
              </button>
            </div>
          </div>

          {/* Quick Category Navigation (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-gold-300">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-canvas/80 font-light">
              <li>
                <button
                  onClick={() => handleCategoryClick('Saris')}
                  className="hover:text-gold-300 transition-colors"
                >
                  Pure Silk & Handwoven Saris
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Churidars & Salwar Sets')}
                  className="hover:text-gold-300 transition-colors"
                >
                  Churidars & Anarkali Suits
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Unstitched Dress Materials')}
                  className="hover:text-gold-300 transition-colors"
                >
                  Unstitched Dress Materials
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Kurthis & Ready-to-Wear')}
                  className="hover:text-gold-300 transition-colors"
                >
                  Festive Kurthis & Tunics
                </button>
              </li>
            </ul>
          </div>

          {/* Store Location & Timings (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-gold-300">
              Boutique Location
            </h4>
            <div className="space-y-2 text-xs text-canvas/80 font-light">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>
                  {KENZAE_STORE_CONFIG.storeName}, Main Road, {KENZAE_STORE_CONFIG.locality}, Ernakulam District, Kerala — {KENZAE_STORE_CONFIG.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{KENZAE_STORE_CONFIG.phoneDisplay}</span>
              </div>
              <p className="text-[11px] text-canvas/60 pt-1">
                {KENZAE_STORE_CONFIG.timings}
              </p>
              <div className="pt-2">
                <a
                  href={KENZAE_STORE_CONFIG.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-gold-300 hover:text-white underline underline-offset-4 font-medium"
                >
                  <span>Open Directions on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-canvas/60 font-light">
          <div>
            © {new Date().getFullYear()} {KENZAE_STORE_CONFIG.storeName}, Mulanthuruthy. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-gold-400 fill-current inline" />
            <span>for Kerala Fashion & Couture</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
