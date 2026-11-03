/**
 * Approval Queue — Pass Nine (Command Center).
 *
 * Solen operates the back office; work that would leave the building —
 * follow-up drafts, ad copy, lead scans, price checks — lands here as
 * queued items. Brandon's job is the thumbs-up: Approve, Dismiss, Done.
 * The queue seeds NOTHING: an empty queue is a quiet queue.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Check, X, CheckCheck, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/env';
import { showError, showSuccess } from '../utils/toastService';

const FILTERS = ['queued', 'approved', 'done', 'dismissed', 'all'];
const TERMINAL = ['done', 'dismissed'];

const KIND_LABELS = {
  followup: 'Follow-up draft',
  ad: 'Ad copy',
  'lead-scan': 'Lead scan',
  'price-check': 'Price check',
  note: 'Note'
};

const STATUS_STYLES = {
  queued: 'bg-primary/15 text-primary border-primary/40',
  approved: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  done: 'bg-green-500/15 text-green-400 border-green-500/40',
  dismissed: 'bg-slate-500/15 text-slate-400 border-slate-500/40'
};

const EMPTY_QUEUE_TEXT =
  'Nothing waiting. When Solen drafts follow-ups, ads, or lead scans, they land here for your thumbs-up.';

export default function Queue() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('queued');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const res = await fetch(`${API_BASE_URL}/api/ops/items${query}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not load the queue');
      setItems(data.items);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const setStatus = async (item, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ops/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not update item');
      showSuccess(`"${item.title}" → ${status}`);
      load();
    } catch (error) {
      showError(error.message);
    }
  };

  const removeItem = async (item) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ops/items/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not remove item');
      load();
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <div className="text-slate-100 font-body">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <h2 className="font-display text-[1.8rem] leading-none mb-2">Approval Queue</h2>
        <p className="text-slate-400 text-sm mb-6">
          Work Solen prepared, waiting on your say-so. Nothing leaves the building without it.
        </p>

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
        ) : items.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-slate-400 leading-relaxed max-w-md mx-auto">
              {filter === 'queued' ? EMPTY_QUEUE_TEXT : 'Nothing in this column.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[0.7rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-slate-500/15 text-slate-300 border-slate-500/40">
                      {KIND_LABELS[item.kind] || item.kind}
                    </span>
                    <span className={`text-[0.7rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_STYLES[item.status] || STATUS_STYLES.queued}`}>
                      {item.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 flex-none">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-display text-[1.35rem] leading-tight mb-2">{item.title}</h3>
                {item.body && (
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-4">{item.body}</p>
                )}
                <div className="flex flex-wrap gap-2.5">
                  {item.status === 'queued' && (
                    <>
                      <button onClick={() => setStatus(item, 'approved')} className="btn-ember !min-h-[44px]">
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => setStatus(item, 'dismissed')} className="btn-ghost !min-h-[44px]">
                        <X className="w-4 h-4" /> Dismiss
                      </button>
                    </>
                  )}
                  {item.status === 'approved' && (
                    <>
                      <button onClick={() => setStatus(item, 'done')} className="btn-ember !min-h-[44px]">
                        <CheckCheck className="w-4 h-4" /> Done
                      </button>
                      <button onClick={() => setStatus(item, 'dismissed')} className="btn-ghost !min-h-[44px]">
                        <X className="w-4 h-4" /> Dismiss
                      </button>
                    </>
                  )}
                  {TERMINAL.includes(item.status) && (
                    <button onClick={() => removeItem(item)} className="btn-ghost !min-h-[44px]">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
