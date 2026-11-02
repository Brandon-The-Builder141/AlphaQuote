/**
 * Public Landing Page — shown at `/` to logged-out visitors.
 * Signed-in users never see this; the root route renders the app for them.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calculator,
  ClipboardList,
  Send,
  Check,
  ArrowRight,
  Hammer,
  ShieldCheck,
  Receipt,
  BellRing
} from 'lucide-react';
import { PRICING_TIERS } from '../config/pricing';
import { PRODUCT_NAME } from '../config/site';

const TRADES = ['Siding', 'Fencing', 'Decking', 'Framing', 'Flooring', 'General remodeling'];

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Build the quote',
    text: 'Pick the job, drop in your line items and measurements. Templates for common work keep it fast.'
  },
  {
    icon: Calculator,
    title: 'Price it right',
    text: 'Materials, labor, and markup calculated the same way every time — no more guessing or leaving money on the table.'
  },
  {
    icon: Send,
    title: 'Send it like a pro',
    text: 'Your customer gets a clean, professional PDF quote. AlphaQuote reminds you to follow up until you hear back.'
  }
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2">
          <Hammer className="w-7 h-7 text-primary" />
          <span className="text-2xl font-bold">{PRODUCT_NAME}</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/pricing" className="hidden sm:inline text-slate-300 hover:text-white px-3 py-2">
            Pricing
          </Link>
          <Link to="/sign-in" className="text-slate-300 hover:text-white px-3 py-2">
            Sign in
          </Link>
          <button
            onClick={() => navigate('/sign-up')}
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            Get started free
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-20 text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-bold leading-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Fast, professional quotes
          <span className="block bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            for contractors
          </span>
        </motion.h1>
        <motion.p
          className="text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Build a quote on the job site, price it with real material costs, and send a
          clean PDF before you leave the driveway. No spreadsheets, no guesswork.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            onClick={() => navigate('/sign-up')}
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold px-8 py-4 rounded-xl text-lg flex items-center gap-2 transition-all"
          >
            Start quoting free <ArrowRight className="w-5 h-5" />
          </button>
          <Link to="/pricing" className="text-slate-300 hover:text-white px-6 py-4 text-lg">
            See pricing
          </Link>
        </motion.div>
      </section>

      {/* Who it's for */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center mb-4">Built for the trades</h2>
        <p className="text-slate-400 text-center max-w-2xl mx-auto mb-8">
          If you run a truck, a crew, or both — and quoting eats your evenings —
          AlphaQuote was made for you.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {TRADES.map((trade) => (
            <span
              key={trade}
              className="bg-slate-900/60 border border-slate-800 rounded-full px-5 py-2 text-slate-200"
            >
              {trade}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
            <Receipt className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-2">Receipts, handled</h3>
            <p className="text-slate-400">Snap a photo of a material receipt and keep it tied to the job — your records, organized.</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
            <BellRing className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-2">Follow-ups that happen</h3>
            <p className="text-slate-400">Quotes die in silence. Gentle reminders keep your bids alive until the customer answers.</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
            <ShieldCheck className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-2">Your data stays yours</h3>
            <p className="text-slate-400">Every account is private and separate. We never sell your data. Ever.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary/20 text-primary font-bold rounded-full w-9 h-9 flex items-center justify-center">
                  {i + 1}
                </span>
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
              <p className="text-slate-400">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing summary */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-slate-400 text-center mb-12">Start free. Upgrade when the work picks up.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border ${
                tier.popular ? 'border-primary/50 ring-2 ring-primary/20' : 'border-slate-800/50'
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{tier.priceLabel}</span>
                <span className="text-slate-400 ml-2">/{tier.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/pricing')}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                  tier.popular
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                See {tier.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Your next quote could take five minutes.</h2>
        <p className="text-slate-400 mb-8">Create a free account and send your first professional quote today.</p>
        <button
          onClick={() => navigate('/sign-up')}
          className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold px-8 py-4 rounded-xl text-lg inline-flex items-center gap-2 transition-all"
        >
          Get started free <ArrowRight className="w-5 h-5" />
        </button>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span>© {new Date().getFullYear()} {PRODUCT_NAME}. Quotes are estimates — always confirm final pricing with your customer.</span>
          <nav className="flex gap-6">
            <Link to="/pricing" className="hover:text-white">Pricing</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
