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
 * The bezel's outer edge, right side down to the waist, traced from the photo and averaged top and bottom. Deliberate
 * angular steps rather than one swollen outline: a 45° shoulder, a short flat, a step out to the upper guard, the
 * recess the button stands out of, a chamfer out to the flat-faced middle block, and that block at the full width.
 */
const BEZEL_SIDE: Seg[] = [
  { to: [14.05, -17.2] }, { to: [14.45, -17.05], c: [14.3, -17.2] }, { to: [17.85, -13.5] }, { to: [17.95, -13.2], c: [17.95, -13.4] },
  { to: [17.95, -12.3] }, { to: [18.3, -12.15] }, { to: [19.05, -12] }, { to: [19.8, -10.6] }, { to: [19.85, -9.6] }, { to: [19.45, -9.15] },
  { to: [19.45, -5.6] }, { to: [20.05, -5.25] }, { to: [21.15, -3.75] }, { to: [21.4, -3.45], c: [21.4, -3.7] },
];
/** The case outline's right side: the lug block's slanted side, then the bezel from where it stands out past it. */
const CASE_SIDE: Seg[] = [{ to: [12.45, -24.45] }, { to: [12.85, -24.1], c: [12.8, -24.45] }, { to: [15, -15.5] }, { to: [16.1, -15.36] }, ...BEZEL_SIDE.slice(2)];
/** The bezel front, inside the narrow outer rim: its top edge, a long 45° corner plane, and straight sides. */
const FRONT_SIDE: Seg[] = [{ to: [13.6, -16.75] }, { to: [14.3, -16.45], c: [14, -16.75] }, { to: [18.05, -12.7] }, { to: [18.85, -10.4], c: [18.85, -12] }, { to: [18.9, -4] }];

const outline = (top: Seg[], y0: number, p: (pt: number[]) => string) => mirrored(rightSide(top, y0), y0, p);
const mm = ([x, y]: number[]) => `${f(x)},${f(y)}`;

/** The case outline at width D and length LL. */
export function dw5600ueCase(D: number, LL: number) {
  const u = D / 42.8, v = LL / 48.9;
  return outline(CASE_SIDE, -24.45, ([x, y]) => `${f(x * u)},${f(y * v)}`);
}

/** A rounded rectangle from (x0, y0) to (x1, y1). */
const box = (x0: number, y0: number, x1: number, y1: number, r: number) => rrect(x0, y0, x1 - x0, y1 - y0, r);

/**
 * A closed contour from one quarter of points (x ≥ 0, below the centre line), traced from the photo, mirrored into the
 * other three and smoothed: each point becomes the control of a curve between the midpoints either side of it, so
 * straight runs stay straight and the long diagonal corners turn gently into them. `cy` is the contour's centre line.
 */
