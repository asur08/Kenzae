import React, { useState, useEffect } from 'react';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { StaffAuthProvider } from './context/StaffAuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FilterBar } from './components/catalog/FilterBar';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { WishlistDrawer } from './components/catalog/WishlistDrawer';
import { FilterDrawer } from './components/catalog/FilterDrawer';
import { StoreLocator } from './components/StoreLocator';
import { Footer } from './components/Footer';
import { StaffPortalPage } from './components/staff/StaffPortalPage';
import { MessageCircle } from 'lucide-react';
import { generateStoreVisitWhatsAppUrl } from './utils/whatsapp';

const CustomerStorefront: React.FC = () => {
  const { filteredProducts } = useCatalog();

  const handleFloatingWhatsApp = () => {
    window.open(generateStoreVisitWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-obsidian">
      {/* Sticky Header with Frosted Glass & Centered Luxury Wordmark */}
      <Navbar />

      {/* Editorial Hero with Raw Mango/Sabyasachi inspired aesthetic */}
      <Hero />

      {/* Main Catalog Section */}
      <main id="catalog-section" className="flex-1 py-6 sm:py-10">
        <div className="container mx-auto px-4">
          {/* Unified Sticky Filter Bar: Category Pills, Price Chips, Search & Results */}
          <FilterBar />

          {/* 3:4 Crop Product Grid with Empty-State Handling */}
          <ProductGrid products={filteredProducts} />
        </div>
      </main>

      {/* Store Visit & Responsive Google Map centered on Mulanthuruthy */}
      <StoreLocator />

      {/* Boutique Footer with subtle Staff Access link */}
      <Footer />

      {/* Overlays: Quick-View Modal (Deep-Linked), Wishlist, Filters */}
      <ProductModal />
      <WishlistDrawer />
      <FilterDrawer />

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

const MainRouter: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname;
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route: /staff or #staff
  const isStaffRoute = 
    currentPath === '/staff' || 
    currentPath.startsWith('/staff/') || 
    window.location.hash === '#staff';

  if (isStaffRoute) {
    return <StaffPortalPage onReturnToStore={() => navigateTo('/')} />;
  }

  return <CustomerStorefront />;
};

export function App() {
  return (
    <CatalogProvider>
      <StaffAuthProvider>
        <MainRouter />
      </StaffAuthProvider>
    </CatalogProvider>
  );
}

export default App;
