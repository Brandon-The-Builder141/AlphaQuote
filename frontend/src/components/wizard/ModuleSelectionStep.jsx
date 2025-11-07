import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  Store,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

const ModuleSelectionStep = ({ data, onDataChange, onNext, onBack }) => {
  const [selectedModules, setSelectedModules] = useState(data.selectedModules || {
    estimation: true,
    vendorManagement: true,
    reporting: false
  });

  const modules = [
    {
      id: 'estimation',
      name: 'Estimation',
      description: 'Create detailed project estimates with material costs and labor calculations',
      icon: Calculator,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      required: true
    },
    {
      id: 'vendorManagement',
      name: 'Vendor Management',
      description: 'Track suppliers, manage pricing data, and maintain vendor relationships',
      icon: Store,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      required: true
    },
    {
      id: 'reporting',
      name: 'Reporting & Analytics',
      description: 'Generate reports, track performance metrics, and analyze business data',
      icon: BarChart3,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
      required: false
    }
  ];

  useEffect(() => {
    onDataChange({ selectedModules });
  }, [selectedModules, onDataChange]);

  const toggleModule = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    if (module && module.required) return; // Don't allow disabling required modules

    setSelectedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleNext = () => {
    onNext();
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
          className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Calculator className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-heading text-white mb-2">Select Modules</h2>
        <p className="text-slate-300 font-body">Choose which features you'd like to activate</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {modules.map((module, index) => {
          const isSelected = selectedModules[module.id];
          const Icon = module.icon;

          return (
            <motion.div
              key={module.id}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? `${module.bgColor} ${module.borderColor} border-opacity-50`
                  : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
              } ${module.required ? 'opacity-75' : ''}`}
              onClick={() => toggleModule(module.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: module.required ? 1 : 1.02 }}
              whileTap={{ scale: module.required ? 1 : 0.98 }}
            >
              {module.required && (
                <div className="absolute top-3 right-3">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-body">
                    Required
                  </span>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected ? module.bgColor : 'bg-slate-700/50'
                }`}>
                  <Icon className={`w-6 h-6 ${isSelected ? module.color : 'text-slate-400'}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-heading text-white">{module.name}</h3>
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                      )}
                    </div>
                  </div>
                  <p className="text-slate-300 font-body text-sm">{module.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Module Summary */}
      <motion.div
        className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h4 className="text-lg font-heading text-white mb-4">Selected Modules</h4>
        <div className="flex flex-wrap gap-2">
          {modules
            .filter(module => selectedModules[module.id])
            .map((module) => {
              const Icon = module.icon;
              return (
                <span
                  key={module.id}
                  className="flex items-center gap-2 px-3 py-2 bg-primary/20 text-primary rounded-lg text-sm font-body"
                >
                  <Icon className="w-4 h-4" />
                  {module.name}
                </span>
              );
            })}
        </div>
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
          Next
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ModuleSelectionStep;
