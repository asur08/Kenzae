import React from 'react';
import { ArrowDown, MapPin, Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';
import { KENZAE_STORE_CONFIG } from '../../data/storeConfig';
import { generateStoreVisitWhatsAppUrl } from '../../utils/whatsapp';

export const HeroBanner: React.FC = () => {
  const scrollToCatalog = () => {
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenMaps = () => {
    window.open(KENZAE_STORE_CONFIG.googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppVisit = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="relative overflow-hidden bg-emerald-950 text-canvas py-12 md:py-20 border-b border-gold-500/20">
      {/* Decorative Gold & Subtle Fabric Texture Gradients */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-800/20 blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Message & Editorial Story */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-5">
            {/* Location & Heritage Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/90 border border-gold-500/30 text-gold-300 text-xs tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Mulanthuruthy Designer Collection • Kerala</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.15] text-white">
              Couture Crafted for <br className="hidden sm:inline" />
              <span className="italic font-light gold-gradient-text">Timeless Grace.</span>
            </h1>

            {/* Description */}
            <p className="text-canvas/80 text-sm md:text-base leading-relaxed max-w-xl font-light">
              Welcome to <strong className="font-medium text-white">Kenzae Boutique</strong>. Explore our curated digital catalog of pure Banarasi Katan silks, handloom Kasavu organza, artisanal salwar sets, and unstitched dress materials — with transparent pricing and instant WhatsApp reservations.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
              <button
                onClick={scrollToCatalog}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full gold-gradient-bg text-emerald-950 font-semibold text-xs tracking-widest uppercase hover:brightness-105 active:scale-95 transition-all shadow-luxury"
              >
                <span>Browse Catalog</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsAppVisit}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-emerald-900 hover:bg-emerald-850 border border-gold-500/40 text-gold-300 hover:text-white font-medium text-xs tracking-wider uppercase transition-all"
              >
                <MessageCircle className="w-4 h-4 text-whatsapp" />
                <span>Book Boutique Trial</span>
              </button>

              <button
                onClick={handleOpenMaps}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-full bg-transparent hover:bg-white/5 text-canvas/70 hover:text-white text-xs tracking-wider uppercase transition-all"
              >
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>Find Us</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/10 w-full max-w-lg text-[11px] md:text-xs text-canvas/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Authentic Handloom & Silks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0"></span>
                <span>Transparent Pricing (₹)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0"></span>
                <span>1-Tap WhatsApp Booking</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              {/* Outer frame styling */}
              <div className="relative rounded-2xl overflow-hidden border border-gold-500/30 shadow-2xl bg-emerald-900/40 p-2">
                <div className="aspect-[4/5] rounded-xl overflow-hidden relative group">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
                    alt="Kenzae Royal Silk Sari Collection"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent"></div>
                  
                  {/* Floating Card Detail */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-canvas/95 backdrop-blur-md text-obsidian border border-gold-500/40 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] tracking-widest uppercase font-semibold text-emerald-850">
                        Featured Festive Arrival
                      </span>
                      <span className="text-xs font-bold text-emerald-950">
                        ₹12,850
                      </span>
                    </div>
                    <p className="font-serif text-sm font-semibold text-obsidian mt-1 truncate">
                      Royal Katan Banarasi Silk Sari
                    </p>
                    <p className="text-[11px] text-obsidian-muted mt-0.5">
                      Handwoven Kadwa Zari • Mulanthuruthy Store Exclusive
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Stamp Tag */}
              <div className="hidden sm:block absolute -top-4 -right-4 bg-gold-500 text-emerald-950 p-3 rounded-full shadow-gold-glow rotate-12 text-center text-[10px] font-bold tracking-tighter uppercase leading-none">
                Kerala<br />Couture
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
