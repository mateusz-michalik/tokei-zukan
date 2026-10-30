import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { lcdCell, lcdChars, lcdDisplay, lcdIndicator } from './lcd';
import { backlight, rgba } from './night';

// Casio F-91W: a slim resin case, octagonal with bulges round its three buttons, a blue-ringed black window printed
// CASIO, F-91W and WATER [WR] RESIST, and a positive LCD with segment digits. The case centre is the origin; the
// window sits 1.8 mm below it. Everything is in millimetres at Casio's 35.2 × 38.2 mm, scaled to the catalogue size.
// See docs/models/casio-f-91w-1.md.

const f = (n: number) => +n.toFixed(3);

/** The moment the drawing shows without live time, as in Casio's photo: Sunday the 30th, 10:58:50 pm. */
export const F91W_SAMPLE = new Date(2026, 7, 30, 22, 58, 50);

type Seg = { to: number[]; c?: number[][] };

/**
 * The case's right side, top centre to bottom centre: long chamfered shoulders, a straight side, and small angular
 * steps out to the full 35.2 mm width round the buttons, with a slight waist between them. A straight segment, or a
 * curve with its control points.
 */
const RIGHT: Seg[] = [
  { to: [10.6, -19.1] }, { to: [11.05, -18.8], c: [[10.9, -19.1]] }, { to: [16.3, -9.3] }, { to: [16.85, -8.55] }, { to: [17.2, -7.9] },
  { to: [17.2, -5.7] }, { to: [17.6, -5.4] }, { to: [17.6, -2.3] }, { to: [17.05, -1.7] }, { to: [16.7, -1.1] },
  { to: [16.7, 1.1] }, { to: [17.05, 1.7] }, { to: [17.6, 2.3] }, { to: [17.6, 5.4] }, { to: [17.2, 5.7] },
  { to: [17.2, 7.9] }, { to: [16.85, 8.55] }, { to: [16.3, 9.3] }, { to: [11.05, 18.8] }, { to: [10.6, 19.1], c: [[10.9, 19.1]] }, { to: [0, 19.1] },
];

/** The case outline: straight top and bottom, chamfered corners, and bulges at the sides round the buttons. */
export function f91wCase(D: number, LL: number) {
  const u = D / 35.2, v = LL / 38.2;
  const p = ([x, y]: number[]) => `${f(x * u)},${f(y * v)}`;
  const cmd = (to: number[], c?: number[][]) => (!c ? `L${p(to)}` : c.length === 1 ? `Q${p(c[0])} ${p(to)}` : `C${p(c[0])} ${p(c[1])} ${p(to)}`);
  let d = `M${p([0, -19.1])}` + RIGHT.map(s => cmd(s.to, s.c)).join('');
  // The left side is the right one mirrored and traced bottom to top: each segment runs back to the previous point.
  const flip = ([x, y]: number[]) => [-x, y];
  for (let i = RIGHT.length - 1; i >= 0; i--) {
    const from = i ? RIGHT[i - 1].to : [0, -19.1];
    d += cmd(flip(from), RIGHT[i].c && [...RIGHT[i].c!].reverse().map(flip));
  }
  return d + 'Z';
}

/** A rectangle with chamfered corners (c mm along each edge), each corner softened by r. */
export function chamfered(x0: number, y0: number, x1: number, y1: number, c: number, r = .4) {
  const pts = [[x0 + c, y0], [x1 - c, y0], [x1, y0 + c], [x1, y1 - c], [x1 - c, y1], [x0 + c, y1], [x0, y1 - c], [x0, y0 + c]];
  // Round each corner: stop r short of it along both edges and curve through it.
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const [px, py] = pts[(i + n - 1) % n], [x, y] = pts[i], [nx, ny] = pts[(i + 1) % n];
    const toward = (ax: number, ay: number) => { const l = Math.hypot(ax - x, ay - y); return [x + (ax - x) * r / l, y + (ay - y) * r / l]; };
    const [ax, ay] = toward(px, py), [bx, by] = toward(nx, ny);
    d += `${i ? 'L' : 'M'}${f(ax)},${f(ay)}Q${f(x)},${f(y)} ${f(bx)},${f(by)}`;
  }
  return d + 'Z';
}

