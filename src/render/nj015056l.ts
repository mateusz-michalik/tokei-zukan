import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { bezelShadow, flankBevel, lugTopLight } from './cases';
import { P } from './geom';
import { handRole } from './hands';
import { lu } from './night';

// Citizen Tsuyosa NJ0150-56L: the 40 mm Tsuyosa with the blue sunray dial, on its integrated steel bracelet.
// A case that runs in long straight flanks from the bracelet to round 3 and 9, brushed across its top with a polished
// bevel down each flank; short horns either side of a fixed polished centre link, 9.1 mm wide, that stands about 2 mm
// past them; a small fluted crown at 4 o'clock; a wide polished sloping bezel; a blue sunray dial with a sloping
// flange, white minute dashes and a lume square at each hour, applied steel batons with white lume (doubled at 12 and
// 6, short at 3), CITIZEN and AUTOMATIC; the white date at 3 under a magnifier; faceted baton hands with lume strips
// and a needle seconds hand.
//
// Everything was measured on Citizen's front-on product photo at one uniform 28.27 px/mm, the scale at which the case
// is 40 mm across at 3 and 9. The dial, bezel and hands are drawn in photo millimetres about the hand pivot and scaled
// by u = D / 40. The photo's case is 43.9 mm from horn tip to horn tip, against the reviewed 45 mm, because the horns
// turn down away from the camera; the case is drawn at the catalogue's dimensions, following the photo's plan, with
// sx = D / 40 and sy = LL / 45. See docs/models/citizen-nj0150-56l.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');

type XY = [number, number];
const xy = ([x, y]: XY) => `${f(x)},${f(y)}`;

const SPEC_D = 40, SPEC_LL = 45;
/** How far the fixed centre link stands past the horn tips, and its half-width (Citizen's 9.1 mm). */
const LINK_OUT = 2.15, LINK_HALF = 4.55;
/** Where the horns meet the case body, a crease across the case just outside the bezel. */
const HORN_BASE = 19.5;

const scales = (D: number, LL: number) => {
  const sx = D / SPEC_D, sy = LL / SPEC_LL;
  return { sx, sy, X: (x: number) => x * sx, Y: (y: number) => y * sy };
};

/**
 * One quarter of the outline at the top right, in spec millimetres: the flat horn tip, a small rounded corner, the long
 * straight flank, and a curve that turns it into the side at 3. `t` maps it to the other quarters.
 */
function quarter(D: number, LL: number, t: (p: XY) => XY) {
  const { X, Y } = scales(D, LL), H = LL / 2;
  const p = (x: number, y: number) => xy(t([x, y]));
  return {
    tip: `L${p(X(11.25), -H)}Q${p(X(11.62), -H)} ${p(X(11.72), Y(-22.15))}`,
    flank: `L${p(X(17.35), Y(-10.4))}C${p(X(18.99), Y(-7))} ${p(X(20), Y(-3.8))} ${p(X(20), 0)}`,
  };
}

/** The whole case outline, closed: the horns' tips are flat across, and the bracelet butts against them. */
export function nj015056lCase(D: number, LL: number) {
  const { X, Y } = scales(D, LL), H = LL / 2;
  const tr = quarter(D, LL, p => p);
  // The other quarters walk the same points backwards or mirrored.
  const back = (t: (p: XY) => XY) => {
    const p = (x: number, y: number) => xy(t([x, y]));
    return `C${p(X(20), Y(-3.8))} ${p(X(18.99), Y(-7))} ${p(X(17.35), Y(-10.4))}L${p(X(11.72), Y(-22.15))}Q${p(X(11.62), -H)} ${p(X(11.25), -H)}L${p(0, -H)}`;
  };
  const fy = ([x, y]: XY): XY => [x, -y], fxy = ([x, y]: XY): XY => [-x, -y], fx = ([x, y]: XY): XY => [-x, y];
  const br = back(fy), bl = quarter(D, LL, fxy), tl = back(fx);
  return `M0,${f(-H)}${tr.tip}${tr.flank}${br}${bl.tip}${bl.flank}${tl}Z`;
}

