# Graph Report - Kenzae  (2026-11-21)

## Corpus Check
- 85 files · ~53,761 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 482 nodes · 912 edges · 32 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `06313965`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]

## God Nodes (most connected - your core abstractions)
1. `useCatalog()` - 29 edges
2. `formatCurrencyINR()` - 29 edges
3. `isSupabaseConfigured()` - 19 edges
4. `useCurrency()` - 15 edges
5. `KenzaeProduct` - 14 edges
6. `useCart()` - 11 edges
7. `BoutiqueOrder` - 11 edges
8. `Execution Timeline & Milestones` - 10 edges
9. `KENZAE_STORE_CONFIG` - 10 edges
10. `ProductCategory` - 10 edges

## Surprising Connections (you probably didn't know these)
- `generateBoutiqueOwnerOrderAlertWhatsAppUrl()` --calls--> `formatCurrencyINR()`  [EXTRACTED]
  src/utils/courierTracking.ts → src/utils/formatters.ts
- `CustomerStorefront()` --calls--> `useCatalog()`  [EXTRACTED]
  src/App.tsx → src/context/CatalogContext.tsx
- `MobileCheckoutModal()` --calls--> `useOrders()`  [EXTRACTED]
  src/components/cart/MobileCheckoutModal.tsx → src/context/OrdersContext.tsx
- `CollectionShowcase()` --calls--> `useCatalog()`  [EXTRACTED]
  src/components/CollectionShowcase.tsx → src/context/CatalogContext.tsx
- `StaffDashboard()` --calls--> `useCatalog()`  [EXTRACTED]
  src/components/staff/StaffDashboard.tsx → src/context/CatalogContext.tsx

