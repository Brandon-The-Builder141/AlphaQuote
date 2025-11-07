
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import SetupWizard from './components/SetupWizard';
import OfflineMode from './components/OfflineMode';
import AccountingIntegration from './pages/AccountingIntegration';
import JobScheduling from './pages/JobScheduling';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DemoMode from './pages/DemoMode';
import ProfileSetup from './components/ProfileSetup';
import Pricing from './pages/Pricing';

function App() {
  const [showWizard, setShowWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

    // Check if wizard has been completed or skipped
    const wizardCompleted = localStorage.getItem('alphaquote_wizard_completed');
    const wizardSkipped = localStorage.getItem('alphaquote_wizard_skipped');
    const isFirstTime = !wizardCompleted && !wizardSkipped;

    if (isFirstTime) {
      setShowWizard(true);
    }

    setIsLoading(false);
  }, []);

  const handleWizardComplete = (wizardData) => {
    // Apply branding from wizard data
    if (wizardData.branding?.primaryColor) {
      document.documentElement.style.setProperty('--primary', wizardData.branding.primaryColor);
    }
    if (wizardData.branding?.secondaryColor) {
      document.documentElement.style.setProperty('--secondary', wizardData.branding.secondaryColor);
    }
    if (wizardData.branding?.accentColor) {
      document.documentElement.style.setProperty('--accent', wizardData.branding.accentColor);
    }

    setShowWizard(false);
    // No need to redirect - React Router will handle the routing
  };

  const handleWizardSkip = () => {
    // Set wizard as skipped in localStorage
    localStorage.setItem('alphaquote_wizard_completed', 'skipped');
    localStorage.setItem('alphaquote_wizard_skipped', 'true');

    setShowWizard(false);
    // No need to redirect - React Router will handle the routing
  };

  const loadWizardData = () => {
    try {
      const storedData = localStorage.getItem('alphaquote_wizard_data');
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error('Error loading wizard data:', error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-body">Loading AlphaQuote...</p>
        </div>
      </div>
    );
  }

  if (showWizard) {
    return <SetupWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} />;
  }

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
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <StartEstimate />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/demo" element={<DemoMode />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />

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
          <Route path="/setup" element={<SetupWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} initialData={loadWizardData()} />} />
        </Routes>
      </Router>
    </ClerkProviderWrapper>
  );
}

export default App;
