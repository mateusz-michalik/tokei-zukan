import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { bezelShadow } from './cases';
import { P } from './geom';
import { handRole } from './hands';
import { lu } from './night';

// Rolex Datejust 36 126234-0017: White Rolesor (Oystersteel case and five-piece Jubilee bracelet, fluted 18k white-gold
// bezel) with the bright-blue sunray dial. Mirror-polished monobloc Oyster middle case with tapering lugs and an
// unguarded fluted Twinlock crown at 3; a 76-flute white-gold bezel with crisp alternating triangular facets over a
// polished ROLEX-engraved rehaut; the bright-blue sunray dial with a white minute track and SWISS ♛ MADE at 6, applied
// 18k white-gold Chromalight baton hour markers, the large applied 12 o'clock coronet, ROLEX / OYSTER PERPETUAL /
// DATEJUST and SUPERLATIVE CHRONOMETER / OFFICIALLY CERTIFIED; the instantaneous date at 3 under the sapphire Cyclops
// lens; and faceted 18k white-gold Chromalight baton hour and minute hands with a needle seconds hand.
//
// Everything was measured on Rolex's front-on product photo (3200 × 4762 px) at one uniform 38.075 px/mm, the scale at
// which the bracelet between the lugs is 20 mm and the middle case at 3 and 9 is 36 mm across. The lug tips' midpoint
// sits 0.89 mm below the hand pivot and the bezel's raised rim sits 0.21 mm above it; the case, bezel and dial were
// measured about their own centres and are all centred here. The photo's lugs read 43.02 mm end to end against
// Fratello's 43.3 mm because they curve down away from the camera, so the case is drawn at the catalogue's dimensions
// with sx = D / 36 and sy = LL / 43.3, and the bezel and dial are drawn in photo millimetres scaled by u = D / 36.
// See docs/models/rolex-126234-0017.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');

type XY = [number, number];
type Seg = { c: XY[]; p: XY };
const xy = ([x, y]: XY) => `${f(x)},${f(y)}`;
const segPath = (segs: Seg[]) => segs.map(s => (s.c.length === 0 ? 'L' : s.c.length === 1 ? 'Q' : 'C') + [...s.c, s.p].map(xy).join(' ')).join('');
/** The same segments walked from their end back to `start`. */
function reverse(start: XY, segs: Seg[]): Seg[] {
  const pts = [start, ...segs.map(s => s.p)];
  return segs.map((s, i) => ({ c: [...s.c].reverse(), p: pts[i] })).reverse();
}
const map = (segs: Seg[], t: (p: XY) => XY): Seg[] => segs.map(s => ({ c: s.c.map(t), p: t(s.p) }));
const flipX = ([x, y]: XY): XY => [-x, y], flipY = ([x, y]: XY): XY => [x, -y], rot = ([x, y]: XY): XY => [-x, -y];

const CASE_R = 17.95, SPEC_D = 36, SPEC_LL = 43.3, PHOTO_D = 36;

/**
 * One lug's outer edge from the corner of its gently angled tip: round the tight tip corner, down the smoothly curving
 * Oyster flank and into the case side at 3 or 9. The crown is unguarded, so all four quarters share the same contour.
 */
const outer = (X: (x: number) => number, Y: (y: number) => number): Seg[] => [
  { c: [[X(11.82), Y(-21.4)], [X(11.94), Y(-21.25)]], p: [X(12.02), Y(-20.85)] },
  { c: [[X(12.88), Y(-18.1)], [X(14.75), Y(-13.5)]], p: [X(16.15), Y(-9.6)] },
  { c: [[X(17.15), Y(-6.8)], [X(CASE_R), Y(-3.8)]], p: [X(CASE_R), 0] },
];

const scales = (D: number, LL: number) => {
  const sx = D / SPEC_D, sy = LL / SPEC_LL;
  return { sx, sy, X: (x: number) => x * sx, Y: (y: number) => y * sy };
};

/**
 * One quarter of the case at the top right: from where the lug's inner edge leaves the case, up to the inner corner at
 * `H`, slightly inward-angled across the polished tip to `(11.68, -21.42)`, and down the curved Oyster flank.
 */
