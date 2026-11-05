import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { bezelShadow, flankBevel } from './cases';
import { P } from './geom';
import { handRole } from './hands';
import { lu } from './night';

// Tissot PRX Powermatic 80 40 mm T137.407.11.041.00: the blue waffle dial on the integrated steel bracelet.
// A tonneau case whose straight flanks run from the bracelet out to round sides at 3 and 9, brushed along its length
// with a polished bevel down each flank; a flat top plane that turns down into short sloping horns either side of a
// 12 mm opening, where the bracelet's first link enters; a fluted crown with a chamfered end at 3; a slim, smooth,
// polished bezel; a reflective blue-grey flange; the embossed blue waffle dial (a raised lattice round recessed squares,
// 1.2 mm apart); white minute dashes; applied steel batons with white inlays (doubled at 12, short at 3 beside the
// date); a bevelled applied date frame at 3; TISSOT 1853, PRX POWERMATIC 80 and SWISS MADE; and faceted baton hands
// with lume inlays, a needle seconds hand and a short counterweight bar.
//
// Everything was measured on Tissot's front-on product photo at one uniform 19.675 px/mm, the scale at which the case
// is 40 mm across at 3 and 9. The dial, bezel and hands are drawn in photo millimetres about the hand pivot and scaled
// by u = D / 40. The case's plan is the photo's, with x scaled by D / 40; only the sloping horns are lengthened, from
// the photo's 21.65 mm to the catalogue's half lug to lug (22 mm, from 44), because they turn down away from the camera.
// See docs/models/tissot-t137-407-11-041-00.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');

type XY = [number, number];
const xy = ([x, y]: XY) => `${f(x)},${f(y)}`;

const SPEC_D = 40;
/** The crease where the flat top plane turns down into the horns, measured from the centre. */
const CREASE = 19.31;
/** The photo's horn tips, and the flank where it leaves the round side at 3 and 9. */
const TIP_X = 13.65, TIP_Y = 21.65, SIDE_X = 19.24, SIDE_Y = 5.08;

/** x scaled with the case width; y kept to the photo's plan up to the crease, with the sloping horns stretched to H. */
const geom = (D: number, LL: number) => {
  const sx = D / SPEC_D, H = LL / 2, yc = CREASE * sx;
  return {
    sx, H, yc,
    X: (x: number) => x * sx,
    Y: (y: number) => (y <= CREASE ? y * sx : yc + (y - CREASE) * (H - yc) / (TIP_Y - CREASE)),
  };
};

/**
 * The whole case outline, closed, with its opening for the bracelet at 12 and 6, lw wide, down to the crease. Each
 * quarter runs from the middle of the opening's floor up its side, along the flat horn tip to a small rounded corner,
 * down the straight flank, and curves into the side at 3 or 9.
 */
export function t1374071104100Case(D: number, LL: number, lw: number) {
  const { X, Y, H, yc } = geom(D, LL), n = lw / 2;
  // The flank's direction, for the corner's tangent and the curve's first control point.
  const k = (SIDE_X - TIP_X) / (TIP_Y - SIDE_Y);
  // The top right quarter, in the order drawn.
  const tr: XY[][] = [
    [[n - .3, -yc]], [[n, -yc], [n, -yc - .3]], [[n, -H + .2]], [[n, -H], [n + .2, -H]],
    [[X(TIP_X) - .35, -H]], [[X(TIP_X), -H], [X(TIP_X + .35 * k), -Y(TIP_Y - .35)]],
    [[X(SIDE_X), -Y(SIDE_Y)]],
    [[X(SIDE_X + 1.8 * k), -Y(SIDE_Y - 1.8)], [X(20), -Y(1.7)], [X(20), 0]],
  ];
  const cmd = (seg: XY[]) => (seg.length === 1 ? 'L' : seg.length === 2 ? 'Q' : 'C');
  const walk = (segs: XY[][], t: (p: XY) => XY) => segs.map(s => cmd(s) + s.map(q => xy(t(q))).join(' ')).join('');
  /** The same quarter traversed backwards: each segment ends where the previous one started. */
  const back = (segs: XY[][], start: XY, t: (p: XY) => XY) => {
    const pts: XY[] = [start, ...segs.map(s => s[s.length - 1])];
    let d = '';
    for (let i = segs.length - 1; i >= 0; i--) {
      const s = segs[i], ctrl = s.slice(0, -1).reverse();
      d += cmd(s) + [...ctrl, pts[i]].map(q => xy(t(q))).join(' ');
    }
    return d;
  };
  const start: XY = [0, -yc];
  const id = (p: XY): XY => p, fy = ([x, y]: XY): XY => [x, -y], fxy = ([x, y]: XY): XY => [-x, -y], fx = ([x, y]: XY): XY => [-x, y];
  return `M${xy(start)}${walk(tr, id)}${back(tr, start, fy)}${walk(tr, fxy)}${back(tr, start, fx)}Z`;
}

