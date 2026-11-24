export interface ProcessedImageResult {
  dataUrl: string;
  byteSize: number;
  width: number;
  height: number;
  mimeType: string;
}

export function estimateDataUrlBytes(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return 0;
  const base64 = dataUrl.slice(commaIdx + 1);
  return Math.round((base64.length * 3) / 4);
}

export function formatByteSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode selected image file.'));
    img.src = src;
  });
}

function encodeCanvasToOptimizedUrl(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
  quality: number
): ProcessedImageResult {
  const ratio = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight, 1);
  const width = Math.max(1, Math.round(img.naturalWidth * ratio));
  const height = Math.max(1, Math.round(img.naturalHeight * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable in this browser.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  let mimeType = 'image/webp';
  let dataUrl = canvas.toDataURL('image/webp', quality);
  if (!dataUrl.startsWith('data:image/webp')) {
    mimeType = 'image/jpeg';
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  return {
    dataUrl,
    byteSize: estimateDataUrlBytes(dataUrl),
    width,
    height,
    mimeType,
  };
}

/**
 * Resizes and compresses a user-selected garment image into a lightweight WebP data URI
 * (typically 90-160 KB vs multi-megabyte smartphone originals or 30MB+ videos).
 */
export async function compressImageToWebP(
  file: File,
  maxWidth = 900,
  maxHeight = 1200,
  quality = 0.82
): Promise<ProcessedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose a valid image file (JPG, PNG, or WebP).');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(objectUrl);
    return encodeCanvasToOptimizedUrl(img, maxWidth, maxHeight, quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Compresses an existing data URL (such as an AI-generated model drape PNG) to lightweight WebP.
 */
export async function compressDataUrlToWebP(
  sourceDataUrl: string,
  maxWidth = 900,
  maxHeight = 1200,
  quality = 0.82
): Promise<ProcessedImageResult> {
  const img = await loadImageElement(sourceDataUrl);
  return encodeCanvasToOptimizedUrl(img, maxWidth, maxHeight, quality);
}

/**
 * Triggers browser download of a data URL image with a standardized SKU filename.
 */
export function downloadDataUrlAsFile(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Downloads an image (data URL or remote HTTPS URL) to the user's device.
 * For remote URLs, fetches as Blob to guarantee standard browser download for social media sharing.
 */
export async function downloadImageFile(urlOrDataUrl: string, filename: string): Promise<void> {
  if (urlOrDataUrl.startsWith('data:')) {
    downloadDataUrlAsFile(urlOrDataUrl, filename);
    return;
  }

  try {
    const res = await fetch(urlOrDataUrl, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
  } catch (err) {
    console.warn('Cross-origin direct download failed, falling back to direct anchor:', err);
    const a = document.createElement('a');
    a.href = urlOrDataUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
