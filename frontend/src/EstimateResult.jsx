/**
 * Estimate Result — Pass 10 persistence handoff.
 *
 * This page no longer renders an estimate. It takes the finished
 * estimate from route state, saves it as a durable quote through the
 * API (updating the existing draft when the wizard carried a quoteId),
 * and hands off to the quote's ledger page at /quotes/:id. QuoteDetail
 * is the durable view now — it survives refresh and sign-out.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader, FileText } from 'lucide-react';
import { createQuote, updateQuote, buildQuotePayloadFromResultState } from './api/quotes';
import { showError } from './utils/toastService';

export default function EstimateResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;
  const ranRef = useRef(false);
  const [error, setError] = useState(null);

  const persist = useCallback(async () => {
    if (!state) return;
    setError(null);
    try {
      const payload = buildQuotePayloadFromResultState(state);
      const quote = state.quoteId
        ? await updateQuote(state.quoteId, payload)
        : await createQuote(payload);
      navigate(`/quotes/${quote.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      showError(err.message);
    }
  }, [state, navigate]);

  useEffect(() => {
    if (!state || ranRef.current) return;
    ranRef.current = true;
    persist();
  }, [state, persist]);

  const retry = () => {
    ranRef.current = true;
    persist();
  };

  if (!state) {
    return (
      <div className="text-slate-100 font-body">
        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="card p-8 text-center">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h2 className="font-display text-[1.5rem] leading-none mb-2">No fresh estimate here</h2>
            <p className="text-slate-400 text-sm mb-6">
              Your saved quotes live in the ledger — every finished estimate is kept there.
            </p>
            <Link to="/quotes" className="btn-ember !min-h-[44px] inline-flex">
              Open the quote ledger
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-slate-100 font-body">
        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="card p-8 text-center">
            <h2 className="font-display text-[1.5rem] leading-none mb-2">The quote didn't save</h2>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            <button onClick={retry} className="btn-ember !min-h-[44px]">
              Try saving again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-slate-100 font-body">
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="card p-8 text-center">
          <Loader className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
          <h2 className="font-display text-[1.5rem] leading-none mb-2">Saving your quote…</h2>
          <p className="text-slate-400 text-sm">
            Filing it in the ledger so it's there whenever you come back.
          </p>
        </div>
      </div>
    </div>
  );
}
