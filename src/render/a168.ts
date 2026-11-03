import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { lcdCell, lcdChars, lcdDisplay, lcdIndicator } from './lcd';
import { backlight, rgba } from './night';
import { buttonGrad, casioLogo, mirrored, rrect, type Seg } from './casio';

// Casio A168WA-1: a chrome-plated resin case, octagonal with sloped blocks top and bottom where the bracelet enters,
// angled shoulders and slight guards round its three buttons; a black window with a blue ring and a silver line,
// printed CASIO, ALARM CHRONO, the blue ELECTRO LUMINESCENCE arrow, ILLUMINATOR and WATER [WR] RESIST; and a positive
// LCD lit by an electroluminescent panel. The case centre is the origin. Everything is in millimetres at Casio's
// 36.3 × 38.6 mm, scaled to the catalogue size. See docs/models/casio-a168wa-1.md.

const f = (n: number) => +n.toFixed(3);

/** The moment the drawing shows without live time, as in Casio's photo: Sunday the 30th, 10:58:50 pm. */
export const A168_SAMPLE = new Date(2026, 7, 30, 22, 58, 50);


/**
 * The case's right side, top centre to bottom centre: the sloped top block, a long straight shoulder, a rounded step
 * out to the guards round the buttons (36.3 mm across) with a slight waist between them, and the same below.
 */
const RIGHT: Seg[] = [
  { to: [11.05, -19.3] }, { to: [11.5, -19], c: [11.45, -19.3] }, { to: [12.55, -16.1] }, { to: [16.3, -9.95] },
  { to: [17.7, -8.8], c: [16.85, -8.95] }, { to: [18.15, -8.2], c: [18.15, -8.75] }, { to: [18.15, -3.9] }, { to: [17.75, -3.5] },
  { to: [17.75, 3.5] }, { to: [18.15, 3.9] }, { to: [18.15, 8.2] }, { to: [17.7, 8.8], c: [18.15, 8.75] }, { to: [16.3, 9.95], c: [16.85, 8.95] },
  { to: [12.55, 16.1] }, { to: [11.5, 19] }, { to: [11.05, 19.3], c: [11.45, 19.3] }, { to: [0, 19.3] },
];


/** The case outline at width D and length LL. */
export function a168Case(D: number, LL: number) {
  const u = D / 36.3, v = LL / 38.6;
  return mirrored(RIGHT, -19.3, ([x, y]) => `${f(x * u)},${f(y * v)}`);
}

/**
 * The front's flat surround: its top and bottom edges where the sloped facets begin, shoulders parallel to the
 * case's, and straight sides inside the polished flanks.
 */
const FRONT: Seg[] = [
  { to: [12.15, -14.6] }, { to: [15.1, -9.76] }, { to: [16.35, -7.6], c: [16.35, -8.95] }, { to: [16.35, 7.6] }, { to: [15.1, 9.76], c: [16.35, 8.95] },
  { to: [12.15, 14.6] }, { to: [0, 14.6] },
];
const mm = ([x, y]: number[]) => `${f(x)},${f(y)}`;


/**
 * A rounded rectangle whose corners are near-circular arcs, like the window's: a cubic per corner bowing slightly
 * further out than a quarter circle.
 */
function softRect(x0: number, y0: number, x1: number, y1: number, r: number) {
  const k = r * .5;
  return `M${f(x0 + r)},${f(y0)}H${f(x1 - r)}C${f(x1 - r + k)},${f(y0)} ${f(x1)},${f(y0 + r - k)} ${f(x1)},${f(y0 + r)}V${f(y1 - r)}`
    + `C${f(x1)},${f(y1 - r + k)} ${f(x1 - r + k)},${f(y1)} ${f(x1 - r)},${f(y1)}H${f(x0 + r)}C${f(x0 + r - k)},${f(y1)} ${f(x0)},${f(y1 - r + k)} ${f(x0)},${f(y1 - r)}`
    + `V${f(y0 + r)}C${f(x0)},${f(y0 + r - k)} ${f(x0 + r - k)},${f(y0)} ${f(x0 + r)},${f(y0)}Z`;
}

