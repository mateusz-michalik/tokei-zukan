/**
 * Cloudflare Web Analytics: aggregate visit and page-speed counts, nothing more. It loads only when both settings are
 * present at build time and the page is on the production hostname, so local development, Vercel previews and
 * contributors' builds never report. Setup and how to turn it off: docs/analytics.md.
 */
const BEACON = 'https://static.cloudflareinsights.com/beacon.min.js';

export function analyticsEnabled(hostname = location.hostname) {
  const { VITE_CF_ANALYTICS_TOKEN: token, VITE_ANALYTICS_HOST: host } = import.meta.env;
  return !!token && !!host && hostname === host;
}

/**
 * Adds Cloudflare's beacon once. Its built-in single-page-app support records each address change the app makes
 * (pushState and Back/Forward), so there's no page-view code of our own. If the beacon is blocked, nothing breaks.
 */
export function startAnalytics() {
  if (!analyticsEnabled() || document.querySelector(`script[src="${BEACON}"]`)) return;
  // Matches Cloudflare's current snippet, which loads the beacon as a module script.
  const s = document.createElement('script');
  s.type = 'module';
  s.src = BEACON;
  s.dataset.cfBeacon = JSON.stringify({ token: import.meta.env.VITE_CF_ANALYTICS_TOKEN });
  document.body.appendChild(s);
}
