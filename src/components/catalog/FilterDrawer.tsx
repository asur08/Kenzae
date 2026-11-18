import React from 'react';
import { X, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
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

  return (
    <AnimatePresence>
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Dimmed Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setIsFilterDrawerOpen(false)}
          />

          {/* Slide-in Drawer Container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="w-screen max-w-md bg-canvas shadow-2xl flex flex-col border-l border-brass/30"
            >
              {/* Header */}
              <div className="p-5 border-b border-canvas-border flex items-center justify-between bg-canvas-subtle">
                <div>
                  <h2 className="font-serif text-xl font-medium text-maroon-950">Refine Collection</h2>
                  <p className="text-xs text-obsidian-slate">Tailor catalog by category, weave, and price</p>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-canvas-border text-obsidian transition-colors"
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
                    <span className="text-xs font-bold uppercase tracking-wider text-maroon-950">
                      Maximum Budget
                    </span>
                    <span className="text-sm font-semibold text-maroon-900 tabular-nums">
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
                    className="w-full accent-maroon-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-obsidian-muted mt-1 tabular-nums">
                    <span>₹1,500</span>
                    <span>₹25,000+</span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-maroon-950 mb-2">
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
                          className={`text-left px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-maroon-900 text-brass-light font-semibold'
                              : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-border'
                          }`}
                        >
                          <span>{cat === 'All' ? 'All Collections' : cat}</span>
                          {isSelected && <Check className="w-4 h-4 text-brass" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-Category / Weave */}
                {availableSubCategories.length > 0 && (
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-maroon-950 mb-2">
                      Fabric Weave &amp; Style
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() =>
                          setFilterState((prev) => ({ ...prev, subCategory: 'All' }))
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          filterState.subCategory === 'All'
                            ? 'bg-maroon-900 text-brass-light'
                            : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-border'
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
                                ? 'bg-maroon-900 text-brass-light'
                                : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-border'
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
                <div className="pt-3 border-t border-canvas-border">
                  <label className="flex items-center justify-between cursor-pointer gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-maroon-950 block">
                        In-Stock Items Only
                      </span>
                      <span className="text-[11px] text-obsidian-muted">
                        Show only pieces currently available in boutique
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
                      className="w-5 h-5 accent-maroon-900 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="p-4 border-t border-canvas-border bg-canvas-subtle flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 px-4 rounded-full border border-canvas-border bg-white text-xs font-semibold uppercase tracking-wider text-obsidian hover:bg-canvas-border transition-colors text-center"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-3 px-4 rounded-full bg-maroon-900 hover:bg-maroon-850 text-brass-light text-xs font-bold uppercase tracking-wider active:scale-95 transition-all text-center shadow-md"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