/** The outer flanks only, open, tip corner to tip corner on each side: stroked and clipped, they make the polished bevel. */
function flanks(D: number, LL: number) {
  const { X, Y } = scales(D, LL);
  let d = '';
  for (const s of [1, -1]) {
    const p = (x: number, y: number) => xy([s * x, y]);
    d += `M${p(X(11.72), Y(-22.15))}L${p(X(17.35), Y(-10.4))}C${p(X(18.99), Y(-7))} ${p(X(20), Y(-3.8))} ${p(X(20), 0)}`
      + `C${p(X(20), Y(3.8))} ${p(X(18.99), Y(7))} ${p(X(17.35), Y(10.4))}L${p(X(11.72), Y(22.15))}`;
  }
  return d;
}

/** A colour scaled towards black or brighter in its own hue, as a sunray dial changes: `k` above 1 brightens. */
function mul(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(x => Math.min(255, Math.round(x * k)));
  return '#' + c.map(x => x.toString(16).padStart(2, '0')).join('');
}

function defs(id: string, L: FullLook) {
  const m = L.caseColor;
  return `<defs><linearGradient id="${id}nc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .08)}"/><stop offset=".5" stop-color="${shade(m, -.02)}"/><stop offset="1" stop-color="${shade(m, -.13)}"/></linearGradient>`
    // Fine brushing along the watch's length, as on the photo's shoulders and horns: quiet at normal size.
    + `<pattern id="${id}nb" patternUnits="userSpaceOnUse" width=".36" height="2"><path d="M.06,0V2" stroke="#fff" stroke-width=".045" opacity=".14"/><path d="M.22,0V2" stroke="#4d5152" stroke-width=".035" opacity=".07"/></pattern>`
    // Polished surfaces: brighter than the brushed case, lit from the upper left, with one restrained dark reflection.
    + `<linearGradient id="${id}np" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fdfdfc"/><stop offset=".3" stop-color="${shade(m, .55)}"/><stop offset=".6" stop-color="${shade(m, .02)}"/><stop offset=".82" stop-color="${shade(m, .5)}"/><stop offset="1" stop-color="${shade(m, .28)}"/></linearGradient>`
    // The bezel's slope turning down to the crystal: shaded at its foot, clear at its top.
    + `<radialGradient id="${id}nz" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="18.95"><stop offset=".9" stop-color="${shade(m, -.45)}" stop-opacity=".5"/><stop offset=".95" stop-color="${shade(m, -.3)}" stop-opacity=".12"/><stop offset="1" stop-color="${shade(m, -.3)}" stop-opacity="0"/></radialGradient>`
    // The fixed centre link's polished top, lit from above: a dark rim, bright, a soft reflection, then light again.
    + `<linearGradient id="${id}nk" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, -.2)}"/><stop offset=".06" stop-color="#f6f7f7"/><stop offset=".45" stop-color="${shade(m, .4)}"/><stop offset=".72" stop-color="${shade(m, -.22)}"/><stop offset="1" stop-color="${shade(m, .1)}"/></linearGradient>`
    // The crown's flutes: each ridge lit along its top and shaded beneath, as a pattern across the barrel.
    + `<linearGradient id="${id}nr" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f7f8f8"/><stop offset=".45" stop-color="${shade(m, .2)}"/><stop offset="1" stop-color="${shade(m, -.45)}"/></linearGradient>`
    + `<pattern id="${id}nf" patternUnits="userSpaceOnUse" width="4" height=".44" y=".1"><rect width="4" height=".44" fill="${shade(m, -.5)}"/><rect y=".05" width="4" height=".3" rx=".14" fill="url(#${id}nr)"/></pattern>`
    + `<radialGradient id="${id}nd" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="16.95"><stop offset=".8" stop-color="${L.dial}"/><stop offset="1" stop-color="${shade(L.dial, -.15)}"/></radialGradient>`
    + `<radialGradient id="${id}nl" cx=".4" cy=".35" r=".8"><stop stop-color="${shade(L.lume, .05)}"/><stop offset="1" stop-color="${shade(L.lume, -.08)}"/></radialGradient>`
    // Applied steel: polished facets catching the light.
    + `<linearGradient id="${id}ns2" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fdfdfd"/><stop offset=".5" stop-color="${shade(L.handColor, -.05)}"/><stop offset="1" stop-color="${shade(L.handColor, -.42)}"/></linearGradient>`
    // The magnifier: light at its upper edge, clear below.
    + `<linearGradient id="${id}ny" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#dfe7f0" stop-opacity=".7"/><stop offset=".3" stop-color="#6d86a6" stop-opacity=".3"/><stop offset=".7" stop-color="#0b1d38" stop-opacity="0"/></linearGradient></defs>`;
}

