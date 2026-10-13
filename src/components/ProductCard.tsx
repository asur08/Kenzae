import React, { useState } from 'react';
import { Heart, MessageCircle, Eye, Sparkles } from 'lucide-react';
import { KenzaeProduct } from '../types/catalog';
import { formatCurrencyINR } from '../utils/formatters';
import { useCatalog } from '../context/CatalogContext';
import { generateProductWhatsAppUrl } from '../utils/whatsapp';

interface ProductCardProps {
  product: KenzaeProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isWishlisted, toggleWishlist, setSelectedProduct } = useCatalog();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isSaved = isWishlisted(product.id);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.in_stock) return;
    const url = generateProductWhatsAppUrl(product);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCardClick = () => {
    setSelectedProduct(product);
  };

  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-canvas-surface rounded-xl overflow-hidden border border-canvas-border hover:border-brass/60 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* 3:4 Portrait Aspect Ratio Image Holder */}
      <div 
        className="relative aspect-[3/4] w-full overflow-hidden bg-canvas-subtle"
        onMouseEnter={() => {
          if (hasMultipleImages) setCurrentImageIndex(1);
        }}
        onMouseLeave={() => {
          if (hasMultipleImages) setCurrentImageIndex(0);
        }}
      >
        {/* Low-saturation shimmer placeholder to prevent layout shifts */}
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer-placeholder" />
        )}

        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Soft Vignette Gradient for Badges */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 via-black/15 to-transparent pointer-events-none" />

        {/* Top Floating Badges: SKU & Wishlist */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
          <div className="flex flex-col gap-1">
            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/90 backdrop-blur-md text-brass-light text-[10px] font-semibold tracking-wider uppercase border border-brass/40">
                <Sparkles className="w-2.5 h-2.5 text-brass" />
                <span>Featured</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] tracking-wider uppercase font-mono">
              {product.sku}
            </span>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${
              isSaved
                ? 'bg-rose-50 text-terracotta shadow-md scale-105'
                : 'bg-white/85 hover:bg-white text-obsidian shadow-sm'
            }`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Overlay Badges: Stock Status & Photos Count */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {product.in_stock ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase backdrop-blur-md bg-emerald-900/85 text-emerald-100 border border-emerald-500/30">
              In Boutique
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase backdrop-blur-md bg-terracotta-50 text-terracotta border border-terracotta/40">
              Reserved / Sold Out
            </span>
          )}

          {hasMultipleImages && (
            <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium backdrop-blur-md">
              {product.images.length} photos
            </span>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          {/* Fabric Type & SubCategory Tag */}
          <div className="flex items-center justify-between text-[11px] text-obsidian-slate mb-1">
            <span className="uppercase tracking-wider font-medium text-brass-dark truncate max-w-[180px]">
              {product.subCategory || product.category}
            </span>
            {product.color && (
              <span className="truncate max-w-[100px] text-right font-light text-[10px]">
                {product.color}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-base font-semibold text-obsidian line-clamp-2 leading-snug group-hover:text-emerald-950 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Meta: Price with tabular-nums & Enquire on WhatsApp CTA */}
        <div className="pt-2 border-t border-canvas-border flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-wider text-obsidian-slate leading-none">
              Catalog Price
            </span>
            <span className="text-base font-bold text-obsidian tabular-nums font-sans">
              {formatCurrencyINR(product.price)}
            </span>
          </div>

          {/* Full-width tactile WhatsApp Enquiry button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppClick}
              disabled={!product.in_stock}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all shadow-sm flex items-center justify-center gap-1.5 border active:scale-95 ${
                product.in_stock
                  ? 'bg-emerald-950 hover:bg-emerald-900 text-brass-light hover:text-white border-brass/30'
                  : 'bg-canvas-subtle text-obsidian-muted border-canvas-border cursor-not-allowed opacity-60'
              }`}
              title={product.in_stock ? 'Enquire on WhatsApp' : 'Item is currently reserved'}
            >
              <MessageCircle className="w-3.5 h-3.5 text-whatsapp shrink-0" />
              <span className="truncate">
                {product.in_stock ? 'Enquire on WhatsApp' : 'Reserved / Sold Out'}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="p-2 rounded-lg bg-canvas-subtle hover:bg-canvas-border text-obsidian transition-colors shrink-0"
              title="Inspect specifications & fabric weave"
              aria-label="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
