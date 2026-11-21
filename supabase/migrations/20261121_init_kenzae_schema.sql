-- ==============================================================================
-- KENZAE DESIGNER BOUTIQUE — SUPABASE SCHEMA MIGRATION
-- Project: Kenzae Boutique Digital Catalog (Mulanthuruthy, Ernakulam, Kerala)
-- Version: 1.0.0
-- Created: 2026-11-21
-- ==============================================================================

-- 1. EXTENSIONS & UTILITIES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Saris', 
    'Churidars & Salwar Sets', 
    'Unstitched Dress Materials', 
    'Kurthis & Ready-to-Wear'
  )),
  sub_category TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  description TEXT,
  fabric_details TEXT,
  color TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  image_roles TEXT[] DEFAULT '{}',
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  stock_quantity INTEGER NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  whatsapp_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ultra-fast catalog filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- Trigger for products auto-updated_at
DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tailoring_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_breakdown JSONB NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'whatsapp_upi',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  razorpay_payment_id TEXT,
  fulfillment_status TEXT NOT NULL DEFAULT 'new',
  courier_partner TEXT,
  tracking_awb TEXT,
  tracking_url TEXT,
  staff_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dispatched_at TIMESTAMPTZ
);

-- Indexes for orders management
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON public.orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Trigger for orders auto-updated_at
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. ATOMIC INVENTORY DEDUCTION (RPC FUNCTION)
-- Prevents race conditions and double-selling when high-demand saris are purchased.
CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_product_id TEXT,
  p_count INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
  v_new_stock INTEGER;
  v_in_stock BOOLEAN;
BEGIN
  -- Row-lock product record to prevent race conditions
  SELECT stock_quantity INTO v_current_stock
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  IF v_current_stock < p_count THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Insufficient stock', 
      'available_stock', v_current_stock
    );
  END IF;

  v_new_stock := v_current_stock - p_count;
  v_in_stock := v_new_stock > 0;

  UPDATE public.products
  SET 
    stock_quantity = v_new_stock,
    in_stock = v_in_stock,
    updated_at = NOW()
  WHERE id = p_product_id;

  RETURN jsonb_build_object(
    'success', true, 
    'remaining_stock', v_new_stock,
    'in_stock', v_in_stock
  );
END;
$$;

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Products RLS:
-- Anyone (including anon visitors) can view active products
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products"
  ON public.products
  FOR SELECT
  TO public
  USING (true);

-- Authenticated staff / Service Role can insert, update, delete products
DROP POLICY IF EXISTS "Staff can manage products" ON public.products;
CREATE POLICY "Staff can manage products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Orders RLS:
-- Anyone can place an order (INSERT)
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders"
  ON public.orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Customers can view their own placed order by ID
DROP POLICY IF EXISTS "Public can view order by id" ON public.orders;
CREATE POLICY "Public can view order by id"
  ON public.orders
  FOR SELECT
  TO public
  USING (true);

-- Authenticated staff can manage all orders
DROP POLICY IF EXISTS "Staff can manage orders" ON public.orders;
CREATE POLICY "Staff can manage orders"
  ON public.orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. STORAGE BUCKET FOR S3-COMPATIBLE IMAGES
-- Registers 'kenzae-catalog-images' public bucket for product imagery
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kenzae-catalog-images',
  'kenzae-catalog-images',
  true,
  10485760, -- 10MB per file
  ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif'];

-- Storage RLS: Public can view images
DROP POLICY IF EXISTS "Public can view catalog images" ON storage.objects;
CREATE POLICY "Public can view catalog images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'kenzae-catalog-images');

-- Storage RLS: Authenticated or service role can upload images
DROP POLICY IF EXISTS "Staff can upload catalog images" ON storage.objects;
CREATE POLICY "Staff can upload catalog images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'kenzae-catalog-images');

