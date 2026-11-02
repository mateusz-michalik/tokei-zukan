import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { P } from './geom';
import { handRole } from './hands';
import { lu } from './night';
import { strokeDigits, type StrokeGlyphs } from './strokeDigits';

// Rolex Submariner 124060-0001: the 2020 no-date Submariner in Oystersteel, 41 mm, on the Oyster bracelet. Straight
// lugs with polished bevels down their outer edges and crown guards either side of the Triplock crown; a
// unidirectional bezel with a 120-notch edge and a glossy black Cerachrom insert whose engraved numerals and
// graduations are coated in platinum, with the Chromalight pip in the zero triangle; a polished rehaut engraved ROLEX;
// a black lacquer dial with white-gold-framed Chromalight hour markers (a triangle at 12, batons at 3, 6 and 9, dots
// between), the coronet and five lines of print; the Mercedes hour hand, a sword minute hand and a seconds hand with
// its lume dot. No date and no Cyclops lens.
//
// Everything was measured on Rolex's front-on product photo at one uniform 9.28 px/mm. The photo is taken slightly
// from below and to the left: the lug tips' midpoint sits 1.1 mm below the hand pivot and 0.1 mm to its right, and
// the bezel's raised edge appears shifted left. So the case was measured about the lug midpoint, the dial about the
// pivot and the bezel about its own centre, and all three are centred here. The photo's case is 41 mm across and
// 48.55 mm lug to lug; it maps onto the catalogue's dimensions with sx = D / 41 and sy = LL / 48.55, and the dial and
// bezel are drawn in photo millimetres scaled by u = D / 41. See docs/models/rolex-124060-0001.md.

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

/** Photo millimetres: the case side under the bezel, the lug tips, and the case's length in the photo. */
const CASE_R = 20.4, TIP_Y = 24.275, PHOTO_LL = 48.55, PHOTO_D = 41;

/**
 * One quarter of the case at the top right (`right`) or mirrored to the top left: from where the lug's inner edge
 * leaves the case, across the flat lug tip and round its corner, down the straight outer flank (slope 0.364, as
 * measured) and into the case side at 3 or 9. On the right the flank swells into the crown guard, whose flat face
 * stands 22.4 mm out, and steps in to the crown's recess.
 */
function quarter(sx: number, sy: number, slot: number, right: boolean): { start: XY; segs: Seg[] } {
  const X = (x: number) => x * sx, Y = (y: number) => y * sy;
  const yi = Math.sqrt(X(CASE_R) ** 2 - slot * slot), H = Y(TIP_Y);
  const segs: Seg[] = [
    { c: [], p: [slot, -H + .25] },
    { c: [[slot, -H]], p: [slot + .25, -H] },
    { c: [], p: [X(12.95), -H] },
    { c: [[X(13.62), -H]], p: [X(13.66), Y(-23.6)] },
  ];
  if (right) {
    segs.push(
      { c: [], p: [X(18.62), Y(-10.0)] },
      { c: [[X(19.5), Y(-9.2)], [X(21.55), Y(-8.55)]], p: [X(22.2), Y(-7.55)] },
      { c: [[X(22.4), Y(-7.25)]], p: [X(22.4), Y(-6.75)] },
      { c: [], p: [X(22.4), Y(-3.95)] },
      { c: [[X(22.4), Y(-3.6)]], p: [X(22.05), Y(-3.6)] },
      { c: [], p: [X(20.75), Y(-3.6)] },
      { c: [], p: [X(20.75), 0] },
    );
  } else {
    segs.push(
      { c: [], p: [X(18.7), Y(-9.8)] },
      { c: [[X(19.45), Y(-7.75)], [X(20.4), Y(-5.1)]], p: [X(CASE_R), Y(-2.4)] },
      { c: [], p: [X(CASE_R), 0] },
    );
  }
  return { start: [slot, -yi], segs };
}

