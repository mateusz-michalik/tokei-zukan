import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { P } from './geom';
import { handRole } from './hands';
import { lu } from './night';
import { strokeDigits, type StrokeGlyphs } from './strokeDigits';

// Tudor Black Bay 58 M7939A1A0NU-0001: the current-generation 39 mm Black Bay 58 in steel, on the five-link bracelet.
// Brushed lug tops with polished bevels down their outer edges and an unguarded, deeply fluted crown at 3; a
// unidirectional bezel with a notched edge and a matt black anodised aluminium insert with gilt figures, bars and
// minute marks and the red zero triangle with its lume pip; the domed sapphire's grey edge round a matt black domed
// dial with a gilt railway minute track, gilt-framed lume markers (a long triangle at 12, batons at 3, 6 and 9, dots
// between), the shield, TUDOR GENEVE, the depth rating and MASTER CHRONOMETER; the snowflake hour hand, a sword minute
// hand and a lollipop seconds hand, all gilt-framed.
//
// Everything was measured on Tudor's front-on product photo at one uniform 14.05 px/mm, the scale at which its bezel
// is 39 mm across. The lug tips' midpoint sits 0.4 mm below the hand pivot; the case was measured about the lug
// midpoint and the dial and bezel about the pivot, and all are centred here. The photo's case is PHOTO_LL lug to lug
// with lug openings of PHOTO_LW; it maps onto the catalogue's dimensions with sx = D / 39 and sy = LL / PHOTO_LL, and
// the dial and bezel are drawn in photo millimetres scaled by u = D / 39. See docs/models/tudor-m7939a1a0nu-0001.md.

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

/**
 * The case is drawn at Tudor's 39 × 47.8 mm, not stretched from the photo, whose lugs read short (45.6 mm) because they
 * turn down away from the camera. Its plan follows the photo's: flat lug tips, a broad rounded shoulder, and a full
 * flank curving into the case side under the bezel. Coordinates are millimetres at 39 × 47.8, scaled by D and LL.
 */
const CASE_R = 19.3, SPEC_D = 39, SPEC_LL = 47.8, PHOTO_D = 39;

/**
 * One lug's outer edge from the end of its flat tip: the broad rounded shoulder, the full flank and the case side down
 * to 3 or 9.
 */
const outer = (X: (x: number) => number, Y: (y: number) => number): Seg[] => [
  { c: [[X(12.65), Y(-23.9)], [X(13.6), Y(-23.3)]], p: [X(13.8), Y(-22.15)] },
  { c: [[X(14.6), Y(-18.1)], [X(17.25), Y(-12.3)]], p: [X(18.55), Y(-8.4)] },
  { c: [[X(19.15), Y(-6.4)], [X(CASE_R), Y(-4.3)]], p: [X(CASE_R), Y(-2.2)] },
  { c: [], p: [X(CASE_R), 0] },
];
const scales = (D: number, LL: number) => {
  const sx = D / SPEC_D, sy = LL / SPEC_LL;
  return { sx, sy, X: (x: number) => x * sx, Y: (y: number) => y * sy };
};

/**
 * One quarter of the case at the top right, or mirrored to the top left: from where the lug's inner edge leaves the
 * case, across the flat lug tip, round the shoulder and down the flank. The crown is unguarded, so both sides share the
 * same outline.
 */
function quarter(D: number, LL: number, slot: number): { start: XY; segs: Seg[] } {
  const { X, Y } = scales(D, LL), H = LL / 2;
  const yi = Math.sqrt(X(CASE_R) ** 2 - slot * slot);
  const segs: Seg[] = [
    { c: [], p: [slot, -H + .25] },
    { c: [[slot, -H]], p: [slot + .25, -H] },
    { c: [], p: [X(11.2), -H] },
    ...outer(X, Y),
  ];
  return { start: [slot, -yi], segs };
}

