import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ServiceStatus from './components/ServiceStatus';
import { getEnabledModules } from './utils/moduleVisibility';
import {
  Calculator,
  FileText,
  BarChart3,
  Receipt,
  TrendingUp,
  Cog,
  UserPlus,
  Play,
  Crown
} from 'lucide-react';

export default function StartEstimate() {
  const navigate = useNavigate();
  const [enabledModules, setEnabledModules] = useState(getEnabledModules());

  // Check if Clerk is available
  const hasClerkKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY &&
                     process.env.REACT_APP_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder_key_for_development';
  const isSignedIn = hasClerkKey; // In development without Clerk, assume signed in for demo

  useEffect(() => {
    // Update enabled modules when localStorage changes
    const handleStorageChange = () => {
      setEnabledModules(getEnabledModules());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-body overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blueprint Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] animate-pulse"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'10\' height=\'10\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 10 0 L 0 0 0 10\' fill=\'none\' stroke=\'%2314B8A6\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")'
          }}
        ></div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Abstract Construction Lines */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 opacity-[0.03]"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <path
              d="M50,50 Q200,100 350,50 L350,150 Q200,200 50,150 Z"
              fill="none"
              stroke="#14B8A6"
              strokeWidth="2"
            />
            <path
              d="M50,250 Q200,300 350,250 L350,350 Q200,400 50,350 Z"
              fill="none"
              stroke="#F97316"
              strokeWidth="2"
            />
          </svg>
        </motion.div>
      </div>

      {/* Premium Header */}
      <div className="relative bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Calculator className="w-8 h-8 text-primary" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <h2
                onClick={() => navigate('/')}
                className="text-2xl font-heading text-white cursor-pointer hover:text-primary transition-colors duration-300"
              >
                AlphaQuote
              </h2>
            </div>
            <div className="hidden md:block w-px h-6 bg-slate-700"></div>
            <span className="text-slate-400 font-body text-sm">Professional Estimation Software</span>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => window.location.href = 'https://buy.stripe.com/bJe28r4AM09beeq7TI1kA00'}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Crown className="w-4 h-4" />
              Buy Now
            </motion.button>
            <motion.button
              onClick={() => navigate('/setup')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 font-body"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Cog className="w-4 h-4" />
              Setup
            </motion.button>
            <ServiceStatus compact={true} />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center py-20">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Content - Offset Layout */}
            <div className="lg:col-start-2 lg:col-span-6 space-y-8">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                {/* Status Badge */}
                <motion.div
                  className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-primary font-medium">All services online</span>
                </motion.div>

                {/* Main Title - Offset */}
                <motion.h1
                  className="text-5xl lg:text-7xl font-heading text-white leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                >
                  <span className="block">Estimate</span>
                  <motion.span
                    className="block text-accent"
                    animate={{
                      opacity: [1, 0.7, 1],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    Smarter
                  </motion.span>
                  <span className="block text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500 mt-2">
                    Lead the pack
                  </span>
                </motion.h1>

                {/* Subheader */}
                <motion.p
                  className="text-xl text-slate-300 font-body leading-relaxed max-w-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                >
                  Professional construction estimation software with AI assistance,  real-time pricing,
  and beautiful PDF reports that win more projects.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
                >
                  {isSignedIn ? (
                    <>
                      <motion.button
                        onClick={() => navigate('/estimate')}
                        className="group relative bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <BarChart3 className="w-6 h-6 relative z-10" />
                        <span className="relative z-10">Start New Estimate</span>
                      </motion.button>

                    </>
                  ) : (
                    <>
                      <motion.button
                        onClick={() => navigate('/sign-up')}
                        className="group relative bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <UserPlus className="w-6 h-6 relative z-10" />
                        <span className="relative z-10">Get Started Free</span>
                      </motion.button>

                      <motion.button
                        onClick={() => navigate('/demo')}
                        className="group relative bg-gradient-to-r from-accent to-accent/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <Play className="w-6 h-6 relative z-10" />
                        <span className="relative z-10">Try Demo</span>
                      </motion.button>
                    </>
                  )}
                </motion.div>
              </motion.div>
            </div>

            {/* Hero Visual - Right Side */}
            <div className="lg:col-span-5 lg:col-start-8">
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              >
                {/* Floating Cards Preview */}
                <div className="relative">
                  <motion.div
                    className="absolute top-0 right-0 w-64 h-40 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-white font-medium text-sm">Receipt Intelligence</span>
                    </div>
                    <p className="text-slate-400 text-xs">Upload receipts to build your local pricing database</p>
                  </motion.div>

                  <motion.div
                    className="absolute top-20 left-0 w-56 h-36 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-white font-medium text-sm">Professional PDFs</span>
                    </div>
                    <p className="text-slate-400 text-xs">Beautiful, branded estimates ready to send</p>
                  </motion.div>

                  <motion.div
                    className="relative top-40 left-16 w-60 h-32 bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm rounded-xl border border-primary/30 p-4"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white font-medium text-sm">Smart Estimates</span>
                    </div>
                    <p className="text-slate-300 text-xs">Real-time pricing from major retailers</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>


      {/* Premium Features Section */}
      <div className="relative py-24">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
          >
            <h2 className="text-4xl lg:text-5xl font-heading text-white mb-6">
              Everything you need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                win more projects
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Powerful tools designed for construction professionals who demand precision, speed, and results.
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'Smart Estimates',
                description: 'Create detailed estimates with real-time pricing from major retailers',
                color: 'primary',
                delay: 0.1,
                module: 'estimation'
              },
              {
                icon: FileText,
                title: 'Professional PDFs',
                description: 'Beautiful, branded PDF estimates ready to send to clients immediately',
                color: 'primary',
                delay: 0.3,
                module: 'estimation'
              },
              {
                icon: Receipt,
                title: 'Receipt Intelligence',
                description: 'Upload receipts to build your local pricing database with real supplier costs',
                color: 'accent',
                delay: 0.4,
                module: null // Always show
              }
            ].filter(feature => !feature.module || enabledModules[feature.module]).map((feature, index) => (
              <motion.div
                key={index}
                className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-500"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 + feature.delay, ease: 'easeOut' }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-${feature.color}/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-${feature.color}/20 transition-colors duration-300`}>
                    <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                  </div>

                  <h3 className="text-xl font-heading text-white mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-${feature.color}/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative py-12 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-between gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <div className="text-center md:text-left">
              <p className="text-slate-400">
                Ready to transform your estimation process?
              </p>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => window.location.href = 'https://buy.stripe.com/bJe28r4AM09beeq7TI1kA00'}
                className="text-slate-400 hover:text-primary transition-colors text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                View Pricing
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
