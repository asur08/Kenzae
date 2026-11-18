import React, { useState, useEffect, Suspense, lazy } from 'react';
import { MotionConfig } from 'framer-motion';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { StaffAuthProvider } from './context/StaffAuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CollectionShowcase } from './components/CollectionShowcase';
import { FilterBar } from './components/catalog/FilterBar';
import { ProductGrid } from './components/ProductGrid';
import { AtelierStory } from './components/AtelierStory';
import { ProductModal } from './components/ProductModal';
import { WishlistDrawer } from './components/catalog/WishlistDrawer';
import { FilterDrawer } from './components/catalog/FilterDrawer';
import { CartDrawer } from './components/cart/CartDrawer';
import { MobileCheckoutModal } from './components/cart/MobileCheckoutModal';
import { MobileBottomBar } from './components/mobile/MobileBottomBar';
import { StoreLocator } from './components/StoreLocator';
import { Footer } from './components/Footer';

const StaffPortalPage = lazy(() => import('./components/staff/StaffPortalPage'));

const CustomerStorefront: React.FC = () => {
  const { filteredProducts } = useCatalog();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-obsidian pb-16 sm:pb-0">
      {/* Sticky Header with Architectural Centered Wordmark */}
      <Navbar />

      {/* Royal Maroon Editorial Hero with Live Featured Piece */}
      <Hero />

      {/* 4-Category Visual Collection Entry */}
      <CollectionShowcase />

      {/* Main Catalog Section */}
      <main id="catalog-section" className="flex-1 py-6 sm:py-10">
        <div className="container mx-auto px-4">
          <FilterBar />
          <ProductGrid products={filteredProducts} />
        </div>
      </main>

      {/* Craftsmanship, Tailoring & Video Drape Story */}
      <AtelierStory />

      {/* Store Visit & Map */}
      <StoreLocator />

      {/* Boutique Footer */}
      <Footer />

      {/* Overlays: Quick-View Modal (Deep-Linked), Wishlist, Bag, Filters, Checkout */}
      <ProductModal />
      <WishlistDrawer />
      <FilterDrawer />
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <MobileCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Mobile-First Sticky Bottom Ergonomic Navigation Bar */}
      <MobileBottomBar />
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

  const isStaffRoute =
    currentPath === '/staff' ||
    currentPath.startsWith('/staff/') ||
    window.location.hash === '#staff';

  if (isStaffRoute) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-maroon-950 font-serif text-lg tracking-widest uppercase">
            Loading Kenzae Staff Portal...
          </div>
        }
      >
        <StaffPortalPage onReturnToStore={() => navigateTo('/')} />
      </Suspense>
    );
  }

  return <CustomerStorefront />;
};

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <CatalogProvider>
        <CartProvider>
          <OrdersProvider>
            <StaffAuthProvider>
              <MainRouter />
            </StaffAuthProvider>
          </OrdersProvider>
        </CartProvider>
      </CatalogProvider>
    </MotionConfig>
  );
}

export default App;
