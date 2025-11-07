# 🚀 AlphaQuote Manual Deployment Guide

This guide will help you deploy AlphaQuote manually to production hosting platforms without GitHub integration.

## 📋 Deployment Options

### **Frontend Options:**
1. **Vercel** (Recommended) - Easy drag & drop deployment
2. **Netlify** - Simple file upload deployment
3. **Firebase Hosting** - Google's hosting platform
4. **AWS S3 + CloudFront** - Scalable cloud hosting

### **Backend Options:**
1. **Railway** (Recommended) - Easy Node.js deployment
2. **Render** - Simple backend hosting
3. **Heroku** - Popular platform (paid plans)
4. **DigitalOcean App Platform** - Cloud hosting

## 🎯 Recommended Stack: Vercel + Railway

### **Frontend: Vercel**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Easy environment variables
- ✅ Custom domains

### **Backend: Railway**
- ✅ Free tier available
- ✅ Automatic deployments
- ✅ Database hosting
- ✅ Environment variables
- ✅ Custom domains

## 📦 Pre-Deployment Checklist

### **Frontend Preparation:**
- [ ] Build production bundle
- [ ] Set up environment variables
- [ ] Test production build locally
- [ ] Optimize assets

### **Backend Preparation:**
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Test API endpoints
- [ ] Set up CORS for production domain

## 🔧 Step-by-Step Deployment

### **Phase 1: Frontend (Vercel)**

1. **Build Production Bundle**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login
   - Click "New Project"
   - Choose "Upload" option

3. **Upload Build Folder**
   - Drag and drop the `build` folder
   - Configure environment variables
   - Deploy

### **Phase 2: Backend (Railway)**

1. **Prepare Backend**
   ```bash
   cd backend
   npm install --production
   ```

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Sign up/login
   - Click "New Project"
   - Choose "Deploy from GitHub" (or upload manually)

3. **Configure Environment**
   - Set up environment variables
   - Connect database
   - Deploy

### **Phase 3: Database Setup**

1. **Railway PostgreSQL** (Recommended)
   - Add PostgreSQL service
   - Get connection string
   - Update backend environment

2. **Alternative: Supabase**
   - Create project at [supabase.com](https://supabase.com)
   - Get connection string
   - Run migrations

## 🔐 Environment Variables

### **Frontend (.env.production)**
```env
REACT_APP_API_URL=https://your-backend.railway.app
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
```

### **Backend (Railway Environment)**
```env
DATABASE_URL=postgresql://user:pass@host:port/db
CLERK_SECRET_KEY=sk_live_your_production_key
API_PORT=3001
NODE_ENV=production
```

## 🛠️ Deployment Scripts

I'll create automated scripts to help with the deployment process.

## 📊 Post-Deployment

### **Testing Checklist:**
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Authentication works
- [ ] Database connections work
- [ ] File uploads work
- [ ] Email sending works

### **Monitoring:**
- [ ] Set up error tracking (Sentry)
- [ ] Monitor performance
- [ ] Set up uptime monitoring
- [ ] Configure backups

## 🔄 Updates & Maintenance

### **Frontend Updates:**
1. Build new version locally
2. Upload new build to Vercel
3. Update environment variables if needed

### **Backend Updates:**
1. Update code locally
2. Upload to Railway
3. Run database migrations
4. Test endpoints

## 🆘 Troubleshooting

### **Common Issues:**
- **CORS errors** - Check backend CORS settings
- **Environment variables** - Verify all are set correctly
- **Database connections** - Check connection strings
- **Build failures** - Check for TypeScript/ESLint errors

### **Support Resources:**
- Vercel Documentation
- Railway Documentation
- AlphaQuote GitHub Issues (if available)

---

**Ready to deploy?** Let's start with creating the deployment scripts! 🚀