/** The whole case outline, closed, with lug openings exactly `lw` wide. */
export function rolex1240600001Case(D: number, LL: number, lw: number) {
  const sx = D / PHOTO_D, sy = LL / PHOTO_LL, slot = lw / 2, rc = CASE_R * sx;
  const R = quarter(sx, sy, slot, true), Lq = quarter(sx, sy, slot, false);
  const start = R.start, yi = -start[1];
  const br = reverse(flipY(start), map(R.segs, flipY));               // bottom right, walked towards its inner edge
  const bl = map(Lq.segs, rot);                                       // bottom left, walked outwards
  const tl = reverse(flipX(Lq.start), map(Lq.segs, flipX));           // top left, walked towards its inner edge
  const arc = (p: XY) => `A${f(rc)},${f(rc)} 0 0 1 ${xy(p)}`;
  return `M${xy(start)}${segPath(R.segs)}${segPath(br)}${arc([-slot, yi])}${segPath(bl)}${segPath(tl)}${arc(start)}Z`;
}

/**
 * The lugs' outer flanks, from each tip's corner down to the case side, as open paths: stroked and clipped to the
 * case they make the polished bevel that runs down the outside of every lug.
 */
function flanks(D: number, LL: number) {
  const sx = D / PHOTO_D, sy = LL / PHOTO_LL;
  const one: Seg[] = [{ c: [], p: [18.7 * sx, -9.8 * sy] }, { c: [[19.45 * sx, -7.75 * sy], [20.4 * sx, -5.1 * sy]], p: [CASE_R * sx, -2.4 * sy] }];
  const from: XY = [13.5 * sx, -24.1 * sy];
  let d = '';
  for (const t of [(p: XY) => p, flipX, flipY, rot]) d += `M${xy(t(from))}${segPath(map(one, t))}`;
  return d;
}

/**
 * Light on the lug tops, lit from above as in the photo: each lug's brushed face is brightest towards its tip and falls
 * into shade where it runs under the bezel. Rectangles over each lug, clipped to the case, under the brushing and bevels.
 */
function lugFaces(D: number, LL: number, lw: number, id: string) {
  const sx = D / PHOTO_D, sy = LL / PHOTO_LL, slot = lw / 2, H = TIP_Y * sy, y1 = 10.2 * sy, x1 = 23 * sx;
  let s = '';
  for (const v of [-1, 1]) {
    const g = `${id}rf${v < 0 ? 't' : 'b'}`;
    s += `<linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(v * H)}" x2="0" y2="${f(v * 11.5 * sy)}"><stop stop-color="#fff" stop-opacity=".72"/><stop offset=".35" stop-color="#fff" stop-opacity=".36"/><stop offset=".7" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>`;
  }
  let rects = '';
  for (const v of [-1, 1]) for (const h of [-1, 1]) {
    const x = h < 0 ? -x1 : slot, y = v < 0 ? -H : y1;
    rects += `<rect x="${f(x)}" y="${f(y)}" width="${f(x1 - slot)}" height="${f(H - y1)}" fill="url(#${id}rf${v < 0 ? 't' : 'b'})"/>`;
  }
  return `<defs>${s}</defs>${rects}`;
}

/** The four flat lug tips, as open paths: stroked and clipped to the case, they darken each tip's end face. */
function tipEdges(D: number, LL: number, lw: number) {
  const sx = D / PHOTO_D, sy = LL / PHOTO_LL, slot = lw / 2, H = TIP_Y * sy;
  let d = '';
  for (const v of [-1, 1]) for (const h of [-1, 1]) d += `M${f(h * slot)},${f(v * H)}H${f(h * 13.62 * sx)}`;
  return d;
}

