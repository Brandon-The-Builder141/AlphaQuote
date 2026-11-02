/**
 * Pricing Page
 * Renders plans from src/config/pricing.js — the single source of truth.
 * No payment processor is wired yet: while a paid tier's `checkoutUrl` is
 * null, its button shows the "checkout coming online" notice and routes
 * to sign-up. Set `checkoutUrl` in the config when Whop checkout opens.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Hammer, Users, Clock } from 'lucide-react';
import { showInfo } from '../utils/toastService';
import { PRICING_TIERS, CHECKOUT_COMING_SOON_MESSAGE } from '../config/pricing';

const TIER_ICONS = {
  free: Zap,
  solo: Hammer,
  crew: Users
};

const Pricing = () => {
  const navigate = useNavigate();

  const handlePlanClick = (plan) => {
    if (plan.price === 0) {
      navigate('/sign-up');
      return;
    }
    if (plan.checkoutUrl) {
      window.location.href = plan.checkoutUrl;
      return;
    }
    // Checkout not wired yet — honest holding state, then sign-up.
    showInfo(CHECKOUT_COMING_SOON_MESSAGE);
    navigate('/sign-up');
  };

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
            Choose the plan that fits your business. Start free, upgrade when you're ready.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {PRICING_TIERS.map((plan) => {
            const Icon = TIER_ICONS[plan.id] || Zap;
            const checkoutPending = plan.price > 0 && !plan.checkoutUrl;
            return (
              <motion.div
                key={plan.id}
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
                    <Icon className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  </div>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.priceLabel}</span>
                    <span className="text-slate-400 ml-2">/{plan.period}</span>
                  </div>

                  <p className="text-slate-400">{plan.description}</p>

                  {checkoutPending && (
                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
                      <Clock className="w-4 h-4" /> Checkout coming online
                    </p>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={() => handlePlanClick(plan)}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            );
          })}
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
                Yes. Upgrade or downgrade whenever your workload changes — no penalties, no lock-in.
              </p>
            </div>

            <div className="bg-slate-900/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Is the Free plan really free?
              </h3>
              <p className="text-slate-400">
                Yes — free forever, no card required. It's enough to send your first professional quotes.
              </p>
            </div>

            <div className="bg-slate-900/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                When can I pay for Solo or Crew?
              </h3>
              <p className="text-slate-400">
                Paid checkout is coming online now. Create your free account today and we'll switch your
                plan on the moment checkout opens — major cards accepted at launch.
              </p>
            </div>

            <div className="bg-slate-900/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-400">
                Absolutely. Cancel anytime and your quotes and records stay available on the Free plan.
              </p>
            </div>
          </div>

          <p className="text-center text-slate-500 text-sm mt-12">
            By using AlphaQuote you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
