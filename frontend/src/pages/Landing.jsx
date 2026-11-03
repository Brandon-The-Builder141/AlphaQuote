/**
 * Public Landing Page — shown at `/` to logged-out visitors.
 * Signed-in users never see this; the root route renders the app for them.
 *
 * Pass Eight (IRON showpiece): full-bleed blackened-steel hero over a
 * blueprint grid with an ember glow, giant Barlow Condensed headline,
 * the six Iron Legion trades, starter-template cards at the real
 * pricing-sheet totals, and the Pass Five quote-terms strip. Copy and
 * pricing config are unchanged from Pass Five.
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
  ShieldCheck,
  Receipt,
  BellRing,
  Clock3,
  HandCoins,
  Eye,
  Ban
} from 'lucide-react';
import { PRICING_TIERS } from '../config/pricing';
import { COMPANY_NAME } from '../config/site';

// Pass Five (Iron Legion tailoring): this is Iron Legion Contracting's
// own site and quoting tool. The trades listed are the six Iron Legion
// actually does — no plumbing, no electrical.
const TRADES = ['Siding', 'Fencing', 'Decking', 'Framing', 'Landscaping', 'Flooring'];

// Starter templates at the real totals from the Iron Legion pricing sheet.
const TEMPLATES = [
  { name: 'Siding — Vinyl, Typical Ranch', detail: '1,200 sq ft, demo + house wrap', price: '$11,300' },
  { name: 'Decking — PT Wood Deck', detail: '300 sq ft, stairs + permit', price: '$10,100' },
  { name: 'Framing — Package', detail: 'Labor + materials, per sq ft of floor', price: '$8,000' },
  { name: 'Fencing — PT Wood Privacy', detail: '150 LF, walk gate + old fence removal', price: '$5,125' },
  { name: 'Flooring — LVP', detail: '500 sq ft, removal + trim included', price: '$4,300' },
  { name: 'Landscaping — Mulch & Bed Cleanup', detail: 'Mulch installed + bed cleanup & edge', price: '$825' }
];

// The four quote terms that print on every Iron Legion quote (Pass Five).
const TERMS = [
  { icon: Clock3, text: 'Every quote is good for 14 days — material prices move' },
  { icon: HandCoins, text: '30–50% of materials up front, balance when the job is done' },
  { icon: Eye, text: 'Rot found during demo? We show you before we fix it — agreed first, billed as time & materials' },
  { icon: Ban, text: 'No plumbing or electrical. That is not work we do, and we will tell you straight' }
];

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
    text: 'The customer gets a clean, professional PDF quote, good for 14 days. Follow-up reminders keep the bid alive until we hear back.'
  }
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="iron-bg min-h-screen text-slate-100 font-body">
      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <span className="il-monogram il-monogram-sm">IL</span>
          <span className="font-display text-[1.55rem] leading-none">{COMPANY_NAME}</span>
        </div>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link to="/pricing" className="hidden sm:inline text-slate-300 hover:text-white px-3 py-2">
            Pricing
          </Link>
          <Link to="/sign-in" className="text-slate-300 hover:text-white px-3 py-2">
            Sign in
          </Link>
          <button onClick={() => navigate('/sign-up')} className="btn-ember !min-h-[44px]">
            Get started free
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="blueprint-grid absolute inset-0" aria-hidden="true"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-14 pb-20 text-center">
          <motion.p
            className="eyebrow mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Northwest Ohio · Builder &amp; Quoting Tool
          </motion.p>
          <motion.h1
            className="hero-title mb-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="block text-slate-100">Built Right.</span>
            <span className="block ember-text">Quoted Straight.</span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Iron Legion Contracting is a builder in Northwest Ohio — siding, fencing,
            decking, framing, landscaping, and flooring. Every job is quoted line by
            line from real material costs, and the customer gets a clean PDF before
            we leave the driveway. No spreadsheets, no guesswork.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button onClick={() => navigate('/sign-up')} className="btn-ember btn-lg">
              Start quoting free <ArrowRight className="w-5 h-5" />
            </button>
            <Link to="/pricing" className="btn-ghost text-base">
              See pricing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What we build */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <h2 className="font-display text-4xl text-center mb-4">What we build</h2>
        <p className="text-slate-400 text-center max-w-2xl mx-auto mb-8">
          Six trades, done by our own crew. If a job needs plumbing or electrical,
          we will tell you straight — that is not work we do.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {TRADES.map((trade) => (
            <span key={trade} className="trade-chip">{trade}</span>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="card p-6">
            <Receipt className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display text-[1.3rem] mb-2">Receipts, handled</h3>
            <p className="text-slate-400">Snap a photo of a material receipt and keep it tied to the job — your records, organized.</p>
          </div>
          <div className="card p-6">
            <BellRing className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display text-[1.3rem] mb-2">Follow-ups that happen</h3>
            <p className="text-slate-400">Quotes die in silence. Gentle reminders keep your bids alive until the customer answers.</p>
          </div>
          <div className="card p-6">
            <ShieldCheck className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display text-[1.3rem] mb-2">Your data stays yours</h3>
            <p className="text-slate-400">Every account is private and separate. We never sell your data. Ever.</p>
          </div>
        </div>
      </section>

      {/* Starter templates — real totals */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <h2 className="font-display text-4xl text-center mb-4">Quotes start from real jobs</h2>
        <p className="text-slate-400 text-center max-w-2xl mx-auto mb-10">
          No blank page. The common jobs are already built as templates, priced
          from the Iron Legion sheet — adjust the measurements and send.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template, i) => (
            <motion.div
              key={template.name}
              className="template-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <p className="template-price mb-2">{template.price}</p>
              <h3 className="font-display text-[1.25rem] leading-tight mb-1.5">{template.name}</h3>
              <p className="text-sm text-slate-400">{template.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <h2 className="font-display text-4xl text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              className="card p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary/15 text-primary font-display font-bold rounded-full w-10 h-10 flex items-center justify-center text-lg border border-primary/40">
                  {i + 1}
                </span>
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-[1.45rem] mb-2">{step.title}</h3>
              <p className="text-slate-400">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote terms strip */}
      <section className="relative z-10 border-y border-slate-700 bg-slate-900/60">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="font-display text-3xl text-center mb-8">The terms on every quote</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TERMS.map((term) => (
              <div key={term.text} className="flex gap-3">
                <term.icon className="w-6 h-6 text-accent flex-none mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">{term.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing summary */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <h2 className="font-display text-4xl text-center mb-4">Simple pricing</h2>
        <p className="text-slate-400 text-center mb-12">Start free. Upgrade when the work picks up.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`card p-8 ${tier.popular ? '!border-primary/60 shadow-ember-glow-sm' : ''}`}
            >
              <h3 className="font-display text-[1.5rem] mb-2">{tier.name}</h3>
              <div className="mb-4">
                <span className="font-display font-bold text-5xl">{tier.priceLabel}</span>
                <span className="text-slate-400 ml-2">/{tier.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/pricing')}
                className={tier.popular ? 'btn-ember w-full' : 'btn-steel w-full'}
              >
                See {tier.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-20 text-center">
        <h2 className="font-display text-4xl mb-4">Your next quote could take five minutes.</h2>
        <p className="text-slate-400 mb-8">Sign in and build the quote on the spot — priced right, written down, and sent before the truck door closes.</p>
        <button onClick={() => navigate('/sign-up')} className="btn-ember btn-lg">
          Get started free <ArrowRight className="w-5 h-5" />
        </button>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span>© {new Date().getFullYear()} {COMPANY_NAME}. Quotes are estimates — always confirm final pricing with your customer.</span>
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
