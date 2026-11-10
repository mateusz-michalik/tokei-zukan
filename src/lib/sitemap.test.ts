import { describe, expect, test } from 'vitest';
import { CATALOG } from '../catalog';
import { parseRoute, watchPath } from './route';
import { sharePages, SITE, watchShare } from './share';
import { robotsTXT, sitemapURLs, sitemapXML } from './sitemap';
import { fullName, HOME_TITLE, pageTitle, watchTitle } from './titles';

describe('search engines', () => {
  test('the sitemap lists the home page and every watch once, at the address its page calls canonical', () => {
    const urls = sitemapURLs();
    expect(urls[0]).toBe('https://www.tokeizukan.com/');
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toHaveLength(CATALOG.length + 1);
    for (const w of CATALOG) expect(urls, w.id).toContain(watchShare(w, 'detail').url);
    for (const u of urls.slice(1)) {
      expect(u.startsWith(`${SITE}/watches/`), u).toBe(true);
      expect(parseRoute(u.slice(SITE.length)), u).toMatchObject({ view: 'detail' });
      // The build writes a page for it, so it doesn't fall through to the not-found rewrite.
      expect(sharePages().some(p => p.file === `${u.slice(SITE.length + 1)}.html`), u).toBe(true);
    }
    // No wrist views or old addresses.
    expect(urls.some(u => u.endsWith('/wrist'))).toBe(false);
    expect(urls).not.toContain(`${SITE}/watches/oris-01-733-7707`);
  });
  test('the sitemap is sitemap XML with one <url> per address', () => {
    const xml = sitemapXML();
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\n/);
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
    expect([...xml.matchAll(/<url><loc>([^<]*)<\/loc><\/url>/g)].map(m => m[1])).toEqual(sitemapURLs());
    // Watch slugs are plain, so nothing needs escaping or leaves the URL character set.
    for (const u of sitemapURLs()) expect(u, u).toMatch(/^https:\/\/www\.tokeizukan\.com\/[a-z0-9\/-]*$/);
  });
  test('robots.txt allows everything and points to the sitemap', () => {
    expect(robotsTXT()).toBe('User-agent: *\nAllow: /\n\nSitemap: https://www.tokeizukan.com/sitemap.xml\n');
  });
});

describe('page titles', () => {
  test('say what the site is and name each watch in full', () => {
    expect(HOME_TITLE).toBe('Tokei Zukan · Compare Watches to Scale');
    expect(pageTitle()).toBe(HOME_TITLE);
    expect(pageTitle('Compare')).toBe('Compare · Tokei Zukan');
    const seiko = CATALOG.find(w => w.id === 'seiko-srpb43')!;
    expect(watchTitle(seiko)).toBe('Seiko Presage Cocktail Time SRPB43 · Tokei Zukan');
    expect(watchTitle(seiko, 'wrist')).toBe('Seiko Presage Cocktail Time SRPB43 on the wrist · Tokei Zukan');
    for (const w of CATALOG) {
      expect(watchTitle(w), w.id).toContain(w.brand);
      expect(watchTitle(w), w.id).toContain(w.ref);
      expect(watchShare(w, 'detail').title, w.id).toBe(`${fullName(w)} · Tokei Zukan`);
      expect(watchPath(w.id), w.id).not.toBe('/');
    }
  });
});
