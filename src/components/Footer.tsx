import React from 'react';
import { MapPin, Phone, MessageCircle, ExternalLink } from 'lucide-react';
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
    <footer className="bg-maroon-950 text-white border-t border-white/10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          {/* Brand & Story */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="font-serif text-[28px] font-medium tracking-[0.04em] text-[#FAF8F5]">
                Kenzae
              </span>
              <p className="text-[13px] text-white/70 mt-1">
                Designer ethnic wear &amp; couture
              </p>
            </div>
            <p className="text-[14px] text-white/75 leading-relaxed max-w-sm">
              Curating bespoke Banarasi silks, Kasavu organza, artisanal salwar suits, and unstitched dress materials in Mulanthuruthy, Kerala.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleWhatsAppConsult}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-[8px] bg-[#FAF8F5] hover:bg-white text-maroon-950 text-[13px] font-medium transition-colors duration-150"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                <span>WhatsApp boutique</span>
              </button>
              <a
                href="https://instagram.com/kenzae.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 h-10 rounded-[8px] bg-transparent hover:bg-white/10 text-white text-[13px] font-medium border border-white/20 transition-colors duration-150"
              >
                <span>{KENZAE_STORE_CONFIG.instagramHandle}</span>
                <ExternalLink className="w-4 h-4 text-white/75" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-[18px] font-normal text-[#FAF8F5]">
              Collections
            </h4>
            <ul className="space-y-2.5 text-[14px] text-white/75">
              <li>
                <button
                  onClick={() => handleCategoryClick('Saris')}
                  className="hover:text-white transition-colors duration-150 text-left"
                >
                  Pure silk &amp; handwoven saris
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Churidars & Salwar Sets')}
                  className="hover:text-white transition-colors duration-150 text-left"
                >
                  Churidars &amp; Anarkali suits
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Unstitched Dress Materials')}
                  className="hover:text-white transition-colors duration-150 text-left"
                >
                  Unstitched dress materials
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Kurthis & Ready-to-Wear')}
                  className="hover:text-white transition-colors duration-150 text-left"
                >
                  Festive kurthis &amp; tunics
                </button>
              </li>
            </ul>
          </div>

          {/* Boutique Location */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif text-[18px] font-normal text-[#FAF8F5]">
              Boutique location
            </h4>
            <div className="space-y-2.5 text-[14px] text-white/75">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-white/60 shrink-0 mt-1" strokeWidth={1.5} />
                <span>
                  {KENZAE_STORE_CONFIG.storeName}, Main Road, {KENZAE_STORE_CONFIG.locality}, Ernakulam District, Kerala — {KENZAE_STORE_CONFIG.pincode}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-white/60 shrink-0" strokeWidth={1.5} />
                <span className="tabular-nums">{KENZAE_STORE_CONFIG.phoneDisplay}</span>
              </div>
              <p className="text-[13px] text-white/60 pt-0.5">
                {KENZAE_STORE_CONFIG.timings}
              </p>
              <div className="pt-1">
                <a
                  href={KENZAE_STORE_CONFIG.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] text-white hover:text-white/80 underline underline-offset-4 font-medium"
                >
                  <span>Open directions on Google Maps</span>
                  <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-white/70">
          <div>
            © {new Date().getFullYear()} {KENZAE_STORE_CONFIG.storeName}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/staff"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/staff');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="text-white/75 hover:text-white transition-colors duration-150 underline underline-offset-4"
              title="Kenzae Staff Portal"
            >
              Staff access
            </a>
            <span className="text-white/30">·</span>
            <span>Mulanthuruthy, Kerala</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
