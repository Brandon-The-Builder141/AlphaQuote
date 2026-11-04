/**
 * Quote Ledger — Pass 10 (Durable Quote Ledger).
 *
 * Every saved quote, newest activity first. Quotes land here
 * automatically: the wizard autosaves drafts and finished estimates
 * persist on the way to their detail page. Filter by status, search by
 * customer or quote number (server-side), tap a row to open the quote.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText } from 'lucide-react';
import { listQuotes } from '../api/quotes';
import { showError } from '../utils/toastService';

const STATUSES = ['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired', 'archived'];
const FILTERS = ['all', ...STATUSES];

export const QUOTE_STATUS_STYLES = {
  draft: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
  sent: 'bg-sky-500/15 text-sky-400 border-sky-500/40',
  viewed: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  accepted: 'bg-green-500/15 text-green-400 border-green-500/40',
  declined: 'bg-red-500/15 text-red-400 border-red-500/40',
  expired: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
  archived: 'bg-slate-700/30 text-slate-500 border-slate-600/40'
};

function money(value) {
  const n = Number(value) || 0;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Quotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Debounce the search box — the query runs server-side via ?search=.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    try {
      const rows = await listQuotes({ status: filter, search });
      setQuotes(rows);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const isFiltered = filter !== 'all' || search !== '';

  return (
    <div className="text-slate-100 font-body">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h2 className="font-display text-[1.8rem] leading-none">Quote Ledger</h2>
          <button onClick={() => navigate('/estimate')} className="btn-ember !min-h-[44px]">
            <Plus className="w-4 h-4" /> New Estimate
          </button>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          Every quote you've built, saved on the server. Drafts autosave from the builder;
          sent quotes keep a frozen copy of exactly what went out.
        </p>

        <div className="relative mb-5">
          <Search className="w-4.5 h-4.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search customer or quote number…"
            aria-label="Search quotes"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-11 pr-3 py-2.5 text-slate-100"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                filter === s
                  ? 'bg-primary text-white border-primary'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : quotes.length === 0 ? (
          <div className="card p-8 text-center">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            {isFiltered ? (
              <p className="text-slate-400">No quotes match this filter.</p>
            ) : (
              <p className="text-slate-400">
                No quotes saved yet — finished estimates land here automatically.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => {
              const updated = formatDate(quote.updatedAt);
              return (
                <button
                  key={quote.id}
                  onClick={() => navigate(`/quotes/${quote.id}`)}
                  className="card w-full text-left p-5 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="min-w-0">
                      <p className="font-display text-[1.3rem] leading-tight text-primary">
                        {quote.quoteNumber}
                      </p>
                      <p className="text-slate-100 font-semibold truncate">
                        {quote.customerName || 'Unnamed customer'}
                      </p>
                    </div>
                    <span className={`flex-none text-[0.7rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${QUOTE_STATUS_STYLES[quote.status] || QUOTE_STATUS_STYLES.draft}`}>
                      {quote.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm text-slate-400">
                      {[quote.jobType, quote.version > 1 ? `Version ${quote.version}` : null, updated ? `Updated ${updated}` : null]
                        .filter(Boolean)
                        .join(' · ') || 'Quote on file'}
                    </p>
                    <p className="font-display text-xl text-slate-100">{money(quote.total)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
