import crypto from 'crypto';

export interface VerifyPaymentRequest {
  razorpay_order_id?: string;
  order_id?: string;
  razorpay_payment_id?: string;
  payment_id?: string;
  razorpay_signature?: string;
  signature?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified?: boolean;
  order_id?: string;
  payment_id?: string;
  error?: string;
  message?: string;
}

/**
 * Verifies Razorpay payment signature using HMAC-SHA256 algorithm.
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Uses timingSafeEqual to prevent side-channel timing attacks.
 */
export function verifyPaymentSignature(
  body: VerifyPaymentRequest,
  customKeySecret?: string
): { status: number; body: VerifyPaymentResponse } {
  const keySecret = customKeySecret || process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return {
      status: 500,
      body: {
        success: false,
        verified: false,
        error: 'CONFIG_ERROR',
        message: 'Razorpay secret key (RAZORPAY_KEY_SECRET) is not configured on the server.',
      },
    };
  }

  const orderId = body.razorpay_order_id || body.order_id;
  const paymentId = body.razorpay_payment_id || body.payment_id;
  const signature = body.razorpay_signature || body.signature;

  if (!orderId || !paymentId || !signature) {
    return {
      status: 400,
      body: {
        success: false,
        verified: false,
        error: 'MISSING_FIELDS',
        message: 'Missing required parameters. razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
      },
    };
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    const isMatch =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isMatch) {
      return {
        status: 400,
        body: {
          success: false,
          verified: false,
          error: 'SIGNATURE_MISMATCH',
          message: 'Payment signature verification failed. The payment could not be authenticated.',
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        verified: true,
        order_id: orderId,
        payment_id: paymentId,
        message: 'Payment signature verified successfully.',
      },
    };
  } catch (err: any) {
    return {
      status: 500,
      body: {
        success: false,
        verified: false,
        error: 'VERIFICATION_ERROR',
        message: err instanceof Error ? err.message : 'Error verifying payment signature.',
      },
    };
  }
}

/**
 * Vercel Serverless Function handler for POST /api/verify-payment
 */
export default async function handler(
  req: { method?: string; body?: VerifyPaymentRequest },
  res: { status: (code: number) => { json: (data: unknown) => void } }
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed. Use POST /api/verify-payment',
    });
    return;
  }

  try {
    const result = verifyPaymentSignature(req.body || {});
    res.status(result.status).json(result.body);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: err instanceof Error ? err.message : 'Internal error verifying payment',
    });
  }
}
