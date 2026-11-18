import React, { useState } from 'react';
import { Scissors, Check, Sparkles, Ruler, Info } from 'lucide-react';
import { KenzaeProduct } from '../../types/catalog';
import { TailoringSelection, SareeFinishingOption, GarmentSizeOption } from '../../types/cart';
import { formatCurrencyINR } from '../../utils/formatters';

interface TailoringSelectorProps {
  product: KenzaeProduct;
  selection: TailoringSelection;
  onChange: (selection: TailoringSelection) => void;
}

const FLAT_FALL_AND_PICO_FEE = 250;
const CUSTOM_BLOUSE_STITCHING_FEE = 1200;

const STANDARD_SIZES: GarmentSizeOption[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const TailoringSelector: React.FC<TailoringSelectorProps> = ({
  product,
  selection,
  onChange,
}) => {
  const isSaree = product.category === 'Saris';
  const isStitchedSuit = product.category === 'Churidars & Salwar Sets' || product.category === 'Kurthis & Ready-to-Wear';
  const isUnstitchedMaterial = product.category === 'Unstitched Dress Materials';

  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Saree finishing handler
  const handleSareeOption = (option: SareeFinishingOption) => {
    let cost = 0;
    if (option === 'fall_and_pico') {
      cost = FLAT_FALL_AND_PICO_FEE;
    } else if (option === 'custom_blouse_stitching') {
      cost = CUSTOM_BLOUSE_STITCHING_FEE;
    }

    onChange({
      type: 'saree',
      sareeFinishing: option,
      additionalCost: cost,
    });
  };

  // Garment size handler
  const handleSizeOption = (size: GarmentSizeOption) => {
    onChange({
      type: 'stitched_suit',
      selectedSize: size,
      additionalCost: 0,
    });
  };

  if (isSaree) {
    const currentOption = selection.sareeFinishing || 'unstitched';

    return (
      <div className="space-y-3 bg-canvas-subtle/70 rounded-xl p-3.5 border border-canvas-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-maroon-950">
            <Scissors className="w-3.5 h-3.5 text-brass-dark" />
            <span>Finishing & Tailoring</span>
          </div>
          <span className="text-[11px] text-obsidian-muted font-light">Mulanthuruthy Atelier</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Option A: Standard Unstitched */}
          <button
            type="button"
            onClick={() => handleSareeOption('unstitched')}
            className={`text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col justify-between gap-1 active:scale-[0.99] ${
              currentOption === 'unstitched'
                ? 'bg-white border-maroon-900 shadow-xs ring-1 ring-maroon-900/20'
                : 'bg-white/60 hover:bg-white border-canvas-border text-obsidian-slate'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-obsidian">Standard</span>
              {currentOption === 'unstitched' && <Check className="w-3.5 h-3.5 text-maroon-900 shrink-0" />}
            </div>
            <p className="text-[10px] text-obsidian-muted leading-tight">
              Unstitched blouse piece included
            </p>
            <span className="text-[11px] font-semibold text-maroon-950 mt-1">Included</span>
          </button>

          {/* Option B: Fall & Pico (+Flat ₹250) */}
          <button
            type="button"
            onClick={() => handleSareeOption('fall_and_pico')}
            className={`text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col justify-between gap-1 active:scale-[0.99] relative ${
              currentOption === 'fall_and_pico'
                ? 'bg-white border-maroon-900 shadow-xs ring-1 ring-maroon-900/20'
                : 'bg-white/60 hover:bg-white border-canvas-border text-obsidian-slate'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-obsidian">Fall & Pico</span>
              {currentOption === 'fall_and_pico' ? (
                <Check className="w-3.5 h-3.5 text-maroon-900 shrink-0" />
              ) : (
                <span className="text-[9px] uppercase tracking-wider text-brass-dark font-bold bg-brass/10 px-1.5 py-0.5 rounded">
                  Popular
                </span>
              )}
            </div>
            <p className="text-[10px] text-obsidian-muted leading-tight">
              Cotton fall + neat edge edging
            </p>
            <span className="text-[11px] font-semibold text-maroon-950 mt-1">
              +{formatCurrencyINR(FLAT_FALL_AND_PICO_FEE)}
            </span>
          </button>

          {/* Option C: Custom Blouse Stitching */}
          <button
            type="button"
            onClick={() => handleSareeOption('custom_blouse_stitching')}
            className={`text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col justify-between gap-1 active:scale-[0.99] ${
              currentOption === 'custom_blouse_stitching'
                ? 'bg-white border-maroon-900 shadow-xs ring-1 ring-maroon-900/20'
                : 'bg-white/60 hover:bg-white border-canvas-border text-obsidian-slate'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-obsidian">Custom Blouse</span>
              {currentOption === 'custom_blouse_stitching' && (
                <Check className="w-3.5 h-3.5 text-maroon-900 shrink-0" />
              )}
            </div>
            <p className="text-[10px] text-obsidian-muted leading-tight">
              Master tailor bespoke stitch
            </p>
            <span className="text-[11px] font-semibold text-maroon-950 mt-1">
              +{formatCurrencyINR(CUSTOM_BLOUSE_STITCHING_FEE)}
            </span>
          </button>
        </div>

        {currentOption === 'custom_blouse_stitching' && (
          <div className="p-2.5 rounded-lg bg-brass-light/20 border border-brass/30 text-[11px] text-maroon-950 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brass-dark shrink-0 mt-0.5" />
            <p className="leading-snug">
              Our master draper will connect directly over WhatsApp or phone to confirm neck design, padding, and exact measurements before cutting.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (isStitchedSuit) {
    const currentSize = selection.selectedSize || 'M';

    return (
      <div className="space-y-3 bg-canvas-subtle/70 rounded-xl p-3.5 border border-canvas-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-maroon-950">
            <Ruler className="w-3.5 h-3.5 text-brass-dark" />
            <span>Select Ready Size</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSizeGuide(!showSizeGuide)}
            className="text-[11px] text-brass-dark hover:text-maroon-900 flex items-center gap-1 font-medium underline underline-offset-2"
          >
            <Info className="w-3 h-3" />
            <span>Size Chart</span>
          </button>
        </div>

        {/* Size chips */}
        <div className="flex flex-wrap gap-2">
          {STANDARD_SIZES.map((size) => {
            const isSelected = currentSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeOption(size)}
                className={`min-w-10 h-10 px-3 rounded-lg border text-xs font-semibold tracking-wider transition-all flex items-center justify-center active:scale-95 ${
                  isSelected
                    ? 'bg-maroon-900 text-brass-light border-maroon-900 shadow-xs'
                    : 'bg-white hover:bg-maroon-50 text-obsidian border-canvas-border'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>

        {showSizeGuide && (
          <div className="p-3 rounded-lg bg-white border border-canvas-border text-[11px] text-obsidian space-y-2 animate-fadeIn">
            <div className="font-semibold text-maroon-950">Standard Garment Bust Measures:</div>
            <div className="grid grid-cols-3 gap-2 text-obsidian-slate">
              <div>XS: 34"</div>
              <div>S: 36"</div>
              <div>M: 38"</div>
              <div>L: 40"</div>
              <div>XL: 42"</div>
              <div>XXL: 44"</div>
            </div>
            <p className="text-[10px] text-obsidian-muted pt-1 border-t border-canvas-border">
              All churidar sets include 2 inches of inner margin for easy boutique alteration.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (isUnstitchedMaterial) {
    return (
      <div className="p-3 rounded-xl bg-canvas-subtle/70 border border-canvas-border text-xs text-obsidian-slate space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-maroon-950 uppercase tracking-wider text-[11px]">
          <Scissors className="w-3.5 h-3.5 text-brass-dark" />
          <span>Unstitched Artisanal Set</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Includes 2.5m Kurtha Top Fabric, 2.0m Bottom/Salwar Fabric, and 2.25m Designer Handwoven Dupatta. Ready to be tailored by your bespoke tailor or at Kenzae's Mulanthuruthy atelier.
        </p>
      </div>
    );
  }

  return null;
};
