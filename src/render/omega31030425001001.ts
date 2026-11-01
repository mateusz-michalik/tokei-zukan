import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { P } from './geom';
import { handRole, type HandRole } from './hands';
import { lu } from './night';
import { strokeDigits } from './strokeDigits';

// Omega Speedmaster Moonwatch Professional 42 mm (310.30.42.50.01.001): the 2021 calibre 3861 Moonwatch with a
// Hesalite crystal, on the steel five-link bracelet. An asymmetric case with long lyre lugs, polished bevels down its
// flanks and guards around the crown; pushers at 2 and 4; a black aluminium tachymeter bezel with upright figures and
// the dot over 90; a black step dial with a 1/3-second track, applied lume batons and the Ω, three sunken subdials
// (running seconds at 9, 30-minute counter at 3, 12-hour counter at 6), white baton hands with lume and the central
// chronograph hand with its lume lozenge.
//
// Everything was measured on Omega's front-on product photo at one uniform 13.5 px/mm. The photo's case is 42.25 mm
// across and 47.9 mm lug to lug, so the case maps onto Omega's 42 × 47.5 mm with sx = D / 42.25 and sy = LL / 47.9, and
// the dial furniture is drawn in photo millimetres scaled by u = D / 42.25. See docs/models/omega-310-30-42-50-01-001.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');

type XY = [number, number];
type Seg = { c: XY[]; p: XY };   // line (no controls), quadratic (1) or cubic (2), ending at p
const xy = ([x, y]: XY) => `${f(x)},${f(y)}`;
const segPath = (segs: Seg[]) => segs.map(s => (s.c.length === 0 ? 'L' : s.c.length === 1 ? 'Q' : 'C') + [...s.c, s.p].map(xy).join(' ')).join('');
/** The same segments walked from their end back to `start`. */
function reverse(start: XY, segs: Seg[]): Seg[] {
  const pts = [start, ...segs.map(s => s.p)];
  return segs.map((s, i) => ({ c: [...s.c].reverse(), p: pts[i] })).reverse();
}
const map = (segs: Seg[], t: (p: XY) => XY): Seg[] => segs.map(s => ({ c: s.c.map(t), p: t(s.p) }));
const flipX = ([x, y]: XY): XY => [-x, y], flipY = ([x, y]: XY): XY => [x, -y], rot = ([x, y]: XY): XY => [-x, -y];

/** Clock angle of a tachymeter value: the seconds it takes at that speed, at 6° per second. */
const tachy = (v: number) => (21600 / v) % 360;

/** Photo: the case meets the end links just outside the bezel. */
const CASE_R = 20.45;

/**
 * One quarter of the case, at the top right (`right`) or mirrored to the top left: from where the lug's inner edge
 * leaves the case, round the slanted lug tip and down the flank to the widest point at 3 or 9. Photo millimetres are
 * mapped by (sx, sy); the lug opening stays exactly the lug width. The right flank is wider, with the crown guards.
 */
function quarter(sx: number, sy: number, slot: number, H: number, right: boolean): { start: XY; segs: Seg[]; /** Index of the first flank segment. */ tip: number } {
  const X = (x: number) => x * sx, Y = (y: number) => y * sy;
  const yi = Math.sqrt(X(CASE_R) ** 2 - slot * slot);
  const inner: XY = [slot, -H], tipOut: XY = [X(13.15), Y(-22.75)], corner: XY = [X(13.7), Y(-22.05)];
  const len = Math.hypot(tipOut[0] - inner[0], tipOut[1] - inner[1]), ux = (tipOut[0] - inner[0]) / len, uy = (tipOut[1] - inner[1]) / len;
  const segs: Seg[] = [
    { c: [], p: [slot, -H + .3] },
    { c: [inner], p: [slot + .3 * ux, -H + .3 * uy] },
    { c: [], p: [tipOut[0] - .35 * ux, tipOut[1] - .35 * uy] },
    { c: [tipOut], p: corner },
  ];
  if (right) {
    // Straight flank past the pusher's root, out to the guard, then in to the crown's recess between the guards.
    segs.push({ c: [], p: [X(19.35), Y(-9.9)] }, { c: [[X(19.8), Y(-8.9)], [X(21), Y(-8.2)]], p: [X(21.3), Y(-6.6)] }, { c: [], p: [X(21.45), Y(-4.1)] }, { c: [[X(21.45), Y(-3.5)]], p: [X(20.9), Y(-3.5)] }, { c: [], p: [X(20.45), Y(-3.3)] }, { c: [], p: [X(20.45), 0] });
  } else {
    // Straight flank, rounding into the case side at 9.
    segs.push({ c: [], p: [X(19.45), Y(-8.6)] }, { c: [[X(20.75), Y(-5.6)], [X(21.12), Y(-2.8)]], p: [X(21.12), 0] });
  }
  return { start: [slot, -yi], segs, tip: 4 };
}

