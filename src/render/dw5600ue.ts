import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { buttonGrad, casioLogo, mirrored, rrect, type Seg } from './casio';
import { lcdCell, lcdChars, lcdDisplay, lcdIndicator } from './lcd';
import { backlight, rgba } from './night';

// Casio G-Shock DW-5600UE-1: the square 5600 in black resin. Flat lug blocks top and bottom, each with two moulded
// bosses, under an octagonal protective bezel with stepped guards round four buttons (ADJUST recessed). The bezel
// carries PROTECTION and G-SHOCK on its top and bottom plates; the window has a silver line, CASIO, WATER 20BAR RESIST,
// ILLUMINATOR, the side labels, LED BACKLIGHT, ALARM, CHRONO and the SHOCK RESIST badge, and a positive LCD with its
// digits leaning about 6°. The case centre is the origin; everything is in millimetres at Casio's 42.8 × 48.9 mm,
// scaled to the catalogue size. See docs/models/casio-dw-5600ue-1.md.

const f = (n: number) => +n.toFixed(3);

/** The moment the drawing shows without live time, as in Casio's photo: Sunday 30 June, 10:58:50 pm. */
export const DW5600UE_SAMPLE = new Date(2024, 5, 30, 22, 58, 50);

/**
 * A right side from its upper quarter (top centre down to the waist): straight down the waist, then the quarter
 * mirrored back up to the bottom centre, each curve with its control point mirrored.
 */
function rightSide(top: Seg[], y0: number): Seg[] {
  const mir = ([x, y]: number[]) => [x, -y];
  const out: Seg[] = [...top, { to: mir(top[top.length - 1].to) }];
  for (let i = top.length - 1; i >= 0; i--) out.push({ to: mir(i ? top[i - 1].to : [0, y0]), c: top[i].c && mir(top[i].c!) });
  return out;
}

/**
 * The case's right side down to the waist, measured from the photo and averaged top and bottom: the lug block's
 * slanted side, the bezel's rounded corner, a small step out at the upper guard, the notch round the button, and the
 * swell to the full 42.8 mm across the middle.
 */
const CASE_TOP: Seg[] = [
  { to: [12.45, -24.45] }, { to: [12.85, -24.1], c: [12.8, -24.45] }, { to: [14.95, -15.75] }, { to: [16.7, -15] }, { to: [17.5, -14.2] },
  { to: [18, -13.3] }, { to: [18.05, -12.4] }, { to: [19.45, -11.6] }, { to: [19.9, -10.7] }, { to: [19.75, -9.9] }, { to: [19.5, -9] },
  { to: [19.6, -8.3] }, { to: [19.9, -7.3] }, { to: [20.15, -5.6] }, { to: [20.4, -4.75] }, { to: [21, -3.85] }, { to: [21.4, -3] },
];
/** The bezel's outline: its top edge across the lug block, then the same sides as the case. */
const BEZEL_TOP: Seg[] = [{ to: [10.9, -17.2] }, { to: [14.6, -15.85], c: [13.1, -17.1] }, ...CASE_TOP.slice(3)];
/** The bezel's flat front, inside the stepped outer edge. */
const FACE_TOP: Seg[] = [{ to: [10.5, -16.7] }, { to: [16.2, -14.4], c: [14.6, -16.5] }, { to: [18.55, -11], c: [17.9, -13.2] }, { to: [19.2, -4.6] }];

const outline = (top: Seg[], y0: number, p: (pt: number[]) => string) => mirrored(rightSide(top, y0), y0, p);
const mm = ([x, y]: number[]) => `${f(x)},${f(y)}`;

/** The case outline at width D and length LL. */
export function dw5600ueCase(D: number, LL: number) {
  const u = D / 42.8, v = LL / 48.9;
  return outline(CASE_TOP, -24.45, ([x, y]) => `${f(x * u)},${f(y * v)}`);
}

/** A rounded rectangle from (x0, y0) to (x1, y1). */
const box = (x0: number, y0: number, x1: number, y1: number, r: number) => rrect(x0, y0, x1 - x0, y1 - y0, r);