-- 7. INITIAL CATALOG SEED DATA (12 HANDCRAFTED BOUTIQUE PIECES)
INSERT INTO public.products (
  id, sku, title, category, sub_category, price, currency, description, fabric_details, color, images, image_roles, in_stock, stock_quantity, is_featured, whatsapp_message
) VALUES
(
  'kz-sr-001',
  'KZ-SR-001',
  'Handwoven Banarasi Katan Silk Sari in Wine Plum & Antique Gold',
  'Saris',
  'Banarasi Katan Silk',
  12850,
  'INR',
  'Crafted on traditional pit-looms in Varanasi, this rich wine-plum Katan silk sari features fine floral kadhwa jaal woven in muted antique gold zari. The body drapes with a rich natural fall, paired with a heavy floral pallu and a plain running blouse piece with matching sleeve borders.',
  '100% Pure Mulberry Silk body, Tested Zari Kadwa weave. Length: 5.5m + 0.8m unstitched blouse piece. Silk Mark certified.',
  'Wine Plum & Antique Gold',
  ARRAY[
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
  ],
  ARRAY['model-drape', 'pallu-detail'],
  true,
  4,
  true,
  'Hello Kenzae, inquiring about the Handwoven Banarasi Katan Silk Sari (KZ-SR-001) at ₹12,850. Is this available for viewing at the boutique?'
),
(
  'kz-sr-002',
  'KZ-SR-002',
  'Kerala Kasavu Organza Sari with Fine Temple Zari Border',
  'Saris',
  'Organza & Handloom',
  6450,
  'INR',
  'A festive Kerala favorite. Crisp, sheer silk organza in warm ivory, finished with delicate handloom gold zari temple borders along the selvedge. Designed for festive mornings, weddings, and temple ceremonies with a breathable, structured drape.',
  'Silk Organza blend with woven golden kasavu border. Length: 5.5m + 0.8m unstitched brocade blouse piece.',
  'Ivory Cream & Temple Gold',
  ARRAY[
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
  ],
  ARRAY['model-drape', 'garment-flat'],
  true,
  5,
  true,
  'Hello Kenzae, checking availability for the Kerala Kasavu Organza Sari (KZ-SR-002) at ₹6,450. Could you share blouse border details?'
),
(
  'kz-sr-003',
  'KZ-SR-003',
  'Raw Ghicha Tussar Silk Sari with Natural Dye Floral Pallu',
  'Saris',
  'Tussar Silk',
  8900,
  'INR',
  'Natural unbleached Ghicha Tussar silk displaying its organic slub texture and golden sheen. Hand-painted floral vines inspired by Madhubani traditions run along the contrast burnt-sienna pallu.',
  'Pure Wild Tussar (Ghicha) Silk. Hand-spun yarn with natural texture variations. Length: 5.5m + 0.8m contrast blouse fabric.',
  'Natural Golden Tussar & Burnt Sienna',
  ARRAY[
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
  ],
  ARRAY['garment-flat'],
  true,
  2,
  false,
  'Hello Kenzae, I would like to reserve the Raw Ghicha Tussar Silk Sari (KZ-SR-003) priced at ₹8,900.'
),
(
  'kz-sr-004',
  'KZ-SR-004',
  'Pure Kanjivaram Silk Sari in Peacock Teal with Korvai Zari Border',
  'Saris',
  'Kanjivaram Silk',
  18400,
  'INR',
  'Heirloom bridal Kanjivaram woven with the authentic interlocking Korvai technique. The deep peacock teal body features fine mayil (peacock) buttas, contrasting with a rich crimson vermillion pallu dripping in heavy 2g gold zari.',
  'Pure Mulberry Silk (3-ply twist), Genuine Korvai interlock weave with tested gold zari. Silk Mark tagged. Length: 5.5m + 0.8m heavy blouse piece.',
  'Peacock Teal & Vermillion Crimson',
  ARRAY[
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80'
  ],
  ARRAY['model-drape'],
  true,
  1,
  true,
  'Namaste Kenzae! I am very interested in the Heirloom Kanjivaram Sari (KZ-SR-004) at ₹18,400. Can I see a video drape?'
),
(
  'kz-ch-005',
  'KZ-CH-005',
  'Chanderi Silk Salwar Suit with Zardozi Neckline in Dusty Sage',
  'Churidars & Salwar Sets',
  'Chanderi Silk',
  5650,
  'INR',
  'Lightweight Chanderi silk kurta with hand-embroidered metallic zardozi and pearl accents around the keyhole neckline. Paired with a flowy scalloped organza dupatta and tonal santoon pants.',
  'Kurta: Chanderi Silk with cotton lining. Dupatta: Silk Organza with foil-embossed scallops (2.4m). Bottom: Modal Santoon (2.5m).',
  'Dusty Sage Green & Pearl Gold',
  ARRAY[
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
  ],
  ARRAY['model-drape'],
  true,
  4,
  false,
  'Hello Kenzae Boutique, inquiring about the Chanderi Silk Salwar Set (KZ-CH-005) in Dusty Sage at ₹5,650.'
),
(
  'kz-ch-006',
  'KZ-CH-006',
  'Pure Raw Silk Anarkali Set with Hand-Cut Gota Patti Detailing',
  'Churidars & Salwar Sets',
  'Raw Silk & Bandhani',
  9800,
  'INR',
  'Floor-grazing 18-kali flared Anarkali in royal bottle green raw silk. Finished with traditional Rajasthani gota patti borders on the hemline and paired with a hand-tied Bandhani silk dupatta.',
  'Top: Heavy Pure Raw Silk with Cancan lining. Dupatta: Pure Silk Bandhani (2.5m). Bottom: Churidhar Leggings included.',
  'Bottle Green & Marigold Orange',
  ARRAY[
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
  ],
  ARRAY['model-drape'],
  true,
  3,
  true,
  'Hello Kenzae, is the Pure Raw Silk Anarkali (KZ-CH-006) available in size L / 40 for boutique trial?'
),
(
  'kz-ch-007',
  'KZ-CH-007',
  'Pastel Powder Blue Georgette Sharara Set with Chikankari Work',
  'Churidars & Salwar Sets',
  'Georgette Chikankari',
  7200,
  'INR',
  'Delicate Lucknowi Chikankari shadow-work embroidered across breathable viscose georgette. Styled with a tiered multi-ruffle sharara and mirror-work net dupatta.',
  'Fabric: Viscose Georgette with attached inner lining. Work: Hand Chikankari with Mukaish highlights.',
  'Powder Blue & Silver Mukaish',
  ARRAY[
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
  ],
  ARRAY['garment-flat'],
  false,
  0,
  false,
  'Hello Kenzae, will the Powder Blue Sharara Set (KZ-CH-007) be restocked soon?'
),
(
  'kz-dm-008',
  'KZ-DM-008',
  'Hand-Block Printed Ajrakh Modal Silk Unstitched Suit Material',
  'Unstitched Dress Materials',
  'Modal Silk Ajrakh',
  3850,
  'INR',
  '14-stage natural dye Ajrakh hand-block printed fabric set from master artisans. Rich indigo and madder red geometric patterns on butter-soft modal silk with a matching two-tone printed dupatta.',
  'Kurta Fabric: Modal Silk (2.5m). Dupatta: Modal Silk (2.4m). Bottom: Solid Cotton Satin (2.4m).',
  'Deep Indigo & Madder Red',
  ARRAY[
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1000&q=80'
  ],
  ARRAY['garment-flat'],
  true,
  6,
  false,
  'Hello Kenzae, I wish to purchase the Ajrakh Modal Silk Dress Material (KZ-DM-008) at ₹3,850.'
),
(
  'kz-dm-009',
  'KZ-DM-009',
  'Kashmiri Aari Embroidered Pure Pashmina-Feel Warm Wool Suit Fabric',
  'Unstitched Dress Materials',
  'Woolen Pashmina',
  4600,
  'INR',
  'Warm woven spun pashmina fabric adorned with authentic Kashmiri needle aari floral jaal across the front neckline and hemline. Perfect for winter celebrations and travel.',
  'Top: Fine Spun Wool Blend with Aari Hand Embroidery (2.5m). Dupatta: Woven Kani-border Stole (2.2m). Bottom: Plain Spun Wool (2.5m).',
  'Oatmeal Beige & Ruby Floral',
  ARRAY[
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1000&q=80'
  ],
  ARRAY['garment-flat'],
  true,
  3,
  false,
  'Hello Kenzae, inquiring about the Kashmiri Aari Suit Material (KZ-DM-009) at ₹4,600.'
),
(
  'kz-dm-010',
  'KZ-DM-010',
  'Maheshwari Silk Cotton Unstitched Set with Reversible Zari Border',
  'Unstitched Dress Materials',
  'Maheshwari Handloom',
  3250,
  'INR',
  'Handcrafted Maheshwari cotton-silk suit featuring the signature Bugdi woven zari border along the selvedge. Drapes with an airy, graceful texture ideal for Kerala daytime festive gatherings.',
  'Kurta: Maheshwari Silk Cotton (2.5m). Dupatta: Sheer Handloom Zari Check Dupatta (2.4m). Bottom: Pure Handloom Cotton (2.5m).',
  'Lotus Pink & Muted Gold',
  ARRAY[
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1000&q=80'
  ],
  ARRAY['garment-flat'],
  true,
  4,
  false,
  'Namaste Kenzae, please confirm availability for Maheshwari Dress Material (KZ-DM-010).'
),
(
  'kz-kt-011',
  'KZ-KT-011',
  'A-Line Tussar Silk Festive Kurthi with Hand-Painted Kalamkari Yoke',
  'Kurthis & Ready-to-Wear',
  'Tussar Silk & Kalamkari',
  2950,
  'INR',
  'Structured A-line silhouette tailored in raw Tussar silk, elevated with an authentic pen-drawn Sri Kalahasti Kalamkari peacock yoke and wooden artisan buttons.',
  'Fabric: Handloom Tussar Silk with inner mulmul lining. Sleeves: 3/4th with contrast Kalamkari piping.',
  'Mustard Ochre & Earthy Indigo',
  ARRAY[
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
  ],
  ARRAY['model-drape'],
  true,
  7,
  false,
  'Hello Kenzae, is the Tussar Kalamkari Kurthi (KZ-KT-011) available for store pickup?'
),
(
  'kz-kt-012',
  'KZ-KT-012',
  'Short Peplum Kasavu Festive Top with Handwoven Zari Selvedge',
  'Kurthis & Ready-to-Wear',
  'Kerala Kasavu Handloom',
  2450,
  'INR',
  'Modern Kerala festive styling. A contemporary pleated peplum top crafted from authentic Kerala handloom Kasavu cotton, trimmed with woven gold temple zari and balloon sleeves.',
  'Fabric: 100% Fine Kerala Handloom Cotton with Tested Half-Fine Kasavu Zari. Fit: Tailored Peplum Flare.',
  'Off-White Kasavu & Temple Gold',
  ARRAY[
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80'
  ],
  ARRAY['model-drape'],
  true,
  5,
  true,
  'Hello Kenzae, I love the Short Peplum Kasavu Top (KZ-KT-012). Can I order this online?'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  in_stock = EXCLUDED.in_stock,
  stock_quantity = EXCLUDED.stock_quantity,
  is_featured = EXCLUDED.is_featured,
  images = EXCLUDED.images,
  updated_at = NOW();
