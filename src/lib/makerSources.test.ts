import { describe, expect, test } from 'vitest';
import { CATALOG } from '../catalog';
import { starterState } from '../store/state';
import { archivedPage, isMakerUrl, MAKER_DOMAINS } from './makerSources';

describe('maker domains', () => {
  test('accept the maker, its subdomains and Wayback captures of it', () => {
    expect(isMakerUrl('Casio', 'https://www.casio.com/jp/watches/casio/product.F-91W-1/')).toBe(true);
    expect(isMakerUrl('Tudor', 'https://media.tudorwatch.com/press.pdf')).toBe(true);
    expect(isMakerUrl('Seiko', 'https://web.archive.org/web/20220608234317/https://seikousa.com/products/ssk003')).toBe(true);
    expect(archivedPage('https://web.archive.org/web/2020/https:/seikousa.com/x')).toBe('https://seikousa.com/x');
  });
  test('reject shops, marketplaces, the press, lookalikes and other brands', () => {
    for (const url of [
      'https://www.chrono24.com.au/search/index.htm?query=SPB257',
      'https://www.shopcasio.shriro.com.au/products/f91w-1',
      'https://timeandtidewatches.com/?p=68586',
      'https://casio.com.example.net/f91w',
      'https://notcasio.com/f91w',
      'https://web.archive.org/web/2020/https://watchdirect.com.au/products/x',
      'javascript:alert(1)',
      'not a url',
    ]) expect(isMakerUrl('Casio', url), url).toBe(false);
    expect(isMakerUrl('Seiko', 'https://www.rolex.com/watches/submariner/m124060-0001')).toBe(false);
    expect(isMakerUrl('Unlisted', 'https://www.casio.com/')).toBe(false);
  });
});

describe('links the site shows', () => {
  test("every catalogue brand has its maker's domains listed", () => {
    for (const w of CATALOG) expect(MAKER_DOMAINS[w.brand], w.brand).toBeDefined();
  });
  test("every catalogue watch link goes to that watch's maker", () => {
    for (const w of CATALOG) for (const l of w.links ?? []) expect(isMakerUrl(w.brand, l.url), `${w.id}: ${l.url}`).toBe(true);
  });
  test("every price marked as the maker's is cited from the maker", () => {
    // Press releases and reports may be hosted elsewhere; the details page shows those without a link.
    const makers = ['manufacturer', 'archived-manufacturer', 'manufacturer-converted'];
    for (const w of CATALOG) for (const p of w.prices ?? []) {
      if (makers.includes(p.sourceType)) expect(isMakerUrl(w.brand, p.source), `${w.id}: ${p.source}`).toBe(true);
    }
  });
  test('the starter list links nowhere', () => {
    for (const e of starterState().shortlist) expect(e.links, e.watchId).toBeUndefined();
  });
});
