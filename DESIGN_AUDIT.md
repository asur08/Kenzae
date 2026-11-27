# Kenzae design audit (Hallmark v2, 27 Nov 2026)

How it was done: Hallmark's `audit` mode on the source code, plus screenshots of the site run locally
at 375 (phone), 1280, 1440 and 1920 px wide. The live kenzae.com could not be reached from the audit
sandbox, and the sandbox also blocked the photo host (Unsplash), so photos appear blank in the screenshots.
That blank-photo look is a sandbox effect, not a site bug.

Raw checker output: 292 FAIL, 16 REFLEX, 62 WARN (full list in `.hallmark/before.txt`, not committed).
Most of the FAILs are one style habit repeated (see "Tracked capitals" below), so the count looks scarier than it is.

## What is done right

- **Clear identity.** Deep maroon, cream and brass with a classic serif feels like an Indian couture boutique, not a template.
- **Real commerce, not a brochure.** Catalogue with filters and search, wishlist, cart, Razorpay payments with
  server-side signature check and webhook, GST invoices, shipping labels, courier tracking, a staff portal, multi-currency, PWA.
- **WhatsApp everywhere.** Right call for the Indian market, where most boutique sales start in a chat.
- **Phone-first touches.** Bottom tab bar (Discover, Saved, Bag, Consult), large buttons, no sideways scrolling.
- **Honest stock signals.** "Only 1 left" and "Sold out" come from data, not fake urgency.
- **Basics in place.** Page title and description, canonical link, robots.txt, sitemap, per-product share previews (`/p/:sku`),
  security headers, alt text on images, every button has a name.

## What is wrong (fix before handing over)

| # | Problem | Where | Why it matters |
|---|---|---|---|
| 1 | **Logo is covered on phones.** The currency picker and filter button sit on top of "KENZAE" in the header. | `src/components/Navbar.tsx:120-140` | Most visitors are on phones; the brand name is the first thing they see, and it looks broken. |
| 2 | **All product photos are stock images from Unsplash** (24 links in `data/products.json`). | `data/products.json`, `src/components/AtelierStory.tsx:21` | Customers will buy a sari that is not the one in the photo. Unsplash terms also don't cover use as product photos for sale. Needs the boutique's own photos. |
| 3 | **No privacy, refund, shipping or terms pages.** | site-wide | Razorpay requires these to activate live payments; foreign buyers and Google expect them. |
| 4 | **No favicon.** `index.html` points to `/vite.svg`, which does not exist; `favicon.ico` in the manifest is missing too. | `index.html:5`, `public/` | Browser tab and home-screen icon show a blank/default icon. |
| 5 | **Site is heavy: ~2 MB of code (663 KB zipped) on first visit.** The PDF invoice maker is loaded for every shopper. | `src/components/cart/MobileCheckoutModal.tsx:22` | Slow on Indian mobile data; hurts Google ranking. Load the PDF tool only when an invoice is created. |
| 6 | **Hero overflows large screens** (ends at 1111 px on a 1080 px screen). | `src/components/Hero.tsx` | The buttons can fall below the fold on big monitors. |
| 7 | **Focus ring nearly invisible** on "Visit Store" (1.08:1), and search/select box edges too faint (1.11:1). | top bar, `FilterBar.tsx` | Keyboard users can't see where they are; fails accessibility rules (WCAG AA). |
| 8 | **No "reduce motion" setting respected.** | `src/index.css:60` | People sensitive to motion get animations anyway. Required for WCAG. |
| 9 | **Payment script blocks page load.** Razorpay's script is loaded in `<head>` for every visitor. | `index.html` | Delays the first paint; load it only at checkout. |
| 10 | **No share image on the home page** (`og:image` missing). | `index.html` | Links shared on WhatsApp/Instagram show no picture. |

## What can be done better (polish)

- **Tracked capitals** (`UPPERCASE` + wide letter spacing) are used on ~170 labels and buttons. A little is fine for a
  fashion brand (the logo, maybe the top bar), but on every button and filter label it gets tiring to read.
  Keep it for the logo; use normal sentence case elsewhere.
