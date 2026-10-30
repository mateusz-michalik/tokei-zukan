import { describe, expect, test } from 'vitest';
import { CATALOG } from '../catalog';
import type { Night } from '../catalog/schema';
import { dimColours, nightify } from './night';
import { watchSVG } from './watch';
import { wristSVG } from './wrist';

const night: Night = { glow: '#7CFF9A', parts: ['hands', 'indices'], partGlow: { indices: '#8FD8FF' }, certainty: 'documented' };
const allParts: Night = { glow: '#7CFF9A', parts: ['hands', 'indices', 'bezel', 'seconds', 'subdials'], certainty: 'documented' };

describe('night drawing', () => {
  test('colours dim towards dark blue without inverting, and ids are left alone', () => {
    expect(dimColours('<a fill="#ffffff" stroke="#000"/>')).toBe('<a fill="#494c54" stroke="#070a12"/>');
    expect(dimColours('<a fill="url(#w12abc)" href="#w3bad"/>')).toBe('<a fill="url(#w12abc)" href="#w3bad"/>');
  });
  test('only tagged parts the watch has lume on glow, each in its own colour', () => {
    const svg = nightify('<path fill="#fff" data-lume="hands"/><g fill="url(#w1lu)" data-lume="indices" stroke="#888"><path/></g><circle fill="#fff" data-lume="bezel"/><path fill="#fff"/>', night);
    expect(svg).toContain('<path fill="#7CFF9A" data-lume="hands" filter="url(#lume');
    expect(svg).toContain('<g fill="#8FD8FF" stroke="#2a2d35" data-lume="indices" filter="url(#lume');
    // The bezel pip isn't lumed on this watch, so it stays as dim as any other white.
    expect(svg).toContain('<circle fill="#494c54" data-lume="bezel"/>');
    expect(svg.match(/<filter /g)).toHaveLength(1);
  });
  test('lume drawn as a line glows through its stroke', () => {
    expect(nightify('<line stroke="#fff" fill="none" data-lume="seconds"/>', allParts)).toContain('stroke="#7CFF9A"');
  });
  test('without lume information everything just dims', () => {
    const svg = nightify('<path fill="#fff" data-lume="hands"/>');
    expect(svg).not.toContain('filter=');
    expect(svg).not.toContain('#fff"');
  });
  test('a watch recorded as having no lume just dims', () => {
    const svg = nightify('<path fill="#fff" data-lume="hands"/>', { parts: [], certainty: 'documented' });
    expect(svg).not.toContain('filter=');
  });
  test('every watch draws cleanly at night with unique ids, inside the size budget', () => {
    for (const w of CATALOG) {
      const svg = watchSVG({ ...w, night: allParts }, 8, { strapLen: 12, lighting: 'night' });
      expect(svg, w.id).not.toMatch(/NaN|undefined|Infinity/);
      // A watch with no lume, such as the SRPB43, has no lume shapes to tag.
      if (w.night?.parts.length !== 0) expect(svg, w.id).toContain('data-lume="hands" filter=');
      const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
      expect(ids.filter((x, i) => ids.indexOf(x) !== i), w.id).toEqual([]);
      expect((svg.match(/<[a-zA-Z]/g) ?? []).length, w.id).toBeLessThan(330);
      expect(new TextEncoder().encode(svg).length, w.id).toBeLessThan(56_000);
    }
  });
  test('several watches on one page never share a glow filter', () => {
    const [a, b] = CATALOG.map(w => watchSVG({ ...w, night: allParts }, 8, { lighting: 'night' }));
    const id = (s: string) => s.match(/<filter id="([^"]+)"/)![1];
    expect(id(a)).not.toBe(id(b));
  });
  test.each(['seiko-spb451', 'seiko-spb317'])("the %s's printed date isn't lume, so it never glows", id => {
    const w = CATALOG.find(c => c.id === id)!;
    const svg = watchSVG({ ...w, night: allParts }, 8, { lighting: 'night' });
    expect(svg).toMatch(/fill="#[0-9a-f]{6}">6<\/text>/);
  });
  test('dusk dims less and lets the lume show part-way between its glow and the dimmed paint', () => {
    expect(dimColours('<a fill="#ffffff"/>', 'dusk')).toBe('<a fill="#999ba2"/>');
    const svg = nightify('<path fill="#ffffff" data-lume="hands"/>', night, 'dusk');
    const [r, g, b] = svg.match(/fill="#(\w\w)(\w\w)(\w\w)" data-lume/)!.slice(1).map(h => parseInt(h, 16));
    expect(g).toBeGreaterThan(r);
    expect([r, g, b]).not.toEqual([0x7c, 0xff, 0x9a]);
    expect(svg).toContain('slope="0.45"');
  });
  test('daylight draws exactly as before', () => {
    const w = { ...CATALOG[0], night: allParts };
    expect(watchSVG(w, 8, { lighting: 'day' }).replace(/w\d+/g, '')).toBe(watchSVG(w, 8).replace(/w\d+/g, ''));
  });
  test('outlines never dim, and the wrist keeps readable guides and its comparison outline', () => {
    const w = CATALOG[0];
    expect(watchSVG(w, 8, { outline: true, color: '#C8581A', lighting: 'night' })).toContain('#C8581A');
    const svg = wristSVG({ ...w, night: allParts }, 17, CATALOG[1], { lighting: 'night' });
    expect(svg).toContain('fill="#C9C7C0">flat top');
    expect(svg).toContain('stroke="#B4432B"');
    expect(svg).toContain('data-lume="hands" filter=');
    expect(svg).not.toContain('#EADACB');
  });
});
