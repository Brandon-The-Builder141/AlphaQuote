# 🚀 Cart Import Flow - Quick Start Guide

## What Is It?
A **3-step guided workflow** that helps you import materials from supplier carts (Home Depot, Lowe's, etc.) directly into your AlphaQuote estimates.

---

## 🎯 How to Use (3 Easy Steps)

### Step 1: Launch Supplier Site
1. Click the **"Import Cart"** button in your Estimate Form
2. Choose a supplier (Home Depot, Lowe's, Menards, or add your own)
3. Click **"Launch Cart"** → Opens supplier site in new tab
4. ✅ Step 1 complete!

### Step 2: Build Your Cart (On Supplier Site)
1. Add materials to your cart on the supplier website
2. Select quantities, sizes, etc.
3. When done, **copy your cart text** (Ctrl+A, Ctrl+C)
4. Return to AlphaQuote tab

### Step 3: Paste & Import
1. **Paste** your cart text into the text area
2. Click **"Parse Cart Text"**
3. Review the preview table
4. Click **"Import to Estimate"**
5. ✅ Done! Materials added to your estimate!

---

## 📸 Visual Flow

```
EstimateForm
     ↓
[Import Cart Button]
     ↓
┌─────────────────────────────────┐
│ CART IMPORT FLOW MODAL          │
├─────────────────────────────────┤
│ Quick Guide:                    │
│ ☑ Step 1: Launch Supplier      │
│ ☐ Step 2: Build Cart           │
│ ☐ Step 3: Paste & Import       │
├─────────────────────────────────┤
│ [1] SUPPLIER LINKS              │
│     [🏬 Home Depot] Launch      │
│     [🛒 Lowe's] Launch          │
│     [+ Add Custom]              │
├─────────────────────────────────┤
│ [2] BUILD CART                  │
│     (Reminder: Add items on     │
│      supplier site)             │
├─────────────────────────────────┤
│ [3] PASTE & IMPORT              │
│     [Text Area: Paste here]     │
│     ↓                           │
│     [Parse Cart Text]           │
│     ↓                           │
│     Preview Table:              │
│     Name | Qty | $ | Total      │
│     ────────────────────        │
│     Item1  10   5.98  59.80     │
│     Item2   5  32.99 164.95     │
│     ────────────────────        │
│     Total:         $224.75      │
│     ↓                           │
│     [Import to Estimate]        │
└─────────────────────────────────┘
```

---

## 🎨 Example Cart Formats

### Home Depot Format:
```
2x4x8 Pressure Treated Lumber
Qty: 10
$5.98 each
Total: $59.80

1 Gallon Interior Paint - White
Qty: 5
$32.99 each
Total: $164.95
```

### Lowe's Format:
```
2x4x8 Lumber | 10 | $5.98 | $59.80
Paint Gallon | 5 | $32.99 | $164.95
```

### Simple Format:
```
2x4x8 Lumber    10    $5.98
Paint Gallon    5     $32.99
```

**All formats work!** Just paste and the system will figure it out.

---

## ⚡ Pro Tips

### 1. **Add Your Favorite Suppliers**
Don't see your local hardware store? Add it!
- Enter store name
- Enter website URL
- Click "Add Supplier"
- Now it's in your quick launch list!

### 2. **Multiple Suppliers**
Building a cart from multiple stores?
- Launch first supplier → build cart → copy text
- Paste and parse (DON'T import yet)
- Launch second supplier → build cart → copy text
- Paste below first items
- Parse everything together
- Import all at once!

### 3. **Edit Before Import**
See something wrong in the preview?
- Click the ❌ button to remove any item
- Total updates automatically
- Only import what you want

### 4. **Reuse Suppliers**
Your saved suppliers are stored locally.
- They'll be there next time you open the flow
- Delete ones you don't use
- Add new ones anytime

---

## 🔧 Troubleshooting

### "No valid items found"
- **Problem:** Cart text format not recognized
- **Solution:** Try reformatting your paste:
  ```
  Item Name    Quantity    Price
  Lumber       10          $5.98
  Paint        5           $32.99
  ```

### Items Not Parsing Correctly
- **Problem:** Special characters or unusual format
- **Solution:** Simplify the text:
  - Remove extra columns (SKU, store #, etc.)
  - Keep just: Name, Qty, Price
  - One item per line

### Supplier Link Won't Open
- **Problem:** Popup blocked
- **Solution:** 
  - Allow popups for AlphaQuote
  - Or right-click → Open in new tab

---

## 📊 What Gets Imported?

Each cart item becomes a work item in your estimate:
```
Cart Item:
- Name: "2x4x8 Lumber"
- Quantity: 10
- Unit Price: $5.98
- Total: $59.80

Becomes:
- Room Name: "2x4x8 Lumber"
- Square Footage: 10
- Material: "2x4x8 Lumber"
- Material Cost/sqft: $5.98
- Labor: "Installation" (default)
- Labor Hours: 1 (estimated)
```

You can edit all fields after import!

---

## ⏱️ Time Savings

| Manual Entry | Cart Import Flow |
|--------------|------------------|
| 2 min per item | 10 seconds total |
| Type every detail | Paste once |
| Risk of typos | Direct from supplier |
| 10 items = 20 min | 10 items = 10 sec |

**That's 120x faster!** ⚡

---

## 🎯 Best Practices

### DO:
✅ Launch supplier site first
✅ Build complete cart before copying
✅ Review preview before importing
✅ Add custom suppliers you use often
✅ Remove unwanted items from preview

### DON'T:
❌ Copy partial carts (wait until complete)
❌ Mix text from different sites in one paste
❌ Skip the preview step
❌ Import without checking totals

---

## 🚀 Quick Reference Card

```
┌─────────────────────────────────────┐
│ CART IMPORT FLOW CHEAT SHEET        │
├─────────────────────────────────────┤
│ 1. Launch → Opens supplier site     │
│ 2. Build → Add items to cart        │
│ 3. Copy → Select all cart text      │
│ 4. Paste → Into AlphaQuote          │
│ 5. Parse → Click button             │
│ 6. Review → Check preview table     │
│ 7. Import → Add to estimate         │
├─────────────────────────────────────┤
│ Time: ~30 seconds per cart          │
│ Formats: HD, Lowe's, Menards, etc.  │
│ Editable: Yes, before & after       │
│ Saved: Suppliers stored locally     │
└─────────────────────────────────────┘
```

---

## 📞 Need Help?

### Common Questions:

**Q: Can I edit items after import?**
A: Yes! Just edit them in the Estimate Form like normal.

**Q: Does it work with other suppliers?**
A: Yes! Add any supplier URL and paste their cart text.

**Q: What if parsing fails?**
A: Simplify the text format (Name, Qty, Price) and try again.

**Q: Can I save multiple carts?**
A: Not yet, but you can import multiple times.

**Q: Is my data sent anywhere?**
A: No! Everything happens locally in your browser.

---

## ✨ That's It!

You're ready to import carts like a pro!

**Happy Estimating!** 🎉