- **Hero text is long** (18 words). One short sentence works better: e.g. "Handwoven saris and tailored ensembles from Mulanthuruthy."
- **Too many words on one screen** in the "Crafted around your occasion" section (205 words). Cut to the three headlines.
- **Colours typed by hand in ~40 places** (`bg-[#FAF8F5]` etc.) instead of the theme colours. Makes future colour changes painful.
- **`transition-all`** on ~50 buttons; name the property instead (smoother, cheaper).
- **Blurred "glow" blobs and gold gradient text** in the hero read as a generic AI-made look. A plain texture or real fabric photo is stronger.
- **Product images zoom on hover** — better to keep the photo still and lift the card.
- **Small typography details:** straight quotes ('), "..." instead of …, long dashes in copy, no balanced line breaks on headings.
- **"Drape video" has no poster image**, so it shows a blank box while loading.
- **61 tap targets under 44 px** on phone.

## Other things for an international standard

1. **Real product photography** (biggest single upgrade): same light, same background, front/back/close-up of weave.
2. **Legal + trust:** privacy, returns, shipping (with international rates and times), terms, GST number, contact email.
3. **Search engines:** this is a single-page React app, so Google sees an almost empty page at first. Add product
   structured data (price, stock), per-product pages with their own titles, and pre-rendering.
4. **International buyers:** prices in USD/GBP/AED exist, but also need international shipping, customs/duty notes,
   size charts in cm and inches, and English copy that explains terms like "unstitched" and "churidar".
5. **Speed:** split the code, serve images in WebP/AVIF at the right size, host photos on your own storage/CDN.
6. **Analytics + consent:** Google Analytics/Meta pixel with a cookie notice (needed for EU/UK visitors).
7. **Accessibility pass** to WCAG 2.1 AA (focus, contrast, motion, tap sizes above).
8. **Reviews and real testimonials** from actual customers (never made up).

## Fixes applied (27 Nov 2026)

Hallmark checker: **292 FAIL → 109 FAIL** (the rest is mostly the staff-only portal and the PDF invoice, which shoppers don't see).

| Was | Now |
|---|---|
| Logo covered on phones | Currency picker moved into the phone menu ("Show prices in"); duplicate filter button hidden on phones; header buttons are 44 px |
| No favicon; app icons were a stock photo; theme colour was green | Kenzae "K" icon (SVG + PNG + Apple icon + maskable icon); maroon theme colour everywhere (browser bar, app, Razorpay popup) |
| No share image | `og-image.png` (1200 x 630) on the home page for WhatsApp/Instagram/X previews |
| 663 KB (zipped) code on first visit | 214 KB: PDF invoice tool now loads only when an invoice is made |
| Razorpay script blocked every page load | Loaded only at checkout (it already had an on-demand loader) |
| Hero overflowed big screens; 18-word intro; blurred blobs | Fits the screen; 10-word intro; blobs removed; sentence-case buttons; featured photo loads first |
| No "reduce motion" support | CSS fallback + Framer Motion `reducedMotion="user"` |
| Focus ring nearly invisible; faint field borders | Clear focus outline on every control (light on maroon); search and sort boxes have 3:1 borders |
| ~170 ALL-CAPS tracked labels | Removed from every shopper-facing label and button; kept on the KENZAE wordmark only |
| `transition-all` on ~50 controls; hard-coded colours | Named properties; colours moved into theme tokens |
| Wordy "Crafted around your occasion" | Intro and cards cut to one line each |
| Dot-joined strings, dashes, straight quotes, "..." | Line breaks / commas, curly quotes, real ellipsis |
| Drape video blank while loading | Shows the product photo as a poster |

### Still needs the owner (can't be fixed in code)

1. **Real product photos** to replace the Unsplash images in `data/products.json` and `AtelierStory.tsx`.
2. **Policy pages** (privacy, returns/refunds, shipping, terms): the owner must decide the return window, refund method, shipping times/rates and countries served. Once known, the pages can be built.
3. **Fabric lengths don't match:** the product window says *Top 2.5 m, Bottom 2.5 m, Dupatta 2.4 m*, while the tailoring panel says *2.5 m, 2.0 m, 2.25 m* (`ProductModal.tsx`, `TailoringSelector.tsx`). Confirm the real lengths.
4. Product photo zoom-on-hover was kept on purpose: it is normal for fashion shops.