/** The whole case outline, closed, with lug openings exactly `lw` wide. */
export function omega31030425001001Case(D: number, LL: number, lw: number) {
  const sx = D / 42.25, sy = LL / 47.9, H = LL / 2, slot = lw / 2, rc = CASE_R * sx;
  const R = quarter(sx, sy, slot, H, true), Lq = quarter(sx, sy, slot, H, false);
  const start = R.start, yi = -start[1];
  const br = reverse(flipY(start), map(R.segs, flipY));               // bottom right, walked towards its inner edge
  const bl = map(Lq.segs, rot);                                       // bottom left, walked outwards
  const tl = reverse(flipX(Lq.start), map(Lq.segs, flipX));           // top left, walked towards its inner edge
  const arc = (p: XY) => `A${f(rc)},${f(rc)} 0 0 1 ${xy(p)}`;
  return `M${xy(start)}${segPath(R.segs)}${segPath(br)}${arc([-slot, yi])}${segPath(bl)}${segPath(tl)}${arc(start)}Z`;
}

/**
 * The outer flanks alone, from lug tip to lug tip on each side, for the polished bevel: stroked wide and clipped to the
 * case, they leave a band just inside the edge.
 */
function flanks(D: number, LL: number, lw: number) {
  const sx = D / 42.25, sy = LL / 47.9, H = LL / 2, slot = lw / 2;
  let d = '';
  for (const right of [true, false]) {
    const q = quarter(sx, sy, slot, H, right), t = right ? (p: XY) => p : flipX;
    const from = q.segs[q.tip - 1].p, top = map(q.segs.slice(q.tip), t);
    const bottom = reverse(t(from), top).map(s => ({ c: s.c.map(flipY), p: flipY(s.p) }));
    d += `M${xy(t(from))}${segPath(top)}${segPath(bottom)}`;
  }
  return d;
}

/** The four slanted lug tips, as open paths: stroked and clipped to the case, they shade each tip's end face. */
function tips(D: number, LL: number, lw: number) {
  const sx = D / 42.25, sy = LL / 47.9, H = LL / 2, slot = lw / 2;
  let d = '';
  for (const t of [(p: XY) => p, flipX, flipY, rot]) d += `M${xy(t([slot, -H]))}L${xy(t([sx * 13.15, sy * -22.75]))}L${xy(t([sx * 13.7, sy * -22.05]))}`;
  return d;
}