/** A chrome push button standing out of the guard at height y on side sx. */
function button(id: string, sx: number, y: number) {
  const x0 = sx * 19.1, x1 = sx * 20.45, h = 1.2;
  return `<path d="M${f(x0)},${f(y - h)}H${f(x1 - sx * .3)}Q${f(x1)},${f(y - h)} ${f(x1)},${f(y - h + .35)}V${f(y + h - .35)}Q${f(x1)},${f(y + h)} ${f(x1 - sx * .3)},${f(y + h)}H${f(x0)}Z" fill="url(#${id}_bt)" stroke="#3a3e42" stroke-width=".08"/>`;
}

/** A moulded boss on a lug block: a raised ring round a shallow dish, lit from the top left. */
function boss(m: string, x: number, y: number) {
  return `<circle cx="${f(x)}" cy="${f(y)}" r="1.12" fill="${shade(m, .32)}"/><circle cx="${f(x + .1)}" cy="${f(y + .1)}" r="1.08" fill="${shade(m, -.45)}"/>`
    + `<circle cx="${f(x)}" cy="${f(y)}" r=".95" fill="${shade(m, .08)}"/><circle cx="${f(x + .1)}" cy="${f(y + .12)}" r=".68" fill="${shade(m, -.12)}"/>`;
}

/**
 * The resin case and bezel, each lit from the top left: the lug blocks with their bosses, the bezel's stepped outer
 * edge and flat front, and the plates above and below the window that carry PROTECTION and G-SHOCK.
 */
function caseFront(id: string, m: string) {
  const lit = shade(m, .5), deep = shade(m, -.6);
  let s = `<defs><linearGradient id="${id}_bz" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .3)}"/><stop offset=".5" stop-color="${shade(m, .08)}"/><stop offset="1" stop-color="${shade(m, -.3)}"/></linearGradient>`
    + `<linearGradient id="${id}_bf" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="${shade(m, .26)}"/><stop offset=".55" stop-color="${shade(m, .1)}"/><stop offset="1" stop-color="${shade(m, -.08)}"/></linearGradient></defs>`;
  // The lug blocks: flat, a little lighter where they face up, with two bosses each.
  s += `<path d="M-12.6,-24.2H12.6L14.7,-16.6H-14.7Z" fill="${shade(m, .3)}" opacity=".5"/><path d="M-12.6,24.2H12.6L14.7,16.6H-14.7Z" fill="${shade(m, .12)}" opacity=".4"/>`;
  s += `<path d="M-12.5,-24.3H12.5" stroke="${lit}" stroke-width=".22" opacity=".5"/>`;
  for (const sy of [-1, 1]) for (const sx of [-1, 1]) s += boss(m, sx * 9.95, sy * 20.7);
  // The bezel: its stepped outer edge, then the flat front.
  s += `<path d="${outline(BEZEL_TOP, -17.2, mm)}" fill="url(#${id}_bz)" stroke="${deep}" stroke-width=".14"/>`;
  s += `<path d="${outline(FACE_TOP, -16.7, mm)}" fill="url(#${id}_bf)"/>`;
  s += `<path d="M-19.15,3V-4.6L-18.55,-11Q-17.9,-13.2 -16.2,-14.4Q-14.6,-16.5 -10.5,-16.7H10" fill="none" stroke="${lit}" stroke-width=".2" opacity=".45"/>`;
  // The plates: grooves either side running from the bezel's top and bottom edges in to the window.
  s += `<path d="M-11.1,-16.7L-9.75,-13.2M11.1,-16.7L9.75,-13.2M-9.8,11.9L-11.1,16.7M9.8,11.9L11.1,16.7" stroke="${deep}" stroke-width=".22"/>`;
  s += `<path d="M-10.9,-16.7L-9.55,-13.2M10.2,11.95L11.4,16.6" stroke="${lit}" stroke-width=".1" opacity=".5"/>`;
  return s;
}

