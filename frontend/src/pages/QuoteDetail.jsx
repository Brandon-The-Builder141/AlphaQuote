/**
 * Quote Detail — Pass 10 (Durable Quote Ledger).
 *
 * The durable home of one quote, loaded by ID from the API — it works
 * after a refresh or a fresh sign-in; nothing here depends on route
 * state. Drafts are editable in place (customer fields, notes, markup)
 * with debounced autosave; line items are edited in the builder.
 * Non-drafts are frozen records: status walks, revisions, and the
 * issued PDF all come from the server's snapshots.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Send,
  Archive,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  FolderPlus,
  ExternalLink,
  Loader,
  Pencil
} from 'lucide-react';
import {
  getQuote,
  updateQuote,
  deleteQuote,
  setQuoteStatus,
  reviseQuote,
  getQuotePdfData,
  createQuoteProject
} from '../api/quotes';
import { calculateCompleteEstimate, calculateWorkItemCost } from '../utils/calculateEstimate';
import { generateQuotePDF } from '../utils/pdfService';
import { showError, showSuccess } from '../utils/toastService';
import { QUOTE_STATUS_STYLES } from './Quotes';

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

const inputClass = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100';

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    jobType: '',
    notes: '',
    markup: 15
  });
  const [saveState, setSaveState] = useState(''); // '' | 'saving' | 'saved'
  const [busy, setBusy] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const quoteRef = useRef(null);
  const saveTimerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const q = await getQuote(id);
      quoteRef.current = q;
      setQuote(q);
      setForm({
        customerName: q.customerName || '',
        customerEmail: q.customerEmail || '',
        customerPhone: q.customerPhone || '',
        address: q.address || '',
        jobType: q.jobType || '',
        notes: (q.data && q.data.notes) || '',
        markup: q.data && q.data.markup != null ? q.data.markup : 15
      });
      setSaveState('');
      setLoadError(null);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  }, []);

  // ---- Draft autosave -------------------------------------------------

  const persistDraft = useCallback(async (nextForm) => {
    const current = quoteRef.current;
    if (!current || current.status !== 'draft') return;
    const doc = current.data || {};
    const markup = parseFloat(nextForm.markup) || 0;
    const estimate = calculateCompleteEstimate({
      workItems: doc.workItems || [],
      markup,
      taxRate: doc.taxRate || 0,
      taxEnabled: !!doc.taxEnabled,
      discount: doc.discount || 0
    });
    const newData = {
      ...doc,
      projectInfo: {
        ...(doc.projectInfo || {}),
        clientName: nextForm.customerName,
        jobType: nextForm.jobType,
        email: nextForm.customerEmail,
        phone: nextForm.customerPhone,
        address: nextForm.address
      },
      notes: nextForm.notes,
      markup,
      subtotal: estimate.subtotal,
      markupAmount: estimate.markupAmount,
      taxAmount: estimate.taxAmount,
      total: estimate.total
    };
    const payload = {
      customerName: nextForm.customerName,
      customerEmail: nextForm.customerEmail,
      customerPhone: nextForm.customerPhone,
      address: nextForm.address,
      jobType: nextForm.jobType,
      data: newData
    };
    if (current.leadId) payload.leadId = current.leadId;
    if (current.projectId) payload.projectId = current.projectId;
    try {
      const updated = await updateQuote(current.id, payload);
      quoteRef.current = updated;
      setQuote(updated);
      setSaveState('saved');
    } catch (error) {
      setSaveState('');
      showError(error.message);
    }
  }, []);

  const editField = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveState('saving');
    saveTimerRef.current = setTimeout(() => {
      persistDraft(next);
    }, 800);
  };

  // ---- Actions ----------------------------------------------------------

  const runAction = async (key, fn, successMsg) => {
    setBusy(key);
    try {
      await fn();
      if (successMsg) showSuccess(successMsg);
      await load();
    } catch (error) {
      showError(error.message);
    } finally {
      setBusy(null);
    }
  };

  const markStatus = (status, label) =>
    runAction(`status-${status}`, () => setQuoteStatus(id, status), `${quote.quoteNumber} ${label}`);

  const createRevision = () =>
    runAction('revise', () => reviseQuote(id), 'Revision started — this is the working draft now');

  const createProject = () =>
    runAction('project', () => createQuoteProject(id), 'Project created from this quote');

  const removeQuote = async () => {
    if (!window.confirm(`Delete draft ${quote.quoteNumber}? This can't be undone.`)) return;
    setBusy('delete');
    try {
      await deleteQuote(id);
      showSuccess(`${quote.quoteNumber} deleted`);
      navigate('/quotes');
    } catch (error) {
      showError(error.message);
      setBusy(null);
    }
  };

  // ---- PDF ---------------------------------------------------------------

  const downloadDraftPdf = async () => {
    setPdfBusy(true);
    try {
      await generateQuotePDF(quote.data);
      showSuccess('PDF downloaded');
    } catch (error) {
      showError('Failed to generate PDF. Please try again.');
    } finally {
      setPdfBusy(false);
    }
  };

  const downloadIssuedPdf = async (version) => {
    setPdfBusy(true);
    try {
      const pdfData = await getQuotePdfData(id, version);
      await generateQuotePDF(pdfData);
      showSuccess('PDF downloaded');
    } catch (error) {
      showError(error.message);
    } finally {
      setPdfBusy(false);
    }
  };

  // ---- Render --------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loadError || !quote) {
    return (
      <div className="text-slate-100 font-body">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
          <Link to="/quotes" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to the ledger
          </Link>
          <div className="card p-8 text-center">
            <p className="text-slate-300 mb-2">This quote couldn't be loaded.</p>
            <p className="text-slate-500 text-sm mb-5">{loadError || 'Quote not found.'}</p>
            <button onClick={load} className="btn-ember !min-h-[44px]">Try again</button>
          </div>
        </div>
      </div>
    );
  }

  const doc = quote.data || {};
  const workItems = doc.workItems || [];
  const rooms = workItems.filter((item) => item.type === 'room');
  const tasks = workItems.filter((item) => item.type === 'task');
  const isDraft = quote.status === 'draft';
  const revisions = quote.revisions || [];

  const liveEstimate = isDraft
    ? calculateCompleteEstimate({
      workItems,
      markup: parseFloat(form.markup) || 0,
      taxRate: doc.taxRate || 0,
      taxEnabled: !!doc.taxEnabled,
      discount: doc.discount || 0
    })
    : null;

  const totals = isDraft
    ? {
      subtotal: liveEstimate.subtotal,
      markupAmount: liveEstimate.markupAmount,
      taxAmount: liveEstimate.taxAmount,
      discount: doc.discount || 0,
      total: liveEstimate.total
    }
    : {
      subtotal: doc.subtotal != null ? doc.subtotal : quote.subtotal,
      markupAmount: doc.markupAmount,
      taxAmount: doc.taxAmount,
      discount: doc.discount || 0,
      total: doc.total != null ? doc.total : quote.total
    };

  const sentDate = formatDate(quote.sentAt);
  const expiresDate = formatDate(quote.expiresAt);
  const anyBusy = busy !== null;

  const actionButton = (key, onClick, icon, label, className = 'btn-ghost') => {
    const Icon = icon;
    return (
      <button
        key={key}
        onClick={onClick}
        disabled={anyBusy}
        className={`${className} !min-h-[44px] disabled:opacity-50`}
      >
        {busy === key ? <Loader className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
        {label}
      </button>
    );
  };

  return (
    <div className="text-slate-100 font-body">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <Link to="/quotes" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-5">
          <ArrowLeft className="w-4 h-4" /> Back to the ledger
        </Link>

        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <p className="eyebrow mb-1.5">Quote</p>
              <h2 className="font-display text-[2rem] leading-none">{quote.quoteNumber}</h2>
            </div>
            <div className="flex items-center gap-2">
              {quote.version > 1 && (
                <span className="text-[0.7rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-slate-800 text-slate-300 border-slate-600">
                  Version {quote.version}
                </span>
              )}
              <span className={`text-[0.7rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${QUOTE_STATUS_STYLES[quote.status] || QUOTE_STATUS_STYLES.draft}`}>
                {quote.status}
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            {[
              sentDate ? `Sent ${sentDate}` : null,
              expiresDate ? `Good through ${expiresDate}` : null,
              isDraft && saveState === 'saving' ? 'Saving…' : null,
              isDraft && saveState === 'saved' ? 'Saved' : null
            ].filter(Boolean).join(' · ') || (isDraft ? 'Working draft' : 'On file')}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            {quote.leadId && (
              <Link to="/leads" className="btn-ghost !min-h-[40px] text-sm">
                From lead <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            {quote.projectId ? (
              <button
                onClick={() => navigate(`/projects/${quote.projectId}/budget`)}
                className="btn-ghost !min-h-[40px] text-sm"
              >
                <ExternalLink className="w-4 h-4" /> Open project budget
              </button>
            ) : (
              actionButton('project', createProject, FolderPlus, 'Create project from quote')
            )}
            <button
              onClick={() => (isDraft ? downloadDraftPdf() : downloadIssuedPdf())}
              disabled={pdfBusy}
              className="btn-ghost !min-h-[40px] text-sm disabled:opacity-50"
            >
              {pdfBusy ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDraft ? 'Download PDF' : 'Download issued PDF'}
            </button>
          </div>

          {/* Status actions */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-4 border-t border-slate-800">
            {isDraft && (
              <>
                {actionButton('status-sent', () => markStatus('sent', 'marked as sent'), Send, 'Mark as sent', 'btn-ember')}
                {actionButton('status-archived', () => markStatus('archived', 'archived'), Archive, 'Archive')}
                {actionButton('delete', removeQuote, Trash2, 'Delete')}
              </>
            )}
            {(quote.status === 'sent' || quote.status === 'viewed') && (
              <>
                {actionButton('status-accepted', () => markStatus('accepted', 'accepted'), CheckCircle, 'Mark accepted', 'btn-ember')}
                {actionButton('status-declined', () => markStatus('declined', 'declined'), XCircle, 'Mark declined')}
                {actionButton('revise', createRevision, RefreshCw, 'Create revision')}
                {actionButton('status-archived', () => markStatus('archived', 'archived'), Archive, 'Archive')}
              </>
            )}
            {(quote.status === 'accepted' || quote.status === 'declined' || quote.status === 'expired') && (
              <>
                {actionButton('revise', createRevision, RefreshCw, 'Create revision', 'btn-ember')}
                {actionButton('status-archived', () => markStatus('archived', 'archived'), Archive, 'Archive')}
              </>
            )}
            {quote.status === 'archived' && (
              <p className="text-sm text-slate-500">This quote is archived. It's kept here as the record.</p>
            )}
          </div>
        </div>

        {/* Customer + project */}
        <section className="card p-6 mb-6">
          <h3 className="font-display text-[1.4rem] leading-none mb-4">Customer &amp; project</h3>
          {isDraft ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="stat-label block mb-1.5" htmlFor="qd-name">Customer name</label>
                <input id="qd-name" value={form.customerName} onChange={(e) => editField('customerName', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="stat-label block mb-1.5" htmlFor="qd-job">Job type</label>
                <input id="qd-job" value={form.jobType} onChange={(e) => editField('jobType', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="stat-label block mb-1.5" htmlFor="qd-email">Email</label>
                <input id="qd-email" value={form.customerEmail} onChange={(e) => editField('customerEmail', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="stat-label block mb-1.5" htmlFor="qd-phone">Phone</label>
                <input id="qd-phone" value={form.customerPhone} onChange={(e) => editField('customerPhone', e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="stat-label block mb-1.5" htmlFor="qd-address">Address</label>
                <input id="qd-address" value={form.address} onChange={(e) => editField('address', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="stat-label block mb-1.5" htmlFor="qd-markup">Markup %</label>
                <input id="qd-markup" type="number" min="0" value={form.markup} onChange={(e) => editField('markup', e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="stat-label block mb-1.5" htmlFor="qd-notes">Notes</label>
                <textarea id="qd-notes" rows={3} value={form.notes} onChange={(e) => editField('notes', e.target.value)} className={inputClass} />
              </div>
              <p className="sm:col-span-2 text-xs text-slate-500">
                Changes save automatically. Line items are edited in the builder.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <span className="stat-label block mb-0.5">Customer</span>
                <span className="text-slate-100 font-medium">{quote.customerName || '—'}</span>
              </div>
              <div>
                <span className="stat-label block mb-0.5">Job type</span>
                <span className="text-slate-100 font-medium">{quote.jobType || '—'}</span>
              </div>
              {quote.customerEmail && (
                <div>
                  <span className="stat-label block mb-0.5">Email</span>
                  <span className="text-slate-100 font-medium">{quote.customerEmail}</span>
                </div>
              )}
              {quote.customerPhone && (
                <div>
                  <span className="stat-label block mb-0.5">Phone</span>
                  <span className="text-slate-100 font-medium">{quote.customerPhone}</span>
                </div>
              )}
              {quote.address && (
                <div className="sm:col-span-2">
                  <span className="stat-label block mb-0.5">Address</span>
                  <span className="text-slate-100 font-medium">{quote.address}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Work items */}
        <section className="card p-6 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-display text-[1.4rem] leading-none">Work items</h3>
            {isDraft && (
              <button onClick={() => navigate(`/estimate?quoteId=${id}`)} className="btn-ember !min-h-[40px] text-sm">
                <Pencil className="w-4 h-4" /> Edit line items in the builder
              </button>
            )}
          </div>
          {workItems.length === 0 ? (
            <p className="text-slate-500">
              {isDraft ? 'No line items yet — add rooms and tasks in the builder.' : 'No line items on this quote.'}
            </p>
          ) : (
            <div className="space-y-5">
              {rooms.length > 0 && (
                <div>
                  <h4 className="stat-label mb-2.5">Room-based items</h4>
                  <div className="space-y-2.5">
                    {rooms.map((room) => (
                      <div key={room.id} className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/60">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <p className="text-slate-100 font-medium">{room.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {room.sqft} sqft × ${room.materialCost}/sqft · {room.laborHours} hrs labor
                            </p>
                          </div>
                          <p className="text-primary font-semibold flex-none">{money(calculateWorkItemCost(room))}</p>
                        </div>
                        {(room.demo || room.trim || room.paint) && (
                          <div className="flex flex-wrap gap-2 mt-2.5 pt-2.5 border-t border-slate-700/60">
                            {room.demo && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Demo</span>}
                            {room.trim && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Trim</span>}
                            {room.paint && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Paint</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tasks.length > 0 && (
                <div>
                  <h4 className="stat-label mb-2.5">Task-based items</h4>
                  <div className="space-y-2.5">
                    {tasks.map((task) => (
                      <div key={task.id} className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/60">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <p className="text-slate-100 font-medium">{task.name}</p>
                            {task.description && <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>}
                            <p className="text-xs text-slate-400 mt-0.5">
                              Materials: {money(task.materialCost)} + Labor: {money(task.laborCost)}
                            </p>
                          </div>
                          <p className="text-primary font-semibold flex-none">{money(calculateWorkItemCost(task))}</p>
                        </div>
                        {(task.disposal || task.delivery) && (
                          <div className="flex flex-wrap gap-2 mt-2.5 pt-2.5 border-t border-slate-700/60">
                            {task.disposal && <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">Disposal</span>}
                            {task.delivery && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Delivery</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Cost breakdown */}
        <section className="card p-6 mb-6">
          <h3 className="font-display text-[1.4rem] leading-none mb-4">Cost breakdown</h3>
          <div className="space-y-2.5 text-[0.95rem]">
            <div className="flex justify-between py-1">
              <span className="text-slate-300">Subtotal</span>
              <span className="text-slate-100 font-semibold">{money(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-800">
              <span className="text-slate-300">Markup ({isDraft ? (parseFloat(form.markup) || 0) : (doc.markup != null ? doc.markup : 0)}%)</span>
              <span className="text-primary font-semibold">{money(totals.markupAmount)}</span>
            </div>
            {!!doc.taxEnabled && (
              <div className="flex justify-between py-1 border-t border-slate-800">
                <span className="text-slate-300">Tax ({doc.taxRate}%)</span>
                <span className="text-green-400 font-semibold">{money(totals.taxAmount)}</span>
              </div>
            )}
            {Number(totals.discount) > 0 && (
              <div className="flex justify-between py-1 border-t border-slate-800">
                <span className="text-slate-300">Discount</span>
                <span className="text-red-400 font-semibold">-{money(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-primary/30">
              <span className="text-slate-100 font-semibold">Total</span>
              <span className="font-display text-[1.7rem] leading-none text-primary">{money(totals.total)}</span>
            </div>
          </div>
          {!isDraft && doc.notes && (
            <div className="mt-5 pt-4 border-t border-slate-800">
              <p className="stat-label mb-1.5">Notes</p>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{doc.notes}</p>
            </div>
          )}
        </section>

        {/* Revisions */}
        {revisions.length > 0 && (
          <section className="card p-6">
            <h3 className="font-display text-[1.4rem] leading-none mb-4">Earlier versions</h3>
            <ul className="divide-y divide-slate-800">
              {revisions.map((rev) => {
                const revDate = formatDate(rev.createdAt);
                return (
                  <li key={rev.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-semibold text-slate-100">Version {rev.version}</span>
                      <span className={`text-[0.7rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${QUOTE_STATUS_STYLES[rev.status] || QUOTE_STATUS_STYLES.draft}`}>
                        {rev.status}
                      </span>
                      <span className="text-sm text-slate-400">
                        {money(rev.total)}{revDate ? ` · ${revDate}` : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => downloadIssuedPdf(rev.version)}
                      disabled={pdfBusy}
                      className="btn-ghost !min-h-[38px] text-sm disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
