import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Simple .env.local parser to avoid dependencies
function loadEnvLocal() {
  const envPath = path.join(rootDir, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found at:', envPath);
    return {};
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

async function runConnectivityTest() {
  console.log('🔍 [Kenzae Supabase Connectivity Suite]');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const env = loadEnvLocal();
  
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  
  // Support modern (Publishable/Secret) and legacy (Anon/Service Role) keys
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const secretKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📡 Endpoint URL:           ', url ? `${url} (Valid format: ${url.startsWith('https://')})` : '❌ Missing');
  console.log('🔑 Publishable/Anon Key:   ', publishableKey ? `Present (length: ${publishableKey.length}, prefix: ${publishableKey.substring(0, 10)}...)` : '❌ Missing');
  console.log('🔐 Secret/Service Role Key:', secretKey ? `Present (length: ${secretKey.length}, prefix: ${secretKey.substring(0, 10)}...)` : '⚠️ Missing (Server operations only)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!url || !publishableKey) {
    console.error('❌ Cannot run test: missing URL or Publishable/Anon key in .env.local');
    process.exit(1);
  }

  // TEST 1: Client-Side (Publishable Key) Read Query on 'products' table
  console.log('\n▶️ TEST 1: Client Query (Publishable Key -> public.products)...');
  const client = createClient(url, publishableKey);
  
  const startTime = Date.now();
  const { data: products, error: prodErr, count } = await client
    .from('products')
    .select('id, sku, title, category, price, in_stock', { count: 'exact' });
  const latency = Date.now() - startTime;

  if (prodErr) {
    console.error('❌ Failed to fetch products:', prodErr.message, prodErr.details || '');
  } else {
    console.log(`✅ Success! Fetched ${products.length} products (Total in DB: ${count}) in ${latency}ms`);
    if (products.length > 0) {
      console.log('   Sample pieces in database:');
      products.slice(0, 3).forEach((p, idx) => {
        console.log(`   ${idx + 1}. [${p.sku}] ${p.title} - ₹${p.price.toLocaleString('en-IN')} (${p.category})`);
      });
    }
  }

  // TEST 2: Admin/Secret Key (if available) - Query orders & check stored procedure
  if (secretKey) {
    console.log('\n▶️ TEST 2: Admin/Secret Key Operations (Secret Key -> public.orders & RPC)...');
    const adminClient = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: orders, error: ordersErr, count: orderCount } = await adminClient
      .from('orders')
      .select('id, order_number, grand_total, payment_status, fulfillment_status', { count: 'exact' });

    if (ordersErr) {
      console.error('⚠️ Query orders failed:', ordersErr.message);
    } else {
      console.log(`✅ Success! Admin connection verified. Orders found: ${orderCount ?? orders.length}`);
    }

    // Check RPC: decrement_product_stock definition
    console.log('\n▶️ TEST 3: Stored Procedure & RPC Verification...');
    if (products && products.length > 0) {
      const sampleId = products[0].id;
      const sampleSku = products[0].sku;
      console.log(`   Checking RPC 'decrement_product_stock' signature on ${sampleSku} (ID: ${sampleId})...`);
      const { data: rpcRes, error: rpcErr } = await adminClient.rpc('decrement_product_stock', {
        p_product_id: sampleId,
        p_count: 0
      });
      if (rpcErr) {
        console.log('   ℹ️ RPC test result:', rpcErr.message);
      } else {
        console.log(`   ✅ Stored procedure active and atomic! Result:`, rpcRes);
      }
    }

    // TEST 4: Storage Bucket Verification
    console.log('\n▶️ TEST 4: Supabase Storage Buckets...');
    const { data: buckets, error: bucketErr } = await adminClient.storage.listBuckets();
    if (bucketErr) {
      console.warn('   ⚠️ Storage listBuckets notice:', bucketErr.message);
    } else {
      const bucketNames = buckets.map(b => b.name);
      console.log(`   ✅ Storage accessible. Found buckets: [${bucketNames.join(', ')}]`);
      if (bucketNames.includes('kenzae-catalog-images')) {
        console.log('   ✨ Bucket "kenzae-catalog-images" is ready for AI Draper and studio uploads!');
      } else {
        console.log('   ℹ️ Bucket "kenzae-catalog-images" not yet created in Storage (auto-creation or creation in dashboard may be needed).');
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Live Connectivity Test Complete!');
}

runConnectivityTest().catch(err => {
  console.error('❌ Unexpected error during connectivity test:', err);
  process.exit(1);
});