/** The whole case outline, closed, with lug openings exactly `lw` wide. */
export function m7939a1a0nu0001Case(D: number, LL: number, lw: number) {
  const slot = lw / 2, rc = CASE_R * D / SPEC_D;
  const q = quarter(D, LL, slot), start = q.start, yi = -start[1];
  const br = reverse(flipY(start), map(q.segs, flipY));
  const bl = map(q.segs, rot);
  const tl = reverse(flipX(start), map(q.segs, flipX));
  const arc = (p: XY) => `A${f(rc)},${f(rc)} 0 0 1 ${xy(p)}`;
  return `M${xy(start)}${segPath(q.segs)}${segPath(br)}${arc([-slot, yi])}${segPath(bl)}${segPath(tl)}${arc(start)}Z`;
}

/**
 * The lugs' outer edges as open paths, upper (v = -1) or lower (v = 1) pair, from each tip round the shoulder and down
 * the flank: stroked and clipped to the case they make the narrow polished bevel down each lug.
 */
function flanks(D: number, LL: number, v: number) {
  const { X, Y } = scales(D, LL), one = outer(X, Y).slice(0, 3), from: XY = [X(11.2), -LL / 2];
  let d = '';
  for (const t of v < 0 ? [(p: XY) => p, flipX] : [flipY, rot]) d += `M${xy(t(from))}${segPath(map(one, t))}`;
  return d;
}

/**
 * Light on the broad brushed lug tops, lit from above as in the photo: brightest towards the tips, falling into shade
 * where they run under the bezel. Rectangles over each lug, clipped to the case, under the brushing and bevels.
 */
function lugFaces(D: number, LL: number, lw: number, id: string) {
  const { sx, sy } = scales(D, LL), slot = lw / 2, H = LL / 2, y1 = 8.5 * sy, x1 = 21 * sx;
  let s = '', rects = '';
  for (const v of [-1, 1]) {
    s += `<linearGradient id="${id}tf${v < 0 ? 't' : 'b'}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(v * H)}" x2="0" y2="${f(v * 10 * sy)}"><stop stop-color="#fff" stop-opacity=".26"/><stop offset=".25" stop-color="#fff" stop-opacity=".02"/><stop offset=".6" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>`;
    for (const h of [-1, 1]) rects += `<rect x="${f(h < 0 ? -x1 : slot)}" y="${f(v < 0 ? -H : y1)}" width="${f(x1 - slot)}" height="${f(H - y1)}" fill="url(#${id}tf${v < 0 ? 't' : 'b'})"/>`;
  }
  return `<defs>${s}</defs>${rects}`;
}

/**
 * The narrow polished bevel down each lug's outside, about 0.6 mm: bright round the shoulder and turning darker down
 * the flank, with a fine light crease where it meets the brushed top and a dark outer edge.
 */
function bevels(D: number, LL: number, id: string, m: string) {
  const { sy } = scales(D, LL), H = LL / 2;
  let s = '<defs>';
  for (const v of [-1, 1]) s += `<linearGradient id="${id}tv${v < 0 ? 't' : 'b'}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(v * H)}" x2="0" y2="${f(v * 6 * sy)}"><stop stop-color="#f6f7f7"/><stop offset=".14" stop-color="${shade(m, .3)}"/><stop offset=".4" stop-color="${shade(m, -.38)}"/><stop offset=".72" stop-color="${shade(m, -.12)}"/><stop offset="1" stop-color="${shade(m, .2)}"/></linearGradient>`;
  s += '</defs>';
  for (const v of [-1, 1]) {
    const d = flanks(D, LL, v);
    s += `<path d="${d}" fill="none" stroke="#fff" stroke-width="1.34" opacity=".75"/><path d="${d}" fill="none" stroke="url(#${id}tv${v < 0 ? 't' : 'b'})" stroke-width="1.18"/><path d="${d}" fill="none" stroke="${shade(m, -.5)}" stroke-width=".22"/>`;
  }
  return s;
}