/** The printed black face: silver line, the CASIO logo, labels, the side markings and the SHOCK RESIST badge. */
function face() {
  const white = '#e4e3e3', gold = '#bc9748', cyan = '#3ea9c6', sans = 'font-family="Arial,Helvetica,sans-serif" font-weight="700"';
  let s = `<path d="${box(-14.7, -12.65, 14.7, 12.1, 3.8)}" fill="#09090a" stroke="#000" stroke-width=".2"/>`;
  s += `<path d="${box(-14.13, -12.08, 14.13, 11.55, 3.3)}" fill="none" stroke="#c4c4c4" stroke-width=".3"/>`;
  s += casioLogo('#d6d6d6', 'translate(5.12 -1.5) scale(.958 1.016)');
  s += `<text x="-8.56" y="-9.12" ${sans} font-size="1.15" textLength="17.21" lengthAdjust="spacingAndGlyphs" fill="${cyan}">WATER 20BAR RESIST</text>`;
  s += `<text x="-4.7" y="-7.66" ${sans} font-style="italic" font-size="1.13" textLength="9.45" lengthAdjust="spacingAndGlyphs" fill="#cfcfd1">ILLUMINATOR</text>`;
  s += `<path d="M-5.51,-8.065L-4.85,-8.42V-7.71ZM5.59,-8.065L4.93,-8.42V-7.71Z" fill="#cfcfd1"/>`;
  // Button labels read along the sides, with gold dots by the buttons.
  s += `<g ${sans} font-size=".9" fill="${white}"><text transform="translate(-12.65 -1.85) rotate(-90)" textLength="3.61" lengthAdjust="spacingAndGlyphs">ADJUST</text>`
    + `<text transform="translate(-12.65 4.69) rotate(-90)" textLength="2.63" lengthAdjust="spacingAndGlyphs">MODE</text>`
    + `<text transform="translate(12.73 -5.46) rotate(90)" textLength="5.8" lengthAdjust="spacingAndGlyphs">START/STOP</text>`
    + `<text transform="translate(12.73 2.11) rotate(90)" textLength="2.54" lengthAdjust="spacingAndGlyphs">LIGHT</text></g>`;
  s += `<g fill="${gold}"><circle cx="-12.95" cy="-6.36" r=".4"/><circle cx="12.95" cy="-6.36" r=".4"/><circle cx="-12.97" cy="5.6" r=".4"/><circle cx="12.97" cy="5.6" r=".4"/></g>`;
  s += `<text x="-5.51" y="7.57" ${sans} font-size=".96" textLength="11.14" lengthAdjust="spacingAndGlyphs" fill="${white}">LED BACKLIGHT</text>`;
  s += `<g ${sans} font-size="1.26" fill="${gold}"><text x="-8.77" y="10.06" textLength="4.73" lengthAdjust="spacingAndGlyphs">ALARM</text><text x="3.96" y="10.06" textLength="5.67" lengthAdjust="spacingAndGlyphs">CHRONO</text></g>`;
  // The SHOCK RESIST badge: a gold-outlined shield with a red chevron at its point.
  s += `<path d="M-2.65,8.17H2.83L3.05,8.55V10.2L.09,11.12L-2.87,10.2V8.55Z" fill="#050505" stroke="${gold}" stroke-width=".15" stroke-linejoin="round"/>`;
  s += `<path d="M-1.96,10.04H2.24L.09,10.78Z" fill="#b5231b"/>`;
  s += `<g ${sans} font-size=".85" fill="${gold}"><text x="-2.39" y="9.08" textLength="4.95" lengthAdjust="spacingAndGlyphs">SHOCK</text><text x="-2.39" y="9.76" textLength="4.88" lengthAdjust="spacingAndGlyphs">RESIST</text></g>`;
  return s;
}

/** The bezel's printing: PROTECTION above the window and G-SHOCK below it, in white. */
const plates = () => {
  const sans = 'font-family="Arial,Helvetica,sans-serif" font-weight="700"';
  return `<text x="-8.17" y="-14.75" ${sans} font-size="1.86" textLength="16.34" lengthAdjust="spacingAndGlyphs" fill="#e6e5e5">PROTECTION</text>`
    + `<text x="-8.43" y="14.84" ${sans} font-size="2.53" textLength="17.16" lengthAdjust="spacingAndGlyphs" fill="#e6e5e5">G-SHOCK</text>`;
};

