# Task Plan: Kenzae Boutique Digital Catalog (Mulanthuruthy)

**Framework:** B.L.A.S.T. Protocol (Blueprint, Link, Architect, Stylize, Trigger)  
**Architecture:** A.N.T. 3-Layer (Architecture UI, Network/Data Logic, Trigger/Touchpoints)  
**Target:** Mobile-First Editorial Catalog for Kenzae Designer Boutique, Mulanthuruthy, Kerala  

---

## 🟢 Phase 0: Blueprint & Memory Initialization
- [x] Create project memory: `gemini.md` (Project Constitution & Data Schema)
- [x] Create project memory: `task_plan.md` (Phased Roadmap with micro-checklists)
- [x] Create project memory: `findings.md` (UI/UX design tokens, breakpoints, business context)
- [x] Create project memory: `progress.md` (Execution log & verification record)
- [x] Initialize Git repository

---

## 🟡 Phase 1: Foundation & Project Tooling Setup (Blueprint)
- [x] Initialize modern React 19 + Vite + TypeScript application with Tailwind CSS
- [x] Install essential icon set (`lucide-react`) and motion primitives (`framer-motion`)
- [x] Configure Tailwind CSS with Kenzae bespoke luxury color tokens:
  - Ivory canvas (`#FAF8F5`, `#F5F2EB`)
  - Deep Regal Emerald (`#0F382A`, `#0B281E`)
  - Gilded Champagne Gold (`#D4AF37`, `#C5A059`)
  - Warm Charcoal (`#1A1A1A`, `#2D2D2D`)
- [x] Configure typography: Cormorant Garamond, Cinzel & Plus Jakarta Sans
- [x] Establish directory structure following A.N.T. layer separation

---

## 🟠 Phase 2: Data Schema, Catalog Source of Truth & Integrations (Link)
- [x] Implement TypeScript interfaces strictly conforming to schema in `gemini.md`
- [x] Build `/data/products.json` with rich, authentic Kerala boutique inventory:
  - Handwoven Banarasi Katan & Tussar Silk Saris
  - Kerala Handloom Kasavu & Organza Designer Saris
  - Artisanal Churidars, Anarkali & Salwar Sets
  - Premium Unstitched Chanderi / Raw Silk Dress Materials
  - Contemporary Ready-to-Wear Festive Kurthis
- [x] Build runtime JSON validator to enforce schema integrity (`catalogValidator.ts`)
- [x] Build WhatsApp Click-to-Chat link generator with pre-formatted product inquiry templates (`whatsapp.ts`)
- [x] Build Google Maps location touchpoint linking directly to Kenzae Mulanthuruthy (`https://share.google/m6bQuE0vYpoVkI6oL`)

---

## 🔵 Phase 3: Core Application Architecture (Architect)
- [x] **Layer N (Network & State Logic):**
  - Implement catalog state hook (`useCatalog`): search, category filter, fabric filter, price sorting, in-stock toggle
  - Implement client-side Wishlist / Saved items hook (`useWishlist`) with LocalStorage persistence
  - Implement lightweight catalog manager state (allows staff to view, filter, edit, or add products locally and export updated JSON)
- [x] **Layer A (Presentation & Components):**
  - Boutique Header with Kenzae brand emblem, quick search, wishlist counter, and store status badge
  - Hero Banner with editorial couture imagery, boutique story, and Mulanthuruthy location indicator
  - Quick Category Filter Bar with active pill states and category counts
  - Filter Drawer / Sheet for mobile: price slider, fabric type, colors, availability
  - Product Card component: high-res photo aspect ratio, fabric badge, price in ₹, quick WhatsApp button, wishlist heart
  - Product Detail Modal / Sheet: multi-image gallery with zoom/swatch inspection, fabric details, SKU badge, direct WhatsApp reserve button, store pickup notice
  - Store Information & Mulanthuruthy Map banner with direct navigation trigger
  - Boutique Footer with business hours, Instagram / WhatsApp contacts, and address

---

## 🟣 Phase 4: Editorial Styling & Mobile-First Polish (Stylize)
- [x] Apply luxury editorial styling: subtle gold borders, linen textures, smooth glassmorphic top navigation
- [x] Implement smooth Framer Motion transitions and hover micro-interactions
- [x] Optimize mobile tap targets (minimum 44x44px for thumb zones)
- [x] Ensure sub-second LCP by utilizing optimized WebP / CDN photography with shimmer skeleton fallbacks
- [x] Zero layout shift verification (explicit 3:4 aspect-ratio boxes)

---

## 🔴 Phase 5: Triggers, Touchpoints & Customer Workflows (Trigger)
- [x] Test one-tap WhatsApp reservation: verify phone formatting, pre-filled SKU, price, and item title
- [x] Multi-item inquiry trigger: allows inquiring about the entire customer wishlist in a single WhatsApp message
- [x] Test Google Maps navigation link: open Mulanthuruthy location directions
- [x] Web Share trigger: native sharing of product cards with copy-link fallback
- [x] Staff Catalog Manager view: modal allowing boutique staff to preview raw JSON, edit stock, or add new items

---

## ⚪ Phase 6: Verification, Testing & Production Build (Deliver)
- [x] Run automated TypeScript typechecks (`tsc --noEmit` - passed with 0 errors)
- [x] Run catalog verification script (`node scripts/verify-catalog.js` - passed all schema checks)
- [x] Execute production build (`npm run build` - compiled dist bundle in 287ms)
- [x] Configure `.gitignore` and verify clean working tree
- [x] Update `progress.md` with final verification records


---

## 🌍 Sprint 3: NRI & Diaspora Globalization (High Basket Value)
- [x] Multi-Currency Display & Converter (`INR`, `AED`, `USD`, `GBP`, `EUR`, `CAD`, `AUD`, `SGD`)
- [x] Interactive `CurrencySwitcher` in Navbar with live country flags and retail psychological rounding
- [x] International E.164 phone formatting and country selector with dial codes (`+971`, `+1`, `+44`, `+91`, etc.)
- [x] Contextual postal validation (UAE Emirate dropdown with optional/NA postal code; UK Postcode; US ZIP; India PIN)
- [x] Dual shipping tier engine: Domestic Kerala / India vs DHL Express / Aramex Worldwide (₹2,450 / 3-5 days delivery)

---

## ⚡ Phase 5 (Operations, Telemetry & Performance - Scaling Milestone)
- [x] GA4 & Meta Pixel E-Commerce Event Bus (`view_item_list`, `view_item`, `add_to_wishlist`, `add_to_cart`, `begin_checkout`, `whatsapp_inquiry`, `purchase`)
- [x] Progressive Web App (PWA) manifest with luxury brand theme (`#0F382A`) and standalone configuration
- [x] Service Worker (`sw.js`) implementing Stale-While-Revalidate for drapes and cache-first for app shell
- [x] International logistics telemetry with direct live tracking URL resolution for DHL Express & Aramex
- [x] Preconnect optimizations for Google Fonts and photography CDNs (sub-second LCP & zero layout shifts)