function quarter(D: number, LL: number, slot: number): { start: XY; segs: Seg[] } {
  const { X, Y } = scales(D, LL), H = LL / 2;
  const yi = Math.sqrt(X(CASE_R) ** 2 - slot * slot);
  const segs: Seg[] = [
    { c: [], p: [slot, -H + .2] },
    { c: [[slot, -H]], p: [slot + .2, -H] },
    { c: [], p: [X(11.65), Y(-21.42)] },
    ...outer(X, Y),
  ];
  return { start: [slot, -yi], segs };
}

/** The whole case outline, closed, with lug openings `lw` wide and no crown guards. */
export function rolex1262340017Case(D: number, LL: number, lw: number) {
  const slot = lw / 2, rc = CASE_R * D / SPEC_D;
  const q = quarter(D, LL, slot), start = q.start, yi = -start[1];
  const br = reverse(flipY(start), map(q.segs, flipY));
  const bl = map(q.segs, rot);
  const tl = reverse(flipX(start), map(q.segs, flipX));
  const arc = (p: XY) => `A${f(rc)},${f(rc)} 0 0 1 ${xy(p)}`;
  return `M${xy(start)}${segPath(q.segs)}${segPath(br)}${arc([-slot, yi])}${segPath(bl)}${segPath(tl)}${arc(start)}Z`;
}

/** Open paths along the four outer lug flanks, for the mirror-polished case reflections and crisp edge bevel. */
function flanks(D: number, LL: number) {
  const { X, Y } = scales(D, LL), one = outer(X, Y), from: XY = [X(11.65), Y(-21.42)];
  let d = '';
  for (const t of [(p: XY) => p, flipX, flipY, rot]) d += `M${xy(t(from))}${segPath(map(one, t))}`;
  return d;
}

/** A colour scaled towards black or brighter in its own hue, as a sunray dial shifts round the circle. */
function mul(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(x => Math.min(255, Math.round(x * k)));
  return '#' + c.map(x => x.toString(16).padStart(2, '0')).join('');
}

function defs(id: string, L: FullLook) {
  const m = L.caseColor, wg = L.bezel;
  return `<defs>`
    // Mirror-polished Oystersteel case: bright upper-left lugs, gentle studio reflection across the waist.
    + `<linearGradient id="${id}dc" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="#fcfcfd"/><stop offset=".28" stop-color="${shade(m, .48)}"/><stop offset=".52" stop-color="${shade(m, -.12)}"/><stop offset=".74" stop-color="${shade(m, .38)}"/><stop offset="1" stop-color="${shade(m, -.24)}"/></linearGradient>`
    // Polished white gold for the bezel skirt and applied furniture: slightly warmer than steel.
    + `<linearGradient id="${id}dp" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fdfdfc"/><stop offset=".3" stop-color="${shade(wg, .34)}"/><stop offset=".54" stop-color="${shade(wg, -.38)}"/><stop offset=".74" stop-color="${shade(wg, .4)}"/><stop offset="1" stop-color="${shade(wg, -.14)}"/></linearGradient>`
    // Crown barrel and polished cap.
    + `<linearGradient id="${id}dy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, -.48)}"/><stop offset=".2" stop-color="${shade(m, .52)}"/><stop offset=".48" stop-color="#fcfcfc"/><stop offset=".78" stop-color="${shade(m, .04)}"/><stop offset="1" stop-color="${shade(m, -.48)}"/></linearGradient>`
    // Rehaut: polished ring sloping down from crystal to dial, brighter than on the black-dial Submariner.
    + `<radialGradient id="${id}dr" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="15.45"><stop offset=".89" stop-color="#4d555d"/><stop offset=".92" stop-color="#8b9196"/><stop offset=".965" stop-color="#c3c7ca"/><stop offset="1" stop-color="#e2e4e6"/></radialGradient>`
    // Dial base radial falloff, darkening gently at the outer minute track.
    + `<radialGradient id="${id}dd" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="13.8"><stop offset=".68" stop-color="${L.dial}"/><stop offset="1" stop-color="${shade(L.dial, -.26)}"/></radialGradient>`
    + `<radialGradient id="${id}dl" cx=".4" cy=".35" r=".8"><stop stop-color="${shade(L.lume, .06)}"/><stop offset="1" stop-color="${shade(L.lume, -.09)}"/></radialGradient>`
    // White gold for marker frames, coronet and hands.
    + `<linearGradient id="${id}dw" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fefefd"/><stop offset=".48" stop-color="${L.handColor}"/><stop offset="1" stop-color="#8b9196"/></linearGradient>`
    // Cyclops lens rim and anti-reflective sheen.
    + `<linearGradient id="${id}dg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#eef4fa" stop-opacity=".62"/><stop offset=".28" stop-color="#87a8cc" stop-opacity=".22"/><stop offset=".68" stop-color="#0b2847" stop-opacity="0"/><stop offset="1" stop-color="#cee2f7" stop-opacity=".28"/></linearGradient>`
    + `<path id="${id}dt" d="M0,14.55A14.55,14.55 0 1 1 0,-14.55A14.55,14.55 0 1 1 0,14.55"/></defs>`;
}

