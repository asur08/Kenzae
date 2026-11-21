import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

export interface UploadImageRequest {
  dataUrl: string;
  filename?: string;
  folder?: string;
  sku?: string;
  role?: string;
}

export interface UploadImageResponse {
  success: boolean;
  url?: string;
  storageProvider?: 'aws_s3' | 'supabase_storage' | 'local_fallback';
  byteSize?: number;
  mimeType?: string;
  error?: string;
  message?: string;
}

function parseBase64DataUrl(dataUrl: string): { mimeType: string; buffer: Buffer } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl.trim());
  if (!match) return null;
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
}

function sanitizeFileName(sku: string | undefined, role: string | undefined, originalName: string | undefined): string {
  const timestamp = Date.now();
  const cleanSku = (sku || 'garment').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const cleanRole = (role || 'photo').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return `${cleanSku}-${cleanRole}-${timestamp}.webp`;
}

export async function processImageUpload(payload: UploadImageRequest): Promise<{ status: number; body: UploadImageResponse }> {
  if (!payload || !payload.dataUrl) {
    return {
      status: 400,
      body: { success: false, error: 'MISSING_DATA_URL', message: 'Image base64 dataUrl is required.' },
    };
  }

  const parsed = parseBase64DataUrl(payload.dataUrl);
  if (!parsed) {
    return {
      status: 400,
      body: { success: false, error: 'INVALID_BASE64', message: 'Invalid image dataUrl format.' },
    };
  }

  const fileName = sanitizeFileName(payload.sku, payload.role, payload.filename);
  const folder = payload.folder || 'catalog';
  const objectKey = `${folder}/${fileName}`;

  // 1. PROVIDER CHECK: AWS S3 / Cloudflare R2
  const s3Bucket = process.env.AWS_S3_BUCKET;
  const s3Region = process.env.AWS_REGION || 'ap-south-1';
  const s3AccessKey = process.env.AWS_ACCESS_KEY_ID;
  const s3SecretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const s3CustomEndpoint = process.env.AWS_S3_ENDPOINT; // For Cloudflare R2 or MinIO
  const s3CustomCdnUrl = process.env.NEXT_PUBLIC_CDN_URL || process.env.VITE_CDN_URL;

  if (s3Bucket && s3AccessKey && s3SecretKey) {
    try {
      const s3 = new S3Client({
        region: s3Region,
        credentials: {
          accessKeyId: s3AccessKey,
          secretAccessKey: s3SecretKey,
        },
        endpoint: s3CustomEndpoint,
      });

      await s3.send(
        new PutObjectCommand({
          Bucket: s3Bucket,
          Key: objectKey,
          Body: parsed.buffer,
          ContentType: parsed.mimeType,
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );

      const publicUrl = s3CustomCdnUrl
        ? `${s3CustomCdnUrl.replace(/\/$/, '')}/${objectKey}`
        : `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${objectKey}`;

      return {
        status: 200,
        body: {
          success: true,
          url: publicUrl,
          storageProvider: 'aws_s3',
          byteSize: parsed.buffer.length,
          mimeType: parsed.mimeType,
        },
      };
    } catch (s3Err) {
      console.error('[UploadAPI] AWS S3 upload failed:', s3Err);
      // Fall through to try Supabase or fallback
    }
  }

  // 2. PROVIDER CHECK: Supabase Storage
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // Modern Secret Key (sb_secret_...) or legacy Service Role Key, falling back to Publishable/Anon Key
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'kenzae-catalog-images';

  if (supabaseUrl && supabaseKey) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(objectKey, parsed.buffer, {
          contentType: parsed.mimeType,
          cacheControl: '31536000',
          upsert: true,
        });

      if (error) {
        console.warn('[UploadAPI] Supabase storage error:', error.message);
      } else if (data) {
        const { data: publicData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(objectKey);

        return {
          status: 200,
          body: {
            success: true,
            url: publicData.publicUrl,
            storageProvider: 'supabase_storage',
            byteSize: parsed.buffer.length,
            mimeType: parsed.mimeType,
          },
        };
      }
    } catch (sbErr) {
      console.warn('[UploadAPI] Supabase storage exception:', sbErr);
    }
  }

  // 3. FALLBACK: Return dataUrl with local warning
  return {
    status: 200,
    body: {
      success: true,
      url: payload.dataUrl,
      storageProvider: 'local_fallback',
      byteSize: parsed.buffer.length,
      mimeType: parsed.mimeType,
      message: 'Active cloud credentials (AWS S3 or Supabase Storage) not configured in .env. Falling back to local preview mode.',
    },
  };
}

export default async function handler(
  req: { method?: string; body?: UploadImageRequest },
  res: { status: (code: number) => { json: (data: unknown) => void } }
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', message: 'Use POST /api/upload-image' });
    return;
  }

  try {
    const result = await processImageUpload(req.body || ({} as UploadImageRequest));
    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'UPLOAD_FAILED',
      message: err instanceof Error ? err.message : 'Unknown server error during image upload',
    });
  }
}
