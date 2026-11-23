/**
 * Verification test to confirm Vite dev server middleware routes /api/create-order and /api/verify-payment
 */
import { createServer } from 'vite';
import crypto from 'crypto';

console.log('\n--- TESTING VITE DEV SERVER API MIDDLEWARE FOR RAZORPAY ---\n');

const server = await createServer({
  server: { port: 3099 },
});

await server.listen();
const address = server.httpServer?.address();
const port = typeof address === 'object' && address ? address.port : 3099;
const baseUrl = `http://localhost:${port}`;

console.log(`Vite dev server listening on ${baseUrl}`);

let failed = false;

try {
  // 1. Test POST /api/create-order over HTTP
  console.log('Testing HTTP POST /api/create-order...');
  const createRes = await fetch(`${baseUrl}/api/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 890000, // ₹8,900
      currency: 'INR',
      receipt: 'test_http_rcpt',
    }),
  });

  const createData = await createRes.json();
  if (createRes.status !== 200 || !createData.order_id) {
    console.error('❌ HTTP /api/create-order failed:', createRes.status, createData);
    failed = true;
  } else {
    console.log(`✅ HTTP /api/create-order returned HTTP 200 with order_id: ${createData.order_id}`);
  }

  // 2. Test HTTP POST /api/verify-payment with invalid signature
  console.log('Testing HTTP POST /api/verify-payment (mismatch signature rejection)...');
  const verifyResBad = await fetch(`${baseUrl}/api/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: createData.order_id,
      razorpay_payment_id: 'pay_test_random',
      razorpay_signature: 'fake_signature',
    }),
  });

  const verifyDataBad = await verifyResBad.json();
  if (verifyResBad.status !== 400 || verifyDataBad.error !== 'SIGNATURE_MISMATCH') {
    console.error('❌ HTTP /api/verify-payment failed to reject bad signature:', verifyResBad.status, verifyDataBad);
    failed = true;
  } else {
    console.log('✅ HTTP /api/verify-payment correctly returned HTTP 400 SIGNATURE_MISMATCH');
  }

  // 3. Test HTTP POST /api/verify-payment with authentic HMAC signature
  console.log('Testing HTTP POST /api/verify-payment (valid HMAC signature)...');
  const fakePaymentId = 'pay_test_authentic_123';
  const authenticSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '7V1a41KBNEOs0vsAV0RmN9n3')
    .update(`${createData.order_id}|${fakePaymentId}`)
    .digest('hex');

  const verifyResGood = await fetch(`${baseUrl}/api/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: createData.order_id,
      razorpay_payment_id: fakePaymentId,
      razorpay_signature: authenticSig,
    }),
  });

  const verifyDataGood = await verifyResGood.json();
  if (verifyResGood.status !== 200 || !verifyDataGood.verified) {
    console.error('❌ HTTP /api/verify-payment failed to verify valid signature:', verifyResGood.status, verifyDataGood);
    failed = true;
  } else {
    console.log('✅ HTTP /api/verify-payment verified authentic signature with HTTP 200');
  }
} catch (err) {
  console.error('❌ Network error during HTTP middleware test:', err);
  failed = true;
} finally {
  await server.close();
}

if (failed) {
  console.error('\n❌ Vite dev middleware test failed.\n');
  process.exit(1);
} else {
  console.log('\n🎉 VITE DEV SERVER RAZORPAY MIDDLEWARE TEST PASSED!\n');
}
