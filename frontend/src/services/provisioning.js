/**
 * Provisioning Service (live fixes, 2026-11-02)
 *
 * The backend scopes every data route to a provisioned account and
 * answers 403 until the Clerk identity has a User row. Provisioning
 * happens via POST /api/users/sync (or the Clerk webhook). Until this
 * module existed, NOTHING in the frontend ever called sync — so a user
 * who signed up before the webhook was configured stayed unprovisioned
 * forever and data pages like Receipts failed with "Failed to load".
 *
 * This module is the single place that:
 *   1. calls POST /api/users/sync exactly once per signed-in user, then
 *   2. reads GET /api/users/me and caches { user, contractorAccount,
 *      setupCompleted } for the session.
 *
 * Pass Six: there is no step 3 — no setup call exists. Provisioning
 * creates the account ready-to-use on the server, so setupCompleted
 * always comes back true for a provisioned user and nothing in the
 * frontend acts on it beyond caching it.
 *
 * The Clerk token is attached by the global fetch interceptor
 * (services/apiAuthInterceptor.js, installed in index.js).
 */

import { API_BASE_URL } from '../config/env';

let cache = {
  clerkUserId: null,
  promise: null,
  state: null
};

function applyMeResponse(data) {
  cache.state = {
    user: data,
    contractorAccount: data?.contractorAccount || null,
    setupCompleted: Boolean(data?.setupCompleted)
  };
  return cache.state;
}

/**
 * Ensure the signed-in user is provisioned and return their state.
 * Safe to call from every protected render: the sync+me round-trip
 * happens once per Clerk user per session; later calls hit the cache.
 */
export function ensureProvisioned(clerkUserId) {
  if (!clerkUserId) {
    return Promise.reject(new Error('No signed-in user to provision'));
  }
  if (cache.clerkUserId === clerkUserId && cache.promise) {
    return cache.promise;
  }

  cache = { clerkUserId, promise: null, state: null };
  cache.promise = (async () => {
    const syncResponse = await fetch(`${API_BASE_URL}/api/users/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
    if (!syncResponse.ok) {
      // Allow a later retry (e.g. the gate's Retry button).
      cache.promise = null;
      throw new Error(`Account sync failed (${syncResponse.status})`);
    }

    const meResponse = await fetch(`${API_BASE_URL}/api/users/me`);
    if (!meResponse.ok) {
      cache.promise = null;
      throw new Error(`Account load failed (${meResponse.status})`);
    }
    const meBody = await meResponse.json();
    if (!meBody.success) {
      cache.promise = null;
      throw new Error(meBody.error || 'Account load failed');
    }
    return applyMeResponse(meBody.data);
  })();

  return cache.promise;
}

/** The cached provisioning state, or null if not loaded yet. */
export function getProvisioningState() {
  return cache.state;
}

/** Forget the cached state (e.g. on sign-out / account switch). */
export function resetProvisioning() {
  cache = { clerkUserId: null, promise: null, state: null };
}

export default ensureProvisioned;
