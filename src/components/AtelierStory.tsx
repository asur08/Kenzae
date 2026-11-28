import React from 'react';
import { ShieldCheck, Scissors, ZoomIn, MessageCircle } from 'lucide-react';
import { generateStoreVisitWhatsAppUrl } from '../utils/whatsapp';

export const AtelierStory: React.FC = () => {
  const handleConsult = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="atelier-story"
      className="bg-white border-b border-canvas-border"
    >
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Handloom & Drape Photography Cell */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="aspect-[4/5] w-full overflow-hidden bg-canvas-subtle">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
              alt="Master handloom weaver crafting Banarasi Katan silk with gold zari"
              loading="lazy"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="p-5 sm:p-6 border-t border-canvas-border bg-canvas">
            <p className="text-xs font-medium text-brass-dark">
              Atelier heritage · Mulanthuruthy
            </p>
            <p className="font-serif text-[18px] text-obsidian mt-1 leading-snug">
              Hand-inspected zari warp, Silk Mark certification, and bespoke drape tailoring
            </p>
          </div>
        </div>

        {/* Right Column: Narrative Craftsmanship & Tailoring Standards */}
        <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-canvas-border flex flex-col justify-between">
          <div className="p-6 sm:p-10 lg:p-12 border-b border-canvas-border space-y-3">
            <h2 className="font-serif text-[32px] sm:text-[40px] font-normal text-obsidian leading-[1.12]">
              Crafted around your occasion
            </h2>
            <p className="text-[15px] text-obsidian-slate leading-[1.6] max-w-xl">
              Every sari, salwar set, and unstitched fabric at Kenzae is curated with verified silk provenance, bespoke fitting, and personal stylist consultation before it reaches your hands.
            </p>
          </div>

          <div className="divide-y divide-canvas-border flex-1">
            <div className="p-6 sm:px-10 lg:px-12 flex items-start gap-4">
              <ShieldCheck className="w-4 h-4 text-obsidian-muted shrink-0 mt-1" strokeWidth={1.5} />
              <div className="space-y-1">
                <h3 className="font-serif text-[20px] font-normal text-obsidian">
                  Authenticated handlooms &amp; Silk Mark provenance
                </h3>
                <p className="text-[14px] text-obsidian-slate leading-relaxed">
                  Every Banarasi Katan, Kerala Kasavu, and Kanjivaram Korvai piece is sourced directly from verified artisan clusters with authentic zari testing.
                </p>
              </div>
            </div>

            <div className="p-6 sm:px-10 lg:px-12 flex items-start gap-4">
              <Scissors className="w-4 h-4 text-obsidian-muted shrink-0 mt-1" strokeWidth={1.5} />
              <div className="space-y-1">
                <h3 className="font-serif text-[20px] font-normal text-obsidian">
                  Bespoke in-house studio tailoring
                </h3>
                <p className="text-[14px] text-obsidian-slate leading-relaxed">
                  Personalized blouse styling, breathable mulmul lining attachment, and handcrafted fall-pico edging tailored to your measurements.
                </p>
              </div>
            </div>

            <div className="p-6 sm:px-10 lg:px-12 flex items-start gap-4">
              <ZoomIn className="w-4 h-4 text-obsidian-muted shrink-0 mt-1" strokeWidth={1.5} />
              <div className="space-y-1">
                <h3 className="font-serif text-[20px] font-normal text-obsidian">
                  High-resolution fabric zoom &amp; drape videos
                </h3>
                <p className="text-[14px] text-obsidian-slate leading-relaxed">
                  Inspect silk slubs, zari borders, and drape fluidity up close before placing an order or booking a boutique trial.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:px-12 border-t border-canvas-border bg-canvas">
            <button
              onClick={handleConsult}
              className="inline-flex items-center gap-2 px-6 h-11 rounded-[8px] bg-maroon-900 hover:bg-maroon-850 text-white font-medium text-[14px] active:scale-[0.98] transition-[transform,background-color] duration-150"
            >
              <MessageCircle className="w-4 h-4 text-white/85" strokeWidth={1.5} />
              <span>Consult master draper on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AtelierStory;
