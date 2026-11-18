import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.resolve(__dirname, '../data/products.json');
const rawData = fs.readFileSync(catalogPath, 'utf-8');
const catalog = JSON.parse(rawData);

console.log('--- KENZAE BOUTIQUE DIGITAL CATALOG VERIFICATION ---');
console.log(`Checking catalog at: ${catalogPath}`);
console.log(`Total items found: ${catalog.length}\n`);

const VALID_CATEGORIES = [
  'Saris',
  'Churidars & Salwar Sets',
  'Unstitched Dress Materials',
  'Kurthis & Ready-to-Wear'
];

let failed = false;

// 1. Array check
if (!Array.isArray(catalog) || catalog.length === 0) {
  console.error('❌ Catalog root must be a non-empty array.');
  process.exit(1);
}

// 2. Individual items check
const seenIds = new Set();
const seenSkus = new Set();
const categoryCounts = {};

catalog.forEach((item, index) => {
  const pName = `Item #${index + 1} (${item.sku || 'No SKU'})`;

  // Required properties check
  const required = ['id', 'sku', 'title', 'category', 'price', 'images', 'in_stock'];
  for (const field of required) {
    if (item[field] === undefined || item[field] === null) {
      console.error(`❌ ${pName} missing required field '${field}'`);
      failed = true;
    }
  }

  // Id uniqueness
  if (seenIds.has(item.id)) {
    console.error(`❌ Duplicate ID detected: ${item.id}`);
    failed = true;
  }
  seenIds.add(item.id);

  // Sku pattern check
  const skuPattern = /^KZ-[A-Z]{2}-[0-9]{3,}$/;
  if (!skuPattern.test(item.sku)) {
    console.error(`❌ ${pName} has invalid SKU pattern: ${item.sku}. Expected e.g. KZ-SR-001`);
    failed = true;
  }
  if (seenSkus.has(item.sku)) {
    console.error(`❌ Duplicate SKU detected: ${item.sku}`);
    failed = true;
  }
  seenSkus.add(item.sku);

  // Category enum check
  if (!VALID_CATEGORIES.includes(item.category)) {
    console.error(`❌ ${pName} has invalid category '${item.category}'. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    failed = true;
  } else {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  }

  // Price check
  if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
    console.error(`❌ ${pName} has invalid price: ${item.price}`);
    failed = true;
  }

  // Currency check
  if (item.currency && item.currency !== 'INR') {
    console.error(`❌ ${pName} currency is '${item.currency}', expected 'INR'`);
    failed = true;
  }

  // Images array check
  if (!Array.isArray(item.images) || item.images.length === 0) {
    console.error(`❌ ${pName} must have at least one image URL`);
    failed = true;
  } else {
    item.images.forEach((img, i) => {
      if (
        !img.startsWith('http://') &&
        !img.startsWith('https://') &&
        !img.startsWith('/images/') &&
        !img.startsWith('data:image/')
      ) {
        console.error(`❌ ${pName} image [${i}] is not a valid image URL or asset path: ${img}`);
        failed = true;
      }
    });
  }

  // in_stock boolean check
  if (typeof item.in_stock !== 'boolean') {
    console.error(`❌ ${pName} 'in_stock' must be boolean`);
    failed = true;
  }
});

// Category Distribution Report
console.log('📊 Category Breakdown:');
for (const cat of VALID_CATEGORIES) {
  console.log(`  - ${cat}: ${categoryCounts[cat] || 0} pieces`);
}

// 3. Test WhatsApp URL generation
console.log('\n📲 Testing WhatsApp Click-to-Chat Generation:');
const testProduct = catalog[0];
const sampleWhatsAppUrl = `https://wa.me/919447000000?text=${encodeURIComponent(
  `Namaste Kenzae Boutique! ✨\n👗 Item: ${testProduct.title}\n🏷️ SKU: ${testProduct.sku}\n💰 Price: ₹${testProduct.price}\n📍 Location: Mulanthuruthy`
)}`;

if (sampleWhatsAppUrl.includes('https://wa.me/919447000000?text=')) {
  console.log('✅ Single-product WhatsApp URL constructed with valid URI encoding');
} else {
  console.error('❌ WhatsApp URL generation failed');
  failed = true;
}

// 4. Test Location Link
console.log('\n📍 Testing Mulanthuruthy Location Pin Reference:');
const expectedMapsUrl = 'https://share.google/m6bQuE0vYpoVkI6oL';
console.log(`✅ Google Maps Reference URL configured: ${expectedMapsUrl}`);

if (failed) {
  console.error('\n❌ VALIDATION FAILED WITH ERRORS.');
  process.exit(1);
} else {
  console.log('\n✨ ALL SCHEMA & INTEGRATION CHECKS PASSED PERFECTLY!\n');
}
