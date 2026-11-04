/**
 * Quote API client — Pass 10 (Durable Quote Ledger).
 *
 * Quotes are durable server-side records: every estimate the wizard
 * builds is persisted through these endpoints, and the /quotes ledger
 * plus /quotes/:id detail page read them back. Plain fetch, same style
 * as pages/Leads.jsx and pages/Command.jsx — the app's global fetch
 * interceptor attaches the auth token.
 *
 * Every helper throws an Error carrying the server's message on
 * !success (with `code` / `status` attached when the server sent them,
 * e.g. 409 REVISION_REQUIRED when a non-draft quote is edited).
 */

import { API_BASE_URL } from '../config/env';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || !data.success) {
    const error = new Error((data && data.error) || `Request failed (${res.status})`);
    error.code = (data && data.code) || null;
    error.status = res.status;
    throw error;
  }
  return data;
}

/** GET /api/quotes?status=&search= — list rows carry no `data` doc. */
export async function listQuotes({ status, search } = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  if (search) params.set('search', search);
  const query = params.toString();
  const data = await request(`/api/quotes${query ? `?${query}` : ''}`);
  return data.quotes;
}

/** GET /api/quotes/:id — full quote incl. `data` doc + revisions. */
export async function getQuote(id) {
  const data = await request(`/api/quotes/${id}`);
  return data.quote;
}

/** POST /api/quotes — creates a draft quote, returns it (with quoteNumber). */
export async function createQuote(payload) {
  const data = await request('/api/quotes', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.quote;
}

/** PUT /api/quotes/:id — drafts only; non-drafts throw 409 REVISION_REQUIRED. */
export async function updateQuote(id, payload) {
  const data = await request(`/api/quotes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return data.quote;
}

/** DELETE /api/quotes/:id — drafts only. */
export async function deleteQuote(id) {
  return request(`/api/quotes/${id}`, { method: 'DELETE' });
}

/**
 * POST /api/quotes/:id/status — walk the lifecycle. Marking `sent`
 * freezes an immutable snapshot server-side. `viewed` is never settable
 * through the API (the server 400s it).
 */
export async function setQuoteStatus(id, status) {
  const data = await request(`/api/quotes/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status })
  });
  return data.quote;
}

/**
 * POST /api/quotes/:id/revise — for a non-draft, non-archived quote:
 * freezes the outgoing version and returns the quote as a draft at
 * version + 1.
 */
export async function reviseQuote(id) {
  const data = await request(`/api/quotes/${id}/revise`, { method: 'POST' });
  return data.quote;
}

/**
 * GET /api/quotes/:id/pdf-data?version= — the FROZEN snapshot in the
 * QuotePDF data shape (plus quoteNumber/version/company/etc. fields
 * QuotePDF ignores). Throws when no snapshot exists (never sent).
 */
export async function getQuotePdfData(id, version) {
  const query = version ? `?version=${version}` : '';
  const data = await request(`/api/quotes/${id}/pdf-data${query}`);
  return data.pdfData;
}

/** POST /api/quotes/:id/project — project from the quote (or the linked one). */
export async function createQuoteProject(id) {
  const data = await request(`/api/quotes/${id}/project`, { method: 'POST' });
  return data.project;
}

/**
 * Build the POST/PUT payload from the wizard's working state. The `data`
 * doc mirrors exactly what EstimateSummaryStep builds for /result:
 * projectInfo, workItems, rooms (type 'room' subset), totals as held in
 * wizard state.
 */
export function buildQuotePayloadFromWizard(wizardData) {
  const workItems = wizardData.workItems || [];
  const data = {
    projectInfo: {
      clientName: wizardData.clientName || '',
      jobType: wizardData.jobType || '',
      email: wizardData.email || '',
      phone: wizardData.phone || '',
      address: wizardData.address || '',
      date: new Date().toLocaleDateString()
    },
    workItems,
    rooms: workItems.filter((item) => item.type === 'room'),
    markup: wizardData.markup ?? 15,
    taxEnabled: !!wizardData.taxEnabled,
    taxRate: wizardData.taxRate || 0,
    discount: wizardData.discount || 0,
    subtotal: wizardData.subtotal ?? 0,
    markupAmount: wizardData.markupAmount ?? 0,
    taxAmount: wizardData.taxAmount ?? 0,
    total: wizardData.total ?? 0,
    notes: wizardData.notes || '',
    estimateType: 'New Estimate'
  };
  return {
    customerName: wizardData.clientName || '',
    customerEmail: wizardData.email || '',
    customerPhone: wizardData.phone || '',
    address: wizardData.address || '',
    jobType: wizardData.jobType || '',
    data
  };
}

/**
 * Build the POST/PUT payload from /result route state. The state IS the
 * quote `data` doc (projectInfo, workItems, rooms, totals, notes…);
 * customer fields are lifted out of projectInfo, and quoteId is peeled
 * off so it never lands inside the stored doc.
 */
export function buildQuotePayloadFromResultState(state) {
  const { quoteId, ...data } = state || {};
  const projectInfo = data.projectInfo || {};
  const payload = {
    customerName: projectInfo.clientName || '',
    customerEmail: projectInfo.email || '',
    customerPhone: projectInfo.phone || '',
    address: projectInfo.address || '',
    jobType: projectInfo.jobType || '',
    data
  };
  if (data.leadId) payload.leadId = data.leadId;
  if (data.projectId) payload.projectId = data.projectId;
  return payload;
}

export default {
  listQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
  setQuoteStatus,
  reviseQuote,
  getQuotePdfData,
  createQuoteProject,
  buildQuotePayloadFromWizard,
  buildQuotePayloadFromResultState
};
