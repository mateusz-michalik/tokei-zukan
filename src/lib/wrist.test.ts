import { describe, expect, test } from 'vitest';
import { formatWrist, parseWrist, wristRange, wristValue } from './wrist';

describe('wrist size units', () => {
  test('7 inches is 17.78 cm, and back', () => {
    expect(parseWrist('7', 'in')).toEqual({ cm: 17.78 });
    expect(wristValue(17.78, 'in')).toBe(7);
    expect(formatWrist(17.78, 'cm')).toBe('17.78 cm');
    expect(formatWrist(17, 'in')).toBe('6.69 in');
  });
  test('decimal inches are accepted', () => {
    expect(parseWrist('6.5', 'in')).toEqual({ cm: 16.51 });
    expect(parseWrist(' 6.75 ', 'in')).toEqual({ cm: 17.145 });
    expect(parseWrist('.5', 'cm')).toHaveProperty('error');
  });
  test('switching units only changes the display, so repeated toggles never drift', () => {
    // The stored centimetres are never rewritten by a toggle; each display is derived from them afresh.
    for (const cm of [17, 16.9926, 17.78, 13, 23]) {
      let shown = '';
      for (let i = 0; i < 50; i++) shown = String(wristValue(cm, i % 2 ? 'cm' : 'in'));
      expect(shown).toBe(String(wristValue(cm, 'cm')));
      expect(wristValue(cm, 'in')).toBe(+(cm / 2.54).toFixed(2));
    }
  });
  test('the 13–23 cm range holds in both units, with both ends valid', () => {
    expect(wristRange('cm')).toMatchObject({ min: 13, max: 23 });
    expect(wristRange('in')).toMatchObject({ min: 5.12, max: 9.05, spin: { min: 5.25, max: 9, step: .25 } });
    for (const t of ['13', '23']) expect(parseWrist(t, 'cm')).toHaveProperty('cm');
    for (const t of ['5.12', '9.05', '5.25', '9']) expect(parseWrist(t, 'in')).toHaveProperty('cm');
    expect(parseWrist('12.9', 'cm')).toEqual({ error: 'Enter a size between 13 and 23 cm.' });
    expect(parseWrist('23.1', 'cm')).toHaveProperty('error');
    expect(parseWrist('5.1', 'in')).toEqual({ error: 'Enter a size between 5.12 and 9.05 in.' });
    expect(parseWrist('9.1', 'in')).toHaveProperty('error');
    // 17 entered as inches is far too big: the unit matters.
    expect(parseWrist('17', 'in')).toHaveProperty('error');
  });
  test('empty and invalid input is explained, not saved', () => {
    expect(parseWrist('', 'in')).toEqual({ error: 'Enter your wrist size in inches.' });
    expect(parseWrist('  ', 'cm')).toEqual({ error: 'Enter your wrist size in centimetres.' });
    for (const t of ['abc', '7in', '-7', '1e1', '7..5']) expect(parseWrist(t, 'in'), t).toHaveProperty('error');
    expect(parseWrist('17.', 'cm')).toEqual({ cm: 17 });
  });
});
