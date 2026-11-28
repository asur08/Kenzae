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

  const renderStockStatus = () => {
    if (!isAvailable) {
      return (
        <span className="px-2.5 py-1 rounded-[6px] text-xs font-medium bg-white text-obsidian-slate border border-canvas-border">
          Sold out
        </span>
      );
    }
    if (qty === 1) {
      return (
        <span className="px-2.5 py-1 rounded-[6px] text-xs font-medium bg-maroon-950 text-white">
          Only 1 left
        </span>
      );
    }
    if (qty <= 3) {
      return (
        <span className="px-2.5 py-1 rounded-[6px] text-xs font-medium bg-maroon-900 text-white tabular-nums">
          Only {qty} left
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-[6px] text-xs font-medium bg-white text-obsidian border border-canvas-border tabular-nums">
        {qty} in atelier
      </span>
    );
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative bg-white hover:bg-canvas transition-colors duration-150 flex flex-col cursor-pointer min-w-0 border-r border-b border-canvas-border"
    >
      {/* 3:4 Portrait Drape Showcase */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-canvas-subtle border-b border-canvas-border"
        onMouseEnter={() => {
          if (hasMultipleImages) setCurrentImageIndex(1);
        }}
        onMouseLeave={() => {
          if (hasMultipleImages) setCurrentImageIndex(0);
        }}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-canvas-subtle" />
        )}

        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-canvas-subtle text-obsidian-slate">
            <span className="font-serif text-xl text-maroon-950">Kenzae</span>
            <span className="text-xs mt-1">{product.subCategory || product.category}</span>
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
            className={`w-full h-full object-cover object-top transition-opacity duration-150 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Top-Left Video Drape Indicator */}
        {product.videoUrl && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="px-2.5 py-1 rounded-[6px] text-xs font-medium bg-obsidian/85 text-white inline-flex items-center gap-1.5">
              <Play className="w-3 h-3 fill-current" strokeWidth={1.5} />
              <span>Drape video</span>
            </span>
          </div>
        )}

        {/* Top-Right Wishlist Control */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 w-9 h-9 rounded-[8px] flex items-center justify-center border transition-[transform,background-color,color,border-color] duration-150 active:scale-[0.96] ${
            isSaved
              ? 'bg-maroon-900 text-white border-maroon-900'
              : 'bg-white hover:bg-canvas-subtle text-obsidian-slate border-canvas-border'
          }`}
          aria-label={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} strokeWidth={1.5} />
        </button>

        {/* Bottom-Left Availability Status */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          {renderStockStatus()}
        </div>
      </div>

      {/* Card Editorial Metadata */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-brass-dark truncate">
              {product.subCategory || product.category}
            </span>
            <span className="font-normal text-obsidian-muted tabular-nums shrink-0">
              {product.sku}
            </span>
          </div>

          <h3 className="font-serif text-[20px] font-normal text-obsidian line-clamp-2 leading-[1.25] group-hover:text-maroon-900 transition-colors duration-150">
            {product.title}
          </h3>

          {product.color && (
            <p className="text-[13px] text-obsidian-slate truncate">
              {product.color}
            </p>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="pt-4 border-t border-canvas-border flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-obsidian-muted">
              Boutique price
            </span>
            <div className="flex flex-col items-end">
              <span className="text-[16px] font-medium text-obsidian tabular-nums">
                {formatPrice(product.price)}
              </span>
              {currentCurrency !== 'INR' && (
                <span className="text-xs text-obsidian-muted tabular-nums">
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
              className={`flex-1 h-10 px-3 rounded-[8px] text-[13px] font-medium transition-[transform,background-color] duration-150 flex items-center justify-center gap-2 border active:scale-[0.98] min-w-0 ${
                isAvailable
                  ? 'bg-maroon-900 hover:bg-maroon-850 text-white border-maroon-900 cursor-pointer'
                  : 'bg-canvas-subtle text-obsidian-muted border-canvas-border cursor-not-allowed'
              }`}
              title={isAvailable ? 'Select options and add to bag' : 'Piece is currently sold out'}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="truncate">
                {isAvailable ? 'Add to bag' : 'Sold out'}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="w-10 h-10 flex items-center justify-center rounded-[8px] bg-white hover:bg-canvas-subtle text-obsidian-slate hover:text-obsidian border border-canvas-border transition-[transform,background-color,color] duration-150 active:scale-[0.98] shrink-0"
              title="Inspect specifications and fabric zoom"
              aria-label="Inspect piece"
            >
              <Eye className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