function contour(quarter: number[][], cy: number) {
  const q = quarter, pts = [
    ...[...q].reverse().map(([x, y]) => [x, -y]), ...q, ...[...q].reverse().map(([x, y]) => [-x, y]), ...q.map(([x, y]) => [-x, -y]),
  ].map(([x, y]) => [x, y + cy]);
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${mm(mid(pts[pts.length - 1], pts[0]))}`;
  pts.forEach((p, i) => { d += `Q${mm(p)} ${mm(mid(p, pts[(i + 1) % pts.length]))}`; });
  return d + 'Z';
}
/**
 * The face's contours, one quarter each measured on the photo's lower left and mirrored about the face's centre line,
 * 0.21 mm above the case's: long diagonal transitions, about 5 mm across and 6 mm down, between the straight sides
 * and the top and bottom edges. The black face's edge, the silver line just inside it, and the bezel's slope round it.
 */
const FACE_Y = -.21;
const FACE_Q = [[14.84, 0], [14.84, 4.8], [14.67, 6.31], [14.28, 7.31], [13.63, 8.31], [12.86, 9.31], [11.96, 10.31], [10.88, 11.31], [10.06, 11.81], [9, 12.26], [8, 12.31], [0, 12.31]];
const SILVER_Q = [[14.3, 0], [14.3, 4.8], [14.19, 6.31], [13.81, 7.31], [13.16, 8.31], [12.39, 9.31], [11.48, 10.31], [10.28, 11.31], [9.25, 11.81], [8.3, 11.87], [0, 11.87]];
const SLOPE_Q = [[15.9, 0], [15.9, 4.6], [15.72, 6.4], [15.25, 7.7], [14.5, 8.85], [13.6, 9.95], [12.5, 11.05], [11.3, 12.05], [10.3, 12.8], [9, 13.25], [8, 13.3], [0, 13.3]];
export const DW5600UE_FACE = contour(FACE_Q, FACE_Y);

/** A chrome push button standing out of its recess at height y on side sx: a short cylinder with a rounded end. */
function button(id: string, sx: number, y: number) {
  const x0 = sx * 19.2, x1 = sx * 20.65, h = 1.55;
  return `<path d="M${f(x0)},${f(y - h)}H${f(x1 - sx * .45)}Q${f(x1)},${f(y - h)} ${f(x1)},${f(y - h + .55)}V${f(y + h - .55)}Q${f(x1)},${f(y + h)} ${f(x1 - sx * .45)},${f(y + h)}H${f(x0)}Z" fill="url(#${id}_bt)" stroke="#2c2f32" stroke-width=".08"/>`
    + `<path d="M${f(x1 - sx * .5)},${f(y - h + .2)}V${f(y + h - .2)}" stroke="#7d8287" stroke-width=".14" opacity=".8"/>`;
}

/** Circles as one path's subpaths, so repeated details cost one element. */
const circles = (pts: number[][], r: number, dx = 0, dy = 0) =>
  pts.map(([x, y]) => `M${f(x + dx - r)},${f(y + dy)}a${r},${r} 0 1 0 ${f(2 * r)},0a${r},${r} 0 1 0 ${f(-2 * r)},0`).join('');

/**
 * The four recessed circles on the lug blocks, each layer drawn for all four at once: a raised lip round a deeper
 * dish, the dish shaded at the top and lit below.
 */
function bosses(m: string, pts: number[][]) {
  const arcs = pts.map(([x, y]) => `M${f(x - .75)},${f(y + .55)}A1,1 0 0 0 ${f(x + .75)},${f(y + .55)}`).join('');
  return `<path d="${circles(pts, 1.42)}" fill="${shade(m, .42)}" opacity=".7"/><path d="${circles(pts, 1.36, .08, .1)}" fill="${shade(m, -.5)}"/>`
    + `<path d="${circles(pts, 1.18)}" fill="${shade(m, .02)}"/><path d="${circles(pts, .92, 0, -.08)}" fill="${shade(m, -.42)}"/>`
    + `<path d="${circles(pts, .8, 0, .12)}" fill="${shade(m, -.14)}"/><path d="${arcs}" fill="none" stroke="${shade(m, .55)}" stroke-width=".12" opacity=".5"/>`;
}

/**
 * The resin case and bezel, lit from the top left, in three readable layers: the narrow outer rim with its angular
 * steps, guards and the flat-faced middle block; the bezel front with its long corner planes and the raised plates
 * that carry PROTECTION and G-SHOCK; and the slope down into the recessed face.
 */
function caseFront(id: string, m: string) {
  const lit = shade(m, .62), deep = shade(m, -.62);
  let s = `<defs><linearGradient id="${id}_bz" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .42)}"/><stop offset=".45" stop-color="${shade(m, .12)}"/><stop offset="1" stop-color="${shade(m, -.3)}"/></linearGradient>`
    + `<linearGradient id="${id}_bf" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="${shade(m, .2)}"/><stop offset=".55" stop-color="${shade(m, .04)}"/><stop offset="1" stop-color="${shade(m, -.14)}"/></linearGradient>`
    + `<linearGradient id="${id}_sl" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="${shade(m, .5)}"/><stop offset=".4" stop-color="${shade(m, .16)}"/><stop offset=".75" stop-color="${shade(m, -.2)}"/><stop offset="1" stop-color="${shade(m, -.36)}"/></linearGradient>`
    + `<linearGradient id="${id}_pl" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, .16)}"/><stop offset="1" stop-color="${shade(m, .02)}"/></linearGradient></defs>`;
  // The lug blocks: flat, a little lighter where they face up, each with two recessed circles.
  s += `<path d="M-12.6,-24.2H12.6L14.85,-16.9H-14.85Z" fill="${shade(m, .3)}" opacity=".45"/><path d="M-12.6,24.2H12.6L14.85,16.9H-14.85Z" fill="${shade(m, .12)}" opacity=".35"/>`;
  s += `<path d="M-12.5,-24.3H12.5" stroke="${lit}" stroke-width=".22" opacity=".45"/>`;
  s += bosses(m, [[-9.95, -20.7], [9.95, -20.7], [-9.95, 20.7], [9.95, 20.7]]);
  // The outer rim: the bezel's full outline, lit at the top left, with its steps marked and the middle block's flat face.
  s += `<path d="${outline(BEZEL_SIDE, -17.2, mm)}" fill="url(#${id}_bz)" stroke="${deep}" stroke-width=".14"/>`;
  // The steps at each corner and the chamfers into the middle block, then two small slots cut into the rim at each
  // corner: where the shoulder leaves the lug block, and at the guard's step.
  let steps = '', chamfers = '', slots = '', slotLips = '';
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const P = (x: number, y: number) => `${f(sx * x)},${f(sy * y)}`;
    steps += `M${P(17.95, 12.3)}L${P(19.05, 12)}`;
    chamfers += `M${P(19.45, 5.6)}L${P(20.05, 5.25)}`;
    slots += `M${P(14.5, 16.45)}L${P(14.95, 16)}L${P(15.17, 16.15)}L${P(14.72, 16.6)}ZM${P(17.4, 12.75)}L${P(18, 12.75)}L${P(18, 11.95)}L${P(17.4, 11.95)}Z`;
    slotLips += `M${P(17.4, 12.75)}L${P(18, 12.75)}`;
  }
  s += `<path d="${steps}" stroke="${deep}" stroke-width=".22"/><path d="${chamfers}" stroke="${deep}" stroke-width=".18" opacity=".8"/>`;
  s += `<path d="${slots}" fill="${shade(m, -.7)}"/><path d="${slotLips}" stroke="${shade(m, .5)}" stroke-width=".08" opacity=".5"/>`;
  s += `<path d="M-20.95,-3.3V3.3M20.95,-3.3V3.3" stroke="${deep}" stroke-width=".16" opacity=".7"/><path d="M-21.2,-3.1V3.1" stroke="${lit}" stroke-width=".22" opacity=".55"/>`;
  s += `<path d="M-14.3,-17.05L-17.75,-13.5M-19,-11.85L-19.7,-10.55" stroke="${lit}" stroke-width=".16" opacity=".5"/>`;
  // The bezel front, set off from the rim by a groove, with a narrow lit edge along its top and left.
  s += `<path d="${outline(FRONT_SIDE, -16.75, mm)}" fill="url(#${id}_bf)" stroke="${deep}" stroke-width=".2"/>`;
  s += `<path d="M-18.7,4V-10.4Q-18.7,-11.9 -17.95,-12.6L-14.25,-16.3Q-13.95,-16.6 -13.55,-16.6H13.5" fill="none" stroke="${lit}" stroke-width=".13" opacity=".55"/>`;
  // The plates: subtly raised trapezoids following the bezel, lit along their upper edges and shaded below.
  s += `<path d="M-11.1,-16.6H11.1L9.75,-13.4H-9.75ZM-9.75,13H9.75L11.1,16.6H-11.1Z" fill="url(#${id}_pl)" opacity=".55"/>`;
  s += `<path d="M-9.75,-13.4L-11.1,-16.6H11.1M-11.1,16.6L-9.75,13H9.75" fill="none" stroke="${lit}" stroke-width=".12" opacity=".45"/>`
    + `<path d="M11.1,-16.6L9.75,-13.4H-9.75M9.75,13L11.1,16.6H-11.1" fill="none" stroke="${deep}" stroke-width=".12" opacity=".6"/>`;
  // The slope down into the face, lit at the top left and in shade at the bottom right.
  s += `<path d="${contour(SLOPE_Q, FACE_Y)}" fill="url(#${id}_sl)"/>`;
  return s;
}

