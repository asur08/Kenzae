import { supabase, isSupabaseConfigured, mapDbRowToProduct, mapProductToDbRow, DatabaseProductRow } from './supabaseClient';
import { KenzaeProduct } from '../types/catalog';

export interface CatalogServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'supabase' | 'local_fallback';
}

/**
 * Fetch all catalog products from Supabase.
 * Returns null if Supabase is unconfigured or unavailable, triggering local fallback.
 */
export async function fetchRemoteProducts(): Promise<KenzaeProduct[] | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[CatalogService] Supabase fetch error, falling back to local cache:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return (data as DatabaseProductRow[]).map(mapDbRowToProduct);
  } catch (err) {
    console.warn('[CatalogService] Network/database exception:', err);
    return null;
  }
}

/**
 * Upsert a single product in Supabase.
 */
export async function saveRemoteProduct(product: KenzaeProduct): Promise<CatalogServiceResponse<KenzaeProduct>> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: true, data: product, source: 'local_fallback' };
  }

  try {
    const row = mapProductToDbRow(product);
    const { data, error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message, source: 'supabase' };
    }

    return {
      success: true,
      data: mapDbRowToProduct(data as DatabaseProductRow),
      source: 'supabase',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Database communication failed',
      source: 'supabase',
    };
  }
}

/**
 * Update product price in Supabase.
 */
export async function updateRemoteProductPrice(
  id: string,
  newPrice: number
): Promise<CatalogServiceResponse> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: true, source: 'local_fallback' };
  }

  try {
    const { error } = await supabase
      .from('products')
      .update({ price: newPrice })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message, source: 'supabase' };
    }

    return { success: true, source: 'supabase' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update remote price',
      source: 'supabase',
    };
  }
}

/**
 * Update stock count in Supabase.
 */
export async function updateRemoteProductStock(
  id: string,
  newStock: number
): Promise<CatalogServiceResponse> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: true, source: 'local_fallback' };
  }

  try {
    const inStock = newStock > 0;
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newStock, in_stock: inStock })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message, source: 'supabase' };
    }

    return { success: true, source: 'supabase' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update remote stock',
      source: 'supabase',
    };
  }
}

/**
 * Atomic stock decrement via PostgreSQL RPC.
 * Guarantees zero double-selling for exclusive boutique pieces.
 */
export async function decrementRemoteProductStock(
  id: string,
  count = 1
): Promise<{ success: boolean; remainingStock?: number; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: true };
  }

  try {
    const { data, error } = await supabase.rpc('decrement_product_stock', {
      p_product_id: id,
      p_count: count,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const result = data as { success: boolean; remaining_stock?: number; error?: string };
    return {
      success: result.success,
      remainingStock: result.remaining_stock,
      error: result.error,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'RPC decrement execution error',
    };
  }
}

/**
 * Delete a product from Supabase.
 */
export async function deleteRemoteProduct(id: string): Promise<CatalogServiceResponse> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: true, source: 'local_fallback' };
  }

  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message, source: 'supabase' };
    }
    return { success: true, source: 'supabase' };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete product',
      source: 'supabase',
    };
  }
}

/**
 * Realtime subscription: Listens for INSERT, UPDATE, DELETE on 'products' table.
 */
export function subscribeToProductRealtime(
  onChanged: (payload: { eventType: string; product?: KenzaeProduct; id?: string }) => void
): (() => void) | null {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const channel = supabase
    .channel('realtime:kenzae-products')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onChanged({ eventType: 'DELETE', id: (payload.old as { id: string }).id });
        } else if (payload.new) {
          const product = mapDbRowToProduct(payload.new as DatabaseProductRow);
          onChanged({ eventType: payload.eventType, product, id: product.id });
        }
      }
    )
    .subscribe();

  return () => {
    supabase?.removeChannel(channel);
  };
}
