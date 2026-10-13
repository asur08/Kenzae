#!/usr/bin/env python3
"""
tools/build_catalog_sitemap.py
Generates an XML sitemap indexing all Kenzae Boutique product SKUs
for local search engine discovery around Mulanthuruthy / Ernakulam, Kerala.
"""

import json
import os
import sys
from datetime import datetime
import xml.etree.ElementTree as ET

def build_sitemap(
    catalog_path: str,
    output_path: str,
    base_url: str = "https://kenzaeboutique.com"
):
    print("==================================================")
    print("     BUILDING KENZAE BOUTIQUE CATALOG SITEMAP     ")
    print("==================================================")
    print(f"Reading catalog: {catalog_path}")

    if not os.path.exists(catalog_path):
        print(f"❌ Catalog file missing at {catalog_path}")
        sys.exit(1)

    with open(catalog_path, "r", encoding="utf-8") as f:
        products = json.load(f)

    today = datetime.utcnow().strftime("%Y-%m-%d")

    # XML Schema structure
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    # 1. Homepage & Store Locator root
    home_url = ET.SubElement(urlset, "url")
    ET.SubElement(home_url, "loc").text = f"{base_url}/"
    ET.SubElement(home_url, "lastmod").text = today
    ET.SubElement(home_url, "changefreq").text = "daily"
    ET.SubElement(home_url, "priority").text = "1.0"

    # Store locator section deep anchor
    locator_url = ET.SubElement(urlset, "url")
    ET.SubElement(locator_url, "loc").text = f"{base_url}/#store-locator"
    ET.SubElement(locator_url, "lastmod").text = today
    ET.SubElement(locator_url, "changefreq").text = "weekly"
    ET.SubElement(locator_url, "priority").text = "0.9"

    # 2. Product Deep Links (?item=SKU)
    for p in products:
        sku = p.get("sku")
        if not sku:
            continue

        prod_url = ET.SubElement(urlset, "url")
        ET.SubElement(prod_url, "loc").text = f"{base_url}/?item={sku}"
        ET.SubElement(prod_url, "lastmod").text = today
        ET.SubElement(prod_url, "changefreq").text = "weekly"
        # Featured pieces get higher SEO priority
        priority = "0.8" if p.get("isFeatured") else "0.7"
        ET.SubElement(prod_url, "priority").text = priority

    # Format and save XML
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    tree = ET.ElementTree(urlset)
    ET.indent(tree, space="  ", level=0)
    tree.write(output_path, encoding="utf-8", xml_declaration=True)

    print(f"✅ Generated sitemap with {len(products) + 2} URLs at: {output_path}")
    print(f"   • Root & Store Locator URLs: 2")
    print(f"   • Individual SKU Deep Links: {len(products)}")
    print("   • Search Optimization: Mulanthuruthy, Ernakulam, Kerala local commerce\n")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    catalog_file = os.path.join(base_dir, "..", "data", "products.json")
    output_file = os.path.join(base_dir, "..", "public", "sitemap.xml")
    build_sitemap(catalog_file, output_file)