function defs(id: string, L: FullLook) {
  const m = L.caseColor;
  return `<defs><linearGradient id="${id}oc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .22)}"/><stop offset=".55" stop-color="${m}"/><stop offset="1" stop-color="${shade(m, -.2)}"/></linearGradient>`
    // Polished bevels and bezel edge: bright with a dark band, like a mirror catching the studio.
    + `<linearGradient id="${id}op" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbfbf9"/><stop offset=".35" stop-color="${shade(m, .3)}"/><stop offset=".55" stop-color="${shade(m, -.38)}"/><stop offset=".72" stop-color="${shade(m, .4)}"/><stop offset="1" stop-color="${shade(m, -.1)}"/></linearGradient>`
    + `<linearGradient id="${id}oy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, -.4)}"/><stop offset=".25" stop-color="${shade(m, .5)}"/><stop offset=".5" stop-color="#fbfbf9"/><stop offset=".78" stop-color="${shade(m, .1)}"/><stop offset="1" stop-color="${shade(m, -.42)}"/></linearGradient>`
    + `<pattern id="${id}ob" patternUnits="userSpaceOnUse" width=".5" height="2"><path d="M.1,0V2M.32,0V2" stroke="#fff" stroke-width=".05" opacity=".2"/><path d="M.21,0V2" stroke="#4d5152" stroke-width=".04" opacity=".14"/></pattern>`
    + `<radialGradient id="${id}od" cx=".45" cy=".38" r=".75"><stop stop-color="${shade(L.dial, .1)}"/><stop offset="1" stop-color="${shade(L.dial, -.12)}"/></radialGradient>`
    + `<linearGradient id="${id}ol" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(L.lume, .12)}"/><stop offset="1" stop-color="${shade(L.lume, -.08)}"/></linearGradient>`
    + `<path id="${id}ot" d="M${pt(18.08, 3)}A18.08,18.08 0 0 1 ${pt(18.08, 40)}"/>`
    + `<path id="${id}os" d="M${pt(15.95, 196)}A15.95,15.95 0 0 0 ${pt(15.95, 164)}"/></defs>`;
}

/**
 * Crown at 3: a fluted barrel 6.7 mm tall, set in the recess between the guards, its outer corners rounded. Pushers at
 * 2 and 4: polished cylinders 4.3 mm across, tilted 7° away from the crown, on narrower stems. All in photo millimetres; drawn beneath the case.
 */
function crownAndPushers(id: string, L: FullLook, outline: boolean, stroke: string) {
  const m = L.caseColor, cyl = outline ? 'none' : `url(#${id}oy)`;
  let s = '';
  for (const sy of [-1, 1]) {
    s += `<g transform="translate(18.9 ${f(sy * 9.5)}) rotate(${-7 * sy})">`;
    if (!outline) s += `<rect x="-.4" y="-1.35" width="1.6" height="2.7" fill="${shade(m, -.45)}"/>`;
    // An outline starts each part at the case edge, so no line crosses the case.
    s += `<path d="M${outline ? 1.6 : .9},-2.15H3.5Q3.85,-2.15 3.85,-1.8V1.8Q3.85,2.15 3.5,2.15H${outline ? 1.6 : .9}Z" fill="${cyl}" ${stroke}/>`;
    if (!outline) s += `<rect x="3.5" y="-1.95" width=".28" height="3.9" rx=".12" fill="#fbfbf9" opacity=".75"/>`;
    s += '</g>';
  }
  if (!outline) s += `<rect x="19.6" y="-1.8" width="1.2" height="3.6" fill="${shade(m, -.5)}"/>`;
  s += `<path d="M${outline ? 20.45 : 20.25},-3.35H23.2Q23.7,-3.35 23.7,-2.85V2.85Q23.7,3.35 23.2,3.35H${outline ? 20.45 : 20.25}Z" fill="${cyl}" ${stroke}/>`;
  if (!outline) {
    // Flutes running along the barrel: a dark groove under a lit ridge.
    let grooves = '', ridges = '';
    for (let i = -4; i <= 4; i++) {
      const y = i * .7;
      grooves += `M20.5,${f(y + .3)}H23.4`;
      ridges += `M20.5,${f(y)}H23.35`;
    }
    s += `<path d="${grooves}" stroke="#34383b" stroke-width=".2" opacity=".75"/><path d="${ridges}" stroke="#fff" stroke-width=".12" opacity=".55"/>`;
    s += `<rect x="23.3" y="-3" width=".26" height="6" rx=".12" fill="${shade(m, -.25)}"/>`;
  }
  return s;
}

