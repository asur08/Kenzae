import React, { useState } from 'react';
import { Heart, Play, ShoppingBag, Eye } from 'lucide-react';
import { KenzaeProduct } from '../types/catalog';
import { useCatalog } from '../context/CatalogContext';
import { useCurrency } from '../context/CurrencyContext';
import { trackAddToWishlist, trackViewItem } from '../services/telemetryService';

interface ProductCardProps {
  product: KenzaeProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isWishlisted, toggleWishlist, setSelectedProduct } = useCatalog();
  const { currentCurrency, formatPrice } = useCurrency();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isSaved = isWishlisted(product.id);
  const qty = product.stockQuantity ?? (product.in_stock ? 1 : 0);
  const isAvailable = product.in_stock && qty > 0;
  const hasMultipleImages = product.images && product.images.length > 1;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSaved) {
      trackAddToWishlist(product);
    }
    toggleWishlist(product);
  };

  const handleCardClick = () => {
    trackViewItem(product, currentCurrency);
    setSelectedProduct(product);
  };

  const renderStockBadge = () => {
    if (!isAvailable) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-[0.12em] uppercase backdrop-blur-md bg-[#FAF8F5]/95 text-obsidian-slate border border-canvas-border shadow-xs">
          Sold Out
        </span>
      );
    }
    if (qty === 1) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-[0.12em] uppercase backdrop-blur-md bg-maroon-950/90 text-brass-light border border-brass/50 shadow-xs">
          Only 1 Left
        </span>
      );
    }
    if (qty <= 3) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-[0.12em] uppercase backdrop-blur-md bg-maroon-900/85 text-white border border-brass/35 shadow-xs">
          Only {qty} Left
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium tracking-[0.1em] uppercase backdrop-blur-md bg-[#FAF8F5]/90 text-maroon-950 border border-maroon-900/15 shadow-xs">
        {qty} in Atelier
      </span>
    );
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl overflow-hidden border border-canvas-border hover:border-maroon-900/25 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col cursor-pointer min-w-0"
    >
      {/* Clean 3:4 Portrait Drape Showcase */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-canvas-subtle"
        onMouseEnter={() => {
          if (hasMultipleImages) setCurrentImageIndex(1);
        }}
        onMouseLeave={() => {
          if (hasMultipleImages) setCurrentImageIndex(0);
        }}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 shimmer-placeholder" />
        )}

        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-maroon-50 text-maroon-900/70">
            <span className="font-serif text-lg tracking-[0.25em] uppercase">KENZAE</span>
            <span className="text-[11px] mt-1 font-light">{product.subCategory || product.category}</span>
          </div>
        ) : (
          <img
            src={product.images[currentImageIndex] || product.images[0]}
            alt={product.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              if (currentImageIndex !== 0 && product.images[0]) {
                setCurrentImageIndex(0);
              } else {
                setImageError(true);
              }
            }}
            className={`w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-[1.04] ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Top-Left Video Drape Indicator */}
        {product.videoUrl && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase backdrop-blur-md bg-black/60 text-white flex items-center gap-1 shadow-xs">
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>Drape Video</span>
            </span>
          </div>
        )}

        {/* Top-Right Minimal Wishlist Control */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${
            isSaved
              ? 'bg-maroon-900 text-brass-light shadow-md scale-105'
              : 'bg-white/85 hover:bg-white text-obsidian shadow-xs opacity-95'
          }`}
          aria-label={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom-Left Single Availability Pill */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          {renderStockBadge()}
        </div>
      </div>

      {/* Card Editorial Metadata */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-white min-w-0">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="uppercase tracking-[0.16em] font-semibold text-brass-dark truncate">
              {product.subCategory || product.category}
            </span>
            <span className="font-mono text-obsidian-muted shrink-0">
              {product.sku}
            </span>
          </div>

          <h3 className="font-serif text-[17px] font-medium text-obsidian line-clamp-2 leading-[1.3] group-hover:text-maroon-900 transition-colors">
            {product.title}
          </h3>

          {product.color && (
            <p className="text-[11px] text-obsidian-slate font-light truncate">
              {product.color}
            </p>
          )}
        </div>

        {/* Pricing & Dual Actions */}
        <div className="pt-2.5 border-t border-canvas-border flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-obsidian-muted">
              Boutique Price
            </span>
            <div className="flex flex-col items-end">
              <span className="text-base font-semibold text-maroon-950 tabular-nums font-sans">
                {formatPrice(product.price)}
              </span>
              {currentCurrency !== 'INR' && (
                <span className="text-[10px] text-obsidian-muted tabular-nums">
                  ≈ ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              disabled={!isAvailable}
              className={`flex-1 py-2 px-3 rounded-lg text-[11px] font-semibold tracking-[0.12em] uppercase transition-all flex items-center justify-center gap-1.5 border active:scale-[0.98] min-w-0 ${
                isAvailable
                  ? 'bg-maroon-900 hover:bg-maroon-850 text-brass-light hover:text-white border-maroon-900 shadow-xs cursor-pointer'
                  : 'bg-canvas-subtle text-obsidian-muted border-canvas-border cursor-not-allowed opacity-60'
              }`}
              title={isAvailable ? 'Select options & Add to Bag' : 'Piece is currently sold out'}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-brass-light shrink-0" />
              <span className="truncate">
                {isAvailable ? 'Add to Bag' : 'Sold Out'}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="p-2 rounded-lg bg-canvas-subtle hover:bg-maroon-50 text-obsidian hover:text-maroon-900 border border-canvas-border transition-colors shrink-0"
              title="Inspect specifications & fabric zoom"
              aria-label="Inspect piece"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
