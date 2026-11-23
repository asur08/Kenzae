import { CartTotals, ShippingAddress } from '../types/cart';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Dynamically loads the official Razorpay Checkout SDK into the document.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load official Razorpay SDK script from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface InitiatePaymentParams {
  keyId?: string;
  totals: CartTotals;
  customer: ShippingAddress;
  itemsSummary: string;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
  onDismiss?: () => void;
  onError?: (error: any) => void;
}

export interface CreateOrderApiResponse {
  success?: boolean;
  order_id: string;
  id?: string;
  amount: number;
  currency: string;
  receipt?: string;
  status?: string;
  error?: string;
  message?: string;
}

export interface VerifyPaymentApiResponse {
  success: boolean;
  verified: boolean;
  order_id?: string;
  payment_id?: string;
  error?: string;
  message?: string;
}

/**
 * Calls backend POST /api/create-order to create an authentic Razorpay Order.
 */
export async function createOrderOnServer(payload: {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}): Promise<CreateOrderApiResponse> {
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.order_id) {
    throw new Error(data.message || data.error || `Server order creation failed with status ${response.status}`);
  }

  return data;
}

/**
 * Calls backend POST /api/verify-payment to verify HMAC-SHA256 signature.
 */
export async function verifyPaymentOnServer(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<VerifyPaymentApiResponse> {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.verified) {
    throw new Error(data.message || data.error || 'Payment signature verification failed on server.');
  }

  return data;
}

/**
 * Initiates Razorpay Standard Web Checkout:
 * 1. Calls backend /api/create-order to obtain order_id
 * 2. Opens official Razorpay modal with order_id
 * 3. On success, calls backend /api/verify-payment to verify HMAC-SHA256 signature
 * 4. Calls onSuccess only if verified; calls onError on failure or signature mismatch
 */
export async function initiateRazorpayPayment({
  keyId,
  totals,
  customer,
  itemsSummary,
  onSuccess,
  onDismiss,
  onError,
}: InitiatePaymentParams): Promise<void> {
  const activeKey = keyId || (import.meta.env?.VITE_RAZORPAY_KEY_ID as string) || '';

  if (!activeKey) {
    const err = { description: 'Razorpay Key ID is not configured. Set VITE_RAZORPAY_KEY_ID in .env' };
    if (onError) onError(err);
    return;
  }

  // Ensure Razorpay SDK is loaded
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    const err = { description: 'Razorpay Checkout SDK failed to load. Please check your internet connection.' };
    if (onError) onError(err);
    return;
  }

  // Amount in Paise (e.g. ₹12,850 -> 1285000 paise, min 100 paise)
  const amountInPaise = Math.max(100, Math.round(totals.grandTotal * 100));

  try {
    // 1. Create order on backend
    const orderData = await createOrderOnServer({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        customer_name: customer.fullName || '',
        customer_phone: customer.phoneNumber || '',
        shipping_address: `${customer.streetAddress || ''}, ${customer.city || ''}, ${customer.state || ''} - ${customer.pincode || ''}`.trim(),
        store: 'Mulanthuruthy Boutique',
      },
    });

    const razorpayOrderId = orderData.order_id || orderData.id;
    if (!razorpayOrderId) {
      throw new Error('Order creation did not return a valid Razorpay order_id.');
    }

    // 2. Configure Razorpay modal options
    const options = {
      key: activeKey,
      amount: orderData.amount || amountInPaise,
      currency: orderData.currency || 'INR',
      name: 'Kenzae Designer Boutique',
      description: `Order for ${itemsSummary.slice(0, 80)}...`,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=120&h=120&q=80',
      order_id: razorpayOrderId,
      prefill: {
        name: customer.fullName,
        contact: customer.phoneNumber,
      },
      notes: {
        shipping_address: `${customer.streetAddress}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
        store: 'Mulanthuruthy Boutique',
      },
      theme: {
        color: '#0F382A', // Kenzae Deep Regal Emerald
      },
      handler: async (response: RazorpayPaymentSuccessResponse) => {
        try {
          // 3. Verify signature on backend
          const verifyResult = await verifyPaymentOnServer({
            razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature || '',
          });

          if (verifyResult.success && verifyResult.verified) {
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
              razorpay_signature: response.razorpay_signature,
            });
          } else {
            if (onError) {
              onError({
                description:
                  verifyResult.message ||
                  'Payment signature verification failed. Your order has NOT been marked as paid.',
              });
            }
          }
        } catch (verifyErr: any) {
          if (onError) {
            onError({
              description:
                verifyErr.message ||
                'Payment signature verification failed. Please contact boutique support with your payment ID.',
            });
          }
        }
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
    };

    const rzpInstance = new window.Razorpay(options);

    rzpInstance.on('payment.failed', (resp: any) => {
      if (onError) {
        const errorDesc =
          resp?.error?.description ||
          resp?.error?.reason ||
          'Payment transaction was cancelled or declined by your bank/UPI provider.';
        onError({ description: errorDesc });
      }
    });

    rzpInstance.open();
  } catch (err: any) {
    if (onError) {
      onError({
        description: err.message || 'Failed to initiate checkout with payment gateway.',
      });
    }
  }
}
