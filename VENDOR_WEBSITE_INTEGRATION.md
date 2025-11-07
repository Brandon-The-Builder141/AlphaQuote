# Vendor Website URL Integration

## What Was Added

You can now **save website URLs for each vendor** and **click to launch them** directly from the Vendors page!

---

## ✅ Changes Made

### 1. **Updated Vendor Schema** (`schemas/index.js`)
Added `websiteUrl` field with URL validation:
```javascript
export const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  contactInfo: z.string().optional(),
  websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),  // NEW!
  notes: z.string().optional()
});
```

### 2. **Added Website Field to Vendor Form** (`pages/VendorNew.jsx`)
New input field with Globe icon:
```jsx
{/* Website URL */}
<div>
  <label htmlFor="websiteUrl">
    <Globe className="w-4 h-4" />
    Website URL
  </label>
  <input
    {...register('websiteUrl')}
    type="url"
    placeholder="https://www.example.com"
  />
  <p>Optional: Vendor's website for quick access and cart imports</p>
</div>
```

### 3. **Added Clickable Link to Vendor Cards** (`pages/Vendors.jsx`)
Each vendor card now shows:
```jsx
{vendor.websiteUrl && (
  <div className="mb-3">
    <motion.button
      onClick={() => window.open(vendor.websiteUrl, '_blank')}
      className="flex items-center gap-2 text-primary"
    >
      <Globe className="w-4 h-4" />
      <span>{vendor.websiteUrl.replace(/^https?:\/\//, '')}</span>
      <ExternalLink className="w-3 h-3" />
    </motion.button>
  </div>
)}
```

---

## 🎯 How to Use

### **Adding a New Vendor with Website:**
1. Go to **Vendors** (sidebar navigation)
2. Click **"Add New Vendor"**
3. Fill in form:
   - **Vendor Name*** (required) - e.g., "Home Depot"
   - **Contact Information** (optional) - phone, email, etc.
   - **Website URL** (optional) - e.g., "https://www.homedepot.com"
   - **Notes** (optional)
4. Click **"Create Vendor"**
5. Done! ✅

### **Viewing & Launching Vendor Websites:**
1. Go to **Vendors** page
2. Each vendor card shows:
   - Vendor name
   - Contact info (if added)
   - **🌐 Website link** (if added) ← Click to launch!
   - Notes
   - Stats (prices, receipts)
3. Click the website link → Opens in new tab
4. Build your cart on their site
5. Copy cart text
6. Use **Cart Import Flow** to import materials!

---

## 🔄 Integration with Cart Import Flow

### **Workflow:**

```
1. Save vendors with website URLs
        ↓
2. Click vendor website link
        ↓
3. Vendor site opens in new tab
        ↓
4. Build cart on vendor site
        ↓
5. Copy cart text (Ctrl+A, Ctrl+C)
        ↓
6. Return to AlphaQuote
        ↓
7. Go to EstimateForm
        ↓
8. Click "Import Cart" button
        ↓
9. Paste cart text
        ↓
10. Import to estimate ✅
```

---

## 📸 Visual Example

### **Vendor Card Before:**
```
┌─────────────────────────┐
│ 🏢 Home Depot           │
│ [Edit] [Delete]         │
├─────────────────────────┤
│ Contact: 555-1234       │
│ Notes: Local store      │
├─────────────────────────┤
│ Added Feb 1, 2025       │
└─────────────────────────┘
```

### **Vendor Card After:**
```
┌─────────────────────────┐
│ 🏢 Home Depot           │
│ [Edit] [Delete]         │
├─────────────────────────┤
│ Contact: 555-1234       │
│ 🌐 homedepot.com 🔗     │  ← NEW! Clickable!
│ Notes: Local store      │
├─────────────────────────┤
│ Added Feb 1, 2025       │
└─────────────────────────┘
```

---

## 🎨 UI Elements

### **Website Link Styling:**
- **Icon:** 🌐 Globe icon
- **Color:** Primary (teal/cyan)
- **Hover:** Slightly lighter
- **External link icon:** Small arrow →
- **Truncation:** Long URLs are shortened
- **Animation:** Hover scale effect

### **Form Field:**
- **Label:** "Website URL" with globe icon
- **Type:** URL input with validation
- **Placeholder:** "https://www.example.com"
- **Validation:** Must be valid URL format
- **Helper text:** "Optional: Vendor's website for quick access and cart imports"

---

## 💡 Use Cases

### **1. National Chains:**
```javascript
{
  name: "Home Depot",
  websiteUrl: "https://www.homedepot.com",
  contactInfo: "800-HOME-DEPOT"
}
```

### **2. Local Suppliers:**
```javascript
{
  name: "Joe's Hardware",
  websiteUrl: "https://www.joeshardware.com",
  contactInfo: "555-1234 - Ask for Joe"
}
```

### **3. Online-Only Vendors:**
```javascript
{
  name: "BuildDirect",
  websiteUrl: "https://www.builddirect.com",
  contactInfo: "orders@builddirect.com"
}
```

---

## 🚀 Benefits

| Before | After |
|--------|-------|
| Copy/paste URLs manually | One-click launch |
| Search for vendor sites | Quick access from vendor card |
| No URL storage | URLs saved with vendor |
| Switch tabs manually | Opens in new tab automatically |
| - | Integrated with Cart Import Flow |

---

## 📋 Database Schema (Backend)

If you need to update the backend database, add the `websiteUrl` field to the vendors table:

```sql
ALTER TABLE vendors ADD COLUMN websiteUrl TEXT;
```

Or in Prisma schema:
```prisma
model Vendor {
  id          Int      @id @default(autoincrement())
  name        String
  contactInfo String?
  websiteUrl  String?  // NEW FIELD
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## ✅ Status

- ✅ Schema updated with websiteUrl field
- ✅ VendorNew form includes website input
- ✅ Vendor cards display clickable links
- ✅ URL validation in place
- ✅ Opens in new tab
- ✅ Dark theme styling
- ✅ No ESLint errors
- ✅ Ready to use!

---

## 🎉 Result

**You now have a complete vendor website management system that integrates seamlessly with the Cart Import Flow!**

Users can:
1. Save vendor websites when creating vendors
2. Click to launch vendor sites from vendor cards
3. Build carts on vendor sites
4. Import carts back into AlphaQuote

**All in a streamlined, user-friendly workflow!** 🚀




