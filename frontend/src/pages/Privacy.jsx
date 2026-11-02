/**
 * Privacy Policy — public page at /privacy.
 * Plain-language policy matching how the product actually works:
 * per-account data scoping, Clerk for auth, no data selling.
 * Contact email comes from src/config/site.js (single source).
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

const Privacy = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-10">
        <Hammer className="w-5 h-5 text-primary" />
        <span className="font-bold text-white">{PRODUCT_NAME}</span>
        <span className="text-slate-500">/ Privacy Policy</span>
      </Link>

      <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
      <p className="text-slate-400 mb-10">Last updated: November 2, 2026</p>

      <Section title="The short version">
        <p>
          Your business data is yours. It is stored under your account, visible only to you (and, on
          team plans, the people you invite). We never sell your data, and we never share it for
          advertising.
        </p>
      </Section>

      <Section title="1. What we collect">
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Account information</strong> — your name, email address, and business details you enter in your profile.</li>
          <li><strong>Your work data</strong> — quotes, estimates, projects, vendors, schedules, follow-up notes, and the receipts and documents you upload. This is stored so you can use it in the service; it is your records, kept for you.</li>
          <li><strong>Basic technical data</strong> — log and device information needed to run and secure the service (for example, sign-in events and error logs).</li>
        </ul>
      </Section>

      <Section title="2. How your data is kept separate">
        <p>
          Every account's data is scoped to that account on our servers. When you request your quotes,
          receipts, or projects, the service only ever returns your own. Other customers cannot see
          your data, and you cannot see theirs.
        </p>
      </Section>

      <Section title="3. Sign-in and authentication">
        <p>
          Sign-in is handled by Clerk, our authentication provider. Clerk processes your login
          credentials and session information under its own privacy policy. We never see or store your
          password.
        </p>
      </Section>

      <Section title="4. Service providers we rely on">
        <p>We share data only with the providers needed to run {PRODUCT_NAME}, and only what they need:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Clerk</strong> — authentication and account management.</li>
          <li><strong>Hosting and database providers</strong> — to store and serve the app and your data.</li>
          <li><strong>Material price lookup (SerpAPI)</strong> — when you look up a material price, the search terms (for example, a product name) are sent to the lookup provider. Your account identity and your stored records are not sent.</li>
          <li><strong>Email delivery</strong> — if you send a quote by email through the service, the message is delivered through our email provider.</li>
          <li><strong>Payment provider</strong> — when paid checkout opens, payments will be processed by our payment provider; we will not store your full card number.</li>
        </ul>
      </Section>

      <Section title="5. What we never do">
        <ul className="list-disc pl-6 space-y-1">
          <li>We never sell your personal or business data.</li>
          <li>We never use your quotes, receipts, or customer information to advertise to you or your customers.</li>
          <li>We never read your records except as needed to operate the service, provide support you requested, or meet a legal obligation.</li>
        </ul>
      </Section>

      <Section title="6. Retention and deletion">
        <p>
          We keep your data while your account is active so the service works. If you delete your
          account, your work data is deleted from our active systems, except where we must keep limited
          records for legal, tax, or security reasons. You can ask us what we hold or request deletion
          at any time using the contact below.
        </p>
      </Section>

      <Section title="7. Security">
        <p>
          Access to the service requires sign-in, data is scoped per account, and traffic is encrypted
          in transit. No system is perfectly secure, but we treat protecting your records as a core
          part of the product, not an afterthought.
        </p>
      </Section>

      <Section title="8. Your choices">
        <p>
          You can update your profile information in the app, export your records using the built-in
          export tools, and contact us to access, correct, or delete your personal information.
        </p>
      </Section>

      <Section title="9. Changes to this policy">
        <p>
          If we change this policy in a material way, we will announce it in the app or by email before
          the change takes effect and update the date above.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          Privacy questions or requests: <a className="text-primary hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </Section>

      <footer className="border-t border-slate-800/60 pt-6 mt-12 flex gap-6 text-sm text-slate-400">
        <Link to="/" className="hover:text-white">Home</Link>
        <Link to="/pricing" className="hover:text-white">Pricing</Link>
        <Link to="/terms" className="hover:text-white">Terms of Service</Link>
      </footer>
    </div>
  </div>
);

export default Privacy;
