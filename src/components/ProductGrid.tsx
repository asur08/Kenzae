import React from 'react';
import { KenzaeProduct } from '../types/catalog';
import { ProductCard } from './ProductCard';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';

interface ProductGridProps {
  products: KenzaeProduct[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const { resetFilters } = useCatalog();

  if (products.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-canvas-subtle border border-canvas-dark mx-auto flex items-center justify-center text-obsidian-muted">
          <Sparkles className="w-7 h-7 text-gold-500" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-emerald-950">
          No matching pieces found
        </h3>
        <p className="text-xs sm:text-sm text-obsidian-muted font-light">
          We couldn't find any items matching your active criteria. Try broadening your budget or clearing fabric filters.
        </p>
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gold-gradient-bg text-emerald-950 text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 active:scale-95 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pt-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
