import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { ProductCategory } from '../../types/catalog';

const CATEGORIES: { label: string; value: ProductCategory | 'All' }[] = [
  { label: 'All Items', value: 'All' },
  { label: 'Saris', value: 'Saris' },
  { label: 'Churidars & Salwar Sets', value: 'Churidars & Salwar Sets' },
  { label: 'Dress Materials', value: 'Unstitched Dress Materials' },
  { label: 'Kurthis', value: 'Kurthis & Ready-to-Wear' },
];

const PRICE_QUICK_CHIPS = [
  { label: 'All Prices', min: 0, max: 25000 },
  { label: 'Under ₹3,000', min: 0, max: 3000 },
  { label: '₹3,000 – ₹8,000', min: 3000, max: 8000 },
  { label: 'Above ₹8,000', min: 8000, max: 25000 },
];

export const FilterBar: React.FC = () => {
  const {
    filterState,
    setFilterState,
    filteredProducts,
    products,
    availableSubCategories,
    setIsFilterDrawerOpen,
    resetFilters,
  } = useCatalog();

  const isFiltered =
    filterState.searchQuery !== '' ||
    filterState.category !== 'All' ||
    filterState.subCategory !== 'All' ||
    filterState.maxPrice < 25000 ||
    filterState.inStockOnly;

  const handleCategorySelect = (catValue: ProductCategory | 'All') => {
    setFilterState((prev) => ({
      ...prev,
      category: catValue,
      subCategory: 'All',
    }));
  };

  const handlePriceChipSelect = (chip: typeof PRICE_QUICK_CHIPS[0]) => {
    setFilterState((prev) => ({
      ...prev,
      maxPrice: chip.max,
    }));
  };

  return (
    <div className="py-4 space-y-4">
      {/* Category Horizontal Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => {
          const isActive = filterState.category === cat.value;
          const count =
            cat.value === 'All'
              ? products.length
              : products.filter((p) => p.category === cat.value).length;

          return (
            <button
              key={cat.value}
              onClick={() => handleCategorySelect(cat.value)}
              className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all select-none ${
                isActive
                  ? 'bg-emerald-950 text-brass-light shadow-sm border border-brass/40'
                  : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-border hover:text-emerald-950'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums transition-colors ${
                  isActive
                    ? 'bg-brass/20 text-brass-light'
                    : 'bg-canvas-subtle text-obsidian-slate'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Search & Control Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Real-time Search Input with Clear Button */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-obsidian-slate absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) =>
              setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            placeholder="Search weaves, fabric, SKU (e.g. KZ-SR-001), color..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white border border-canvas-border text-xs sm:text-sm text-obsidian placeholder:text-obsidian-slate/70 focus:outline-none focus:border-brass-dark focus:ring-1 focus:ring-brass-dark transition-all shadow-sm"
          />
          {filterState.searchQuery && (
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-slate hover:text-obsidian p-0.5"
              title="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls: Quick Price Chips & Filter Drawer Toggle */}
        <div className="flex items-center gap-2.5 justify-between md:justify-end">
          {/* Price Quick Chips */}
          <div className="hidden lg:flex items-center gap-1.5">
            {PRICE_QUICK_CHIPS.map((chip, idx) => {
              const isSelected = filterState.maxPrice === chip.max;
              return (
                <button
                  key={idx}
                  onClick={() => handlePriceChipSelect(chip)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide tabular-nums transition-colors ${
                    isSelected
                      ? 'bg-brass text-emerald-950 font-semibold shadow-sm'
                      : 'bg-white hover:bg-canvas-subtle text-obsidian-slate border border-canvas-border'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center bg-white border border-canvas-border rounded-full px-3 py-1.5 shadow-sm text-xs text-obsidian">
            <ArrowUpDown className="w-3.5 h-3.5 text-obsidian-slate mr-1.5 pointer-events-none" />
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-950 text-brass-light text-xs font-medium tracking-wide border border-brass/30 hover:bg-emerald-900 transition-colors shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brass" />
            <span>Filters</span>
            {filterState.subCategory !== 'All' || filterState.maxPrice < 25000 ? (
              <span className="w-2 h-2 rounded-full bg-brass"></span>
            ) : null}
          </button>

          {/* Reset Filters Pill */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-xs text-brass-dark hover:text-emerald-950 underline underline-offset-4 font-medium transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Weave / Subcategory Chips */}
      {availableSubCategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] uppercase tracking-wider text-obsidian-slate shrink-0 mr-1 font-medium">
            Weave / Fabric:
          </span>
          <button
            onClick={() => setFilterState((prev) => ({ ...prev, subCategory: 'All' }))}
            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterState.subCategory === 'All'
                ? 'bg-emerald-900 text-brass-light'
                : 'bg-canvas-subtle hover:bg-canvas-border text-obsidian'
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
                    ? 'bg-emerald-900 text-brass-light'
                    : 'bg-canvas-subtle hover:bg-canvas-border text-obsidian border border-canvas-border'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-brass" />}
                <span>{sub}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Result Counter */}
      <div className="flex items-center justify-between text-xs text-obsidian-slate pt-1">
        <span>
          Displaying <strong className="font-semibold text-obsidian tabular-nums">{filteredProducts.length}</strong> of{' '}
          <span className="tabular-nums">{products.length}</span> designer pieces
        </span>
        {filterState.category !== 'All' && (
          <span className="text-[11px] font-medium text-brass-dark uppercase tracking-wider">
            {filterState.category}
          </span>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
