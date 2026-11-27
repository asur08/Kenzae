import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { KenzaeProduct } from '../types/catalog';
import { ProductCard } from './ProductCard';
import { useCatalog } from '../context/CatalogContext';

interface ProductGridProps {
  products: KenzaeProduct[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const { resetFilters } = useCatalog();

  if (products.length === 0) {
    return (
      <div className="py-16 sm:py-20 text-center max-w-md mx-auto space-y-4 px-4">
        <div className="w-14 h-14 rounded-full bg-maroon-50 border border-maroon-200 mx-auto flex items-center justify-center text-maroon-900">
          <Sparkles className="w-6 h-6 text-brass-dark" />
        </div>
        <h3 className="font-serif text-2xl font-medium text-maroon-950">
          No matching pieces found
        </h3>
        <p className="text-xs sm:text-sm text-obsidian-slate font-light leading-relaxed">
          We couldn&apos;t find any ensembles matching your active criteria. Try broadening your price ceiling or clearing weave filters.
        </p>
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-maroon-900 hover:bg-maroon-850 text-brass-light text-xs font-semibold shadow-sm active:scale-95 transition-[color,background-color,border-color,box-shadow,opacity,transform]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 pt-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
