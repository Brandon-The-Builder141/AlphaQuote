import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ServiceStatus from './components/ServiceStatus';
import { getEnabledModules } from './utils/moduleVisibility';
import { MINIMUM_JOB_AMOUNT, QUOTE_VALIDITY_DAYS, SERVICE_CATEGORIES, LABOR_RATES } from './utils/pricingConstants';
import {
  Calculator,
  FileText,
  BarChart3,
  Receipt,
  Store,
  LayoutTemplate,
  Mail,
  Calendar,
  ArrowRight,
  UserPlus,
  Play
} from 'lucide-react';

// Pass Eight (IRON): the dashboard is a command center now, not a
// marketing hero. Same state, handlers and module gating as before —
// quick actions to the working surfaces, the Iron Legion numbers up
// front, and the service status chip kept.
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

  const actions = [
    {
      icon: Calculator,
      title: 'New Estimate',
      description: 'Guided wizard — client, work items, review, send.',
      path: '/estimate'
    },
    {
      icon: LayoutTemplate,
      title: 'Templates',
      description: 'Start from a real job: fence, deck, siding, LVP and more.',
      path: '/estimate/advanced'
    },
    {
      icon: Receipt,
      title: 'Receipts',
      description: 'Material receipts tied to jobs — your pricing memory.',
      path: '/receipts'
    },
    {
      icon: Store,
      title: 'Vendors',
      description: 'Local suppliers and the prices they actually charge.',
      path: '/vendors',
      module: 'vendorManagement'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'What the work is doing, in numbers.',
      path: '/analytics'
    },
    {
      icon: Mail,
      title: 'Follow-Ups',
      description: 'Keep bids alive until the customer answers.',
      path: '/followups'
    },
    {
      icon: Calendar,
      title: 'Scheduling',
      description: 'Jobs on the calendar, synced and visible.',
      path: '/scheduling'
    },
    {
      icon: FileText,
      title: 'Advanced Estimator',
      description: 'Room-by-room detail with change orders and regional pricing.',
      path: '/estimate/advanced'
    }
  ].filter(action => !action.module || enabledModules[action.module]);

  return (
    <div className="text-slate-100 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Command band */}
        <motion.div
          className="relative overflow-hidden card !rounded-2xl px-6 py-8 sm:px-10 sm:py-10 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="blueprint-grid absolute inset-0" aria-hidden="true"></div>
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <p className="eyebrow">Iron Legion Contracting — Command Center</p>
              <ServiceStatus compact={true} />
            </div>
            <h2 className="font-display font-bold uppercase leading-[0.95] text-[2.6rem] sm:text-6xl mb-4">
              Build the quote.<br />
              <span className="ember-text">Send it straight.</span>
            </h2>
            <p className="text-slate-400 max-w-xl leading-relaxed mb-8">
              Line-by-line pricing from real material costs, your rates, your terms —
              a clean PDF before you leave the driveway.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {isSignedIn ? (
                <>
                  <button onClick={() => navigate('/estimate')} className="btn-ember btn-lg">
                    <Calculator className="w-5 h-5" /> Start New Estimate
                  </button>
                  <button onClick={() => navigate('/estimate/advanced')} className="btn-steel btn-lg">
                    Advanced Estimator
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/sign-up')} className="btn-ember btn-lg">
                    <UserPlus className="w-5 h-5" /> Get Started Free
                  </button>
                  <button onClick={() => navigate('/demo')} className="btn-steel btn-lg">
                    <Play className="w-5 h-5" /> Try Demo
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Iron Legion numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="stat-card">
            <p className="stat-num">${LABOR_RATES.SOLO}<span className="text-2xl text-slate-400">/hr</span></p>
            <p className="stat-label">Solo labor rate</p>
          </div>
          <div className="stat-card">
            <p className="stat-num">${LABOR_RATES.CREW}<span className="text-2xl text-slate-400">/hr</span></p>
            <p className="stat-label">Crew labor rate</p>
          </div>
          <div className="stat-card">
            <p className="stat-num">${MINIMUM_JOB_AMOUNT}</p>
            <p className="stat-label">Minimum job</p>
          </div>
          <div className="stat-card">
            <p className="stat-num">{QUOTE_VALIDITY_DAYS}<span className="text-2xl text-slate-400"> days</span></p>
            <p className="stat-label">Quote validity · {SERVICE_CATEGORIES.length} trades</p>
          </div>
        </div>

        {/* Quick actions */}
        <h3 className="font-display text-[1.6rem] mb-4">Work surfaces</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {actions.map((action, index) => (
            <motion.button
              key={action.title}
              onClick={() => navigate(action.path)}
              className="card p-6 text-left group hover:!border-primary/50 transition-colors"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-4">
                <action.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-display text-[1.3rem] leading-tight mb-1.5 flex items-center gap-2">
                {action.title}
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">{action.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Footer strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-slate-700">
          <p className="text-slate-400 text-sm">Ready to transform your estimation process?</p>
          <button
            onClick={() => navigate('/pricing')}
            className="btn-ghost !min-h-[40px] text-sm"
          >
            {isSignedIn ? 'Upgrade to Pro' : 'View Pricing'}
          </button>
        </div>
      </div>
    </div>
  );
}