function defs(id: string, L: FullLook) {
  const m = L.caseColor, gilt = L.accent;
  return `<defs><linearGradient id="${id}tc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .2)}"/><stop offset=".5" stop-color="${m}"/><stop offset="1" stop-color="${shade(m, -.18)}"/></linearGradient>`
    // Polished surfaces: bright with a dark band, a mirror catching the studio.
    + `<linearGradient id="${id}tp" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbfbfa"/><stop offset=".3" stop-color="${shade(m, .32)}"/><stop offset=".52" stop-color="${shade(m, -.42)}"/><stop offset=".7" stop-color="${shade(m, .42)}"/><stop offset="1" stop-color="${shade(m, -.12)}"/></linearGradient>`
    + `<linearGradient id="${id}ty" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, -.45)}"/><stop offset=".22" stop-color="${shade(m, .5)}"/><stop offset=".5" stop-color="#fbfbfa"/><stop offset=".8" stop-color="${shade(m, .05)}"/><stop offset="1" stop-color="${shade(m, -.45)}"/></linearGradient>`
    // A crown ridge: lit along its top, shaded beneath.
    + `<linearGradient id="${id}tr" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f7f8f8"/><stop offset=".35" stop-color="${shade(m, .3)}"/><stop offset=".7" stop-color="${shade(m, -.25)}"/><stop offset="1" stop-color="${shade(m, -.55)}"/></linearGradient>`
    + `<pattern id="${id}tb" patternUnits="userSpaceOnUse" width=".5" height="2"><path d="M.1,0V2M.32,0V2" stroke="#fff" stroke-width=".05" opacity=".22"/><path d="M.21,0V2" stroke="#4d5152" stroke-width=".04" opacity=".14"/></pattern>`
    // The domed sapphire's edge: a light silvery-grey band, a little darker at its foot.
    + `<radialGradient id="${id}tx" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="15.38"><stop offset=".888" stop-color="#4f5153"/><stop offset=".915" stop-color="#808284"/><stop offset=".955" stop-color="#a1a3a5"/><stop offset=".985" stop-color="#8d8f91"/><stop offset="1" stop-color="#6e7072"/></radialGradient>`
    + `<radialGradient id="${id}td" cx=".45" cy=".38" r=".75"><stop stop-color="${shade(L.dial, .1)}"/><stop offset="1" stop-color="${shade(L.dial, -.12)}"/></radialGradient>`
    + `<radialGradient id="${id}tl" cx=".4" cy=".35" r=".8"><stop stop-color="${shade(L.lume, .05)}"/><stop offset="1" stop-color="${shade(L.lume, -.08)}"/></radialGradient>`
    // Gilt of the marker frames, hands and print: warm, polished.
    + `<linearGradient id="${id}tg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(gilt, .4)}"/><stop offset=".5" stop-color="${gilt}"/><stop offset="1" stop-color="${shade(gilt, -.3)}"/></linearGradient>`
    + `<radialGradient id="${id}ti" gradientUnits="userSpaceOnUse" cx="-4" cy="-6" r="22"><stop stop-color="${shade(L.bezel, .1)}"/><stop offset=".7" stop-color="${L.bezel}"/><stop offset="1" stop-color="${shade(L.bezel, -.2)}"/></radialGradient></defs>`;
}

/**
 * The crown at 3, unguarded: a barrel 6.3 mm tall from the case at 18.9, six grip ridges each lit along its top and
 * shaded beneath, and a rounded polished end to 21.85, on a short tube. Photo millimetres; drawn beneath the case.
 */
function crown(id: string, L: FullLook, outline: boolean, stroke: string) {
  const m = L.caseColor, x0 = outline ? 19.2 : 18.9;
  let s = '';
  if (!outline) s += `<rect x="18.6" y="-1.9" width="1" height="3.8" fill="${shade(m, -.5)}"/>`;
  s += `<path d="M${x0},-3.15H20.85C21.45,-3.15 21.85,-2.2 21.85,0C21.85,2.2 21.45,3.15 20.85,3.15H${x0}Z" fill="${outline ? 'none' : shade(m, -.4)}" ${stroke}/>`;
  if (!outline) {
    // The ridges, separate and rounded, with dark grooves between; then the polished end over their tips.
    let ridges = '';
    for (let i = 0; i < 6; i++) ridges += `<rect x="19.1" y="${f(-3.05 + i * 1.04)}" width="1.95" height=".8" rx=".38" fill="url(#${id}tr)"/>`;
    s += ridges;
    s += `<path d="M20.85,-3.1C21.4,-3.1 21.8,-2.2 21.8,0C21.8,2.2 21.4,3.1 20.85,3.1C21.1,2.2 21.2,1.2 21.2,0C21.2,-1.2 21.1,-2.2 20.85,-3.1Z" fill="url(#${id}ty)"/>`;
    s += `<path d="M21.45,-2.2C21.6,-1.4 21.62,1.4 21.45,2.2" stroke="#fbfbfa" stroke-width=".14" stroke-linecap="round" fill="none" opacity=".8"/>`;
  }
  return s;
}