/** The crown's frame: its root on the lower right flank, 12.6 mm below the centre, with x out along its axis, square to the flank. */
function crownFrame(D: number, LL: number) {
  const { X, Y } = scales(D, LL), y0 = 12.6, x0 = 17.35 - (y0 - 10.4) * (5.63 / 11.75);
  return `translate(${f(X(x0))} ${f(Y(y0))}) rotate(25.6)`;
}
/** The crown's exposed outline in its frame: a rounded fluted barrel 4.9 mm long on the flank, standing 2.3 mm proud. */
const CROWN = 'M0,-2.45H.95Q1.75,-2.45 1.9,-1.75Q2.3,-1 2.3,0Q2.3,1 1.9,1.75Q1.75,2.45 .95,2.45H0Z';

/**
 * The recess the crown sits in, cut into the flank: a dark pocket round its root that runs on below it into the small
 * access notch. Drawn on the case, inside its clip.
 */
function crownRecess(D: number, LL: number, m: string) {
  return `<path d="M.2,-2.75C-.5,-2.75 -.78,-2.3 -.78,-1.6V1.9C-.78,2.6 -1.02,2.95 -.98,3.35C-.92,3.75 -.4,3.85 .2,3.85Z" fill="${shade(m, -.55)}" transform="${crownFrame(D, LL)}"/>`
    + `<path d="M-.78,-1.6V1.9C-.78,2.6 -1.02,2.95 -.98,3.35" fill="none" stroke="${shade(m, .3)}" stroke-width=".1" opacity=".7" transform="${crownFrame(D, LL)}"/>`;
}

/**
 * The crown at 4 o'clock, seated in its recess: a fluted barrel with rounded shoulders running back into the case and a
 * domed polished end, its outermost point 2.3 mm from the flank. Spec millimetres; drawn over the case.
 */
function crown(D: number, LL: number, id: string, L: FullLook, outline: boolean, stroke: string) {
  if (outline) return `<path d="${CROWN}" fill="none" ${stroke} transform="${crownFrame(D, LL)}"/>`;
  const m = L.caseColor;
  return `<g transform="${crownFrame(D, LL)}"><path d="M-.55,-2.45H.95Q1.75,-2.45 1.75,-1.75V1.75Q1.75,2.45 .95,2.45H-.55Z" fill="url(#${id}nf)" stroke="${shade(m, -.5)}" stroke-width=".06"/>`
    + `<path d="M1.55,-2.1Q1.95,-2.1 2.12,-1.4Q2.3,-.7 2.3,0Q2.3,.7 2.12,1.4Q1.95,2.1 1.55,2.1Q1.8,0 1.55,-2.1Z" fill="url(#${id}np)" stroke="${shade(m, -.45)}" stroke-width=".05"/></g>`;
}

/**
 * The fixed centre links at 12 and 6: polished blocks 9.1 mm wide set between the horns, from the crease at the horns'
 * base to 2 mm past their tips, with slightly rounded outer corners.
 */
function centreLinks(D: number, LL: number, id: string, m: string, outline: boolean, stroke: string) {
  const { X, Y } = scales(D, LL), H = LL / 2, x = X(LINK_HALF), y0 = Y(HORN_BASE), y1 = H + LINK_OUT;
  let s = '';
  for (const v of [-1, 1]) {
    const d = `M${f(-x)},${f(v * y0)}V${f(v * (y1 - .4))}Q${f(-x)},${f(v * y1)} ${f(-x + .4)},${f(v * y1)}H${f(x - .4)}Q${f(x)},${f(v * y1)} ${f(x)},${f(v * (y1 - .4))}V${f(v * y0)}Z`;
    if (outline) { s += `<path d="${d}" fill="none" ${stroke}/>`; continue; }
    s += `<path d="${d}" fill="url(#${id}nk)" stroke="${shade(m, -.5)}" stroke-width=".14"/>`;
    // A fine light edge along its outer end.
    s += `<path d="M${f(-x + .45)},${f(v * (y1 - .12))}H${f(x - .45)}" stroke="#fff" stroke-width=".12" opacity=".7"/>`;
  }
  return s;
}

