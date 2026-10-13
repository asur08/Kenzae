# Findings & Research: Kenzae Boutique Digital Catalog

## 1. Business & Regional Context
- **Business Identity:** Kenzae Designer Boutique.
- **Physical Location:** Mulanthuruthy, Ernakulam District, Kerala 682314.
  - Location Link: [Google Maps Pin](https://share.google/m6bQuE0vYpoVkI6oL)
  - Key Market: Local bridal wear, festive shoppers, Kerala diaspora looking for authentic high-end saris, curated salwar suits, custom stitching fabrics, and unstitched dress materials.
- **Customer Behavior:**
  - High preference for conversational commerce via WhatsApp rather than cumbersome e-commerce carts with logins and multi-step checkouts.
  - Customers want to verify fabric fall, blouse piece availability, custom tailoring options, and real-time boutique stock before visiting or making payment.
  - Mobile browsing dominates (>85% of traffic originates from WhatsApp / Instagram links on smartphones).

---

## 2. Design Tokens & Visual Hierarchy

### Color Palette (Kerala High-Fashion Luxury)
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `bg-canvas` | `#FAF8F5` | Primary warm ivory background |
| `bg-canvas-subtle` | `#F3EFE6` | Secondary contrast background, card footers |
| `emerald-900` | `#0B281E` | Deep royal emerald — primary brand identity |
| `emerald-800` | `#0F382A` | Standard emerald for buttons, badges |
| `emerald-700` | `#1A4C3B` | Interactive hover emerald |
| `gold-500` | `#D4AF37` | Gilded champagne gold — accents, borders, luxury badges |
| `gold-600` | `#B89324` | Rich antique gold for icons & highlights |
| `text-primary` | `#1A1A1A` | Warm obsidian black for ultra-legible typography |
| `text-secondary` | `#5C5852` | Soft charcoal for fabric details & subtitles |
| `accent-terracotta` | `#9B3D3D` | Festive terracotta/crimson for clearance or special edition tags |
| `whatsapp-green` | `#25D366` | Instant recognizable WhatsApp CTA button color |

### Typography Scale
- **Display / Headers:** `Cormorant Garamond` & `Cinzel` (Editorial Serif, high contrast, elegant letterforms).
- **Body & Controls:** `Plus Jakarta Sans` / `Inter` (Modern clean humanist sans-serif, high legibility on 360px–414px mobile screens).
- **Price Styling:** Indian Rupee symbol (`₹`) formatted with standard Indian grouping (e.g., `₹4,850`, `₹12,500`).

---

## 3. Responsive Breakpoints & Mobile Touch Ergonomics
- **Mobile (`< 640px`):** Single column or 2-column compact grid, sticky bottom action bar, thumb-accessible WhatsApp buttons (>= 48px height), swipeable multi-image drawers.
- **Tablet (`640px - 1024px`):** 2 to 3 column grid, sticky filter pills, expandable detail dialog.
- **Desktop (`> 1024px`):** 3 to 4 column editorial catalog grid, split-pane product modal with high-res zoom preview.
- **Minimum Tap Target:** 44px x 44px for touch targets.

---

## 4. WhatsApp Business Integration Protocol
- **Target Number:** Configurable boutique contact number (e.g. `+919447012345` or user's provided line).
- **Message Architecture:**
  - Single Product Inquiry: includes Product Title, SKU, Price, Fabric Details, and Link.
  - Wishlist Multi-Item Inquiry: bundles all saved items into a single bulleted order inquiry.
  - Store Visit Appointment: quick inquiry template requesting boutique trial time in Mulanthuruthy.
- **URL Encoding:** All parameters passed through `encodeURIComponent` to prevent broken characters in Malayali/English multilingual greetings.

---

## 5. Location Touchpoint Details
- **Store Name:** Kenzae Boutique
- **Locality:** Mulanthuruthy, Ernakulam, Kerala
- **Google Maps Direct URL:** `https://share.google/m6bQuE0vYpoVkI6oL` (and embedded map representation)
- **Store Hours:** Monday - Saturday: 10:00 AM - 7:30 PM | Sunday: By Appointment / 1:00 PM - 6:00 PM
