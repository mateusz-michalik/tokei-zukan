import { describe, expect, test } from 'vitest';
import indexHtml from '../../index.html?raw';
import { CATALOG } from '../catalog';
import { homeShare, notFoundShare, previewImage, previewSVG, shareHead, sharePages, SITE, watchShare, withShareHead } from './share';
import { parseRoute } from './route';

const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

describe('link previews', () => {
  test("index.html's tags are the home page's, so the root preview never drifts from the code", () => {
    const block = indexHtml.slice(indexHtml.indexOf('<!-- share:start -->'), indexHtml.indexOf('<!-- share:end -->'));
    expect(block).toContain(shareHead(homeShare));
  });
  test('every catalogue watch gets its details and wrist pages, at addresses that open that watch', () => {
    const pages = sharePages();
    expect(new Set(pages.map(p => p.file)).size).toBe(pages.length);
    for (const w of CATALOG) {
      const mine = pages.filter(p => p.share.image === previewImage(w));
      expect(mine, w.id).toHaveLength(3);
      for (const { file, share } of mine) {
        // The file serves the address it describes, and that address opens this watch.
        expect(share.url, file).toBe(SITE + '/' + file.replace(/(\/index)?\.html$/, ''));
        expect(parseRoute(share.url!.slice(SITE.length)), file).toMatchObject({ watchId: w.id });
        expect(share.heading).toContain(w.ref);
      }
    }
    expect(pages.at(-1)).toEqual({ file: 'watch-not-found.html', share: notFoundShare });
  });
  test('a page gets one of each tag, with absolute addresses and escaped text', () => {
    const w = CATALOG.find(c => c.id === 'seiko-srpb43')!;
    const html = withShareHead(indexHtml, { ...watchShare(w, 'detail'), description: 'Say "hi" & <b>' });
    for (const re of [/<title>/g, /name="description"/g, /rel="canonical"/g, /property="og:image"/g, /property="og:url"/g, /name="twitter:card"/g])
      expect(count(html, re), String(re)).toBe(1);
    expect(html).toContain('<link rel="canonical" href="https://www.tokeizukan.com/watches/seiko-srpb43">');
    expect(html).toContain('content="https://www.tokeizukan.com/share/seiko-srpb43.jpg"');
    expect(html).toContain('content="Say &quot;hi&quot; &amp; &lt;b&gt;"');
    expect(html).toContain('<title>Seiko SRPB43 · Tokei Zukan</title>');
    // The app itself is untouched.
    expect(html).toContain('<script type="module"');
    expect(() => withShareHead('<html></html>', homeShare)).toThrow();
  });
  test("an unknown watch's page claims no watch and stays out of search results", () => {
    const head = shareHead(notFoundShare);
    expect(head).toContain('<meta name="robots" content="noindex">');
    expect(head).not.toContain('canonical');
    expect(head).not.toContain('og:url');
    for (const w of CATALOG) expect(head).not.toContain(w.ref);
  });
  test('each preview image is a 1200 × 630 drawing of its watch', () => {
    for (const w of CATALOG) {
      const svg = previewSVG(w);
      expect(svg, w.id).toMatch(/^<svg [^>]*width="1200" height="630"/);
      expect(svg, w.id).toContain(`aria-label="${w.brand} ${w.ref} illustration"`.replace(/&/g, '&amp;'));
      expect(svg, w.id).not.toMatch(/NaN|undefined/);
    }
  });
});
