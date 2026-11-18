import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  Trash2,
  Star,
  Download,
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  Check,
  RefreshCw,
} from 'lucide-react';
import { ProductCategory, ProductImageRole } from '../../types/catalog';
import {
  compressImageToWebP,
  compressDataUrlToWebP,
  estimateDataUrlBytes,
  formatByteSize,
  downloadDataUrlAsFile,
} from '../../utils/imageProcessor';

interface ImageUploadStudioProps {
  images: string[];
  imageRoles: ProductImageRole[];
  onChange: (images: string[], imageRoles: ProductImageRole[]) => void;
  productMeta: {
    sku?: string;
    category?: ProductCategory;
    title?: string;
    color?: string;
    fabricDetails?: string;
  };
}

const ROLE_LABELS: Record<ProductImageRole, string> = {
  'model-drape': 'On-Model Drape',
  'garment-flat': 'Folded / Flat Garment',
  'pallu-detail': 'Pallu / Zari Detail',
  'ai-drape': 'AI Studio Drape',
};

export const ImageUploadStudio: React.FC<ImageUploadStudioProps> = ({
  images,
  imageRoles,
  onChange,
  productMeta,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI Model Drape Generator states
  const defaultStyle =
    productMeta.category === 'Saris' ? 'nivi' : 'anarkali';
  const [drapeStyle, setDrapeStyle] = useState<'nivi' | 'kasavu' | 'anarkali'>(defaultStyle);
  const [backdrop, setBackdrop] = useState<'ivory-atelier' | 'maroon-editorial' | 'daylight-veranda'>(
    'ivory-atelier'
  );
  const [customStylingNote, setCustomStylingNote] = useState('');
  const [isGeneratingDrape, setIsGeneratingDrape] = useState(false);
  const [drapeError, setDrapeError] = useState<string | null>(null);
  const [pendingAiDrape, setPendingAiDrape] = useState<{
    dataUrl: string;
    byteSize: number;
  } | null>(null);

  const normalizedRoles: ProductImageRole[] = images.map(
    (_, idx) => imageRoles[idx] || (idx === 0 ? 'model-drape' : 'garment-flat')
  );

  const firstUploadedDataUrl = images.find((img) => img.startsWith('data:image/'));
  const secondaryUploadedDataUrl = images.find(
    (img, idx) =>
      img.startsWith('data:image/') &&
      img !== firstUploadedDataUrl &&
      normalizedRoles[idx] !== 'ai-drape'
  );

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsCompressing(true);

    try {
      const remainingSlots = Math.max(0, 4 - images.length);
      if (remainingSlots === 0) {
        setUploadError('Maximum 4 photos per piece. Remove an existing photo to upload another.');
        return;
      }

      const selected = Array.from(files).slice(0, remainingSlots);
      const nextImages = [...images];
      const nextRoles = [...normalizedRoles];

      for (const file of selected) {
        const result = await compressImageToWebP(file, 900, 1200, 0.82);
        nextImages.push(result.dataUrl);
        nextRoles.push(nextImages.length === 1 ? 'garment-flat' : 'pallu-detail');
      }

      onChange(nextImages, nextRoles);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Unable to process selected image file.'
      );
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    if (
      !trimmed.startsWith('https://') &&
      !trimmed.startsWith('http://') &&
      !trimmed.startsWith('/images/')
    ) {
      setUploadError('Enter a valid https:// URL or /images/ path.');
      return;
    }
    if (images.length >= 4) {
      setUploadError('Maximum 4 photos per piece.');
      return;
    }
    setUploadError(null);
    const nextImages = [...images, trimmed];
    const nextRoles: ProductImageRole[] = [
      ...normalizedRoles,
      images.length === 0 ? 'model-drape' : 'garment-flat',
    ];
    onChange(nextImages, nextRoles);
    setUrlDraft('');
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const nextImages = [...images];
    const nextRoles = [...normalizedRoles];
    const [pickedImg] = nextImages.splice(index, 1);
    const [pickedRole] = nextRoles.splice(index, 1);
    nextImages.unshift(pickedImg);
    nextRoles.unshift(pickedRole);
    onChange(nextImages, nextRoles);
  };

  const handleRoleChange = (index: number, role: ProductImageRole) => {
    const nextRoles = [...normalizedRoles];
    nextRoles[index] = role;
    onChange(images, nextRoles);
  };

  const handleRemoveImage = (index: number) => {
    const nextImages = images.filter((_, idx) => idx !== index);
    const nextRoles = normalizedRoles.filter((_, idx) => idx !== index);
    onChange(nextImages, nextRoles);
  };

  const handleGenerateAiDrape = async () => {
    if (!firstUploadedDataUrl) {
      setDrapeError('Upload at least one sari/garment photo from your device first.');
      return;
    }

    setDrapeError(null);
    setIsGeneratingDrape(true);

    try {
      const response = await fetch('/api/generate-drape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: firstUploadedDataUrl,
          secondaryImageDataUrl: secondaryUploadedDataUrl,
          category: productMeta.category,
          title: productMeta.title,
          color: productMeta.color,
          fabricDetails: productMeta.fabricDetails,
          drapeStyle,
          backdrop,
          customStylingNote: customStylingNote.trim() || undefined,
        }),
      });

      const data = (await response.json()) as {
        imageDataUrl?: string;
        message?: string;
      };

      if (!response.ok || !data.imageDataUrl) {
        setDrapeError(
          data.message || `AI drape generation failed (status ${response.status}).`
        );
        return;
      }

      const compressed = await compressDataUrlToWebP(data.imageDataUrl, 900, 1200, 0.82);
      setPendingAiDrape({
        dataUrl: compressed.dataUrl,
        byteSize: compressed.byteSize,
      });
    } catch (err) {
      setDrapeError(
        err instanceof Error
          ? err.message
          : 'Network error contacting /api/generate-drape.'
      );
    } finally {
      setIsGeneratingDrape(false);
    }
  };

  const handleAcceptAiDrape = (setAsPrimary: boolean) => {
    if (!pendingAiDrape) return;
    let nextImages = [...images];
    let nextRoles = [...normalizedRoles];

    // If gallery is full (4), replace oldest AI drape or last slot
    if (nextImages.length >= 4) {
      const existingAiIdx = nextRoles.indexOf('ai-drape');
      const replaceIdx = existingAiIdx !== -1 ? existingAiIdx : nextImages.length - 1;
      nextImages.splice(replaceIdx, 1);
      nextRoles.splice(replaceIdx, 1);
    }

    if (setAsPrimary) {
      nextImages = [pendingAiDrape.dataUrl, ...nextImages];
      nextRoles = ['ai-drape', ...nextRoles];
    } else {
      nextImages.push(pendingAiDrape.dataUrl);
      nextRoles.push('ai-drape');
    }

    onChange(nextImages, nextRoles);
    setPendingAiDrape(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-obsidian-slate">
            Garment Photos &amp; Studio Drape ({images.length}/4)
          </span>
          <span className="text-[11px] text-obsidian-muted">
            Photos auto-compress to lightweight WebP (~120 KB) instead of heavy video files.
          </span>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFilesSelected(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
          isDragging
            ? 'border-maroon-900 bg-maroon-50'
            : 'border-canvas-border bg-canvas-subtle hover:border-maroon-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            disabled={isCompressing || images.length >= 4}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-maroon-900 hover:bg-maroon-850 text-brass-light text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-xs disabled:opacity-50 transition-colors"
          >
            {isCompressing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{isCompressing ? 'Compressing WebP...' : 'Upload Garment Photos'}</span>
          </button>

          <span className="text-[11px] text-obsidian-slate">
            or drag &amp; drop sari / pallu photos here (JPG, PNG, WebP)
          </span>
        </div>

        {/* Optional URL Paste */}
        <div className="mt-3 pt-3 border-t border-canvas-border/80 flex items-center gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <LinkIcon className="w-3.5 h-3.5 text-obsidian-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              placeholder="Or paste an image URL (https://... or /images/...)"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-canvas-border text-xs"
            />
          </div>
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 rounded-lg border border-canvas-border bg-white hover:bg-canvas-border text-xs font-semibold text-obsidian shrink-0"
          >
            Add URL
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Active Image Slots */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, idx) => {
            const role = normalizedRoles[idx];
            const isDataUri = img.startsWith('data:image/');
            const byteLabel = isDataUri ? formatByteSize(estimateDataUrlBytes(img)) : 'CDN URL';

            return (
              <div
                key={`${idx}-${img.slice(0, 24)}`}
                className={`rounded-xl border overflow-hidden bg-white flex flex-col ${
                  idx === 0 ? 'border-maroon-900 ring-1 ring-maroon-900/30' : 'border-canvas-border'
                }`}
              >
                <div className="relative aspect-[3/4] bg-canvas-subtle">
                  <img
                    src={img}
                    alt={`Garment slot ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-maroon-950/90 text-brass-light text-[9px] font-bold uppercase tracking-wider">
                      Primary
                    </span>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/65 text-white text-[9px] font-mono">
                    {byteLabel}
                  </span>
                </div>

                <div className="p-2 space-y-1.5">
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(idx, e.target.value as ProductImageRole)}
                    className="w-full px-1.5 py-1 rounded bg-canvas-subtle border border-canvas-border text-[10px] font-medium"
                  >
                    {Object.entries(ROLE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between gap-1">
                    {idx !== 0 ? (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="text-[10px] font-semibold text-maroon-900 hover:underline flex items-center gap-0.5"
                        title="Make this the main catalog cover photo"
                      >
                        <Star className="w-2.5 h-2.5" />
                        <span>Set Cover</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-obsidian-muted font-medium">Cover</span>
                    )}

                    <div className="flex items-center gap-1">
                      {isDataUri && (
                        <button
                          type="button"
                          onClick={() => {
                            const slug = (productMeta.sku || 'kenzae-piece').toLowerCase();
                            downloadDataUrlAsFile(img, `${slug}-${idx + 1}.webp`);
                          }}
                          className="p-1 rounded text-obsidian-slate hover:text-maroon-900 hover:bg-canvas-subtle"
                          title="Download compressed WebP file"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1 rounded text-obsidian-slate hover:text-rose-700 hover:bg-rose-50"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Model Drape Generator Card */}
      <div className="p-4 rounded-xl bg-maroon-50/70 border border-maroon-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brass-dark" />
              <span>AI Model Drape Generator</span>
            </h4>
            <p className="text-[11px] text-obsidian-slate mt-0.5">
              Automatically drape your uploaded sari/garment onto a studio fashion model—generated once and saved as a compact WebP photo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
              Draping Silhouette
            </label>
            <select
              value={drapeStyle}
              onChange={(e) => setDrapeStyle(e.target.value as typeof drapeStyle)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-canvas-border text-xs font-medium"
            >
              <option value="nivi">Classic Nivi Sari Drape</option>
              <option value="kasavu">Kerala Kasavu / Temple Drape</option>
              <option value="anarkali">Churidar / Kurta Studio Fit</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
              Studio Backdrop
            </label>
            <select
              value={backdrop}
              onChange={(e) => setBackdrop(e.target.value as typeof backdrop)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-canvas-border text-xs font-medium"
            >
              <option value="ivory-atelier">Warm Ivory Atelier</option>
              <option value="maroon-editorial">Royal Maroon Editorial</option>
              <option value="daylight-veranda">Daylight Veranda</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
              Blouse / Styling Hint
            </label>
            <input
              type="text"
              value={customStylingNote}
              onChange={(e) => setCustomStylingNote(e.target.value)}
              placeholder="e.g. Maroon silk blouse, subtle gold"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-canvas-border text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-obsidian-slate">
            {firstUploadedDataUrl
              ? 'Ready to drape using your uploaded garment photo(s).'
              : 'Upload a garment photo from your device above to enable AI draping.'}
          </span>

          <button
            type="button"
            disabled={!firstUploadedDataUrl || isGeneratingDrape}
            onClick={handleGenerateAiDrape}
            className="px-4 py-2 rounded-lg bg-maroon-900 hover:bg-maroon-850 text-brass-light font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
          >
            {isGeneratingDrape ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-brass" />
            )}
            <span>{isGeneratingDrape ? 'Draping on Model...' : 'Generate AI Model Drape'}</span>
          </button>
        </div>

        {drapeError && (
          <div className="p-2.5 rounded-lg bg-white border border-amber-300 text-amber-950 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>{drapeError}</span>
          </div>
        )}

        {/* Side-by-Side Comparison Review */}
        {pendingAiDrape && firstUploadedDataUrl && (
          <div className="p-3 rounded-xl bg-white border border-maroon-300 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-maroon-950">
                Review AI Drape Preview ({formatByteSize(pendingAiDrape.byteSize)} WebP)
              </span>
              <button
                type="button"
                onClick={handleGenerateAiDrape}
                disabled={isGeneratingDrape}
                className="text-xs font-medium text-maroon-900 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-obsidian-muted mb-1">
                  Uploaded Garment
                </span>
                <img
                  src={firstUploadedDataUrl}
                  alt="Original uploaded garment"
                  className="aspect-[3/4] w-full rounded-lg object-cover border border-canvas-border"
                />
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-maroon-900 font-semibold mb-1">
                  AI Model Drape
                </span>
                <img
                  src={pendingAiDrape.dataUrl}
                  alt="AI draped model preview"
                  className="aspect-[3/4] w-full rounded-lg object-cover object-top border-2 border-maroon-900"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAcceptAiDrape(true)}
                className="px-3.5 py-1.5 rounded-lg bg-maroon-900 hover:bg-maroon-850 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-brass" />
                <span>Accept &amp; Set as Primary Cover</span>
              </button>

              <button
                type="button"
                onClick={() => handleAcceptAiDrape(false)}
                className="px-3.5 py-1.5 rounded-lg border border-canvas-border hover:bg-canvas-subtle text-xs font-semibold text-obsidian"
              >
                Add as Secondary Photo
              </button>

              <button
                type="button"
                onClick={() => setPendingAiDrape(null)}
                className="px-3 py-1.5 text-xs text-obsidian-slate hover:text-rose-700"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadStudio;
