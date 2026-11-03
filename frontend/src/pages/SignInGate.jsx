/**
 * Sign-in Gate — Pass Nine (Command Center).
 *
 * The signed-out root is no longer a marketing landing page. This app
 * has exactly one operator, so the front door is just a door: the IL
 * monogram, the company name, the line, and the Clerk sign-in control.
 * No tiers, no demo, no sign-up pitch.
 */

import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { COMPANY_NAME } from '../config/site';

const SignInGate = () => {
  return (
    <div className="min-h-screen iron-bg text-slate-100 font-body flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="il-monogram mx-auto mb-5">IL</span>
          <h1 className="font-display text-4xl leading-none mb-3">{COMPANY_NAME}</h1>
          <p className="eyebrow">Built Right. Quoted Straight.</p>
        </div>

        <div className="card p-6 sm:p-8">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-white',
                card: 'bg-transparent shadow-none',
                headerTitle: 'text-white',
                headerSubtitle: 'text-slate-400',
                socialButtonsBlockButton: 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700',
                formFieldInput: 'bg-slate-800 border-slate-700 text-white',
                footerActionLink: 'text-primary hover:text-primary/80',
                identityPreviewText: 'text-slate-400',
                identityPreviewEditButton: 'text-primary hover:text-primary/80'
              }
            }}
            redirectUrl="/dashboard"
          />
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Iron Legion's command center. Authorized operator only.
        </p>
      </div>
    </div>
  );
};

export default SignInGate;