/** The black window: angular, its corners chamfered rather than rounded. Centred in the case like the photo's. */
export const F91W_WINDOW = { x0: -14, y0: -12, x1: 14, y1: 11.75, c: 2.8 };

function rrect(x: number, y: number, w: number, h: number, r: number) {
  return `M${f(x + r)},${f(y)}H${f(x + w - r)}Q${f(x + w)},${f(y)} ${f(x + w)},${f(y + r)}V${f(y + h - r)}Q${f(x + w)},${f(y + h)} ${f(x + w - r)},${f(y + h)}H${f(x + r)}Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - r)}V${f(y + r)}Q${f(x)},${f(y)} ${f(x + r)},${f(y)}Z`;
}

/** A chrome push button on the case side at height y, pointing out on side sx. */
function button(sx: number, y: number) {
  const x0 = sx * 17.4, x1 = sx * 18.8, h = .95;
  return `<path d="M${f(x0)},${f(y - h)}H${f(x1 - sx * .25)}Q${f(x1)},${f(y - h)} ${f(x1)},${f(y - h + .3)}V${f(y + h - .3)}Q${f(x1)},${f(y + h)} ${f(x1 - sx * .25)},${f(y + h)}H${f(x0)}Z" fill="#c5c9cc" stroke="#5b6064" stroke-width=".08"/>`
    + `<path d="M${f(x0 + sx * .15)},${f(y - .4)}H${f(x1 - sx * .3)}" stroke="#fff" stroke-width=".24" opacity=".85"/><path d="M${f(x0 + sx * .35)},${f(y - h)}V${f(y + h)}" stroke="#777c80" stroke-width=".18"/>`;
}

/**
 * The moulded front, drawn as its own nested shapes rather than a copy of the outline: a step across each shoulder
 * where the band enters, and an angular frame round the window, each lit along its top and left edges.
 */
function front(m: string) {
  const lit = shade(m, .85), deep = shade(m, -.55);
  // The frame round the window: straight top, bottom and sides, its corners cut parallel to the case's shoulders.
  const frame = 'M-12.3,-13.4L12.3,-13.4L15.4,-8L15.4,7.8L12.3,13.1L-12.3,13.1L-15.4,7.8L-15.4,-8Z';
  let s = `<path d="${frame}" fill="${shade(m, .07)}" stroke="${deep}" stroke-width=".14"/>`;
  s += `<path d="M-15.15,6.5L-15.15,-7.9L-12.2,-13.15H12.2" fill="none" stroke="${lit}" stroke-width=".22" opacity=".4"/>`;
  // Shoulder steps: the case's top and bottom blocks, where the band enters, sit a level above the frame.
  s += `<path d="M-13.05,-15.2H13.05M-12.9,14.9H12.9" stroke="${deep}" stroke-width=".2"/><path d="M-12.95,-15.4H12.95M-12.8,14.7H12.8" stroke="${lit}" stroke-width=".14" opacity=".3"/>`;
  return s;
}

