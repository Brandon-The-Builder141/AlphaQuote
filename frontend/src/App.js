
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import ClerkProviderWrapper from './components/ClerkProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { validateEnv, logConfig } from './config/env';
import StartEstimate from './StartEstimate';
import EstimateForm from './EstimateForm';
import AlphaQuoteWizard from './components/AlphaQuoteWizard';
import EstimateResult from './EstimateResult';
import Profile from './Profile';
import ReceiptNew from './pages/ReceiptNew';
import ReceiptProcess from './pages/ReceiptProcess';
import ReceiptConfirm from './pages/ReceiptConfirm';
import Receipts from './pages/Receipts';
import ReceiptDetail from './pages/ReceiptDetail';
import Vendors from './pages/Vendors';
import VendorNew from './pages/VendorNew';
import VendorEdit from './pages/VendorEdit';
import ProjectBudget from './pages/ProjectBudget';
import Analytics from './pages/Analytics';
import FollowUps from './pages/FollowUps';
import ReceiptParserTest from './components/ReceiptParserTest';
import OfflineMode from './components/OfflineMode';
import AccountingIntegration from './pages/AccountingIntegration';
import JobScheduling from './pages/JobScheduling';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DemoMode from './pages/DemoMode';
import Pricing from './pages/Pricing';
import Landing from './pages/Landing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

/**
 * Root route: signed-in users get the app (unchanged behavior);
 * logged-out visitors get the public landing page.
 */
function RootRoute() {
  const { isSignedIn, isLoaded } = useAuth();

  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasClerkKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY &&
    process.env.REACT_APP_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder_key_for_development' &&
    (process.env.REACT_APP_CLERK_PUBLISHABLE_KEY.startsWith('pk_test_') ||
      process.env.REACT_APP_CLERK_PUBLISHABLE_KEY.startsWith('pk_live_'));

  const appHome = (
    <ProtectedRoute>
      <Layout>
        <StartEstimate />
      </Layout>
    </ProtectedRoute>
  );

  // Same dev fallback as ProtectedRoute: no valid Clerk key in development
  // means auth is bypassed, so show the app as before.
  if (isDevelopment && !hasClerkKey) {
    return appHome;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isSignedIn ? appHome : <Landing />;
}

function App() {
  useEffect(() => {
    // Validate environment configuration
    const isValidEnv = validateEnv();
    if (!isValidEnv) {
      console.error('Environment validation failed. Check console for details.');
    }

    // Log configuration in development
    if (process.env.NODE_ENV === 'development') {
      logConfig();
    }
  }, []);

  // Pass Six: there is no first-run setup. Provisioning creates the
  // account ready-to-use (Iron Legion name, setup stamped server-side),
  // so sign-in lands straight on the dashboard. The old setup routes
  // below just redirect there.

  return (
    <ClerkProviderWrapper>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-body',
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            padding: '16px'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRoute />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/demo" element={<DemoMode />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/profile-setup" element={<Navigate to="/dashboard" replace />} />

          {/* Protected Routes with Layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <StartEstimate />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/estimate" element={
            <ProtectedRoute>
              <Layout>
                <AlphaQuoteWizard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/estimate/advanced" element={
            <ProtectedRoute>
              <Layout>
                <EstimateForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/result" element={
            <ProtectedRoute>
              <Layout>
                <EstimateResult />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/receipts" element={
            <ProtectedRoute>
              <Layout>
                <Receipts />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/receipts/:id" element={
            <ProtectedRoute>
              <Layout>
                <ReceiptDetail />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/receipts/new" element={
            <ProtectedRoute>
              <Layout>
                <ReceiptNew />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/receipts/process" element={
            <ProtectedRoute>
              <Layout>
                <ReceiptProcess />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/receipts/confirm" element={
            <ProtectedRoute>
              <Layout>
                <ReceiptConfirm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/vendors" element={
            <ProtectedRoute>
              <Layout>
                <Vendors />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/vendors/new" element={
            <ProtectedRoute>
              <Layout>
                <VendorNew />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/vendors/:id/edit" element={
            <ProtectedRoute>
              <Layout>
                <VendorEdit />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/projects/:id/budget" element={
            <ProtectedRoute>
              <Layout>
                <ProjectBudget />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/followups" element={
            <ProtectedRoute>
              <Layout>
                <FollowUps />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/offline" element={
            <ProtectedRoute>
              <Layout>
                <OfflineMode />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/accounting" element={
            <ProtectedRoute>
              <Layout>
                <AccountingIntegration />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/scheduling" element={
            <ProtectedRoute>
              <Layout>
                <JobScheduling />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/receipt-parser-test" element={<ReceiptParserTest />} />
          {/* Pass Six: the setup wizard is gone — stale links land on the dashboard. */}
          <Route path="/setup" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ClerkProviderWrapper>
  );
}

export default App;
