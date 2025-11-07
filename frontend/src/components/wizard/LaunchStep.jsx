import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Settings,
  BarChart3,
  Store
} from 'lucide-react';

const LaunchStep = ({ wizardData, onFinish }) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);

  useEffect(() => {
    // Simulate launch process
    const launchSequence = async () => {
      setIsLaunching(true);

      const steps = [
        { text: 'Applying your branding...', duration: 1000 },
        { text: 'Configuring modules...', duration: 1500 },
        { text: 'Setting up data structure...', duration: 1000 },
        { text: 'Finalizing configuration...', duration: 1000 }
      ];

      for (let i = 0; i < steps.length; i++) {
        setLaunchProgress((i + 1) * 25);
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      }

      // Complete launch
      setTimeout(() => {
        setIsLaunching(false);
        setLaunchProgress(100);
      }, 500);
    };

    launchSequence();
  }, []);

  const getCompanyName = () => {
    return wizardData.companyInfo?.companyName || 'Your Company';
  };

  const getEnabledModules = () => {
    const modules = wizardData.modules?.selectedModules || {};
    return Object.entries(modules).filter(([_, enabled]) => enabled);
  };

  const getModuleIcon = (moduleId) => {
    const icons = {
      estimation: BarChart3,
      vendorManagement: Store,
      reporting: Settings
    };
    return icons[moduleId] || Settings;
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
          className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6"
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Rocket className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h2
          className="text-4xl font-heading text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to AlphaQuote!
        </motion.h2>

        <motion.p
          className="text-xl text-slate-300 font-body"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {getCompanyName()}
        </motion.p>
      </div>

      {/* Launch Progress */}
      {isLaunching && (
        <motion.div
          className="mb-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading text-white">Setting up your account...</h3>
            <span className="text-primary font-body">{launchProgress}%</span>
          </div>

          <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4">
            <motion.div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${launchProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex items-center gap-2 text-slate-300 font-body">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <span>Please wait while we configure everything for you...</span>
          </div>
        </motion.div>
      )}

      {/* Success State */}
      {!isLaunching && launchProgress === 100 && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Success Message */}
          <div className="text-center p-6 bg-green-500/20 border border-green-500/30 rounded-xl">
            <motion.div
              className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className="w-8 h-8 text-green-400" />
            </motion.div>
            <h3 className="text-2xl font-heading text-white mb-2">Setup Complete!</h3>
            <p className="text-slate-300 font-body">
              Your AlphaQuote account is ready to use. All your preferences have been applied.
            </p>
          </div>

          {/* Enabled Features */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h4 className="text-lg font-heading text-white mb-4">Your Active Features</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {getEnabledModules().map(([moduleId, _]) => {
                const Icon = getModuleIcon(moduleId);
                return (
                  <motion.div
                    key={moduleId}
                    className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * getEnabledModules().indexOf([moduleId, _]) }}
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-white font-body">{getModuleName(moduleId)}</span>
                    <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h4 className="text-lg font-heading text-white mb-4">What's Next?</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-primary text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-body">Start creating your first project estimate</p>
                  <p className="text-slate-400 text-sm font-body">Use our intelligent estimation tools to get accurate project costs</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-primary text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-body">Add your vendor contacts</p>
                  <p className="text-slate-400 text-sm font-body">Build your network of suppliers and track pricing data</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-primary text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-body">Explore AI-powered insights</p>
                  <p className="text-slate-400 text-sm font-body">Get intelligent recommendations and automated analysis</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      {!isLaunching && launchProgress === 100 && (
        <div className="flex justify-center mt-8 pt-6 border-t border-slate-700/50">
          <motion.button
            onClick={onFinish}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/80 text-white rounded-xl font-body transition-all duration-200 text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Rocket className="w-5 h-5" />
            Launch AlphaQuote
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default LaunchStep;
