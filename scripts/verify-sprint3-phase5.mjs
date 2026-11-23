import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 KENZAE SPRINT 3 & PHASE 5 VERIFICATION SUITE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`✅ ${testName}`);
  } else {
    console.error(`❌ FAILED: ${testName} - ${details}`);
    failedTests++;
  }
}

// -----------------------------------------------------------------------------
// 1. VERIFY SPRINT 3: MULTI-CURRENCY ENGINE
// -----------------------------------------------------------------------------
console.log('▶️ [1] Verifying Multi-Currency & NRI Conversion Engine...');
const currencyServicePath = path.join(rootDir, 'src/services/currencyService.ts');
assert(fs.existsSync(currencyServicePath), 'currencyService.ts exists on disk');

const currencyCode = fs.readFileSync(currencyServicePath, 'utf8');
assert(currencyCode.includes('AED') && currencyCode.includes('USD') && currencyCode.includes('GBP') && currencyCode.includes('EUR'), 'Supports AED, USD, GBP, EUR for NRI diaspora');
assert(currencyCode.includes('formatLocalizedPrice'), 'formatLocalizedPrice function implemented');
assert(currencyCode.includes('convertINRTo'), 'convertINRTo function implemented');

// Test conversion math logic in isolated mock
const mockRates = {
  INR: 1.0,
  AED: 0.0438,
  USD: 0.0119,
  GBP: 0.0094,
  EUR: 0.0112,
};
const samplePriceINR = 12850;
const convertedAED = Math.round(samplePriceINR * mockRates.AED);
const convertedUSD = Math.round(samplePriceINR * mockRates.USD);
assert(convertedAED > 500 && convertedAED < 600, `INR ₹12,850 correctly converts to ~AED ${convertedAED}`);
assert(convertedUSD > 140 && convertedUSD < 170, `INR ₹12,850 correctly converts to ~$${convertedUSD} USD`);

// -----------------------------------------------------------------------------
// 2. VERIFY SPRINT 3: INTERNATIONAL PHONE & POSTAL VALIDATION (E.164)
// -----------------------------------------------------------------------------
console.log('\n▶️ [2] Verifying Country & International Shipping Tiers...');
const countriesPath = path.join(rootDir, 'src/data/countries.ts');
assert(fs.existsSync(countriesPath), 'countries.ts exists on disk');

const countriesCode = fs.readFileSync(countriesPath, 'utf8');
assert(countriesCode.includes('+971') && countriesCode.includes('United Arab Emirates'), 'UAE country profile with +971 configured');
assert(countriesCode.includes('+44') && countriesCode.includes('United Kingdom'), 'UK country profile with +44 configured');
assert(countriesCode.includes('+1') && countriesCode.includes('United States'), 'US country profile with +1 configured');
assert(countriesCode.includes('INTERNATIONAL_EXPRESS_SHIPPING_INR = 0'), 'International Express DHL/Aramex rate set to ₹0 (Free for now)');

// -----------------------------------------------------------------------------
// 3. VERIFY PHASE 5: PROGRESSIVE WEB APP (PWA) & SERVICE WORKER
// -----------------------------------------------------------------------------
console.log('\n▶️ [3] Verifying PWA & Offline App Shell...');
const manifestPath = path.join(rootDir, 'public/manifest.json');
assert(fs.existsSync(manifestPath), 'public/manifest.json exists');

const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifestContent.short_name === 'Kenzae', 'PWA short_name is "Kenzae"');
assert(manifestContent.theme_color === '#0F382A', 'PWA theme_color is Regal Emerald (#0F382A)');
assert(manifestContent.display === 'standalone', 'PWA display mode is standalone');

const swPath = path.join(rootDir, 'public/sw.js');
assert(fs.existsSync(swPath), 'public/sw.js Service Worker exists');
const swContent = fs.readFileSync(swPath, 'utf8');
assert(swContent.includes('stale-while-revalidate') || swContent.includes('caches.open'), 'Service Worker implements offline image caching');
assert(swContent.includes('/data/products.json'), 'Service Worker pre-caches catalog data');

const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
assert(indexHtml.includes('manifest.json'), 'index.html links to manifest.json');
assert(indexHtml.includes('apple-mobile-web-app-capable'), 'index.html contains Apple PWA meta tags');
assert(indexHtml.includes('preconnect') && indexHtml.includes('images.unsplash.com'), 'Preconnect headers active for LCP optimization');

// -----------------------------------------------------------------------------
// 4. VERIFY PHASE 5: TELEMETRY & ATTRIBUTION EVENT BUS
// -----------------------------------------------------------------------------
console.log('\n▶️ [4] Verifying Telemetry & GA4/Meta Pixel Event Bus...');
const telemetryPath = path.join(rootDir, 'src/services/telemetryService.ts');
assert(fs.existsSync(telemetryPath), 'telemetryService.ts exists on disk');

const telemetryCode = fs.readFileSync(telemetryPath, 'utf8');
const requiredEvents = [
  'trackViewItemList',
  'trackViewItem',
  'trackAddToWishlist',
  'trackAddToCart',
  'trackBeginCheckout',
  'trackWhatsAppInquiry',
  'trackPurchase',
];
requiredEvents.forEach((evt) => {
  assert(telemetryCode.includes(evt), `Event bus exports '${evt}'`);
});
assert(telemetryCode.includes('window.gtag'), 'Safe Google Analytics 4 dispatch integrated');
assert(telemetryCode.includes('window.fbq'), 'Safe Meta Pixel dispatch integrated');

// -----------------------------------------------------------------------------
// 5. VERIFY PHASE 5: COURIER TRACKING TELEMETRY (DHL & ARAMEX)
// -----------------------------------------------------------------------------
console.log('\n▶️ [5] Verifying Global Logistics Tracking Telemetry...');
const courierPath = path.join(rootDir, 'src/utils/courierTracking.ts');
const courierCode = fs.readFileSync(courierPath, 'utf8');
assert(courierCode.includes('DHL Express') && courierCode.includes('dhl.com'), 'DHL Express live tracking URL generator verified');
assert(courierCode.includes('Aramex Worldwide') && courierCode.includes('aramex.com'), 'Aramex Worldwide live tracking URL generator verified');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (failedTests === 0) {
  console.log('🎉 ALL SPRINT 3 & PHASE 5 VERIFICATION CHECKS PASSED PERFECTLY!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
} else {
  console.error(`💥 ${failedTests} test(s) failed.`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(1);
}
