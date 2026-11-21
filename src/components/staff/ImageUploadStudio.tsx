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
  Camera,
  ZoomIn,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  ProductCategory,
  ProductImageRole,
  AiDrapePose,
  ModelArchetype,
} from '../../types/catalog';
import { downloadDataUrlAsFile } from '../../utils/imageProcessor';
import { uploadCatalogImage } from '../../services/imageStorage';
import { GeneratedLook, MultiPoseDrapeResponse } from '../../types/drape';

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

const ARCHETYPE_LABELS: Record<ModelArchetype, { name: string; desc: string }> = {
  'kerala-heritage': {
    name: 'Kerala Heritage Elegance',
    desc: 'Graceful South Indian model, low bun with fresh jasmine, antique matte temple jhumkas.',
  },
  'modern-minimalist': {
    name: 'Modern Minimalist Couture',
    desc: 'Contemporary high-fashion poise, sleek hair, subtle pearl drops, radiant editorial skin.',
  },
  'royal-festive': {
    name: 'Royal Festive Grandeur',
    desc: 'Majestic bridal festive styling, antique choker accents, celebratory royal poise.',
  },
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

  // Multi-Pose AI Lookbook Studio states
  const defaultStyle = productMeta.category === 'Saris' ? 'nivi' : 'anarkali';
  const [drapeStyle, setDrapeStyle] = useState<'nivi' | 'kasavu' | 'anarkali'>(defaultStyle);
  const [backdrop, setBackdrop] = useState<'ivory-atelier' | 'maroon-editorial' | 'daylight-veranda'>(
    'ivory-atelier'
  );
  const [modelArchetype, setModelArchetype] = useState<ModelArchetype>('kerala-heritage');
  const [customStylingNote, setCustomStylingNote] = useState('');

  // Generation status
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [regeneratingPoseId, setRegeneratingPoseId] = useState<AiDrapePose | null>(null);
  const [drapeError, setDrapeError] = useState<string | null>(null);
  const [studioNotice, setStudioNotice] = useState<string | null>(null);

  // Generated 4-look lookbook
  const [lookbook, setLookbook] = useState<GeneratedLook[]>([]);
  const [selectedPoseIds, setSelectedPoseIds] = useState<Set<AiDrapePose>>(new Set());
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  const normalizedRoles: ProductImageRole[] = images.map(
    (_, idx) => imageRoles[idx] || (idx === 0 ? 'model-drape' : 'garment-flat')
  );

  // Detect reference images (either local DataURL or cloud CDN URL)
  const primaryReferenceImage = images[0] || null;
  const secondaryReferenceImage = images.length > 1 ? images[1] : null;

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
        const assignedRole: ProductImageRole =
          nextImages.length === 0
            ? 'model-drape'
            : nextImages.length === 1
            ? 'garment-flat'
            : 'pallu-detail';

        const uploadRes = await uploadCatalogImage({
          file,
          sku: productMeta.sku,
          role: assignedRole,
        });

        if (uploadRes.success && uploadRes.url) {
          nextImages.push(uploadRes.url);
          nextRoles.push(assignedRole);
        } else {
          throw new Error(uploadRes.error || 'Failed to upload photo to storage.');
        }
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

  // Generate All 4 Editorial Looks
  const handleGenerateFullLookbook = async () => {
    if (!primaryReferenceImage) {
      setDrapeError('Please upload at least one garment flat-lay photo first.');
      return;
    }

    setDrapeError(null);
    setStudioNotice(null);
    setIsGeneratingAll(true);

    try {
      const response = await fetch('/api/generate-drape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: primaryReferenceImage.startsWith('http') ? primaryReferenceImage : undefined,
          imageDataUrl: primaryReferenceImage.startsWith('data:') ? primaryReferenceImage : undefined,
          secondaryImageUrl: secondaryReferenceImage?.startsWith('http') ? secondaryReferenceImage : undefined,
          secondaryImageDataUrl: secondaryReferenceImage?.startsWith('data:') ? secondaryReferenceImage : undefined,
          category: productMeta.category,
          title: productMeta.title,
          color: productMeta.color,
          fabricDetails: productMeta.fabricDetails,
          drapeStyle,
          backdrop,
          modelArchetype,
          customStylingNote: customStylingNote.trim() || undefined,
          pose: 'all',
        }),
      });

      const data = (await response.json()) as MultiPoseDrapeResponse;

      if (!response.ok || !data.success || !data.looks || data.looks.length === 0) {
        setDrapeError(data.message || `AI photoshoot generation failed (status ${response.status}).`);
        return;
      }

      setLookbook(data.looks);
      setSelectedPoseIds(new Set(data.looks.map((l) => l.poseId)));

      if (data.message && data.modelUsed === 'mock-editorial-preview') {
        setStudioNotice(
          'GEMINI_API_KEY is not set. Generated an editorial studio preview lookbook for demonstration.'
        );
      }
    } catch (err) {
      setDrapeError(
        err instanceof Error ? err.message : 'Network error contacting /api/generate-drape.'
      );
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Regenerate a single pose without losing the other 3
  const handleRegeneratePose = async (poseId: AiDrapePose) => {
    if (!primaryReferenceImage) return;
    setRegeneratingPoseId(poseId);
    setDrapeError(null);

    try {
      const response = await fetch('/api/generate-drape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: primaryReferenceImage.startsWith('http') ? primaryReferenceImage : undefined,
          imageDataUrl: primaryReferenceImage.startsWith('data:') ? primaryReferenceImage : undefined,
          category: productMeta.category,
          title: productMeta.title,
          color: productMeta.color,
          fabricDetails: productMeta.fabricDetails,
          drapeStyle,
          backdrop,
          modelArchetype,
          customStylingNote: customStylingNote.trim() || undefined,
          pose: poseId,
        }),
      });

      const data = (await response.json()) as MultiPoseDrapeResponse;
      if (response.ok && data.looks && data.looks.length > 0) {
        const updatedLook = data.looks[0];
        setLookbook((prev) =>
          prev.map((l) => (l.poseId === poseId ? updatedLook : l))
        );
      }
    } catch (err) {
      setDrapeError(err instanceof Error ? err.message : 'Failed to regenerate single look.');
    } finally {
      setRegeneratingPoseId(null);
    }
  };

  const togglePoseSelection = (poseId: AiDrapePose) => {
    setSelectedPoseIds((prev) => {
      const next = new Set(prev);
      if (next.has(poseId)) {
        next.delete(poseId);
      } else {
        next.add(poseId);
      }
      return next;
    });
  };

  // Adopt Selected / All Looks into Product Gallery with Cloud Uploads
  const handleApplyLookbook = async () => {
    const looksToApply = lookbook.filter(
      (l) => selectedPoseIds.has(l.poseId) && l.status === 'success' && l.imageDataUrl
    );

    if (looksToApply.length === 0) return;
    setIsCompressing(true);

    try {
      const newGalleryImages: string[] = [];
      const newGalleryRoles: ProductImageRole[] = [];

      for (const look of looksToApply) {
        let finalUrl = look.imageDataUrl;

        // If it's a base64 string, upload to S3/Supabase Storage
        if (look.imageDataUrl.startsWith('data:image/')) {
          const uploadRes = await uploadCatalogImage({
            dataUrl: look.imageDataUrl,
            sku: productMeta.sku,
            role: look.role,
          });
          if (uploadRes.success && uploadRes.url) {
            finalUrl = uploadRes.url;
          }
        }

        newGalleryImages.push(finalUrl);
        newGalleryRoles.push(look.role);
      }

      // If less than 4 looks were applied and existing flat-lay exists, preserve flat garment at the end
      if (newGalleryImages.length < 4 && primaryReferenceImage && !newGalleryImages.includes(primaryReferenceImage)) {
        newGalleryImages.push(primaryReferenceImage);
        newGalleryRoles.push('garment-flat');
      }

      onChange(newGalleryImages.slice(0, 4), newGalleryRoles.slice(0, 4));
      setLookbook([]);
    } catch (err) {
      setDrapeError(err instanceof Error ? err.message : 'Error applying photoshoot gallery.');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-canvas-border pb-2">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-obsidian">
            Product Photography &amp; AI Lookbook Studio ({images.length}/4)
          </span>
          <span className="text-[11px] text-obsidian-muted">
            Upload flat garments, then click &ldquo;Generate 4-Look Photoshoot&rdquo; to auto-model the piece in 4 poses.
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
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
          id="product-photo-upload"
        />

        <div className="flex flex-col items-center justify-center gap-2 py-2">
          <div className="w-10 h-10 rounded-full bg-white border border-canvas-border shadow-xs flex items-center justify-center text-maroon-900">
            {isCompressing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <div>
            <label
              htmlFor="product-photo-upload"
              className="text-xs font-semibold text-maroon-900 hover:text-maroon-950 underline cursor-pointer"
            >
              Choose photos from device
            </label>
            <span className="text-xs text-obsidian-muted"> or drag and drop here</span>
          </div>
          <p className="text-[11px] text-obsidian-muted">
            Upload flat-lay, folded, or pallu smartphone photos. Auto-converts to optimized WebP.
          </p>
        </div>
      </div>

      {/* URL Input Fallback */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 text-obsidian-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Or paste an image URL (https://... or /images/...)"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-canvas-border text-xs focus:outline-none focus:border-maroon-850"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={!urlDraft.trim() || images.length >= 4}
          className="px-3 py-1.5 rounded-lg bg-canvas-subtle hover:bg-canvas-border text-obsidian text-xs font-semibold disabled:opacity-40"
        >
          Add URL
        </button>
      </div>

      {uploadError && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Active Product Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-obsidian-slate">
            Active Catalog Gallery ({images.length}/4)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => {
              const role = normalizedRoles[idx];
              const isDataUri = img.startsWith('data:image/');

              return (
                <div
                  key={`${img.slice(0, 32)}-${idx}`}
                  className="group relative rounded-xl border border-canvas-border bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative aspect-[3/4] w-full bg-canvas-subtle overflow-hidden">
                    <img
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                    />

                    {idx === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-maroon-900 text-brass-light text-[10px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-brass text-brass" />
                        <span>Cover</span>
                      </span>
                    )}

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setPreviewZoomImage(img)}
                        className="p-1 rounded-full bg-black/60 text-white hover:bg-black/90 shadow-sm"
                        title="View Full Resolution"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2 space-y-1.5 flex-1 flex flex-col justify-between bg-white">
                    <select
                      value={role}
                      onChange={(e) =>
                        handleRoleChange(idx, e.target.value as ProductImageRole)
                      }
                      className="w-full text-[11px] font-medium py-1 px-1.5 rounded bg-canvas-subtle border border-canvas-border focus:outline-none focus:border-maroon-850"
                    >
                      {Object.entries(ROLE_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between gap-1 pt-1">
                      {idx !== 0 ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          className="text-[10px] font-semibold text-maroon-900 hover:underline flex items-center gap-0.5"
                          title="Make this the catalog cover photo"
                        >
                          <Star className="w-2.5 h-2.5" />
                          <span>Set Cover</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-obsidian-muted font-medium">Primary</span>
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
                            title="Download compressed WebP"
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
        </div>
      )}

      {/* ====================================================================== */}
      {/* 4-LOOK AI PHOTOSHOOT STUDIO (THE MULTI-POSE ATELIER)                   */}
      {/* ====================================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-maroon-50/90 via-canvas-subtle to-brass-light/20 border border-maroon-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-maroon-200/60 pb-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-950 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-brass-dark" />
              <span>Boutique AI Photoshoot Studio</span>
              <span className="px-2 py-0.5 rounded-full bg-maroon-900 text-brass-light text-[9px] font-semibold tracking-widest uppercase">
                4-Look Editorial
              </span>
            </h4>
            <p className="text-[11px] text-obsidian-slate">
              Upload flat garment photos, then direct the AI engine to generate 4 distinct editorial looks on a consistent high-fashion model.
            </p>
          </div>
        </div>

        {/* Shoot Director Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
              Model Persona &amp; Styling
            </label>
            <select
              value={modelArchetype}
              onChange={(e) => setModelArchetype(e.target.value as ModelArchetype)}
              className="w-full px-2.5 py-2 rounded-lg bg-white border border-canvas-border text-xs font-medium focus:outline-none focus:border-maroon-900"
            >
              {Object.entries(ARCHETYPE_LABELS).map(([k, val]) => (
                <option key={k} value={k}>
                  {val.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-obsidian-muted mt-1 leading-snug">
              {ARCHETYPE_LABELS[modelArchetype].desc}
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
              Studio Atmosphere
            </label>
            <select
              value={backdrop}
              onChange={(e) => setBackdrop(e.target.value as typeof backdrop)}
              className="w-full px-2.5 py-2 rounded-lg bg-white border border-canvas-border text-xs font-medium focus:outline-none focus:border-maroon-900"
            >
              <option value="ivory-atelier">Warm Ivory Linen Atelier (#FAF8F5)</option>
              <option value="maroon-editorial">Royal Maroon Heritage Studio</option>
              <option value="daylight-veranda">Sunlit Teak Nalukettu Veranda</option>
            </select>
            <p className="text-[10px] text-obsidian-muted mt-1">
              Diffused magazine side-lighting matching Kenzae brand aesthetic.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-obsidian-slate mb-1">
              Drape Silhouette &amp; Note
            </label>
            <select
              value={drapeStyle}
              onChange={(e) => setDrapeStyle(e.target.value as typeof drapeStyle)}
              className="w-full px-2.5 py-2 rounded-lg bg-white border border-canvas-border text-xs font-medium focus:outline-none focus:border-maroon-900 mb-1.5"
            >
              <option value="nivi">Classic Indian Nivi Saree Drape</option>
              <option value="kasavu">Kerala Kasavu / Temple Drape</option>
              <option value="anarkali">Bespoke Salwar / Flared Anarkali</option>
            </select>
            <input
              type="text"
              value={customStylingNote}
              onChange={(e) => setCustomStylingNote(e.target.value)}
              placeholder="e.g. Maroon silk blouse with half-sleeves"
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-canvas-border text-xs"
            />
          </div>
        </div>

        {/* Trigger Button & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-maroon-200/50">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-obsidian-slate">
              {primaryReferenceImage
                ? 'Garment reference ready. Direct photoshoot to generate 4 looks.'
                : 'Upload a garment photo above to activate AI photoshoot.'}
            </span>
          </div>

          <button
            type="button"
            disabled={!primaryReferenceImage || isGeneratingAll}
            onClick={handleGenerateFullLookbook}
            className="px-5 py-2.5 rounded-xl bg-maroon-900 hover:bg-maroon-850 text-brass-light font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md disabled:opacity-45 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-brass" />
                <span>Directing 4-Look Photoshoot...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-brass" />
                <span>Generate 4-Look Photoshoot</span>
              </>
            )}
          </button>
        </div>

        {studioNotice && (
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{studioNotice}</span>
          </div>
        )}

        {drapeError && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{drapeError}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 4-LOOK LOOKBOOK MATRIX PREVIEW                                      */}
        {/* ==================================================================== */}
        {lookbook.length > 0 && (
          <div className="mt-4 pt-4 border-t border-maroon-300/70 space-y-4 bg-white/70 p-4 rounded-xl border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-maroon-950 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Review 4-Look Photoshoot Gallery</span>
                </span>
                <p className="text-[11px] text-obsidian-muted">
                  Select which looks to apply, or regenerate individual angles before saving.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyLookbook}
                  disabled={selectedPoseIds.size === 0 || isCompressing}
                  className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    Apply {selectedPoseIds.size} Look{selectedPoseIds.size > 1 ? 's' : ''} to Catalog
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLookbook([])}
                  className="px-3 py-2 text-xs font-semibold text-obsidian-slate hover:text-rose-700 rounded-lg hover:bg-canvas-subtle"
                >
                  Discard
                </button>
              </div>
            </div>

            {/* 4 Cards Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {lookbook.map((look, idx) => {
                const isSelected = selectedPoseIds.has(look.poseId);
                const isRegenerating = regeneratingPoseId === look.poseId;

                return (
                  <div
                    key={look.poseId}
                    className={`rounded-xl border transition-all overflow-hidden flex flex-col bg-white ${
                      isSelected
                        ? 'border-maroon-900 shadow-md ring-1 ring-maroon-900/30'
                        : 'border-canvas-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Look Image with Badges */}
                    <div className="relative aspect-[3/4] w-full bg-canvas-subtle overflow-hidden">
                      {isRegenerating ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-canvas-subtle gap-2 text-maroon-900">
                          <Loader2 className="w-6 h-6 animate-spin text-brass-dark" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Re-shooting Look...
                          </span>
                        </div>
                      ) : (
                        <img
                          src={look.imageDataUrl}
                          alt={look.title}
                          className="w-full h-full object-cover object-top"
                        />
                      )}

                      {/* Pose badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-maroon-950/90 text-brass-light text-[9px] font-bold tracking-wider uppercase backdrop-blur-xs">
                        Look {idx + 1}
                      </span>

                      {/* Selection Checkbox */}
                      <button
                        type="button"
                        onClick={() => togglePoseSelection(look.poseId)}
                        className={`absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-maroon-900 text-white'
                            : 'bg-white/80 border border-canvas-border text-transparent'
                        }`}
                        title="Include in catalog gallery"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      {/* Preview Zoom button */}
                      <button
                        type="button"
                        onClick={() => setPreviewZoomImage(look.imageDataUrl)}
                        className="absolute bottom-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                        title="Zoom look"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Metadata & Single-Pose Regenerate */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2 bg-white">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-obsidian">
                            {look.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-obsidian-muted mt-0.5 leading-snug line-clamp-2">
                          {look.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-canvas-border text-[11px]">
                        <span className="text-[10px] uppercase font-semibold text-brass-dark">
                          {ROLE_LABELS[look.role]}
                        </span>

                        <button
                          type="button"
                          disabled={isRegenerating || isGeneratingAll}
                          onClick={() => handleRegeneratePose(look.poseId)}
                          className="text-[10px] font-semibold text-maroon-900 hover:text-maroon-950 flex items-center gap-1 hover:underline disabled:opacity-40"
                          title="Regenerate this specific angle"
                        >
                          <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                          <span>Re-shoot</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Modal for inspection */}
      {previewZoomImage && (
        <div
          onClick={() => setPreviewZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs cursor-zoom-out"
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-transparent">
            <button
              onClick={() => setPreviewZoomImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-brass-light p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewZoomImage}
              alt="High-resolution photoshoot preview"
              className="max-h-[85vh] w-auto rounded-lg object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadStudio;