function defs(id: string, L: FullLook) {
  const m = L.caseColor;
  return `<defs><linearGradient id="${id}rc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .2)}"/><stop offset=".5" stop-color="${m}"/><stop offset="1" stop-color="${shade(m, -.18)}"/></linearGradient>`
    // Polished surfaces: bright with a dark band, a mirror catching the studio.
    + `<linearGradient id="${id}rp" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbfbfa"/><stop offset=".3" stop-color="${shade(m, .32)}"/><stop offset=".52" stop-color="${shade(m, -.42)}"/><stop offset=".7" stop-color="${shade(m, .42)}"/><stop offset="1" stop-color="${shade(m, -.12)}"/></linearGradient>`
    + `<linearGradient id="${id}ry" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, -.45)}"/><stop offset=".22" stop-color="${shade(m, .5)}"/><stop offset=".5" stop-color="#fbfbfa"/><stop offset=".8" stop-color="${shade(m, .05)}"/><stop offset="1" stop-color="${shade(m, -.45)}"/></linearGradient>`
    + `<pattern id="${id}rb" patternUnits="userSpaceOnUse" width=".5" height="2"><path d="M.1,0V2M.32,0V2" stroke="#fff" stroke-width=".05" opacity=".22"/><path d="M.21,0V2" stroke="#4d5152" stroke-width=".04" opacity=".14"/></pattern>`
    // Rehaut: a polished ring sloping down into the dial, in shade at its foot and lighter towards its rim.
    + `<radialGradient id="${id}rr" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="15.95"><stop offset=".868" stop-color="#26292b"/><stop offset=".9" stop-color="#46494c"/><stop offset=".955" stop-color="#7f8487"/><stop offset="1" stop-color="#aeb2b4"/></radialGradient>`
    + `<radialGradient id="${id}rd" cx=".45" cy=".38" r=".75"><stop stop-color="${shade(L.dial, .12)}"/><stop offset="1" stop-color="${shade(L.dial, -.1)}"/></radialGradient>`
    + `<radialGradient id="${id}rl" cx=".4" cy=".35" r=".8"><stop stop-color="${shade(L.lume, .06)}"/><stop offset="1" stop-color="${shade(L.lume, -.1)}"/></radialGradient>`
    // White gold of the marker frames and hands: polished, light with a grey turn.
    + `<linearGradient id="${id}rw" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fdfdfc"/><stop offset=".5" stop-color="${L.handColor}"/><stop offset="1" stop-color="#8e9396"/></linearGradient>`
    + `<path id="${id}rt" d="M0,14.85A14.85,14.85 0 1 1 0,-14.85A14.85,14.85 0 1 1 0,14.85"/></defs>`;
}

/**
 * The Triplock crown at 3: a fluted barrel 7.2 mm tall from the recess at 20.75 to 24.0, and a smooth rounded cap to
 * 24.9, on its tube. Photo millimetres; drawn beneath the case, so the guards overlap its root.
 */
