/**
 * Demo Mode Page
 * Allows users to try AlphaQuote without creating an account
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, BarChart3, Zap, Shield } from 'lucide-react';

const DemoMode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleTryDemo = async () => {
    setIsLoading(true);

    // Simulate loading demo data
    setTimeout(() => {
      // Set demo mode in localStorage
      localStorage.setItem('alphaquote_demo_mode', 'true');
      localStorage.setItem('alphaquote_demo_user', JSON.stringify({
        id: 'demo-user',
        email: 'demo@alphaquote.com',
        firstName: 'Demo',
        lastName: 'User',
        companyName: 'Demo Construction Co.',
        isDemo: true
      }));

      // Load demo data
      localStorage.setItem('alphaquote_profile', JSON.stringify({
        companyName: 'Demo Construction Co.',
        email: 'demo@alphaquote.com',
        phone: '(555) 123-4567',
        address: '123 Demo Street, Demo City, DC 12345',
        license: 'DEMO-12345',
        website: 'www.democontruction.com',
        logo: null,
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af'
      }));

      // Navigate to dashboard
      navigate('/dashboard');
      setIsLoading(false);
    }, 2000);
  };

  const demoFeatures = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'AI-Powered Estimates',
      description: 'Generate accurate estimates using advanced AI technology'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Smart Analytics',
      description: 'Track project profitability and vendor performance'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-primary" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Try AlphaQuote
            </h1>
          </div>

          <p className="text-2xl text-slate-400 max-w-3xl mx-auto mb-8">
            Experience the power of AI-driven construction estimation. No signup required.
          </p>

          <motion.button
            onClick={handleTryDemo}
            disabled={isLoading}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading Demo...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Demo
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {demoFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-lg text-center"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Demo Notice */}
        <motion.div
          className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-blue-300 mb-4">Demo Mode Features</h3>
          <p className="text-blue-200 mb-4">
            In demo mode, you can explore all AlphaQuote features with pre-loaded sample data.
            Some actions like saving new quotes or uploading receipts are restricted.
          </p>
          <p className="text-blue-300 text-sm">
            Ready to unlock the full experience? <a href="/sign-up" className="underline hover:text-blue-200">Create a free account</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoMode;
