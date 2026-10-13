import React, { useState } from 'react';
import { Heart, MessageCircle, Eye, Sparkles } from 'lucide-react';
import { KenzaeProduct } from '../types/catalog';
import { formatCurrencyINR } from '../utils/formatters';
import { useCatalog } from '../context/CatalogContext';
import { generateProductWhatsAppUrl } from '../utils/whatsapp';
import { FabricBadge } from './FabricBadge';

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
      className="group relative bg-white rounded-xl overflow-hidden border border-canvas-dark/60 hover:border-gold-500/50 shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container with Fixed 3:4 Aspect Ratio */}
      <div 
        className="relative aspect-[3/4] w-full overflow-hidden bg-canvas-subtle"
        onMouseEnter={() => {
          if (hasMultipleImages) setCurrentImageIndex(1);
        }}
        onMouseLeave={() => {
          if (hasMultipleImages) setCurrentImageIndex(0);
        }}
      >
        {/* Shimmer loading background */}
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

        {/* Gradient Shadow Overlay for Badges */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 via-black/10 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
          <div className="flex flex-col gap-1">
            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/90 backdrop-blur-md text-gold-300 text-[10px] font-semibold tracking-wider uppercase border border-gold-500/30">
                <Sparkles className="w-2.5 h-2.5 text-gold-400" />
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
                ? 'bg-rose-50 text-rose-600 shadow-md scale-105'
                : 'bg-white/80 hover:bg-white text-obsidian shadow-sm'
            }`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Overlay Badges: In Stock & Multiple Images Indicator */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <FabricBadge
            label={product.in_stock ? 'In Boutique' : 'Custom Order'}
            variant={product.in_stock ? 'stock' : 'canvas'}
          />

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
          {/* Subcategory / Fabric Tag */}
          <div className="flex items-center justify-between text-[11px] text-obsidian-muted mb-1">
            <span className="uppercase tracking-wider font-medium text-emerald-850">
              {product.subCategory || product.category}
            </span>
            {product.color && (
              <span className="truncate max-w-[120px] text-right font-light">
                {product.color}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-base font-semibold text-obsidian line-clamp-2 leading-snug group-hover:text-emerald-900 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-canvas-dark/50 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-obsidian-muted block leading-none">
              Price
            </span>
            <span className="text-base font-bold text-emerald-950 font-sans tracking-tight">
              {formatCurrencyINR(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick View Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="p-2 rounded-full bg-canvas-subtle hover:bg-canvas-muted text-obsidian transition-colors"
              title="Inspect fabric details"
              aria-label="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Direct 1-Tap WhatsApp Reservation Button */}
            <button
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-900 hover:bg-emerald-850 text-gold-300 hover:text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm active:scale-95 border border-gold-500/30"
              title="Reserve via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-whatsapp" />
              <span>Inquire</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
