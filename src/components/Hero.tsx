import React from 'react';
import { ArrowDown, ArrowUpRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCatalog } from '../context/CatalogContext';
import { useCurrency } from '../context/CurrencyContext';
import { generateStoreVisitWhatsAppUrl } from '../utils/whatsapp';

export const Hero: React.FC = () => {
  const { products, setSelectedProduct } = useCatalog();
  const { formatPrice } = useCurrency();

  const featuredPiece =
    products.find((p) => p.isFeatured && p.in_stock) || products[0];

  const scrollToCatalog = () => {
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWhatsAppVisit = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="relative overflow-hidden maroon-gradient-bg text-canvas min-h-[calc(100svh-65px)] flex items-center py-12 md:py-16 lg:py-20 border-b border-brass/25">
      {/* Subtle Silk Ambient Sheen */}
      <div className="absolute -top-40 right-0 w-[28rem] h-[28rem] rounded-full bg-brass/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-24 w-72 h-72 rounded-full bg-maroon-700/25 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Action Hierarchy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-7 flex flex-col items-start space-y-6 min-w-0"
          >
            {/* Editorial Title */}
            <h1 className="font-serif text-[2.5rem] sm:text-5xl lg:text-[3.85rem] font-light leading-[1.05] tracking-[-0.015em] text-white">
              Handpicked Weaves &amp; <br className="hidden sm:inline" />
              <span className="italic font-normal text-brass-light">
                Bespoke Ensembles.
              </span>
            </h1>

            {/* Concise Value Statement */}
            <p className="text-canvas/85 text-sm md:text-[16px] leading-relaxed max-w-xl font-light">
              Pure handwoven saris, sculpted Anarkali churidars, and unstitched artisanal dress materials—curated with transparent pricing and direct boutique guidance.
            </p>

            {/* Refined Dual CTA Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1 w-full sm:w-auto">
              <button
                onClick={scrollToCatalog}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FAF8F5] hover:bg-brass-light text-maroon-950 font-semibold text-xs tracking-[0.18em] uppercase active:scale-[0.97] transition-[transform,background-color] duration-150 whitespace-nowrap"
              >
                <span>Explore Collection</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleWhatsAppVisit}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-maroon-900/70 hover:bg-maroon-800/90 border border-brass/35 text-brass-light hover:text-white font-medium text-xs tracking-[0.14em] uppercase active:scale-[0.97] transition-[transform,background-color,border-color] duration-150 whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-whatsapp" />
                <span>Book Boutique Trial</span>
              </button>
            </div>

            {/* Trust Strip */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 w-full max-w-xl text-[11px] md:text-xs text-canvas/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brass shrink-0" />
                <span>Silk Mark Handlooms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-brass shrink-0" />
                <span className="tabular-nums">Transparent INR Pricing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-brass shrink-0" />
                <span>Custom Studio Tailoring</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Live Featured Showcase Frame */}
          {featuredPiece && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
              className="lg:col-span-5"
            >
              <div
                onClick={() => setSelectedProduct(featuredPiece)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedProduct(featuredPiece);
                  }
                }}
                className="group relative mx-auto max-w-sm lg:max-w-[400px] rounded-2xl overflow-hidden border border-brass/30 bg-maroon-900/50 p-2 cursor-pointer transition-[transform,border-color] duration-300 hover:border-brass/50 active:scale-[0.99]"
              >
                <div className="aspect-[4/5] rounded-xl overflow-hidden relative bg-maroon-950">
                  <img
                    src={featuredPiece.images[0]}
                    alt={featuredPiece.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/90 via-maroon-950/15 to-transparent" />

                  {/* Bottom Floating Editorial Caption */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 p-3.5 rounded-xl bg-[#FAF8F5]/95 backdrop-blur-md text-obsidian border border-brass/35">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-maroon-900">
                        Featured Piece · {featuredPiece.sku}
                      </span>
                      <span className="text-xs font-bold text-maroon-950 tabular-nums font-sans">
                        {formatPrice(featuredPiece.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="font-serif text-[15px] font-medium text-obsidian truncate">
                        {featuredPiece.title}
                      </p>
                      <ArrowUpRight className="w-4 h-4 text-maroon-900 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