/**
 * The case's finish, inside its clip: fine brushing along the watch, the horns' tops lit softly from above, the crease
 * where the horns meet the body, the polished bevel down each flank, the crown's recess and the bezel's shadow.
 */
function caseFinish(D: number, LL: number, id: string, L: FullLook, d: string, u: number) {
  const { Y } = scales(D, LL), m = L.caseColor, yb = Y(HORN_BASE);
  let s = `<defs><clipPath id="${id}ncc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}ncc)">`;
  s += `<path d="${d}" fill="url(#${id}nb)"/>` + lugTopLight(id, D, LL, .45);
  for (const v of [-1, 1]) s += `<path d="M-21,${f(v * yb)}H21" stroke="${shade(m, -.4)}" stroke-width=".07" opacity=".55"/><path d="M-21,${f(v * (yb + .08 * v))}H21" stroke="#fff" stroke-width=".07" opacity=".45"/>`;
  s += flankBevel(id, flanks(D, LL), m) + crownRecess(D, LL, m);
  return s + bezelShadow(19.3 * u) + '</g>';
}

/**
 * The bezel, smooth and polished: a narrow darker step from 18.95 to 19.2, then the wide sloping polished face down to the
 * crystal's thin dark edge at 17.1, shaded towards its foot, with a soft highlight at the upper left and a fainter one at
 * the lower right.
 */
function bezel(id: string, L: FullLook) {
  const m = L.caseColor;
  let s = `<circle r="19.2" fill="${shade(m, -.32)}"/><circle r="18.95" fill="url(#${id}np)"/><circle r="18.95" fill="url(#${id}nz)"/>`;
  s += `<path d="M${pt(18.3, 285)}A18.3,18.3 0 0 1 ${pt(18.3, 345)}" stroke="#fff" stroke-width=".4" stroke-linecap="round" opacity=".55" fill="none"/>`;
  s += `<path d="M${pt(18.3, 110)}A18.3,18.3 0 0 1 ${pt(18.3, 150)}" stroke="#fff" stroke-width=".3" stroke-linecap="round" opacity=".3" fill="none"/>`;
  return s + `<circle r="17.1" fill="${shade(m, -.62)}"/>`;
}

/**
 * The blue sunray dial to 16.95, as sampled round the photo: brightest in broad sectors towards 128° and 308°, darkest
 * towards 38° and 218°, following cos 2θ. Each sector is built from nested wedges, so the change is gradual, in the dial's
 * own hue (brighter, then darker). Then a lighter sloping flange from 16.0, white minute dashes (14.85 to 15.6) and a
 * lume square 0.72 mm across at each hour, 15.22 out.
 */
function dial(id: string, L: FullLook) {
  let s = `<circle r="16.95" fill="url(#${id}nd)"/>`;
  // Eight nested levels each way, each a pair of opposite wedges at its own low opacity, so they build up smoothly:
  // about 70% of the brighter tone at the sectors' middles and 62% of the darker.
  const K = 8, light = mul(L.dial, 1.5), dark = mul(L.dial, .3);
  for (let k = 1; k <= K; k++) {
    // Half-width of the sector where |cos 2θ| reaches this level.
    const w = Math.acos(((k - .5) / K) ** (1 / 1.3)) * 90 / Math.PI;
    const pair = (c: number) => `M0,0L${pt(16.95, c - w)}A16.95,16.95 0 0 1 ${pt(16.95, c + w)}ZM0,0L${pt(16.95, c + 180 - w)}A16.95,16.95 0 0 1 ${pt(16.95, c + 180 + w)}Z`;
    s += `<path d="${pair(128)}" fill="${light}" fill-opacity=".14"/><path d="${pair(38)}" fill="${dark}" fill-opacity=".114"/>`;
  }
  s += `<circle r="16.47" fill="none" stroke="${mul(L.dial, 1.35)}" stroke-width=".95" opacity=".6"/>`;
  let dashes = '', squares = '';
  for (let i = 0; i < 60; i++) {
    if (i % 5) dashes += `M${pt(14.85, i * 6)}L${pt(15.6, i * 6)}`;
    else squares += `<rect x="-.36" y="-15.58" width=".72" height=".72" transform="rotate(${i * 6})"/>`;
  }
  s += `<path d="${dashes}" stroke="#e9eef4" stroke-width=".13"/>`;
  return s + `<g fill="url(#${id}nl)" stroke="#d3d8dc" stroke-width=".05"${lu('indices')}>${squares}</g>`;
}

