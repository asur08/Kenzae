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
    <section className="bg-maroon-950 text-white border-b border-white/10">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Editorial Headline & Action Hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-16 min-w-0"
        >
          <div className="my-auto py-4 lg:py-8 space-y-6">
            <h1 className="font-serif text-[40px] sm:text-[56px] lg:text-[64px] font-normal leading-[1.04] tracking-[-0.025em] text-[#FAF8F5]">
              Handpicked weaves &amp; bespoke ensembles
            </h1>

            <p className="text-white/80 text-[16px] sm:text-[18px] leading-[1.6] max-w-[34rem] font-normal">
              Pure handwoven saris, sculpted Anarkali churidars, and unstitched artisanal dress materials with transparent pricing and direct boutique guidance.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={scrollToCatalog}
                className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-[8px] bg-[#FAF8F5] hover:bg-white text-maroon-950 font-medium text-[14px] active:scale-[0.98] transition-[transform,background-color] duration-150 whitespace-nowrap"
              >
                <span>Explore collection</span>
                <ArrowDown className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <button
                onClick={handleWhatsAppVisit}
                className="inline-flex items-center justify-center gap-2 px-6 h-12 rounded-[8px] bg-transparent hover:bg-white/10 border border-white/25 text-white font-medium text-[14px] active:scale-[0.98] transition-[transform,background-color] duration-150 whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-white/85" strokeWidth={1.5} />
                <span>Book boutique trial</span>
              </button>
            </div>
          </div>

          {/* Architectural Trust Strip */}
          <div className="pt-6 mt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px] text-white/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brass-light shrink-0" strokeWidth={1.5} />
              <span>Silk Mark handlooms</span>
            </div>
            <div className="tabular-nums">Transparent INR pricing</div>
            <div>Custom studio tailoring</div>
          </div>
        </motion.div>

        {/* Right Column: Featured Showcase Grid Cell */}
        {featuredPiece && (
          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col">
            <button
              type="button"
              onClick={() => setSelectedProduct(featuredPiece)}
              className="group text-left flex-1 flex flex-col bg-maroon-900/40 hover:bg-maroon-900/65 transition-colors duration-150 w-full"
            >
              <div className="aspect-[4/5] w-full overflow-hidden bg-maroon-900">
                <img
                  src={featuredPiece.images[0]}
                  alt={featuredPiece.title}
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                />
              </div>

              <div className="p-5 sm:p-6 border-t border-white/10 flex items-center justify-between gap-4 w-full">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-3 text-xs text-white/75 tabular-nums">
                    <span>Featured</span>
                    <span>{featuredPiece.sku}</span>
                  </div>
                  <p className="font-serif text-[20px] font-normal text-[#FAF8F5] truncate leading-snug">
                    {featuredPiece.title}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[15px] font-medium text-[#FAF8F5] tabular-nums">
                    {formatPrice(featuredPiece.price)}
                  </span>
                  <ArrowUpRight
                    className="w-4 h-4 text-white/75 group-hover:text-white transition-colors duration-150"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
