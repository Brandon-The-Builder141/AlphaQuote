/**
 * Lead Board — Pass Nine (Command Center).
 *
 * Homeowner leads from Defiance County auditor sale records (seeded by
 * the API on first view) plus hand-added leads. Built for the phone:
 * one card per lead, tap-to-call where a researched number exists, and
 * a status that walks the call pipeline.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Phone, MapPin, Plus, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/env';
import { showError, showSuccess } from '../utils/toastService';

const STATUSES = ['new', 'calling', 'quoted', 'won', 'dead'];
const FILTERS = ['all', ...STATUSES];

const STATUS_STYLES = {
  new: 'bg-primary/15 text-primary border-primary/40',
  calling: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  quoted: 'bg-sky-500/15 text-sky-400 border-sky-500/40',
  won: 'bg-green-500/15 text-green-400 border-green-500/40',
  dead: 'bg-slate-500/15 text-slate-400 border-slate-500/40'
};

function formatMoney(value) {
  const n = Number(value);
  if (!n) return null;
  return `$${n.toLocaleString('en-US')}`;
}

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '' });

  const load = useCallback(async () => {
    try {
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const res = await fetch(`${API_BASE_URL}/api/leads${query}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not load leads');
      setLeads(data.leads);
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

  const changeStatus = async (lead, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not update lead');
      showSuccess(`${lead.name} → ${status}`);
      load();
    } catch (error) {
      showError(error.message);
    }
  };

  const removeLead = async (lead) => {
    if (!window.confirm(`Remove ${lead.name} from the board?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads/${lead.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not remove lead');
      load();
    } catch (error) {
      showError(error.message);
    }
  };

  const addLead = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: 'Manual' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not add lead');
      setForm({ name: '', address: '', city: '', phone: '' });
      setShowAdd(false);
      showSuccess('Lead added');
      load();
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <div className="text-slate-100 font-body">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h2 className="font-display text-[1.8rem] leading-none">Lead Board</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-steel !min-h-[44px]">
            <Plus className="w-4 h-4" /> Add lead
          </button>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          New homeowners from the auditor sale records. Work the board top to bottom.
        </p>

        {showAdd && (
          <form onSubmit={addLead} className="card p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Buyer name"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100"
            />
            <input
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Property address"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100"
            />
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="City"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone (optional)"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100"
            />
            <button type="submit" className="btn-ember sm:col-span-2">Add to the board</button>
          </form>
        )}

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
        ) : leads.length === 0 ? (
          <p className="text-slate-500 py-10 text-center">No leads in this column.</p>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => {
              const price = formatMoney(lead.salePrice);
              const date = formatDate(lead.saleDate);
              return (
                <div key={lead.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="font-display text-[1.35rem] leading-tight">{lead.name}</h3>
                    <span className={`flex-none text-[0.7rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-slate-300 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-4 h-4 text-slate-500 flex-none" />
                    {lead.address}{lead.city ? ` · ${lead.city}` : ''}
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    {[date && `Bought ${date}`, price, lead.acres ? `${lead.acres} acres` : null]
                      .filter(Boolean)
                      .join(' · ') || 'Sale record on file'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {lead.phone ? (
                      <a href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`} className="btn-ember !min-h-[44px]">
                        <Phone className="w-4 h-4" /> {lead.phone}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-500 px-1">No phone yet</span>
                    )}
                    <select
                      value={lead.status}
                      onChange={(e) => changeStatus(lead, e.target.value)}
                      aria-label={`Status for ${lead.name}`}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 min-h-[44px] text-slate-200"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeLead(lead)}
                      aria-label={`Remove ${lead.name}`}
                      className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 flex items-center justify-center"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                  {lead.notes && <p className="text-sm text-slate-400 mt-3">{lead.notes}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
