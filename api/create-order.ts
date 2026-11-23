import Razorpay from 'razorpay';

export interface CreateOrderRequest {
  amount?: number | string;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResponse {
  success?: boolean;
  order_id?: string;
  id?: string;
  amount?: number;
  currency?: string;
  receipt?: string;
  status?: string;
  error?: string;
  message?: string;
}

/**
 * Creates a Razorpay order with server-side API credentials.
 * Validates that amount >= 100 paise (Razorpay minimum transaction requirement).
 */
export async function createRazorpayOrder(
  body: CreateOrderRequest,
  customKeyId?: string,
  customKeySecret?: string
): Promise<{ status: number; body: CreateOrderResponse }> {
  const keyId = customKeyId || process.env.RAZORPAY_KEY_ID;
  const keySecret = customKeySecret || process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return {
      status: 401,
      body: {
        success: false,
        error: 'AUTH_FAILED',
        message: 'Razorpay credentials (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) are not configured on the server.',
      },
    };
  }

  // Validate amount in paise
  const rawAmount = body?.amount;
  const parsedAmount = typeof rawAmount === 'string' ? parseInt(rawAmount, 10) : Number(rawAmount);

  if (!rawAmount || isNaN(parsedAmount) || parsedAmount < 100) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'INVALID_AMOUNT',
        message: 'Amount is required and must be an integer of at least 100 paise (₹1.00).',
      },
    };
  }

  const currency = (body.currency || 'INR').toUpperCase();
  const receipt = (body.receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`).slice(0, 40);

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderOptions: {
      amount: number;
      currency: string;
      receipt: string;
      notes?: Record<string, string>;
    } = {
      amount: Math.round(parsedAmount),
      currency,
      receipt,
      notes: body.notes || {},
    };

    const order = await razorpay.orders.create(orderOptions);

    return {
      status: 200,
      body: {
        success: true,
        order_id: order.id,
        id: order.id,
        amount: order.amount as number,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      },
    };
  } catch (err: any) {
    // Check if authentication failed with Razorpay API
    if (err?.statusCode === 401 || err?.error?.code === 'BAD_REQUEST_ERROR' && err?.error?.description?.includes('Authentication failed')) {
      return {
        status: 401,
        body: {
          success: false,
          error: 'AUTH_FAILED',
          message: err?.error?.description || 'Razorpay authentication failed. Verify API Key ID and Secret.',
        },
      };
    }

    return {
      status: 500,
      body: {
        success: false,
        error: 'ORDER_CREATION_FAILED',
        message: err?.error?.description || err?.message || 'Failed to create Razorpay order.',
      },
    };
  }
}

/**
 * Vercel Serverless Function handler for POST /api/create-order
 */
export default async function handler(
  req: { method?: string; body?: CreateOrderRequest },
  res: { status: (code: number) => { json: (data: unknown) => void } }
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed. Use POST /api/create-order',
    });
    return;
  }

  try {
    const result = await createRazorpayOrder(req.body || {});
    res.status(result.status).json(result.body);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: err instanceof Error ? err.message : 'Internal error creating order',
    });
  }
}
