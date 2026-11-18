#!/usr/bin/env python3
"""
tools/audit_accessibility.py
Verifies color contrast ratios for Kenzae Boutique's luxury design tokens
against WCAG 2.1 AA standards (4.5:1 for body text, 3.0:1 for large text/UI).
"""

import sys

def hex_to_rgb(hex_code: str):
    hex_code = hex_code.lstrip('#')
    return tuple(int(hex_code[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def relative_luminance(rgb):
    def channel_linear(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    
    r, g, b = [channel_linear(c) for c in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(hex1: str, hex2: str) -> float:
    l1 = relative_luminance(hex_to_rgb(hex1))
    l2 = relative_luminance(hex_to_rgb(hex2))
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def audit_palette():
    print("==================================================")
    print("   KENZAE BOUTIQUE WCAG AA ACCESSIBILITY AUDIT    ")
    print("==================================================")

    # Palette definitions from Visual Token Guidelines
    tokens = {
        "Alabaster Canvas": "#FAF8F5",
        "Pure White Card": "#FFFFFF",
        "Obsidian Ink (Headings)": "#18181B",
        "Warm Slate (Body/Desc)": "#52525B",
        "Temple Brass (Accent)": "#8C6D37",      # Accessible text variant of temple brass
        "Terracotta (Badges)": "#B4533C",
        "Terracotta Pill Background": "#FDF3F0",
        "Royal Maroon (Hero)": "#5E1325",
        "Royal Maroon (Primary)": "#4B0E1D",
        "Gold Foil (Hero Text)": "#EDE0C8",
        "WhatsApp Deep (CTA)": "#128C7E",
        "White": "#FFFFFF",
    }

    test_pairs = [
        # (Foreground, Background, Context, Min_Ratio_AA)
        ("Obsidian Ink (Headings)", "Alabaster Canvas", "Headings on Linen Canvas", 4.5),
        ("Obsidian Ink (Headings)", "Pure White Card", "Headings on Card Surface", 4.5),
        ("Warm Slate (Body/Desc)", "Alabaster Canvas", "Descriptions on Linen Canvas", 4.5),
        ("Warm Slate (Body/Desc)", "Pure White Card", "Descriptions on White Card", 4.5),
        ("Terracotta (Badges)", "Terracotta Pill Background", "Muted Terracotta on Badge Pill", 4.5),
        ("White", "Terracotta (Badges)", "White Text on Terracotta Badge", 3.0),
        ("Gold Foil (Hero Text)", "Royal Maroon (Hero)", "Champagne Gold on Royal Maroon Hero", 4.5),
        ("White", "Royal Maroon (Hero)", "White Headings on Royal Maroon Hero", 4.5),
        ("White", "Royal Maroon (Primary)", "White Text on Maroon CTA", 4.5),
        ("White", "WhatsApp Deep (CTA)", "White Text on WhatsApp CTA", 3.0),
    ]

    all_passed = True
    print(f"{'UI PAIRING':<35} | {'RATIO':<8} | {'MIN':<5} | {'STATUS':<6}")
    print("-" * 65)

    for fg_name, bg_name, desc, min_req in test_pairs:
        fg_hex = tokens[fg_name]
        bg_hex = tokens[bg_name]
        ratio = contrast_ratio(fg_hex, bg_hex)
        passed = ratio >= min_req
        status = "PASS ✅" if passed else "FAIL ❌"

        if not passed:
            all_passed = False

        print(f"{desc:<35} | {ratio:>5.2f}:1  | {min_req:>4.1f} | {status}")

    print("-" * 65)
    if all_passed:
        print("🎉 ALL COLOR CONTRAST RATIOS MEET OR EXCEED WCAG AA COMPLIANCE!\n")
    else:
        print("❌ SOME CONTRAST RATIOS FAILED WCAG AA STANDARDS.\n")
        sys.exit(1)

if __name__ == "__main__":
    audit_palette()
