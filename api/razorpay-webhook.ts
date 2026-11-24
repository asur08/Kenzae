import crypto from 'crypto';

export interface RazorpayWebhookPayload {
  entity?: string;
  account_id?: string;
  event: string;
  contains?: string[];
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        entity?: string;
        amount?: number;
        currency?: string;
        status?: string;
        order_id?: string;
        invoice_id?: string | null;
        international?: boolean;
        method?: string;
        amount_refunded?: number;
        refund_status?: string | null;
        captured?: boolean;
        description?: string;
        email?: string;
        contact?: string;
        notes?: Record<string, string>;
        error_code?: string | null;
        error_description?: string | null;
        created_at?: number;
      };
    };
    order?: {
      entity?: {
        id?: string;
        entity?: string;
        amount?: number;
        amount_paid?: number;
        amount_due?: number;
        currency?: string;
        receipt?: string;
        status?: string;
        attempts?: number;
        notes?: Record<string, string>;
        created_at?: number;
      };
    };
    refund?: {
      entity?: {
        id?: string;
        amount?: number;
        currency?: string;
        payment_id?: string;
        status?: string;
      };
    };
  };
  created_at?: number;
}

export interface WebhookResult {
  status: number;
  body: {
    success: boolean;
    message?: string;
    event?: string;
    payment_id?: string;
    order_id?: string;
    error?: string;
  };
}

/**
 * Validates Razorpay Webhook HMAC-SHA256 signature and processes the event.
 *
 * @param rawBody - The raw, unparsed string or Buffer of the webhook HTTP request body.
 * @param signature - The signature string from the 'x-razorpay-signature' HTTP header.
 * @param customSecret - Optional override for the webhook secret (defaults to process.env.RAZORPAY_WEBHOOK_SECRET).
 */
export function verifyAndProcessWebhook(
  rawBody: string | Buffer,
  signature: string | undefined,
  customSecret?: string
): WebhookResult {
  const webhookSecret = customSecret || process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return {
      status: 500,
      body: {
        success: false,
        error: 'CONFIG_ERROR',
        message: 'RAZORPAY_WEBHOOK_SECRET is not configured on the server.',
      },
    };
  }

  if (!signature) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'MISSING_SIGNATURE',
        message: 'Missing x-razorpay-signature HTTP header.',
      },
    };
  }

  const rawBodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBodyString)
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
          error: 'INVALID_SIGNATURE',
          message: 'Razorpay webhook signature verification failed.',
        },
      };
    }

    // Parse verified payload
    const eventData = JSON.parse(rawBodyString) as RazorpayWebhookPayload;
    const eventName = eventData.event;
    const payment = eventData.payload?.payment?.entity;
    const order = eventData.payload?.order?.entity;

    const paymentId = payment?.id;
    const orderId = payment?.order_id || order?.id;

    // Route event according to event type
    switch (eventName) {
      case 'order.paid':
        console.log(`[Razorpay Webhook] Order paid: ${orderId} (Payment: ${paymentId})`);
        break;

      case 'payment.captured':
        console.log(`[Razorpay Webhook] Payment captured: ${paymentId} for Order: ${orderId}, Amount: ₹${((payment?.amount || 0) / 100).toFixed(2)}`);
        break;

      case 'payment.failed':
        console.warn(`[Razorpay Webhook] Payment failed: ${paymentId} for Order: ${orderId}. Reason: ${payment?.error_description || 'Unknown'}`);
        break;

      default:
        console.log(`[Razorpay Webhook] Received unhandled event: ${eventName}`);
        break;
    }

    return {
      status: 200,
      body: {
        success: true,
        message: `Webhook event '${eventName}' received and processed successfully.`,
        event: eventName,
        payment_id: paymentId,
        order_id: orderId,
      },
    };
  } catch (err: any) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'PARSE_ERROR',
        message: err instanceof Error ? err.message : 'Invalid webhook JSON payload.',
      },
    };
  }
}

/**
 * Vercel Serverless Function handler for POST /api/razorpay-webhook
 */
export default async function handler(
  req: {
    method?: string;
    headers?: Record<string, string | string[] | undefined>;
    body?: any;
    rawBody?: string | Buffer;
  },
  res: { status: (code: number) => { json: (data: unknown) => void; send: (data: string) => void } }
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed. Use POST /api/razorpay-webhook',
    });
    return;
  }

  const rawHeader = req.headers?.['x-razorpay-signature'];
  const signature = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  // In Vercel serverless, body can either be a raw Buffer/string or auto-parsed
  let rawBodyContent = req.rawBody;
  if (!rawBodyContent) {
    if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
      rawBodyContent = req.body;
    } else if (req.body) {
      rawBodyContent = JSON.stringify(req.body);
    } else {
      rawBodyContent = '';
    }
  }

  const result = verifyAndProcessWebhook(rawBodyContent, signature);
  res.status(result.status).json(result.body);
}
