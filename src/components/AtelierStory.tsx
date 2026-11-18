import React from 'react';
import { ShieldCheck, Scissors, Sparkles } from 'lucide-react';

const ATELIER_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Authenticated Handlooms',
    description:
      'Every Banarasi Katan, Kasavu, and Kanjivaram piece is handpicked directly from heritage weavers with verified Silk Mark and zari provenance.',
  },
  {
    icon: Scissors,
    title: 'In-House Studio Tailoring',
    description:
      'Custom blouse designing, breathable mulmul lining attachment, and traditional fall-pico edging tailored to your exact measurements.',
  },
  {
    icon: Sparkles,
    title: 'Studio Drape & Weave Loupe',
    description:
      'Inspect how each weave drapes on a model alongside close-up flat-lay photographs with interactive fabric zoom—zero wait, crisp clarity.',
  },
];

export const AtelierStory: React.FC = () => {
  return (
    <section
      id="atelier-story"
      className="py-14 sm:py-16 bg-white border-t border-canvas-border"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-10 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-brass-dark block">
            The Kenzae Standard
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-maroon-950">
            Crafted Around Your Occasion
          </h2>
          <p className="text-xs sm:text-sm text-obsidian-slate font-light leading-relaxed">
            No generic carts or guesswork—every inquiry connects directly with our stylists for personal sizing, weave details, and custom finishing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {ATELIER_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl bg-[#FAF8F5] border border-canvas-border hover:border-maroon-900/20 transition-colors space-y-3"
              >
                <div className="w-10 h-10 rounded-full bg-maroon-900 text-brass-light flex items-center justify-center shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-xl font-medium text-obsidian">
                  {pillar.title}
                </h3>
                <p className="text-xs text-obsidian-slate leading-relaxed font-light">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AtelierStory;