/**
 * The bezel's gilt figures: rounded squares, a little over half as wide as tall, with a plain-bar 1. Centrelines in a
 * box 1 tall, for strokeDigits; stroked 0.36 mm wide they stand 2.63 mm tall and 1.55 mm wide, as measured on the 30.
 */
const BEZEL_DIGITS: StrokeGlyphs = {
  '0': ['M.24,0L.29,0Q.53,0 .53,.24L.53,.76Q.53,1 .29,1L.24,1Q0,1 0,.76L0,.24Q0,0 .24,0Z', .53],
  '1': ['M.04,0L.04,1', .08],
  '2': ['M0,.2Q0,0 .24,0L.3,0Q.53,0 .53,.22L.53,.3Q.53,.46 .38,.54L.1,.7Q0,.76 0,.86L0,1L.53,1', .53],
  '3': ['M0,.2Q0,0 .24,0L.3,0Q.53,0 .53,.23L.53,.77Q.53,1 .29,1L.24,1Q0,1 0,.8M.2,.5L.53,.5', .53],
  '4': ['M.42,1L.42,0L0,.7L.53,.7', .53],
  '5': ['M.52,0L.04,0L.02,.45L.3,.45Q.53,.45 .53,.68L.53,.77Q.53,1 .29,1L.24,1Q0,1 0,.8', .53],
};

/**
 * The bezel: a 120-notch edge from 18.95 to 19.5 and the matt black aluminium insert from 15.45 to 18.55. Gilt
 * markings: figures at 10 to 50, bars 0.72 mm wide at the other five minutes (15.55 to 18.1), marks 0.3 mm wide at each
 * minute to 15 on the insert's inner part (15.6 to 16.75), and the red zero triangle, 4.8 mm wide, with its lume pip
 * in a gilt setting 1.84 mm across, 17.35 out. Then the domed sapphire's grey edge and the black flange round the dial.
 */
