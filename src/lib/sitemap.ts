import { CATALOG } from '../catalog';
import { watchPath } from './route';
import { SITE } from './share';

/**
 * Search engine files, written to dist/ by `npm run build` (scripts/share-previews.mjs). Files in dist/ are served
 * before vercel.json's catch-all rewrite, so these replace the home page that /sitemap.xml and /robots.txt used to get.
 */

/**
 * The home page and each catalogue watch's details page, at its canonical address. Wrist views, compare, owned and
 * old addresses (the Oris's stored id) are left out: they repeat a page that's already listed.
 */
export const sitemapURLs = () => [`${SITE}/`, ...CATALOG.map(w => SITE + watchPath(w.id))];

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const sitemapXML = () => [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapURLs().map(u => `  <url><loc>${xml(u)}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

/** Everything is open to crawlers, the scripts, styles and images that render the pages included. */
export const robotsTXT = () => `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
