# 🚀 Services Running!

## ✅ Current Status

### Catalog API
- **Status**: ✅ Running and Healthy
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health**: `{"status":"healthy","service":"smart-catalog"}`

### AlphaQuote Frontend
- **Status**: ⏳ Starting...
- **Expected URL**: http://localhost:3000
- **Will open automatically in browser**

---

## 🧪 Test the Integration

### Option 1: Use the Test Page (Recommended)
Once AlphaQuote loads, visit:
```
http://localhost:3000/catalog-test
```

You'll see:
- ✅ Health check indicator
- 📝 Project description input
- 🔘 Extract components button
- 📊 Results with pricing tiers

### Option 2: Test API Directly in Browser
Visit the interactive API docs:
```
http://localhost:8000/docs
```

Try the `/api/extract-components` endpoint with:
```json
{
  "project_description": "Install a backyard pergola with cedar lumber"
}
```

### Option 3: Test with PowerShell
```powershell
# Health check
Invoke-RestMethod http://localhost:8000/api/health

# Extract components
$body = @{
    project_description = "Install a backyard pergola with cedar lumber"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8000/api/extract-components `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

---

## 🎯 What to Test

### Sample Project Descriptions
1. "Install a backyard pergola with cedar lumber and stainless steel screws"
2. "Build a deck with 20 pressure-treated boards and galvanized nails"
3. "Paint living room walls with premium paint and primer"
4. "Replace kitchen faucet with chrome finish"

### Expected Results
- ✅ Components extracted (2-5 typically)
- ✅ Three price tiers shown (Budget, Recommended, Premium)
- ✅ Products from vendors (may be limited due to scraping restrictions)
- ✅ Total estimates calculated

---

## 📊 Architecture

```
Browser (http://localhost:3000)
    ↓ React Component
catalogService.extractComponents()
    ↓ HTTP POST
Catalog API (http://localhost:8000/api/extract-components)
    ↓
[InputProcessor] → Extracts components
    ↓
[ComponentMapper] → Adds metadata & price tiers
    ↓
[ScraperManager] → Fetches prices from vendors
    ↓
Returns JSON response
    ↓
React displays results
```

---

## 🛑 To Stop Services

Press `Ctrl+C` in the terminal windows, or:

```powershell
# Stop all Node processes (AlphaQuote)
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Stop Python processes (Catalog API)
Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*Catalog*" } | Stop-Process -Force
```

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Check what's using port 8000
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

# Check what's using port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

### Service Not Responding
```powershell
# Check Catalog API
Invoke-RestMethod http://localhost:8000/api/health

# Check AlphaQuote
Invoke-RestMethod http://localhost:3000
```

### Clear Console and Restart
```powershell
# Stop everything
Get-Process -Name node,python -ErrorAction SilentlyContinue | Stop-Process -Force

# Start Catalog API
cd Catalog
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python main.py"

# Start AlphaQuote (in new terminal)
cd ..
npm run dev
```

---

## 📝 Next Steps

1. **Wait for AlphaQuote to load** (should open in browser automatically)
2. **Visit test page**: http://localhost:3000/catalog-test
3. **Try a sample description** and click "Extract Components"
4. **See the results** with price tiers and products
5. **Check documentation**:
   - `Catalog/QUICK_INTEGRATION_GUIDE.md`
   - `Catalog/INTEGRATION_WITH_ALPHAQUOTE.md`

---

## 🎉 You're All Set!

Both services are running and ready to test!

**Test Page**: http://localhost:3000/catalog-test  
**API Docs**: http://localhost:8000/docs

Enjoy testing the Smart Catalog integration! 🚀