/**
 * Mirror-polished Oyster case finish, inside its clip: unlike the Submariner's brushed lugs, the Datejust 36's lug
 * tops are mirror-polished, brightest across the upper half of each lug with a dark reflection near each tip's bend
 * and a crisp dark/light turn along the outer flanks, plus the bezel's shadow.
 */
function caseFinish(D: number, LL: number, lw: number, id: string, m: string, d: string, u: number) {
  const { sx, sy } = scales(D, LL), slot = lw / 2, H = LL / 2, x1 = 19 * sx;
  let g = '<defs>';
  // Upper lugs reflect the overhead studio light down to a dark horizon band near the tip; lower lugs mirror it.
  g += `<linearGradient id="${id}dft" gradientUnits="userSpaceOnUse" x1="0" y1="${f(-H)}" x2="0" y2="${f(-10 * sy)}"><stop stop-color="${shade(m, -.48)}" stop-opacity=".55"/><stop offset=".13" stop-color="${shade(m, -.55)}" stop-opacity=".62"/><stop offset=".22" stop-color="#fff" stop-opacity=".78"/><stop offset=".62" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>`;
  g += `<linearGradient id="${id}dfb" gradientUnits="userSpaceOnUse" x1="0" y1="${f(H)}" x2="0" y2="${f(10 * sy)}"><stop stop-color="${shade(m, .35)}" stop-opacity=".45"/><stop offset=".14" stop-color="${shade(m, -.58)}" stop-opacity=".68"/><stop offset=".28" stop-color="${shade(m, -.35)}" stop-opacity=".35"/><stop offset=".48" stop-color="#fff" stop-opacity=".68"/><stop offset=".8" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>`;
  g += `<clipPath id="${id}dcc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}dcc)">`;
  for (const h of [-1, 1]) {
    const x = h < 0 ? -x1 : slot, w = x1 - slot;
    g += `<rect x="${f(x)}" y="${f(-H)}" width="${f(w)}" height="${f(H - 10 * sy)}" fill="url(#${id}dft)"/>`;
    g += `<rect x="${f(x)}" y="${f(10 * sy)}" width="${f(w)}" height="${f(H - 10 * sy)}" fill="url(#${id}dfb)"/>`;
  }
  const fl = flanks(D, LL);
  g += `<path d="${fl}" fill="none" stroke="${shade(m, -.42)}" stroke-width="1.5" opacity=".42"/>`
    + `<path d="${fl}" fill="none" stroke="#fcfcfd" stroke-width=".75" opacity=".88"/>`
    + `<path d="${fl}" fill="none" stroke="${shade(m, -.52)}" stroke-width=".22"/>`
    + bezelShadow(17.75 * u) + '</g>';
  return g;
}

/**
 * The unguarded Twinlock crown at 3: a short recessed neck at the case side, a fluted barrel 5.6 mm tall from 18.05 to
 * 19.65 with sharp horizontal facets, and a chamfered, domed polished cap to 20.32. Photo millimetres; drawn beneath
 * the case.
 */
