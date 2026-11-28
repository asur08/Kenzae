import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
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
      <div className="py-20 text-center max-w-md mx-auto space-y-4 px-4">
        <div className="w-12 h-12 rounded-[10px] bg-white border border-canvas-border mx-auto flex items-center justify-center text-obsidian-muted">
          <Search className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <h3 className="font-serif text-[26px] font-normal text-obsidian leading-snug">
          No matching pieces found
        </h3>
        <p className="text-[14px] text-obsidian-slate leading-relaxed">
          Try broadening your price range or clearing weave filters to view the full collection.
        </p>
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-2 px-5 h-10 rounded-[8px] bg-maroon-900 hover:bg-maroon-850 text-white text-[13px] font-medium active:scale-[0.98] transition-[transform,background-color] duration-150"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
          <span>Reset all filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-l border-canvas-border">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