/** The printed black window: blue ring, a fine silver line, the CASIO and F-91W marks, labels and rules. */
function face() {
  const blue = '#2c56a8', gold = '#e0b43c', grey = '#c3c6cc', red = '#d8424a', sans = 'font-family="Arial,Helvetica,sans-serif" font-weight="700"';
  const W = F91W_WINDOW;
  let s = `<path d="${chamfered(W.x0, W.y0, W.x1, W.y1, W.c, .6)}" fill="#0b0d12"/>`;
  s += `<path d="${chamfered(W.x0 + .3, W.y0 + .3, W.x1 - .3, W.y1 - .3, W.c - .15, .5)}" fill="none" stroke="${blue}" stroke-width=".42"/>`;
  s += `<path d="${chamfered(-12.5, -10.6, 12.5, 10.3, 2, .45)}" fill="none" stroke="#d9dde2" stroke-width=".11" opacity=".9"/>`;
  s += `<text x="-5.35" y="-8.5" ${sans} font-size="1.6" textLength="6.5" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="#eef0f2">CASIO</text>`;
  s += `<text x="5.1" y="-8.5" ${sans} font-style="italic" font-size="1.55" textLength="6.2" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${gold}">F-91W</text>`;
  // Blue rules above and below the display, the button labels with their red arrows, and the water-resist badge.
  s += `<path d="M-11.4,-7.37H11.4M-11.4,7.78H-4.3M3.5,7.78H11.4" stroke="${blue}" stroke-width=".34"/>`;
  s += `<path d="M-11,-5.8H-9.9M-11,6.85H-9.9M9.3,6.85H10.6" stroke="${red}" stroke-width=".26"/>`;
  s += `<g ${sans} font-size=".76" fill="${grey}"><text x="-9.4" y="-5.5" textLength="2.8" lengthAdjust="spacingAndGlyphs">LIGHT</text><text x="-9.4" y="7.09" textLength="3" lengthAdjust="spacingAndGlyphs">MODE</text>`
    + `<text x="-3.04" y="7.09" textLength="11.8" lengthAdjust="spacingAndGlyphs">ALARM ON·OFF/24HR</text></g>`;
  s += `<text x="-3.7" y="-5.63" ${sans} font-size="1.15" textLength="13.95" lengthAdjust="spacingAndGlyphs" fill="${gold}">ALARM CHRONOGRAPH</text>`;
  s += `<g ${sans} font-size="1.15" fill="#e6e8eb"><text x="-10.06" y="9.24" textLength="5.4" lengthAdjust="spacingAndGlyphs">WATER</text><text x="4.05" y="9.24" textLength="5.7" lengthAdjust="spacingAndGlyphs">RESIST</text></g>`;
  s += `<path d="${rrect(-4, 7.47, 7.2, 2.47, .9)}" fill="none" stroke="${blue}" stroke-width=".3"/>`;
  s += `<text x="-.3" y="9.43" ${sans} font-style="italic" font-size="1.85" textLength="4.9" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${red}">WR</text>`;
  return s;
}

