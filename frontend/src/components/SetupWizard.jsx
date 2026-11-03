/**
 * One-Time Company Setup (live fixes, 2026-11-02)
 *
 * This replaces the old six-step SetupWizard AND the separate
 * ProfileSetup form. New users used to be run through BOTH — the
 * wizard auto-showed on first load (tracked in localStorage) and
 * ProtectedRoute also bounced them to /profile-setup until a Clerk
 * metadata flag was set (tracked in Clerk). Two systems, two stores,
 * company info asked twice.
 *
 * Now there is exactly one setup: this page. It asks only for company
 * basics, posts them to POST /api/users/setup, and the server stamps
 * completion on the User row. ProtectedRoute reads that stamp via
 * /api/users/me, so setup runs exactly once per user — across
 * browsers, devices, and re-logins.
 *
 * Trimmed from the old wizard: Modules, Data Import, Branding, and
 * Confirmation steps. None of them were needed to start quoting —
 * module toggles and branding live on in the app's own settings, and
 * the company name/phone/address they duplicated are collected here.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle } from 'lucide-react';
import { completeSetup, getProvisioningState } from '../services/provisioning';
import { COMPANY_LEGAL_NAME } from '../config/site';

const SetupWizard = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const account = getProvisioningState()?.contractorAccount;
  const email = user?.emailAddresses?.[0]?.emailAddress || account?.email || '';

  const [formData, setFormData] = useState({
    // Provisioning auto-names the starter account "<First> <Last>
    // Company" — don't present that placeholder as the user's company.
    // Pass Five: default the company name to Iron Legion Contracting
    // LLC (this deployment is Iron Legion's own tool) whenever the
    // account still carries its auto-generated placeholder name.
    companyName: account?.name && !/ Company$/.test(account.name) ? account.name : COMPANY_LEGAL_NAME,
    phone: account?.phone || '',
    address: account?.address || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const finish = async (basics) => {
    setIsSaving(true);
    setError(null);
    try {
      await completeSetup(basics);

      // Compatibility for Profile.jsx, which still reads company info
      // from these localStorage keys.
      const companyInfo = {
        companyName: basics.companyName || '',
        phone: basics.phone || '',
        email,
        address: basics.address || ''
      };
      localStorage.setItem(
        'alphaquote_wizard_data',
        JSON.stringify({ companyInfo, completedAt: new Date().toISOString(), version: '2.0' })
      );
      localStorage.setItem('alphaquote_wizard_completed', 'true');
      localStorage.setItem(
        'alphaquote_profile',
        JSON.stringify({ ...companyInfo, profileCompleted: true, savedAt: new Date().toISOString() })
      );

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error completing setup:', err);
      setError('Something went wrong saving your setup. Your answers are still here — please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    finish(formData);
  };

  const handleSkip = () => {
    // Skipping still completes setup (with whatever is filled in, even
    // nothing) — the gate must never fire twice.
    finish(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Building2 className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Set up your company</h1>
            <p className="text-slate-400">
              One quick step — this is the only time we'll ask. It puts your company
              details on every quote you send.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 space-y-5"
          >
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-2">
                Company name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder={COMPANY_LEGAL_NAME}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-2">
                Business address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street, City, State ZIP"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            {email && (
              <p className="text-sm text-slate-500">
                Signed in as {email} — quotes and receipts are saved to this account.
              </p>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSaving}
                className="text-slate-400 hover:text-white font-medium px-4 py-3 transition-colors disabled:opacity-50"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Save & start quoting'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SetupWizard;
