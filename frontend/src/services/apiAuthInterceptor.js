/**
 * API Auth Interceptor
 *
 * Pass Two (lockdown): the backend now requires a verified Clerk token on
 * every API route. Most of the frontend calls the API with bare fetch()
 * and no Authorization header, so this interceptor wraps window.fetch
 * once at startup and attaches the current Clerk session token to any
 * request aimed at the AlphaQuote API.
 *
 * Requests that are not aimed at the API, and requests that already carry
 * an Authorization header, pass through untouched.
 */

import { API_BASE_URL, SCRAPER_URL } from '../config/env';

const originalFetch = window.fetch.bind(window);

let installed = false;

export function installApiAuthInterceptor() {
  if (installed) return;
  installed = true;

  window.fetch = async (input, init = {}) => {
    try {
      const url = typeof input === 'string' ? input : input && input.url;
      // The price scraper service requires the same Clerk auth since the
      // Pass Two finish, so its URL is treated as an API request too.
      const isApiRequest =
        typeof url === 'string' &&
        (url.startsWith(API_BASE_URL) ||
          url.startsWith(SCRAPER_URL) ||
          url.startsWith('/api'));

      if (isApiRequest) {
        const headers = new Headers(
          init.headers || (typeof input !== 'string' ? input.headers : undefined)
        );

        if (!headers.has('Authorization')) {
          const token = window.Clerk?.session
            ? await window.Clerk.session.getToken()
            : null;
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
        }

        init = { ...init, headers };
      }
    } catch (error) {
      // Never let token attachment break the request itself; the API will
      // answer 401 if the token is missing or invalid.
      console.warn('API auth interceptor: could not attach token', error);
    }

    return originalFetch(input, init);
  };
}

export default installApiAuthInterceptor;
