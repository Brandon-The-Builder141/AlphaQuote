import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Home,
  FileText,
  Calculator,
  ArrowLeft,
  Check
} from 'lucide-react';

// Step Components
import ClientInfoStep from './wizard-steps/ClientInfoStep';
import WorkItemsSetupStep from './wizard-steps/WorkItemsSetupStep';
import ReviewNotesStep from './wizard-steps/ReviewNotesStep';
import EstimateSummaryStep from './wizard-steps/EstimateSummaryStep';

export default function AlphaQuoteWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    // Client Info
    clientName: '',
    jobType: 'Residential',
    email: '',
    phone: '',
    address: '',

    // Work Items (both rooms and tasks)
    workItems: [],

    // Review
    notes: '',
    markup: 15,
    taxEnabled: false,
    taxRate: 0,
    discount: 0,

    // Summary (calculated)
    subtotal: 0,
    markupAmount: 0,
    taxAmount: 0,
    total: 0
  });

  const steps = [
    {
      number: 1,
      title: 'Client Info',
      icon: User,
      component: ClientInfoStep,
      description: 'Basic client details'
    },
    {
      number: 2,
      title: 'Work Items',
      icon: Home,
      component: WorkItemsSetupStep,
      description: 'Add rooms and tasks'
    },
    {
      number: 3,
      title: 'Review',
      icon: FileText,
      component: ReviewNotesStep,
      description: 'Notes and markup'
    },
    {
      number: 4,
      title: 'Summary',
      icon: Calculator,
      component: EstimateSummaryStep,
      description: 'Generate estimate'
    }
  ];

  const updateWizardData = (newData) => {
    setWizardData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepNumber) => {
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading text-white mb-2">Create New Estimate</h1>
              <p className="text-slate-400">Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}</p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300">Progress: {Math.round((currentStep / steps.length) * 100)}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-slate-800 rounded-full hidden md:block"></div>

            {/* Active Progress Bar */}
            <motion.div
              className="absolute top-6 left-0 h-1 bg-gradient-to-r from-primary to-accent rounded-full hidden md:block"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            ></motion.div>

            {/* Step Indicators */}
            <div className="relative flex justify-between">
              {steps.map((step) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;
                const isClickable = step.number <= currentStep;

                return (
                  <motion.button
                    key={step.number}
                    onClick={() => isClickable && handleStepClick(step.number)}
                    className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} group`}
                    whileHover={isClickable ? { scale: 1.05 } : {}}
                    whileTap={isClickable ? { scale: 0.95 } : {}}
                    disabled={!isClickable}
                  >
                    <div
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-2 ${
                        isCompleted
                          ? 'bg-primary text-white shadow-lg shadow-primary/50'
                          : isCurrent
                            ? 'bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/50 ring-4 ring-primary/20'
                            : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors hidden md:block ${
                        isCurrent ? 'text-white' : isCompleted ? 'text-primary' : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentStepComponent
              data={wizardData}
              updateData={updateWizardData}
              onNext={handleNext}
              onBack={handleBack}
              isFirstStep={currentStep === 1}
              isLastStep={currentStep === steps.length}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