/** Leans a row of cells by about 6° about its mid-height, as the module's digits are. */
const lean = (y: number, body: string) => `<g transform="translate(0 ${f(y)}) skewX(-5.7) translate(0 ${f(-y)})">${body}</g>`;

/**
 * The LCD: a dark frame with a fine light line, the light grey panel shaded under its top and left edges, the hidden
 * LED glow, and every segment of the time, day, month and date.
 */
function lcd(id: string, glow: string | undefined, at: Date) {
  const ink = '#101110', panel = box(-10.28, -6.71, 10.28, 5.94, .55);
  let s = `<path d="${box(-10.92, -7.31, 10.92, 6.54, .9)}" fill="#1b1c1d"/><path d="M-10.5,4.5V-6.4Q-10.5,-7 -9.9,-7H9.9" fill="none" stroke="#5a5c5e" stroke-width=".14"/>`;
  s += `<path d="${box(-10.5, -7, 10.5, 6.2, .65)}" fill="none" stroke="#d2d2d2" stroke-width=".12"/>`;
  s += `<defs><linearGradient id="${id}_lp" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5c5d59"/><stop offset=".06" stop-color="#a9aaa3"/><stop offset=".14" stop-color="#b8b9b2"/><stop offset="1" stop-color="#bdbeb7"/></linearGradient>`
    + `<radialGradient id="${id}_led" gradientUnits="userSpaceOnUse" cx="0" cy="-.4" r="13"><stop stop-color="${rgba(glow ?? '#000', 1)}" stop-opacity=".97"/><stop offset=".7" stop-color="${rgba(glow ?? '#000', 1)}" stop-opacity=".85"/><stop offset="1" stop-color="${rgba(glow ?? '#000', 1)}" stop-opacity=".66"/></radialGradient></defs>`;
  s += `<path d="${panel}" fill="url(#${id}_lp)"/><path d="M-10.28,4.8V-6.16Q-10.28,-6.71 -9.73,-6.71" fill="none" stroke="#000" stroke-width=".3" opacity=".25"/>`;
  // Super Illuminator: the white LED lights the whole panel, falling off a little towards its edges.
  if (glow) s += backlight(`<path d="${panel}" fill="url(#${id}_led)"/>`);
  // The month and date sit in a printed box.
  s += `<path d="${box(-1.39, -5.69, 9.47, -1.29, .3)}" fill="none" stroke="${ink}" stroke-width=".11"/>`;
  const c = lcdChars(at);
  // Main row: hour (its tens digit only ever shows 1), colon, minutes, and the smaller seconds, bottom-aligned.
  let main = lcdCell('hour-tens', -7.97, .17, 1, 4.61, .62, c['hour-tens'], 'bc');
  main += lcdCell('hour', -5.95, .17, 2.3, 4.61, .62, c.hour);
  main += lcdCell('minute-tens', -1.55, .17, 2.3, 4.61, .62, c['minute-tens']);
  main += lcdCell('minute', 1.81, .17, 2.3, 4.61, .62, c.minute);
  let secs = lcdCell('second-tens', 5.1, 1.41, 1.72, 3.45, .52, c['second-tens']);
  secs += lcdCell('second', 7.45, 1.41, 1.72, 3.45, .52, c.second);
  // Top row: the day, then the month and date with a fixed dash between them.
  let top = lcdCell('day-1', -6.63, -4.92, 1.55, 2.75, .45, c['day-1'], 'abcdefgkn');
  top += lcdCell('day-2', -3.99, -4.92, 1.6, 2.75, .45, c['day-2'], 'abcdefgkn');
  top += lcdCell('month-tens', -.3, -5.03, 1.5, 2.95, .45, c['month-tens']);
  top += lcdCell('month', 1.6, -5.03, 1.5, 2.95, .45, c.month);
  top += `<path d="M3.55,-3.74H4.2L4.13,-3.48H3.48Z"/>`;
  top += lcdCell('date-tens', 5.1, -5.03, 1.5, 2.95, .45, c['date-tens']);
  top += lcdCell('date', 7, -5.03, 1.55, 2.95, .45, c.date);
  let cells = lean(2.475, main) + lean(3.135, secs) + lean(-3.53, top);
  cells += `<circle cx="-2.44" cy="1.41" r=".36"/><circle cx="-2.66" cy="3.56" r=".36"/>`;
  // PM, and the hourly-signal, alarm and light indicators, drawn off: nothing is set.
  cells += lcdIndicator('pm', `<text x="-8.99" y="-.47" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="1.38" textLength="2.07" lengthAdjust="spacingAndGlyphs">PM</text>`, c.pm === 'on');
  cells += lcdIndicator('signal', `<path d="M-9.2,-4.7H-8.95A.31,.31 0 0 1 -8.95,-4.08H-9.2ZM-8.68,-4.7h.2v.62h-.2ZM-8.34,-4.7h.2v.62h-.2ZM-8,-4.7h.2v.62h-.2ZM-7.66,-4.7h.2v.62h-.2Z"/>`, false);
  cells += lcdIndicator('alarm', `<path d="M-8.3,-3.66Q-8.8,-3.48 -8.8,-2.95V-2.78L-8.88,-2.66H-7.72L-7.8,-2.78V-2.95Q-7.8,-3.48 -8.3,-3.66ZM-8.48,-2.58h.36A.18,.18 0 0 1 -8.48,-2.58Z"/>`, false);
  cells += lcdIndicator('light', `<path d="M7.335,-.74L7.6,-.3L8.1,-.45L7.95,.035L8.65,.035L7.95,.035L8.1,.52L7.6,.37L7.335,.81L7.07,.37L6.57,.52L6.72,.035L6.02,.035L6.72,.035L6.57,-.45L7.07,-.3ZM7.03,-.27h.61v.61h-.61Z" fill-rule="evenodd"/>`, false);
  return s + lcdDisplay(at, '12h', ink, cells);
}