function bezel(id: string, L: FullLook) {
  const m = L.caseColor, gilt = L.accent;
  let teeth = '';
  for (let i = 0; i < 120; i++) {
    const a = i * 3;
    teeth += `M${pt(18.95, a - 1.5)}L${pt(19.5, a - .65)}A19.5,19.5 0 0 1 ${pt(19.5, a + .65)}L${pt(18.95, a + 1.5)}Z`;
  }
  let s = `<circle r="19.05" fill="${shade(m, -.48)}"/><path d="${teeth}" fill="url(#${id}tp)" stroke="${shade(m, -.5)}" stroke-width=".04"/>`;
  s += `<circle r="18.78" fill="url(#${id}tp)"/><circle r="18.55" fill="url(#${id}ti)"/>`;
  const bar = (a: number, r0: number, r1: number, w: number) => {
    const p0 = P(r0, a), p1 = P(r1, a), [nx, ny] = [Math.cos(a * Math.PI / 180) * w / 2, Math.sin(a * Math.PI / 180) * w / 2];
    return `M${f(p0[0] - nx)},${f(p0[1] - ny)}L${f(p1[0] - nx)},${f(p1[1] - ny)}L${f(p1[0] + nx)},${f(p1[1] + ny)}L${f(p0[0] + nx)},${f(p0[1] + ny)}Z`;
  };
  let marks = '';
  for (let mnt = 1; mnt < 60; mnt++) {
    if (mnt % 10 === 0) continue;
    if (mnt % 5 === 0) marks += bar(mnt * 6, 15.55, 18.1, .72);
    else if (mnt < 15) marks += bar(mnt * 6, 15.6, 16.75, .3);
  }
  let figs = '';
  for (let mnt = 10; mnt < 60; mnt += 10) figs += `<path d="${strokeDigits(String(mnt), 0, -17.03, 2.27, 1, .3, BEZEL_DIGITS)}" transform="rotate(${mnt * 6})"/>`;
  s += `<path d="${marks}" fill="${gilt}"/><g fill="none" stroke="${gilt}" stroke-width=".36" stroke-linejoin="round">${figs}</g>`;
  // Zero: the red triangle with the lume pip in a gilt setting.
  s += `<path d="M-2.4,-18.5H2.4L0,-15.45Z" fill="${L.bezel2 || '#A3283A'}"/>`;
  s += `<circle cy="-17.35" r=".92" fill="url(#${id}tg)" stroke="${shade(gilt, -.45)}" stroke-width=".07"/><circle cy="-17.35" r=".64" fill="url(#${id}tl)" stroke="${shade(gilt, -.2)}" stroke-width=".04"${lu('bezel')}/>`;
  // The insert's inner edge, the domed sapphire's grey edge and the black flange round the dial.
  s += `<circle r="15.45" fill="#2a2a2b"/><circle r="15.38" fill="url(#${id}tx)"/><circle r="15.28" fill="none" stroke="#e4e6e7" stroke-width=".08" opacity=".6"/>`;
  // Reflections in the dome: a soft highlight across the upper left and a fainter one at the lower right.
  s += `<path d="M${pt(14.55, 288)}A14.55,14.55 0 0 1 ${pt(14.55, 346)}" stroke="#fff" stroke-width=".75" stroke-linecap="round" opacity=".2" fill="none"/><path d="M${pt(14.55, 112)}A14.55,14.55 0 0 1 ${pt(14.55, 150)}" stroke="#fff" stroke-width=".55" stroke-linecap="round" opacity=".1" fill="none"/>`;
  s += `<circle r="13.65" fill="#141415"/>`;
  return s;
}

/** The matt black domed dial to 13.05 with its gilt minute track: a ring at 12.97 and a mark at every minute, wider at the hours. */
function dial(id: string, L: FullLook) {
  const gilt = L.accent;
  let s = `<circle r="13.05" fill="url(#${id}td)"/><circle r="12.97" fill="none" stroke="${gilt}" stroke-width=".08"/>`;
  let minor = '', major = '';
  for (let i = 0; i < 60; i++) {
    if (i === 30) continue;   // SWISS MADE below the 6
    if (i % 5) minor += `M${pt(11.95, i * 6)}L${pt(12.97, i * 6)}`;
    else major += `M${pt(11.95, i * 6)}L${pt(12.97, i * 6)}`;
  }
  return s + `<path d="${minor}" stroke="${gilt}" stroke-width=".1"/><path d="${major}" stroke="${gilt}" stroke-width=".44"/>`;
}

/**
 * Applied hour markers: gilt frames about 0.24 mm wide filled with lume. A long triangle at 12 (6.3 to 11.05, 2.9 mm
 * wide), batons at 3, 6 and 9 (7.45 to 11.4, 1.26 mm wide) and dots 2.24 mm across centred 10.15 out.
 */
