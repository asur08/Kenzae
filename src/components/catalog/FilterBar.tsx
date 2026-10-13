import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';

export const FilterBar: React.FC = () => {
  const {
    filterState,
    setFilterState,
    filteredProducts,
    products,
    availableSubCategories,
    setIsFilterDrawerOpen,
    resetFilters
  } = useCatalog();

  const isFiltered =
    filterState.searchQuery !== '' ||
    filterState.category !== 'All' ||
    filterState.subCategory !== 'All' ||
    filterState.maxPrice < 25000 ||
    filterState.inStockOnly;

  return (
    <div className="py-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-obsidian-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) =>
              setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            placeholder="Search by silk, fabric, SKU (e.g. KZ-SR-001), color..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white border border-canvas-dark text-xs sm:text-sm text-obsidian placeholder:text-obsidian-muted/70 focus:outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 transition-all shadow-sm"
          />
          {filterState.searchQuery && (
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-muted hover:text-obsidian p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls: Sort & Filter Drawer Button */}
        <div className="flex items-center gap-2.5 justify-between md:justify-end">
          {/* In-Stock Toggle */}
          <button
            onClick={() =>
              setFilterState((prev) => ({ ...prev, inStockOnly: !prev.inStockOnly }))
            }
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-colors ${
              filterState.inStockOnly
                ? 'bg-emerald-950 text-gold-300 border-gold-500/40'
                : 'bg-white text-obsidian border-canvas-dark hover:bg-canvas-subtle'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                filterState.inStockOnly ? 'bg-gold-400' : 'bg-canvas-dark'
              }`}
            ></span>
            <span>In-Stock Only</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center bg-white border border-canvas-dark rounded-full px-3 py-1.5 shadow-sm text-xs text-obsidian">
            <ArrowUpDown className="w-3.5 h-3.5 text-obsidian-muted mr-1.5 pointer-events-none" />
            <select
              value={filterState.sortBy}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  sortBy: e.target.value as typeof prev.sortBy,
                }))
              }
              className="bg-transparent text-xs font-medium text-obsidian focus:outline-none cursor-pointer pr-1"
            >
              <option value="featured">Featured Collection</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Latest Curations</option>
            </select>
          </div>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-950 text-gold-300 text-xs font-medium tracking-wide border border-gold-500/30 hover:bg-emerald-900 transition-colors shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-gold-400" />
            <span>Filters</span>
            {filterState.subCategory !== 'All' || filterState.maxPrice < 25000 ? (
              <span className="w-2 h-2 rounded-full bg-gold-400"></span>
            ) : null}
          </button>

          {/* Reset Filters Pill */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-xs text-emerald-850 hover:text-emerald-950 underline underline-offset-4 font-medium transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Subcategory Fabric Tags (Quick Chips) */}
      {availableSubCategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] uppercase tracking-wider text-obsidian-muted shrink-0 mr-1 font-medium">
            Weave / Fabric:
          </span>
          <button
            onClick={() => setFilterState((prev) => ({ ...prev, subCategory: 'All' }))}
            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterState.subCategory === 'All'
                ? 'bg-emerald-900 text-gold-300'
                : 'bg-canvas-subtle hover:bg-canvas-muted text-obsidian'
            }`}
          >
            All Weaves
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
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-emerald-900 text-gold-300'
                    : 'bg-canvas-subtle hover:bg-canvas-muted text-obsidian border border-canvas-dark/40'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-gold-400" />}
                <span>{sub}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results Count Line */}
      <div className="flex items-center justify-between text-xs text-obsidian-muted pt-1">
        <span>
          Displaying <strong className="font-semibold text-emerald-950">{filteredProducts.length}</strong> of{' '}
          {products.length} designer pieces
        </span>
        {filterState.category !== 'All' && (
          <span className="text-[11px] font-medium text-emerald-850 uppercase tracking-wider">
            {filterState.category}
          </span>
        )}
      </div>
    </div>
  );
};
