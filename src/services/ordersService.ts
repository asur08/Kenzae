import { supabase, isSupabaseConfigured, DatabaseOrderRow } from './supabaseClient';
import { BoutiqueOrder, FulfillmentStatus, PaymentStatus, CourierPartner } from '../types/orders';

function mapDbRowToOrder(row: DatabaseOrderRow): BoutiqueOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    invoiceNumber: row.invoice_number,
    customer: row.customer,
    items: row.items,
    subtotal: row.subtotal,
    tailoringTotal: row.tailoring_total,
    shippingFee: row.shipping_fee,
    grandTotal: row.grand_total,
    taxBreakdown: row.tax_breakdown,
    paymentMethod: row.payment_method as BoutiqueOrder['paymentMethod'],
    paymentStatus: row.payment_status as BoutiqueOrder['paymentStatus'],
    razorpayPaymentId: row.razorpay_payment_id || undefined,
    fulfillmentStatus: row.fulfillment_status as BoutiqueOrder['fulfillmentStatus'],
    courierPartner: (row.courier_partner as CourierPartner) || undefined,
    trackingAwb: row.tracking_awb || undefined,
    trackingUrl: row.tracking_url || undefined,
    staffNotes: row.staff_notes || undefined,
    dispatchedAt: row.dispatched_at || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function mapOrderToDbRow(order: BoutiqueOrder): Partial<DatabaseOrderRow> {
  return {
    id: order.id,
    order_number: order.orderNumber,
    invoice_number: order.invoiceNumber,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    tailoring_total: order.tailoringTotal,
    shipping_fee: order.shippingFee,
    grand_total: order.grandTotal,
    tax_breakdown: order.taxBreakdown,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    razorpay_payment_id: order.razorpayPaymentId || null,
    fulfillment_status: order.fulfillmentStatus,
    courier_partner: order.courierPartner || null,
    tracking_awb: order.trackingAwb || null,
    tracking_url: order.trackingUrl || null,
    staff_notes: order.staffNotes || null,
    dispatched_at: order.dispatchedAt || null,
  };
}

/**
 * Fetch all boutique orders (Staff Portal view).
 */
export async function fetchRemoteOrders(): Promise<BoutiqueOrder[] | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[OrdersService] Supabase fetch error, falling back to local storage:', error.message);
      return null;
    }

    if (!data) return [];
    return (data as DatabaseOrderRow[]).map(mapDbRowToOrder);
  } catch (err) {
    console.warn('[OrdersService] Network error fetching orders:', err);
    return null;
  }
}

/**
 * Save new order into Supabase upon checkout completion.
 */
export async function saveRemoteOrder(
  order: BoutiqueOrder
): Promise<{ success: boolean; error?: string; source: 'supabase' | 'local_fallback' }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: true, source: 'local_fallback' };
  }

  try {
    const row = mapOrderToDbRow(order);
    const { error } = await supabase.from('orders').insert(row);

    if (error) {
      console.error('[OrdersService] Insert order error:', error.message);
      return { success: false, error: error.message, source: 'supabase' };
    }

    return { success: true, source: 'supabase' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Database error while saving order',
      source: 'supabase',
    };
  }
}

/**
 * Update order fulfillment status in Supabase.
 */
export async function updateRemoteOrderStatus(
  orderId: string,
  status: FulfillmentStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({ fulfillment_status: status })
      .eq('id', orderId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
  }
}

/**
 * Update payment status in Supabase.
 */
export async function updateRemotePaymentStatus(
  orderId: string,
  status: PaymentStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status })
      .eq('id', orderId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
  }
}

/**
 * Mark order dispatched with courier partner and tracking AWB in Supabase.
 */
export async function dispatchRemoteOrder(
  orderId: string,
  dispatchData: {
    courierPartner: CourierPartner;
    trackingAwb: string;
    trackingUrl: string;
    dispatchedAt: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        fulfillment_status: 'shipped',
        courier_partner: dispatchData.courierPartner,
        tracking_awb: dispatchData.trackingAwb,
        tracking_url: dispatchData.trackingUrl,
        dispatched_at: dispatchData.dispatchedAt,
      })
      .eq('id', orderId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Dispatch update failed' };
  }
}

/**
 * Realtime subscription: Listens for incoming orders or status changes in real-time.
 */
export function subscribeToOrdersRealtime(
  onOrderEvent: (event: { eventType: string; order?: BoutiqueOrder; id?: string }) => void
): (() => void) | null {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const channel = supabase
    .channel('realtime:kenzae-orders')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onOrderEvent({ eventType: 'DELETE', id: (payload.old as { id: string }).id });
        } else if (payload.new) {
          const order = mapDbRowToOrder(payload.new as DatabaseOrderRow);
          onOrderEvent({ eventType: payload.eventType, order, id: order.id });
        }
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}
