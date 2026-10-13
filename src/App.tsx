import React from 'react';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryTabs } from './components/catalog/CategoryTabs';
import { FilterBar } from './components/catalog/FilterBar';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { WishlistDrawer } from './components/catalog/WishlistDrawer';
import { FilterDrawer } from './components/catalog/FilterDrawer';
import { StoreLocator } from './components/StoreLocator';
import { CatalogManagerModal } from './components/admin/CatalogManagerModal';
import { Footer } from './components/Footer';
import { MessageCircle } from 'lucide-react';
import { generateStoreVisitWhatsAppUrl } from './utils/whatsapp';

const CatalogContent: React.FC = () => {
  const { filteredProducts } = useCatalog();

  const handleFloatingWhatsApp = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-obsidian">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Showcase */}
      <Hero />

      {/* Main Catalog Section */}
      <main id="catalog-section" className="flex-1 py-6 sm:py-10">
        {/* Sticky Category Tabs */}
        <CategoryTabs />

        <div className="container mx-auto px-4 mt-4">
          {/* Search, Filter Bar & Sort Controls */}
          <FilterBar />

          {/* Product Grid with Empty-State Handling */}
          <ProductGrid products={filteredProducts} />
        </div>
      </main>

      {/* Flagship Boutique Location in Mulanthuruthy */}
      <StoreLocator />

      {/* Footer */}
      <Footer />

      {/* Overlays, Drawers & Deep-Linked Modal */}
      <ProductModal />
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
