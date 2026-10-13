import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { KenzaeProduct, CatalogFilterState } from '../types/catalog';
import defaultProducts from '../../data/products.json';
import { validateCatalog, validateProduct } from '../data/catalogValidator';

interface CatalogContextType {
  products: KenzaeProduct[];
  filteredProducts: KenzaeProduct[];
  filterState: CatalogFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<CatalogFilterState>>;
  resetFilters: () => void;
  
  // Selection / Modal state
  selectedProduct: KenzaeProduct | null;
  setSelectedProduct: (product: KenzaeProduct | null) => void;
  
  // Wishlist state
  wishlistIds: string[];
  wishlistProducts: KenzaeProduct[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (product: KenzaeProduct) => void;
  clearWishlist: () => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (isOpen: boolean) => void;

  // Filter drawer state
  isFilterDrawerOpen: boolean;
  setIsFilterDrawerOpen: (isOpen: boolean) => void;

  // Catalog manager state (Staff CMS Mode)
  isManagerOpen: boolean;
  setIsManagerOpen: (isOpen: boolean) => void;
  addProduct: (product: KenzaeProduct) => { success: boolean; error?: string };
  updateProduct: (product: KenzaeProduct) => { success: boolean; error?: string };
  deleteProduct: (id: string) => void;
  resetToDefaultCatalog: () => void;
  exportCatalogJSON: () => void;
  importCatalogJSON: (jsonString: string) => { success: boolean; count?: number; error?: string };

  // Subcategories available in current dataset
  availableSubCategories: string[];
}

const STORAGE_KEY_PRODUCTS = 'kenzae_boutique_products_v1';
const STORAGE_KEY_WISHLIST = 'kenzae_boutique_wishlist_v1';

const initialFilterState: CatalogFilterState = {
  searchQuery: '',
  category: 'All',
  subCategory: 'All',
  maxPrice: 25000,
  inStockOnly: false,
  sortBy: 'featured',
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load products: LocalStorage override if staff edited, else default products.json
  const [products, setProducts] = useState<KenzaeProduct[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validation = validateCatalog(parsed);
        if (validation.isValid) {
          return parsed as KenzaeProduct[];
        }
      }
    } catch {
      // Fallback to default
    }
    return defaultProducts as KenzaeProduct[];
  });

  // Wishlist state persisted in localStorage
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WISHLIST);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [filterState, setFilterState] = useState<CatalogFilterState>(initialFilterState);
  const [selectedProduct, setSelectedProduct] = useState<KenzaeProduct | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  // Sync wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(wishlistIds));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlistIds]);

  // Sync products to LocalStorage when modified
  const saveProducts = (newProducts: KenzaeProduct[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(newProducts));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  };

  const isWishlisted = (id: string) => wishlistIds.includes(id);

  const toggleWishlist = (product: KenzaeProduct) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((item) => item !== product.id);
      } else {
        return [...prev, product.id];
      }
    });
  };

  const clearWishlist = () => {
    setWishlistIds([]);
  };

  const resetFilters = () => {
    setFilterState(initialFilterState);
  };

  // Extract all distinct subCategories based on current selection or all
  const availableSubCategories = useMemo(() => {
    const pool = filterState.category === 'All' 
      ? products 
      : products.filter(p => p.category === filterState.category);
    
    const set = new Set<string>();
    pool.forEach(p => {
      if (p.subCategory) {
        set.add(p.subCategory.trim());
      }
    });
    return Array.from(set).sort();
  }, [products, filterState.category]);

  // Wishlist products resolution
  const wishlistProducts = useMemo(() => {
    return products.filter((p) => wishlistIds.includes(p.id));
  }, [products, wishlistIds]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (filterState.category !== 'All' && p.category !== filterState.category) {
          return false;
        }

        // Subcategory filter
        if (filterState.subCategory !== 'All' && p.subCategory !== filterState.subCategory) {
          return false;
        }

        // Price filter
        if (p.price > filterState.maxPrice) {
          return false;
        }

        // In-stock only filter
        if (filterState.inStockOnly && !p.in_stock) {
          return false;
        }

        // Search query filter (search across title, sku, fabric, description, color)
        if (filterState.searchQuery.trim()) {
          const q = filterState.searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchFabric = (p.fabricDetails || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchColor = (p.color || '').toLowerCase().includes(q);
          const matchSub = (p.subCategory || '').toLowerCase().includes(q);

          if (!matchTitle && !matchSku && !matchFabric && !matchDesc && !matchColor && !matchSub) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
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
            return 0;
        }
      });
  }, [products, filterState]);

  // Catalog Manager actions
  const addProduct = (newProduct: KenzaeProduct) => {
    const val = validateProduct(newProduct);
    if (!val.isValid) {
      return { success: false, error: val.error };
    }
    if (products.some(p => p.id === newProduct.id || p.sku.toLowerCase() === newProduct.sku.toLowerCase())) {
      return { success: false, error: 'A product with this ID or SKU already exists.' };
    }
    const updated = [newProduct, ...products];
    saveProducts(updated);
    return { success: true };
  };

  const updateProduct = (updatedProduct: KenzaeProduct) => {
    const val = validateProduct(updatedProduct);
    if (!val.isValid) {
      return { success: false, error: val.error };
    }
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    saveProducts(updated);
    if (selectedProduct && selectedProduct.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }
    return { success: true };
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
    }
  };

  const resetToDefaultCatalog = () => {
    saveProducts(defaultProducts as KenzaeProduct[]);
  };

  const exportCatalogJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'kenzae_products.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importCatalogJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const validation = validateCatalog(parsed);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join('; ') };
      }
      saveProducts(parsed as KenzaeProduct[]);
      return { success: true, count: parsed.length };
    } catch {
      return { success: false, error: 'Malformed JSON input file.' };
    }
  };

  return (
    <CatalogContext.Provider
      value={{
        products,
        filteredProducts,
        filterState,
        setFilterState,
        resetFilters,
        selectedProduct,
        setSelectedProduct,
        wishlistIds,
        wishlistProducts,
        isWishlisted,
        toggleWishlist,
        clearWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        isFilterDrawerOpen,
        setIsFilterDrawerOpen,
        isManagerOpen,
        setIsManagerOpen,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefaultCatalog,
        exportCatalogJSON,
        importCatalogJSON,
        availableSubCategories,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
