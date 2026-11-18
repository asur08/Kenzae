# Kenzae Designer Boutique 🛍️

> **Premium handwoven saris, designer churidar sets, unstitched dress materials & kurthis**  
> *Mulanthuruthy, Ernakulam District, Kerala, India*

[![CI](https://github.com/asur08/Kenzae/actions/workflows/ci.yml/badge.svg)](https://github.com/asur08/Kenzae/actions/workflows/ci.yml)
[![Deploy](https://github.com/asur08/Kenzae/actions/workflows/deploy-vercel.yml/badge.svg)](https://github.com/asur08/Kenzae/actions/workflows/deploy-vercel.yml)
[![Security](https://github.com/asur08/Kenzae/actions/workflows/security.yml/badge.svg)](https://github.com/asur08/Kenzae/actions/workflows/security.yml)

---

## 🌟 Overview

A mobile-first, editorial-quality digital catalog for **Kenzae Designer Boutique** — built with React 19, TypeScript, Vite, and Tailwind CSS. Features real-time catalog filtering, one-tap WhatsApp inquiry, a secured staff portal at `/staff`, and wishlist persistence.

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript |
| **Build** | Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Deployment** | Vercel |
| **CI/CD** | GitHub Actions |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Validate catalog data
python3 tools/validate_catalog_data.py
```

## 📁 Project Structure

```
Kenzae/
├── .github/
│   ├── workflows/          # GitHub Actions CI/CD
│   │   ├── ci.yml          # Lint, typecheck, catalog validate
│   │   ├── deploy-vercel.yml # Production + preview deploys
│   │   ├── pr-checks.yml   # PR quality gates
│   │   ├── security.yml    # Dependency & secret scan
│   │   └── release.yml     # Tag-based GitHub releases
│   ├── ISSUE_TEMPLATE/     # Bug & feature templates
│   └── pull_request_template.md
├── data/
│   └── products.json       # 📦 Single Source of Truth (catalog)
├── src/
│   ├── components/         # React UI components
│   │   ├── catalog/        # Filtering, product grid, drawers
│   │   ├── staff/          # Staff portal (passcode-protected)
│   │   └── ...
│   ├── context/            # CatalogContext, StaffAuthContext
│   ├── types/              # TypeScript interfaces
│   └── utils/              # WhatsApp, invoice, shipping utils
├── tools/                  # Python validation & audit scripts
├── public/                 # Static assets, sitemap, robots.txt
└── vercel.json             # Vercel deployment config
```

## 🗂️ Catalog Management

The catalog is driven by `/data/products.json`. See the **Staff Portal SOP** in `gemini.md` for the full boutique maintenance guide.

### SKU Format
```
KZ-SR-XXX   → Saris
KZ-CH-XXX   → Churidars & Salwar Sets
KZ-DM-XXX   → Unstitched Dress Materials
KZ-KT-XXX   → Kurthis & Ready-to-Wear
```

### Validate Before Committing
```bash
python3 tools/validate_catalog_data.py
```

## 🔐 Staff Portal

Access the inventory management portal at `/staff`.  
**Default passcode:** `kenzae2026` *(change via `src/data/storeConfig.ts`)*

## 🤝 Contributing

1. Create a branch: `git checkout -b feat/your-feature`
2. Make changes and validate: `python3 tools/validate_catalog_data.py`
3. Open a Pull Request — CI runs automatically
4. Merge to `main` triggers Vercel production deploy

## 📍 Store Location

[Kenzae Designer Boutique — Mulanthuruthy, Kerala](https://share.google/m6bQuE0vYpoVkI6oL)

---

*Built with ❤️ for Kenzae, Kerala's designer boutique destination.*
