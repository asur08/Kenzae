import React from 'react';
import { X, Check } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { formatCurrencyINR } from '../../utils/formatters';
import { ProductCategory } from '../../types/catalog';

const ALL_CATEGORIES: (ProductCategory | 'All')[] = [
  'All',
  'Saris',
  'Churidars & Salwar Sets',
  'Unstitched Dress Materials',
  'Kurthis & Ready-to-Wear',
];

export const FilterDrawer: React.FC = () => {
  const {
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    filterState,
    setFilterState,
    availableSubCategories,
    resetFilters,
  } = useCatalog();

  React.useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterDrawerOpen]);

  if (!isFilterDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsFilterDrawerOpen(false)}
      />

      {/* Slide-in Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-canvas shadow-2xl flex flex-col border-l border-gold-500/30">
          
          {/* Header */}
          <div className="p-5 border-b border-canvas-dark flex items-center justify-between bg-canvas-subtle">
            <div>
              <h2 className="font-serif text-xl font-bold text-emerald-950">Refine Collection</h2>
              <p className="text-xs text-obsidian-muted">Tailor catalog by category, weave, and price</p>
            </div>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-canvas-muted text-obsidian transition-colors"
              aria-label="Close Filter Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Maximum Budget
                </span>
                <span className="text-sm font-semibold text-emerald-850">
                  {formatCurrencyINR(filterState.maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min="1500"
                max="25000"
                step="500"
                value={filterState.maxPrice}
                onChange={(e) =>
                  setFilterState((prev) => ({
                    ...prev,
                    maxPrice: Number(e.target.value),
                  }))
                }
                className="w-full accent-emerald-850 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-obsidian-muted mt-1">
                <span>₹1,500</span>
                <span>₹25,000+</span>
              </div>
            </div>

            {/* Category */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-2">
                Category
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {ALL_CATEGORIES.map((cat) => {
                  const isSelected = filterState.category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          category: cat,
                          subCategory: 'All',
                        }))
                      }
                      className={`text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-emerald-900 text-gold-300 font-semibold'
                          : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-dark/40'
                      }`}
                    >
                      <span>{cat === 'All' ? 'All Collections' : cat}</span>
                      {isSelected && <Check className="w-4 h-4 text-gold-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-Category / Weave */}
            {availableSubCategories.length > 0 && (
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-2">
                  Fabric Weave & Style
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({ ...prev, subCategory: 'All' }))
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterState.subCategory === 'All'
                        ? 'bg-emerald-900 text-gold-300'
                        : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-dark/50'
                    }`}
                  >
                    All Styles
                  </button>
                  {availableSubCategories.map((sub) => {
                    const isSelected = filterState.subCategory === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() =>
                          setFilterState((prev) => ({
                            ...prev,
                            subCategory: isSelected ? 'All' : sub,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-emerald-900 text-gold-300'
                            : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-dark/50'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* In-Stock Toggle */}
            <div className="pt-2 border-t border-canvas-dark">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 block">
                    In-Stock Items Only
                  </span>
                  <span className="text-[11px] text-obsidian-muted">
                    Show only pieces available for immediate pickup in Mulanthuruthy
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={filterState.inStockOnly}
                  onChange={(e) =>
                    setFilterState((prev) => ({
                      ...prev,
                      inStockOnly: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 accent-emerald-850 rounded cursor-pointer"
                />
              </label>
            </div>

          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-canvas-dark bg-canvas-subtle flex items-center gap-3">
            <button
              onClick={resetFilters}
              className="flex-1 py-3 px-4 rounded-full border border-canvas-dark text-xs font-semibold uppercase tracking-wider text-obsidian hover:bg-canvas-muted transition-colors text-center"
            >
              Reset All
            </button>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="flex-1 py-3 px-4 rounded-full gold-gradient-bg text-emerald-950 text-xs font-bold uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all text-center shadow-md"
            >
              Show Results
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