/** The black window, 30 × 25.8 mm, centred in the case with large rounded corners. */
export const A168_WINDOW = { x0: -15, y0: -12.9, x1: 15, y1: 12.9, r: 7.2 };

/** A chrome push button on the case side at height y, pointing out on side sx: a short cylinder with a flat cap. */
function button(id: string, sx: number, y: number) {
  const x0 = sx * 17.6, x1 = sx * 19.25, h = 1.22;
  return `<path d="M${f(x0)},${f(y - h)}H${f(x1 - sx * .3)}Q${f(x1)},${f(y - h)} ${f(x1)},${f(y - h + .35)}V${f(y + h - .35)}Q${f(x1)},${f(y + h)} ${f(x1 - sx * .3)},${f(y + h)}H${f(x0)}Z" fill="url(#${id}_bt)" stroke="#4b5055" stroke-width=".08"/>`
    + `<path d="M${f(x1 - sx * .55)},${f(y - h + .1)}V${f(y + h - .1)}" stroke="#6d7277" stroke-width=".12"/>`;
}


/**
 * The chrome front, drawn as its own faces over the case: the sloped blocks top and bottom where the bracelet enters,
 * the facet below each, the polished flanks down the sides (the case fill showing), and the flat surround round the
 * window, each lit from the top left.
 */
function front(id: string, m: string) {
  const deep = shade(m, -.5), lit = shade(m, .75);
  let s = `<defs><linearGradient id="${id}_fs" x1="0" y1="0" x2=".35" y2="1"><stop stop-color="${shade(m, .8)}"/><stop offset=".45" stop-color="${shade(m, .5)}"/><stop offset=".8" stop-color="${shade(m, .3)}"/><stop offset="1" stop-color="${shade(m, .15)}"/></linearGradient>`
    + `<linearGradient id="${id}_bk" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${shade(m, .3)}"/><stop offset=".4" stop-color="${shade(m, .72)}"/><stop offset=".6" stop-color="${shade(m, .55)}"/><stop offset="1" stop-color="${shade(m, .12)}"/></linearGradient></defs>`;
  // Sloped blocks: the top one faces the light, the bottom one turns away from it.
  s += `<path d="M-11.05,-19.3H11.05L12.55,-16.1H-12.55Z" fill="url(#${id}_bk)"/><path d="M-11.05,19.3H11.05L12.55,16.1H-12.55Z" fill="url(#${id}_bk)" opacity=".6"/>`;
  // A soft highlight across each block, strongest at the top.
  s += `<path d="M-9,-18.55H6.5" stroke="#fff" stroke-width=".55" stroke-linecap="round" opacity=".38"/><path d="M-8,17.2H5" stroke="#fff" stroke-width=".4" stroke-linecap="round" opacity=".18"/>`;
  s += `<path d="M-12.55,-16.1H12.55M-12.55,16.1H12.55" stroke="${deep}" stroke-width=".12"/><path d="M-12.4,-15.95H12.4" stroke="${lit}" stroke-width=".1" opacity=".5"/>`;
  // The flat surround, brightest at the top left.
  s += `<path d="M-17.25,-7.6V7.6M17.25,-7.6V7.6" stroke="${lit}" stroke-width=".4" opacity=".75"/><path d="M-16.75,-7.4V7.4M16.75,-7.4V7.4" stroke="${shade(m, -.38)}" stroke-width=".28" opacity=".65"/>`;
  s += `<path d="${mirrored(FRONT, -14.6, mm)}" fill="url(#${id}_fs)" stroke="${shade(m, -.42)}" stroke-width=".13"/>`;
  s += `<path d="M-16.1,6.5V-7.5Q-16.1,-8.8 -15,-9.6L-12.05,-14.35H12" fill="none" stroke="#fff" stroke-width=".2" opacity=".7"/>`;
  // Restrained specular glints: the surround's top-left corner and the left flank catch the light.
  s += `<path d="M-15.55,-6.2V-8.2Q-15.55,-8.9 -14.95,-9.5L-13.3,-12.2" fill="none" stroke="#fff" stroke-width=".45" stroke-linecap="round" opacity=".55"/><path d="M-17.35,-6.8V-1.2" stroke="#fff" stroke-width=".3" stroke-linecap="round" opacity=".5"/>`;
  // Light caught along the top of the left shoulder, and shade under the right one.
  s += `<path d="M-12.35,-16.3L-16.05,-10.2" stroke="${lit}" stroke-width=".3" opacity=".45"/><path d="M12.4,16.3L16.1,10.2" stroke="${deep}" stroke-width=".3" opacity=".35"/>`;
  return s;
}


