import type { CatalogWatch } from '../catalog/schema';

type Named = Pick<CatalogWatch, 'brand' | 'model' | 'ref'>;

/**
 * Page titles. The app sets them as visitors move around (App.tsx) and the build writes them into each watch page's
 * initial HTML (share.ts), so both take them from here and a search result names the same page a visitor sees.
 */

export const SITE_NAME = 'Tokei Zukan';
export const HOME_TITLE = `${SITE_NAME} · Compare Watches to Scale`;

/**
 * "Seiko Presage Cocktail Time SRPB43", leaving out whichever of the model and reference the other already includes:
 * "Casio F-91W-1", not "Casio F-91W F-91W-1".
 */
export const fullName = (w: Named) => [w.brand, w.ref.includes(w.model) ? '' : w.model, w.model.includes(w.ref) ? '' : w.ref].filter(Boolean).join(' ');

/** "Seiko Presage Cocktail Time SRPB43 · Tokei Zukan", or "… on the wrist · Tokei Zukan". */
export const watchTitle = (w: Named, view: 'detail' | 'wrist' = 'detail') =>
  `${fullName(w)}${view === 'wrist' ? ' on the wrist' : ''} · ${SITE_NAME}`;

/** Any other page: "Compare · Tokei Zukan", or the home title for none. */
export const pageTitle = (page?: string) => (page ? `${page} · ${SITE_NAME}` : HOME_TITLE);