function markers(id: string) {
  const F = .24;
  const baton = (a: number, r0: number, r1: number, w: number) => {
    const p0 = P(r0, a), p1 = P(r1, a), [nx, ny] = [Math.cos(a * Math.PI / 180) * w / 2, Math.sin(a * Math.PI / 180) * w / 2];
    return `M${f(p0[0] - nx)},${f(p0[1] - ny)}L${f(p1[0] - nx)},${f(p1[1] - ny)}L${f(p1[0] + nx)},${f(p1[1] + ny)}L${f(p0[0] + nx)},${f(p0[1] + ny)}Z`;
  };
  const dot = (x: number, y: number, r: number) => `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;
  const k = F / Math.sin(Math.atan2(1.45, 4.75));
  let frame = 'M-1.45,-11.05H1.45L0,-6.3Z', lume = `M${f(-1.45 + F * 3.4)},${f(-11.05 + F)}H${f(1.45 - F * 3.4)}L0,${f(-6.3 - k)}Z`;
  for (const h of [3, 6, 9]) { frame += baton(h * 30, 7.45, 11.4, 1.26); lume += baton(h * 30, 7.45 + F, 11.4 - F, 1.26 - 2 * F); }
  for (let h = 1; h < 12; h++) {
    if (h % 3 === 0) continue;
    const [x, y] = P(10.15, h * 30);
    frame += dot(x, y, 1.12);
    lume += dot(x, y, 1.12 - F);
  }
  return `<path d="${frame}" fill="#000" opacity=".45" transform="translate(.07 .11)"/><path d="${frame}" fill="url(#${id}tg)"/>`
    + `<path d="${lume}" fill="url(#${id}tl)"${lu('indices')}/>`;
}

/** The shield, TUDOR and GENEVE above the centre; the depth rating, MASTER CHRONOMETER and SWISS MADE below. */
function printing(L: FullLook) {
  const ink = L.accent;
  // The shield: a crenellated top over a pointed shield, with the rose's cross-bar inside.
  let s = `<path d="M-.5,-5.62V-5.38H.5V-5.62M-.5,-5.38V-4.95Q-.5,-4.65 0,-4.48Q.5,-4.65 .5,-4.95V-5.38" fill="none" stroke="${ink}" stroke-width=".09" stroke-linejoin="round"/>`;
  s += `<path d="M-.5,-5.62H-.28V-5.76H-.1V-5.62H.1V-5.76H.28V-5.62H.5" fill="none" stroke="${ink}" stroke-width=".08"/><path d="M-.28,-5.12H.28M0,-5.3V-4.75" stroke="${ink}" stroke-width=".08"/>`;
  const serif = `font-family="'Times New Roman',Times,Georgia,serif" text-anchor="middle" fill="${ink}"`;
  const sans = `font-family="'Helvetica Neue',Arial,Helvetica,sans-serif" text-anchor="middle" fill="${ink}"`;
  s += `<text y="-3.09" ${serif} font-size="1.25" font-weight="700" textLength="5.41" lengthAdjust="spacingAndGlyphs">TUDOR</text>`;
  s += `<text y="-2.18" ${sans} font-size=".84" textLength="3.7" lengthAdjust="spacingAndGlyphs">GENEVE</text>`;
  // Spaced with letter-spacing rather than textLength, which resvg (the share images) misapplies across the tspans.
  s += `<text y="5.22" ${sans} font-size=".9" letter-spacing=".03">200<tspan font-style="italic">m</tspan>:660<tspan font-style="italic">ft</tspan></text>`;
  s += `<text y="6.16" ${sans} font-size=".72" textLength="10" lengthAdjust="spacingAndGlyphs">MASTER CHRONOMETER</text>`;
  return s + `<text y="13.5" ${sans} font-size=".38" textLength="2.9" lengthAdjust="spacing">SWISS MADE</text>`;
}

/**
 * Hands, posed as in the photo (hour 304.2°, minute 64°, seconds 228.3°), all gilt-framed with lume. Measured as
 * width profiles along each hand's axis.
 */
function hands(id: string) {
  const ha = 304.2, ma = 64, sa = 228.3, gilt = `url(#${id}tg)`, edge = '#8a6a50', lume = `url(#${id}tl)`;
  // Snowflake: a 1.5 mm shaft, a square on its corner 4.5 mm across centred 6.0 out, and a stub to a flat end at 8.7.
  const hour = `M-.75,.6L-.75,-4.4L-2.25,-6L-.75,-7.6L-.75,-8.7L.75,-8.7L.75,-7.6L2.25,-6L.75,-4.4L.75,.6Z`;
  const hourLume = `M-.35,-2L-.35,-4.55L-1.66,-6L-.35,-7.45L-.35,-8.3L.35,-8.3L.35,-7.45L1.66,-6L.35,-4.55L.35,-2Z`;
  // Minute: a straight lance 1.2 mm wide, pointed at 12.85, with a lume strip from 2.6 to 12.
  const minute = `M-.45,1.4L-.6,-2.6L-.6,-11.9L0,-12.85L.6,-11.9L.6,-2.6L.45,1.4Z`;
  const minuteLume = `M-.29,-2.6L-.29,-11.85L0,-12.35L.29,-11.85L.29,-2.6Z`;
  // Seconds: a needle to 13.1 with a lume dot 7.4 out in a gilt ring, and a tail to a disc at 4.8.
  const second = `M-.09,4.4L-.08,-6.66A.8,.8 0 0 1 .08,-6.66L.09,4.4Z M-.08,-8.14L-.05,-13.1H.05L.08,-8.14Z M-.52,4.8a.52,.52 0 1 0 1.04,0a.52,.52 0 1 0 -1.04,0Z`;
  let s = `<g fill="#000" opacity=".34" transform="translate(.16 .24)"><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/><g ${handRole('second')}transform="rotate(${sa})"><path d="${second}"/><circle cy="-7.4" r=".8"/></g></g>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hour}" fill="${gilt}" stroke="${edge}" stroke-width=".05"/><path d="${hourLume}" fill="${lume}"${lu('hands')}/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minute}" fill="${gilt}" stroke="${edge}" stroke-width=".05"/><path d="${minuteLume}" fill="${lume}"${lu('hands')}/></g>`;
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="${second}" fill="${gilt}" stroke="${edge}" stroke-width=".03"/><circle cy="-7.4" r=".8" fill="${gilt}" stroke="${edge}" stroke-width=".04"/><circle cy="-7.4" r=".56" fill="${lume}"${lu('seconds')}/></g>`;
  return s + `<circle r="1.2" fill="${gilt}" stroke="${edge}" stroke-width=".05"/><circle r=".68" fill="none" stroke="#f4dcc4" stroke-width=".08" opacity=".7"/><circle r=".12" fill="#8a6a50"/>`;
}

export interface M7939a1a0nu0001Options { D: number; LL: number; lw: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the bracelet for the Tudor Black Bay 58 M7939A1A0NU-0001. */
export function m7939a1a0nu0001SVG(o: M7939a1a0nu0001Options) {
  const { D, LL, lw, id, L, outline } = o;
  const d = m7939a1a0nu0001Case(D, LL, lw), u = D / PHOTO_D, m = L.caseColor;
  let s = outline ? '' : defs(id, L);
  s += `<g transform="scale(${f(u)})">${crown(id, L, outline, outline ? o.stroke.replace(/stroke-width="([\d.]+)"/, (_, w: string) => `stroke-width="${f(+w / u)}"`) : `stroke="${shade(m, -.45)}" stroke-width=".08"`)}</g>`;
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}tc)`}" ${outline ? o.stroke : `stroke="${shade(m, -.45)}" stroke-width=".12"`}/>`;
  if (outline) return s + `<circle r="${f(19.5 * u)}" fill="none" ${o.stroke}/><circle r="${f(15.55 * u)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  // Brushed lug tops lit from above, the wide polished bevel down each lug's outside, and the bezel's shadow.
  s += `<defs><clipPath id="${id}tcc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}tcc)">${lugFaces(D, LL, lw, id)}<path d="${d}" fill="url(#${id}tb)"/>`
    + bevels(D, LL, id, m)
    + `<circle r="${f(19.6 * u)}" fill="none" stroke="#000" stroke-width="1.1" opacity=".16" transform="translate(.12 .2)"/></g>`;
  s += `<g transform="scale(${f(u)})">`;
  s += bezel(id, L);
  s += dial(id, L);
  s += markers(id);
  s += printing(L);
  s += hands(id);
  // The domed sapphire: a soft reflection across the upper left.
  s += `<path d="M-11.8,-3.9A12.4,12.4 0 0 1 -3.9,-11.8A14.4,14.4 0 0 0 -11.8,-3.9Z" fill="#fff" opacity=".06"/>`;
  return s + '</g>';
}
