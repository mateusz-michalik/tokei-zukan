import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { P } from './geom';
import { handRole } from './hands';
import { lu } from './night';
import { strokeDigits, type StrokeGlyphs } from './strokeDigits';
import { bezelShadow, lugTopLight } from './cases';

// Omega Seamaster Diver 300M 42 mm (210.30.42.20.03.001): the 2018 Master Chronometer Diver 300M in steel, blue
// ceramic dial and bezel, on the steel bracelet. Twisted lyre lugs (a crease from each tip down to the flank, a
// polished sloped facet outside it), a swelling at 3 round the crown and the conical helium escape valve at 10; a
// unidirectional bezel with a twelve-sided scalloped steel edge and a polished blue ceramic insert whose diving scale
// is white enamel (wide squared figures, a dot at every minute, the zero triangle and its lumed pip); the polished
// blue ceramic dial with laser-engraved waves, a bracketed minute track with light-blue hour marks, applied rhodium
// dots and batons filled with Super-LumiNova (doubled at 12, a short one under the date at 6), the applied Ω and the
// red Seamaster; and skeleton hands, the hour hand's circle and the minute hand's arrow filled with lume, and a
// lollipop seconds hand with a red tip.
//
// Everything was measured on Omega's front-on product photo at one uniform 13.75 px/mm (the bracelet's 20 mm). The
// photo's case is 42.32 mm across at 9 and 49.6 mm lug to lug, so it maps onto Omega's 42 × 49.9 mm with sx = D / 42.32
// and sy = LL / 49.6; the dial and bezel are drawn in photo millimetres scaled by u = D / 42.32. The photo is taken a
// little from below: the hand pivot sits 0.25 mm above the lug tips' midpoint and the bezel 0.25 mm above that, so the
// case was measured about the lug midpoint, the dial about the pivot and the bezel about its own centre, and all three
// are centred here. See docs/models/omega-210-30-42-20-03-001.md.

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
const unit = (a: XY, b: XY): XY => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
const along = (p: XY, u: XY, d: number): XY => [p[0] + u[0] * d, p[1] + u[1] * d];

