
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import StartEstimate from './StartEstimate';
import EstimateForm from './EstimateForm';
import EstimateResult from './EstimateResult';
import Profile from './Profile';
import AlphaBot from './AlphaBot';
import ReceiptNew from './pages/ReceiptNew';
import ReceiptProcess from './pages/ReceiptProcess';
import ReceiptConfirm from './pages/ReceiptConfirm';
import Receipts from './pages/Receipts';
import ReceiptDetail from './pages/ReceiptDetail';
import Vendors from './pages/Vendors';
import VendorNew from './pages/VendorNew';
import ProjectBudget from './pages/ProjectBudget';
import ReceiptParserTest from './components/ReceiptParserTest';
import SetupWizard from './components/SetupWizard';

function App() {
  const [showWizard, setShowWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if wizard has been completed
    const wizardCompleted = localStorage.getItem('alphaquote_wizard_completed');
    const isFirstTime = !wizardCompleted;

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
    // Redirect to homepage
    window.location.href = '/';
  };

  const handleWizardSkip = () => {
    setShowWizard(false);
    // Redirect to homepage
    window.location.href = '/';
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
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<StartEstimate />} />
        <Route path="/estimate" element={<EstimateForm />} />
        <Route path="/result" element={<EstimateResult />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ai-assist" element={<AlphaBot />} />
        <Route path="/receipts" element={<Receipts />} />
        <Route path="/receipts/:id" element={<ReceiptDetail />} />
        <Route path="/receipts/new" element={<ReceiptNew />} />
        <Route path="/receipts/process" element={<ReceiptProcess />} />
        <Route path="/receipts/confirm" element={<ReceiptConfirm />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/new" element={<VendorNew />} />
        <Route path="/projects/:id/budget" element={<ProjectBudget />} />
        <Route path="/receipt-parser-test" element={<ReceiptParserTest />} />
        <Route path="/setup" element={<SetupWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} initialData={loadWizardData()} />} />
      </Routes>
    </Router>
  );
}

export default App;