export interface DW5600UEOptions { D: number; LL: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number; glow?: string }

/** Everything above the strap for the Casio G-Shock DW-5600UE-1. */
export function dw5600ueSVG(o: DW5600UEOptions) {
  const { D, LL, id, L, outline: out } = o;
  const d = dw5600ueCase(D, LL), u = D / 42.8, v = LL / 48.9, m = L.caseColor;
  if (out) return `<path d="${d}" fill="none" ${o.stroke}/><g transform="scale(${f(u)} ${f(v)})"><path d="${box(-14.7, -12.65, 14.7, 12.1, 3.8)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/></g>`;
  let s = `<defs><linearGradient id="${id}_rc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .22)}"/><stop offset=".5" stop-color="${m}"/><stop offset="1" stop-color="${shade(m, -.3)}"/></linearGradient>${buttonGrad(id)}</defs>`;
  // START/STOP and LIGHT on the right, MODE lower left; ADJUST, upper left, sits recessed in its guard.
  s += `<g transform="scale(${f(u)} ${f(v)})">${button(id, 1, -6.95)}${button(id, 1, 6.95)}${button(id, -1, 6.95)}</g>`;
  s += `<path d="${d}" fill="url(#${id}_rc)" stroke="${shade(m, -.55)}" stroke-width=".14"/>`;
  s += `<g transform="scale(${f(u)} ${f(v)})">`;
  s += caseFront(id, m);
  s += `<path d="M-19.55,-8.1h.5v1.9h-.5Z" fill="${shade(m, -.7)}"/>`;
  s += plates();
  s += face();
  s += lcd(id, o.glow, DW5600UE_SAMPLE);
  // The mineral glass: a faint reflection across the upper left.
  s += `<path d="M-14.2,-3Q-14.1,-11.8 -7,-11.95L-4.5,-11.95Q-12.4,-11 -12.9,-1.8Z" fill="#fff" opacity=".06"/>`;
  return s + '</g>';
}
