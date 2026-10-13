# SOP: Deep Linking & URL State Synchronization

**Standard Operating Procedure ID:** SOP-LNK-002  
**Target:** Kenzae Boutique Digital Catalog  
**Version:** 1.0.0  

---

## 1. Objective & Deep Linking Logic
Enables seamless item sharing, persistent state sharing across WhatsApp chats, social media bookmarks, and direct customer-to-customer consultation.

---

## 2. URL State Synchronization Contract

### Parameter Definition
- **Query Parameter Key:** `item`
- **Permitted Formats:**
  - Case-insensitive SKU: `?item=KZ-SR-001`
  - Slug/ID: `?item=kz-sr-001`

### Lifecycle Flow
1. **Initial Mount / Page Load:**
   - On hydration, parse `window.location.search`.
   - Extract `item` parameter value.
   - Lookup product matching `item` against `p.sku.toLowerCase()` or `p.id.toLowerCase()`.
   - If found, automatically open `ProductModal` with target product loaded.
2. **Product Selection in UI:**
   - When customer taps any `ProductCard` or deep link trigger:
   - Call `window.history.pushState({}, '', '?item=' + product.sku)`.
   - Synchronize document title to `"{product.title} | Kenzae Boutique"`.
3. **Modal Dismissal:**
   - When customer taps close `(X)`, presses `Escape`, or taps backdrop:
   - Call `window.history.pushState({}, '', window.location.pathname)`.
   - Restore document title to default boutique title.

---

## 3. Social Sharing & Clipboard Handshake
- **Trigger:** Web Share API (`navigator.share`) with programmatic clipboard fallback (`navigator.clipboard.writeText`).
- **Share Payload:**
  - `title`: `"{product.title} | Kenzae Boutique"`
  - `text`: `"Inquire about {product.title} ({product.sku}) at Kenzae Boutique, Mulanthuruthy for ₹{price}."`
  - `url`: `"{window.location.origin}/?item={product.sku}"`
