import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { ProductCategory } from '../../types/catalog';
import { formatCurrencyINR } from '../../utils/formatters';

const CATEGORIES: { label: string; value: ProductCategory | 'All' }[] = [
  { label: 'All items', value: 'All' },
  { label: 'Saris', value: 'Saris' },
  { label: 'Churidars & salwar sets', value: 'Churidars & Salwar Sets' },
  { label: 'Dress materials', value: 'Unstitched Dress Materials' },
  { label: 'Kurthis', value: 'Kurthis & Ready-to-Wear' },
];

const PRICE_QUICK_CHIPS = [
  { label: 'All prices', min: 0, max: 25000 },
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-canvas-border bg-canvas space-y-4 w-full min-w-0">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full">
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
              className={`whitespace-nowrap shrink-0 flex items-center gap-2 px-3.5 h-9 rounded-[8px] text-[13px] font-medium transition-[transform,background-color,border-color,color] duration-150 active:scale-[0.98] select-none ${
                isActive
                  ? 'bg-maroon-900 text-white border border-maroon-900'
                  : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-border'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-xs tabular-nums ${
                  isActive ? 'text-white/80' : 'text-obsidian-muted'
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
          <Search
            className="w-4 h-4 text-obsidian-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) =>
              setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            placeholder="Search by weave or SKU"
            className="w-full h-10 pl-10 pr-9 rounded-[8px] bg-white border border-canvas-border text-[14px] text-obsidian placeholder:text-obsidian-muted focus:outline-none focus:border-maroon-900 transition-colors duration-150"
          />
          {filterState.searchQuery && (
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-muted hover:text-obsidian p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
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
                  className={`px-3 h-9 rounded-[8px] text-xs font-medium tabular-nums transition-[transform,background-color,border-color] duration-150 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-maroon-900 text-white border border-maroon-900'
                      : 'bg-white hover:bg-canvas-subtle text-obsidian-slate border border-canvas-border'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="relative flex items-center bg-white border border-canvas-border rounded-[8px] h-9 px-3 text-[13px] text-obsidian">
            <ArrowUpDown
              className="w-4 h-4 text-obsidian-muted mr-2 pointer-events-none shrink-0"
              strokeWidth={1.5}
            />
            <select
              value={filterState.sortBy}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  sortBy: e.target.value as typeof prev.sortBy,
                }))
              }
              aria-label="Sort products"
              className="bg-transparent text-[13px] font-medium text-obsidian focus:outline-none cursor-pointer pr-1"
            >
              <option value="featured">Featured collection</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="newest">Latest arrivals</option>
            </select>
          </div>

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 h-9 rounded-[8px] bg-white hover:bg-canvas-subtle text-obsidian text-[13px] font-medium border border-canvas-border active:scale-[0.98] transition-[transform,background-color] duration-150 shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-obsidian-muted" strokeWidth={1.5} />
            <span>Filters</span>
            {(filterState.subCategory !== 'All' ||
              filterState.maxPrice < 25000 ||
              filterState.inStockOnly) && (
              <span className="w-1.5 h-1.5 rounded-full bg-maroon-900" />
            )}
          </button>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="px-2 h-9 text-[13px] text-maroon-900 hover:text-maroon-800 underline underline-offset-4 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Weave / Subcategory Row */}
      {availableSubCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full">
          <span className="text-xs text-obsidian-muted shrink-0 mr-1 font-medium">
            Weave
          </span>
          <button
            onClick={() => setFilterState((prev) => ({ ...prev, subCategory: 'All' }))}
            className={`px-3 h-8 rounded-[6px] text-xs font-medium whitespace-nowrap shrink-0 transition-[transform,background-color] duration-150 active:scale-[0.98] ${
              filterState.subCategory === 'All'
                ? 'bg-obsidian text-white'
                : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-border'
            }`}
          >
            All weaves
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
                className={`px-3 h-8 rounded-[6px] text-xs font-medium whitespace-nowrap shrink-0 transition-[transform,background-color] duration-150 active:scale-[0.98] flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-obsidian text-white'
                    : 'bg-white hover:bg-canvas-subtle text-obsidian border border-canvas-border'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={1.5} />}
                <span>{sub}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Filter Summary + Result Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-obsidian-slate pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            Showing <strong className="font-medium text-obsidian tabular-nums">{filteredProducts.length}</strong> of{' '}
            <span className="tabular-nums">{products.length}</span> pieces
          </span>

          {filterState.maxPrice < 25000 && (
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, maxPrice: 25000 }))}
              className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-[6px] bg-white text-obsidian border border-canvas-border text-xs font-medium hover:bg-canvas-subtle"
            >
              <span>Under {formatCurrencyINR(filterState.maxPrice)}</span>
              <X className="w-3.5 h-3.5 text-obsidian-muted" strokeWidth={1.5} />
            </button>
          )}

          {filterState.inStockOnly && (
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, inStockOnly: false }))}
              className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-[6px] bg-white text-obsidian border border-canvas-border text-xs font-medium hover:bg-canvas-subtle"
            >
              <span>In stock only</span>
              <X className="w-3.5 h-3.5 text-obsidian-muted" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {filterState.category !== 'All' && (
          <span className="text-xs font-medium text-maroon-900">
            {filterState.category}
          </span>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