/**
 * Applied steel batons 1.02 mm wide from 10.15 to 14.25, each with a white lume strip 0.44 mm wide: pairs at 12 and 6
 * (0.26 mm apart), a short one at 3 beyond the date (from 13.2) and single ones elsewhere.
 */
function markers(id: string, L: FullLook) {
  let frame = '', lume = '';
  const bar = (a: number, x: number, r0: number, r1: number) => {
    frame += `<rect x="${f(x - .51)}" y="${-r1}" width="1.02" height="${f(r1 - r0)}" rx=".08" transform="rotate(${a})"/>`;
    lume += `<rect x="${f(x - .22)}" y="${f(-r1 + .3)}" width=".44" height="${f(r1 - r0 - .6)}" transform="rotate(${a})"/>`;
  };
  for (let h = 0; h < 12; h++) {
    const a = h * 30;
    if (h === 0 || h === 6) { bar(a, -.64, 10.15, 14.25); bar(a, .64, 10.15, 14.25); }
    else if (h === 3 && L.date) bar(a, 0, 13.2, 14.25);
    else bar(a, 0, 10.15, 14.25);
  }
  return `<g fill="#000" opacity=".4" transform="translate(.08 .12)">${frame}</g><g fill="url(#${id}ns2)" stroke="${shade(L.handColor, -.5)}" stroke-width=".05">${frame}</g>`
    + `<g fill="url(#${id}nl)"${lu('indices')}>${lume}</g>`;
}

/** The white date at 3 under its magnifier, as the photo shows it: the window enlarged to 3.43 × 2.87 mm. */
function date(id: string, L: FullLook) {
  if (!L.date) return '';
  const lx = 10.37, ly = -.35, lw = 5.95, lh = 4.5, dx = 10.17, dy = .51, dw = 3.43, dh = 2.87;
  let s = `<rect x="${f(lx - lw / 2)}" y="${f(ly - lh / 2)}" width="${lw}" height="${lh}" rx="1.45" fill="${shade(L.dial, -.25)}"/>`;
  s += `<rect x="${f(dx - dw / 2 - .1)}" y="${f(dy - dh / 2 - .1)}" width="${f(dw + .2)}" height="${f(dh + .2)}" rx=".1" fill="#9aa2aa"/><rect x="${f(dx - dw / 2)}" y="${f(dy - dh / 2)}" width="${dw}" height="${dh}" rx=".06" fill="#f4f5f3"/>`;
  s += `<text x="${dx}" y="${f(dy + .92)}" font-family="'Times New Roman',Times,Georgia,serif" font-size="2.6" text-anchor="middle" fill="#15181b">7</text>`;
  return s + `<rect x="${f(lx - lw / 2)}" y="${f(ly - lh / 2)}" width="${lw}" height="${lh}" rx="1.45" fill="url(#${id}ny)" stroke="#d3dce6" stroke-width=".07"/>`;
}

/** CITIZEN in bold serif capitals above the centre, AUTOMATIC in small sans capitals below. */
function printing() {
  const ink = '#f3f5f7';
  return `<text y="-6.62" font-family="'Times New Roman',Times,Georgia,serif" font-weight="700" font-size="2.25" text-anchor="middle" fill="${ink}" textLength="8.25" lengthAdjust="spacingAndGlyphs">CITIZEN</text>`
    + `<text y="8.35" font-family="'Helvetica Neue',Arial,Helvetica,sans-serif" font-size="1.08" text-anchor="middle" fill="${ink}" textLength="8.1" lengthAdjust="spacingAndGlyphs">AUTOMATIC</text>`;
}

