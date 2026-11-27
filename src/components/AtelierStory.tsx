import React from 'react';
import { ShieldCheck, Scissors, Sparkles, MessageCircle } from 'lucide-react';
import { generateStoreVisitWhatsAppUrl } from '../utils/whatsapp';

export const AtelierStory: React.FC = () => {
  const handleConsult = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="atelier-story"
      className="py-16 sm:py-20 bg-white border-t border-canvas-line"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Authentic Handloom & Drape Photography Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-canvas-line bg-canvas">
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
                alt="Master handloom weaver crafting Banarasi Katan silk with gold zari"
                loading="lazy"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/80 via-transparent to-transparent" />

              {/* Architectural Label Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-canvas/95 backdrop-blur-md border border-brass/35">
                <span className="text-[10px] font-semibold text-maroon-900 block">
                  Atelier heritage, Mulanthuruthy
                </span>
                <p className="font-serif text-sm text-obsidian mt-0.5">
                  Hand-inspected zari warp, authentic Silk Mark certification &amp; bespoke drape tailoring.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Craftsmanship & Tailoring Standards */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal text-maroon-950 leading-[1.12]">
                Crafted Around Your Occasion
              </h2>
              <p className="text-sm md:text-[15px] text-obsidian-slate font-light leading-relaxed mt-3 max-w-xl">
                Never mass-produced: every piece is curated for verified silk, fitted to you and styled with you.
              </p>
            </div>

            {/* Three Structured Craft Pillars */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-canvas border border-canvas-line/80">
                <div className="w-10 h-10 rounded-full bg-maroon-950 text-brass-light flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-brass" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-medium text-obsidian">
                    Authenticated Handlooms &amp; Silk Mark Provenance
                  </h3>
                  <p className="text-xs text-obsidian-slate font-light leading-relaxed mt-1">
                    Sourced directly from verified artisan clusters, with zari tested for authenticity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-canvas border border-canvas-line/80">
                <div className="w-10 h-10 rounded-full bg-maroon-950 text-brass-light flex items-center justify-center shrink-0 mt-0.5">
                  <Scissors className="w-4 h-4 text-brass" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-medium text-obsidian">
                    Bespoke In-House Studio Tailoring
                  </h3>
                  <p className="text-xs text-obsidian-slate font-light leading-relaxed mt-1">
                    Blouse styling, mulmul lining and fall-pico edging, made to your measurements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-canvas border border-canvas-line/80">
                <div className="w-10 h-10 rounded-full bg-maroon-950 text-brass-light flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-brass" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-medium text-obsidian">
                    240% Ultra-HD Fabric Loupe &amp; Motion Drapes
                  </h3>
                  <p className="text-xs text-obsidian-slate font-light leading-relaxed mt-1">
                    Zoom into silk slubs and zari borders, and watch the drape move, before you order.
                  </p>
                </div>
              </div>
            </div>

            {/* Concierge Call to Action */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleConsult}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-maroon-900 hover:bg-maroon-850 text-brass-light hover:text-white font-semibold text-xs active:scale-[0.97] transition-[transform,background-color] duration-150 border border-brass/30"
              >
                <MessageCircle className="w-4 h-4 text-whatsapp" />
                <span>Consult Master Draper on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AtelierStory;
