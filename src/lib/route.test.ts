import { describe, expect, test } from 'vitest';
import { CATALOG } from '../catalog';
import { starterState } from '../store/state';
import { applyRoute, parseRoute, pathFor, watchPath } from './route';

describe('routes', () => {
  test('every catalogue watch has a unique address that leads back to it', () => {
    const paths = CATALOG.map(c => watchPath(c.id));
    expect(new Set(paths).size).toBe(CATALOG.length);
    for (const c of CATALOG) {
      expect(parseRoute(watchPath(c.id))).toEqual({ view: 'detail', watchId: c.id });
      expect(parseRoute(watchPath(c.id, 'wrist'))).toEqual({ view: 'wrist', watchId: c.id });
    }
  });
  test("the Oris's address names the chronograph; its stored id still opens it", () => {
    expect(watchPath('oris-01-733-7707')).toBe('/watches/oris-01-771-7791');
    expect(parseRoute('/watches/oris-01-733-7707')).toEqual({ view: 'detail', watchId: 'oris-01-733-7707' });
  });
  test('home, compare and trailing slashes', () => {
    expect(parseRoute('/')).toEqual({ view: 'home' });
    expect(parseRoute('/compare/')).toEqual({ view: 'compare' });
    expect(parseRoute('/watches/seiko-spb257/')).toEqual({ view: 'detail', watchId: 'seiko-spb257' });
  });
  test('anything else is not found rather than some other watch', () => {
    for (const p of ['/watches/seiko-spb999', '/watches', '/watches/seiko-spb257/photos', '/watch/seiko-spb257', '/watches/%E0%A4%A', '/compare/x'])
      expect(parseRoute(p)).toEqual({ view: 'not-found' });
  });
  test("browser-only custom watches don't get an address", () => {
    expect(watchPath('custom-1')).toBe('/');
    expect(parseRoute('/watches/custom-1')).toEqual({ view: 'not-found' });
  });
  test('an address wins over the saved selection, and the state gives back the same address', () => {
    const s = starterState();
    s.selectedId = 'seiko-spb317';
    s.tab = 'compare';
    applyRoute(s, parseRoute('/watches/serica-5303-1'));
    expect([s.tab, s.selectedId, s.wrist.watchId]).toEqual(['detail', 'serica-5303-1', 'serica-5303-1']);
    expect(pathFor(s)).toBe('/watches/serica-5303-1');
    applyRoute(s, parseRoute('/watches/seiko-srpk01/wrist'));
    expect(pathFor(s)).toBe('/watches/seiko-srpk01/wrist');
    applyRoute(s, parseRoute('/owned'));
    expect([pathFor(s), s.tab]).toEqual(['/owned', 'owned']);
    applyRoute(s, parseRoute('/compare'));
    expect([pathFor(s), s.selectedId]).toEqual(['/compare', 'seiko-srpk01']);
    // The bare address keeps whatever was saved.
    applyRoute(s, parseRoute('/'));
    expect(s.tab).toBe('compare');
  });
});