function crown(id: string, L: FullLook, outline: boolean, stroke: string) {
  const m = L.caseColor;
  let s = '';
  if (!outline) s += `<rect x="20.3" y="-2.3" width="1.2" height="4.6" fill="${shade(m, -.5)}"/>`;
  s += `<path d="M${outline ? 20.75 : 20.6},-3.6H24.1Q24.9,-3.6 24.9,-2.8V2.8Q24.9,3.6 24.1,3.6H${outline ? 20.75 : 20.6}Z" fill="${outline ? 'none' : `url(#${id}ry)`}" ${stroke}/>`;
  if (!outline) {
    // Flutes along the barrel: a dark groove under each lit ridge.
    let grooves = '', ridges = '';
    for (let i = -3; i <= 3; i++) {
      const y = i * 1.04;
      grooves += `M20.9,${f(y + .38)}H23.95`;
      ridges += `M20.9,${f(y)}H23.9`;
    }
    s += `<path d="${grooves}" stroke="#2c3033" stroke-width=".3" opacity=".8"/><path d="${ridges}" stroke="#fff" stroke-width=".16" opacity=".6"/>`;
    s += `<path d="M24.05,-3.45V3.45" stroke="${shade(m, -.4)}" stroke-width=".12"/><rect x="24.25" y="-3.05" width=".32" height="6.1" rx=".15" fill="#fbfbfa" opacity=".7"/>`;
  }
  return s;
}

/**
 * The bezel's engraved figures: squared, a little over half as wide as tall, with rounded corners, flat tops and a
 * plain-bar 1. Centrelines in a box 1 tall, for strokeDigits; stroked 0.38 mm wide they stand 2.7 mm tall and 1.75 mm
 * wide, as measured on the photo's 30.
 */
const BEZEL_DIGITS: StrokeGlyphs = {
  '0': ['M.15,0L.44,0Q.59,0 .59,.15L.59,.85Q.59,1 .44,1L.15,1Q0,1 0,.85L0,.15Q0,0 .15,0Z', .59],
  '1': ['M.04,0L.04,1', .08],
  '2': ['M0,.16Q0,0 .15,0L.44,0Q.59,0 .59,.15L.59,.38Q.59,.5 .47,.54L.12,.66Q0,.7 0,.82L0,1L.59,1', .59],
  '3': ['M0,.16Q0,0 .14,0L.45,0Q.59,0 .59,.14L.59,.86Q.59,1 .45,1L.14,1Q0,1 0,.84M.24,.5L.59,.5', .59],
  '4': ['M.46,1L.46,0L0,.7L.59,.7', .59],
  '5': ['M.57,0L.04,0L.02,.46L.45,.46Q.59,.46 .59,.6L.59,.86Q.59,1 .45,1L.14,1Q0,1 0,.84', .59],
};

/**
 * The bezel: a 120-notch edge from 19.75 to 20.45 and the black Cerachrom insert from 16.05 to 19.5, glossy, with
 * the studio reflected across it. Engraved platinum graduations: the zero triangle with its Chromalight pip, numerals
 * at 10 to 50, broad bars at the other five minutes and short bars at each minute up to 15.
 */
function bezel(id: string, L: FullLook) {
  const m = L.caseColor, ink = L.bezelText;
  let teeth = '';
  for (let i = 0; i < 120; i++) {
    const a = i * 3;
    teeth += `M${pt(19.95, a - 1.5)}L${pt(20.45, a - .7)}A20.45,20.45 0 0 1 ${pt(20.45, a + .7)}L${pt(19.95, a + 1.5)}Z`;
  }
  let s = `<circle r="20.05" fill="${shade(m, -.48)}"/><path d="${teeth}" fill="url(#${id}rp)" stroke="${shade(m, -.5)}" stroke-width=".04"/>`;
  s += `<circle r="19.72" fill="url(#${id}rp)"/><circle r="19.5" fill="${L.bezel}"/>`;
  // Gloss on the ceramic: a broad reflection over the upper left and a smaller one on the right, as in the photo. Each
  // fades in and out along its arc, over the black, rather than ending at a hard edge.
  const sector = (a0: number, a1: number) => `M${pt(19.5, a0)}A19.5,19.5 0 0 1 ${pt(19.5, a1)}L${pt(16.05, a1)}A16.05,16.05 0 0 0 ${pt(16.05, a0)}Z`;
  for (const [i, a0, a1, peak] of [[1, 238, 346, .56], [2, 66, 148, .46]] as const) {
    const p0 = P(17.8, a0), p1 = P(17.8, a1);
    s += `<defs><linearGradient id="${id}rg${i}" gradientUnits="userSpaceOnUse" x1="${f(p0[0])}" y1="${f(p0[1])}" x2="${f(p1[0])}" y2="${f(p1[1])}"><stop stop-color="#cfd4d8" stop-opacity="0"/><stop offset=".24" stop-color="#cfd4d8" stop-opacity="${peak}"/><stop offset=".76" stop-color="#c3c8cc" stop-opacity="${peak}"/><stop offset="1" stop-color="#c3c8cc" stop-opacity="0"/></linearGradient></defs>`;
    s += `<path d="${sector(a0, a1)}" fill="url(#${id}rg${i})"/>`;
  }
  // Graduations, all in the insert's own platinum.
  let bars = '', ticks = '';
  for (let mnt = 1; mnt < 60; mnt++) {
    const a = mnt * 6;
    if (mnt % 10 === 0) continue;
    if (mnt % 5 === 0) {
      const [nx, ny] = [Math.cos(a * Math.PI / 180) * .475, Math.sin(a * Math.PI / 180) * .475], p0 = P(16.45, a), p1 = P(19.15, a);
      bars += `M${f(p0[0] - nx)},${f(p0[1] - ny)}L${f(p1[0] - nx)},${f(p1[1] - ny)}L${f(p1[0] + nx)},${f(p1[1] + ny)}L${f(p0[0] + nx)},${f(p0[1] + ny)}Z`;
    } else if (mnt < 15) {
      const [nx, ny] = [Math.cos(a * Math.PI / 180) * .22, Math.sin(a * Math.PI / 180) * .22], p0 = P(16.3, a), p1 = P(17.65, a);
      ticks += `M${f(p0[0] - nx)},${f(p0[1] - ny)}L${f(p1[0] - nx)},${f(p1[1] - ny)}L${f(p1[0] + nx)},${f(p1[1] + ny)}L${f(p0[0] + nx)},${f(p0[1] + ny)}Z`;
    }
  }
  let figs = '';
  for (let mnt = 10; mnt < 60; mnt += 10) figs += `<path d="${strokeDigits(String(mnt), 0, -17.75, 2.32, 1, .33, BEZEL_DIGITS)}" transform="rotate(${mnt * 6})"/>`;
  // Zero is an inverted triangle. Everything engraved is drawn three times: a dark edge where the cut is in shadow at the
  // upper left, a light edge catching the light at the lower right, then the platinum itself.
  const cut = `<path d="${bars}${ticks}M-2.1,-19.15H2.1L0,-16.15Z" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-width=".38" stroke-linejoin="round">${figs}</g>`;
  s += `<g color="#45494c" transform="translate(-.07 -.07)">${cut}</g><g color="#f4f6f7" opacity=".5" transform="translate(.06 .07)">${cut}</g><g color="${ink}">${cut}</g>`;
  // The pip in a polished white-gold setting.
  s += `<circle cy="-18.1" r=".98" fill="url(#${id}rw)" stroke="#6f7477" stroke-width=".05"/><circle cy="-18.1" r=".7" fill="url(#${id}rl)"${lu('bezel')}/>`;
  // The insert's inner edge, then the polished rehaut sloping down to the dial, engraved ROLEX all the way round.
  // Local highlights where the slope catches the light, at the upper left and more faintly at the lower right.
  s += `<circle r="16.05" fill="#0b0c0d"/><circle r="15.95" fill="url(#${id}rr)"/><circle r="15.88" fill="none" stroke="#d3d6d8" stroke-width=".08" opacity=".55"/>`;
  s += `<path d="M${pt(15.3, 288)}A15.3,15.3 0 0 1 ${pt(15.3, 336)}" stroke="#fff" stroke-width=".55" stroke-linecap="round" opacity=".3" fill="none"/><path d="M${pt(15.3, 112)}A15.3,15.3 0 0 1 ${pt(15.3, 154)}" stroke="#fff" stroke-width=".45" stroke-linecap="round" opacity=".16" fill="none"/>`;
  s += `<text font-family="Georgia,'Times New Roman',serif" font-size=".62" letter-spacing=".05" fill="#6c7174" opacity=".3"><textPath href="#${id}rt" textLength="93" lengthAdjust="spacing">${'ROLEX '.repeat(22)}</textPath></text>`;
  return s;
}

/** The black dial to 13.85 with its printed minute track: a short white bar at every minute near the edge. */
function dial(id: string) {
  const s = `<circle r="13.95" fill="#1d1f21"/><circle r="13.85" fill="url(#${id}rd)"/>`;
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    if (i >= 29 && i <= 31) continue;   // SWISS MADE sits in the track below the 6
    ticks += `M${pt(12.95, i * 6)}L${pt(13.55, i * 6)}`;
  }
  return s + `<path d="${ticks}" stroke="#f2f2ee" stroke-width=".13"/>`;
}