/** The printed black window: blue ring, silver line, the CASIO mark, labels, the EL arrow and the water-resist badge. */
function face() {
  const blue = '#00578e', band = '#0a4a78', gold = '#c09e62', grey = '#c4c2c6', red = '#d4505a', silver = '#a3a2a4';
  const sans = 'font-family="Arial,Helvetica,sans-serif" font-weight="700"', W = A168_WINDOW;
  let s = `<path d="${softRect(W.x0, W.y0, W.x1, W.y1, W.r)}" fill="#060709" stroke="#3a3e44" stroke-width=".22"/>`;
  // The window's bevel catches a little light along its top.
  s += `<path d="M-13.9,-6Q-14.4,-11.7 -8.4,-12.55H8.4Q14.4,-11.7 13.9,-6" fill="none" stroke="#5c6168" stroke-width=".14" opacity=".55"/>`;
  s += `<path d="${softRect(-13.82, -11.96, 13.82, 11.96, 6.3)}" fill="none" stroke="${blue}" stroke-width=".4"/>`;
  s += `<path d="${softRect(-13.11, -11.21, 13.11, 11.21, 5.6)}" fill="none" stroke="${silver}" stroke-width=".27"/>`;
  s += casioLogo('#d4d4d6');
  s += `<text x="-.65" y="-8.92" ${sans} font-size="1.13" textLength="10.07" lengthAdjust="spacingAndGlyphs" fill="${gold}">ALARM CHRONO</text>`;
  // The blue band, an arrow pointing to the LIGHT button, with its lettering in silver small capitals.
  s += `<path d="M-10.32,-6.89L-9.05,-7.88H9.72V-5.9H-9.05Z" fill="${band}"/>`;
  // Each run is its own text with its own measured length: a font-size tspan inside a stretched text isn't drawn
  // reliably by the share-image renderer.
  const el = (x: number, len: number, size: number, t: string) => `<text x="${x}" y="-6.39" font-size="${size}" textLength="${len}" lengthAdjust="spacingAndGlyphs">${t}</text>`;
  s += `<g ${sans} font-style="italic" fill="#bdb6ba">${el(-8.24, 1.09, 1.63, 'E')}${el(-7.09, 4.71, 1.2, 'LECTRO')}${el(-2.15, .94, 1.63, 'L')}${el(-1.08, 9.28, 1.2, 'UMINESCENCE')}</g>`;
  // Button labels, read along the sides, with red dots by the buttons.
  s += `<g ${sans} font-size="1.28" fill="${grey}"><text transform="translate(-11.92 -4.79) rotate(90)" textLength="3.75" lengthAdjust="spacingAndGlyphs">LIGHT</text>`
    + `<text transform="translate(-11.98 1.26) rotate(90)" textLength="3.75" lengthAdjust="spacingAndGlyphs">MODE</text>`
    + `<text transform="translate(12.17 5.05) rotate(-90)" textLength="8.65" lengthAdjust="spacingAndGlyphs">START/STOP</text></g>`;
  s += `<g fill="${red}"><circle cx="-11.33" cy="-5.82" r=".47"/><circle cx="-11.37" cy="5.92" r=".47"/><circle cx="11.33" cy="5.92" r=".47"/></g>`;
  s += `<text x="-6.14" y="6.99" ${sans} font-style="italic" font-size="1.58" textLength="12.09" lengthAdjust="spacingAndGlyphs" fill="${red}">ILLUMINATOR</text>`;
  s += `<path d="M-6.6,5.88L-7.78,6.43L-6.75,6.98ZM6.55,5.88L7.64,6.43L6.4,6.98Z" fill="${red}"/>`;
  s += `<path d="M-10.64,7.925H10.64" stroke="${silver}" stroke-width=".21"/>`;
  s += `<g ${sans} font-size="1.19" fill="${gold}"><text x="-8.72" y="9.82" textLength="5.34" lengthAdjust="spacingAndGlyphs">WATER</text><text x="3.53" y="9.86" textLength="5.43" lengthAdjust="spacingAndGlyphs">RESIST</text></g>`;
  // The WR badge: two corners rounded, two cut.
  s += `<path d="M-2.27,8.57H2.15L2.6,9.02V10.01Q2.6,10.26 2.35,10.26H-2.07L-2.52,9.81V8.82Q-2.52,8.57 -2.27,8.57Z" fill="none" stroke="${gold}" stroke-width=".17"/>`;
  s += `<g transform="translate(0 9.99) skewX(-14)"><text x="-1.6" ${sans} font-size="1.42" textLength="3.3" lengthAdjust="spacingAndGlyphs" fill="${gold}">WR</text></g>`;
  return s;
}

