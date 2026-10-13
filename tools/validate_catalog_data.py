#!/usr/bin/env python3
"""
tools/validate_catalog_data.py
Strict schema validator for Kenzae Boutique digital catalog.
Validates /data/products.json against the Project Constitution (gemini.md).
"""

import json
import os
import sys
import re

ALLOWED_CATEGORIES = [
    "Saris",
    "Churidars & Salwar Sets",
    "Unstitched Dress Materials",
    "Kurthis & Ready-to-Wear"
]

SKU_REGEX = re.compile(r"^KZ-[A-Z]{2}-[0-9]{3,}$")

def validate_catalog(filepath: str):
    print("==================================================")
    print("      VALIDATING CATALOG DATA & INTEGRITY         ")
    print("==================================================")
    print(f"Reading: {filepath}")

    if not os.path.exists(filepath):
        print(f"❌ File does not exist: {filepath}")
        sys.exit(1)

    with open(filepath, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"❌ JSON Decode Error: {e}")
            sys.exit(1)

    if not isinstance(data, list):
        print("❌ Root catalog payload must be a JSON array.")
        sys.exit(1)

    print(f"Total products to validate: {len(data)}\n")

    errors = []
    seen_ids = set()
    seen_skus = set()

    for idx, item in enumerate(data):
        identifier = item.get("sku") or item.get("id") or f"Item #{idx+1}"

        # 1. Required keys check
        required_keys = ["id", "sku", "title", "category", "price", "images", "in_stock"]
        for key in required_keys:
            if key not in item or item[key] is None:
                errors.append(f"[{identifier}] Missing required field: '{key}'")

        # 2. Unique ID & SKU checks
        item_id = item.get("id")
        if item_id:
            if item_id in seen_ids:
                errors.append(f"[{identifier}] Duplicate id: '{item_id}'")
            seen_ids.add(item_id)

        sku = item.get("sku")
        if sku:
            if not SKU_REGEX.match(sku):
                errors.append(f"[{identifier}] Invalid SKU pattern '{sku}'. Must match ^KZ-[A-Z]{{2}}-[0-9]{{3,}}$")
            if sku in seen_skus:
                errors.append(f"[{identifier}] Duplicate sku: '{sku}'")
            seen_skus.add(sku)

        # 3. Category validation
        category = item.get("category")
        if category not in ALLOWED_CATEGORIES:
            errors.append(f"[{identifier}] Invalid category '{category}'. Must be one of: {ALLOWED_CATEGORIES}")

        # 4. Price & Currency validation
        price = item.get("price")
        if not isinstance(price, (int, float)) or price < 0:
            errors.append(f"[{identifier}] Invalid price '{price}'. Must be a non-negative number.")

        currency = item.get("currency", "INR")
        if currency != "INR":
            errors.append(f"[{identifier}] Invalid currency '{currency}'. Expected 'INR'.")

        # 5. Images validation
        images = item.get("images")
        if not isinstance(images, list) or len(images) == 0:
            errors.append(f"[{identifier}] 'images' must be a non-empty list of URI strings.")
        else:
            for img_idx, img in enumerate(images):
                if not isinstance(img, str) or not (img.startswith("http://") or img.startswith("https://")):
                    errors.append(f"[{identifier}] Image [{img_idx}] is not a valid HTTP/HTTPS URL: '{img}'")

        # 6. In-stock validation
        in_stock = item.get("in_stock")
        if not isinstance(in_stock, bool):
            errors.append(f"[{identifier}] 'in_stock' must be a boolean.")

    if errors:
        print(f"❌ VALIDATION FAILED WITH {len(errors)} ERROR(S):")
        for err in errors:
            print(f"  • {err}")
        sys.exit(1)

    print("✅ All catalog records strictly conform to gemini.md schema!")
    print(f"   • Total records: {len(data)}")
    print(f"   • Unique SKUs: {len(seen_skus)}")
    print(f"   • Categories covered: {len(ALLOWED_CATEGORIES)}/{len(ALLOWED_CATEGORIES)}")
    print("\n")

if __name__ == "__main__":
    catalog_file = os.path.join(os.path.dirname(__file__), "..", "data", "products.json")
    validate_catalog(os.path.abspath(catalog_file))