/**
 * The black aluminium tachymeter: dots at the values, upright figures placed as measured (Omega sets them beside
 * their dots, which is why the 90's dot sits over it), minor ticks from 61 to 99, longer ones at 105 to 135, a dot at
 * 450 and TACHYMÈTRE between 60 and 500.
 */
const FIGURES: [number, number, number][] = [
  [60, .07, -18.88], [500, 12.78, -13.76], [400, 15.02, -11.18], [350, 16.4, -9.1], [300, 17.82, -6.2], [275, 18.32, -4.29],
  [250, 18.65, -1.79], [225, 18.57, 2.94], [200, 17.64, 6.57], [190, 17.12, 8.2], [180, 16.17, 9.99], [170, 14.82, 11.89],
  [160, 13.12, 13.75], [150, 10.96, 15.57], [140, 8.2, 17.2], [130, 4.56, 18.55], [120, -.18, 19.12], [110, -5.24, 18.32],
  [100, -10.86, 15.52], [90, -16.35, 9.84], [85, -18.37, 5.21], [80, -19.19, -.05], [75, -18.11, -5.89], [70, -14.83, -11.86],
  [65, -8.98, -16.71],
];

function bezel(id: string, L: FullLook) {
  const m = L.caseColor, ink = L.bezelText;
  let s = `<circle r="20.43" fill="none" stroke="${shade(m, -.5)}" stroke-width=".1"/><circle r="20.38" fill="url(#${id}op)"/><circle r="20" fill="${L.bezel}"/>`;
  let dots = '', minor = '', long = '', digits = '';
  for (const [v] of FIGURES) { const [x, y] = P(18.2, tachy(v)); dots += `M${f(x - .15)},${f(y)}a.15,.15 0 1 0 .3,0a.15,.15 0 1 0 -.3,0`; }
  { const [x, y] = P(18.2, tachy(450)); dots += `M${f(x - .15)},${f(y)}a.15,.15 0 1 0 .3,0a.15,.15 0 1 0 -.3,0`; }
  for (let v = 61; v < 100; v++) {
    if (v % 5 === 0 && v !== 95) continue;
    const a = tachy(v), r1 = v === 95 ? 18.65 : 18.45;
    minor += `M${pt(17.95, a)}L${pt(r1, a)}`;
  }
  for (const v of [105, 115, 125, 135]) long += `M${pt(18.1, tachy(v))}L${pt(19.1, tachy(v))}`;
  for (const [v, x, y] of FIGURES) digits += strokeDigits(String(v), x, y, 1.1, .82, .09);
  s += `<path d="${dots}" fill="${ink}"/><path d="${minor}" stroke="${ink}" stroke-width=".13"/><path d="${long}" stroke="${ink}" stroke-width=".14"/>`;
  s += `<path d="${digits}" fill="none" stroke="${ink}" stroke-width=".13" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<text font-family="'Futura','Century Gothic','Avenir Next',Arial,Helvetica,sans-serif" font-size="1.32" fill="${ink}"><textPath href="#${id}ot" startOffset="50%" text-anchor="middle" textLength="9.25" lengthAdjust="spacing">TACHYMÈTRE</textPath></text>`;
  // The insert's inner edge, then the Hesalite's rim stepping down to the dial.
  return s + `<circle r="17.75" fill="none" stroke="#0b0b0c" stroke-width=".08"/><circle r="17.3" fill="none" stroke="#3b3d3f" stroke-width=".9"/><circle r="16.68" fill="none" stroke="#141516" stroke-width=".46"/><circle r="17.68" fill="none" stroke="#6a6d70" stroke-width=".08" opacity=".7"/>`;
}

/**
 * Step dial: a track ring from 12.6 to the edge at 16.45 above the sunken centre, with 1/3-second graduations (the
 * 3861's 21,600 vph): long lines every second, short ones between, and nothing over the hour batons.
 */
