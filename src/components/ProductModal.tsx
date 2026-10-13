import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  Copy, 
  Check, 
  MapPin, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Video,
  Scissors
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { formatCurrencyINR } from '../utils/formatters';
import { generateProductWhatsAppUrl, generateFabricVideoWhatsAppUrl } from '../utils/whatsapp';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';
import { FabricBadge } from './FabricBadge';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, isWishlisted, toggleWishlist } = useCatalog();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [customNote, setCustomNote] = useState('');
  const [copiedSku, setCopiedSku] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProduct]);

  // Reset state and trap focus on modal open
  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIndex(0);
      setCustomNote('');
      setCopiedSku(false);
      setCopiedLink(false);
      setIsZoomed(false);

      // Focus close button on open
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [selectedProduct]);

  // Handle ESC key and focus trapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProduct) return;

      if (e.key === 'Escape') {
        setSelectedProduct(null);
      }

      // Trap focus inside modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct, setSelectedProduct]);

  if (!selectedProduct) return null;

  const isSaved = isWishlisted(selectedProduct.id);

  const handleCopySku = () => {
    navigator.clipboard.writeText(selectedProduct.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/?item=${encodeURIComponent(selectedProduct.sku)}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?item=${encodeURIComponent(selectedProduct.sku)}`;
    const shareData = {
      title: `${selectedProduct.title} | Kenzae Boutique`,
      text: `Inquire about ${selectedProduct.title} (${selectedProduct.sku}) at Kenzae Boutique, Mulanthuruthy for ${formatCurrencyINR(selectedProduct.price)}.`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppReserve = () => {
    if (!selectedProduct.in_stock) return;
    const url = generateProductWhatsAppUrl(
      selectedProduct,
      customNote.trim() ? customNote.trim() : undefined
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleRequestVideo = () => {
    const url = generateFabricVideoWhatsAppUrl(selectedProduct);
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

  const isUnstitched = selectedProduct.category === 'Unstitched Dress Materials';
  const careInstructions = selectedProduct.category === 'Saris' 
    ? 'Dry clean only. Store folded in soft muslin cloth.'
    : 'Gentle hand wash in cold water with mild detergent or dry clean.';

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      {/* Dark Blur Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={() => setSelectedProduct(null)}
      />

      {/* Modal Dialog with Focus Trap Reference */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-4xl bg-canvas-surface rounded-2xl shadow-2xl overflow-hidden border border-brass/40 z-10 max-h-[92vh] flex flex-col my-auto"
      >
        {/* Top Floating Close Button */}
        <button
          ref={closeButtonRef}
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md transition-all shadow-md active:scale-95"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Left Column: Image Carousel with Drape Zoom (md:col-span-6) */}
          <div className="md:col-span-6 bg-canvas-subtle p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-canvas-border">
            
            {/* Primary Main Image Frame */}
            <div 
              className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-white shadow-inner group cursor-zoom-in"
              onClick={() => setIsZoomed(!isZoomed)}
              title="Click to toggle fabric weave zoom"
            >
              <img
                src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                alt={selectedProduct.title}
                onError={(e) => {
                  // Fallback to primary image if thumbnail fails
                  (e.target as HTMLImageElement).src = selectedProduct.images[0];
                }}
                className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out ${
                  isZoomed ? 'scale-150' : 'group-hover:scale-105'
                }`}
              />

              {/* Zoom Indicator Pill */}
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1 pointer-events-none">
                <ZoomIn className="w-3 h-3" />
                <span>{isZoomed ? 'Zoomed 1.5x' : 'Click to Inspect Drape'}</span>
              </div>

              {/* Prev/Next arrows if multiple images */}
              {selectedProduct.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                {selectedProduct.isFeatured && (
                  <div className="px-2.5 py-1 rounded-full bg-emerald-950/90 border border-brass/40 text-brass-light text-xs font-semibold tracking-wider uppercase backdrop-blur-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brass" />
                    <span>Featured Piece</span>
                  </div>
                )}
                {selectedProduct.subCategory && (
                  <FabricBadge label={selectedProduct.subCategory} variant="emerald" />
                )}
              </div>
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
                        ? 'border-brass scale-105 shadow-md'
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

            {/* Tailoring & Assurance Note */}
            <div className="mt-4 p-3 rounded-lg bg-emerald-950/5 border border-emerald-900/10 text-[11px] text-obsidian-slate space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-emerald-950">
                <Scissors className="w-3.5 h-3.5 text-brass-dark" />
                <span>Boutique Tailoring Available</span>
              </div>
              <p className="text-[10px] text-obsidian-muted">
                Custom blouse stitching, lining attachment, and fall-pico edging can be arranged directly with our Mulanthuruthy studio.
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Specification Grid & Sticky CTAs (md:col-span-6) */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* SKU & Category Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-border pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySku}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-canvas-subtle text-obsidian font-mono text-xs font-medium hover:bg-canvas-border transition-colors"
                    title="Click to copy SKU"
                  >
                    <span>{selectedProduct.sku}</span>
                    {copiedSku ? (
                      <Check className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <Copy className="w-3 h-3 text-obsidian-slate" />
                    )}
                  </button>
                  {copiedSku && (
                    <span className="text-[10px] text-emerald-850 font-semibold animate-pulse">Copied SKU!</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Secondary CTA: Copy Link */}
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-obsidian-slate hover:text-obsidian hover:bg-canvas-subtle border border-canvas-border transition-colors"
                    title="Copy direct link to this piece"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded-full hover:bg-canvas-subtle text-obsidian-slate hover:text-obsidian transition-colors"
                    title="Share piece via native menu"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleWishlist(selectedProduct)}
                    className={`p-1.5 rounded-full transition-colors ${
                      isSaved ? 'text-terracotta' : 'text-obsidian-slate hover:text-obsidian'
                    }`}
                    title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Title & Category */}
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brass-dark block mb-1">
                  {selectedProduct.category}
                </span>
                <h2 id="modal-product-title" className="font-serif text-2xl sm:text-3xl font-bold text-obsidian leading-snug">
                  {selectedProduct.title}
                </h2>
              </div>

              {/* Price Banner & Stock Badge */}
              <div className="flex items-baseline justify-between p-3.5 rounded-xl bg-canvas-subtle border border-canvas-border">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-obsidian-slate block leading-none">
                    Transparent Catalog Price
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-obsidian font-sans tabular-nums">
                    {formatCurrencyINR(selectedProduct.price)}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                    selectedProduct.in_stock
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-terracotta-50 text-terracotta border border-terracotta/40'
                  }`}
                >
                  {selectedProduct.in_stock ? 'In Stock at Boutique' : 'Reserved / Sold Out'}
                </span>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                    Curator Notes
                  </h4>
                  <p className="text-xs sm:text-sm text-obsidian-slate leading-relaxed font-light">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* Detailed Specification Grid */}
              <div className="p-4 rounded-xl bg-white border border-canvas-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-obsidian">
                  Detailed Specifications
                </h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-obsidian-slate block text-[10px] uppercase tracking-wider">Fabric Material</span>
                    <span className="font-medium text-obsidian">{selectedProduct.fabricDetails || 'Pure Handloom'}</span>
                  </div>

                  <div>
                    <span className="text-obsidian-slate block text-[10px] uppercase tracking-wider">Shade / Palette</span>
                    <span className="font-medium text-obsidian">{selectedProduct.color || 'Artisanal Dyed'}</span>
                  </div>

                  <div>
                    <span className="text-obsidian-slate block text-[10px] uppercase tracking-wider">Weave / Technique</span>
                    <span className="font-medium text-obsidian">{selectedProduct.subCategory || 'Traditional Weave'}</span>
                  </div>

                  <div>
                    <span className="text-obsidian-slate block text-[10px] uppercase tracking-wider">Care Instructions</span>
                    <span className="font-medium text-obsidian">{careInstructions}</span>
                  </div>

                  {isUnstitched && (
                    <div className="col-span-2 pt-1 border-t border-canvas-border/60">
                      <span className="text-obsidian-slate block text-[10px] uppercase tracking-wider">Set Contents (Lengths)</span>
                      <span className="font-medium text-obsidian">Top: 2.5m | Bottom: 2.5m | Dupatta: 2.4m</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Note input for customer inquiry */}
              {selectedProduct.in_stock && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                    Add specific question or stitching request:
                  </label>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="e.g. Inquire about blouse stitching, trial slots in Mulanthuruthy..."
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-canvas-border text-xs text-obsidian placeholder:text-obsidian-slate/60 focus:outline-none focus:border-brass-dark"
                  />
                </div>
              )}

            </div>

            {/* Bottom Sticky Action CTAs */}
            <div className="pt-4 border-t border-canvas-border space-y-2.5">
              {/* Primary Sticky CTA: Reserve this Piece via WhatsApp */}
              <button
                onClick={handleWhatsAppReserve}
                disabled={!selectedProduct.in_stock}
                className={`w-full py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-luxury flex items-center justify-center gap-2 border active:scale-95 ${
                  selectedProduct.in_stock
                    ? 'bg-emerald-950 hover:bg-emerald-900 text-brass-light hover:text-white border-brass/40 cursor-pointer'
                    : 'bg-canvas-subtle text-obsidian-muted border-canvas-border cursor-not-allowed opacity-60'
                }`}
              >
                <MessageCircle className="w-5 h-5 text-whatsapp" />
                <span>
                  {selectedProduct.in_stock ? 'Reserve this Piece via WhatsApp' : 'Piece is Currently Reserved'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Secondary Button: Request Fabric Video */}
                <button
                  onClick={handleRequestVideo}
                  className="py-2.5 px-3 rounded-full bg-canvas-subtle hover:bg-canvas-border text-obsidian font-medium text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 border border-canvas-border truncate"
                  title="Request a WhatsApp video showing the fabric fall and zari"
                >
                  <Video className="w-3.5 h-3.5 text-brass-dark shrink-0" />
                  <span className="truncate">Request Drape Video</span>
                </button>

                {/* Secondary Button: Store Directions */}
                <button
                  onClick={handleOpenDirections}
                  className="py-2.5 px-3 rounded-full bg-canvas-subtle hover:bg-canvas-border text-obsidian font-medium text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 border border-canvas-border truncate"
                >
                  <MapPin className="w-3.5 h-3.5 text-brass-dark shrink-0" />
                  <span className="truncate">Directions</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductModal;
