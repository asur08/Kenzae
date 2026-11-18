import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { KenzaeProduct, ProductCategory, ProductImageRole } from '../../types/catalog';
import { ImageUploadStudio } from './ImageUploadStudio';

interface ProductEditModalProps {
  product: KenzaeProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: KenzaeProduct) => { success: boolean; error?: string };
  onDelete?: (id: string) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Saris',
  'Churidars & Salwar Sets',
  'Unstitched Dress Materials',
  'Kurthis & Ready-to-Wear',
];

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<KenzaeProduct | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [imageRoles, setImageRoles] = useState<ProductImageRole[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
      setImages(product.images || []);
      setImageRoles(
        product.imageRoles ||
          (product.images || []).map((_, idx) => (idx === 0 ? 'model-drape' : 'garment-flat'))
      );
      setErrorMsg(null);
    }
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (images.length === 0) {
      setErrorMsg('Please upload or add at least 1 garment photograph.');
      return;
    }

    const qty = Math.max(0, Number(formData.stockQuantity ?? (formData.in_stock ? 1 : 0)));
    const payload: KenzaeProduct = {
      ...formData,
      price: Math.round(Number(formData.price)),
      stockQuantity: qty,
      in_stock: qty > 0,
      images,
      imageRoles,
    };

    const res = onSave(payload);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to save product edits.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-canvas-border overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-maroon-950 text-white flex items-center justify-between border-b border-brass/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brass px-2 py-0.5 rounded bg-maroon-900 border border-brass/30">
                {formData.sku}
              </span>
              <h3 className="font-serif text-lg font-bold text-white">
                Edit Boutique Piece
              </h3>
            </div>
            <p className="text-xs text-white/70 mt-0.5 truncate max-w-md">
              {formData.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-maroon-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                SKU Code *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs font-semibold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

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
                className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs font-bold text-maroon-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                Stock Count *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stockQuantity ?? (formData.in_stock ? 1 : 0)}
                onChange={(e) => {
                  const qty = Math.max(0, parseInt(e.target.value, 10) || 0);
                  setFormData({ 
                    ...formData, 
                    stockQuantity: qty,
                    in_stock: qty > 0 
                  });
                }}
                className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs font-bold text-obsidian font-mono"
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
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                SubCategory / Weave Tag
              </label>
              <input
                type="text"
                value={formData.subCategory || ''}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                placeholder="e.g. Banarasi Katan / Organza / Linen"
                className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
                Color / Shade Palette
              </label>
              <input
                type="text"
                value={formData.color || ''}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g. Royal Maroon & Antique Gold"
                className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
              Fabric Details & Length
            </label>
            <input
              type="text"
              value={formData.fabricDetails || ''}
              onChange={(e) => setFormData({ ...formData, fabricDetails: e.target.value })}
              placeholder="e.g. 100% Pure Mulberry Silk, 5.5m + 0.8m Blouse"
              className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs"
            />
          </div>

          <ImageUploadStudio
            images={images}
            imageRoles={imageRoles}
            onChange={(nextImgs, nextRoles) => {
              setImages(nextImgs);
              setImageRoles(nextRoles);
            }}
            productMeta={{
              sku: formData.sku,
              category: formData.category,
              title: formData.title,
              color: formData.color,
              fabricDetails: formData.fabricDetails,
            }}
          />

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
              Editorial Description
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-canvas-subtle border border-canvas-border text-xs"
            />
          </div>

          {/* Status Switches */}
          <div className="p-3 bg-canvas-subtle rounded-xl border border-canvas-border flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
              <input
                type="checkbox"
                checked={formData.in_stock}
                onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                className="w-4 h-4 accent-maroon-900 rounded"
              />
              <span className={formData.in_stock ? 'text-maroon-900' : 'text-rose-700'}>
                {formData.in_stock ? '● In Stock at Boutique' : '○ Out of Stock / Reserved'}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
              <input
                type="checkbox"
                checked={Boolean(formData.isFeatured)}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 accent-brass rounded"
              />
              <span className="text-brass-dark">★ Featured Boutique Piece</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-canvas-border">
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${formData.sku}?`)) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1.5 p-2 rounded hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Piece</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-canvas-border text-xs font-medium text-obsidian hover:bg-canvas-subtle transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-maroon-900 hover:bg-maroon-850 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Check className="w-3.5 h-3.5 text-brass" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
