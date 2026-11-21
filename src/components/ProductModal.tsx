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
  Layers,
  Scissors,
  ShoppingBag,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCatalog } from '../context/CatalogContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { TailoringSelection } from '../types/cart';
import { TailoringSelector } from './cart/TailoringSelector';
import { formatCurrencyINR } from '../utils/formatters';
import { generateProductWhatsAppUrl } from '../utils/whatsapp';
import { KENZAE_STORE_CONFIG } from '../data/storeConfig';
import { FabricBadge } from './FabricBadge';
import { trackAddToCart, trackWhatsAppInquiry } from '../services/telemetryService';

export const ProductModal: React.FC = () => {
  const {
    products,
    selectedProduct,
    setSelectedProduct,
    isWishlisted,
    toggleWishlist,
  } = useCatalog();

  const { addToCart } = useCart();
  const { currentCurrency, formatPrice } = useCurrency();
  const [tailoring, setTailoring] = useState<TailoringSelection>({
    type: 'standard',
    additionalCost: 0,
  });

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video'>('photos');
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [customNote, setCustomNote] = useState('');
  const [copiedSku, setCopiedSku] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 35 });

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIndex(0);
      setActiveMediaTab('photos');
      setIsVideoMuted(true);
      setCustomNote('');
      setCopiedSku(false);
      setCopiedLink(false);
      setIsZoomed(false);
      setZoomOrigin({ x: 50, y: 35 });

      const isSaree = selectedProduct.category === 'Saris';
      const isStitchedSuit =
        selectedProduct.category === 'Churidars & Salwar Sets' ||
        selectedProduct.category === 'Kurthis & Ready-to-Wear';

      setTailoring({
        type: isSaree ? 'saree' : isStitchedSuit ? 'stitched_suit' : 'standard',
        sareeFinishing: isSaree ? 'unstitched' : undefined,
        selectedSize: isStitchedSuit ? 'M' : undefined,
        additionalCost: 0,
      });

      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [selectedProduct?.id]);

  const handleAddToCart = () => {
    if (!selectedProduct || !isAvailable) return;
    addToCart(selectedProduct, tailoring, 1);
    trackAddToCart(
      {
        id: `${selectedProduct.id}__${tailoring.type}`,
        productId: selectedProduct.id,
        sku: selectedProduct.sku,
        title: selectedProduct.title,
        category: selectedProduct.category,
        subCategory: selectedProduct.subCategory,
        price: selectedProduct.price,
        image: selectedProduct.images[0] || '',
        quantity: 1,
        tailoring,
        itemTotal: selectedProduct.price + (tailoring.additionalCost || 0),
      },
      currentCurrency
    );
    setSelectedProduct(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProduct) return;

      if (e.key === 'Escape') {
        setSelectedProduct(null);
      }

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
  const qty = selectedProduct.stockQuantity ?? (selectedProduct.in_stock ? 1 : 0);
  const isAvailable = selectedProduct.in_stock && qty > 0;

  const relatedPieces = products
    .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    .slice(0, 3);

  const handleCopySku = () => {
    navigator.clipboard.writeText(selectedProduct.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/p/${encodeURIComponent(selectedProduct.sku)}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/p/${encodeURIComponent(selectedProduct.sku)}`;
    const shareData = {
      title: `${selectedProduct.title} | Kenzae`,
      text: `Inquire about ${selectedProduct.title} (${selectedProduct.sku}) at Kenzae for ${formatCurrencyINR(selectedProduct.price)}.`,
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

  // VIP Bridal / Custom Styling Consultation via WhatsApp
  const handleWhatsAppEnquiry = () => {
    trackWhatsAppInquiry(selectedProduct, 'bridal_consult');
    const note = customNote.trim() ? customNote.trim() : undefined;
    const url = generateProductWhatsAppUrl(selectedProduct, note);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenDirections = () => {
    window.open(KENZAE_STORE_CONFIG.googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
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
  const careInstructions =
    selectedProduct.category === 'Saris'
      ? 'Dry clean only. Store folded in soft muslin cloth.'
      : 'Gentle hand wash in cold water with mild detergent or dry clean.';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-product-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
          onClick={() => setSelectedProduct(null)}
        />

        {/* Modal Dialog */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl bg-canvas-surface rounded-2xl shadow-2xl overflow-hidden border border-brass/35 z-10 max-h-[92vh] flex flex-col my-auto"
        >
          {/* Floating Close Button */}
          <button
            ref={closeButtonRef}
            onClick={() => setSelectedProduct(null)}
            className="absolute top-3.5 right-3.5 z-20 p-2.5 rounded-full bg-maroon-950/80 hover:bg-maroon-950 text-white backdrop-blur-md transition-all shadow-md active:scale-95"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
              {/* Left Column: Drape Gallery, HD Texture Loupe & Drape Video Reel */}
              <div className="md:col-span-6 bg-canvas-subtle p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-canvas-border">
                <div>
                  {/* Media Switcher Tab (if product has video) */}
                  {selectedProduct.videoUrl && (
                    <div className="flex items-center gap-1.5 mb-3 bg-white/80 p-1 rounded-xl border border-canvas-border shadow-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMediaTab('photos');
                          setIsZoomed(false);
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          activeMediaTab === 'photos'
                            ? 'bg-maroon-900 text-white shadow-xs'
                            : 'text-obsidian-slate hover:text-obsidian'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Photos ({selectedProduct.images.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveMediaTab('video');
                          setIsZoomed(false);
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          activeMediaTab === 'video'
                            ? 'bg-maroon-900 text-white shadow-xs'
                            : 'text-obsidian-slate hover:text-obsidian'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-brass" />
                        <span>Drape in Motion</span>
                      </button>
                    </div>
                  )}

                  {/* Main Display: Video Player or Photo Loupe */}
                  {activeMediaTab === 'video' && selectedProduct.videoUrl ? (
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black shadow-inner flex items-center justify-center group">
                      <video
                        src={selectedProduct.videoUrl}
                        autoPlay
                        loop
                        muted={isVideoMuted}
                        playsInline
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-maroon-950/90 text-brass-light border border-brass/40 text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md pointer-events-none flex items-center gap-1.5 shadow-md">
                        <Sparkles className="w-3 h-3 text-brass" />
                        <span>Live Atelier Drape Flow</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsVideoMuted(!isVideoMuted)}
                        className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md shadow-md transition-all active:scale-95"
                        title={isVideoMuted ? 'Unmute video' : 'Mute video'}
                      >
                        {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-white shadow-inner group ${
                        isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                      }`}
                      onClick={() => setIsZoomed((z) => !z)}
                      onMouseMove={handleImageMouseMove}
                      onMouseLeave={() => {
                        if (isZoomed) setZoomOrigin({ x: 50, y: 35 });
                      }}
                      title="Click to toggle 240% weave loupe; move pointer to inspect silk zari and fabric texture"
                    >
                      <img
                        src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                        alt={selectedProduct.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = selectedProduct.images[0];
                        }}
                        style={{
                          transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                        }}
                        className={`w-full h-full object-cover object-top transition-transform duration-200 ease-out ${
                          isZoomed ? 'scale-[2.4]' : 'group-hover:scale-[1.03]'
                        }`}
                      />

                      {/* Loupe Overlay Indicators */}
                      {isZoomed ? (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-maroon-950/90 text-brass-light border border-brass/50 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg pointer-events-none flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>240% Ultra-HD Fabric Inspector</span>
                        </div>
                      ) : (
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-maroon-950/75 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1.5 pointer-events-none">
                          <ZoomIn className="w-3 h-3 text-brass-light" />
                          <span>Click to Inspect Weave</span>
                        </div>
                      )}

                      {selectedProduct.imageRoles?.[activeImageIndex] === 'ai-drape' && (
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[#FAF8F5]/95 backdrop-blur-md text-maroon-950 border border-brass/40 text-[10px] font-semibold flex items-center gap-1 shadow-xs pointer-events-none">
                          <Sparkles className="w-3 h-3 text-brass-dark" />
                          <span>AI Studio Drape · Swipe for Weave Details</span>
                        </div>
                      )}

                      {selectedProduct.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage();
                            }}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-sm transition-all"
                            aria-label="Previous photo"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage();
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-sm transition-all"
                            aria-label="Next photo"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                        {selectedProduct.isFeatured && (
                          <div className="px-2.5 py-1 rounded-full bg-maroon-950/90 border border-brass/40 text-brass-light text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-brass" />
                            <span>Featured Piece</span>
                          </div>
                        )}
                        {selectedProduct.subCategory && (
                          <FabricBadge label={selectedProduct.subCategory} variant="maroon" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Thumbnail Row */}
                  {selectedProduct.images.length > 1 && activeMediaTab === 'photos' && (
                    <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar py-1">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveImageIndex(idx);
                            setIsZoomed(false);
                          }}
                          className={`relative w-16 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                            activeImageIndex === idx
                              ? 'border-maroon-900 scale-105 shadow-md'
                              : 'border-transparent opacity-65 hover:opacity-100'
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
                </div>

                {/* Tailoring Assurance Box */}
                <div className="mt-4 p-3 rounded-xl bg-maroon-50 border border-maroon-200/70 text-[11px] text-obsidian-slate space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-maroon-950">
                    <Scissors className="w-3.5 h-3.5 text-brass-dark" />
                    <span>Boutique Tailoring Available</span>
                  </div>
                  <p className="text-[11px] text-obsidian-slate font-light">
                    Custom blouse stitching, lining attachment, and fall-pico edging can be arranged directly with our boutique studio.
                  </p>
                </div>
              </div>

              {/* Right Column: Specifications & Conversion Flow */}
              <div className="md:col-span-6 p-5 sm:p-7 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  {/* SKU & Share Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-canvas-border pb-3 pr-8">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopySku}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-canvas-subtle text-obsidian font-mono text-xs font-medium hover:bg-canvas-border transition-colors"
                        title="Click to copy SKU"
                      >
                        <span>{selectedProduct.sku}</span>
                        {copiedSku ? (
                          <Check className="w-3 h-3 text-maroon-800" />
                        ) : (
                          <Copy className="w-3 h-3 text-obsidian-slate" />
                        )}
                      </button>
                      {copiedSku && (
                        <span className="text-[10px] text-maroon-900 font-semibold animate-pulse">
                          Copied!
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-obsidian-slate hover:text-obsidian hover:bg-canvas-subtle border border-canvas-border transition-colors"
                        title="Copy direct link to this piece"
                      >
                        {copiedLink ? (
                          <Check className="w-3.5 h-3.5 text-maroon-800" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                      </button>

                      <button
                        onClick={handleShare}
                        className="p-1.5 rounded-full hover:bg-canvas-subtle text-obsidian-slate hover:text-obsidian transition-colors"
                        title="Share piece"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleWishlist(selectedProduct)}
                        className={`p-1.5 rounded-full transition-colors ${
                          isSaved ? 'text-maroon-900' : 'text-obsidian-slate hover:text-obsidian'
                        }`}
                        title={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass-dark block mb-1">
                      {selectedProduct.category}
                    </span>
                    <h2
                      id="modal-product-title"
                      className="font-serif text-2xl sm:text-[28px] font-normal text-obsidian leading-[1.2]"
                    >
                      {selectedProduct.title}
                    </h2>
                  </div>

                  {/* Price & Availability Pill */}
                  <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-canvas-subtle border border-canvas-border">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-obsidian-slate block">
                        Boutique Price
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-[28px] font-semibold text-maroon-950 font-sans tabular-nums">
                          {formatPrice(selectedProduct.price)}
                        </span>
                        {currentCurrency !== 'INR' && (
                          <span className="text-xs text-obsidian-muted tabular-nums">
                            ≈ ₹{selectedProduct.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {!isAvailable ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-terracotta-50 text-terracotta border border-terracotta/40">
                        Reserved / Sold Out
                      </span>
                    ) : qty === 1 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-maroon-950 text-brass-light border border-brass/50 shadow-xs">
                        Only 1 Piece Left
                      </span>
                    ) : qty <= 3 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-maroon-100 text-maroon-900 border border-maroon-200">
                        Only {qty} Pieces Left
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-maroon-100 text-maroon-900 border border-maroon-200">
                        {qty} in Boutique
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {selectedProduct.description && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-obsidian-slate mb-1">
                        Curator Notes
                      </h4>
                      <p className="text-xs sm:text-[13px] text-obsidian-slate leading-relaxed font-light">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}

                  {/* Spec Grid */}
                  <div className="p-4 rounded-xl bg-white border border-canvas-border space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-maroon-950">
                      Specifications
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-obsidian-muted block text-[10px] uppercase tracking-wider">
                          Fabric Material
                        </span>
                        <span className="font-medium text-obsidian">
                          {selectedProduct.fabricDetails || 'Pure Handloom'}
                        </span>
                      </div>

                      <div>
                        <span className="text-obsidian-muted block text-[10px] uppercase tracking-wider">
                          Shade / Palette
                        </span>
                        <span className="font-medium text-obsidian">
                          {selectedProduct.color || 'Artisanal Dyed'}
                        </span>
                      </div>

                      <div>
                        <span className="text-obsidian-muted block text-[10px] uppercase tracking-wider">
                          Weave / Technique
                        </span>
                        <span className="font-medium text-obsidian">
                          {selectedProduct.subCategory || 'Traditional Weave'}
                        </span>
                      </div>

                      <div>
                        <span className="text-obsidian-muted block text-[10px] uppercase tracking-wider">
                          Care Instructions
                        </span>
                        <span className="font-medium text-obsidian">{careInstructions}</span>
                      </div>

                      <div className="col-span-2 pt-2 border-t border-canvas-border/70 flex items-center justify-between">
                        <span className="text-obsidian-muted text-[10px] uppercase tracking-wider">
                          Boutique Availability
                        </span>
                        <span className="font-semibold text-maroon-950 tabular-nums">
                          {isAvailable
                            ? `${qty} handcrafted piece${qty > 1 ? 's' : ''} in atelier`
                            : 'Sold Out'}
                        </span>
                      </div>

                      {isUnstitched && (
                        <div className="col-span-2 pt-2 border-t border-canvas-border/70">
                          <span className="text-obsidian-muted block text-[10px] uppercase tracking-wider">
                            Set Contents (Lengths)
                          </span>
                          <span className="font-medium text-obsidian">
                            Top: 2.5m · Bottom: 2.5m · Dupatta: 2.4m
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Tailoring & Sizing Selector */}
                  {isAvailable && (
                    <TailoringSelector
                      product={selectedProduct}
                      selection={tailoring}
                      onChange={setTailoring}
                    />
                  )}

                  {/* Custom Note */}
                  {isAvailable && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-obsidian-slate mb-1">
                        Optional Stitching or Trial Request
                      </label>
                      <input
                        type="text"
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        placeholder="e.g. Blouse stitching, lining preference, trial slot..."
                        className="w-full px-3.5 py-2 rounded-lg bg-white border border-canvas-border text-xs text-obsidian placeholder:text-obsidian-slate/60 focus:outline-none focus:border-maroon-850"
                      />
                    </div>
                  )}
                </div>

                {/* Action CTAs */}
                <div className="pt-4 border-t border-canvas-border space-y-2.5">
                  {/* Primary Action: Add to Bag */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className={`w-full py-3.5 px-6 rounded-full font-semibold text-xs tracking-[0.14em] uppercase transition-all shadow-luxury flex items-center justify-center gap-2 border active:scale-[0.99] ${
                      isAvailable
                        ? 'bg-maroon-900 hover:bg-maroon-850 text-brass-light hover:text-white border-brass/35 cursor-pointer'
                        : 'bg-canvas-subtle text-obsidian-muted border-canvas-border cursor-not-allowed opacity-60'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-brass-light" />
                    <span>
                      {isAvailable
                        ? `Add to Bag • ${formatPrice(selectedProduct.price + (tailoring.additionalCost || 0))}`
                        : 'Sold Out'}
                    </span>
                  </button>

                  {/* If Sold Out: Made-to-Order Re-weaving Consultation */}
                  {!isAvailable && (
                    <button
                      onClick={handleWhatsAppEnquiry}
                      className="w-full py-3 px-4 rounded-full bg-white hover:bg-canvas-subtle text-obsidian font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 border border-canvas-border"
                    >
                      <MessageCircle className="w-4 h-4 text-whatsapp" />
                      <span>Enquire for Made-to-Order Re-weaving</span>
                    </button>
                  )}

                  {/* If Available: Subtle VIP Stylist Concierge Link */}
                  {isAvailable && (
                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={handleWhatsAppEnquiry}
                        className="text-[11px] text-obsidian-muted hover:text-maroon-900 transition-colors inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-whatsapp" />
                        <span>Bespoke bridal styling or custom tailoring query? Ask Master Draper</span>
                      </button>
                    </div>
                  )}

                  <div className={`grid gap-2 pt-2 ${selectedProduct.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {selectedProduct.images.length > 1 && (
                      <button
                        onClick={nextImage}
                        className="py-2.5 px-3 rounded-full bg-canvas-subtle hover:bg-canvas-border text-obsidian font-medium text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 border border-canvas-border truncate"
                        title="Switch between model drape and garment weave photos"
                      >
                        <Layers className="w-3.5 h-3.5 text-brass-dark shrink-0" />
                        <span className="truncate">
                          {activeImageIndex === 0 ? 'View Fabric Photo' : 'View Model Drape'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={handleOpenDirections}
                      className="py-2.5 px-3 rounded-full bg-canvas-subtle hover:bg-canvas-border text-obsidian font-medium text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 border border-canvas-border truncate"
                    >
                      <MapPin className="w-3.5 h-3.5 text-brass-dark shrink-0" />
                      <span className="truncate">Store Directions</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Pieces Discovery Strip */}
            {relatedPieces.length > 0 && (
              <div className="border-t border-canvas-border bg-[#FAF8F5] p-5 sm:p-6">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass-dark block mb-3">
                  More from {selectedProduct.category}
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {relatedPieces.map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => setSelectedProduct(rel)}
                      className="group text-left bg-white rounded-xl border border-canvas-border hover:border-maroon-900/30 p-2 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-2.5"
                    >
                      <img
                        src={rel.images[0]}
                        alt={rel.title}
                        className="w-full sm:w-12 h-20 sm:h-16 rounded-lg object-cover object-top shrink-0 bg-canvas-subtle"
                      />
                      <div className="min-w-0">
                        <p className="font-serif text-xs sm:text-sm font-medium text-obsidian group-hover:text-maroon-900 line-clamp-1">
                          {rel.title}
                        </p>
                        <p className="text-[11px] font-semibold text-maroon-950 tabular-nums mt-0.5">
                          {formatPrice(rel.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductModal;
