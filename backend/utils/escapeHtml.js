/**
 * Minimal HTML escaping for values interpolated into HTML output
 * (e.g. the quote email body). Every caller-supplied value that lands in
 * markup must pass through this first (Pass Two — email endpoint lockdown).
 */

const escapeHtml = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Strip CR/LF so a value can be used safely in an email header
 * (subject line) without enabling header injection.
 */
const sanitizeHeaderValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/[\r\n]+/g, ' ').trim();
};

module.exports = {
  escapeHtml,
  sanitizeHeaderValue
};