## Communities (32 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (43): CartDrawer(), CartDrawerProps, MobileCheckoutModal(), STANDARD_SIZES, TailoringSelector(), TailoringSelectorProps, CATEGORIES, FilterBar() (+35 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (34): AiDrapePose, buildSinglePosePrompt(), DrapeBackdropPreset, DrapeStylePreset, GeneratedLook, GenerateDrapePayload, generateSinglePose(), getEditorialLookbookMock() (+26 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (32): MobileCheckoutModalProps, ProductCardProps, CartContext, CartContextType, CartProvider(), defaultAddress, CountryProfile, SUPPORTED_COUNTRIES (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (30): OrdersContext, OrdersContextType, SAMPLE_ORDERS, useOrders(), dispatchRemoteOrder(), fetchRemoteOrders(), mapOrderToDbRow(), saveRemoteOrder() (+22 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (25): COLLECTION_CARDS, CollectionCardMeta, CollectionShowcase(), uploadCatalogImage(), UploadResult, ARCHETYPE_LABELS, ImageUploadStudio(), ImageUploadStudioProps (+17 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (25): CatalogContext, CatalogContextType, CatalogProvider(), initialFilterState, VALID_CATEGORIES, validateCatalog(), validateProduct(), ValidationResult (+17 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (20): convertedAED, convertedUSD, countriesCode, countriesPath, courierCode, courierPath, currencyCode, currencyServicePath (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (17): body, buffer, decoded, __dirname, expectedSig, __filename, header, match (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (15): 🗂️ Catalog Management, code:bash (# Install dependencies), code:block2 (Kenzae/), code:block3 (KZ-SR-XXX   → Saris), code:bash (python3 tools/validate_catalog_data.py), 🤝 Contributing, 🚀 Getting Started, Kenzae Designer Boutique 🛍️ (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (14): 1. Executive Summary & Brand Identity, 2. A.N.T. 3-Layer Architectural Principles, 3. Strict Data Schema Specification, 4. WhatsApp Business Integration Protocol, 5. UI/UX Design System & Editorial Rules, 6. Boutique Owner Store Maintenance SOP (No Developer Required), code:json ({), code:text (https://wa.me/{WHATSAPP_NUMBER}?text={ENCODED_MESSAGE}) (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.27
Nodes (10): CurrencySwitcherProps, CurrencyContext, CurrencyContextType, convertINRTo(), CurrencyCode, CurrencyConfig, formatLocalizedPrice(), refreshExchangeRates() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.15
Nodes (12): 1. Objective & Scope, 2. Pipeline Sequence Diagram, 3. Detailed Stage Specifications, 4. Empty-State Protocol, code:block1 (raw_products (/data/products.json)), SOP: Deterministic Catalog Filtering & Query Pipeline, Stage 1: Category Filter, Stage 2: Price Range Filter (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.17
Nodes (11): Execution Timeline & Milestones, 🟢 Milestone 0: Blueprint & Project Memory (Completed), 🟡 Milestone 1: Tooling & Environment Initialization (Completed), 🟠 Milestone 2: Schema Implementation & Phase 2 Linkage Handshakes (Completed), 🔵 Milestone 3: Presentation Layer & Architectural Assembly (Completed), 🟣 Milestone 4: Editorial Luxury Styling & Layer 3 Tools (Completed), 🔴 Milestone 5: Triggers, Deployment Packaging & Handover (Completed), 🌿 Milestone 6: Organic Boutique Aesthetics & Natural Conversational Commerce (Completed) (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.27
Nodes (9): StaffAuthContext, StaffAuthContextType, StaffAuthProvider(), useStaffAuth(), StaffDashboard(), StaffLoginPage(), StaffLoginPageProps, StaffPortalPage() (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.17
Nodes (11): 1. Business & Regional Context, 2. Design Tokens & Visual Hierarchy, 3. Responsive Breakpoints & Mobile Touch Ergonomics, 4. WhatsApp Business Integration Protocol, 6. Performance & Accessibility Verification Metrics, Build Compilation Speed, Color Palette (Kerala High-Fashion Luxury), Findings & Research: Kenzae Boutique Digital Catalog (+3 more)

### Community 15 - "Community 15"
Cohesion: 0.17
Nodes (11): 1. Intent & Platform Routing Matrix, 2. Standardized Message Templates, 3. Encoding & Safety Rules, code:text (Namaste Kenzae Boutique! ✨), code:text (Namaste Kenzae Boutique! ✨), code:text (Namaste Kenzae Boutique! ✨), Routing Table, SOP: WhatsApp Inquiry Construction & Protocols (+3 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (10): 🟢 Phase 0: Blueprint & Memory Initialization, 🟡 Phase 1: Foundation & Project Tooling Setup (Blueprint), 🟠 Phase 2: Data Schema, Catalog Source of Truth & Integrations (Link), 🔵 Phase 3: Core Application Architecture (Architect), 🟣 Phase 4: Editorial Styling & Mobile-First Polish (Stylize), ⚡ Phase 5 (Operations, Telemetry & Performance - Scaling Milestone), 🔴 Phase 5: Triggers, Touchpoints & Customer Workflows (Trigger), ⚪ Phase 6: Verification, Testing & Production Build (Deliver) (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (10): catalog, catalogPath, categoryCounts, __dirname, __filename, rawData, required, seenIds (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.29
Nodes (8): COLORS, formatPdfCurrency(), formatPdfNumber(), generateGSTTaxInvoicePDF(), InvoiceGeneratorOptions, KenzaeTaxInvoiceDocument(), styles, convertAmountToWords()

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (7): handler(), authenticateStaff(), handler(), signToken(), StaffLoginRequest, StaffLoginResponse, verifySignedToken()

### Community 20 - "Community 20"
Cohesion: 0.43
Nodes (6): handler(), parseBase64DataUrl(), processImageUpload(), sanitizeFileName(), UploadImageRequest, UploadImageResponse

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (6): 1. Objective & Deep Linking Logic, 2. URL State Synchronization Contract, 3. Social Sharing & Clipboard Handshake, Lifecycle Flow, Parameter Definition, SOP: Deep Linking & URL State Synchronization

### Community 22 - "Community 22"
Cohesion: 0.4
Nodes (5): __dirname, __filename, loadEnvLocal(), rootDir, runConnectivityTest()

### Community 23 - "Community 23"
Cohesion: 0.53
Nodes (5): clean_phone_number(), generate_whatsapp_inquiry_url(), Normalize phone number to international format without +, spaces, or dashes., Constructs compliant WhatsApp click-to-chat deep link., run_tests()

### Community 24 - "Community 24"
Cohesion: 0.4
Nodes (4): clone, fetchPromise, PRECACHE_ASSETS, url

### Community 25 - "Community 25"
Cohesion: 0.7
Nodes (4): audit_palette(), contrast_ratio(), hex_to_rgb(), relative_luminance()

## Knowledge Gaps
- **200 isolated node(s):** `StaffLoginRequest`, `StaffLoginResponse`, `AiDrapePose`, `ModelArchetype`, `DrapeStylePreset` (+195 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `KenzaeProduct` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `formatCurrencyINR()` connect `Community 0` to `Community 2`, `Community 3`, `Community 13`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `useCatalog()` connect `Community 0` to `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 13`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `StaffLoginRequest`, `StaffLoginResponse`, `AiDrapePose` to the rest of the system?**
  _200 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._