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

/** The case's right side, top centre to bottom centre: a straight segment, or a curve with its control points. */
const RIGHT: Seg[] = [
  { to: [11.2, -19.1] }, { to: [11.95, -18.75], c: [[11.65, -19.1]] }, { to: [14.15, -15] }, { to: [14.3, -14.4], c: [[14.3, -14.75]] },
  { to: [14.3, -9.9] }, { to: [17.6, -7.2], c: [[14.3, -8.6], [17.6, -8.9]] }, { to: [17.6, 7.6] }, { to: [14.3, 10.5], c: [[17.6, 9.3], [14.3, 9.2]] },
  { to: [14.3, 14.4] }, { to: [14.15, 15], c: [[14.3, 14.75]] }, { to: [11.85, 18.75] }, { to: [11.1, 19.1], c: [[11.55, 19.1]] }, { to: [0, 19.1] },
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

function rrect(x: number, y: number, w: number, h: number, r: number) {
  return `M${f(x + r)},${f(y)}H${f(x + w - r)}Q${f(x + w)},${f(y)} ${f(x + w)},${f(y + r)}V${f(y + h - r)}Q${f(x + w)},${f(y + h)} ${f(x + w - r)},${f(y + h)}H${f(x + r)}Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - r)}V${f(y + r)}Q${f(x)},${f(y)} ${f(x + r)},${f(y)}Z`;
}

/** A chrome push button on the case side at height y, pointing out on side sx. */
function button(sx: number, y: number) {
  const x0 = sx * 17.4, x1 = sx * 19.1, h = .85;
  return `<path d="M${f(x0)},${f(y - h)}H${f(x1 - sx * .25)}Q${f(x1)},${f(y - h)} ${f(x1)},${f(y - h + .3)}V${f(y + h - .3)}Q${f(x1)},${f(y + h)} ${f(x1 - sx * .25)},${f(y + h)}H${f(x0)}Z" fill="#c5c9cc" stroke="#5b6064" stroke-width=".08"/>`
    + `<path d="M${f(x0 + sx * .15)},${f(y - .35)}H${f(x1 - sx * .3)}" stroke="#fff" stroke-width=".22" opacity=".85"/><path d="M${f(x0 + sx * .4)},${f(y - h)}V${f(y + h)}" stroke="#777c80" stroke-width=".18"/>`;
}

/** The printed black window: blue ring, a fine silver line, the CASIO and F-91W marks, labels and rules. */
function face() {
  const blue = '#2c56a8', gold = '#e0b43c', grey = '#c3c6cc', red = '#d8424a', sans = 'font-family="Arial,Helvetica,sans-serif" font-weight="700"';
  let s = `<path d="${rrect(-14.15, -11.25, 28.3, 26.15, 2.6)}" fill="#0b0d12"/>`;
  s += `<path d="${rrect(-13.85, -10.95, 27.7, 25.55, 2.35)}" fill="none" stroke="${blue}" stroke-width=".42"/>`;
  s += `<path d="${rrect(-12.8, -9.7, 25.6, 23.1, 1.9)}" fill="none" stroke="#d9dde2" stroke-width=".11" opacity=".9"/>`;
  s += `<text x="-5.45" y="-7.42" ${sans} font-size="1.72" textLength="6.7" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="#eef0f2">CASIO</text>`;
  s += `<text x="5.15" y="-7.42" ${sans} font-style="italic" font-size="1.68" textLength="6.3" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${gold}">F-91W</text>`;
  // Blue rules above and below the display, the button labels with their red arrows, and the water-resist badge.
  s += `<path d="M-11.6,-6.1H11.4M-12,10.6H-4.5M3.7,10.6H11.4" stroke="${blue}" stroke-width=".36"/>`;
  s += `<path d="M-11.2,-4.38H-10.1M-11.2,9.55H-10.1M9.5,9.55H10.8" stroke="${red}" stroke-width=".26"/>`;
  s += `<g ${sans} font-size=".78" fill="${grey}"><text x="-9.6" y="-4.02" textLength="2.9" lengthAdjust="spacingAndGlyphs">LIGHT</text><text x="-9.6" y="9.85" textLength="3.1" lengthAdjust="spacingAndGlyphs">MODE</text>`
    + `<text x="-3.1" y="9.85" textLength="12.1" lengthAdjust="spacingAndGlyphs">ALARM ON·OFF/24HR</text></g>`;
  s += `<text x="-3.8" y="-4.2" ${sans} font-size="1.12" textLength="14.3" lengthAdjust="spacingAndGlyphs" fill="${gold}">ALARM CHRONOGRAPH</text>`;
  s += `<g ${sans} font-size="1.2" fill="#e6e8eb"><text x="-10.3" y="12.22" textLength="5.5" lengthAdjust="spacingAndGlyphs">WATER</text><text x="4.1" y="12.22" textLength="5.8" lengthAdjust="spacingAndGlyphs">RESIST</text></g>`;
  s += `<path d="${rrect(-4.1, 10.2, 7.4, 2.8, 1.05)}" fill="none" stroke="${blue}" stroke-width=".3"/>`;
  s += `<text x="-.3" y="12.42" ${sans} font-style="italic" font-size="2.05" textLength="5" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${red}">WR</text>`;
  return s;
}

/** The LCD: a raised silver frame, the grey panel, the hidden LED glow, and every segment of the time, day and date. */
function lcd(id: string, glow: string | undefined, at: Date) {
  const ink = '#1d201c', panel = rrect(-10.15, -2.93, 20.3, 11.01, .85);
  let s = `<path d="${rrect(-10.75, -3.5, 21.5, 12.15, 1.3)}" fill="none" stroke="#9aa0a6" stroke-width=".22"/>`;
  s += `<defs><linearGradient id="${id}_lp" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a9ad9f"/><stop offset=".18" stop-color="#b9bcaf"/><stop offset="1" stop-color="#b3b6a8"/></linearGradient>`
    + `<radialGradient id="${id}_led" gradientUnits="userSpaceOnUse" cx="-10.4" cy="2.6" r="22"><stop stop-color="${rgba(glow ?? '#000', 1)}" stop-opacity=".98"/><stop offset=".42" stop-color="${rgba(glow ?? '#000', 1)}" stop-opacity=".62"/><stop offset="1" stop-color="${rgba(glow ?? '#000', 1)}" stop-opacity=".22"/></radialGradient></defs>`;
  s += `<path d="${panel}" fill="url(#${id}_lp)"/>`;
  // The light comes from a small LED at the display's left edge, so it's brightest there and fades to the right.
  if (glow) s += backlight(`<path d="${panel}" fill="url(#${id}_led)"/>`);
  const c = lcdChars(at);
  let cells = '';
  // Hour (its tens digit only ever shows 1), colon, minutes, then the smaller seconds, bottom-aligned.
  cells += lcdCell('hour-tens', -8.55, 2.02, 1.52, 5.16, .55, c['hour-tens'], 'bc');
  cells += lcdCell('hour', -6.13, 2.02, 2.52, 5.16, .55, c.hour);
  cells += `<circle cx="-2.71" cy="3.42" r=".27"/><circle cx="-2.71" cy="5.8" r=".27"/>`;
  cells += lcdCell('minute-tens', -1.68, 2.02, 2.52, 5.16, .55, c['minute-tens']);
  cells += lcdCell('minute', 1.55, 2.02, 2.52, 5.16, .55, c.minute);
  cells += lcdCell('second-tens', 4.9, 3.2, 1.81, 3.98, .43, c['second-tens']);
  cells += lcdCell('second', 7.29, 3.2, 1.81, 3.98, .43, c.second);
  // Top row: day letters, date, PM and the alarm and hourly-signal indicators (drawn off: nothing is set).
  cells += lcdCell('day-1', -3.03, -1.67, 1.55, 2.37, .34, c['day-1'], 'abcdefgkn');
  cells += lcdCell('day-2', -.9, -1.67, 1.55, 2.37, .34, c['day-2'], 'abcdefgkn');
  cells += lcdCell('date-tens', 5.35, -1.72, 1.6, 2.68, .36, c['date-tens']);
  cells += lcdCell('date', 7.42, -1.72, 1.6, 2.68, .36, c.date);
  cells += lcdIndicator('pm', `<text x="-9.05" y=".98" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="1.38" textLength="2.15" lengthAdjust="spacingAndGlyphs">PM</text>`, c.pm === 'on');
  cells += lcdIndicator('signal', `<path d="M-8.4,-1.53A.42,.42 0 0 0 -8.4,-.7ZM-8.15,-1.53h.32v.83h-.32ZM-7.6,-1.53h.32v.83h-.32ZM-7.05,-1.53h.3v.83h-.3ZM-6.5,-1.53h.3v.83h-.3Z"/>`, false);
  cells += lcdIndicator('alarm', `<path d="M-5.62,-1.6Q-6.05,-1.45 -6.05,-.95V-.62H-5.2V-.95Q-5.2,-1.45 -5.62,-1.6ZM-5.76,-.5h.28v.18h-.28Z"/>`, false);
  return s + lcdDisplay(at, '12h', ink, cells);
}


export interface F91WOptions { D: number; LL: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number; glow?: string }

/** Everything above the strap for the Casio F-91W. */
export function f91wSVG(o: F91WOptions) {
  const { D, LL, id, L, outline } = o;
  const d = f91wCase(D, LL), u = D / 35.2, v = LL / 38.2, m = L.caseColor;
  if (outline) return `<path d="${d}" fill="none" ${o.stroke}/><path d="${rrect(-13.85 * u, -10.95 * v, 27.7 * u, 25.55 * v, 2.35)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  let s = `<defs><linearGradient id="${id}_rc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .32)}"/><stop offset=".45" stop-color="${m}"/><stop offset="1" stop-color="${shade(m, -.3)}"/></linearGradient></defs>`;
  s += `<g transform="scale(${f(u)} ${f(v)})">${button(-1, -3.55)}${button(-1, 6.3)}${button(1, 6.3)}</g>`;
  s += `<path d="${d}" fill="url(#${id}_rc)" stroke="${shade(m, -.45)}" stroke-width=".14"/>`;
  s += `<g transform="scale(${f(u)} ${f(v)})">`;
  // Moulded front: the case face steps in a little from its sides, lit along the top and left.
  const front = f91wCase(35.2 * .955, 38.2 * .955);
  s += `<defs><linearGradient id="${id}_rl" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".22"/><stop offset=".35" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs>`;
  s += `<path d="${front}" fill="${shade(m, .08)}"/><path d="${front}" fill="none" stroke="url(#${id}_rl)" stroke-width=".45"/>`;
  s += face();
  s += lcd(id, o.glow, F91W_SAMPLE);
  // The resin crystal: one faint reflection across the top left of the window.
  s += `<path d="M-13.2,-6.5Q-12.6,-10.4 -8.5,-10.6L-7.2,-10.6Q-11.4,-9.6 -12.2,-5Z" fill="#fff" opacity=".07"/>`;
  return s + '</g>';
}
