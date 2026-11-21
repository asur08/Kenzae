import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { KenzaeProduct } from '../types/catalog';
import { BoutiqueOrder } from '../types/orders';

export interface DatabaseProductRow {
  id: string;
  sku: string;
  title: string;
  category: string;
  sub_category?: string | null;
  price: number;
  currency: string;
  description?: string | null;
  fabric_details?: string | null;
  color?: string | null;
  images: string[];
  image_roles?: string[] | null;
  video_url?: string | null;
  video_thumbnail_url?: string | null;
  in_stock: boolean;
  stock_quantity: number;
  is_featured: boolean;
  whatsapp_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseOrderRow {
  id: string;
  order_number: string;
  invoice_number: string;
  customer: BoutiqueOrder['customer'];
  items: BoutiqueOrder['items'];
  subtotal: number;
  tailoring_total: number;
  shipping_fee: number;
  grand_total: number;
  tax_breakdown: BoutiqueOrder['taxBreakdown'];
  payment_method: string;
  payment_status: string;
  razorpay_payment_id?: string | null;
  fulfillment_status: string;
  courier_partner?: string | null;
  tracking_awb?: string | null;
  tracking_url?: string | null;
  staff_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  dispatched_at?: string | null;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// Supports modern Supabase Publishable Key (sb_publish_...) and legacy Anon Key
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseKey &&
    supabaseKey.length > 20
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Mapper: DB Row -> KenzaeProduct (Frontend entity)
 */
export function mapDbRowToProduct(row: DatabaseProductRow): KenzaeProduct {
  return {
    id: row.id,
    sku: row.sku,
    title: row.title,
    category: row.category as KenzaeProduct['category'],
    subCategory: row.sub_category || undefined,
    price: Number(row.price),
    currency: (row.currency || 'INR') as 'INR',
    description: row.description || undefined,
    fabricDetails: row.fabric_details || undefined,
    color: row.color || undefined,
    images: Array.isArray(row.images) ? row.images : [],
    imageRoles: Array.isArray(row.image_roles) ? (row.image_roles as KenzaeProduct['imageRoles']) : undefined,
    videoUrl: row.video_url || undefined,
    videoThumbnailUrl: row.video_thumbnail_url || undefined,
    in_stock: Boolean(row.in_stock),
    stockQuantity: Number(row.stock_quantity ?? (row.in_stock ? 1 : 0)),
    isFeatured: Boolean(row.is_featured),
    whatsappMessage: row.whatsapp_message || undefined,
  };
}

/**
 * Mapper: KenzaeProduct -> DB Row
 */
export function mapProductToDbRow(p: KenzaeProduct): Partial<DatabaseProductRow> {
  return {
    id: p.id,
    sku: p.sku,
    title: p.title,
    category: p.category,
    sub_category: p.subCategory || null,
    price: p.price,
    currency: p.currency || 'INR',
    description: p.description || null,
    fabric_details: p.fabricDetails || null,
    color: p.color || null,
    images: p.images || [],
    image_roles: p.imageRoles || [],
    video_url: p.videoUrl || null,
    video_thumbnail_url: p.videoThumbnailUrl || null,
    in_stock: p.in_stock,
    stock_quantity: p.stockQuantity ?? (p.in_stock ? 1 : 0),
    is_featured: Boolean(p.isFeatured),
    whatsapp_message: p.whatsappMessage || null,
  };
}
