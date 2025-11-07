# 🚀 How to Start AlphaQuote + Catalog

## ✅ Current Status

### Catalog API
- **Status**: ✅ RUNNING
- **URL**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

### Frontend
- **Status**: ⏳ STARTING (takes 20-30 seconds)
- **URL**: http://localhost:3000 (will open automatically)
- **Expected**: Browser will open automatically when ready

---

## 📝 Correct Start Commands

### Method 1: Start Both Services (Separate Terminals)

**Terminal 1 - Catalog API:**
```powershell
cd "C:\Users\IRONK\OneDrive\Desktop\AlphaQuote - V.3\Catalog"
python main.py
```

**Terminal 2 - AlphaQuote Frontend:**
```powershell
cd "C:\Users\IRONK\OneDrive\Desktop\AlphaQuote - V.3\frontend"
npm start
```

### Method 2: Quick Start Script

I'll create a better startup script for you:

**Run this from AlphaQuote root:**
```powershell
.\quick-start.ps1
```

---

## ⏱️ Startup Timeline

1. **Catalog API** (5 seconds)
   - ✅ Already running!
   - Check: http://localhost:8000/docs

2. **Frontend Compilation** (20-30 seconds)
   - ⏳ Currently compiling...
   - React is building your app
   - Will open browser automatically

3. **Ready to Test!** 
   - Browser opens to http://localhost:3000
   - Navigate to http://localhost:3000/catalog-test

---

## 🎯 Once Frontend Loads

### Go to the Test Page:
```
http://localhost:3000/catalog-test
```

### Or test the Catalog API directly:
```
http://localhost:8000/docs
```

---

## 🧪 Test the Integration

Once on the test page, try:

1. **Check Health Status** - Should show "✅ Healthy"
2. **Enter Description**: "Install a backyard pergola with cedar lumber"
3. **Click**: "Extract Components & Get Pricing"
4. **See Results**: Components with 3 price tiers

---

## 🛑 To Stop Services

Press `Ctrl+C` in each terminal window

Or run:
```powershell
Get-Process -Name node,python -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 🐛 If Frontend Takes Too Long

If after 60 seconds the frontend hasn't opened:

1. **Check for errors** in the terminal
2. **Check port 3000**:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
   ```
3. **Try manually**:
   ```powershell
   cd frontend
   npm start
   ```

---

## ✅ Services Checklist

- [x] Catalog API started (port 8000) ✅
- [ ] Frontend compiled (takes 20-30 seconds) ⏳
- [ ] Browser opened to http://localhost:3000
- [ ] Navigated to http://localhost:3000/catalog-test
- [ ] Tested component extraction

---

## 📊 Expected Output

### Terminal 1 (Catalog API):
```
Database initialized successfully
Starting Smart Catalog API on http://0.0.0.0:8000
API Documentation: http://0.0.0.0:8000/docs
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2 (Frontend):
```
Compiled successfully!

You can now view alphaquote in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

---

## 🎉 Next Steps

1. **Wait for browser to open** (20-30 seconds)
2. **Visit test page**: http://localhost:3000/catalog-test
3. **Try sample descriptions** and see the results
4. **Check documentation**:
   - `Catalog/QUICK_INTEGRATION_GUIDE.md`
   - `Catalog/INTEGRATION_WITH_ALPHAQUOTE.md`

---

**Current Time**: Waiting for frontend compilation...  
**Expected Ready**: ~20 seconds from now  
**Browser will open automatically!** 🚀

