import React from 'react';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { Header } from './components/layout/Header';
import { HeroBanner } from './components/hero/HeroBanner';
import { CategoryTabs } from './components/catalog/CategoryTabs';
import { FilterBar } from './components/catalog/FilterBar';
import { ProductCard } from './components/catalog/ProductCard';
import { ProductDetailModal } from './components/catalog/ProductDetailModal';
import { WishlistDrawer } from './components/catalog/WishlistDrawer';
import { FilterDrawer } from './components/catalog/FilterDrawer';
import { StoreLocationCard } from './components/location/StoreLocationCard';
import { CatalogManagerModal } from './components/admin/CatalogManagerModal';
import { Footer } from './components/layout/Footer';
import { Sparkles, MessageCircle, RefreshCw } from 'lucide-react';
import { generateStoreVisitWhatsAppUrl } from './utils/whatsapp';

const CatalogContent: React.FC = () => {
  const { filteredProducts, resetFilters } = useCatalog();

  const handleFloatingWhatsApp = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-obsidian">
      {/* Header with Navigation & Brand Insignia */}
      <Header />

      {/* Hero Banner with Editorial Visuals & Heritage */}
      <HeroBanner />

      {/* Main Catalog Section */}
      <main id="catalog-section" className="flex-1 py-6 sm:py-10">
        {/* Sticky Category Tabs */}
        <CategoryTabs />

        <div className="container mx-auto px-4 mt-4">
          {/* Search, Filter Bar & Sort Controls */}
          <FilterBar />

          {/* Product Grid or Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-canvas-subtle border border-canvas-dark mx-auto flex items-center justify-center text-obsidian-muted">
                <Sparkles className="w-7 h-7 text-gold-500" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-emerald-950">
                No matching pieces found
              </h3>
              <p className="text-xs sm:text-sm text-obsidian-muted font-light">
                We couldn't find any items matching your active criteria. Try broadening your budget or clearing fabric filters.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gold-gradient-bg text-emerald-950 text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pt-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Flagship Boutique Location in Mulanthuruthy */}
      <StoreLocationCard />

      {/* Footer */}
      <Footer />

      {/* Overlays, Drawers & Modals */}
      <ProductDetailModal />
      <WishlistDrawer />
      <FilterDrawer />
      <CatalogManagerModal />

      {/* Floating Mobile WhatsApp Quick Button */}
      <div className="fixed bottom-5 right-5 z-30 sm:hidden">
        <button
          onClick={handleFloatingWhatsApp}
          className="p-3.5 rounded-full bg-whatsapp text-white shadow-xl flex items-center justify-center border-2 border-white active:scale-95 transition-transform"
          aria-label="Direct WhatsApp Inquiry"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export function App() {
  return (
    <CatalogProvider>
      <CatalogContent />
    </CatalogProvider>
  );
}

export default App;
