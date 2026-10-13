import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  Copy, 
  Check, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { formatCurrencyINR } from '../../utils/formatters';
import { generateProductWhatsAppUrl } from '../../utils/whatsapp';
import { KENZAE_STORE_CONFIG } from '../../data/storeConfig';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, isWishlisted, toggleWishlist } = useCatalog();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [customNote, setCustomNote] = useState('');
  const [copiedSku, setCopiedSku] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset active image and note whenever selected product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setCustomNote('');
    setCopiedSku(false);
    setCopiedLink(false);
  }, [selectedProduct]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedProduct]);

  if (!selectedProduct) return null;

  const isSaved = isWishlisted(selectedProduct.id);

  const handleCopySku = () => {
    navigator.clipboard.writeText(selectedProduct.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${selectedProduct.title} | Kenzae Boutique`,
      text: `Check out ${selectedProduct.title} (${selectedProduct.sku}) at Kenzae Boutique, Mulanthuruthy for ${formatCurrencyINR(selectedProduct.price)}.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleWhatsAppReserve = () => {
    const url = generateProductWhatsAppUrl(
      selectedProduct,
      customNote.trim() ? customNote.trim() : undefined
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenDirections = () => {
    window.open(KENZAE_STORE_CONFIG.googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const nextImage = () => {
    if (!selectedProduct.images) return;
    setActiveImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
  };

  const prevImage = () => {
    if (!selectedProduct.images) return;
    setActiveImageIndex((prev) => 
      prev === 0 ? selectedProduct.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      {/* Dark Blur Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={() => setSelectedProduct(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-canvas rounded-2xl shadow-2xl overflow-hidden border border-gold-500/30 z-10 max-h-[92vh] flex flex-col my-auto">
        
        {/* Top Floating Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md transition-all shadow-md"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Left Column: Image Gallery (md:col-span-6) */}
          <div className="md:col-span-6 bg-canvas-subtle p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-canvas-dark">
            
            {/* Primary Main Image Frame */}
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-canvas shadow-inner group">
              <img
                src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                alt={selectedProduct.title}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />

              {/* Prev/Next arrows if multiple images */}
              {selectedProduct.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Featured Badge */}
              {selectedProduct.isFeatured && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-gold-500/40 text-gold-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-gold-400" />
                  <span>Featured Piece</span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {selectedProduct.images.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar py-1">
                {selectedProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-gold-500 scale-105 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Fabric Touch Guarantee Note */}
            <div className="mt-4 p-3 rounded-lg bg-emerald-950/5 border border-emerald-900/10 text-[11px] text-obsidian-muted flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-850 shrink-0" />
              <span>Certified Handloom Silk & Authentic Weaves • Kenzae Assurance</span>
            </div>
          </div>

          {/* Right Column: Product Specs & Actions (md:col-span-6) */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* SKU & Category Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-dark pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySku}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-canvas-muted text-obsidian font-mono text-xs font-medium hover:bg-canvas-dark transition-colors"
                    title="Click to copy SKU"
                  >
                    <span>{selectedProduct.sku}</span>
                    {copiedSku ? (
                      <Check className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Copy className="w-3 h-3 text-obsidian-muted" />
                    )}
                  </button>
                  {copiedSku && (
                    <span className="text-[10px] text-emerald-850 font-semibold">Copied!</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded-full hover:bg-canvas-subtle text-obsidian-muted hover:text-obsidian transition-colors"
                    title="Share item"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {copiedLink && (
                    <span className="text-[10px] text-emerald-850 font-semibold">Link Copied!</span>
                  )}
                  <button
                    onClick={() => toggleWishlist(selectedProduct)}
                    className={`p-1.5 rounded-full transition-colors ${
                      isSaved ? 'text-rose-600' : 'text-obsidian-muted hover:text-obsidian'
                    }`}
                    title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Title & SubCategory */}
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-850 block mb-1">
                  {selectedProduct.category} {selectedProduct.subCategory && `• ${selectedProduct.subCategory}`}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-obsidian leading-snug">
                  {selectedProduct.title}
                </h2>
              </div>

              {/* Price Banner & Stock Badge */}
              <div className="flex items-baseline justify-between p-3.5 rounded-xl bg-canvas-subtle border border-canvas-dark/80">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-obsidian-muted block leading-none">
                    Transparent Catalog Price
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-emerald-950 font-sans">
                    {formatCurrencyINR(selectedProduct.price)}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                    selectedProduct.in_stock
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {selectedProduct.in_stock ? 'In Stock at Boutique' : 'Custom Order'}
                </span>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-obsidian-muted mb-1">
                    Description & Drape
                  </h4>
                  <p className="text-xs sm:text-sm text-obsidian/80 leading-relaxed font-light">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* Fabric & Technical Details */}
              {selectedProduct.fabricDetails && (
                <div className="p-3.5 rounded-xl bg-white border border-canvas-dark space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    Weave & Fabric Specifications
                  </h4>
                  <p className="text-xs text-obsidian/90 font-medium">
                    {selectedProduct.fabricDetails}
                  </p>
                  {selectedProduct.color && (
                    <p className="text-xs text-obsidian-muted">
                      <strong className="text-obsidian">Shade / Palette:</strong> {selectedProduct.color}
                    </p>
                  )}
                </div>
              )}

              {/* Optional Custom Inquiry Message Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-muted mb-1">
                  Add custom note for boutique (optional):
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Inquire about blouse stitching, custom sizes, trial timing..."
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-canvas-dark text-xs text-obsidian placeholder:text-obsidian-muted/60 focus:outline-none focus:border-emerald-800"
                />
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-canvas-dark space-y-2.5">
              {/* Primary 1-Tap WhatsApp Reservation Button */}
              <button
                onClick={handleWhatsAppReserve}
                className="w-full py-3.5 px-6 rounded-full bg-emerald-900 hover:bg-emerald-850 text-gold-300 hover:text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-luxury flex items-center justify-center gap-2 border border-gold-500/40 active:scale-95"
              >
                <MessageCircle className="w-5 h-5 text-whatsapp" />
                <span>Reserve / Inquire via WhatsApp</span>
              </button>

              {/* Store Directions Button */}
              <button
                onClick={handleOpenDirections}
                className="w-full py-2.5 px-4 rounded-full bg-canvas-subtle hover:bg-canvas-muted text-emerald-950 font-medium text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 border border-canvas-dark"
              >
                <MapPin className="w-4 h-4 text-gold-500" />
                <span>Directions to Kenzae (Mulanthuruthy)</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
