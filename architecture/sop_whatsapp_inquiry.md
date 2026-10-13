# SOP: WhatsApp Inquiry Construction & Protocols

**Standard Operating Procedure ID:** SOP-WAP-003  
**Target:** Kenzae Boutique Digital Catalog  
**Version:** 1.0.0  

---

## 1. Intent & Platform Routing Matrix
Boutique customers in Kerala expect direct conversational commerce with boutique stylists.

### Routing Table
| Device Context | Preferred Endpoint | Fallback Protocol |
| :--- | :--- | :--- |
| **Mobile (iOS / Android)** | `https://wa.me/{phone}?text={payload}` | Native app intent `whatsapp://send` |
| **Desktop / Laptop** | `https://web.whatsapp.com/send?phone={phone}&text={payload}` | `wa.me` universal link |
| **Tablet** | `https://wa.me/{phone}?text={payload}` | In-browser web client |

---

## 2. Standardized Message Templates

### Template A: Single Product Reservation
```text
Namaste Kenzae Boutique! ✨

I am interested in reserving/inquiring about:
👗 Product: {title}
🏷️ SKU: {sku}
💰 Price: ₹{price}
🧵 Fabric: {fabricDetails}
🔗 Direct Link: {catalog_url}/?item={sku}

📍 Store Pickup: Mulanthuruthy Boutique / Home Courier
Could you please confirm availability and provide details for ordering or boutique visit?
```

### Template B: Curated Shortlist (Wishlist Multi-Item Inquiry)
```text
Namaste Kenzae Boutique! ✨

I have shortlisted the following {count} piece(s) from your digital catalog:

1. *{title_1}* (SKU: {sku_1}) — ₹{price_1}
2. *{title_2}* (SKU: {sku_2}) — ₹{price_2}
...

🏷️ *Total Estimated Value:* ₹{total_value}
📍 *Store:* Kenzae Boutique, Mulanthuruthy, Ernakulam

Could you please check availability for these items for a trial / order confirmation?
```

### Template C: Boutique Visit / Bridal Appointment
```text
Namaste Kenzae Boutique! ✨

I would like to schedule a boutique visit / bridal trial at your Mulanthuruthy store.
Could you please confirm your available slots and boutique timings?
```

---

## 3. Encoding & Safety Rules
1. Strip all non-numeric characters from recipient phone numbers: `919447000000`.
2. All message parameters must pass through `encodeURIComponent`.
3. Preserve emojis (`👗`, `🏷️`, `💰`, `🧵`, `📍`) as standard UTF-8 characters properly percent-encoded (`%F0%9F%91%97`, etc.).
