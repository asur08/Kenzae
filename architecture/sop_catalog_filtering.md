# SOP: Deterministic Catalog Filtering & Query Pipeline

**Standard Operating Procedure ID:** SOP-CAT-001  
**Target:** Kenzae Boutique Digital Catalog  
**Version:** 1.0.0  

---

## 1. Objective & Scope
This SOP defines the deterministic multi-stage filtering pipeline and query processing logic for the Kenzae boutique catalog. It ensures sub-millisecond execution, zero layout shift, predictable sort ordering, and intelligent multi-word fuzzy matching for Indian/Kerala textile vocabulary.

---

## 2. Pipeline Sequence Diagram

```
raw_products (/data/products.json)
       │
       ▼
 [Stage 1: Category Filter]           (Exact match or "All")
       │
       ▼
 [Stage 2: Price Range Filter]        (product.price <= maxPrice)
       │
       ▼
 [Stage 3: Fabric / Weave Filter]     (subCategory match or "All")
       │
       ▼
 [Stage 4: Fuzzy Search Query]        (Title, SKU, Fabric, Color, Textile keywords)
       │
       ▼
 [Stage 5: Stock Status Toggle]       (in_stock === true when active)
       │
       ▼
 [Stage 6: Deterministic Sort]        (featured | price-asc | price-desc | newest)
       │
       ▼
 sorted_products (Rendered to ProductGrid)
```

---

## 3. Detailed Stage Specifications

### Stage 1: Category Filter
- **Input:** `category: ProductCategory | 'All'`
- **Rule:** If `category !== 'All'`, assert `product.category === category`.
- **Constraint:** Switching categories resets `subCategory` to `'All'` to prevent zero-result traps.

### Stage 2: Price Range Filter
- **Input:** `maxPrice: number` (Default: ₹25,000, Min: ₹1,500)
- **Rule:** Assert `product.price <= maxPrice`.

### Stage 3: Fabric / Sub-Category Filter
- **Input:** `subCategory: string | 'All'`
- **Rule:** If `subCategory !== 'All'`, case-insensitive substring match against `product.subCategory` or `product.fabricDetails`.

### Stage 4: Multi-Word Fuzzy Search Engine
- **Input:** `searchQuery: string`
- **Normalization:** Trim whitespace, convert to lower case, split into atomic whitespace-delimited tokens.
- **Textile Glossary Mapping (Synonym Expansion):**
  - `"kasavu"` / `"mundu"` -> matches Kerala handloom, temple zari, ivory gold drapes.
  - `"katan"` / `"banarasi"` / `"zari"` -> matches Katan silk, kadhwa brocades.
  - `"tussar"` / `"ghicha"` / `"kosa"` -> matches wild raw silk, madhubani paints.
  - `"churidars"` / `"salwar"` / `"anarkali"` -> matches 3-piece sets and suits.
  - `"unstitched"` / `"dress material"` / `"material"` -> matches 3-piece tailoring fabrics.
  - `"kurthi"` / `"kurti"` / `"tunic"` -> matches ready-to-wear festives.
- **Rule:** An item passes if *every token* matches at least one of:
  - `product.title`
  - `product.sku`
  - `product.fabricDetails`
  - `product.description`
  - `product.color`
  - `product.subCategory`

### Stage 5: Stock Status Toggle
- **Input:** `inStockOnly: boolean`
- **Rule:** If `inStockOnly === true`, filter out all items where `product.in_stock === false`.

### Stage 6: Deterministic Sorting
- **`featured`:** Items where `product.isFeatured === true` are sorted first; tie-broken by numerical SKU suffix.
- **`price-asc`:** Ascending numeric comparison: `a.price - b.price`.
- **`price-desc`:** Descending numeric comparison: `b.price - a.price`.
- **`newest`:** Suffix/ID order: `b.id.localeCompare(a.id)`.

---

## 4. Empty-State Protocol
When the pipeline yields 0 results:
1. Display empathetic editorial empty state: *"No matching pieces found"*.
2. Provide a single-tap **"Reset All Filters"** action restoring default pipeline inputs.
3. Suggest popular alternatives (e.g. *"Browse All Saris"* or *"View In-Stock Pieces"*).
