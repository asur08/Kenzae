import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Check, 
  X, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  ExternalLink, 
  LogOut, 
  Star, 
  Tag, 
  Layers, 
  Package, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { KenzaeProduct, ProductCategory } from '../../types/catalog';
import { formatCurrencyINR } from '../../utils/formatters';
import { ProductEditModal } from './ProductEditModal';

interface StaffDashboardProps {
  onReturnToStore: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Saris',
  'Churidars & Salwar Sets',
  'Unstitched Dress Materials',
  'Kurthis & Ready-to-Wear',
];

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onReturnToStore }) => {
  const {
    products,
    addProduct,
    updateProduct,
    updateProductPrice,
    deleteProduct,
    renameTag,
    resetToDefaultCatalog,
    exportCatalogJSON,
    importCatalogJSON,
  } = useCatalog();

  const { logout } = useStaffAuth();

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'tags' | 'backup'>('inventory');

  // Search & Filters inside staff dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');

  // Inline price editing state: maps productId -> current numeric input string
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<string>('');

  // Full product editing modal state
  const [modalProduct, setModalProduct] = useState<KenzaeProduct | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Status notification notice
  const [notice, setNotice] = useState<{ message: string; isError?: boolean } | null>(null);

  // New product form state
  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    category: 'Saris' as ProductCategory,
    subCategory: '',
    price: 3500,
    fabricDetails: '',
    color: '',
    description: '',
    image1: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    image2: '',
    in_stock: true,
    isFeatured: false,
  });

  // Tag rename form state
  const [tagToRename, setTagToRename] = useState<string>('');
  const [newTagName, setNewTagName] = useState<string>('');

  // Import JSON state
  const [importJsonText, setImportJsonText] = useState('');

  const showNotice = (message: string, isError = false) => {
    setNotice({ message, isError });
    setTimeout(() => setNotice(null), 4000);
  };

  // KPIs
  const totalValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.price || 0), 0);
  }, [products]);

  const inStockCount = useMemo(() => {
    return products.filter((p) => p.in_stock).length;
  }, [products]);

  const outOfStockCount = products.length - inStockCount;

  // Unique tags across all products
  const tagBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.subCategory && p.subCategory.trim()) {
        const tag = p.subCategory.trim();
        counts[tag] = (counts[tag] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [products]);

  // Filtered inventory for staff view
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (stockFilter === 'in_stock' && !p.in_stock) return false;
      if (stockFilter === 'out_of_stock' && p.in_stock) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSku = p.sku.toLowerCase().includes(query);
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesTag = p.subCategory?.toLowerCase().includes(query);
        const matchesFabric = p.fabricDetails?.toLowerCase().includes(query);
        return matchesSku || matchesTitle || matchesTag || matchesFabric;
      }
      return true;
    });
  }, [products, selectedCategory, stockFilter, searchQuery]);

  // Auto-generate SKU when Category changes in Add form
  const generateSkuForCategory = (category: ProductCategory): string => {
    const prefixes: Record<ProductCategory, string> = {
      'Saris': 'KZ-SR',
      'Churidars & Salwar Sets': 'KZ-CH',
      'Unstitched Dress Materials': 'KZ-DM',
      'Kurthis & Ready-to-Wear': 'KZ-KT',
    };
    const prefix = prefixes[category] || 'KZ-GN';
    const categoryCount = products.filter(p => p.category === category).length + 1;
    return `${prefix}-${String(categoryCount).padStart(3, '0')}`;
  };

  const handleStartAdd = () => {
    const nextSku = generateSkuForCategory(formData.category);
    setFormData((prev) => ({
      ...prev,
      sku: nextSku,
    }));
    setActiveTab('add');
  };

  // Inline Price Edit Handlers
  const handleStartPriceEdit = (product: KenzaeProduct) => {
    setEditingPriceId(product.id);
    setTempPriceValue(String(product.price));
  };

  const handleSavePriceEdit = (productId: string) => {
    const numPrice = Number(tempPriceValue);
    if (isNaN(numPrice) || numPrice <= 0) {
      showNotice('Please enter a valid price in ₹', true);
      return;
    }
    const res = updateProductPrice(productId, numPrice);
    if (res.success) {
      showNotice(`Updated price to ${formatCurrencyINR(numPrice)}`);
      setEditingPriceId(null);
    } else {
      showNotice(res.error || 'Failed to update price', true);
    }
  };

  const handleCancelPriceEdit = () => {
    setEditingPriceId(null);
    setTempPriceValue('');
  };

  // Create Product Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const images: string[] = [formData.image1.trim()];
    if (formData.image2.trim()) {
      images.push(formData.image2.trim());
    }

    const newProd: KenzaeProduct = {
      id: formData.sku.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      sku: formData.sku.trim(),
      title: formData.title.trim(),
      category: formData.category,
      subCategory: formData.subCategory.trim() || undefined,
      price: Math.round(Number(formData.price)),
      currency: 'INR',
      description: formData.description.trim() || undefined,
      fabricDetails: formData.fabricDetails.trim() || undefined,
      color: formData.color.trim() || undefined,
      images,
      in_stock: formData.in_stock,
      isFeatured: formData.isFeatured,
      whatsappMessage: `Hello Kenzae Boutique, I am inquiring about ${formData.title} (${formData.sku}) at ₹${formData.price}.`,
    };

    const res = addProduct(newProd);
    if (res.success) {
      showNotice(`Added piece ${newProd.sku}: ${newProd.title}`);
      setActiveTab('inventory');
      setFormData({
        title: '',
        sku: '',
        category: 'Saris',
        subCategory: '',
        price: 3500,
        fabricDetails: '',
        color: '',
        description: '',
        image1: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
        image2: '',
        in_stock: true,
        isFeatured: false,
      });
    } else {
      showNotice(res.error || 'Failed to add piece', true);
    }
  };

  // Tag rename submit
  const handleRenameTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagToRename || !newTagName.trim()) return;

    const res = renameTag(tagToRename, newTagName.trim());
    if (res.success) {
      showNotice(`Updated "${tagToRename}" to "${newTagName.trim()}" across ${res.count} piece(s)!`);
      setTagToRename('');
      setNewTagName('');
    } else {
      showNotice('Failed to rename tag.', true);
    }
  };

  // Import JSON Submit
  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const res = importCatalogJSON(importJsonText);
    if (res.success) {
      showNotice(`Successfully imported ${res.count} products!`);
      setActiveTab('inventory');
      setImportJsonText('');
    } else {
      showNotice(res.error || 'Failed to import JSON.', true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col text-obsidian">
      {/* Top Staff Navigation Header */}
      <header className="sticky top-0 z-30 bg-emerald-950 text-white border-b border-brass/30 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-normal tracking-[0.25em] text-brass uppercase">
                  KENZAE
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-emerald-900 text-brass-light border border-brass/30">
                  Staff Console
                </span>
              </div>
              <span className="text-[10px] text-white/70 tracking-wider">
                Mulanthuruthy Boutique Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs">
            <button
              onClick={onReturnToStore}
              className="px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-850 text-brass-light hover:text-white transition-colors flex items-center gap-1.5 border border-brass/20"
              title="Return to Customer Storefront"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Storefront</span>
            </button>

            <button
              onClick={exportCatalogJSON}
              className="px-3 py-1.5 rounded-lg bg-brass-dark hover:bg-brass text-emerald-950 font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              title="Download products.json for Git or Backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>

            <button
              onClick={logout}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 transition-colors flex items-center gap-1.5"
              title="Sign Out of Staff Portal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* KPI Ribbon */}
      <section className="bg-white border-b border-canvas-border py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-canvas-subtle border border-canvas-border">
              <span className="text-[10px] uppercase tracking-wider text-obsidian-slate font-bold flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-brass-dark" />
                <span>Total Catalog Pieces</span>
              </span>
              <p className="font-serif text-xl sm:text-2xl font-bold text-obsidian mt-1">
                {products.length}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>In Stock at Boutique</span>
              </span>
              <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-900 mt-1">
                {inStockCount}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] uppercase tracking-wider text-rose-800 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Reserved / Sold</span>
              </span>
              <p className="font-serif text-xl sm:text-2xl font-bold text-rose-900 mt-1">
                {outOfStockCount}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-canvas-subtle border border-canvas-border">
              <span className="text-[10px] uppercase tracking-wider text-obsidian-slate font-bold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-brass-dark" />
                <span>Total Inventory Value</span>
              </span>
              <p className="font-serif text-lg sm:text-2xl font-bold text-emerald-950 mt-1 font-mono">
                {formatCurrencyINR(totalValuation)}
              </p>
            </div>

            <div className="hidden lg:block p-3 rounded-xl bg-canvas-subtle border border-canvas-border">
              <span className="text-[10px] uppercase tracking-wider text-obsidian-slate font-bold flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-brass-dark" />
                <span>Active Fabric Weaves</span>
              </span>
              <p className="font-serif text-xl sm:text-2xl font-bold text-obsidian mt-1">
                {tagBreakdown.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tabs Navigation */}
      <div className="bg-canvas-subtle border-b border-canvas-border sticky top-[57px] z-20">
        <div className="container mx-auto px-4 flex items-center justify-between gap-3 overflow-x-auto py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'inventory'
                  ? 'bg-emerald-900 text-brass-light shadow-sm'
                  : 'bg-white text-obsidian hover:bg-canvas-border'
              }`}
            >
              Inventory & Pricing ({products.length})
            </button>

            <button
              onClick={handleStartAdd}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all ${
                activeTab === 'add'
                  ? 'bg-emerald-900 text-brass-light shadow-sm'
                  : 'bg-white text-obsidian hover:bg-canvas-border'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Piece</span>
            </button>

            <button
              onClick={() => setActiveTab('tags')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all ${
                activeTab === 'tags'
                  ? 'bg-emerald-900 text-brass-light shadow-sm'
                  : 'bg-white text-obsidian hover:bg-canvas-border'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Fabric Tags & Weaves</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all ${
                activeTab === 'backup'
                  ? 'bg-emerald-900 text-brass-light shadow-sm'
                  : 'bg-white text-obsidian hover:bg-canvas-border'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Data Sync & JSON</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset catalog to the factory default products.json? Any unsaved edits will be lost.')) {
                resetToDefaultCatalog();
                showNotice('Reset to default catalog.');
              }
            }}
            className="text-[11px] text-obsidian-slate hover:text-obsidian flex items-center gap-1 px-2 py-1 rounded hover:bg-canvas-border transition-colors shrink-0"
            title="Reset catalog to factory default"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Factory Defaults</span>
          </button>
        </div>
      </div>

      {/* Floating Notice Alert */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border ${
              notice.isError
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-emerald-950 text-brass-light border-brass/40'
            }`}
          >
            {notice.isError ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-brass shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
        </div>
      )}

      {/* Tab Contents */}
      <main className="container mx-auto px-4 py-6 flex-1">
        
        {/* TAB 1: Inventory & Quick Price Editing */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-canvas-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-obsidian-slate absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by SKU, title, fabric tag, or weave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs focus:outline-none focus:border-emerald-850 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-obsidian-slate hover:text-obsidian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs font-medium"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Stock Filter */}
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs font-medium"
                >
                  <option value="all">All Availability</option>
                  <option value="in_stock">In Stock Only</option>
                  <option value="out_of_stock">Out of Stock Only</option>
                </select>
              </div>
            </div>

            {/* Inventory List / Table */}
            <div className="bg-white rounded-xl border border-canvas-border shadow-sm overflow-hidden divide-y divide-canvas-border">
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-obsidian-slate space-y-2">
                  <Package className="w-8 h-8 mx-auto text-brass-dark" />
                  <p className="text-sm font-semibold">No products match current filters.</p>
                  <p className="text-xs">Adjust your search query or reset category filter.</p>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isEditingPrice = editingPriceId === p.id;

                  return (
                    <div
                      key={p.id}
                      className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-canvas-subtle/50 transition-colors"
                    >
                      {/* Product Overview */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-14 h-16 rounded-lg object-cover object-top border border-canvas-border shrink-0 bg-canvas-subtle"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              {p.sku}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-canvas-subtle text-obsidian-slate border border-canvas-border">
                              {p.category}
                            </span>
                            {p.subCategory && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-brass/10 text-brass-dark border border-brass/20 font-medium truncate max-w-[150px]">
                                {p.subCategory}
                              </span>
                            )}
                            {p.isFeatured && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Featured</span>
                              </span>
                            )}
                          </div>

                          <h4 className="font-serif text-sm font-semibold text-obsidian truncate mt-1">
                            {p.title}
                          </h4>

                          <p className="text-xs text-obsidian-slate truncate mt-0.5">
                            {p.fabricDetails || p.color || 'Artisanal Weave'}
                          </p>
                        </div>
                      </div>

                      {/* Pricing, Stock & Actions */}
                      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-canvas-border">
                        {/* Inline Price Editor */}
                        <div className="flex items-center gap-1.5">
                          {isEditingPrice ? (
                            <div className="flex items-center gap-1 bg-white border-2 border-emerald-800 rounded-lg p-1 shadow-sm">
                              <span className="text-xs font-bold text-obsidian pl-1">₹</span>
                              <input
                                type="number"
                                min="1"
                                value={tempPriceValue}
                                onChange={(e) => setTempPriceValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSavePriceEdit(p.id);
                                  if (e.key === 'Escape') handleCancelPriceEdit();
                                }}
                                autoFocus
                                className="w-20 px-1 text-xs font-mono font-bold focus:outline-none"
                              />
                              <button
                                onClick={() => handleSavePriceEdit(p.id)}
                                className="p-1 rounded bg-emerald-800 text-white hover:bg-emerald-700"
                                title="Save Price"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleCancelPriceEdit}
                                className="p-1 rounded bg-canvas-border text-obsidian hover:bg-canvas-dark"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => handleStartPriceEdit(p)}
                              className="group cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-lg border border-transparent hover:border-canvas-border hover:bg-canvas-subtle transition-all"
                              title="Click to edit price"
                            >
                              <span className="font-mono text-sm font-bold text-emerald-950">
                                {formatCurrencyINR(p.price)}
                              </span>
                              <Edit3 className="w-3 h-3 text-obsidian-slate opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                        </div>

                        {/* Stock Availability Toggle Button */}
                        <button
                          onClick={() => {
                            updateProduct({
                              ...p,
                              in_stock: !p.in_stock,
                            });
                            showNotice(
                              `${p.sku} marked as ${!p.in_stock ? 'In Stock' : 'Out of Stock'}`
                            );
                          }}
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase transition-all ${
                            p.in_stock
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                          }`}
                          title="Click to toggle stock status"
                        >
                          {p.in_stock ? '● In Stock' : '○ Reserved'}
                        </button>

                        {/* Featured Star Toggle */}
                        <button
                          onClick={() => {
                            updateProduct({
                              ...p,
                              isFeatured: !p.isFeatured,
                            });
                            showNotice(
                              `${p.sku} ${!p.isFeatured ? 'marked as Featured' : 'unmarked from Featured'}`
                            );
                          }}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            p.isFeatured
                              ? 'text-amber-600 bg-amber-50 border-amber-300'
                              : 'text-obsidian-slate border-transparent hover:bg-canvas-subtle'
                          }`}
                          title="Toggle Featured status"
                        >
                          <Star className={`w-4 h-4 ${p.isFeatured ? 'fill-current' : ''}`} />
                        </button>

                        {/* Full Edit Modal Trigger */}
                        <button
                          onClick={() => {
                            setModalProduct(p);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-obsidian hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
                          title="Edit full piece specifications"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${p.sku} (${p.title}) from the catalog?`)) {
                              deleteProduct(p.id);
                              showNotice(`Deleted ${p.sku}`);
                            }
                          }}
                          className="p-1.5 rounded-lg text-obsidian-slate hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Delete piece"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Add New Piece */}
        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-canvas-border shadow-sm">
            <div className="mb-6 pb-4 border-b border-canvas-border">
              <h3 className="font-serif text-xl font-bold text-emerald-950">
                Add New Boutique Piece
              </h3>
              <p className="text-xs text-obsidian-slate mt-1">
                Enter details for a new handwoven sari, churidar set, unstitched material, or kurthi.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value as ProductCategory;
                      setFormData({
                        ...formData,
                        category: newCat,
                        sku: generateSkuForCategory(newCat),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs font-semibold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                    SKU Code * (Auto-suggested)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Tissue Kanjivaram Silk Sari in Champagne Gold"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs font-mono font-bold text-emerald-950"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                    SubCategory / Weave Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Banarasi Katan / Organza / Linen"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                    Color / Shade Palette
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Coral Pink & Antique Gold"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                    Fabric Details & Length
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Pure Mulberry Silk, 5.5m + Blouse"
                    value={formData.fabricDetails}
                    onChange={(e) => setFormData({ ...formData, fabricDetails: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                  Primary Photo URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.image1}
                  onChange={(e) => setFormData({ ...formData, image1: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                  Secondary Drape Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image2}
                  onChange={(e) => setFormData({ ...formData, image2: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                  Editorial Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Boutique curation notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    className="w-4 h-4 accent-emerald-900 rounded"
                  />
                  <span>In Stock at Boutique</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-brass rounded"
                  />
                  <span>Mark as Featured Piece</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-canvas-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className="px-4 py-2 rounded-lg border border-canvas-border text-xs font-medium text-obsidian hover:bg-canvas-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-900 hover:bg-emerald-850 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-brass" />
                  <span>Save Piece to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: Fabric Tags & Categories */}
        {activeTab === 'tags' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Category Summary */}
            <div className="bg-white p-5 rounded-2xl border border-canvas-border shadow-sm">
              <h3 className="font-serif text-lg font-bold text-emerald-950 mb-3">
                Core Catalog Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => {
                  const count = products.filter((p) => p.category === cat).length;
                  return (
                    <div key={cat} className="p-3 rounded-xl bg-canvas-subtle border border-canvas-border">
                      <span className="text-[10px] uppercase font-bold text-obsidian-slate tracking-wider block">
                        {cat}
                      </span>
                      <p className="font-serif text-xl font-bold text-emerald-950 mt-1">
                        {count} piece{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active SubCategory & Weave Tags */}
            <div className="bg-white p-5 rounded-2xl border border-canvas-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-emerald-950">
                    Active Fabric Weaves & SubCategory Tags
                  </h3>
                  <p className="text-xs text-obsidian-slate mt-0.5">
                    Tags used to filter weaves like Banarasi, Kasavu, Organza, Tussar, etc.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-canvas-subtle px-2 py-1 rounded border border-canvas-border">
                  {tagBreakdown.length} unique tags
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {tagBreakdown.map(([tag, count]) => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-canvas-subtle border border-canvas-border text-xs"
                  >
                    <Tag className="w-3 h-3 text-brass-dark" />
                    <span className="font-medium text-obsidian">{tag}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Batch Rename Tag Form */}
              <div className="mt-6 pt-5 border-t border-canvas-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-obsidian-slate mb-2">
                  Batch Rename or Merge a Weave Tag
                </h4>
                <form onSubmit={handleRenameTagSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
                  <select
                    value={tagToRename}
                    onChange={(e) => setTagToRename(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs font-medium"
                    required
                  >
                    <option value="">Select Existing Tag...</option>
                    {tagBreakdown.map(([tag]) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="New Tag Name..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs"
                  />

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-850 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all shrink-0"
                  >
                    Rename Tag
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Data Sync & Backup */}
        {activeTab === 'backup' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Export Section */}
            <div className="bg-white p-6 rounded-2xl border border-canvas-border shadow-sm space-y-3">
              <h3 className="font-serif text-lg font-bold text-emerald-950 flex items-center gap-2">
                <Download className="w-5 h-5 text-brass-dark" />
                <span>Export Catalog Data</span>
              </h3>
              <p className="text-xs text-obsidian-slate leading-relaxed">
                Download the latest updated <code className="font-mono bg-canvas-subtle px-1">products.json</code> file. You can commit this file to GitHub or replace <code className="font-mono bg-canvas-subtle px-1">data/products.json</code> in your repository for permanent hosting sync.
              </p>
              <button
                onClick={exportCatalogJSON}
                className="px-5 py-2.5 rounded-lg bg-brass-dark hover:bg-brass text-emerald-950 font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download products.json ({products.length} pieces)</span>
              </button>
            </div>

            {/* Import Section */}
            <div className="bg-white p-6 rounded-2xl border border-canvas-border shadow-sm space-y-3">
              <h3 className="font-serif text-lg font-bold text-emerald-950 flex items-center gap-2">
                <Upload className="w-5 h-5 text-brass-dark" />
                <span>Bulk Import / Replace Catalog</span>
              </h3>
              <p className="text-xs text-obsidian-slate">
                Paste JSON strictly conforming to the Kenzae Product Schema:
              </p>
              <textarea
                rows={6}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[ { "id": "kz-001", "sku": "KZ-SR-001", "title": "...", "price": 4500, ... } ]'
                className="w-full p-3 font-mono text-xs rounded-xl bg-canvas-subtle border border-canvas-border focus:outline-none focus:border-emerald-850"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleImportSubmit}
                  className="px-5 py-2.5 rounded-lg bg-emerald-900 hover:bg-emerald-850 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  Validate & Import Catalog
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Full Product Edit Modal */}
      <ProductEditModal
        product={modalProduct}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setModalProduct(null);
        }}
        onSave={(updated) => {
          const res = updateProduct(updated);
          if (res.success) {
            showNotice(`Saved changes for ${updated.sku}`);
          }
          return res;
        }}
        onDelete={(id) => {
          deleteProduct(id);
          showNotice('Deleted piece');
        }}
      />
    </div>
  );
};

export default StaffDashboard;
