import React from 'react';
import { ProductCategory } from '../../types/catalog';
import { useCatalog } from '../../context/CatalogContext';

const CATEGORIES: { label: string; value: ProductCategory | 'All' }[] = [
  { label: 'All Pieces', value: 'All' },
  { label: 'Saris', value: 'Saris' },
  { label: 'Churidars & Salwar Sets', value: 'Churidars & Salwar Sets' },
  { label: 'Unstitched Dress Materials', value: 'Unstitched Dress Materials' },
  { label: 'Kurthis & Ready-to-Wear', value: 'Kurthis & Ready-to-Wear' },
];

export const CategoryTabs: React.FC = () => {
  const { products, filterState, setFilterState } = useCatalog();

  const getCategoryCount = (categoryValue: ProductCategory | 'All') => {
    if (categoryValue === 'All') return products.length;
    return products.filter((p) => p.category === categoryValue).length;
  };

  const handleCategorySelect = (categoryValue: ProductCategory | 'All') => {
    setFilterState((prev) => ({
      ...prev,
      category: categoryValue,
      subCategory: 'All', // Reset subcategory when switching category
    }));
  };

  return (
    <div className="w-full border-b border-canvas-dark/60 bg-canvas/70 backdrop-blur-sm sticky top-[69px] md:top-[81px] z-30 py-2.5">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((tab) => {
            const isActive = filterState.category === tab.value;
            const count = getCategoryCount(tab.value);

            return (
              <button
                key={tab.value}
                onClick={() => handleCategorySelect(tab.value)}
                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all select-none ${
                  isActive
                    ? 'bg-emerald-950 text-gold-300 shadow-sm border border-gold-500/40'
                    : 'bg-canvas-subtle hover:bg-canvas-muted text-obsidian border border-canvas-dark/40 hover:text-emerald-950'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                    isActive
                      ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                      : 'bg-canvas-dark/50 text-obsidian-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
