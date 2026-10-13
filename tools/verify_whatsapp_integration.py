#!/usr/bin/env python3
"""
tools/verify_whatsapp_integration.py
Validates WhatsApp deep-link generation, country code normalization, 
and message encoding for Kenzae Boutique.
"""

import sys
import urllib.parse
import re

def clean_phone_number(raw_phone: str) -> str:
    """Normalize phone number to international format without +, spaces, or dashes."""
    cleaned = re.sub(r'\D', '', raw_phone)
    # If starting with 0, remove it
    if cleaned.startswith('0'):
        cleaned = cleaned[1:]
    # If 10 digits without country code, prepend 91 (India)
    if len(cleaned) == 10:
        cleaned = '91' + cleaned
    return cleaned

def generate_whatsapp_inquiry_url(
    phone: str,
    sku: str,
    title: str,
    price: int,
    image_url: str = None,
    platform: str = "universal"
) -> str:
    """Constructs compliant WhatsApp click-to-chat deep link."""
    clean_phone = clean_phone_number(phone)
    
    # Standardized inquiry message
    lines = [
        "Namaste Kenzae Boutique! ✨",
        "",
        "I am interested in reserving/inquiring about:",
        f"👗 Product: {title}",
        f"🏷️ SKU: {sku}",
        f"💰 Price: ₹{price:,}",
        f"🖼️ Photo: {image_url}" if image_url else "",
        "",
        "📍 Boutique: Mulanthuruthy, Ernakulam",
        "Could you please confirm availability and provide details for ordering or boutique visit?"
    ]
    message_text = "\n".join([line for line in lines if line is not None and (line != "" or lines.index(line) in [1, 7])])
    encoded_text = urllib.parse.quote(message_text)

    if platform == "desktop":
        return f"https://web.whatsapp.com/send?phone={clean_phone}&text={encoded_text}"
    elif platform == "api":
        return f"https://api.whatsapp.com/send?phone={clean_phone}&text={encoded_text}"
    else:  # universal wa.me
        return f"https://wa.me/{clean_phone}?text={encoded_text}"

def run_tests():
    print("==================================================")
    print("  VERIFYING WHATSAPP INTEGRATION & DEEP-LINKING   ")
    print("==================================================")

    # Test 1: Phone normalization
    test_cases = [
        ("+91 94470-12345", "919447012345"),
        ("9447012345", "919447012345"),
        ("09447012345", "919447012345"),
        ("+91 (944) 701-2345", "919447012345"),
        ("919447000000", "919447000000")
    ]
    
    for raw, expected in test_cases:
        res = clean_phone_number(raw)
        assert res == expected, f"Phone normalization failed for {raw}: got {res}, expected {expected}"
        print(f"  [PASS] Normalized '{raw}' -> '{res}'")

    # Test 2: URL Encoding & Payload Validation
    sample_sku = "KZ-SR-001"
    sample_title = "Royal Katan Banarasi Silk Sari in Emerald"
    sample_price = 12850
    sample_img = "https://images.unsplash.com/photo-1610030469983-98e550d6193c"
    phone = "+91 94470 12345"

    url = generate_whatsapp_inquiry_url(phone, sample_sku, sample_title, sample_price, sample_img)
    
    # Assert expected structure
    assert url.startswith("https://wa.me/919447012345?text="), f"Invalid URL prefix: {url}"
    assert "KZ-SR-001" in urllib.parse.unquote(url), "SKU missing from decoded URL payload"
    assert "₹12,850" in urllib.parse.unquote(url), "Formatted price missing from decoded URL payload"
    assert "Mulanthuruthy" in urllib.parse.unquote(url), "Location missing from payload"

    print("  [PASS] Generated universal wa.me deep link successfully:")
    print(f"         {url[:75]}...")

    # Test 3: Desktop Web WhatsApp link
    desktop_url = generate_whatsapp_inquiry_url(phone, sample_sku, sample_title, sample_price, sample_img, platform="desktop")
    assert desktop_url.startswith("https://web.whatsapp.com/send?phone=919447012345&text="), "Desktop link invalid"
    print("  [PASS] Generated desktop web.whatsapp.com fallback successfully")

    print("\n✅ ALL WHATSAPP INTEGRATION TESTS PASSED!\n")

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as e:
        print(f"\n❌ TEST FAILURE: {e}")
        sys.exit(1)