/** The LCD: a raised silver frame, the grey panel, the hidden LED glow, and every segment of the time, day and date. */
function lcd(id: string, glow: string | undefined, at: Date) {
  const ink = '#1d201c', panel = rrect(-9.95, -4.49, 19.9, 10, .8);
  let s = `<path d="${rrect(-10.5, -5, 21, 11, 1.2)}" fill="none" stroke="#9aa0a6" stroke-width=".22"/>`;
  s += `<defs><linearGradient id="${id}_lp" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a9ad9f"/><stop offset=".18" stop-color="#b9bcaf"/><stop offset="1" stop-color="#b3b6a8"/></linearGradient>`
    + `<radialGradient id="${id}_led" gradientUnits="userSpaceOnUse" cx="-9.8" cy=".5" r="21"><stop stop-color="${rgba(glow ?? '#000', 1)}" stop-opacity=".98"/><stop offset=".42" stop-color="${rgba(glow ?? '#000', 1)}" stop-opacity=".62"/><stop offset="1" stop-color="${rgba(glow ?? '#000', 1)}" stop-opacity=".22"/></radialGradient></defs>`;
  s += `<path d="${panel}" fill="url(#${id}_lp)"/>`;
  // The light comes from a small LED at the display's left edge, so it's brightest there and fades to the right.
  if (glow) s += backlight(`<path d="${panel}" fill="url(#${id}_led)"/>`);
  const c = lcdChars(at);
  let cells = '';
  // Hour (its tens digit only ever shows 1), colon, minutes, then the smaller seconds, bottom-aligned.
  cells += lcdCell('hour-tens', -8.3, 0, 1.4, 4.68, .5, c['hour-tens'], 'bc');
  cells += lcdCell('hour', -6.01, 0, 2.47, 4.68, .5, c.hour);
  cells += `<circle cx="-2.66" cy="1.27" r=".25"/><circle cx="-2.66" cy="3.42" r=".25"/>`;
  cells += lcdCell('minute-tens', -1.65, 0, 2.47, 4.68, .5, c['minute-tens']);
  cells += lcdCell('minute', 1.52, 0, 2.47, 4.68, .5, c.minute);
  cells += lcdCell('second-tens', 4.81, 1.08, 1.71, 3.6, .4, c['second-tens']);
  cells += lcdCell('second', 7.15, 1.08, 1.75, 3.6, .4, c.second);
  // Top row: day letters, date, PM and the alarm and hourly-signal indicators (drawn off: nothing is set).
  cells += lcdCell('day-1', -2.97, -3.35, 1.5, 2.15, .31, c['day-1'], 'abcdefgkn');
  cells += lcdCell('day-2', -.89, -3.35, 1.46, 2.15, .31, c['day-2'], 'abcdefgkn');
  cells += lcdCell('date-tens', 5.25, -3.42, 1.52, 2.47, .33, c['date-tens']);
  cells += lcdCell('date', 7.28, -3.42, 1.58, 2.47, .33, c.date);
  cells += lcdIndicator('pm', `<text x="-8.86" y="-.95" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="1.33" textLength="2.09" lengthAdjust="spacingAndGlyphs">PM</text>`, c.pm === 'on');
  cells += lcdIndicator('signal', `<path d="M-8.45,-3.23A.38,.38 0 0 0 -8.45,-2.47ZM-8.25,-3.23h.3v.76h-.3ZM-7.75,-3.23h.3v.76h-.3ZM-7.25,-3.23h.28v.76h-.28ZM-6.78,-3.23h.28v.76h-.28Z"/>`, false);
  cells += lcdIndicator('alarm', `<path d="M-5.5,-3.29Q-5.95,-3.12 -5.95,-2.6V-2.32H-5.05V-2.6Q-5.05,-3.12 -5.5,-3.29ZM-5.65,-2.2h.3v.16h-.3Z"/>`, false);
  return s + lcdDisplay(at, '12h', ink, cells);
}

export interface F91WOptions { D: number; LL: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number; glow?: string }

/** Everything above the strap for the Casio F-91W. */
export function f91wSVG(o: F91WOptions) {
  const { D, LL, id, L, outline } = o;
  const d = f91wCase(D, LL), u = D / 35.2, v = LL / 38.2, m = L.caseColor, W = F91W_WINDOW;
  if (outline) return `<path d="${d}" fill="none" ${o.stroke}/><g transform="scale(${f(u)} ${f(v)})"><path d="${chamfered(W.x0, W.y0, W.x1, W.y1, W.c, .6)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/></g>`;
  let s = `<defs><linearGradient id="${id}_rc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .32)}"/><stop offset=".45" stop-color="${m}"/><stop offset="1" stop-color="${shade(m, -.3)}"/></linearGradient></defs>`;
  s += `<g transform="scale(${f(u)} ${f(v)})">${button(-1, -4.3)}${button(-1, 4.1)}${button(1, 4.1)}</g>`;
  s += `<path d="${d}" fill="url(#${id}_rc)" stroke="${shade(m, -.45)}" stroke-width=".14"/>`;
  s += `<g transform="scale(${f(u)} ${f(v)})">`;
  s += front(m);
  s += face();
  s += lcd(id, o.glow, F91W_SAMPLE);
  // The resin crystal: one faint reflection across the top left of the window.
  s += `<path d="M-13.6,-7.5Q-13,-11.4 -9,-11.6L-7.6,-11.6Q-11.8,-10.6 -12.6,-6Z" fill="#fff" opacity=".07"/>`;
  return s + '</g>';
}
