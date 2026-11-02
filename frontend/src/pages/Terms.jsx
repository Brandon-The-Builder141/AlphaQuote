/**
 * Terms of Service — public page at /terms.
 * Plain-language terms for a contractor SaaS. Contact email comes from
 * src/config/site.js (single source; currently a marked placeholder).
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import { SUPPORT_EMAIL, PRODUCT_NAME } from '../config/site';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
    <div className="text-slate-300 space-y-3 leading-relaxed">{children}</div>
  </section>
);

const Terms = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-10">
        <Hammer className="w-5 h-5 text-primary" />
        <span className="font-bold text-white">{PRODUCT_NAME}</span>
        <span className="text-slate-500">/ Terms of Service</span>
      </Link>

      <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
      <p className="text-slate-400 mb-10">Last updated: November 2, 2026</p>

      <Section title="1. What AlphaQuote is">
        <p>
          {PRODUCT_NAME} is a quoting and job-management tool for contractors. It helps you build
          estimates, track materials and receipts, schedule work, and follow up with your customers.
          By creating an account or using the service, you agree to these terms.
        </p>
      </Section>

      <Section title="2. Your account">
        <p>
          Accounts and sign-in are handled by our authentication provider, Clerk. You are responsible
          for keeping your login credentials secure and for everything that happens under your account.
          You must be at least 18 years old, and the information you give us must be accurate.
        </p>
        <p>
          Each account's data is private to that account. Do not access, or try to access, another
          customer's data.
        </p>
      </Section>

      <Section title="3. Quotes are estimates">
        <p>
          Quotes and prices generated with {PRODUCT_NAME} are <strong>estimates</strong>. Material
          prices — including prices from third-party lookups — change without notice and may be
          approximate. You are responsible for confirming final pricing, scope, taxes, and terms with
          your customer before work begins. {PRODUCT_NAME} is not a party to any contract between you
          and your customers.
        </p>
      </Section>

      <Section title="4. Your content">
        <p>
          Your quotes, projects, receipts, documents, and business information belong to you. You give
          us permission to store and process them only so we can run the service for you. We do not
          claim ownership of your content, and we do not sell it (see our Privacy Policy).
        </p>
      </Section>

      <Section title="5. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Use the service for anything unlawful or fraudulent;</li>
          <li>Send spam or deceptive quotes or emails through the service;</li>
          <li>Probe, scan, or attempt to break the service's security or access controls;</li>
          <li>Copy, resell, or reverse-engineer the service except where the law allows it.</li>
        </ul>
      </Section>

      <Section title="6. Plans and billing">
        <p>
          We offer a free plan and paid plans (Solo and Crew) billed monthly, as described on our
          Pricing page. Paid checkout is being brought online; when it opens, paid plans will be
          processed by our payment provider and these terms will be updated with the billing details
          before you are charged. You can cancel a paid plan at any time; cancellation stops future
          billing, and your data stays available on the free plan unless you delete your account.
        </p>
      </Section>

      <Section title="7. Availability and changes">
        <p>
          We work to keep {PRODUCT_NAME} available and reliable, but we do not guarantee uninterrupted
          service. We may improve, change, or discontinue features. If we make a change that
          significantly reduces the service you pay for, we will give reasonable notice.
        </p>
      </Section>

      <Section title="8. Liability">
        <p>
          To the fullest extent allowed by law, {PRODUCT_NAME} is provided "as is," and our total
          liability for any claim arising from the service is limited to the amount you paid us in the
          12 months before the claim (or $50 if you are on the free plan). We are not liable for lost
          profits, lost jobs, or disputes between you and your customers.
        </p>
      </Section>

      <Section title="9. Termination">
        <p>
          You may stop using the service and delete your account at any time. We may suspend or end an
          account that violates these terms. On deletion, your data is removed as described in the
          Privacy Policy.
        </p>
      </Section>

      <Section title="10. Changes to these terms">
        <p>
          We may update these terms from time to time. Material changes will be announced in the app or
          by email before they take effect. Continuing to use the service after an update means you
          accept the new terms.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          Questions about these terms: <a className="text-primary hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </Section>

      <footer className="border-t border-slate-800/60 pt-6 mt-12 flex gap-6 text-sm text-slate-400">
        <Link to="/" className="hover:text-white">Home</Link>
        <Link to="/pricing" className="hover:text-white">Pricing</Link>
        <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
      </footer>
    </div>
  </div>
);

export default Terms;
