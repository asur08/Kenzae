import React, { useState } from 'react';
import { X, Plus, Download, Upload, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { KenzaeProduct, ProductCategory } from '../../types/catalog';
import { formatCurrencyINR } from '../../utils/formatters';

const CATEGORIES: ProductCategory[] = [
  'Saris',
  'Churidars & Salwar Sets',
  'Unstitched Dress Materials',
  'Kurthis & Ready-to-Wear',
];

export const CatalogManagerModal: React.FC = () => {
  const {
    isManagerOpen,
    setIsManagerOpen,
    products,
    addProduct,
    deleteProduct,
    updateProduct,
    resetToDefaultCatalog,
    exportCatalogJSON,
    importCatalogJSON,
  } = useCatalog();

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'import'>('list');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // New product form state
  const [formData, setFormData] = useState({
    title: '',
    sku: `KZ-SR-${String(products.length + 1).padStart(3, '0')}`,
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

  const [importJsonText, setImportJsonText] = useState('');

  if (!isManagerOpen) return null;

  const showNotice = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const images = [formData.image1.trim()];
    if (formData.image2.trim()) {
      images.push(formData.image2.trim());
    }

    const newProd: KenzaeProduct = {
      id: formData.sku.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      sku: formData.sku.trim(),
      title: formData.title.trim(),
      category: formData.category,
      subCategory: formData.subCategory.trim() || undefined,
      price: Number(formData.price),
      currency: 'INR',
      description: formData.description.trim() || undefined,
      fabricDetails: formData.fabricDetails.trim() || undefined,
      color: formData.color.trim() || undefined,
      images,
      in_stock: formData.in_stock,
      isFeatured: formData.isFeatured,
      whatsappMessage: `Namaste Kenzae! I am inquiring about ${formData.title} (${formData.sku}) at ₹${formData.price}.`,
    };

    const res = addProduct(newProd);
    if (res.success) {
      showNotice(`Successfully added ${newProd.sku}: ${newProd.title}`);
      setActiveTab('list');
      // Reset form
      setFormData({
        title: '',
        sku: `KZ-SR-${String(products.length + 2).padStart(3, '0')}`,
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
      showNotice(res.error || 'Failed to add product', true);
    }
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const res = importCatalogJSON(importJsonText);
    if (res.success) {
      showNotice(`Imported ${res.count} products successfully!`);
      setActiveTab('list');
      setImportJsonText('');
    } else {
      showNotice(res.error || 'Import failed', true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={() => setIsManagerOpen(false)}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl bg-canvas rounded-2xl shadow-2xl overflow-hidden border border-gold-500/40 z-10 max-h-[92vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-emerald-950 text-white flex items-center justify-between border-b border-gold-500/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-gold-300">
                Kenzae Catalog Manager
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-800 text-gold-200 uppercase tracking-widest font-mono">
                Staff CMS
              </span>
            </div>
            <p className="text-xs text-canvas/70 mt-0.5">
              Source of truth inventory management for Mulanthuruthy Boutique ({products.length} products loaded)
            </p>
          </div>
          <button
            onClick={() => setIsManagerOpen(false)}
            className="p-2 rounded-full hover:bg-emerald-900 text-canvas/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs & Subheader */}
        <div className="p-3 bg-canvas-subtle border-b border-canvas-dark flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                activeTab === 'list'
                  ? 'bg-emerald-900 text-gold-300 shadow-sm'
                  : 'bg-white text-obsidian hover:bg-canvas-muted'
              }`}
            >
              Inventory ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1 transition-colors ${
                activeTab === 'add'
                  ? 'bg-emerald-900 text-gold-300 shadow-sm'
                  : 'bg-white text-obsidian hover:bg-canvas-muted'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Piece</span>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1 transition-colors ${
                activeTab === 'import'
                  ? 'bg-emerald-900 text-gold-300 shadow-sm'
                  : 'bg-white text-obsidian hover:bg-canvas-muted'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCatalogJSON}
              className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-600 text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              title="Download products.json file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Reset catalog to original default inventory?')) {
                  resetToDefaultCatalog();
                  showNotice('Reset to default inventory');
                }
              }}
              className="p-1.5 rounded-lg text-obsidian-muted hover:text-obsidian hover:bg-canvas-muted transition-colors"
              title="Reset to default products.json"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notice alert */}
        {statusMessage && (
          <div
            className={`px-4 py-2 text-xs font-medium flex items-center gap-2 ${
              statusMessage.isError
                ? 'bg-rose-100 text-rose-900 border-b border-rose-200'
                : 'bg-emerald-100 text-emerald-900 border-b border-emerald-200'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* TAB 1: Product List */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              <div className="text-xs text-obsidian-muted flex justify-between items-center mb-1">
                <span>Manage stock availability and pricing for listed pieces:</span>
              </div>
              <div className="divide-y divide-canvas-dark border border-canvas-dark rounded-xl overflow-hidden bg-white">
                {products.map((p) => (
                  <div key={p.id} className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-canvas-subtle/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-12 h-14 rounded object-cover object-top shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-950">{p.sku}</span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-canvas-muted text-obsidian-muted">
                            {p.category}
                          </span>
                        </div>
                        <h4 className="font-serif text-sm font-semibold text-obsidian truncate mt-0.5">
                          {p.title}
                        </h4>
                        <p className="text-xs font-bold text-emerald-850">
                          {formatCurrencyINR(p.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          updateProduct({
                            ...p,
                            in_stock: !p.in_stock,
                          })
                        }
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase transition-colors ${
                          p.in_stock
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {p.in_stock ? 'In Stock' : 'Out of Stock'}
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${p.sku} (${p.title})?`)) {
                            deleteProduct(p.id);
                            showNotice(`Deleted ${p.sku}`);
                          }
                        }}
                        className="p-1.5 text-obsidian-muted hover:text-rose-600 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Add Product */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateProduct} className="space-y-4 max-w-2xl mx-auto">
              <h3 className="font-serif text-lg font-bold text-emerald-950">Add New Boutique Piece</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-muted mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-canvas-dark text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-muted mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-canvas-dark text-xs font-medium"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-muted mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handwoven Pure Banarasi Katan Silk"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-canvas-dark text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-muted mb-1">
                    Sub-Category / Weave Style
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Banarasi Katan / Organza / Linen"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-canvas-dark text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-muted mb-1">
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-canvas-dark text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-muted mb-1">
                    Color / Shade
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Regal Emerald & Antique Gold"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-canvas-dark text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-muted mb-1">
                    Fabric & Length Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Pure Katan Silk, 5.5m + Blouse"
                    value={formData.fabricDetails}
                    onChange={(e) => setFormData({ ...formData, fabricDetails: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-canvas-dark text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-muted mb-1">
                  Primary Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.image1}
                  onChange={(e) => setFormData({ ...formData, image1: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-canvas-dark text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-muted mb-1">
                  Secondary Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image2}
                  onChange={(e) => setFormData({ ...formData, image2: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-canvas-dark text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-obsidian-muted mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Boutique editorial notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-canvas-dark text-xs"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    className="w-4 h-4 accent-emerald-850 rounded"
                  />
                  <span>In Stock at Boutique</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-emerald-850 rounded"
                  />
                  <span>Mark as Featured Piece</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-lg border border-canvas-dark text-xs font-medium text-obsidian hover:bg-canvas-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg gold-gradient-bg text-emerald-950 text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105"
                >
                  Save Piece to Catalog
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Import JSON */}
          {activeTab === 'import' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <h3 className="font-serif text-lg font-bold text-emerald-950">Bulk Import / Replace Catalog</h3>
              <p className="text-xs text-obsidian-muted">
                Paste JSON conforming to the KenzaeProductCatalog schema defined in <code className="font-mono bg-canvas-muted px-1">gemini.md</code>:
              </p>
              <textarea
                rows={8}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[ { "id": "kz-001", "sku": "KZ-SR-001", ... } ]'
                className="w-full p-3 font-mono text-xs rounded-xl bg-white border border-canvas-dark focus:outline-none focus:border-emerald-800"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleImportSubmit}
                  className="px-5 py-2.5 rounded-lg bg-emerald-900 text-gold-300 font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-emerald-850"
                >
                  Validate & Import Catalog
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