function crown(id: string, L: FullLook, outline: boolean, stroke: string) {
  const m = L.caseColor, x0 = outline ? 17.95 : 17.75;
  let s = '';
  if (!outline) s += `<rect x="17.65" y="-2.15" width=".5" height="4.3" fill="${shade(m, -.55)}"/>`;
  s += `<path d="M${x0},-2.82H19.62L20.12,-2.15Q20.34,-1.2 20.34,0Q20.34,1.2 20.12,2.15L19.62,2.82H${x0}Z" fill="${outline ? 'none' : `url(#${id}dy)`}" ${stroke}/>`;
  if (!outline) {
    // Nine fluted facets down the barrel: dark shaded undersides and bright lit tops.
    let dark = '', lit = '';
    const ys = [-2.52, -1.94, -1.34, -.72, -.08, .56, 1.18, 1.78, 2.34];
    ys.forEach((y, i) => {
      const h = i < 2 || i > 6 ? .24 : .3;
      dark += `M18.02,${f(y)}H19.6V${f(y + h)}H18.02Z`;
      lit += `M18.02,${f(y - .22)}H19.6V${f(y)}H18.02Z`;
    });
    s += `<path d="${lit}" fill="#fafbfb" opacity=".78"/><path d="${dark}" fill="#262a2d" opacity=".78"/>`;
    // Polished chamfer and domed end cap.
    s += `<path d="M19.6,-2.78L20.08,-2.12Q20.3,-1.15 20.3,0Q20.3,1.15 20.08,2.12L19.6,2.78Q19.82,1.4 19.82,0Q19.82,-1.4 19.6,-2.78Z" fill="url(#${id}dy)" stroke="${shade(m, -.4)}" stroke-width=".06"/>`;
    s += `<path d="M20.06,-1.7Q20.2,0 20.06,1.7" fill="none" stroke="#fff" stroke-width=".16" stroke-linecap="round" opacity=".8"/>`;
  }
  return s;
}

/**
 * The fluted 18k white-gold bezel: 76 sharp triangular flutes (152 planar facets, each 2.368° wide) sloping from the
 * inner bezel rim at r = 15.65 out to the scalloped outer skirt at r = 17.48 / 17.64. Because each flute is two flat
 * mirror planes tilted oppositely in azimuth, adjacent facets reflect different parts of the room and alternate cleanly
 * between bright specular gold-white, soft mid-silver and deep charcoal reflections — grouped into 5 tone buckets so
 * the whole bezel is 5 compound paths, crisp at enlargement and quiet at thumbnail size.
 */
function bezel(id: string, L: FullLook) {
  const wg = L.bezel, N = 76, step = 180 / N;
  const rIn = 15.65, rCrest = 17.44, rVal = 17.6;
  const g = (a: number, c: number, w: number) => {
    let d = Math.abs((((a - c) % 360) + 540) % 360 - 180);
    return Math.exp(-((d / w) ** 2));
  };
  // The two slopes of each flute face opposite ways in azimuth, so they catch the studio softboxes and dark cards
  // independently and never go dark together — around 3 and 9 one slope is bright white while its partner is in shade.
  const cwTone = (a: number) => .88 + .16 * g(a, 330, 62) + .14 * g(a, 125, 22) + .12 * g(a, 240, 50)
    - .32 * g(a, 26, 15) - .68 * g(a, 39, 7) - .84 * g(a, 91, 13) - .76 * g(a, 161, 13) - .2 * g(a, 180, 14) - .62 * g(a, 229, 6);
  const ccwTone = (a: number) => .82 + .18 * g(a, 82, 22) + .18 * g(a, 222, 34) + .08 * g(a, 332, 42)
    - .68 * g(a, 59, 6) - .46 * g(a, 126, 18) - .3 * g(a, 165, 16) - .78 * g(a, 188, 15) - .76 * g(a, 274, 18);

  // Bucket facets into 6 white-gold tones (6 compound paths instead of 152 elements), keeping dark reflections in a
  // soft steel-slate rather than pitch black so the bezel sits naturally beside the catalogue's other watches.
  const tones = ['#43484e', '#74797e', '#a3a7ab', '#cbcdd0', '#e5e7e8', '#fcfcfb'];
  const buckets = ['', '', '', '', '', ''];
  for (let m = 0; m < 2 * N; m++) {
    const a0 = m * step, a1 = (m + 1) * step, mid = (a0 + a1) / 2;
    const even = m % 2 === 0;
    const r0 = even ? rCrest : rVal, r1 = even ? rVal : rCrest;
    const v = even ? cwTone(mid) : ccwTone(mid);
    const bi = v < .28 ? 0 : v < .5 ? 1 : v < .68 ? 2 : v < .83 ? 3 : v < .94 ? 4 : 5;
    buckets[bi] += `M${pt(rIn, a0)}L${pt(r0, a0)}L${pt(r1, a1)}L${pt(rIn, a1)}Z`;
  }
  // Scalloped outer outline following the flutes' crests and valleys, rather than a flat ring across them.
  let rim = '';
  for (let i = 0; i < N; i++) {
    const a = i * 2 * step;
    rim += `${i ? 'L' : 'M'}${pt(rCrest, a)}L${pt(rVal, a + step)}`;
  }
  let s = `<path d="${rim}Z" fill="${tones[3]}" stroke="${shade(wg, -.42)}" stroke-width=".12" stroke-linejoin="round"/>`;
  buckets.forEach((d, i) => { if (d) s += `<path d="${d}" fill="${tones[i]}"/>`; });
  // Crisp inner zig-zag step around the sapphire crystal and ROLEX-engraved rehaut.
  s += `<circle r="${rIn}" fill="#454a50"/><circle r="15.52" fill="#e6e8ea"/><circle r="15.42" fill="url(#${id}dr)"/>`;
  s += `<circle r="15.35" fill="none" stroke="#fafbfc" stroke-width=".09" opacity=".7"/>`;
  s += `<path d="M${pt(14.7, 290)}A14.7,14.7 0 0 1 ${pt(14.7, 345)}" stroke="#fff" stroke-width=".5" stroke-linecap="round" opacity=".32" fill="none"/>`;
  s += `<path d="M${pt(14.7, 110)}A14.7,14.7 0 0 1 ${pt(14.7, 152)}" stroke="#fff" stroke-width=".4" stroke-linecap="round" opacity=".18" fill="none"/>`;
  s += `<text font-family="Georgia,'Times New Roman',serif" font-size=".6" letter-spacing=".06" fill="#5e6469" opacity=".34"><textPath href="#${id}dt" textLength="89.5" lengthAdjust="spacing">${'ROLEX '.repeat(20)}</textPath></text>`;
  return s;
}

/**
 * The bright-blue sunray dial to 13.78: nested cos 2θ wedges brightest along the 42°–222° axis and deepest along
 * 132°–312° (as measured on the photo), with subtle radial brushing, a crisp white minute track from 12.78 to 13.52,
 * and SWISS ♛ MADE nestled between the 29- and 31-minute marks at 6.
 */
function dial(id: string, L: FullLook) {
  let s = `<circle r="13.86" fill="#0d2238"/><circle r="13.78" fill="url(#${id}dd)"/>`;
  const K = 6, light = mul(L.dial, 1.85), dark = mul(L.dial, .34);
  for (let k = 1; k <= K; k++) {
    const w = Math.acos(((k - .5) / K) ** (1 / 1.35)) * 90 / Math.PI;
    const pair = (c: number) => `M0,0L${pt(13.78, c - w)}A13.78,13.78 0 0 1 ${pt(13.78, c + w)}ZM0,0L${pt(13.78, c + 180 - w)}A13.78,13.78 0 0 1 ${pt(13.78, c + 180 + w)}Z`;
    s += `<path d="${pair(42)}" fill="${light}" fill-opacity=".165"/><path d="${pair(132)}" fill="${dark}" fill-opacity=".14"/>`;
  }
  // Fine radial metallic lines, faint enough to stay quiet at thumbnail size.
  let rays = '';
  for (let i = 0; i < 90; i++) rays += `M${pt(1.4 + (i % 3) * .8, i * 4)}L${pt(13.75, i * 4)}`;
  s += `<path d="${rays}" stroke="#fff" stroke-width=".05" opacity=".035"/>`;
  // Printed white minute track: slightly heavier five-minute bars, and a clear opening at 6 for SWISS ♛ MADE.
  let minor = '', major = '';
  for (let i = 0; i < 60; i++) {
    if (i === 30) continue;
    const a = i * 6;
    if (i % 5 === 0) major += `M${pt(12.78, a)}L${pt(13.52, a)}`;
    else minor += `M${pt(12.82, a)}L${pt(13.52, a)}`;
  }
  return s + `<path d="${minor}" stroke="#eff2f5" stroke-width=".11"/><path d="${major}" stroke="#f5f7f9" stroke-width=".22"/>`;
}

/**
 * Applied hour markers: 18k white-gold rectangular frames (8.9 to 12.35, 1.12 mm wide) filled with Chromalight at 1,
 * 2, 4, 5, 6, 7, 8, 9, 10 and 11 (12 holds the applied coronet; 3 holds the date), plus the applied white-gold coronet
 * at 12 (five ball-tipped prongs from y = −12.0 to its oval base at −8.85, 3.05 mm across).
 */
function markers(id: string, L: FullLook) {
  const baton = (a: number) => {
    const p0 = P(8.9, a), p1 = P(12.35, a), [nx, ny] = [Math.cos(a * Math.PI / 180) * .56, Math.sin(a * Math.PI / 180) * .56];
    const q0 = P(9.14, a), q1 = P(12.11, a), [lx, ly] = [Math.cos(a * Math.PI / 180) * .34, Math.sin(a * Math.PI / 180) * .34];
    return {
      f: `M${f(p0[0] - nx)},${f(p0[1] - ny)}L${f(p1[0] - nx)},${f(p1[1] - ny)}L${f(p1[0] + nx)},${f(p1[1] + ny)}L${f(p0[0] + nx)},${f(p0[1] + ny)}Z`,
      l: `M${f(q0[0] - lx)},${f(q0[1] - ly)}L${f(q1[0] - lx)},${f(q1[1] - ly)}L${f(q1[0] + lx)},${f(q1[1] + ly)}L${f(q0[0] + lx)},${f(q0[1] + ly)}Z`,
    };
  };
  let frame = '', lume = '';
  for (let h = 1; h < 12; h++) {
    if (h === 3 && L.date) continue;
    const b = baton(h * 30);
    frame += b.f;
    lume += b.l;
  }
  // The applied 12 o'clock Rolex coronet: five tapering prongs from a sculpted band above an open oval base, and five
  // polished spheres at the tips.
  const tips: [number, number, number][] = [[-1.38, -11.08, -.62], [-.74, -11.68, -.32], [0, -11.88, 0], [.74, -11.68, .32], [1.38, -11.08, .62]];
  let prongs = '';
  for (const [tx, ty, bx] of tips) prongs += `M${f(bx - .11)},-9.52L${f(tx - .055)},${f(ty)}L${f(tx + .055)},${f(ty)}L${f(bx + .11)},-9.52Z`;
  let balls = '';
  for (const [tx, ty] of tips) balls += `M${f(tx - .19)},${f(ty - .06)}a.19,.19 0 1 0 .38,0a.19,.19 0 1 0 -.38,0`;
  const band = 'M-.76,-9.58Q0,-9.72 .76,-9.58L.66,-9.12Q0,-9.26 -.66,-9.12Z';
  const all = frame + prongs + balls + band;

  let s = `<path d="${all}" fill="#001124" opacity=".42" transform="translate(.08 .12)"/>`;
  s += `<path d="${all}" fill="url(#${id}dw)" stroke="#6d757c" stroke-width=".05" stroke-linejoin="round"/>`;
  s += `<ellipse cy="-8.98" rx=".62" ry=".24" fill="none" stroke="url(#${id}dw)" stroke-width=".16"/>`;
  return s + `<path d="${lume}" fill="url(#${id}dl)"${lu('indices')}/>`;
}

/**
 * The instantaneous date at 3 under the sapphire Cyclops magnifier, as in Rolex's photo: a bevelled dial cut-out round
 * the enlarged white date aperture showing '28' in Rolex's wide slab-serif numerals, and the cushion-shaped Cyclops
 * lens (x = 5.8 to 13.45, 6.2 mm tall) with its faint blue anti-reflective tint and bright upper/lower meniscus rims.
 */
function date(id: string, L: FullLook) {
  if (!L.date) return '';
  const lx = 9.65, ly = .32, lw = 7.65, lh = 6.15, dx = 9.3, dy = .48, dw = 4.45, dh = 2.95;
  // Slightly darker magnified dial recess inside the Cyclops, and a stepped dial bevel round the white date window.
  let s = `<rect x="${f(lx - lw / 2)}" y="${f(ly - lh / 2)}" width="${lw}" height="${lh}" rx="2.55" fill="${shade(L.dial, -.22)}"/>`;
  s += `<path d="M${f(dx - dw / 2 - .28)},${f(dy - dh / 2 - .26)}H${f(dx + dw / 2 + .5)}L${f(dx + dw / 2)},${f(dy - dh / 2)}H${f(dx - dw / 2)}Z" fill="${shade(L.dial, -.48)}"/>`;
  s += `<path d="M${f(dx + dw / 2)},${f(dy - dh / 2)}L${f(dx + dw / 2 + .5)},${f(dy - dh / 2 - .26)}V${f(dy + dh / 2 + .26)}L${f(dx + dw / 2)},${f(dy + dh / 2)}Z" fill="${mul(L.dial, 1.55)}" opacity=".75"/>`;
  s += `<rect x="${f(dx - dw / 2)}" y="${f(dy - dh / 2)}" width="${dw}" height="${dh}" rx=".08" fill="#f3f4f2" stroke="#6f7c8a" stroke-width=".07"/>`;
  // '28' magnified horizontally as through the 2.5× Cyclops, in crisp dark ink.
  s += `<text x="${dx}" y="${f(dy + .9)}" font-family="'Helvetica Neue',Arial,Helvetica,sans-serif" font-size="2.52" textLength="3.82" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="#17191b">28</text>`;
  // The Cyclops lens itself: subtle blue AR reflection, fine outer edge, and soft lower meniscus glow on the dial.
  s += `<path d="M${f(lx - 1.9)},${f(ly + lh / 2 + .28)}Q${lx},${f(ly + lh / 2 + .62)} ${f(lx + 2.1)},${f(ly + lh / 2 + .22)}" fill="none" stroke="#9ec3ea" stroke-width=".32" stroke-linecap="round" opacity=".32"/>`;
  s += `<rect x="${f(lx - lw / 2)}" y="${f(ly - lh / 2)}" width="${lw}" height="${lh}" rx="2.55" fill="url(#${id}dg)" stroke="#d5e2ef" stroke-width=".11"/>`;
  s += `<path d="M${f(lx - lw / 2 + 1.8)},${f(ly - lh / 2 + .14)}H${f(lx + lw / 2 - 1.8)}" stroke="#fff" stroke-width=".12" stroke-linecap="round" opacity=".65"/>`;
  return s;
}

/** Dial printing: ROLEX, OYSTER PERPETUAL and DATEJUST above the centre; SUPERLATIVE CHRONOMETER, OFFICIALLY CERTIFIED and SWISS ♛ MADE below. */
function printing() {
  const ink = '#f2f4f6';
  const serif = `font-family="'Times New Roman',Times,Georgia,serif" text-anchor="middle" fill="${ink}"`;
  const sans = `font-family="'Helvetica Neue',Arial,Helvetica,sans-serif" text-anchor="middle" fill="${ink}"`;
  let s = `<text y="-6.12" ${serif} font-size="1.22" font-weight="700" textLength="5.2" lengthAdjust="spacingAndGlyphs">ROLEX</text>`;
  s += `<text y="-5.14" ${sans} font-size=".75" textLength="10.7" lengthAdjust="spacingAndGlyphs">OYSTER PERPETUAL</text>`;
  s += `<text y="-4.02" ${sans} font-size=".94" textLength="7.2" lengthAdjust="spacingAndGlyphs">DATEJUST</text>`;
  s += `<text y="6.12" ${sans} font-size=".58" textLength="8.6" lengthAdjust="spacingAndGlyphs">SUPERLATIVE CHRONOMETER</text>`;
  s += `<text y="6.92" ${sans} font-size=".58" textLength="6.6" lengthAdjust="spacingAndGlyphs">OFFICIALLY CERTIFIED</text>`;
  // SWISS and MADE either side of a miniature five-prong coronet at 6, set upright inside the minute track.
  s += `<text x="-1.18" y="13.4" ${sans} font-size=".42" textLength="1.5" lengthAdjust="spacingAndGlyphs">SWISS</text>`;
  s += `<text x="1.18" y="13.4" ${sans} font-size=".42" textLength="1.45" lengthAdjust="spacingAndGlyphs">MADE</text>`;
  return s + `<path d="M-.24,13.42L-.28,13.02L-.11,13.2L0,12.96L.11,13.2L.28,13.02L.24,13.42Z" fill="${ink}"/>`;
}

/**
 * Faceted 18k white-gold baton hands with Chromalight inlays and square counterweights, posed at 10:10:31 as in Rolex's
 * photo (hour 304.3°, minute 62.6°, seconds 185.4°). Each blade has a bright and a shaded longitudinal facet so it
 * reads as roofed white gold, with the Chromalight strip in the outer half; the seconds hand is a slender polished
 * white-gold needle with no lume.
 */
function hands(id: string) {
  const ha = 304.3, ma = 62.6, sa = 185.4, lume = `url(#${id}dl)`;
  const baton = (w: number, tip: number, tail: number) => {
    const h = w / 2;
    return {
      all: `M${f(-h * .88)},${tail}L${-h},0L${f(-h * .84)},${-tip}H${f(h * .84)}L${h},0L${f(h * .88)},${tail}Z`,
      shadeHalf: `M0,${tail}H${f(-h * .88)}L${-h},0L${f(-h * .84)},${-tip}H0Z`,
    };
  };
  const hr = baton(.98, 8.05, 2.35), mn = baton(.92, 12.35, 2.45);
  const sec = 'M-.17,4.3H.17L.09,0L.045,-12.85H-.045L-.09,0Z';

  let s = `<g fill="#000d1c" opacity=".34" transform="translate(.14 .22)"><path d="${hr.all}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${mn.all}" ${handRole('minute')}transform="rotate(${ma})"/><path d="${sec}" ${handRole('second')}transform="rotate(${sa})"/></g>`;
  // Hour hand: lit upper-right facet, darker lower-left facet, Chromalight strip from 4.0 to 7.45.
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hr.all}" fill="#f7f8f9" stroke="#5d656c" stroke-width=".05"/><path d="${hr.shadeHalf}" fill="#6e767e"/>`
    + `<rect x="-.2" y="-7.45" width=".4" height="3.45" fill="${lume}"${lu('hands')}/></g>`;
  // Minute hand: darker lower-right facet, lit upper-left facet, Chromalight strip from 4.3 to 11.75.
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${mn.all}" fill="#6e767e" stroke="#5d656c" stroke-width=".05"/><path d="${mn.shadeHalf}" fill="#f7f8f9"/>`
    + `<rect x="-.18" y="-11.75" width=".36" height="7.45" fill="${lume}"${lu('hands')}/></g>`;
  // Seconds hand: polished white-gold needle, half-shaded down its spine, and the polished centre cap.
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="${sec}" fill="#f7f8f9" stroke="#5d656c" stroke-width=".03"/><path d="M0,4.3H.17L.09,0L.045,-12.85H0Z" fill="#7c848c"/></g>`;
  return s + `<circle r=".86" fill="url(#${id}dw)" stroke="#5d656c" stroke-width=".05"/><circle r=".22" fill="none" stroke="#6d757c" stroke-width=".07"/><circle r=".08" fill="#464d53"/>`;
}

export interface Rolex1262340017Options { D: number; LL: number; lw: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the bracelet for the Rolex Datejust 36 126234-0017. */
export function rolex1262340017SVG(o: Rolex1262340017Options) {
  const { D, LL, lw, id, L, outline } = o;
  const d = rolex1262340017Case(D, LL, lw), u = D / PHOTO_D, m = L.caseColor;
  let s = outline ? '' : defs(id, L);
  s += `<g transform="scale(${f(u)})">${crown(id, L, outline, outline ? o.stroke.replace(/stroke-width="([\d.]+)"/, (_, w: string) => `stroke-width="${f(+w / u)}"`) : `stroke="${shade(m, -.45)}" stroke-width=".08"`)}</g>`;
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}dc)`}" ${outline ? o.stroke : `stroke="${shade(m, -.45)}" stroke-width=".12"`}/>`;
  if (outline) return s + `<circle r="${f(17.6 * u)}" fill="none" ${o.stroke}/><circle r="${f(15.52 * u)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  s += caseFinish(D, LL, lw, id, m, d, u);
  s += `<g transform="scale(${f(u)})">`;
  s += bezel(id, L);
  s += dial(id, L);
  s += markers(id, L);
  s += date(id, L);
  s += printing();
  s += hands(id);
  // Flat sapphire crystal: a quiet reflection across the upper left.
  s += `<path d="M-12.4,-4.1A13.1,13.1 0 0 1 -4.1,-12.4A15.2,15.2 0 0 0 -12.4,-4.1Z" fill="#fff" opacity=".05"/>`;
  return s + '</g>';
}
