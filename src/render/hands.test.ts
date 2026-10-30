import { describe, expect, test } from 'vitest';
import { CATALOG } from '../catalog';
import { HAND_ROLES, handAngle, turnTransform } from './hands';
import { watchSVG } from './watch';
import { wristSVG } from './wrist';

const at = (h: number, m: number, s: number, ms = 0) => new Date(2026, 9, 29, h, m, s, ms);
const tagged = (svg: string) => [...svg.matchAll(/<\w+ [^>]*?data-hand="([\w-]+)" (?:data-beats="(\d+)" )?transform="([^"]*)"/g)].map(m => ({ role: m[1], beats: m[2], transform: m[3] }));

describe('hand angles', () => {
  test('noon, midnight and their rollovers', () => {
    for (const d of [at(0, 0, 0), at(12, 0, 0)]) for (const r of ['hour', 'minute', 'second'] as const) expect(handAngle(r, d)).toBe(0);
    expect(handAngle('hour', at(11, 59, 59, 999))).toBeCloseTo(360, 1);
    expect(handAngle('hour24', at(12, 0, 0))).toBe(180);
    expect(handAngle('hour24', at(23, 59, 59))).toBeCloseTo(360, 1);
  });
  test('hour and minute hands carry the fraction of the hour and minute', () => {
    expect(handAngle('hour', at(15, 30, 0))).toBe(105);
    expect(handAngle('minute', at(15, 30, 30))).toBe(183);
    expect(handAngle('hour', at(10, 9, 36))).toBeCloseTo(304.8, 1);
  });
  test('seconds step at the movement rate: quartz ticks, automatics sweep', () => {
    const t = at(9, 0, 15, 990);
    expect(handAngle('second', t, 1)).toBe(90);
    expect(handAngle('second', t, 6)).toBeCloseTo(95, 5);
    expect(handAngle('small-seconds', at(9, 0, 15, 130), 8)).toBeCloseTo(90.75, 5);
  });
  test('chronograph hands rest at zero', () => {
    expect(handAngle('chrono', at(17, 42, 31, 500), 8)).toBe(0);
  });
  test('turning keeps a subdial pivot and only replaces the final rotate', () => {
    expect(turnTransform('rotate(304.5)', 12.3456)).toBe('rotate(12.346)');
    expect(turnTransform('translate(-7.2 0) rotate(174)', 90)).toBe('translate(-7.2 0) rotate(90)');
  });
});

describe('hand tags in the drawings', () => {
  // Digital watches have no hands; live time sets their displays instead (lcd.test.ts).
  const analogue = CATALOG.filter(w => w.display !== 'digital');
  test.each(analogue.map(w => [w.id, w] as const))('%s tags every hand so live time can turn it', (_, w) => {
    const hands = tagged(watchSVG(w, 8));
    const roles = new Set(hands.map(h => h.role));
    expect(roles).toContain('hour');
    expect(roles).toContain('minute');
    expect(roles.has('second') || roles.has('small-seconds')).toBe(true);
    for (const h of hands) {
      expect(HAND_ROLES).toContain(h.role);
      expect(h.transform).toMatch(/^(translate\([-\d. ]+\) )?rotate\(-?[\d.]+\)$/);
      if (h.role === 'second' || h.role === 'small-seconds') expect(h.beats).toBe(String(w.beats));
    }
    // Hands keep their tags at night and on the wrist.
    expect(tagged(watchSVG(w, 8, { lighting: 'night' }))).toHaveLength(hands.length);
    expect(tagged(wristSVG(w, 17))).toHaveLength(hands.length);
  });
  test('every catalogue watch knows how its seconds hand moves', () => {
    for (const w of analogue) expect([1, 6, 8], w.id).toContain(w.beats);
  });
  test('chronographs and the GMT get the right roles', () => {
    const roles = (id: string) => tagged(watchSVG(CATALOG.find(w => w.id === id)!, 8)).map(h => h.role);
    expect(roles('seiko-ssc947')).toEqual(expect.arrayContaining(['chrono', 'hour24', 'small-seconds']));
    expect(roles('seiko-ssc947')).not.toContain('second');
    expect(roles('oris-01-733-7707')).toEqual(expect.arrayContaining(['chrono', 'small-seconds']));
    expect(roles('oris-01-733-7707')).not.toContain('second');
    expect(roles('seiko-spb519')).toContain('hour24');
    expect(roles('seiko-ssk003')).toEqual(expect.arrayContaining(['hour', 'minute', 'second', 'hour24']));
  });
});