function dial(id: string, L: FullLook) {
  let s = `<circle r="16.45" fill="url(#${id}od)"/><circle r="12.6" fill="${shade(L.dial, -.06)}"/>`;
  s += `<circle r="12.6" fill="none" stroke="#0a0a0b" stroke-width=".1"/><circle r="12.68" fill="none" stroke="#fff" stroke-width=".05" opacity=".12"/>`;
  let short = '', long = '';
  for (let i = 0; i < 180; i++) {
    const a = i * 2;
    if (i % 3 || i % 15 === 0) short += `M${pt(14.85, a)}L${pt(15.45, a)}`;
    else long += `M${pt(13, a)}L${pt(15.45, a)}`;
  }
  s += `<path d="${short}" stroke="#ecece8" stroke-width=".07"/><path d="${long}" stroke="#f1f1ed" stroke-width=".085"/>`;
  return s;
}

/** Applied batons: a thin white-gold frame round the lume, 2.8 mm long and 0.64 wide, and the two dots beside the 12. */
function markers(id: string) {
  let shadow = '', lume = '';
  const bar = (a: number) => {
    const c = [P(11.8, a), P(14.6, a)], [nx, ny] = [Math.cos(a * Math.PI / 180) * .32, Math.sin(a * Math.PI / 180) * .32];
    return `M${f(c[0][0] - nx)},${f(c[0][1] - ny)}L${f(c[1][0] - nx)},${f(c[1][1] - ny)}L${f(c[1][0] + nx)},${f(c[1][1] + ny)}L${f(c[0][0] + nx)},${f(c[0][1] + ny)}Z`;
  };
  for (let h = 0; h < 12; h++) lume += bar(h * 30);
  for (const x of [-.81, .81]) lume += `M${f(x - .3)},-12.07a.3,.3 0 1 0 .6,0a.3,.3 0 1 0 -.6,0`;
  shadow = lume;
  return `<path d="${shadow}" fill="#000" opacity=".35" transform="translate(.07 .1)"/><path d="${lume}" fill="url(#${id}ol)" stroke="#f3f3ef" stroke-width=".07" stroke-linejoin="round"${lu('indices')}/>`;
}

type Register = 'seconds' | 'minutes' | 'hours';
const REG_LABELS: Record<Register, [string, number, number][]> = {
  seconds: [['60', 0, 2.65], ['20', 125, 2.6], ['40', 235, 2.6]],
  minutes: [['30', 0, 2.4], ['10', 125, 2.27], ['20', 235, 2.27]],
  hours: [['12', 0, 2.88], ['3', 90, 2.9], ['6', 180, 2.9], ['9', 270, 2.9]],
};

/** One sunken register: a dark bowl with a lighter grooved ring, its graduations and figures, and a white stick hand at zero. */
function register(cx: number, cy: number, kind: Register, role: HandRole, L: FullLook) {
  const at = (r: number, a: number) => { const [x, y] = P(r, a); return `${f(cx + x)},${f(cy + y)}`; };
  let s = `<circle cx="${cx}" cy="${cy}" r="4.5" fill="${L.subdialColor}"/><circle cx="${cx}" cy="${cy}" r="3.98" fill="none" stroke="${shade(L.subdialColor, .12)}" stroke-width=".95"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="3.6" fill="none" stroke="#000" stroke-width=".05" opacity=".5"/><circle cx="${cx}" cy="${cy}" r="4.5" fill="none" stroke="#0a0a0b" stroke-width=".1"/><circle cx="${cx}" cy="${cy}" r="4.42" fill="none" stroke="#fff" stroke-width=".04" opacity=".15"/>`;
  let ticks = '';
  if (kind === 'minutes') {
    for (let i = 0; i < 30; i++) {
      const r0 = i % 10 === 5 ? 3 : i <= 4 || i % 10 === 0 ? 3.25 : 3.6;
      ticks += `M${at(r0, i * 12)}L${at(4.4, i * 12)}`;
    }
  } else {
    for (let i = 0; i < 12; i++) {
      const a = i * 30, open = kind === 'seconds' ? i % 4 !== 0 : i % 3 !== 0;
      ticks += `M${at(open ? 3.55 : 3.98, a)}L${at(4.38, a)}`;
    }
  }
  let figs = '';
  for (const [t, a, r] of REG_LABELS[kind]) { const [x, y] = P(r, a); figs += strokeDigits(t, cx + x, cy + y, .76, .85, .1); }
  s += `<path d="${ticks}" stroke="#e9e9e5" stroke-width=".1"/><path d="${figs}" fill="none" stroke="#efefeb" stroke-width=".14" stroke-linecap="round" stroke-linejoin="round"/>`;
  const white = L.handColor, edge = '#8a8e90';
  s += `<g ${handRole(role)}transform="translate(${cx} ${cy}) rotate(0)"><path d="M-.13,.75L-.1,-3.75L0,-3.95L.1,-3.75L.13,.75Z" fill="${white}" stroke="${edge}" stroke-width=".03"/><circle r=".55" fill="${white}" stroke="${edge}" stroke-width=".04"/><circle r=".17" fill="#9a9ea0"/></g>`;
  return s;
}

