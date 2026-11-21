/**
 * Phase 2 Automated Verification Suite:
 * - Dynamic Open Graph Social Previews (WhatsApp & Instagram)
 * - Multi-Pose AI Lookbook Photoshoot Engine
 * - Drape Reels & Video Metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveProductForOG, buildOpenGraphHtml, formatPriceINR } from '../api/og-preview.ts';
import { POSE_DEFINITIONS, processMultiPoseDrape } from '../api/generate-drape.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultProducts = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../data/products.json'), 'utf8')
);

console.log('\n--- KENZAE PHASE 2 VERIFICATION SUITE ---\n');

let failed = false;

// 1. Verify Dynamic Open Graph Social Preview Engine
console.log('1. Testing Open Graph Social Preview Generator (/api/og-preview)...');
const testSku = 'KZ-SR-001';
const product = resolveProductForOG(testSku);

if (!product) {
  console.error(`❌ Failed to resolve product by SKU: ${testSku}`);
  failed = true;
} else {
  console.log(`✅ Product resolved for OG: ${product.title} (SKU: ${product.sku})`);
  const html = buildOpenGraphHtml(product, 'https://kenzae.com');

  const requiredMetaTags = [
    '<meta property="og:title"',
    formatPriceINR(product.price),
    '<meta property="og:image"',
    '<meta property="og:description"',
    '<meta property="og:type" content="product"',
    '<meta property="product:price:amount"',
    '<meta name="twitter:card" content="summary_large_image"',
    'window.location.replace',
  ];

  let ogValid = true;
  for (const tag of requiredMetaTags) {
    if (!html.includes(tag)) {
      console.error(`❌ OG HTML missing expected tag or content: "${tag}"`);
      ogValid = false;
      failed = true;
    }
  }

  if (ogValid) {
    console.log('✅ Dynamic Open Graph HTML contains all rich social sharing tags for WhatsApp & Instagram');
  }
}

// 2. Verify Multi-Pose AI Lookbook Studio (4 Poses)
console.log('\n2. Testing 4-Pose AI Photoshoot Engine (/api/generate-drape)...');
const requiredPoses = ['hero-front', 'walking-profile', 'pallu-craft', 'seated-heritage'];
let posesValid = true;
for (const p of requiredPoses) {
  if (!POSE_DEFINITIONS[p]) {
    console.error(`❌ Missing pose definition for ${p}`);
    posesValid = false;
    failed = true;
  }
}
if (posesValid) {
  console.log('✅ All 4 distinct editorial poses configured with high-fashion camera instructions:');
  requiredPoses.forEach((p) => {
    console.log(`   • ${p}: ${POSE_DEFINITIONS[p].title} [${POSE_DEFINITIONS[p].role}]`);
  });
}

const drapeBatchResult = await processMultiPoseDrape(
  {
    imageDataUrl: 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
    category: 'Saris',
    title: 'Pure Kanjivaram Silk Sari',
    modelArchetype: 'kerala-heritage',
    backdrop: 'ivory-atelier',
  },
  undefined
);

if (!drapeBatchResult.body.success || drapeBatchResult.body.looks.length !== 4) {
  console.error('❌ Multi-pose batch photoshoot generation failed');
  failed = true;
} else {
  console.log('✅ 4-look photoshoot batch returned successfully');
}

// 3. Verify Drape Video / Reel Support in Catalog
console.log('\n3. Testing Drape Video Reels in Catalog Data...');
const productsWithVideo = defaultProducts.filter((p) => p.videoUrl);
if (productsWithVideo.length === 0) {
  console.error('❌ Expected at least one product with videoUrl in data/products.json');
  failed = true;
} else {
  console.log(`✅ Found ${productsWithVideo.length} products with vertical drape video reels configured:`);
  productsWithVideo.forEach((p) => {
    console.log(`   • ${p.sku} (${p.title}): ${p.videoUrl.slice(0, 50)}...`);
  });
}

if (failed) {
  console.error('\n❌ Phase 2 verification encountered errors.\n');
  process.exit(1);
} else {
  console.log('\n🎉 ALL PHASE 2 TESTS PASSED PERFECTLY!\n');
}
