/**
 * Pricing Page
 * Displays AlphaQuote pricing plans and features
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { showInfo } from '../utils/toastService';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with basic estimation',
      features: [
        'Unlimited estimates',
        'Basic PDF export',
        'Vendor management',
        'Receipt scanning',
        'Mobile responsive',
        'Email support'
      ],
      buttonText: 'Get Started Free',
      buttonAction: () => navigate('/sign-up'),
      popular: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'Advanced features for professional contractors',
      features: [
        'Everything in Free',
        'AI-powered estimates',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'Team collaboration',
        'API access',
        'Advanced integrations'
      ],
      buttonText: 'Start Pro Trial',
      buttonAction: () => {
        // TODO: Integrate with Stripe
        showInfo('Stripe integration coming soon!');
      },
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'Tailored solutions for large construction companies',
      features: [
        'Everything in Pro',
        'Custom deployment',
        'Dedicated support',
        'Advanced security',
        'Custom integrations',
        'Training & onboarding',
        'SLA guarantees'
      ],
      buttonText: 'Contact Sales',
      buttonAction: () => {
        // TODO: Open contact form or email
        window.open('mailto:sales@alphaquote.com', '_blank');
      },
      popular: false
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your construction business. Start free, upgrade when you're ready.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className={`relative bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border shadow-lg ${
                plan.popular
                  ? 'border-primary/50 ring-2 ring-primary/20'
                  : 'border-slate-800/50'
              }`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  {plan.name === 'Free' && <Zap className="w-6 h-6 text-green-400" />}
                  {plan.name === 'Pro' && <Crown className="w-6 h-6 text-primary" />}
                  {plan.name === 'Enterprise' && <Star className="w-6 h-6 text-purple-400" />}
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 ml-2">/{plan.period}</span>
                </div>

                <p className="text-slate-400">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={plan.buttonAction}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {plan.buttonText}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-slate-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div className="bg-slate-900/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Is there a free trial?
              </h3>
              <p className="text-slate-400">
                The Free plan is available forever. Pro features include a 14-day free trial.
              </p>
            </div>

            <div className="bg-slate-900/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-400">
                We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
              </p>
            </div>

            <div className="bg-slate-900/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-400">
                Absolutely. Cancel anytime with no penalties. Your data remains accessible.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