/**
 * White baton hour and minute hands with a lume stripe and pointed tips, and the chronograph seconds hand: a needle
 * with a lume lozenge two-thirds out and a counterweight, posed as in the photo. A polished hub.
 */
function hands(L: FullLook) {
  const ha = 305.5, ma = 48.9, ca = 223.3, white = L.handColor, edge = '#7f8385', lume = L.lume;
  // A baton w wide to a point at `tip`, with a lume stripe from r0 to r1.
  const baton = (tip: number, w: number, r0: number, r1: number, lw: number) => ({
    whole: `M${-w / 2},1.1V${f(-tip + w * .75)}L0,${-tip}L${w / 2},${f(-tip + w * .75)}V1.1Z`,
    lume: `M${-lw / 2},${-r0}V${-r1}L0,${f(-r1 - lw * .5)}L${lw / 2},${-r1}V${-r0}Z`,
  });
  const hr = baton(9.7, .98, 2.6, 8.85, .42), mn = baton(14.5, .9, 3, 13.55, .36);
  // Chronograph: needle to 15, lozenge from 8.6 to 11.3 and 1.05 wide, round-ended counterweight 2.6 behind the pivot.
  const chrono = `M-.15,0L-.11,-8.75L-.52,-9.75L0,-11.35L.52,-9.75L.11,-8.75L.15,0V1.75L.45,1.95A.45,.45 0 0 1 .45,2.75H-.45A.45,.45 0 0 1 -.45,1.95L-.15,1.75Z M-.1,-11.2L-.06,-15H.06L.1,-11.2Z`;
  const lozenge = `M0,-9.05L.34,-9.8L0,-10.95L-.34,-9.8Z`;
  let s = `<g fill="#000" opacity=".3" transform="translate(.15 .22)"><path d="${hr.whole}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${mn.whole}" ${handRole('minute')}transform="rotate(${ma})"/><path d="${chrono}" ${handRole('chrono')}transform="rotate(${ca})"/></g>`;
  for (const [h, role, a] of [[hr, 'hour', ha], [mn, 'minute', ma]] as const)
    s += `<g ${handRole(role)}transform="rotate(${a})"><path d="${h.whole}" fill="${white}" stroke="${edge}" stroke-width=".05"/><path d="${h.lume}" fill="${lume}"${lu('hands')}/></g>`;
  s += `<g ${handRole('chrono')}transform="rotate(${ca})"><path d="${chrono}" fill="${white}" stroke="${edge}" stroke-width=".04"/><path d="${lozenge}" fill="${lume}"${lu('seconds')}/></g>`;
  return s + `<circle r="1.25" fill="${white}" stroke="${edge}" stroke-width=".06"/><circle r=".72" fill="none" stroke="#b9bdbe" stroke-width=".08"/><circle r=".2" fill="#7c8082"/>`;
}