/** The LCD: the grey panel shaded under its top edge, the hidden EL glow, and every segment of the time, day and date. */
function lcd(id: string, glow: string | undefined, at: Date) {
  const ink = '#141613', panel = rrect(-9.79, -4.96, 19.58, 9.67, 1);
  let s = `<defs><linearGradient id="${id}_lp" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#4c4d48"/><stop offset=".05" stop-color="#8b8e86"/><stop offset=".14" stop-color="#a2a59c"/><stop offset="1" stop-color="#a6a9a0"/></linearGradient></defs>`;
  s += `<path d="${panel}" fill="url(#${id}_lp)"/>`;
  // An electroluminescent panel lights the whole display evenly, unlike the F-91W's single LED.
  if (glow) s += backlight(`<path d="${panel}" fill="${rgba(glow, 1)}" fill-opacity=".9"/><path d="${rrect(-9.79, -4.96, 19.58, 1.1, 1)}" fill="rgba(0,0,0,1)" fill-opacity=".25"/>`);
  const c = lcdChars(at);
  let cells = '';
  // Hour (its tens digit only ever shows 1), colon, minutes, then the smaller seconds, bottom-aligned.
  cells += lcdCell('hour-tens', -7.75, -.51, 1, 4.39, .62, c['hour-tens'], 'bc');
  cells += lcdCell('hour', -5.92, -.51, 2.35, 4.39, .6, c.hour);
  cells += `<circle cx="-2.63" cy=".79" r=".36"/><circle cx="-2.63" cy="2.58" r=".36"/>`;
  cells += lcdCell('minute-tens', -1.7, -.51, 2.35, 4.39, .6, c['minute-tens']);
  cells += lcdCell('minute', 1.52, -.51, 2.35, 4.39, .6, c.minute);
  cells += lcdCell('second-tens', 4.72, .77, 1.68, 3.13, .46, c['second-tens']);
  cells += lcdCell('second', 6.93, .77, 1.72, 3.13, .46, c.second);
  // Top row: day letters, date, PM and the hourly-signal and alarm indicators (drawn off: nothing is set).
  cells += lcdCell('day-1', -.86, -3.58, 1.32, 2.03, .3, c['day-1'], 'abcdefgkn');
  cells += lcdCell('day-2', 1.16, -3.58, 1.33, 2.03, .3, c['day-2'], 'abcdefgkn');
  cells += lcdCell('date-tens', 4.46, -3.71, 1.52, 2.22, .37, c['date-tens']);
  cells += lcdCell('date', 6.42, -3.71, 1.55, 2.22, .37, c.date);
  cells += lcdIndicator('pm', `<text x="-8.36" y="-1.49" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="1.5" textLength="2" lengthAdjust="spacingAndGlyphs">PM</text>`, c.pm === 'on');
  cells += lcdIndicator('signal', `<path d="M-8.31,-3.9H-7.95A.41,.41 0 0 1 -7.95,-3.09H-8.31ZM-7.68,-3.9h.27Q-7.25,-3.5 -7.41,-3.09h-.27Q-7.52,-3.5 -7.68,-3.9ZM-7.21,-3.9h.27Q-6.78,-3.5 -6.94,-3.09h-.27Q-7.05,-3.5 -7.21,-3.9ZM-6.76,-3.9h.27Q-6.33,-3.5 -6.49,-3.09h-.27Q-6.6,-3.5 -6.76,-3.9Z"/>`, false);
  cells += lcdIndicator('alarm', `<path d="M-5.15,-3.88Q-5.6,-3.72 -5.6,-3.2V-3.12L-5.68,-3.04H-4.62L-4.7,-3.12V-3.2Q-4.7,-3.72 -5.15,-3.88ZM-5.33,-2.97h.36A.18,.18 0 0 1 -5.33,-2.97ZM-5.2,-4.05h.1v.18h-.1Z"/>`, false);
  return s + lcdDisplay(at, '12h', ink, cells);
}

