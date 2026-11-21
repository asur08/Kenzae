import { supabase, isSupabaseConfigured } from './supabaseClient';
import { compressImageToWebP } from '../utils/imageProcessor';
import { ProductImageRole } from '../types/catalog';

export interface UploadResult {
  success: boolean;
  url: string;
  provider: 'supabase_storage' | 'aws_s3' | 'local_fallback';
  byteSize?: number;
  error?: string;
}

/**
 * Upload an image (File or base64 DataURL) through the S3/Supabase cloud pipeline.
 * Emits clean, permanent CDN URLs for catalog storage instead of bloated base64 strings.
 */
export async function uploadCatalogImage(params: {
  file?: File;
  dataUrl?: string;
  sku?: string;
  role?: ProductImageRole;
}): Promise<UploadResult> {
  const { file, sku = 'KZ-PIECE', role = 'garment-flat' } = params;

  let base64DataUrl = params.dataUrl;

  // 1. If File provided, compress to WebP first (max 1000px, quality 0.82)
  if (file) {
    try {
      const compressed = await compressImageToWebP(file, 1000, 1333, 0.82);
      base64DataUrl = compressed.dataUrl;
    } catch (compressErr) {
      return {
        success: false,
        url: '',
        provider: 'local_fallback',
        error: compressErr instanceof Error ? compressErr.message : 'Image compression failed',
      };
    }
  }

  if (!base64DataUrl) {
    return {
      success: false,
      url: '',
      provider: 'local_fallback',
      error: 'No image data available for upload',
    };
  }

  // 2. Direct client-side upload to Supabase Storage if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(base64DataUrl.trim());
      if (match) {
        const mimeType = match[1];
        const byteCharacters = atob(match[2]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        const cleanSku = sku.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        const fileName = `${cleanSku}-${role}-${Date.now()}.webp`;
        const filePath = `catalog/${fileName}`;

        const { data, error } = await supabase.storage
          .from('kenzae-catalog-images')
          .upload(filePath, blob, {
            contentType: mimeType,
            cacheControl: '31536000',
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('kenzae-catalog-images')
            .getPublicUrl(filePath);

          return {
            success: true,
            url: publicUrlData.publicUrl,
            provider: 'supabase_storage',
            byteSize: blob.size,
          };
        }
      }
    } catch (clientStorageErr) {
      console.warn('[ImageStorage] Client-side Supabase storage failed, trying API route...', clientStorageErr);
    }
  }

  // 3. Fall back to Serverless API Route (/api/upload-image)
  try {
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataUrl: base64DataUrl,
        sku,
        role,
        folder: 'catalog',
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.url) {
        return {
          success: true,
          url: result.url,
          provider: result.storageProvider || 'aws_s3',
          byteSize: result.byteSize,
        };
      }
    }
  } catch (apiErr) {
    console.warn('[ImageStorage] API upload-image route unreachable, using local fallback:', apiErr);
  }

  // 4. Offline / Dev Fallback: return dataUrl for local preview
  return {
    success: true,
    url: base64DataUrl,
    provider: 'local_fallback',
  };
}