/**
 * Faceted steel baton hands, posed as in the photo (hour 304°, minute 57.8°, seconds 208°): one half of each blade lit,
 * the other shaded, with a white lume strip towards the tip. Hour 1.05 mm wide to 9.9 with a tail to 2.2; minute 1.0 mm
 * to 14.0 with a tail to 2.5; a 0.18 mm seconds needle to 15.8 with a tail to 3.4.
 */
function hands(id: string, L: FullLook) {
  const ha = 304, ma = 57.8, sa = 208, hc = L.handColor, edge = shade(hc, -.55), lume = `url(#${id}nl)`;
  const blade = (w: number, tip: number, tail: number) => {
    const h = w / 2;
    return { all: `M-.3,${tail}L${-h},.6L${-h},${-tip + .3}L${-h + .22},${-tip}H${h - .22}L${h},${-tip + .3}L${h},.6L.3,${tail}Z`, half: `M0,${tail}L.3,${tail}L${h},.6L${h},${-tip + .3}L${h - .22},${-tip}H0Z` };
  };
  const hour = blade(1.05, 9.9, 2.2), minute = blade(1, 14, 2.5);
  const second = 'M-.13,3.4L-.09,0L-.06,-15.8H.06L.09,0L.13,3.4Z';
  let s = `<g fill="#000" opacity=".3" transform="translate(.14 .2)"><path d="${hour.all}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute.all}" ${handRole('minute')}transform="rotate(${ma})"/><path d="${second}" ${handRole('second')}transform="rotate(${sa})"/></g>`;
  for (const [role, b, a, l0, l1] of [['hour', hour, ha, 5, 9.35], ['minute', minute, ma, 7, 13.4]] as const) {
    s += `<g ${handRole(role)}transform="rotate(${a})"><path d="${b.all}" fill="${shade(hc, .3)}" stroke="${edge}" stroke-width=".05"/><path d="${b.half}" fill="${shade(hc, -.3)}"/>`
      + `<rect x="-.22" y="${-l1}" width=".44" height="${f(l1 - l0)}" fill="${lume}"${lu('hands')}/></g>`;
  }
  s += `<path d="${second}" fill="${shade(hc, .1)}" stroke="${edge}" stroke-width=".03" ${handRole('second')}transform="rotate(${sa})"/>`;
  return s + `<circle r=".85" fill="url(#${id}np)" stroke="${edge}" stroke-width=".05"/><circle r=".45" fill="none" stroke="${shade(hc, -.35)}" stroke-width=".08"/><circle r=".15" fill="${shade(hc, -.5)}"/>`;
}

export interface Nj015056lOptions { D: number; LL: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the bracelet for the Citizen Tsuyosa NJ0150-56L. */
export function nj015056lSVG(o: Nj015056lOptions) {
  const { D, LL, id, L, outline } = o;
  const d = nj015056lCase(D, LL), u = D / SPEC_D, m = L.caseColor;
  let s = outline ? '' : defs(id, L);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}nc)`}" ${outline ? o.stroke : `stroke="${shade(m, -.45)}" stroke-width=".12"`}/>`;
  if (outline) return s + crown(D, LL, id, L, true, o.stroke) + centreLinks(D, LL, id, m, true, o.stroke) + `<circle r="${f(19.2 * u)}" fill="none" ${o.stroke}/><circle r="${f(16.95 * u)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  s += caseFinish(D, LL, id, L, d, u);
  // The crown sits in its recess, over the case.
  s += crown(D, LL, id, L, false, '');
  s += centreLinks(D, LL, id, m, false, '');
  s += `<g transform="scale(${f(u)})">`;
  s += bezel(id, L) + dial(id, L) + markers(id, L) + date(id, L) + printing() + hands(id, L);
  // The crystal: a soft reflection across the upper left.
  s += `<path d="M-14.6,-4.8A15.4,15.4 0 0 1 -4.8,-14.6A17.6,17.6 0 0 0 -14.6,-4.8Z" fill="#fff" opacity=".06"/>`;
  return s + '</g>';
}
