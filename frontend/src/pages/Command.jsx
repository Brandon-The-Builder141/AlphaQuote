/**
 * Command Center — Pass Nine home (/dashboard).
 *
 * One screen, the state of the business AND the day:
 *  - TODAY: must-win + Daily Brick from the morning flow, editable here.
 *  - BUSINESS: quotes out, follow-ups due, receipts this month, jobs today.
 *  - LEADS: the newest homeowners on the board, tap-to-call.
 *  - QUEUE: agent work waiting on a thumbs-up.
 * The engine (estimates, receipts, vendors, pricing) is unchanged —
 * this page only reads it and points at it.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calculator,
  Phone,
  ArrowRight,
  Pencil,
  Check,
  ClipboardList,
  BellRing,
  Receipt,
  Calendar,
  ListChecks
} from 'lucide-react';
import { API_BASE_URL } from '../config/env';
import ServiceStatus from '../components/ServiceStatus';
import { showError, showSuccess } from '../utils/toastService';
import {
  LABOR_RATES,
  MINIMUM_JOB_AMOUNT,
  QUOTE_VALIDITY_DAYS,
  SERVICE_CATEGORIES
} from '../utils/pricingConstants';

function localDateKey(d = new Date()) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function money(value) {
  const n = Number(value) || 0;
  return `$${n.toLocaleString('en-US')}`;
}

async function getJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || !data.success) {
    throw new Error((data && data.error) || `Request failed: ${path}`);
  }
  return data;
}

export default function Command() {
  const navigate = useNavigate();
  const today = localDateKey();

  const [day, setDay] = useState({ mustWin: '', brick: '' });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ mustWin: '', brick: '' });
  const [summary, setSummary] = useState(null);
  const [newLeads, setNewLeads] = useState([]);
  const [queued, setQueued] = useState([]);

  const load = useCallback(async () => {
    try {
      const [dayRes, summaryRes, leadsRes, queueRes] = await Promise.all([
        getJson(`/api/ops/day?date=${today}`),
        getJson('/api/ops/summary'),
        getJson('/api/leads?status=new'),
        getJson('/api/ops/items?status=queued')
      ]);
      setDay({ mustWin: dayRes.day.mustWin || '', brick: dayRes.day.brick || '' });
      setSummary(summaryRes.summary);
      setNewLeads(leadsRes.leads.slice(0, 5));
      setQueued(queueRes.items);
    } catch (error) {
      showError(error.message);
    }
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = () => {
    setDraft({ ...day });
    setEditing(true);
  };

  const saveDay = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ops/day`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, ...draft })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not save today');
      setDay({ mustWin: data.day.mustWin, brick: data.day.brick });
      setEditing(false);
      showSuccess('Today is set');
    } catch (error) {
      showError(error.message);
    }
  };

  const tiles = summary
    ? [
      {
        icon: ClipboardList,
        label: 'Quotes out',
        value: String(summary.quotesOut.count),
        sub: `${money(summary.quotesOut.total)} awaiting response`,
        path: '/quotes'
      },
      {
        icon: BellRing,
        label: 'Follow-ups due',
        value: String(summary.followUpsDue.count),
        sub: 'Due today or overdue',
        path: '/followups'
      },
      {
        icon: Receipt,
        label: 'Receipts this month',
        value: money(summary.receiptsThisMonth.total),
        sub: `${summary.receiptsThisMonth.count} receipts logged`,
        path: '/receipts'
      },
      {
        icon: Calendar,
        label: 'Jobs today',
        value: String(summary.jobsToday.count),
        sub: 'On the schedule',
        path: '/scheduling'
      }
    ]
    : [];

  return (
    <div className="text-slate-100 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Command band */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="eyebrow mb-1.5">Iron Legion Contracting — Command</p>
            <h2 className="font-display font-bold uppercase leading-[0.95] text-[2.2rem] sm:text-5xl">
              The state of <span className="ember-text">the day.</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <ServiceStatus compact={true} />
            <button onClick={() => navigate('/estimate')} className="btn-ember">
              <Calculator className="w-5 h-5" /> New Estimate
            </button>
          </div>
        </div>

        {/* TODAY */}
        <section className="card p-6 sm:p-7 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-display text-[1.5rem] leading-none">Today</h3>
            {!editing && (
              <button onClick={startEdit} className="btn-ghost !min-h-[40px] text-sm">
                <Pencil className="w-4 h-4" /> {day.mustWin || day.brick ? 'Edit' : 'Set today'}
              </button>
            )}
          </div>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="stat-label block mb-1.5" htmlFor="mustWin">Must-win</label>
                <input
                  id="mustWin"
                  value={draft.mustWin}
                  onChange={(e) => setDraft({ ...draft, mustWin: e.target.value })}
                  placeholder="The one thing that makes today a win"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100"
                />
              </div>
              <div>
                <label className="stat-label block mb-1.5" htmlFor="brick">Daily Brick</label>
                <input
                  id="brick"
                  value={draft.brick}
                  onChange={(e) => setDraft({ ...draft, brick: e.target.value })}
                  placeholder="One small brick laid today"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100"
                />
              </div>
              <div className="flex gap-2.5">
                <button onClick={saveDay} className="btn-ember !min-h-[44px]">
                  <Check className="w-4 h-4" /> Save
                </button>
                <button onClick={() => setEditing(false)} className="btn-ghost !min-h-[44px]">Cancel</button>
              </div>
            </div>
          ) : day.mustWin || day.brick ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="stat-label mb-1">Must-win</p>
                <p className="text-lg text-slate-100 leading-snug">{day.mustWin || '—'}</p>
              </div>
              <div>
                <p className="stat-label mb-1">Daily Brick</p>
                <p className="text-lg text-slate-100 leading-snug">{day.brick || '—'}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Nothing set for today yet.</p>
          )}
        </section>

        {/* BUSINESS STATE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          {tiles.map((tile) => (
            <button
              key={tile.label}
              onClick={() => navigate(tile.path)}
              className="stat-card text-left group"
            >
              <div className="flex items-center gap-2 mb-2">
                <tile.icon className="w-5 h-5 text-primary" />
                <p className="stat-label">{tile.label}</p>
              </div>
              <p className="stat-num">{tile.value}</p>
              <p className="text-sm text-slate-400 mt-1">{tile.sub}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* LEADS preview */}
          <section className="card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-display text-[1.5rem] leading-none">New leads</h3>
              <Link to="/leads" className="text-primary hover:text-primary/80 text-sm font-semibold inline-flex items-center gap-1">
                Open the board <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {newLeads.length === 0 ? (
              <p className="text-slate-500">No new leads waiting.</p>
            ) : (
              <ul className="divide-y divide-slate-800">
                {newLeads.map((lead) => (
                  <li key={lead.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-100 truncate">{lead.name}</p>
                      <p className="text-sm text-slate-400 truncate">
                        {lead.address} · {lead.city}
                      </p>
                    </div>
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                        aria-label={`Call ${lead.name}`}
                        className="flex-none w-11 h-11 rounded-full bg-primary/15 border border-primary/40 text-primary flex items-center justify-center"
                      >
                        <Phone className="w-5 h-5" />
                      </a>
                    ) : (
                      <span className="flex-none text-xs text-slate-500">No phone</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* QUEUE preview */}
          <section className="card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-display text-[1.5rem] leading-none flex items-center gap-2">
                <ListChecks className="w-6 h-6 text-primary" /> Waiting on you
              </h3>
              <Link to="/queue" className="text-primary hover:text-primary/80 text-sm font-semibold inline-flex items-center gap-1">
                Open the queue <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {queued.length === 0 ? (
              <p className="text-slate-500">Nothing waiting. Solen's drafts land here when they're ready.</p>
            ) : (
              <>
                <p className="text-slate-300 mb-3">
                  <span className="font-display text-2xl text-primary">{queued.length}</span>{' '}
                  {queued.length === 1 ? 'item needs' : 'items need'} your thumbs-up
                </p>
                <ul className="space-y-2">
                  {queued.slice(0, 3).map((item) => (
                    <li key={item.id} className="text-slate-200 truncate">• {item.title}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        {/* QUOTES — the durable ledger at a glance (Pass 10) */}
        <section className="card p-6 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-display text-[1.5rem] leading-none">Quotes</h3>
            <Link to="/quotes" className="text-primary hover:text-primary/80 text-sm font-semibold inline-flex items-center gap-1">
              Open the ledger <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {summary && summary.quotes ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <p className="stat-label mb-1">Drafts</p>
                <p className="font-display text-[1.6rem] leading-none text-slate-100">
                  {summary.quotes.drafts.count}
                </p>
              </div>
              <div>
                <p className="stat-label mb-1">Sent — awaiting action</p>
                <p className="font-display text-[1.6rem] leading-none text-slate-100">
                  {summary.quotes.sent.count}
                  <span className="text-base text-slate-400"> · {money(summary.quotes.sent.total)}</span>
                </p>
              </div>
              <div>
                <p className="stat-label mb-1">Accepted work</p>
                <p className="font-display text-[1.6rem] leading-none text-slate-100">
                  {summary.quotes.accepted.count}
                  <span className="text-base text-slate-400"> · {money(summary.quotes.accepted.total)}</span>
                </p>
              </div>
              <div>
                <p className="stat-label mb-1">Expired / declined</p>
                <p className="font-display text-[1.6rem] leading-none text-slate-100">
                  {summary.quotes.closedOut.count}
                  <span className="text-base text-slate-400"> · {money(summary.quotes.closedOut.total)}</span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Quote totals load with the day's summary.</p>
          )}
        </section>

        {/* His numbers — compact strip (pricingConstants, unchanged values) */}
        <div className="card px-6 py-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
          <span className="text-slate-300">
            Solo <strong className="text-slate-100">${LABOR_RATES.SOLO}/hr</strong>
          </span>
          <span className="text-slate-300">
            Crew <strong className="text-slate-100">${LABOR_RATES.CREW}/hr</strong>
          </span>
          <span className="text-slate-300">
            Minimum <strong className="text-slate-100">${MINIMUM_JOB_AMOUNT}</strong>
          </span>
          <span className="text-slate-300">
            Quotes good <strong className="text-slate-100">{QUOTE_VALIDITY_DAYS} days</strong>
          </span>
          <span className="text-slate-400">{SERVICE_CATEGORIES.join(' · ')}</span>
        </div>
      </div>
    </div>
  );
}