/** The outer flanks only, open, tip corner to tip corner on each side: stroked and clipped, they make the polished bevel. */
function flanks(D: number, LL: number) {
  const { X, Y, H } = geom(D, LL), k = (SIDE_X - TIP_X) / (TIP_Y - SIDE_Y);
  let d = '';
  for (const s of [1, -1]) {
    const p = (x: number, y: number) => xy([s * x, y]);
    d += `M${p(X(TIP_X), -H)}L${p(X(SIDE_X), -Y(SIDE_Y))}C${p(X(SIDE_X + 1.8 * k), -Y(SIDE_Y - 1.8))} ${p(X(20), -Y(1.7))} ${p(X(20), 0)}`
      + `C${p(X(20), Y(1.7))} ${p(X(SIDE_X + 1.8 * k), Y(SIDE_Y - 1.8))} ${p(X(SIDE_X), Y(SIDE_Y))}L${p(X(TIP_X), H)}`;
  }
  return d;
}

/** A colour scaled towards black or brighter in its own hue: `k` above 1 brightens. */
function mul(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(x => Math.min(255, Math.round(x * k)));
  return '#' + c.map(x => x.toString(16).padStart(2, '0')).join('');
}

/** A blend of two colours, `t` of the way from `a` to `b`. */
function mix(a: string, b: string, t: number) {
  const c = (h: string) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const [p, q] = [c(a), c(b)];
  return '#' + p.map((v, i) => Math.round(v + (q[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/** The waffle's pitch, and each recessed square's side, in photo millimetres. The lattice passes through the centre. */
const CELL = 1.2, SQUARE = .7;

function defs(id: string, L: FullLook) {
  const m = L.caseColor, q = (CELL - SQUARE) / 2;
  return `<defs><linearGradient id="${id}tc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .05)}"/><stop offset=".5" stop-color="${shade(m, -.06)}"/><stop offset="1" stop-color="${shade(m, -.17)}"/></linearGradient>`
    // Fine vertical brushing along the watch, as on the photo's case and horns: quiet at normal size.
    + `<pattern id="${id}tb" patternUnits="userSpaceOnUse" width=".34" height="2"><path d="M.06,0V2" stroke="#fff" stroke-width=".045" opacity=".17"/><path d="M.21,0V2" stroke="#4d5152" stroke-width=".035" opacity=".11"/></pattern>`
    // The horns' slopes: the upper ones face the light, the lower ones turn away.
    + `<linearGradient id="${id}tu" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>`
    + `<linearGradient id="${id}td" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#000" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>`
    // Polished surfaces: brighter than the brushed case, lit from the upper left, with one restrained dark reflection.
    + `<linearGradient id="${id}tp" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fdfdfc"/><stop offset=".3" stop-color="${shade(m, .55)}"/><stop offset=".62" stop-color="${shade(m, .05)}"/><stop offset=".85" stop-color="${shade(m, .45)}"/><stop offset="1" stop-color="${shade(m, .22)}"/></linearGradient>`
    // The flange: a reflective blue-grey slope, darker at its foot by the dial.
    + `<radialGradient id="${id}tg" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="16.5"><stop offset=".94" stop-color="${mix(L.dial, '#7d8a98', .55)}"/><stop offset="1" stop-color="#8f9aa6"/></radialGradient>`
    // The waffle: the raised lattice in the dial colour round recessed squares. Light from the upper left catches
    // each recess's lower and right walls and leaves its upper and left walls in shade.
    + `<pattern id="${id}tw" patternUnits="userSpaceOnUse" width="${CELL}" height="${CELL}"><rect width="${CELL}" height="${CELL}" fill="${L.dial}"/>`
    + `<rect x="${q}" y="${q}" width="${SQUARE}" height="${SQUARE}" rx=".05" fill="${mul(L.dial, .72)}"/>`
    + `<path d="M${q},${f(q + SQUARE)}V${q}H${f(q + SQUARE)}" fill="none" stroke="${mul(L.dial, .42)}" stroke-width=".09"/>`
    + `<path d="M${f(q + .05)},${f(q + SQUARE)}H${f(q + SQUARE)}V${f(q + .05)}" fill="none" stroke="${mul(L.dial, 2.6)}" stroke-width=".07" opacity=".6"/></pattern>`
    // Darker towards the rim, with a soft blue sheen across the upper dial in the dial's own hue.
    + `<radialGradient id="${id}tv" gradientUnits="userSpaceOnUse" cx="-1.5" cy="-5" r="20"><stop stop-color="${mul(L.dial, 2.3)}" stop-opacity=".3"/><stop offset=".4" stop-color="${mul(L.dial, 1.6)}" stop-opacity=".08"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>`
    + `<radialGradient id="${id}tl" cx=".4" cy=".35" r=".8"><stop stop-color="${shade(L.lume, .05)}"/><stop offset="1" stop-color="${shade(L.lume, -.08)}"/></radialGradient>`
    // Applied steel: polished facets catching the light.
    + `<linearGradient id="${id}ts" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fdfdfd"/><stop offset=".5" stop-color="${shade(L.handColor, -.04)}"/><stop offset="1" stop-color="${shade(L.handColor, -.4)}"/></linearGradient>`
    // The crown's flutes: each ridge lit along its top and shaded beneath.
    + `<linearGradient id="${id}tr" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f7f8f8"/><stop offset=".45" stop-color="${shade(m, .2)}"/><stop offset="1" stop-color="${shade(m, -.45)}"/></linearGradient>`
    + `<pattern id="${id}tf" patternUnits="userSpaceOnUse" width="4" height=".54" y=".1"><rect width="4" height=".54" fill="${shade(m, -.5)}"/><rect y=".06" width="4" height=".38" rx=".17" fill="url(#${id}tr)"/></pattern></defs>`;
}

/**
 * The crown at 3: a fluted barrel 4.85 mm across from the flank to 22, then a polished chamfer, its flutes running on
 * and closing in, to its rounded end 2.8 mm proud of the case, in a dark seat. Photo millimetres, scaled with the case.
 */
const CROWN = 'M19.55,-2.2L19.95,-2.42H21.95L22.62,-1.45Q22.85,0 22.62,1.45L21.95,2.42H19.95L19.55,2.2Z';
function crown(id: string, L: FullLook, sx: number, outline: boolean, stroke: string) {
  const t = `transform="scale(${f(sx)})"`;
  if (outline) return `<path d="${CROWN}" fill="none" ${stroke} ${t}/>`;
  const m = L.caseColor;
  // Flute grooves across the chamfer, converging from the barrel's pitch to the rounded end.
  let grooves = '';
  for (let y = -2.06; y < 2.2; y += .54) grooves += `M21.95,${f(y)}L22.6,${f(y * .58)}`;
  return `<g ${t}><path d="M19.35,-2.05H20.25V2.05H19.35Q19.15,0 19.35,-2.05Z" fill="${shade(m, -.68)}"/><path d="M19.95,-2.42H21.95V2.42H19.95Z" fill="url(#${id}tf)" stroke="${shade(m, -.5)}" stroke-width=".06"/>`
    + `<path d="M21.95,-2.42L22.62,-1.45Q22.85,0 22.62,1.45L21.95,2.42Z" fill="url(#${id}tp)" stroke="${shade(m, -.45)}" stroke-width=".06"/>`
    + `<path d="${grooves}" stroke="${shade(m, -.45)}" stroke-width=".09" opacity=".55"/></g>`;
}

/**
 * The case's finish, inside its clip: lengthwise brushing, the sloping horns lit from above (the lower ones turned
 * away), the crease where the top plane meets them, the polished bevel down each flank and the bezel's shadow.
 */
function caseFinish(D: number, LL: number, id: string, L: FullLook, d: string, u: number) {
  const { H, yc } = geom(D, LL), m = L.caseColor, w = D / 2 + 1;
  let s = `<defs><clipPath id="${id}tcc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}tcc)">`;
  s += `<path d="${d}" fill="url(#${id}tb)"/>`;
  s += `<rect x="${f(-w)}" y="${f(-H)}" width="${f(2 * w)}" height="${f(H - yc)}" fill="url(#${id}tu)"/><rect x="${f(-w)}" y="${f(yc)}" width="${f(2 * w)}" height="${f(H - yc)}" fill="url(#${id}td)"/>`;
  // The shoulder crease: a fine dark line where the horns turn down, with the top plane's lit edge just inside it.
  for (const v of [-1, 1]) s += `<path d="M${f(-w)},${f(v * yc)}H${f(w)}" stroke="${shade(m, -.55)}" stroke-width=".11" opacity=".8"/><path d="M${f(-w)},${f(v * (yc - .1))}H${f(w)}" stroke="#fff" stroke-width=".08" opacity=".7"/>`;
  s += flankBevel(id, flanks(D, LL), m);
  return s + bezelShadow(18.75 * u) + '</g>';
}

/**
 * The bezel, smooth and polished, to 18.65: the crystal's dark edge inside it at 16.85, an inner bright band, a darker
 * reflection round its middle and a lighter outer band, with highlights at the upper left and lower right.
 */
function bezel(id: string, L: FullLook) {
  const m = L.caseColor;
  let s = `<circle r="18.65" fill="${shade(m, -.4)}"/><circle r="18.57" fill="url(#${id}tp)"/>`;
  // Its outer facet, a little darker than the bright face, turning down to the case.
  s += `<circle r="18.36" fill="none" stroke="${shade(m, -.22)}" stroke-width=".42" opacity=".55"/><circle r="18.13" fill="none" stroke="#fff" stroke-width=".05" opacity=".7"/>`;
  s += `<circle r="17.62" fill="none" stroke="${shade(m, -.3)}" stroke-width=".8" opacity=".28"/>`;
  s += `<path d="M${pt(18.15, 280)}A18.15,18.15 0 0 1 ${pt(18.15, 350)}" stroke="#fff" stroke-width=".45" stroke-linecap="round" opacity=".6" fill="none"/>`;
  s += `<path d="M${pt(17.1, 115)}A17.1,17.1 0 0 1 ${pt(17.1, 160)}" stroke="#fff" stroke-width=".3" stroke-linecap="round" opacity=".45" fill="none"/>`;
  return s + `<circle r="16.85" fill="#0d1216"/>`;
}

/**
 * The flange from 15.65 to 16.5, a reflective blue-grey with a bright outer edge and faint reflections of the batons at
 * the hours, as the photo shows; the waffle dial inside it; and the white minute dashes from 14.6 to 15.1, missing
 * beside SWISS MADE.
 */
function dial(id: string) {
  let glints = '';
  for (let h = 0; h < 12; h++) glints += bar(h * 30, -.3, .3, 15.72, 16.4);
  let s = `<circle r="16.55" fill="url(#${id}tg)"/><path d="${glints}" fill="#dfe6ec" opacity=".28"/><circle r="16.47" fill="none" stroke="#e4e9ee" stroke-width=".06" opacity=".8"/>`;
  s += `<circle r="15.65" fill="url(#${id}tw)"/><circle r="15.65" fill="url(#${id}tv)"/>`;
  let dashes = '';
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0 || (i >= 28 && i <= 32)) continue;
    dashes += `M${pt(14.6, i * 6)}L${pt(15.1, i * 6)}`;
  }
  return s + `<path d="${dashes}" stroke="#e9eef3" stroke-width=".2"/>`;
}

/** One rotated rectangle across a radius: `x0` to `x1` across it, `r0` to `r1` out from the centre, at clock angle `a`. */
function bar(a: number, x0: number, x1: number, r0: number, r1: number) {
  const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
  const q = (x: number, y: number) => `${f(x * c - y * s)},${f(x * s + y * c)}`;
  return `M${q(x0, -r1)}L${q(x1, -r1)}L${q(x1, -r0)}L${q(x0, -r0)}Z`;
}

/**
 * Applied polished batons from 11.25 to 15.2: single ones 0.66 mm wide; a pair at 12, each 0.55 mm wide with a 0.12 mm
 * seam between them (1.22 mm across); and a short one at 3 from 12.5, beside the date. Each has a white inlay between
 * polished rails, from 0.12 inside its outer end to 0.8 from its inner end, which is a grey channel.
 */
function markers(id: string, L: FullLook) {
  let frame = '', chan = '', lume = '';
  const baton = (a: number, x: number, w: number, r0: number) => {
    const i = w / 2 - .19;
    frame += bar(a, x - w / 2, x + w / 2, r0, 15.2);
    chan += bar(a, x - i, x + i, r0 + .12, r0 + .8);
    lume += bar(a, x - i, x + i, r0 + .8, 15.08);
  };
  for (let h = 0; h < 12; h++) {
    const a = h * 30;
    if (h === 0) { baton(a, -.335, .55, 11.25); baton(a, .335, .55, 11.25); } else baton(a, 0, .66, h === 3 && L.date ? 12.5 : 11.25);
  }
  const rail = shade(L.handColor, -.55);
  return `<path d="${frame}" fill="#000" opacity=".38" transform="translate(.07 .1)"/><path d="${frame}" fill="url(#${id}ts)" stroke="${rail}" stroke-width=".04"/>`
    + `<path d="${chan}" fill="${shade(L.handColor, -.32)}" stroke="${rail}" stroke-width=".03"/><path d="${lume}" fill="url(#${id}tl)" stroke="${rail}" stroke-width=".03"${lu('indices')}/>`;
}

/** The bevelled applied date frame at 3 round a white window showing 8, as in the photo. */
function date(id: string, L: FullLook) {
  if (!L.date) return '';
  const m = L.handColor;
  let s = `<rect x="8.39" y="-1.61" width="3.73" height="3.05" rx=".32" fill="#000" opacity=".35" transform="translate(.07 .1)"/>`;
  s += `<rect x="8.39" y="-1.61" width="3.73" height="3.05" rx=".32" fill="url(#${id}ts)" stroke="${shade(m, -.5)}" stroke-width=".04"/>`;
  // The bevel slopes inwards to the window: lit along its lower and right faces, shaded along its upper and left.
  s += `<path d="M8.62,-1.38H11.89V1.21H8.62ZM8.92,-1.02V.92H11.61V-1.02Z" fill-rule="evenodd" fill="${shade(m, -.28)}"/>`;
  s += `<path d="M8.62,1.21H11.89V-1.38L11.61,-1.02V.92H8.92Z" fill="${shade(m, .3)}"/>`;
  s += `<rect x="8.92" y="-1.02" width="2.69" height="1.94" fill="#f6f7f5"/>`;
  return s + `<text x="10.26" y=".73" font-family="'Helvetica Neue',Arial,Helvetica,sans-serif" font-size="2.15" text-anchor="middle" fill="#15181b">8</text>`;
}

/**
 * PRX in squared, slanted capitals, as on the dial: strokes 0.3 mm wide, 1.02 mm tall from the baseline, 3.65 mm long
 * before the slant. A P and an R with squared bowls and small rounded corners, the R's leg straight down to the right,
 * and an X of two strokes.
 */
const PRX = 'M.15,0V-.87H.78Q.9,-.87 .9,-.75V-.53Q.9,-.41 .78,-.41H.15'
  + 'M1.4,0V-.87H2.05Q2.17,-.87 2.17,-.75V-.55Q2.17,-.43 2.05,-.43H1.4M1.88,-.43L2.2,0'
  + 'M2.62,-1.02L3.58,0M3.58,-1.02L2.62,0';

/** TISSOT and 1853 above the centre; PRX and POWERMATIC 80 below; SWISS MADE either side of the baton at 6. */
function printing() {
  const ink = '#f3f5f7', sans = `font-family="'Helvetica Neue',Arial,Helvetica,sans-serif"`;
  let s = `<text y="-7.06" ${sans} font-weight="600" font-size="1.85" text-anchor="middle" fill="${ink}" textLength="7.06" lengthAdjust="spacingAndGlyphs" x="-.05">TISSOT</text>`;
  s += `<text y="-5.74" ${sans} font-size="1.2" text-anchor="middle" fill="${ink}" textLength="2.9" lengthAdjust="spacingAndGlyphs" x="-.05">1853</text>`;
  s += `<path d="${PRX}" fill="none" stroke="${ink}" stroke-width=".3" stroke-linejoin="miter" transform="translate(-1.68 6.66) skewX(-12)"><title>PRX</title></path>`;
  s += `<text y="7.93" ${sans} font-size=".99" text-anchor="middle" fill="${ink}" textLength="8.8" lengthAdjust="spacingAndGlyphs" x=".05">POWERMATIC 80</text>`;
  // Each word set square to its radius, its baseline 15.05 out.
  s += `<text y="15.05" ${sans} font-size="1.02" text-anchor="middle" fill="${ink}" textLength="2.75" lengthAdjust="spacingAndGlyphs" transform="rotate(8.6)">SWISS</text>`;
  return s + `<text y="15.05" ${sans} font-size="1.02" text-anchor="middle" fill="${ink}" textLength="2.5" lengthAdjust="spacingAndGlyphs" transform="rotate(-8.3)">MADE</text>`;
}

/**
 * Faceted steel baton hands, posed as in the photo (hour 306.5°, minute 49.3°, seconds 217.3°): one half of each blade
 * lit and the other shaded, with a grey channel from 1.4 to 4.7 and a white lume inlay from 5 to the tip. Hour 1.55 mm
 * wide to 9.6, minute 1.42 mm to 14.2, each with a tail to 2.15 with chamfered corners; a 0.18 mm seconds needle to
 * 14.8 with a squared counterweight bar 0.5 mm wide to 3.1.
 */
function hands(id: string, L: FullLook) {
  const ha = 306.5, ma = 49.3, sa = 217.3, hc = L.handColor, edge = shade(hc, -.55), lume = `url(#${id}tl)`;
  const blade = (w: number, tip: number, tail: number) => {
    const h = w / 2, c = .25, k = .3;
    return {
      all: `M${-h + c},${tail}L${-h},${tail - c}L${-h},${-tip + k}L${-h + k},${-tip}H${h - k}L${h},${-tip + k}L${h},${tail - c}L${h - c},${tail}Z`,
      half: `M0,${tail}H${h - c}L${h},${tail - c}L${h},${-tip + k}L${h - k},${-tip}H0Z`,
      // The chamfered tip's own facets, a light one on the lit side and a dark one on the shaded side.
      tipLit: `M${-h},${-tip + k}L${-h + k},${-tip}H0V${-tip + k}Z`, tipDark: `M0,${-tip}H${h - k}L${h},${-tip + k}H0Z`,
    };
  };
  const hour = blade(1.55, 9.6, 2.15), minute = blade(1.42, 14.2, 2.15);
  const second = 'M-.25,3.1L-.25,.9L-.09,.5L-.07,-14.8H.07L.09,.5L.25,.9L.25,3.1Z';
  let s = `<g fill="#000" opacity=".28" transform="translate(.1 .15)"><path d="${hour.all}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute.all}" ${handRole('minute')}transform="rotate(${ma})"/><path d="${second}" ${handRole('second')}transform="rotate(${sa})"/></g>`;
  for (const [role, b, a, tip] of [['hour', hour, ha, 9.6], ['minute', minute, ma, 14.2]] as const) {
    s += `<g ${handRole(role)}transform="rotate(${a})"><path d="${b.all}" fill="${shade(hc, .3)}" stroke="${edge}" stroke-width=".05"/><path d="${b.half}" fill="${shade(hc, -.25)}"/>`
      + `<path d="${b.tipLit}" fill="${shade(hc, .5)}"/><path d="${b.tipDark}" fill="${shade(hc, -.4)}"/>`
      + `<rect x="-.3" y="-4.85" width=".6" height="3.45" fill="${shade(hc, -.38)}" stroke="${edge}" stroke-width=".03"/><rect x="-.3" y="${f(-tip + .45)}" width=".6" height="${f(tip - 5.45)}" fill="${lume}" stroke="${edge}" stroke-width=".03"${lu('hands')}/></g>`;
  }
  s += `<path d="${second}" fill="${shade(hc, .12)}" stroke="${edge}" stroke-width=".03" ${handRole('second')}transform="rotate(${sa})"/>`;
  return s + `<circle r=".68" fill="url(#${id}tp)" stroke="${edge}" stroke-width=".05"/><circle r=".38" fill="none" stroke="${shade(hc, -.35)}" stroke-width=".07"/><circle r=".14" fill="${shade(hc, -.5)}"/>`;
}

export interface T1374071104100Options { D: number; LL: number; lw: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the bracelet for the Tissot PRX Powermatic 80 40 mm T137.407.11.041.00. */
export function t1374071104100SVG(o: T1374071104100Options) {
  const { D, LL, lw, id, L, outline } = o;
  const d = t1374071104100Case(D, LL, lw), u = D / SPEC_D, m = L.caseColor;
  let s = outline ? '' : defs(id, L);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}tc)`}" ${outline ? o.stroke : `stroke="${shade(m, -.45)}" stroke-width=".12"`}/>`;
  if (outline) return s + crown(id, L, u, true, o.stroke) + `<circle r="${f(18.65 * u)}" fill="none" ${o.stroke}/><circle r="${f(15.65 * u)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  s += caseFinish(D, LL, id, L, d, u);
  s += crown(id, L, u, false, '');
  s += `<g transform="scale(${f(u)})">`;
  s += bezel(id, L) + dial(id) + markers(id, L) + date(id, L) + printing() + hands(id, L);
  // The crystal: a soft reflection across the upper left.
  s += `<path d="M-14.2,-4.6A15,15 0 0 1 -4.6,-14.2A17.2,17.2 0 0 0 -14.2,-4.6Z" fill="#fff" opacity=".06"/>`;
  return s + '</g>';
}
