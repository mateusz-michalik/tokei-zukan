import { describe, expect, test } from 'vitest';
import indexHtml from '../../index.html?raw';
import { faviconFor } from './theme';

const publicFiles = Object.keys(import.meta.glob('/public/*.svg', { query: '?raw' })).map(p => p.replace('/public', ''));

describe('theme favicon', () => {
  test('light and dark pages each have their own icon file', () => {
    expect(faviconFor(false)).not.toBe(faviconFor(true));
    for (const dark of [false, true]) expect(publicFiles).toContain(faviconFor(dark));
  });
  test("index.html's pre-paint script swaps the same one link the app does", () => {
    expect(indexHtml.match(/id="favicon"/g)).toHaveLength(1);
    expect(indexHtml).toContain(`dark ? '${faviconFor(true)}' : '${faviconFor(false)}'`);
    // Without JavaScript the link keeps dusk-lume, like the ICO fallback.
    expect(indexHtml).toContain(`<link rel="icon" href="${faviconFor(true)}" type="image/svg+xml" id="favicon">`);
  });
});