function mix(a: string, b: string, t: number) {
  const c = (h: string) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const [p, q] = [c(a), c(b)];
  return '#' + p.map((v, i) => Math.round(v + (q[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/** Photo millimetres: the case's width and length, and where the end links meet the case under the bezel. */
const PHOTO_D = 42.32, PHOTO_LL = 49.6, CASE_R = 21.6;
/** The lug tip's outer corner, and where the straight upper flank turns into the case side. */
const TIP: XY = [13.45, -23.3], FLANK: XY = [16, -14.7];
/**
 * Each lug's crease: from this far out along the tip, down to the flank 13 mm from the centre line. The polished
 * facet outside it is feathered over `FEATHER` mm inwards, so the lug turns rather than breaking at a hard line.
 */
const CREASE_X = 11, CREASE_END: XY = [16.8, -13], FEATHER = .7;

/**
 * One quarter of the case, at the top right (`right`) or mirrored to the top left: from where the lug's inner edge
 * leaves the case, across the slanted lug tip, down the straight flank and round into the side at 3 or 9. On the
 * right the flank swells out to 22.84 mm in a guard either side of the crown, stepping in at 3.45 mm from the centre
 * line to the 21.25 mm recess the crown stands out of; on the left it rounds into the 21.16 mm side.
 */
function quarter(sx: number, sy: number, slot: number, H: number, right: boolean): { start: XY; segs: Seg[] } {
  const X = (x: number) => x * sx, Y = (y: number) => y * sy, S = ([x, y]: XY): XY => [X(x), Y(y)];
  const yi = Math.sqrt(X(CASE_R) ** 2 - slot * slot);
  const inner: XY = [slot, -H], tip = S(TIP), flank = S(FLANK), ut = unit(inner, tip), uf = unit(tip, flank);
  const segs: Seg[] = [
    { c: [], p: [slot, -H + .3] },
    { c: [inner], p: along(inner, ut, .3) },
    { c: [], p: along(tip, ut, -.3) },
    { c: [tip], p: along(tip, uf, .3) },
    { c: [], p: flank },
  ];
  if (right) segs.push(
    { c: [S([17, -12.6]), S([19.8, -9])], p: S([21.6, -6.85]) },
    { c: [S([22.3, -5.95]), S([22.84, -5.1])], p: S([22.84, -3.95]) },
    { c: [S([22.84, -3.45])], p: S([22.35, -3.45]) },
    { c: [], p: S([21.25, -3.45]) },
    { c: [], p: [X(21.25), 0] },
  );
  else segs.push({ c: [S([16.62, -12.54]), S([21.16, -6.75])], p: [X(21.16), 0] });
  return { start: [slot, -yi], segs };
}

/** The whole case outline, closed, with lug openings exactly `lw` wide. */
export function omega21030422003001Case(D: number, LL: number, lw: number) {
  const sx = D / PHOTO_D, sy = LL / PHOTO_LL, H = LL / 2, slot = lw / 2, rc = CASE_R * sx;
  const R = quarter(sx, sy, slot, H, true), Lq = quarter(sx, sy, slot, H, false);
  const start = R.start, yi = -start[1];
  const br = reverse(flipY(start), map(R.segs, flipY));               // bottom right, walked towards its inner edge
  const bl = map(Lq.segs, rot);                                       // bottom left, walked outwards
  const tl = reverse(flipX(Lq.start), map(Lq.segs, flipX));           // top left, walked towards its inner edge
  const arc = (p: XY) => `A${f(rc)},${f(rc)} 0 0 1 ${xy(p)}`;
  return `M${xy(start)}${segPath(R.segs)}${segPath(br)}${arc([-slot, yi])}${segPath(bl)}${segPath(tl)}${arc(start)}Z`;
}

/**
 * The twisted lugs: outside each lug's crease, a polished facet that takes the whole tip and narrows down the flank to
 * the crease's end. Polygons reaching past the edge, for drawing clipped to the case; with the creases themselves and
 * the slanted tips' end faces.
 */
function lugs(D: number, LL: number, lw: number) {
  const sx = D / PHOTO_D, sy = LL / PHOTO_LL, H = LL / 2, slot = lw / 2;
  const tip: XY = [TIP[0] * sx, TIP[1] * sy], inner: XY = [slot, -H];
  const facet = (w: number) => {
    const t = ((CREASE_X - w) * sx - slot) / (tip[0] - slot), c0: XY = [slot + (tip[0] - slot) * t, -H + (tip[1] + H) * t];
    const c1: XY = [(CREASE_END[0] - w * .8) * sx, (CREASE_END[1] + w * .6) * sy];
    return { c0, c1, d: (m: (p: XY) => XY) => `M${xy(m(c0))}Q${xy(m([(c0[0] + c1[0]) / 2 + .25, (c0[1] + c1[1]) / 2 - .2]))} ${xy(m(c1))}L${xy(m([c1[0] + 1.6, c1[1] + .4]))}L${xy(m([FLANK[0] * sx + 1.2, FLANK[1] * sy]))}L${xy(m([tip[0] + 1.2, -H - 1]))}L${xy(m([c0[0], -H - 1]))}Z` };
  };
  const core = facet(0), soft = facet(FEATHER);
  let facets = '', feather = '', creases = '', ends = '';
  for (const m of [(p: XY) => p, flipX, flipY, rot]) {
    facets += core.d(m);
    feather += soft.d(m);
    creases += `M${xy(m(core.c0))}Q${xy(m([(core.c0[0] + core.c1[0]) / 2 + .25, (core.c0[1] + core.c1[1]) / 2 - .2]))} ${xy(m(core.c1))}`;
    ends += `M${xy(m(inner))}L${xy(m(tip))}`;
  }
  return { facets, feather, creases, ends };
}

function defs(id: string, L: FullLook) {
  const m = L.caseColor;
  return `<defs><linearGradient id="${id}vc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .18)}"/><stop offset=".55" stop-color="${m}"/><stop offset="1" stop-color="${shade(m, -.2)}"/></linearGradient>`
    // Polished facets and the bezel's edge: bright with a dark band, like a mirror catching the studio.
    + `<linearGradient id="${id}vp" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fcfcfb"/><stop offset=".3" stop-color="${shade(m, .42)}"/><stop offset=".52" stop-color="${shade(m, -.3)}"/><stop offset=".7" stop-color="${shade(m, .45)}"/><stop offset="1" stop-color="${shade(m, -.2)}"/></linearGradient>`
    // The lugs' polished facets: one broad highlight from the upper left, turning grey towards the lower right, with no
    // dark band across it.
    + `<linearGradient id="${id}vq" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fcfcfb"/><stop offset=".4" stop-color="${shade(m, .5)}"/><stop offset=".75" stop-color="${shade(m, .12)}"/><stop offset="1" stop-color="${shade(m, -.14)}"/></linearGradient>`
    // Crown and valve barrels: lit along their middles, turning away at top and bottom.
    + `<linearGradient id="${id}vy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, -.42)}"/><stop offset=".25" stop-color="${shade(m, .5)}"/><stop offset=".5" stop-color="#fbfbfa"/><stop offset=".78" stop-color="${shade(m, .08)}"/><stop offset="1" stop-color="${shade(m, -.45)}"/></linearGradient>`
    + `<pattern id="${id}vb" patternUnits="userSpaceOnUse" width=".5" height="2"><path d="M.1,0V2M.32,0V2" stroke="#fff" stroke-width=".05" opacity=".2"/><path d="M.21,0V2" stroke="#4d5152" stroke-width=".04" opacity=".14"/></pattern>`
    // Polished blue ceramic dial, lighter towards the upper left.
    + `<radialGradient id="${id}vd" cx=".42" cy=".36" r=".75"><stop stop-color="${shade(L.dial, .1)}"/><stop offset="1" stop-color="${shade(L.dial, -.14)}"/></radialGradient>`
    + `<radialGradient id="${id}vl" cx=".4" cy=".35" r=".8"><stop stop-color="${shade(L.lume, .1)}"/><stop offset="1" stop-color="${shade(L.lume, -.08)}"/></radialGradient>`
    // Rhodium of the markers' frames and the hands.
    + `<linearGradient id="${id}vw" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fdfdfc"/><stop offset=".5" stop-color="${L.handColor}"/><stop offset="1" stop-color="#8f969b"/></linearGradient>`
    // The insert's sloping inner edge and the ring at the dial's edge.
    + `<radialGradient id="${id}vf" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="16.35"><stop offset=".95" stop-color="${shade(L.bezel, -.35)}"/><stop offset="1" stop-color="${mix(L.bezel, '#8da2b8', .35)}"/></radialGradient>`
    + waves(id, L) + '</defs>';
}

/**
 * The dial's laser-engraved waves as one repeating pattern: lines 1.32 mm apart, each a wave 14.5 mm long and 0.65 mm
 * deep, as fitted to the photo, a pale crest with a fine shadow under it. The tile repeats from the pivot.
 */
function waves(id: string, L: FullLook) {
  const W = 14.5, Hs = 1.32, A = .65, y0 = 1.063;
  let d = '';
  for (const k of [-1, 0, 1]) {
    for (let i = 0; i <= 32; i++) {
      const x = W * i / 32, y = y0 + k * Hs - A * Math.cos(2 * Math.PI * x / W);
      d += `${i ? 'L' : 'M'}${f(x)},${f(y)}`;
    }
  }
  return `<pattern id="${id}vv" patternUnits="userSpaceOnUse" width="${W}" height="${Hs}"><path d="${d}" fill="none" stroke="#000" stroke-width=".15" opacity=".3" transform="translate(0 .17)"/><path d="${d}" fill="none" stroke="${mix(L.dial, '#9dbadb', .4)}" stroke-width=".26" opacity=".85"/></pattern>`;
}

/**
 * The screw-down crown at 3, standing out of the case's recess between the guards: a knurled barrel 6.2 mm tall from
 * 21.25 to 24.0, rounding over a polished shoulder to a flat end 2.4 mm tall at 25.24. Photo millimetres; drawn over
 * the case, so the whole barrel shows, with a dark seat where it leaves the recess and its shadow on the lower guard.
 */
function crown(id: string, L: FullLook, outline: boolean, stroke: string) {
  const m = L.caseColor;
  const body = 'M21.25,-3.1H24Q24.8,-3.1 25.08,-2.2Q25.24,-1.7 25.24,-1.2V1.2Q25.24,1.7 25.08,2.2Q24.8,3.1 24,3.1H21.25Z';
  if (outline) return `<path d="${body}" fill="none" ${stroke}/>`;
  let s = `<path d="${body}" fill="#000" opacity=".2" transform="translate(.12 .22)"/><rect x="21.05" y="-2.9" width=".55" height="5.8" fill="${shade(m, -.6)}"/>`;
  s += `<path d="${body}" fill="url(#${id}vy)" ${stroke}/>`;
  // Knurling: a groove under each lit ridge, running on a little way over the shoulder.
  let grooves = '', ridges = '';
  for (let i = -3; i <= 4; i++) {
    const y = i * .78 - .39, end = 24.05 + .55 * (1 - Math.abs(y) / 3.1);
    grooves += `M21.7,${f(y + .3)}H${f(end)}`;
    ridges += `M21.7,${f(y)}H${f(end - .05)}`;
  }
  s += `<path d="${grooves}" stroke="#30353a" stroke-width=".22" opacity=".7"/><path d="${ridges}" stroke="#fff" stroke-width=".12" opacity=".6"/>`;
  // The polished shoulder and the flat end, and the seat's edge against the recess.
  return s + `<path d="M24,-3.1Q24.8,-3.1 25.08,-2.2Q25.24,-1.7 25.24,-1.2V1.2Q25.24,1.7 25.08,2.2Q24.8,3.1 24,3.1Q24.75,1.6 24.75,0Q24.75,-1.6 24,-3.1Z" fill="#fff" opacity=".2"/><rect x="25.02" y="-1.25" width=".2" height="2.5" rx=".1" fill="${shade(m, -.25)}"/><path d="M21.3,-3.05V3.05" stroke="${shade(m, -.5)}" stroke-width=".1"/>`;
}

/**
 * The helium escape valve at 10, 298° round the dial: a conical fluted crown narrowing from 6 mm at the case to a
 * domed end 24.7 mm out. Photo millimetres; drawn beneath the case, which hides its root.
 */
function valve(id: string, L: FullLook, outline: boolean, stroke: string) {
  const m = L.caseColor, fill = outline ? 'none' : `url(#${id}vy)`;
  let s = `<g transform="rotate(208)">`;
  if (!outline) s += `<rect x="19.6" y="-2.4" width="1" height="4.8" fill="${shade(m, -.55)}"/>`;
  s += `<path d="M${outline ? 20.6 : 20},-3L23.7,-2.25L24.3,-1.85Q24.7,-1.55 24.7,-1.05V1.05Q24.7,1.55 24.3,1.85L23.7,2.25L${outline ? 20.6 : 20},3Z" fill="${fill}" ${stroke}/>`;
  if (!outline) {
    // Flutes running along the cone, closing in towards its end.
    let grooves = '';
    for (let i = -4; i <= 4; i++) grooves += `M20.4,${f(i * .62)}L23.6,${f(i * .62 * .76)}`;
    s += `<path d="${grooves}" stroke="#30353a" stroke-width=".16" opacity=".55"/><path d="${grooves}" stroke="#fff" stroke-width=".08" opacity=".5" transform="translate(0 -.18)"/>`;
    s += `<path d="M23.7,-2.2V2.2" stroke="${shade(m, -.4)}" stroke-width=".1"/><path d="M23.75,-2.15L24.3,-1.8Q24.65,-1.5 24.65,-1.05V1.05Q24.65,1.5 24.3,1.8L23.75,2.15Z" fill="#fff" opacity=".25"/>`;
  }
  return s + '</g>';
}

/**
 * The bezel's figures: wide and squared, half as tall again as they are wide, with well-rounded corners and a flagged
 * 1. Centrelines in a box 1 tall, for strokeDigits; stroked 0.42 mm wide they stand 2.25 mm tall and 3.47 wide, as
 * measured on the photo's 20, 30, 40 and 50.
 */
const BEZEL_DIGITS: StrokeGlyphs = {
  '0': ['M.42,0L1.25,0Q1.67,0 1.67,.42L1.67,.58Q1.67,1 1.25,1L.42,1Q0,1 0,.58L0,.42Q0,0 .42,0Z', 1.67],
  '1': ['M.3,.24L.72,0L.72,1', .74],
  '2': ['M0,.36Q0,0 .38,0L1.29,0Q1.67,0 1.67,.3Q1.67,.53 1.38,.53L.36,.53Q0,.53 0,.8L0,1L1.67,1', 1.67],
  '3': ['M0,0L1.25,0Q1.67,0 1.67,.4L1.67,.6Q1.67,1 1.25,1L0,1M.5,.5L1.67,.5', 1.67],
  '4': ['M0,0L0,.62L1.67,.62M1.27,.25L1.27,1', 1.67],
  '5': ['M1.67,0L0,0L0,.48L1.3,.48Q1.67,.48 1.67,.74Q1.67,1 1.3,1L0,1', 1.67],
};

/** A rectangle w wide from radius r0 to r1 along clock angle a. */
const bar = (a: number, w: number, r0: number, r1: number) => {
  const p0 = P(r0, a), p1 = P(r1, a), nx = Math.cos(a * Math.PI / 180) * w / 2, ny = Math.sin(a * Math.PI / 180) * w / 2;
  return `M${f(p0[0] - nx)},${f(p0[1] - ny)}L${f(p1[0] - nx)},${f(p1[1] - ny)}L${f(p1[0] + nx)},${f(p1[1] + ny)}L${f(p0[0] + nx)},${f(p0[1] + ny)}Z`;
};
const dot = (x: number, y: number, r: number) => `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;

/** The twelve-sided steel edge: corners 21.1 mm out at each hour, each side cut in a shallow scallop. */
function scallops(r = 21.1) {
  let d = `M${pt(r, 0)}`;
  for (let k = 1; k <= 12; k++) d += `A99.4,99.4 0 0 0 ${pt(r, k * 30)}`;
  return d + 'Z';
}

/**
 * The bezel: the scalloped polished edge, a dark joint, and the blue ceramic insert from 16.35 to 19.9, glossy, with
 * the studio reflected across its upper left and more faintly at its lower right. White enamel scale: a dot 16.68 out
 * at every minute, a short bar at each ten, long bars at the other fives, the figures 10 to 50 and the zero triangle
 * with its lumed pip in a polished setting.
 */
function bezel(id: string, L: FullLook) {
  const m = L.caseColor, ink = L.bezelText;
  let s = `<path d="${scallops()}" fill="url(#${id}vp)" stroke="${shade(m, -.5)}" stroke-width=".08" stroke-linejoin="round"/>`;
  s += `<circle r="20.2" fill="none" stroke="#fff" stroke-width=".14" opacity=".45"/><circle r="19.97" fill="${shade(L.bezel, -.55)}"/><circle r="19.9" fill="${L.bezel}"/>`;
  const sector = (a0: number, a1: number) => `M${pt(19.9, a0)}A19.9,19.9 0 0 1 ${pt(19.9, a1)}L${pt(16.35, a1)}A16.35,16.35 0 0 0 ${pt(16.35, a0)}Z`;
  for (const [i, a0, a1, peak] of [[1, 262, 352, .5], [2, 92, 150, .26]] as const) {
    const p0 = P(18, a0), p1 = P(18, a1);
    s += `<defs><linearGradient id="${id}vg${i}" gradientUnits="userSpaceOnUse" x1="${f(p0[0])}" y1="${f(p0[1])}" x2="${f(p1[0])}" y2="${f(p1[1])}"><stop stop-color="#c9d4e2" stop-opacity="0"/><stop offset=".4" stop-color="#c9d4e2" stop-opacity="${peak}"/><stop offset=".62" stop-color="#b9c6d6" stop-opacity="${peak}"/><stop offset="1" stop-color="#b9c6d6" stop-opacity="0"/></linearGradient></defs>`;
    s += `<path d="${sector(a0, a1)}" fill="url(#${id}vg${i})"/>`;
  }
  let marks = '';
  for (let mnt = 1; mnt < 60; mnt++) {
    const a = mnt * 6;
    if (mnt % 10 === 0) marks += bar(a, .42, 16.38, 17.1);
    else if (mnt % 5 === 0) marks += bar(a, .46, 16.4, 19.6);
    else { const [x, y] = P(16.68, a); marks += dot(x, y, .28); }
  }
  let figs = '';
  for (let mnt = 10; mnt < 60; mnt += 10) figs += `<path d="${strokeDigits(String(mnt), 0, -18.475, 1.83, 1, .38, BEZEL_DIGITS)}" transform="rotate(${mnt * 6})"/>`;
  s += `<path d="${marks}" fill="${ink}"/><g fill="none" stroke="${ink}" stroke-width=".42" stroke-linecap="round" stroke-linejoin="round">${figs}</g><path d="M-2.52,-19.45H2.52L0,-16.62Z" fill="none" stroke="${ink}" stroke-width=".36" stroke-linejoin="round"/>`;
  // The pip: a polished setting with a dark outer edge and a bright inner bevel round the lume.
  s += `<circle cy="-18.26" r=".6" fill="url(#${id}vw)" stroke="#3f474d" stroke-width=".07"/><circle cy="-18.26" r=".45" fill="none" stroke="#fff" stroke-width=".07" opacity=".75"/><circle cy="-18.26" r=".37" fill="${shade(m, -.35)}"/><circle cy="-18.26" r=".33" fill="url(#${id}vl)"${lu('bezel')}/>`;
  // The insert's inner edge sloping down, then a fine steel ring at the dial's edge.
  return s + `<circle r="16.35" fill="url(#${id}vf)"/><circle r="15.9" fill="none" stroke="${mix(L.bezel, '#9aabbd', .45)}" stroke-width=".3"/><circle r="15.72" fill="none" stroke="#fff" stroke-width=".06" opacity=".3"/>`;
}

/**
 * The dial to 15.6 with its waves, and the minute track: each five minutes' graduations joined by an arc at 14.95 (a
 * bracket), shortened either side of SWISS MADE, and a light-blue mark at each hour.
 */
function dial(id: string) {
  let s = `<circle r="15.6" fill="url(#${id}vd)"/><circle r="15.6" fill="url(#${id}vv)"/>`;
  let ticks = '', arcs = '', hours = '';
  for (let g = 0; g < 12; g++) {
    const first = g === 6 ? 2 : 1, last = g === 5 ? 3 : 4;
    for (let i = first; i <= last; i++) ticks += `M${pt(14.08, (5 * g + i) * 6)}L${pt(14.95, (5 * g + i) * 6)}`;
    const a0 = (5 * g + first) * 6, a1 = (5 * g + last) * 6;
    arcs += `M${pt(14.95, a0)}A14.95,14.95 0 0 1 ${pt(14.95, a1)}`;
    hours += bar(g * 30, .34, 13.72, 14.92);
  }
  s += `<path d="${ticks}${arcs}" fill="none" stroke="#e7eef4" stroke-width=".11"/><path d="${hours}" fill="#9cc4ea"/>`;
  return s;
}

/**
 * Applied rhodium markers filled with lume: dots 2.65 mm across 11.72 out, batons 1.8 mm wide from 9.3 to 13.3 at 3
 * and 9, two 1.9 mm batons at 12 and a short one at 6 under the date.
 */
function markers(id: string) {
  const F = .2;
  let frame = '', lume = '';
  for (let h = 1; h < 12; h++) {
    if (h % 3 === 0) continue;
    const [x, y] = P(11.72, h * 30);
    frame += dot(x, y, 1.32); lume += dot(x, y, 1.32 - F);
  }
  for (const h of [3, 9]) { frame += bar(h * 30, 1.8, 9.3, 13.3); lume += bar(h * 30, 1.8 - 2 * F, 9.3 + F, 13.3 - F); }
  for (const x of [-1.1, 1.1]) { frame += `M${f(x - .95)},-13.25H${f(x + .95)}V-9.15H${f(x - .95)}Z`; lume += `M${f(x - .95 + F)},${-13.25 + F}H${f(x + .95 - F)}V${-9.15 - F}H${f(x - .95 + F)}Z`; }
  frame += 'M-.83,12.42H.83V13.58H-.83Z'; lume += `M${-.83 + F},${12.42 + F}H${.83 - F}V${13.58 - F}H${-.83 + F}Z`;
  return `<path d="${frame}" fill="#000" opacity=".38" transform="translate(.08 .12)"/><path d="${frame}" fill="url(#${id}vw)" stroke="#78808a" stroke-width=".05"/>`
    + `<path d="${lume}" fill="url(#${id}vl)"${lu('indices')}/>`;
}

/** The date at 6: a polished frame round the window, and the white figure on the blue disc. */
function date(L: FullLook) {
  return `<rect x="-1.32" y="8.73" width="2.64" height="3.27" rx=".12" fill="${mix(L.dial, '#a9bcd0', .35)}"/><rect x="-1.02" y="9.05" width="2.04" height="2.63" fill="${shade(L.dial, -.2)}"/>`
    + `<text y="11.6" font-family="'Helvetica Neue',Arial,Helvetica,sans-serif" font-size="2.75" text-anchor="middle" fill="#f4f6f8">8</text>`;
}

/** The applied Ω, OMEGA, the red Seamaster and PROFESSIONAL above the centre; the material, certification and depth below. */
function printing() {
  const ink = '#f2f4f6', sans = `font-family="'Futura','Century Gothic','Avenir Next',Arial,Helvetica,sans-serif" text-anchor="middle"`;
  let s = `<path d="M-.78,.62H-.3A.62,.62 0 1 1 .3,.62H.78" transform="translate(0 -7.56)" fill="none" stroke="#eef0f2" stroke-width=".2"/>`;
  s += `<text y="-5.39" ${sans} font-size="1.5" textLength="6" lengthAdjust="spacingAndGlyphs" fill="${ink}">OMEGA</text>`;
  // A heavy brush script, thickened with its own stroke where the system face is lighter than Omega's.
  s += `<text x=".05" y="-3.66" font-family="'Brush Script MT','Segoe Script','Snell Roundhand',cursive" font-style="italic" font-size="2" textLength="7.1" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="#dc2a2e" stroke="#dc2a2e" stroke-width=".07" stroke-linejoin="round">Seamaster</text>`;
  s += `<text y="-2.6" ${sans} font-size=".9" textLength="6.4" lengthAdjust="spacingAndGlyphs" fill="${ink}">PROFESSIONAL</text>`;
  s += `<text y="2.3" ${sans} font-size="1.02" textLength="2.66" lengthAdjust="spacingAndGlyphs" fill="#5d7a98" opacity=".75">[ZrO<tspan font-size=".62">2</tspan>]</text>`;
  s += `<text y="4.3" ${sans} font-size=".76" textLength="4.12" lengthAdjust="spacingAndGlyphs" fill="${ink}">CO-AXIAL</text>`;
  s += `<text y="5.27" ${sans} font-size=".68" textLength="8.46" lengthAdjust="spacingAndGlyphs" fill="${ink}">MASTER CHRONOMETER</text>`;
  s += `<text y="6.29" ${sans} font-size=".9" textLength="6.3" lengthAdjust="spacingAndGlyphs" fill="${ink}">300m / 1000ft</text>`;
  // SWISS and MADE either side of the 6 o'clock mark, square to the radius.
  for (const [w, a, t] of [['SWISS', 6.2, 2.2], ['MADE', -5.9, 2]] as const)
    s += `<text y="14.83" ${sans} font-size=".6" textLength="${t}" lengthAdjust="spacingAndGlyphs" fill="${ink}" transform="rotate(${a})">${w}</text>`;
  return s;
}

/**
 * Skeleton hands, posed at 10:08 as in the photo. Hour: a rhodium frame widening from the hub to an arrow head 2.7 mm
 * across at 7.93 and its point at 8.82, open between its arms, with a lume circle 1.6 mm across in the head. Minute:
 * the same to an arrowhead 3.46 mm across at 10.67, pointed at 13.21, with a lume triangle. Seconds: a white needle,
 * a lume lollipop 9.07 out and a red tip to 14.32.
 */
function hands(id: string, L: FullLook) {
  const ha = 303.7, ma = 47.3, sa = 221.9, metal = `url(#${id}vw)`, edge = '#6f777d', lume = `url(#${id}vl)`;
  const hour = 'M-.3,1L-.62,-1.7L-1.36,-7.93L0,-8.82L1.36,-7.93L.62,-1.7L.3,1Z', hourWin = 'M-.25,-2.15L-.73,-6.15H.73L.25,-2.15Z';
  const minute = 'M-.3,1.1L-.55,-1.7L-1.12,-10.3L-1.73,-10.67L0,-13.21L1.73,-10.67L1.12,-10.3L.55,-1.7L.3,1.1Z', minWin = 'M-.18,-2.2L-.69,-9.85H.69L.18,-2.2Z';
  const second = 'M-.11,1.8L-.08,-8.15H.08L.11,1.8Z';
  const red = 'M-.1,-9.95L-.07,-14.02L0,-14.32L.07,-14.02L.1,-9.95Z';
  // The right half of each frame a tone darker: brushed on one side of the ridge, catching less light on the other.
  const half = (outer: string, win: string) => `<path d="${outer}${win}" fill="${metal}" fill-rule="evenodd" stroke="${edge}" stroke-width=".05"/><path d="${outer}${win}" fill="#5b6268" fill-rule="evenodd" opacity=".22" clip-path="url(#${id}vh)"/><path d="${win}" fill="none" stroke="#fff" stroke-width=".12" opacity=".55"/>`;
  let s = `<defs><clipPath id="${id}vh"><rect x="0" y="-15" width="3" height="17"/></clipPath></defs>`;
  s += `<g fill="#000" opacity=".3" transform="translate(.16 .24)"><path d="${hour}${hourWin}" fill-rule="evenodd" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}${minWin}" fill-rule="evenodd" ${handRole('minute')}transform="rotate(${ma})"/><g ${handRole('second')}transform="rotate(${sa})"><path d="${second}${red}"/><circle cy="-9.07" r=".93"/></g></g>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})">${half(hour, hourWin)}<circle cy="-7.34" r=".8" fill="${lume}"${lu('hands')}/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})">${half(minute, minWin)}<path d="M-1.05,-10.82L0,-12.6L1.05,-10.82Z" fill="${lume}"${lu('minute')}/></g>`;
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="${second}" fill="${L.handColor}" stroke="${edge}" stroke-width=".03"/><path d="${red}" fill="#c8182c"/><circle cy="-9.07" r=".93" fill="${metal}" stroke="${edge}" stroke-width=".04"/><circle cy="-9.07" r=".7" fill="${lume}"${lu('seconds')}/></g>`;
  return s + `<circle r="1.08" fill="${metal}" stroke="${edge}" stroke-width=".05"/><circle r=".45" fill="none" stroke="#9aa1a6" stroke-width=".08"/><circle r=".18" fill="#80878c"/>`;
}

export interface Omega21030422003001Options { D: number; LL: number; lw: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the bracelet for the Seamaster Diver 300M 210.30.42.20.03.001. */
export function omega21030422003001SVG(o: Omega21030422003001Options) {
  const { D, LL, lw, id, L, outline } = o;
  const d = omega21030422003001Case(D, LL, lw), u = D / PHOTO_D, m = L.caseColor;
  let s = outline ? '' : defs(id, L);
  const partStroke = outline ? o.stroke.replace(/stroke-width="([\d.]+)"/, (_, w: string) => `stroke-width="${f(+w / u)}"`) : `stroke="${shade(m, -.45)}" stroke-width=".08"`;
  s += `<g transform="scale(${f(u)})">${valve(id, L, outline, partStroke)}</g>`;
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}vc)`}" ${outline ? o.stroke : `stroke="${shade(m, -.45)}" stroke-width=".12"`}/>`;
  if (outline) return s + `<g transform="scale(${f(u)})">${crown(id, L, true, partStroke)}</g><path d="${scallops()}" transform="scale(${f(u)})" fill="none" ${o.stroke.replace(/stroke-width="([\d.]+)"/, (_, w: string) => `stroke-width="${f(+w / u)}"`)}/><circle r="${f(16.35 * u)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  // Brushed case and lug tops lit from above; outside each lug's crease the polished facet, feathered in over the
  // turn; the tips' end faces in shade; the bezel's shadow below and to the right of it.
  const lg = lugs(D, LL, lw);
  s += `<defs><clipPath id="${id}vcc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}vcc)"><path d="${d}" fill="url(#${id}vb)"/>${lugTopLight(id, D, LL, .8)}`
    + `<path d="${lg.feather}" fill="url(#${id}vq)" opacity=".45"/><path d="${lg.facets}" fill="url(#${id}vq)" opacity=".8"/><path d="${lg.feather}" fill="url(#${id}vb)" opacity=".4"/><path d="${lg.creases}" fill="none" stroke="#fff" stroke-width=".3" opacity=".22"/>`
    + `<path d="${lg.ends}" fill="none" stroke="${shade(m, -.55)}" stroke-width=".9" opacity=".35"/>${bezelShadow(21.2 * u)}</g>`;
  s += `<g transform="scale(${f(u)})">`;
  s += crown(id, L, false, partStroke);
  s += bezel(id, L);
  s += dial(id);
  s += markers(id);
  s += date(L);
  s += printing();
  s += hands(id, L);
  // Domed sapphire: a faint reflection across the upper left.
  s += `<path d="M-13.2,-4.4A13.9,13.9 0 0 1 -4.4,-13.2A16.1,16.1 0 0 0 -13.2,-4.4Z" fill="#fff" opacity=".07"/>`;
  return s + '</g>';
}
