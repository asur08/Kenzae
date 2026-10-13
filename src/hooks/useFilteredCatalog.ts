import { useMemo } from 'react';
import { KenzaeProduct, CatalogFilterState } from '../types/catalog';

// Textile synonym expansion dictionary according to sop_catalog_filtering.md
const TEXTILE_SYNONYMS: Record<string, string[]> = {
  kasavu: ['kasavu', 'kerala', 'handloom', 'gold', 'zari', 'temple', 'organza'],
  katan: ['katan', 'banarasi', 'kadwa', 'silk', 'pure silk'],
  banarasi: ['banarasi', 'katan', 'kadwa', 'brocade', 'zari'],
  tussar: ['tussar', 'ghicha', 'kosa', 'madhubani', 'raw silk'],
  churidar: ['churidar', 'salwar', 'anarkali', 'suit'],
  salwar: ['salwar', 'churidar', 'suit', 'mulmul', 'ajrakh'],
  anarkali: ['anarkali', 'chanderi', 'zardozi', 'flair'],
  unstitched: ['unstitched', 'dress material', 'material', 'fabric', 'suit piece'],
  material: ['material', 'unstitched', 'fabric', 'suit piece'],
  kurthi: ['kurthi', 'kurti', 'tunic', 'ready-to-wear'],
  kurti: ['kurthi', 'kurti', 'tunic', 'ready-to-wear'],
};

export function useFilteredCatalog(
  products: KenzaeProduct[],
  filterState: CatalogFilterState,
  debouncedSearchQuery: string
): KenzaeProduct[] {
  return useMemo(() => {
    return products
      .filter((p) => {
        // Stage 1: Category Filter
        if (filterState.category !== 'All' && p.category !== filterState.category) {
          return false;
        }

        // Stage 2: Price Range Filter
        if (p.price > filterState.maxPrice) {
          return false;
        }

        // Stage 3: Fabric / SubCategory Filter
        if (filterState.subCategory !== 'All') {
          const targetSub = filterState.subCategory.toLowerCase();
          const matchSub = (p.subCategory || '').toLowerCase().includes(targetSub);
          const matchFabric = (p.fabricDetails || '').toLowerCase().includes(targetSub);
          if (!matchSub && !matchFabric) {
            return false;
          }
        }

        // Stage 4: Multi-Word Fuzzy Search Query
        const query = debouncedSearchQuery.trim().toLowerCase();
        if (query) {
          const tokens = query.split(/\s+/).filter(Boolean);
          
          // Target string representing all searchable metadata for product
          const corpus = [
            p.title,
            p.sku,
            p.category,
            p.subCategory || '',
            p.fabricDetails || '',
            p.description || '',
            p.color || '',
          ]
            .join(' ')
            .toLowerCase();

          // Every token must match directly or through textile synonym expansion
          const matchesAllTokens = tokens.every((token) => {
            if (corpus.includes(token)) return true;

            // Check synonym expansion
            const synonyms = TEXTILE_SYNONYMS[token];
            if (synonyms) {
              return synonyms.some((syn) => corpus.includes(syn));
            }
            return false;
          });

          if (!matchesAllTokens) {
            return false;
          }
        }

        // Stage 5: In-Stock Toggle
        if (filterState.inStockOnly && !p.in_stock) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Stage 6: Deterministic Sort
        switch (filterState.sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'newest':
            return b.id.localeCompare(a.id);
          case 'featured':
          default:
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return a.sku.localeCompare(b.sku);
        }
      });
  }, [products, filterState, debouncedSearchQuery]);
}
