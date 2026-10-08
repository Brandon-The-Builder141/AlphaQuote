# 🔐 AlphaQuote Authentication Setup Guide

This guide will help you set up Clerk authentication for AlphaQuote to enable user accounts, protected routes, and Pro features.

## 📋 Prerequisites

- Node.js 18+ installed
- Clerk account (free at [clerk.com](https://clerk.com))
- AlphaQuote project cloned and dependencies installed

## 🚀 Step 1: Create Clerk Application

1. **Sign up for Clerk**
   - Go to [clerk.com](https://clerk.com)
   - Create a free account
   - Create a new application

2. **Configure your application**
   - Choose "Multi-tenant" for the application type
   - Set your application name (e.g., "AlphaQuote")
   - Choose your sign-in methods (Email + Password recommended)

3. **Get your API keys**
   - In your Clerk dashboard, go to "API Keys"
   - Copy your **Publishable Key** (starts with `pk_test_`)
   - Copy your **Secret Key** (starts with `sk_test_`)

## 🔧 Step 2: Configure Environment Variables

### Frontend Configuration

1. **Create environment file**
   ```bash
   cd frontend
   cp env.example .env
   ```

2. **Update `.env` with your Clerk keys**
   ```env
   REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
   REACT_APP_API_URL=http://localhost:3001
   ```

### Backend Configuration

1. **Create environment file**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Update `.env` with your Clerk keys**
   ```env
   CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
   API_PORT=3001
   ```

## 🗄️ Step 3: Update Database Schema

The authentication system requires additional database tables for user management.

1. **Run database migrations**
   ```bash
   cd backend
   npx prisma migrate dev --name add_user_auth
   ```

2. **Seed the database**
   ```bash
   npx prisma db seed
   ```

## 🎯 Step 4: Configure Clerk Dashboard

1. **Set up redirect URLs**
   - In Clerk dashboard, go to "Paths"
   - Add these redirect URLs:
     - `http://localhost:3000/sign-in`
     - `http://localhost:3000/sign-up`
     - `http://localhost:3000/dashboard`
     - `http://localhost:3000/profile-setup`

2. **Configure user metadata**
   - Go to "User & Authentication" → "User metadata"
   - Add these public metadata fields:
     - `profileCompleted` (boolean)
     - `companyName` (string)
     - `subscription` (string)

## 🚀 Step 5: Start the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend**
   ```bash
   cd frontend
   npm start
   ```

3. **Test the authentication**
   - Visit `http://localhost:3000`
   - Click "Get Started Free" to sign up
   - Complete the profile setup
   - Try accessing protected routes

## 🎨 Step 6: Customize Authentication UI

The authentication pages are fully customizable:

- **Sign In**: `frontend/src/pages/SignIn.jsx`
- **Sign Up**: `frontend/src/pages/SignUp.jsx`
- **Profile Setup**: `frontend/src/components/ProfileSetup.jsx`

## 🔒 Step 7: Test Pro Features

1. **Demo Mode**
   - Visit `http://localhost:3000/demo`
   - Click "Start Demo" to test without signing up

2. **Pro Feature Gating**
   - Try to export a PDF or use accounting features
   - You should see the Pro upgrade prompt

## 📱 Step 8: Production Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend (Railway/Render)
1. Connect your repository
2. Add environment variables
3. Update `REACT_APP_API_URL` to your deployed backend URL

## 🛠️ Troubleshooting

### Common Issues

1. **"Missing Publishable Key" error**
   - Check that `REACT_APP_CLERK_PUBLISHABLE_KEY` is set in `.env`
   - Restart the frontend server

2. **"Invalid token" error**
   - Check that `CLERK_SECRET_KEY` is set in backend `.env`
   - Verify the key is correct (not the publishable key)

3. **Database connection issues**
   - Ensure the database file exists at `backend/prisma/dev.db`
   - Run `npx prisma migrate dev` to create tables

4. **Redirect issues**
   - Verify redirect URLs are configured in Clerk dashboard
   - Check that URLs match exactly (including http/https)

### Debug Mode

Enable Clerk debug mode by adding to your frontend `.env`:
```env
REACT_APP_CLERK_DEBUG=true
```

## 🎯 Next Steps

Once authentication is working:

1. **Set up Stripe** for Pro subscriptions
2. **Configure email** for notifications
3. **Add analytics** tracking
4. **Set up monitoring** and error tracking

## 📞 Support

If you encounter issues:

1. Check the [Clerk documentation](https://clerk.com/docs)
2. Review the AlphaQuote logs in the browser console
3. Check the backend server logs for API errors

---

**Congratulations!** 🎉 You now have a fully functional authentication system for AlphaQuote. Users can sign up, sign in, and access Pro features based on their subscription level.