/**
 * Applied hour markers: polished white-gold frames filled with Chromalight. A triangle at 12 (r 8.15 to 12.3, 3.4 mm
 * wide), batons at 3, 6 and 9 (8.6 to 12.7, 1.5 mm wide) and dots 2.44 mm across centred 11.2 out.
 */
function markers(id: string) {
  const F = .17;   // width of the white-gold frame
  const baton = (a: number, r0: number, r1: number, w: number) => {
    const p0 = P(r0, a), p1 = P(r1, a), [nx, ny] = [Math.cos(a * Math.PI / 180) * w / 2, Math.sin(a * Math.PI / 180) * w / 2];
    return `M${f(p0[0] - nx)},${f(p0[1] - ny)}L${f(p1[0] - nx)},${f(p1[1] - ny)}L${f(p1[0] + nx)},${f(p1[1] + ny)}L${f(p0[0] + nx)},${f(p0[1] + ny)}Z`;
  };
  const dot = (x: number, y: number, r: number) => `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;
  // The triangle's lume is the frame inset by F on every side.
  const k = F / Math.sin(Math.atan2(1.7, 4.15));
  let frame = 'M-1.7,-12.3H1.7L0,-8.15Z', lume = `M${f(-1.7 + F * 2.2)},${f(-12.3 + F)}H${f(1.7 - F * 2.2)}L0,${f(-8.15 - k)}Z`;
  for (const h of [3, 6, 9]) { frame += baton(h * 30, 8.6, 12.7, 1.5); lume += baton(h * 30, 8.6 + F, 12.7 - F, 1.5 - 2 * F); }
  for (let h = 1; h < 12; h++) {
    if (h % 3 === 0) continue;
    const [x, y] = P(11.2, h * 30);
    frame += dot(x, y, 1.22);
    lume += dot(x, y, 1.22 - F);
  }
  return `<path d="${frame}" fill="#000" opacity=".4" transform="translate(.08 .12)"/><path d="${frame}" fill="url(#${id}rw)" stroke="#7d8285" stroke-width=".05" stroke-linejoin="round"/>`
    + `<path d="${lume}" fill="url(#${id}rl)"${lu('indices')}/>`;
}

/** The applied coronet, ROLEX and OYSTER PERPETUAL above the centre; the depth rating and certification below. */
function printing() {
  const ink = '#f1f1ee';
  // Coronet: five prongs tipped with balls over a band, on an oval.
  let crown = '';
  for (const [x, top] of [[-.78, -6.62], [-.4, -6.85], [0, -6.95], [.4, -6.85], [.78, -6.62]] as const) crown += `M0,-5.55L${f(x * .55)},-5.9L${x},${top}`;
  let s = `<g fill="none" stroke="${ink}" stroke-width=".13" stroke-linecap="round"><path d="${crown}"/></g>`;
  for (const [x, top] of [[-.78, -6.62], [-.4, -6.85], [0, -6.95], [.4, -6.85], [.78, -6.62]] as const) s += `<circle cx="${x}" cy="${f(top - .12)}" r=".14" fill="${ink}"/>`;
  s += `<path d="M-.62,-5.55H.62L.5,-5.25H-.5Z" fill="${ink}"/><ellipse cy="-5.0" rx=".42" ry=".2" fill="none" stroke="${ink}" stroke-width=".1"/>`;
  const serif = `font-family="'Times New Roman',Times,Georgia,serif" text-anchor="middle" fill="${ink}"`;
  const sans = `font-family="'Helvetica Neue',Arial,Helvetica,sans-serif" text-anchor="middle" fill="${ink}"`;
  s += `<text y="-3.66" ${serif} font-size="1.42" textLength="7" lengthAdjust="spacingAndGlyphs">ROLEX</text>`;
  s += `<text y="-2.76" ${serif} font-size=".72" textLength="9.2" lengthAdjust="spacingAndGlyphs">OYSTER PERPETUAL</text>`;
  s += `<text y="4.6" ${sans} font-size="1.02" textLength="7.8" lengthAdjust="spacingAndGlyphs">SUBMARINER</text>`;
  // Spaced with letter-spacing rather than textLength, which resvg (the share images) misapplies across the tspans.
  s += `<text y="5.68" ${sans} font-size=".9" letter-spacing=".1">1000<tspan font-style="italic">ft</tspan> = 300<tspan font-style="italic">m</tspan></text>`;
  s += `<text y="6.57" ${sans} font-size=".64" textLength="9.8" lengthAdjust="spacingAndGlyphs">SUPERLATIVE CHRONOMETER</text>`;
  s += `<text y="7.54" ${sans} font-size=".64" textLength="7.4" lengthAdjust="spacingAndGlyphs">OFFICIALLY CERTIFIED</text>`;
  // SWISS and MADE either side of a tiny coronet, in the minute track at 6.
  s += `<text x="-1.25" y="13.5" ${sans} font-size=".42" textLength="1.6" lengthAdjust="spacingAndGlyphs">SWISS</text><text x="1.25" y="13.5" ${sans} font-size=".42" textLength="1.5" lengthAdjust="spacingAndGlyphs">MADE</text>`;
  return s + `<path d="M-.28,13.5L-.3,13.12L-.12,13.3L0,13.05L.12,13.3L.3,13.12L.28,13.5Z" fill="${ink}"/>`;
}

/**
 * Hands, posed at 10:10 as in the photo. Hour: the Mercedes hand, its circle 2.1 mm across 5.4 out with three lume
 * segments, and a short pointed tip to 7.6. Minute: a tapering sword to 12.8 with a lume inlay. Seconds: a needle with
 * a lume dot framed in white gold 7.7 out and a long tail ending in a slim paddle.
 */
function hands(id: string) {
  const ha = 302, ma = 63.8, sa = 185.4, metal = `url(#${id}rw)`, edge = '#6d7275', lume = `url(#${id}rl)`;
  // Hour: a shaft to the ring, the ring 2.1 mm across 5.4 out, and a pointed tip beyond it to 7.6.
  const c = -5.4, R = 1.05;
  const hour = `M-.36,1.3L-.45,-4.5L.45,-4.5L.36,1.3Z M${-R},${c}a${R},${R} 0 1 0 ${2 * R},0a${R},${R} 0 1 0 ${-2 * R},0Z M-.5,-6.2L0,-7.6L.5,-6.2Z`;
  const hourLume = (() => {
    // Three lume segments between the Mercedes spokes (one towards the tip, two behind), and a lume tip.
    const r = .8, seg = (a0: number, a1: number) => {
      const p = (a: number, rr: number): XY => [rr * Math.sin(a * Math.PI / 180), c - rr * Math.cos(a * Math.PI / 180)];
      return `M${xy(p(a0 + 22, .16))}L${xy(p(a0 + 9, r))}A${r},${r} 0 0 1 ${xy(p(a1 - 9, r))}L${xy(p(a1 - 22, .16))}Z`;
    };
    return seg(0, 120) + seg(120, 240) + seg(240, 360) + `M-.3,-6.55L0,-7.25L.3,-6.55Z`;
  })();
  const minute = `M-.36,1.6L-.5,-1.2L-.42,-11.6L0,-12.8L.42,-11.6L.5,-1.2L.36,1.6Z`;
  const minuteLume = `M-.27,-2.2L-.24,-11.45L0,-12.25L.24,-11.45L.27,-2.2Z`;
  // Seconds: the needle to 13.4, and a long tail that widens into a slim paddle up to the coronet.
  const second = `M-.08,3.4L-.06,-6.95A.78,.78 0 0 1 .06,-6.95L.08,3.4Z M-.06,-8.45L-.04,-13.4H.04L.06,-8.45Z M-.08,3.2L-.17,3.55V4.75A.17,.17 0 0 0 .17,4.75V3.55L.08,3.2Z`;
  let s = `<g fill="#000" opacity=".32" transform="translate(.16 .24)"><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/><g ${handRole('second')}transform="rotate(${sa})"><path d="${second}"/><circle cy="-7.7" r=".78"/></g></g>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hour}" fill="${metal}" stroke="${edge}" stroke-width=".05"/><path d="${hourLume}" fill="${lume}"${lu('hands')}/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minute}" fill="${metal}" stroke="${edge}" stroke-width=".05"/><path d="${minuteLume}" fill="${lume}"${lu('hands')}/></g>`;
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="${second}" fill="${metal}" stroke="${edge}" stroke-width=".03"/><circle cy="-7.7" r=".78" fill="${metal}" stroke="${edge}" stroke-width=".04"/><circle cy="-7.7" r=".56" fill="${lume}"${lu('seconds')}/></g>`;
  return s + `<circle r=".85" fill="${metal}" stroke="${edge}" stroke-width=".05"/><circle r=".28" fill="#8b9093"/>`;
}

export interface Rolex1240600001Options { D: number; LL: number; lw: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the bracelet for the Rolex Submariner 124060-0001. */
export function rolex1240600001SVG(o: Rolex1240600001Options) {
  const { D, LL, lw, id, L, outline } = o;
  const d = rolex1240600001Case(D, LL, lw), u = D / PHOTO_D, m = L.caseColor;
  let s = outline ? '' : defs(id, L);
  s += `<g transform="scale(${f(u)})">${crown(id, L, outline, outline ? o.stroke.replace(/stroke-width="([\d.]+)"/, (_, w: string) => `stroke-width="${f(+w / u)}"`) : `stroke="${shade(m, -.45)}" stroke-width=".08"`)}</g>`;
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}rc)`}" ${outline ? o.stroke : `stroke="${shade(m, -.45)}" stroke-width=".12"`}/>`;
  if (outline) return s + `<circle r="${f(20.45 * u)}" fill="none" ${o.stroke}/><circle r="${f(16.05 * u)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  // Brushed lug tops lit from above, the shaded outer slope and polished bevel of each lug, and shaded tip faces.
  // The bezel's shadow falls on the case below and to the right of it.
  s += `<defs><clipPath id="${id}rcc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}rcc)">${lugFaces(D, LL, lw, id)}<path d="${d}" fill="url(#${id}rb)"/>`
    // Down each lug's outside: a shaded slope about 1.3 mm wide, then the bright polished bevel and a dark edge.
    + `<path d="${flanks(D, LL)}" fill="none" stroke="${shade(m, -.3)}" stroke-width="2.6" opacity=".55"/><path d="${flanks(D, LL)}" fill="none" stroke="#f2f3f3" stroke-width=".9"/><path d="${flanks(D, LL)}" fill="none" stroke="${shade(m, -.5)}" stroke-width=".26"/>`
    + `<path d="${tipEdges(D, LL, lw)}" stroke="${shade(m, -.5)}" stroke-width=".42" opacity=".6"/>`
    + `<circle r="${f(20.6 * u)}" fill="none" stroke="#000" stroke-width="1.1" opacity=".16" transform="translate(.12 .2)"/></g>`;
  s += `<g transform="scale(${f(u)})">`;
  s += bezel(id, L);
  s += dial(id);
  s += markers(id);
  s += printing();
  s += hands(id);
  // Flat sapphire: a faint reflection across the upper left.
  s += `<path d="M-12.6,-4.2A13.3,13.3 0 0 1 -4.2,-12.6A15.4,15.4 0 0 0 -12.6,-4.2Z" fill="#fff" opacity=".06"/>`;
  return s + '</g>';
}
