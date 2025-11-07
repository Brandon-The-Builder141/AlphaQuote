import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Building2,
  Settings,
  Upload,
  Palette,
  ArrowRight,
  ArrowLeft,
  Edit
} from 'lucide-react';

const ConfirmationStep = ({ onNext, onBack, wizardData }) => {
  const handleNext = () => {
    onNext();
  };

  const handleEdit = (step) => {
    // This would navigate back to the specific step
    // For now, we'll just show a message
    // alert(`You can edit ${step} settings later from the main application.`); // TODO: Replace with proper error handling
  };

  const getModuleIcon = (moduleId) => {
    const icons = {
      estimation: '📊',
      vendorManagement: '🏪',
      reporting: '📈'
    };
    return icons[moduleId] || '⚙️';
  };

  const getModuleName = (moduleId) => {
    const names = {
      estimation: 'Estimation',
      vendorManagement: 'Vendor Management',
      reporting: 'Reporting & Analytics'
    };
    return names[moduleId] || moduleId;
  };

  return (
    <motion.div
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <CheckCircle className="w-8 h-8 text-green-400" />
        </motion.div>
        <h2 className="text-3xl font-heading text-white mb-2">Review Your Setup</h2>
        <p className="text-slate-300 font-body">Please review your configuration before finishing</p>
      </div>

      <div className="space-y-6">
        {/* Company Information */}
        <motion.div
          className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Company Information
            </h3>
            <button
              onClick={() => handleEdit('Company Information')}
              className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 font-body text-sm">Company Name</span>
              <p className="text-white font-body">{wizardData.companyInfo?.companyName || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-slate-400 font-body text-sm">Industry</span>
              <p className="text-white font-body">{wizardData.companyInfo?.industry || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-slate-400 font-body text-sm">Location</span>
              <p className="text-white font-body">{wizardData.companyInfo?.location || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-slate-400 font-body text-sm">Website</span>
              <p className="text-white font-body">{wizardData.companyInfo?.website || 'Not specified'}</p>
            </div>
          </div>
        </motion.div>

        {/* Selected Modules */}
        <motion.div
          className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Selected Modules
            </h3>
            <button
              onClick={() => handleEdit('Module Selection')}
              className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(wizardData.modules?.selectedModules || {}).map(([moduleId, isSelected]) => (
              <div key={moduleId} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <span className="text-2xl">{getModuleIcon(moduleId)}</span>
                <div className="flex-1">
                  <p className="text-white font-body">{getModuleName(moduleId)}</p>
                  <p className="text-slate-400 text-sm font-body">
                    {isSelected ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-green-400' : 'bg-slate-600'}`} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Data Import */}
        <motion.div
          className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Data Import
            </h3>
            <button
              onClick={() => handleEdit('Data Import')}
              className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                wizardData.dataImport?.importData?.hasData ? 'bg-green-400' : 'bg-slate-600'
              }`} />
              <span className="text-white font-body">
                {wizardData.dataImport?.importData?.hasData
                  ? `File ready: ${wizardData.dataImport.importData.file?.name || 'Unknown file'}`
                  : 'No data imported - will start fresh'
                }
              </span>
            </div>
            {wizardData.dataImport?.importData?.importType && (
              <p className="text-slate-400 text-sm font-body ml-6">
                Format: {wizardData.dataImport.importData.importType.toUpperCase()}
              </p>
            )}
          </div>
        </motion.div>

        {/* Branding */}
        <motion.div
          className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Branding & Style
            </h3>
            <button
              onClick={() => handleEdit('Branding')}
              className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-slate-400 font-body text-sm">Color Scheme</span>
              <div className="flex items-center gap-3 mt-2">
                <div
                  className="w-6 h-6 rounded-lg border border-slate-600"
                  style={{ backgroundColor: wizardData.branding?.brandingData?.primaryColor || '#14B8A6' }}
                />
                <div
                  className="w-6 h-6 rounded-lg border border-slate-600"
                  style={{ backgroundColor: wizardData.branding?.brandingData?.secondaryColor || '#0F172A' }}
                />
                <div
                  className="w-6 h-6 rounded-lg border border-slate-600"
                  style={{ backgroundColor: wizardData.branding?.brandingData?.accentColor || '#F97316' }}
                />
                <span className="text-white font-body text-sm">
                  {wizardData.branding?.brandingData?.customColors ? 'Custom' : 'Default'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-body text-sm">Report Style</span>
              <p className="text-white font-body capitalize">
                {wizardData.branding?.brandingData?.reportStyle || 'Modern'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Summary */}
      <motion.div
        className="mt-8 p-6 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl border border-primary/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="text-lg font-heading text-white mb-2">Ready to Launch!</h4>
        <p className="text-slate-300 font-body">
          Your AlphaQuote account is configured and ready to use. You can always modify these settings later from the application settings.
        </p>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-body transition-all duration-200 border border-slate-600/50 hover:border-slate-500"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.button
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-xl font-body transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Finish Setup
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ConfirmationStep;
