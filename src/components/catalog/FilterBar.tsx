import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { ProductCategory } from '../../types/catalog';
import { formatCurrencyINR } from '../../utils/formatters';

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
    <div className="py-3 sm:py-4 space-y-3.5 w-full max-w-full min-w-0">
      {/* Category Horizontal Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
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
              className={`whitespace-nowrap shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-[transform,background-color,border-color,color] duration-150 active:scale-[0.97] select-none ${
                isActive
                  ? 'bg-maroon-900 text-brass-light border border-maroon-900'
                  : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-border hover:border-maroon-900/30'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums transition-colors ${
                  isActive
                    ? 'bg-maroon-950/60 text-brass-light'
                    : 'bg-canvas-subtle text-obsidian-slate'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full min-w-0">
        <div className="relative flex-1 max-w-md min-w-0">
          <Search className="w-4 h-4 text-obsidian-slate absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) =>
              setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            placeholder="Search weaves, silk, SKU (e.g. KZ-SR-001)…"
            aria-label="Search the collection"
            className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white border border-canvas-field text-sm text-obsidian placeholder:text-obsidian-slate/80 focus:outline-none focus:border-maroon-850 focus:ring-2 focus:ring-maroon-850/40 transition-[border-color,box-shadow] duration-150 shadow-xs"
          />
          {filterState.searchQuery && (
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-slate hover:text-obsidian p-0.5"
              title="Clear search input"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end min-w-0">
          <div className="hidden xl:flex items-center gap-1.5">
            {PRICE_QUICK_CHIPS.map((chip, idx) => {
              const isSelected = filterState.maxPrice === chip.max;
              return (
                <button
                  key={idx}
                  onClick={() => handlePriceChipSelect(chip)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide tabular-nums transition-[transform,background-color] duration-150 active:scale-[0.97] ${
                    isSelected
                      ? 'bg-maroon-900 text-brass-light font-semibold shadow-xs'
                      : 'bg-white hover:bg-canvas-subtle text-obsidian-slate border border-canvas-border'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center bg-white border border-canvas-field rounded-full px-3 py-1.5 shadow-xs text-xs text-obsidian focus-within:ring-2 focus-within:ring-maroon-850/40">
            <ArrowUpDown className="w-3.5 h-3.5 text-obsidian-slate mr-1.5 pointer-events-none shrink-0" />
            <select
              value={filterState.sortBy}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  sortBy: e.target.value as typeof prev.sortBy,
                }))
              }
              aria-label="Sort products"
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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-maroon-900 text-brass-light text-xs font-medium tracking-wide border border-brass/30 hover:bg-maroon-850 active:scale-[0.97] transition-[transform,background-color] duration-150 shadow-xs shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brass" />
            <span>Filters</span>
            {filterState.subCategory !== 'All' || filterState.maxPrice < 25000 || filterState.inStockOnly ? (
              <span className="w-2 h-2 rounded-full bg-brass" />
            ) : null}
          </button>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-xs text-maroon-900 hover:text-maroon-800 underline underline-offset-4 font-medium active:scale-[0.97] transition-[color,background-color,border-color,box-shadow,opacity,transform]"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Weave / Subcategory Chips */}
      {availableSubCategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 w-full max-w-full">
          <span className="text-[10px] text-obsidian-slate shrink-0 mr-1 font-semibold">
            Weave:
          </span>
          <button
            onClick={() => setFilterState((prev) => ({ ...prev, subCategory: 'All' }))}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-[transform,background-color] duration-150 active:scale-[0.97] ${
              filterState.subCategory === 'All'
                ? 'bg-maroon-900 text-brass-light'
                : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-border'
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
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-[transform,background-color] duration-150 active:scale-[0.97] flex items-center gap-1 ${
                  isSelected
                    ? 'bg-maroon-900 text-brass-light'
                    : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-border'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-brass" />}
                <span>{sub}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Filter Summary + Result Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-obsidian-slate pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            Showing <strong className="font-semibold text-obsidian tabular-nums">{filteredProducts.length}</strong> of{' '}
            <span className="tabular-nums">{products.length}</span> designer pieces
          </span>

          {filterState.maxPrice < 25000 && (
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, maxPrice: 25000 }))}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-maroon-50 text-maroon-900 border border-maroon-200 text-[11px] font-medium hover:bg-maroon-100"
            >
              <span>Under {formatCurrencyINR(filterState.maxPrice)}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {filterState.inStockOnly && (
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, inStockOnly: false }))}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-maroon-50 text-maroon-900 border border-maroon-200 text-[11px] font-medium hover:bg-maroon-100"
            >
              <span>In Stock Only</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {filterState.category !== 'All' && (
          <span className="text-[11px] font-semibold text-maroon-900 ">
            {filterState.category}
          </span>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
