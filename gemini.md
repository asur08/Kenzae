# Kenzae Boutique Digital Catalog — Project Constitution (`gemini.md`)

## 1. Executive Summary & Brand Identity
- **Brand Name:** Kenzae Designer Boutique
- **Location:** Mulanthuruthy, Ernakulam District, Kerala, India ([Google Maps Reference](https://share.google/m6bQuE0vYpoVkI6oL))
- **Core Proposition:** High-fashion, bespoke designer ethnic wear and couture catalog featuring premium handwoven saris, designer churidar sets, unstitched artisanal dress materials, and contemporary kurthis.
- **Operating Protocols:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger) & A.N.T. 3-Layer Architecture.

---

## 2. A.N.T. 3-Layer Architectural Principles
1. **Layer A — Architecture & Presentation (UI / Visual Shell):**
   - Mobile-first, editorial magazine aesthetic with smooth micro-interactions.
   - Zero layout shifts (CLS < 0.05), instant responsive layout across mobile, tablet, and desktop.
   - High-fidelity fabric texture inspection, zoom previews, and drape visualization.
2. **Layer N — Network, Data & State (Core Logic):**
   - Single Source of Truth: `/data/products.json` strictly governed by the Catalog Schema.
   - Instant client-side search, multi-faceted filtering (category, fabric, price range, stock status).
   - LocalStorage persistence for customer wishlist/curated selections.
   - Lightweight catalog manager / JSON export & import capability for boutique staff.
3. **Layer T — Trigger, Telemetry & Touchpoints (Action Engine):**
   - One-tap WhatsApp Business inquiry triggers with pre-populated SKU, item name, price, and customer message.
   - Native share triggers (Web Share API with fallback clipboard link).
   - Direct store navigation trigger connecting to Kenzae's Mulanthuruthy location on Google Maps.

---

## 3. Strict Data Schema Specification

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "KenzaeProductCatalog",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["id", "sku", "title", "category", "price", "images", "in_stock"],
    "properties": {
      "id": { 
        "type": "string",
        "description": "Unique slug or alphanumeric identifier for product routing" 
      },
      "sku": { 
        "type": "string", 
        "pattern": "^KZ-[A-Z]{2}-[0-9]{3,}$",
        "example": "KZ-SR-042" 
      },
      "title": { 
        "type": "string", 
        "example": "Handwoven Banarasi Katan Silk Sari" 
      },
      "category": { 
        "type": "string", 
        "enum": [
          "Saris", 
          "Churidars & Salwar Sets", 
          "Unstitched Dress Materials", 
          "Kurthis & Ready-to-Wear"
        ] 
      },
      "subCategory": { 
        "type": "string", 
        "example": "Tussar Silk / Organza / Handloom Cotton" 
      },
      "price": { 
        "type": "number", 
        "minimum": 0,
        "example": 4850 
      },
      "currency": { 
        "type": "string", 
        "default": "INR" 
      },
      "description": { 
        "type": "string" 
      },
      "fabricDetails": { 
        "type": "string" 
      },
      "color": { 
        "type": "string" 
      },
      "images": {
        "type": "array",
        "minItems": 1,
        "items": { 
          "type": "string", 
          "format": "uri" 
        }
      },
      "in_stock": { 
        "type": "boolean" 
      },
      "isFeatured": { 
        "type": "boolean" 
      },
      "whatsappMessage": { 
        "type": "string" 
      }
    }
  }
}
```

---

## 4. WhatsApp Business Integration Protocol
- **Official Store Contact:** `+91 94470 XXXXX` (Configurable boutique business number).
- **Inquiry Trigger URL Structure:**
  ```text
  https://wa.me/{WHATSAPP_NUMBER}?text={ENCODED_MESSAGE}
  ```
- **Standardized Template:**
  ```text
  Namaste Kenzae Boutique! ✨
  I am interested in reserving/inquiring about:
  👗 Product: {title}
  🏷️ SKU: {sku}
  💰 Price: ₹{price}
  🔗 Catalog Link: {item_url}
  
  Could you please confirm availability and provide details for ordering or boutique visit?
  ```

---

## 5. UI/UX Design System & Editorial Rules
- **Color Palette:**
  - *Royal Ivory / Warm Linen (`#FAF8F5`, `#F5F2EB`)*: Primary canvas for photography pop.
  - *Deep Regal Emerald (`#0F382A`)*: Primary brand accent for high-end boutique gravitas.
  - *Gilded Champagne Gold (`#D4AF37`, `#C5A059`)*: Accent borders, badges, and luxury foil accents.
  - *Warm Charcoal / Onyx (`#1A1A1A`, `#2D2D2D`)*: High-contrast legible typography.
  - *Rose Gold / Crimson Terracotta (`#9B3D3D`)*: Subtle highlight accents for festive Kerala couture.
- **Typography:**
  - Display / Headlines: Serif with high elegance (e.g., *Cormorant Garamond* / *Cinzel* / *Playfair Display*).
  - Body & UI: Clean, legible geometric sans-serif (e.g., *Plus Jakarta Sans* / *Inter*).
- **Behavioral Constraints:**
  - No complex checkout or cart barriers — boutique customers in Kerala prefer direct personal consultation and instant WhatsApp booking.
  - Instant tactile feedback on filters, bookmarking, and image galleries.
  - Zero layout shift with aspect-ratio enforced responsive image holders.
