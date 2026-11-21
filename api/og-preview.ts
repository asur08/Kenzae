import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { KenzaeProduct } from '../src/types/catalog';

function loadCatalogProducts(): KenzaeProduct[] {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const productsPath = path.resolve(__dirname, '../data/products.json');
    return JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  } catch {
    return [];
  }
}

const defaultProducts = loadCatalogProducts();

interface VercelServerlessRequest {
  query?: {
    item?: string;
    sku?: string;
    id?: string;
  };
  headers?: Record<string, string>;
}

interface VercelServerlessResponse {
  status: (code: number) => VercelServerlessResponse;
  setHeader: (key: string, value: string) => VercelServerlessResponse;
  send: (body: string) => void;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatPriceINR(amount: number): string {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

export function resolveProductForOG(queryParam?: string): KenzaeProduct | null {
  if (!queryParam) return null;
  const clean = queryParam.trim().toLowerCase();

  const found = (defaultProducts as KenzaeProduct[]).find(
    (p) =>
      p.sku.toLowerCase() === clean ||
      p.id.toLowerCase() === clean ||
      p.sku.toLowerCase().replace(/[^a-z0-9]/g, '') === clean.replace(/[^a-z0-9]/g, '')
  );

  return found || null;
}

export function buildOpenGraphHtml(product: KenzaeProduct, baseUrl = 'https://kenzae.com'): string {
  const formattedPrice = formatPriceINR(product.price);
  const title = `${product.title} | ${formattedPrice} — Kenzae Designer Boutique`;
  const description = `${product.fabricDetails ? `${product.fabricDetails}. ` : ''}${
    product.description || 'Handcrafted bespoke designer ethnic couture from Kenzae Boutique, Mulanthuruthy, Kerala.'
  }`;
  const primaryImage = product.images[0] || `${baseUrl}/images/kenzae-social-cover.jpg`;
  const canonicalUrl = `${baseUrl}/?item=${encodeURIComponent(product.sku)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="Kenzae Designer Boutique" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(primaryImage)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(primaryImage)}" />
  <meta property="og:image:width" content="1000" />
  <meta property="og:image:height" content="1333" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="product:price:amount" content="${product.price}" />
  <meta property="product:price:currency" content="${product.currency || 'INR'}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(primaryImage)}" />

  <!-- Instant Browser Redirect for Human Visitors -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}" />
  <script>
    window.location.replace(${JSON.stringify(canonicalUrl)});
  </script>
</head>
<body style="background:#FAF8F5;font-family:serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#0F382A;text-align:center;">
  <div>
    <h1 style="font-size:24px;letter-spacing:0.2em;text-transform:uppercase;">KENZAE</h1>
    <p style="font-size:14px;color:#5C5852;">Taking you to ${escapeHtml(product.title)} (${escapeHtml(formattedPrice)})...</p>
    <p><a href="${escapeHtml(canonicalUrl)}" style="color:#0F382A;font-weight:bold;">Click here if you are not redirected immediately</a></p>
  </div>
</body>
</html>`;
}

export default async function handler(
  req: VercelServerlessRequest,
  res: VercelServerlessResponse
): Promise<void> {
  const queryParam = req.query?.item || req.query?.sku || req.query?.id;
  const host = req.headers?.host || 'kenzae.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const product = resolveProductForOG(queryParam);

  if (!product) {
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Kenzae | Designer Ethnic Wear &amp; Couture</title>
  <meta name="description" content="Explore Kenzae premier collection of handwoven saris, designer churidar sets, and dress materials. Mulanthuruthy, Kerala." />
  <meta property="og:title" content="Kenzae | Designer Ethnic Wear &amp; Couture" />
  <meta property="og:description" content="Mulanthuruthy, Ernakulam District, Kerala." />
  <meta property="og:image" content="${baseUrl}/images/kenzae-social-cover.jpg" />
  <meta http-equiv="refresh" content="0;url=${baseUrl}/" />
</head>
<body><script>window.location.replace('${baseUrl}/');</script></body>
</html>`;

    res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(fallbackHtml);
    return;
  }

  const html = buildOpenGraphHtml(product, baseUrl);
  res
    .status(200)
    .setHeader('Content-Type', 'text/html; charset=utf-8')
    .setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200')
    .send(html);
}