/** The dial's applied Ω and OMEGA, and the printed Speedmaster, PROFESSIONAL and SWISS MADE. */
function printing(id: string) {
  const sans = `font-family="'Futura','Century Gothic','Avenir Next',Arial,Helvetica,sans-serif" text-anchor="middle"`;
  let s = `<path d="M-.8,.52H-.3A.55,.55 0 1 1 .3,.52H.8" transform="translate(0 -9.7)" fill="none" stroke="#ededea" stroke-width=".2"/>`;
  s += `<text x="0" y="-7.06" ${sans} font-size="1.54" textLength="6.2" lengthAdjust="spacingAndGlyphs" fill="#ededea">OMEGA</text>`;
  s += `<text x=".1" y="-5.72" font-family="'Snell Roundhand','Segoe Script','Brush Script MT',cursive" font-style="italic" font-size="1.6" textLength="8.6" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="#e9e9e5">Speedmaster</text>`;
  s += `<text x="0" y="-4.6" ${sans} font-size=".74" textLength="8.55" lengthAdjust="spacing" fill="#e9e9e5">PROFESSIONAL</text>`;
  return s + `<text ${sans.replace(' text-anchor="middle"', '')} font-size=".52" fill="#d9d9d5"><textPath href="#${id}os" startOffset="50%" text-anchor="middle" textLength="4.6" lengthAdjust="spacing">SWISS MADE</textPath></text>`;
}

export interface Omega31030425001001Options { D: number; LL: number; lw: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the bracelet for the Speedmaster Moonwatch Professional 310.30.42.50.01.001. */
export function omega31030425001001SVG(o: Omega31030425001001Options) {
  const { D, LL, lw, id, L, outline } = o;
  const d = omega31030425001001Case(D, LL, lw), u = D / 42.25, m = L.caseColor;
  let s = outline ? '' : defs(id, L);
  s += `<g transform="scale(${f(u)})">${crownAndPushers(id, L, outline, outline ? o.stroke.replace(/stroke-width="([\d.]+)"/, (_, w: string) => `stroke-width="${f(+w / u)}"`) : `stroke="${shade(m, -.45)}" stroke-width=".08"`)}</g>`;
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}oc)`}" ${outline ? o.stroke : `stroke="${shade(m, -.45)}" stroke-width=".12"`}/>`;
  if (outline) return s + `<circle r="${f(20.38 * u)}" fill="none" ${o.stroke}/><circle r="${f(16.45 * u)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  // Brushed tops with polished bevels down both flanks, from lug tip to lug tip: a 1.25 mm band with a dark inner edge.
  const bev = flanks(D, LL, lw);
  s += `<defs><clipPath id="${id}occ"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}occ)"><path d="${d}" fill="url(#${id}ob)"/>`
    + `<path d="${bev}" fill="none" stroke="${shade(m, -.45)}" stroke-width="2.62"/><path d="${bev}" fill="none" stroke="url(#${id}op)" stroke-width="2.5"/>`
    + `<path d="${tips(D, LL, lw)}" fill="none" stroke="${shade(m, -.55)}" stroke-width="1.1" stroke-linejoin="round" opacity=".55"/></g>`;
  s += `<g transform="scale(${f(u)})">`;
  s += bezel(id, L);
  s += dial(id, L);
  s += register(-6.95, 0, 'seconds', 'small-seconds', L) + register(6.95, 0, 'minutes', 'chrono', L) + register(0, 6.95, 'hours', 'chrono', L);
  s += markers(id);
  s += printing(id);
  s += hands(L);
  // The Hesalite: the Ω etched at its centre, a soft reflection across the upper left and a glint round the lower edge.
  s += `<path d="M-.22,.19H-.08A.2,.2 0 1 1 .08,.19H.22" fill="none" stroke="#fff" stroke-width=".05" opacity=".45"/>`;
  s += `<path d="M-13.5,-4.5A14.2,14.2 0 0 1 -4.5,-13.5A16.5,16.5 0 0 0 -13.5,-4.5Z" fill="#fff" opacity=".07"/><path d="M${pt(16.1, 115)}A16.1,16.1 0 0 1 ${pt(16.1, 205)}" fill="none" stroke="#fff" stroke-width=".35" opacity=".07"/>`;
  return s + '</g>';
}