export interface A168Options { D: number; LL: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number; glow?: string }

/** Everything above the strap for the Casio A168WA-1. */
export function a168SVG(o: A168Options) {
  const { D, LL, id, L, outline } = o;
  const d = a168Case(D, LL), u = D / 36.3, v = LL / 38.6, m = L.caseColor, W = A168_WINDOW;
  if (outline) return `<path d="${d}" fill="none" ${o.stroke}/><g transform="scale(${f(u)} ${f(v)})"><path d="${softRect(W.x0, W.y0, W.x1, W.y1, W.r)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/></g>`;
  // The polished flanks: bright at the top left, darker round to the bottom right.
  // The flanks and facets sit in shade between the bright blocks and surround, with a lighter band where they turn.
  let s = `<defs><linearGradient id="${id}_rc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .22)}"/><stop offset=".3" stop-color="${shade(m, -.14)}"/><stop offset=".52" stop-color="${shade(m, -.24)}"/><stop offset=".7" stop-color="${shade(m, -.06)}"/><stop offset="1" stop-color="${shade(m, -.46)}"/></linearGradient>${buttonGrad(id)}</defs>`;
  s += `<g transform="scale(${f(u)} ${f(v)})">${button(id, -1, -5.95)}${button(id, -1, 5.95)}${button(id, 1, 5.95)}</g>`;
  s += `<path d="${d}" fill="url(#${id}_rc)" stroke="${shade(m, -.5)}" stroke-width=".14"/>`;
  s += `<g transform="scale(${f(u)} ${f(v)})">`;
  s += front(id, m);
  s += face();
  s += lcd(id, o.glow, A168_SAMPLE);
  // The resin crystal: one faint reflection across the top left of the window.
  s += `<defs><linearGradient id="${id}_gl" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
  s += `<path d="M-14.6,-4.2Q-14.5,-12.6 -6.4,-12.75L-2.8,-12.75Q-11.4,-11.6 -13.1,-2.6Z" fill="url(#${id}_gl)"/>`;
  return s + '</g>';
}
