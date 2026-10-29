import { catalogById } from '../catalog';
import type { UserState } from '../store/types';

/**
 * The address bar mirrors what's on screen: /watches/<slug> for a watch's details, /watches/<slug>/wrist for it on
 * the wrist, /compare and /owned. Only public catalogue watches get addresses, and nothing personal goes in them: the
 * owned screen's address is the same for everyone, and its contents stay in the visitor's browser.
 */
export type Route =
  | { view: 'detail' | 'wrist'; watchId: string }
  | { view: 'compare' }
  | { view: 'owned' }
  | { view: 'home' }
  | { view: 'not-found' };

// Public addresses that differ from the stored id. The Oris kept the id of the three-hander it replaced, so saved
// lists still match it, but its address names the chronograph it actually is.
const SLUGS: Record<string, string> = { 'oris-01-733-7707': 'oris-01-771-7791' };
const IDS = Object.fromEntries(Object.entries(SLUGS).map(([id, slug]) => [slug, id]));

export const slugFor = (watchId: string) => SLUGS[watchId] ?? watchId;

/** The catalogue watch an address names, accepting its stored id too. A malformed escape names nothing. */
const watchFor = (raw: string) => {
  let slug: string;
  try { slug = decodeURIComponent(raw); } catch { return undefined; }
  const id = IDS[slug] ?? slug;
  return catalogById.has(id) ? id : undefined;
};

export function parseRoute(pathname: string): Route {
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length) return { view: 'home' };
  if (parts.length === 1 && parts[0] === 'compare') return { view: 'compare' };
  if (parts.length === 1 && parts[0] === 'owned') return { view: 'owned' };
  if (parts[0] === 'watches' && (parts.length === 2 || (parts.length === 3 && parts[2] === 'wrist'))) {
    const watchId = watchFor(parts[1]);
    if (watchId) return { view: parts[2] ? 'wrist' : 'detail', watchId };
  }
  return { view: 'not-found' };
}

/** The address for a watch, or for the list when it isn't a public catalogue watch. */
export const watchPath = (watchId: string, view: 'detail' | 'wrist' = 'detail') =>
  catalogById.has(watchId) ? `/watches/${slugFor(watchId)}${view === 'wrist' ? '/wrist' : ''}` : '/';

/** The address for what the state shows. */
export function pathFor(s: UserState) {
  if (s.tab === 'compare') return '/compare';
  if (s.tab === 'owned') return '/owned';
  if (s.tab === 'wrist') return watchPath(s.wrist.watchId || s.selectedId, 'wrist');
  return watchPath(s.selectedId);
}

/** Shows what an address names. The home address leaves the saved view as it is. */
export function applyRoute(s: UserState, r: Route) {
  if (r.view === 'compare') s.tab = 'compare';
  if (r.view === 'owned') s.tab = 'owned';
  if (r.view === 'detail' || r.view === 'wrist') {
    s.tab = r.view;
    s.selectedId = r.watchId;
    s.wrist.watchId = r.watchId;
  }
}
