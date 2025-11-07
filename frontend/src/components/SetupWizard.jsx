import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  X,
  Building2,
  Settings,
  Upload,
  Palette,
  CheckSquare,
  Rocket
} from 'lucide-react';

// Import step components
import CompanyInfoStep from './wizard/CompanyInfoStep';
import ModuleSelectionStep from './wizard/ModuleSelectionStep';
import DataImportStep from './wizard/DataImportStep';
import BrandingStep from './wizard/BrandingStep';
import ConfirmationStep from './wizard/ConfirmationStep';
import LaunchStep from './wizard/LaunchStep';

const SetupWizard = ({ onComplete, onSkip, initialData = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    companyInfo: initialData?.companyInfo || {},
    modules: initialData?.modules || {},
    dataImport: initialData?.dataImport || {},
    branding: initialData?.branding || {}
  });

  const totalSteps = 6;
  const stepTitles = [
    'Company Info',
    'Modules',
    'Data Import',
    'Branding',
    'Confirmation',
    'Launch'
  ];

  const stepIcons = [
    Building2,
    Settings,
    Upload,
    Palette,
    CheckSquare,
    Rocket
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (stepNumber, data) => {
    const stepKey = getStepKey(stepNumber);
    setWizardData(prev => ({
      ...prev,
      [stepKey]: data
    }));
  };

  const getStepKey = (stepNumber) => {
    const keys = ['companyInfo', 'modules', 'dataImport', 'branding'];
    return keys[stepNumber - 1] || 'companyInfo';
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleFinish = () => {
    // Create complete wizard data object
    const completeWizardData = {
      companyInfo: wizardData.companyInfo,
      modules: wizardData.modules,
      dataImport: wizardData.dataImport,
      branding: wizardData.branding,
      completedAt: new Date().toISOString(),
      version: '1.0'
    };

    // Save wizard data to localStorage
    localStorage.setItem('alphaquote_wizard_data', JSON.stringify(completeWizardData));
    localStorage.setItem('alphaquote_wizard_completed', 'true');

    // Apply branding immediately
    applyBranding(wizardData.branding);

    // Apply module visibility settings
    applyModuleSettings(wizardData.modules);

    onComplete(completeWizardData);
  };

  const applyBranding = (branding) => {
    if (branding.primaryColor) {
      document.documentElement.style.setProperty('--primary', branding.primaryColor);
    }
    if (branding.secondaryColor) {
      document.documentElement.style.setProperty('--secondary', branding.secondaryColor);
    }
    if (branding.accentColor) {
      document.documentElement.style.setProperty('--accent', branding.accentColor);
    }
  };

  const applyModuleSettings = (modules) => {
    // Store module settings for use throughout the app
    localStorage.setItem('alphaquote_enabled_modules', JSON.stringify(modules.selectedModules || {}));
  };

  const renderStep = () => {
    const stepProps = {
      data: wizardData[getStepKey(currentStep)] || {},
      onDataChange: (data) => handleStepData(currentStep, data),
      onNext: handleNext,
      onBack: handleBack
    };

    switch (currentStep) {
      case 1:
        return <CompanyInfoStep {...stepProps} />;
      case 2:
        return <ModuleSelectionStep {...stepProps} />;
      case 3:
        return <DataImportStep {...stepProps} />;
      case 4:
        return <BrandingStep {...stepProps} />;
      case 5:
        return <ConfirmationStep {...stepProps} wizardData={wizardData} />;
      case 6:
        return <LaunchStep {...stepProps} wizardData={wizardData} onFinish={handleFinish} />;
      default:
        return <CompanyInfoStep {...stepProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-body overflow-hidden relative">
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-[0.02] animate-pulse"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      ></div>

      {/* Floating Particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <motion.div
          className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Building2 className="w-8 h-8 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-heading text-white">AlphaQuote Setup</h1>
                <p className="text-slate-300 font-body">Let's get your account configured</p>
              </div>
            </div>

            <motion.button
              onClick={handleSkip}
              className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center gap-2"
              whileHover={{ x: -4 }}
            >
              <X className="w-4 h-4" />
              Skip Setup
            </motion.button>
          </div>
        </motion.div>

        {/* Stepper */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              {stepTitles.map((title, index) => {
                const stepNumber = index + 1;
                const isActive = currentStep === stepNumber;
                const isCompleted = currentStep > stepNumber;
                const Icon = stepIcons[index];

                return (
                  <div key={stepNumber} className="flex items-center">
                    <motion.div
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : isCompleted
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                      }`}
                      animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-body text-sm font-medium">{title}</span>
                      {isCompleted && <CheckCircle className="w-4 h-4" />}
                    </motion.div>

                    {index < stepTitles.length - 1 && (
                      <div className={`w-8 h-px mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-700'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Step Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
