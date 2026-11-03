import { describe, expect, test } from 'vitest';
import { CATALOG } from '../catalog';
import { a168Case, A168_SAMPLE } from './a168';
import { f91wCase, F91W_SAMPLE } from './f91w';
import { GHOST, GLYPHS, lcdChars, segmentPaths } from './lcd';
import { watchSVG } from './watch';

const at = (y: number, mo: number, d: number, h: number, mi: number, s: number) => new Date(y, mo - 1, d, h, mi, s);
const shown = (c: Record<string, string>) => `${c['day-1']}${c['day-2']} ${c['date-tens']}${c.date} ${c['hour-tens']}${c.hour}:${c['minute-tens']}${c.minute} ${c['second-tens']}${c.second}${c.pm ? ' PM' : ''}`;

describe('digital displays', () => {
  test('12-hour time drops the leading zero and lights PM in the afternoon', () => {
    expect(shown(lcdChars(F91W_SAMPLE))).toBe('SU 30 10:58 50 PM');
    expect(shown(lcdChars(at(2026, 11, 2, 0, 5, 9)))).toBe('MO  2 12:05 09');
    expect(shown(lcdChars(at(2026, 11, 3, 12, 0, 0)))).toBe('TU  3 12:00 00 PM');
    expect(shown(lcdChars(at(2026, 11, 4, 9, 41, 7)))).toBe('WE  4  9:41 07');
    expect(lcdChars(at(2026, 11, 4, 21, 41, 7), '24h')).toMatchObject({ 'hour-tens': '2', hour: '1', pm: '' });
  });
  test('the display rolls over minutes, days and months straight from the clock', () => {
    expect(shown(lcdChars(at(2026, 10, 31, 23, 59, 59)))).toBe('SA 31 11:59 59 PM');
    expect(shown(lcdChars(at(2026, 11, 1, 0, 0, 0)))).toBe('SU  1 12:00 00');
    expect(shown(lcdChars(at(2026, 11, 5, 18, 0, 0)))).toBe('TH  5  6:00 00 PM');
    expect(shown(lcdChars(at(2026, 11, 6, 7, 0, 0)))).toBe('FR  6  7:00 00');
  });
  test('every character a cell can be asked for has a glyph made of real segments', () => {
    const segs = Object.keys(segmentPaths(0, 0, 2, 4, .4));
    for (const ch of [...'0123456789', ...'SUMOTWEHFRA']) {
      expect(GLYPHS[ch], ch).toBeDefined();
      for (const s of GLYPHS[ch]) expect(segs).toContain(s);
    }
  });
  test('the F-91W draws every segment of its cells, lit for the sample moment and ghosted otherwise', () => {
    const w = CATALOG.find(c => c.id === 'casio-f-91w-1')!;
    const svg = watchSVG(w, 8, { strapLen: 12 });
    expect(svg).toContain(`data-lcd-display="12h" data-lcd-sample="${F91W_SAMPLE.getTime()}"`);
    const cell = (name: string) => [...svg.matchAll(new RegExp(`<g data-lcd="${name}">(.*?)</g>`, 'g'))][0][1];
    const lit = (name: string) => [...cell(name).matchAll(/data-seg="(\w+)"[^>]*fill-opacity="1"/g)].map(m => m[1]).join('');
    expect(lit('hour-tens')).toBe('bc');
    expect(lit('minute')).toBe(GLYPHS['8']);
    expect(lit('day-1')).toBe(GLYPHS.S);
    expect([...cell('day-1').matchAll(/data-seg/g)]).toHaveLength(9);
    expect(cell('second-tens')).toContain(`fill-opacity="${GHOST}"`);
    // No hands, and nothing tagged as lume.
    expect(svg).not.toContain('data-hand');
    expect(svg).not.toContain('data-lume');
    expect(svg).toContain('>CASIO</text>');
    expect(svg).toContain('>WR</text>');
  });
  test('its LED shows only at Night, kept bright, and never as lume', () => {
    const w = CATALOG.find(c => c.id === 'casio-f-91w-1')!;
    expect(watchSVG(w, 8)).toContain('data-backlight="off" display="none"');
    expect(watchSVG(w, 8, { lighting: 'dusk' })).toContain('data-backlight="off" display="none"');
    const night = watchSVG(w, 8, { lighting: 'night' });
    expect(night).toContain('<g data-backlight="on">');
    expect(night).toMatch(/stop-color="rgba\(182,238,138,1\)"/);
    expect(night).not.toContain('filter="url(#lume');
  });
  test('the F-91W case is closed, symmetric and spans its published 35.2 × 38.2 mm', () => {
    const d = f91wCase(35.2, 38.2);
    expect(d.startsWith('M0,-19.1')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    // Straight shoulders and sides, with angular steps out to the full width round the buttons.
    for (const pt of ['10.6,-19.1', '16.3,-9.3', '17.6,-5.4', '16.7,-1.1', '17.6,2.3', '10.6,19.1']) {
      expect(d).toContain(pt);
      expect(d).toContain(pt.replace(/^/, '-'));
    }
    const xs = [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map(m => [+m[1], +m[2]]);
    expect(Math.max(...xs.map(p => p[0])) - Math.min(...xs.map(p => p[0]))).toBeCloseTo(35.2, 5);
    expect(Math.max(...xs.map(p => p[1])) - Math.min(...xs.map(p => p[1]))).toBeCloseTo(38.2, 5);
    expect(d).not.toMatch(/NaN|undefined/);
  });
  test('the A168 shows the same sample moment with its own cells, and no hands or lume', () => {
    const w = CATALOG.find(c => c.id === 'casio-a168wa-1w')!;
    const svg = watchSVG(w, 8, { strapLen: 12 });
    expect(svg).toContain(`data-lcd-display="12h" data-lcd-sample="${A168_SAMPLE.getTime()}"`);
    expect(shown(lcdChars(A168_SAMPLE))).toBe('SU 30 10:58 50 PM');
    for (const name of ['hour-tens', 'hour', 'minute-tens', 'minute', 'second-tens', 'second', 'day-1', 'day-2', 'date-tens', 'date', 'pm', 'signal', 'alarm'])
      expect(svg, name).toContain(`<g data-lcd="${name}">`);
    expect(svg).not.toContain('data-hand');
    expect(svg).not.toContain('data-lume');
    expect(svg).toContain('data-logo="CASIO"');
    // WR is slanted by a transform, so the share-image renderer draws it italic too.
    expect(svg).toMatch(/skewX\(-14\)"><text[^>]*>WR<\/text>/);
    for (const t of ['>ALARM CHRONO</text>', 'UMINESCENCE</text>', '>ILLUMINATOR</text>', '>WR</text>', '>START/STOP</text>']) expect(svg).toContain(t);
  });
  test('its EL panel lights the whole display evenly, only at Night', () => {
    const w = CATALOG.find(c => c.id === 'casio-a168wa-1w')!;
    expect(w.night?.backlight?.kind).toBe('el');
    expect(watchSVG(w, 8, { lighting: 'dusk' })).toContain('data-backlight="off" display="none"');
    const night = watchSVG(w, 8, { lighting: 'night' });
    expect(night).toContain('<g data-backlight="on">');
    expect(night).toContain('fill="rgba(111,224,210,1)"');
    expect(night).not.toContain('radialGradient id="w1_led"');
  });
  test('the A168 case is closed, symmetric and spans its published 36.3 × 38.6 mm', () => {
    const d = a168Case(36.3, 38.6);
    expect(d.startsWith('M0,-19.3')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    for (const pt of ['11.05,-19.3', '12.55,-16.1', '16.3,-9.95', '18.15,-3.9', '17.75,3.5', '12.55,16.1']) {
      expect(d).toContain(pt);
      expect(d).toContain('-' + pt);
    }
    const xs = [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map(m => [+m[1], +m[2]]);
    expect(Math.max(...xs.map(p => p[0])) - Math.min(...xs.map(p => p[0]))).toBeCloseTo(36.3, 5);
    expect(Math.max(...xs.map(p => p[1])) - Math.min(...xs.map(p => p[1]))).toBeCloseTo(38.6, 5);
  });
  test('its bracelet is drawn at its fitted 21 mm, while other straps keep the 18 mm lug width', () => {
    const w = CATALOG.find(c => c.id === 'casio-a168wa-1w')!;
    const widest = (svg: string) => Math.max(...[...svg.matchAll(/M(-?[\d.]+),(-?[\d.]+)L(-?[\d.]+),\2/g)].map(m => +m[3] - +m[1]));
    expect(widest(watchSVG(w, 8, { strapLen: 12 }))).toBeCloseTo(21, 1);
    expect(widest(watchSVG(w, 8, { strapLen: 12, strap: { type: 'leather', color: '#5a3a22' } }))).toBeCloseTo(18, 1);
  });
});