/** The printed black face: silver line, the CASIO logo, labels, the side markings and the SHOCK RESIST badge. */
function face() {
  const white = '#e4e3e3', gold = '#bc9748', cyan = '#3ea9c6', sans = 'font-family="Arial,Helvetica,sans-serif" font-weight="700"';
  let s = `<path d="${DW5600UE_FACE}" fill="#09090a" stroke="#000" stroke-width=".22"/>`;
  s += `<path d="${contour(SILVER_Q, FACE_Y)}" fill="none" stroke="#c4c4c4" stroke-width=".3"/>`;
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

/**
 * The bezel's printing: PROTECTION above the window and G-SHOCK below it, filled into shallow moulded letters, so each
 * carries a faint shadow along its lower right.
 */
const plates = () => {
  const sans = 'font-family="Arial,Helvetica,sans-serif" font-weight="700"';
  const word = (x: number, y: number, size: number, len: number, t: string) =>
    `<text x="${f(x + .07)}" y="${f(y + .09)}" ${sans} font-size="${size}" textLength="${len}" lengthAdjust="spacingAndGlyphs" fill="#000" opacity=".55">${t}</text>`
    + `<text x="${x}" y="${y}" ${sans} font-size="${size}" textLength="${len}" lengthAdjust="spacingAndGlyphs" fill="#dddcdc">${t}</text>`;
  return word(-8.17, -14.75, 1.86, 16.34, 'PROTECTION') + word(-8.43, 14.84, 2.53, 17.16, 'G-SHOCK');
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
  if (out) return `<path d="${d}" fill="none" ${o.stroke}/><g transform="scale(${f(u)} ${f(v)})"><path d="${DW5600UE_FACE}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/></g>`;
  let s = `<defs><linearGradient id="${id}_rc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .22)}"/><stop offset=".5" stop-color="${m}"/><stop offset="1" stop-color="${shade(m, -.3)}"/></linearGradient>${buttonGrad(id)}</defs>`;
  // START/STOP and LIGHT on the right, MODE lower left; ADJUST, upper left, sits recessed in its guard.
  s += `<g transform="scale(${f(u)} ${f(v)})">${button(id, 1, -7.3)}${button(id, 1, 7.3)}${button(id, -1, 7.3)}</g>`;
  s += `<path d="${d}" fill="url(#${id}_rc)" stroke="${shade(m, -.55)}" stroke-width=".14"/>`;
  s += `<g transform="scale(${f(u)} ${f(v)})">`;
  s += caseFront(id, m);
  // ADJUST sits recessed in its guard: only its dark cap shows.
  s += `<path d="M-19.45,-8.6H-19.85Q-20.05,-8.6 -20.05,-8.3V-6.3Q-20.05,-6 -19.85,-6H-19.45Z" fill="${shade(m, -.75)}"/><path d="M-19.95,-8.3V-6.3" stroke="${shade(m, .35)}" stroke-width=".1" opacity=".6"/>`;
  s += plates();
  s += face();
  s += lcd(id, o.glow, DW5600UE_SAMPLE);
  // The mineral glass: a faint reflection across the upper left.
  s += `<path d="M-14.3,-3V-6.5Q-14.1,-8.6 -12.4,-10.4Q-10.9,-12.1 -8,-12.3L-5,-12.3Q-11.4,-11.4 -12.6,-7.6Q-12.9,-5.8 -12.9,-2Z" fill="#fff" opacity=".06"/>`;
  return s + '</g>';
}
