/**
 * Segment LCDs for digital watches. A renderer lays out cells (one character each) with `lcdCell()`, all inside one
 * `lcdDisplay()` group. Every segment is drawn, lit or ghosted, and tagged, so live time can switch segments without
 * redrawing: `setDisplays()` in src/lib/liveTime.ts reads each display's format and sets every cell to the moment
 * shown. Without live time a display shows its sample moment, stored on the group so live time can restore it.
 *
 * Positive LCD: lit segments are dark ink on the grey panel; unlit ones keep a faint ghost, as real panels do.
 * See docs/watch-illustration-standard.md#digital-displays.
 */

/**
 * Segments: the usual seven (a top, b top right, c bottom right, d bottom, e bottom left, f top left, g middle), plus
 * k and n, an upper and lower centre stroke, which Casio's day fields use for M, T, W and R.
 */
export type Segment = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'k' | 'n';

/** Lit segments for each character a cell can show. A space lights nothing. */
export const GLYPHS: Record<string, string> = {
  ' ': '', '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg',
  A: 'abcefg', E: 'adefg', F: 'aefg', H: 'bcefg', M: 'abcefk', O: 'abcdef', R: 'abefgn', S: 'acdfg', T: 'akn', U: 'bcdef', W: 'bcdefn',
};

/** Day names as a two-character day field shows them, Sunday first like Date.getDay(). */
export const DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/**
 * What each cell shows at a moment. `12h` drops the hour's leading zero and lights PM in the afternoon; `24h` keeps
 * two digits. The date's leading zero is blank, as on Casio modules.
 */
export function lcdChars(at: Date, format: '12h' | '24h' = '12h'): Record<string, string> {
  const h24 = at.getHours(), h = format === '24h' ? h24 : h24 % 12 || 12;
  const two = (n: number, blank = false) => (n < 10 && blank ? ' ' + n : String(n).padStart(2, '0'));
  const [ht, ho] = two(h, format === '12h'), [mt, mo] = two(at.getMinutes()), [st, so] = two(at.getSeconds()), [dt, dn] = two(at.getDate(), true);
  const [d1, d2] = DAYS[at.getDay()];
  return { 'hour-tens': ht, hour: ho, 'minute-tens': mt, minute: mo, 'second-tens': st, second: so, 'date-tens': dt, date: dn, 'day-1': d1, 'day-2': d2, pm: format === '12h' && h24 >= 12 ? 'on' : '' };
}

const f = (n: number) => +n.toFixed(3);
const poly = (pts: number[][]) => 'M' + pts.map(([x, y]) => `${f(x)},${f(y)}`).join('L') + 'Z';

/** The outline of every segment for a cell w wide and h tall at (x, y), with strokes t thick and a small gap between. */
export function segmentPaths(x: number, y: number, w: number, h: number, t: number): Record<Segment, string> {
  const g = t * .22, ym = y + h / 2, r = x + w, b = y + h, ht = t / 2;
  return {
    a: poly([[x + g, y], [r - g, y], [r - t - g, y + t], [x + t + g, y + t]]),
    d: poly([[x + t + g, b - t], [r - t - g, b - t], [r - g, b], [x + g, b]]),
    f: poly([[x, y + g], [x + t, y + t + g], [x + t, ym - ht - g], [x, ym - g]]),
    e: poly([[x, ym + g], [x + t, ym + ht + g], [x + t, b - t - g], [x, b - g]]),
    b: poly([[r, y + g], [r, ym - g], [r - t, ym - ht - g], [r - t, y + t + g]]),
    c: poly([[r, ym + g], [r, b - g], [r - t, b - t - g], [r - t, ym + ht + g]]),
    g: poly([[x + g, ym], [x + t + g, ym - ht], [r - t - g, ym - ht], [r - g, ym], [r - t - g, ym + ht], [x + t + g, ym + ht]]),
    k: poly([[x + w / 2 - t * .4, y + t + g], [x + w / 2 + t * .4, y + t + g], [x + w / 2 + t * .4, ym - ht - g], [x + w / 2 - t * .4, ym - ht - g]]),
    n: poly([[x + w / 2 - t * .4, ym + ht + g], [x + w / 2 + t * .4, ym + ht + g], [x + w / 2 + t * .4, b - t - g], [x + w / 2 - t * .4, b - t - g]]),
  };
}

/** How faint an unlit segment is drawn. */
export const GHOST = .07;

/**
 * One character cell, tagged `data-lcd="<name>"` with each segment tagged `data-seg`. `segments` lists the ones the
 * cell has: a half-width hour digit that only ever shows 1 has just 'bc', a day letter has all nine.
 */
export function lcdCell(name: string, x: number, y: number, w: number, h: number, t: number, shown: string, segments = 'abcdefg') {
  const paths = segmentPaths(x, y, w, h, t), lit = GLYPHS[shown] ?? '';
  let s = `<g data-lcd="${name}">`;
  for (const seg of segments) s += `<path data-seg="${seg}" d="${paths[seg as Segment]}" fill-opacity="${lit.includes(seg) ? 1 : GHOST}"/>`;
  return s + '</g>';
}

/**
 * An on/off indicator such as PM, tagged as a cell with one segment, 'on'. `body` is its drawing without a fill
 * (the display's ink applies).
 */
export const lcdIndicator = (name: string, body: string, on: boolean) =>
  `<g data-lcd="${name}"><g data-seg="on" fill-opacity="${on ? 1 : GHOST}">${body}</g></g>`;

/** Wraps a display's cells: its ink, its time format for live time, and the sample moment it shows without it. */
export const lcdDisplay = (sample: Date, format: '12h' | '24h', ink: string, body: string) =>
  `<g data-lcd-display="${format}" data-lcd-sample="${sample.getTime()}" fill="${ink}">${body}</g>`;
