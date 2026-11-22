import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { P } from './geom';
import { handRole } from './hands';
import { lu } from './night';
import { bezelShadow, lugTopLight } from './cases';

// Omega Seamaster Aqua Terra 150M Co-Axial Master Chronometer 41 mm (220.10.41.21.01.002): the 2024 glossy black
// lacquer dial in steel, on the rounded three-row steel bracelet. Symmetric polished case with Omega's twisted lyre
// lugs (no crown guards), conical fluted screw-down crown at 3, smooth sloping polished steel bezel, glossy black
// lacquer dial with a printed white minute track and two-digit five-minute numerals (60, 05..55), 11 applied faceted
// rhodium-plated triangular indices filled with white Super-LumiNova, trapezoidal rhodium-framed date window at 6,
// applied Ω, OMEGA, italic Seamaster, CO-AXIAL / MASTER CHRONOMETER, faceted dauphine hour hand, broad-arrow minute
// hand and a slim seconds needle with a lumed triangular tip.
//
// Measured on Omega's front-on product photo at 14.037 px/mm (41 mm horizontal case diameter). The photo shows slight
// vertical foreshortening (46.80 mm lug-to-lug vs Omega's 48.00 mm), so the case silhouette maps onto Omega's 41 × 48
// mm dimensions while circular dial features use the unforeshortened horizontal scale u = D / 41. See
// docs/models/omega-220-10-41-21-01-002.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');

type XY = [number, number];
type Seg = { c: XY[]; p: XY };
const xy = ([x, y]: XY) => `${f(x)},${f(y)}`;
const segPath = (segs: Seg[]) => segs.map(s => (s.c.length === 0 ? 'L' : s.c.length === 1 ? 'Q' : 'C') + [...s.c, s.p].map(xy).join(' ')).join('');
function reverse(start: XY, segs: Seg[]): Seg[] {
  const pts = [start, ...segs.map(s => s.p)];
  return segs.map((s, i) => ({ c: [...s.c].reverse(), p: pts[i] })).reverse();
}
const map = (segs: Seg[], t: (p: XY) => XY): Seg[] => segs.map(s => ({ c: s.c.map(t), p: t(s.p) }));
const flipX = ([x, y]: XY): XY => [-x, y], flipY = ([x, y]: XY): XY => [x, -y], rot = ([x, y]: XY): XY => [-x, -y];
const unit = (a: XY, b: XY): XY => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
const along = (p: XY, u: XY, d: number): XY => [p[0] + u[0] * d, p[1] + u[1] * d];

/** Reference dimensions in mm: 41 mm case diameter, 48 mm lug-to-lug, case arc radius where the end link meets it. */
const REF_D = 41, REF_LL = 48, CASE_R = 20.5;
/** Outer lug tip corner and where the lug flank smoothly meets the mid-case. */
const TIP: XY = [13.25, -21.65], FLANK: XY = [16.5, -14.2];
/** Twisted lyre lug crease: sweeps from the inner lug tip down into the outer mid-case flank. */
const CREASE_X = 10.7, CREASE_END: XY = [17.4, -12.0], FEATHER = .7;

/**
 * One quarter of the symmetric Aqua Terra case (top right): from the inner lug root at the case arc, straight out to
 * the inner lug tip at y = -H, across the slanted lyre tip, and sweeping smoothly down the flank to (20.5, 0).
 */
function quarter(sx: number, sy: number, slot: number, H: number): { start: XY; segs: Seg[] } {
  const X = (x: number) => x * sx, Y = (y: number) => y * sy, S = ([x, y]: XY): XY => [X(x), Y(y)];
  const yi = Math.sqrt(Math.max(1, X(CASE_R) ** 2 - slot * slot));
  const inner: XY = [slot, -H], tip = S(TIP), flank = S(FLANK), ut = unit(inner, tip), uf = unit(tip, flank);
  const segs: Seg[] = [
    { c: [], p: [slot, -H + .4] },
    { c: [inner], p: along(inner, ut, .4) },
    { c: [], p: along(tip, ut, -.75) },
    { c: [tip], p: along(tip, uf, .75) },
    { c: [S([14.4, -19.2]), S([15.6, -16.4])], p: flank },
    { c: [S([18.4, -10.0]), S([20.5, -5.2])], p: [X(20.5), 0] },
  ];
  return { start: [slot, -yi], segs };
}

/** Closed symmetric case outline with lug openings exactly `lw` wide. */
export function omega22010412101002Case(D: number, LL: number, lw: number) {
  const sx = D / REF_D, sy = LL / REF_LL, H = LL / 2, slot = lw / 2, rc = CASE_R * sx;
  const q = quarter(sx, sy, slot, H);
  const start = q.start, yi = -start[1];
  const br = reverse(flipY(start), map(q.segs, flipY));
  const bl = map(q.segs, rot);
  const tl = reverse(flipX(start), map(q.segs, flipX));
  const arc = (p: XY) => `A${f(rc)},${f(rc)} 0 0 1 ${xy(p)}`;
  return `M${xy(start)}${segPath(q.segs)}${segPath(br)}${arc([-slot, yi])}${segPath(bl)}${segPath(tl)}${arc(start)}Z`;
}

/**
 * Twisted lyre lugs: the sweeping mirror-polished outer facet and inner twist crease on each of the four lugs, drawn
 * clipped to the case outline.
 */
function lugs(D: number, LL: number, lw: number) {
  const sx = D / REF_D, sy = LL / REF_LL, H = LL / 2, slot = lw / 2;
  const tip: XY = [TIP[0] * sx, TIP[1] * sy], inner: XY = [slot, -H];
  const facet = (w: number) => {
    const t = ((CREASE_X - w) * sx - slot) / (tip[0] - slot);
    const c0: XY = [slot + (tip[0] - slot) * t, -H + (tip[1] + H) * t];
    const c1: XY = [(CREASE_END[0] - w * .7) * sx, (CREASE_END[1] + w * .5) * sy];
    const ctrl: XY = [(c0[0] + c1[0]) / 2 + .35 * sx, (c0[1] + c1[1]) / 2 - .25 * sy];
    return {
      c0, c1, ctrl,
      d: (m: (p: XY) => XY) => `M${xy(m(c0))}Q${xy(m(ctrl))} ${xy(m(c1))}L${xy(m([c1[0] + 2.2 * sx, c1[1] + .5 * sy]))}L${xy(m([FLANK[0] * sx + 1.4, FLANK[1] * sy]))}L${xy(m([tip[0] + 1.4, -H - 1]))}L${xy(m([c0[0], -H - 1]))}Z`,
    };
  };
  const core = facet(0), soft = facet(FEATHER);
  let facets = '', feather = '', creases = '', ends = '';
  for (const m of [(p: XY) => p, flipX, flipY, rot]) {
    facets += core.d(m);
    feather += soft.d(m);
    creases += `M${xy(m(core.c0))}Q${xy(m(core.ctrl))} ${xy(m(core.c1))}`;
    ends += `M${xy(m(inner))}L${xy(m(tip))}`;
  }
  return { facets, feather, creases, ends };
}

function defs(id: string, L: FullLook) {
  const m = L.caseColor;
  return `<defs>`
    // Polished steel case base: light upper face turning into a mid-grey lower-right.
    + `<linearGradient id="${id}ac" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .42)}"/><stop offset=".45" stop-color="${shade(m, .08)}"/><stop offset="1" stop-color="${shade(m, -.22)}"/></linearGradient>`
    // Smooth conical polished bezel: restrained light-to-mid-grey transition across the slope, matching Moonwatch steel.
    + `<linearGradient id="${id}ap" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8f9fa"/><stop offset=".28" stop-color="${shade(m, .36)}"/><stop offset=".54" stop-color="${shade(m, -.22)}"/><stop offset=".78" stop-color="${shade(m, .32)}"/><stop offset="1" stop-color="${shade(m, -.18)}"/></linearGradient>`
    // The bezel's conical slope turning down to the crystal: deeper shade towards its inner foot for clear 3D slope.
    + `<radialGradient id="${id}az" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="20.42"><stop offset=".83" stop-color="${shade(m, -.52)}" stop-opacity=".5"/><stop offset=".9" stop-color="${shade(m, -.32)}" stop-opacity=".18"/><stop offset=".96" stop-color="${shade(m, -.2)}" stop-opacity=".04"/><stop offset="1" stop-color="${shade(m, -.2)}" stop-opacity="0"/></radialGradient>`
    // Darker outer lug flank outside the twisted lyre crease, giving crisp separation from the light upper lug face.
    + `<linearGradient id="${id}aq" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, -.12)}"/><stop offset=".45" stop-color="${shade(m, -.32)}"/><stop offset=".8" stop-color="${shade(m, -.16)}"/><stop offset="1" stop-color="${shade(m, -.42)}"/></linearGradient>`
    // Conical crown barrel: cylindrical vertical lighting.
    + `<linearGradient id="${id}ay" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, -.45)}"/><stop offset=".24" stop-color="${shade(m, .5)}"/><stop offset=".5" stop-color="#fbfbfa"/><stop offset=".78" stop-color="${shade(m, .1)}"/><stop offset="1" stop-color="${shade(m, -.46)}"/></linearGradient>`
    // Glossy black lacquer dial: broader upper-left charcoal sheen fading smoothly into deep black across the lower dial.
    + `<radialGradient id="${id}ad" cx=".34" cy=".28" r=".86"><stop offset="0" stop-color="#353940"/><stop offset=".34" stop-color="#191c21"/><stop offset=".68" stop-color="${L.dial}"/><stop offset="1" stop-color="#050608"/></radialGradient>`
    // White Super-LumiNova fill.
    + `<radialGradient id="${id}al" cx=".4" cy=".35" r=".8"><stop stop-color="${shade(L.lume, .08)}"/><stop offset="1" stop-color="${shade(L.lume, -.08)}"/></radialGradient>`
    // Polished rhodium-plated hands, indices and date frame.
    + `<linearGradient id="${id}aw" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset=".48" stop-color="${L.handColor}"/><stop offset="1" stop-color="#8b9298"/></linearGradient>`
    // Dark inner rehaut ring sloping from the polished bezel down to the lacquer dial.
    + `<radialGradient id="${id}af" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="17.22"><stop offset=".955" stop-color="#08090c"/><stop offset=".985" stop-color="#4e545c"/><stop offset="1" stop-color="#98a0a8"/></radialGradient>`
    + `</defs>`;
}

/**
 * Conical fluted screw-down crown at 3 o'clock (unguarded): flares gently from 5.6 mm tall at the case (x = 20.3) to
 * 6.5 mm at x = 22.8, then steps over a polished domed end cap to x = 23.67.
 */
function crown(id: string, L: FullLook, outline: boolean, stroke: string) {
  const m = L.caseColor;
  const body = 'M20.3,-2.8L22.75,-3.22Q23.22,-3.18 23.45,-2.35Q23.67,-1.6 23.67,-.95V.95Q23.67,1.6 23.45,2.35Q23.22,3.18 22.75,3.22L20.3,2.8Z';
  if (outline) return `<path d="${body}" fill="none" ${stroke}/>`;
  let s = `<path d="${body}" fill="#000" opacity=".2" transform="translate(.12 .22)"/>`;
  s += `<rect x="20.1" y="-2.75" width=".45" height="5.5" fill="${shade(m, -.6)}"/>`;
  s += `<path d="${body}" fill="url(#${id}ay)" ${stroke}/>`;
  // Crisp conical flutes fanning slightly outward with the crown's taper.
  let grooves = '', ridges = '';
  for (let i = -3; i <= 3; i++) {
    const y0 = i * .78, y1 = i * .89;
    grooves += `M20.55,${f(y0 + .22)}L22.78,${f(y1 + .24)}`;
    ridges += `M20.55,${f(y0 - .05)}L22.78,${f(y1 - .06)}`;
  }
  s += `<path d="${grooves}" stroke="#2b3036" stroke-width=".22" opacity=".72"/><path d="${ridges}" stroke="#fff" stroke-width=".12" opacity=".62"/>`;
  // Stepped polished cap and seam line.
  s += `<path d="M22.75,-3.18Q23.22,-3.15 23.44,-2.35Q23.65,-1.6 23.65,-.95V.95Q23.65,1.6 23.44,2.35Q23.22,3.15 22.75,3.18Q23.22,1.5 23.22,0Q23.22,-1.5 22.75,-3.18Z" fill="#fff" opacity=".24"/>`;
  s += `<path d="M22.78,-3.15V3.15" stroke="${shade(m, -.45)}" stroke-width=".11"/>`;
  return s;
}

/**
 * Smooth sloping polished steel bezel running flush to the case edge at 20.42, shaded smoothly down its conical slope
 * to the crystal opening at 17.22, with a dark metallic inner flange/rehaut down to the lacquer dial at 16.72.
 */
function bezel(id: string, L: FullLook) {
  const m = L.caseColor;
  let s = `<circle r="20.42" fill="url(#${id}ap)" stroke="${shade(m, -.42)}" stroke-width=".11"/><circle r="20.42" fill="url(#${id}az)"/>`;
  s += `<circle r="17.22" fill="url(#${id}af)" stroke="${shade(m, -.52)}" stroke-width=".14"/>`;
  s += `<circle r="17.08" fill="none" stroke="#fff" stroke-width=".09" opacity=".38"/>`;
  return s;
}

/**
 * Glossy black lacquer dial to r = 16.5 with its white minute track and tangential two-digit 5-minute numerals
 * (60, 05..55). Bottom numerals 20..40 are turned right-side up to read naturally; SWISS and MADE sit either side of
 * 30 along the track.
 */
function dial(id: string, L: FullLook) {
  const ink = L.bezelText;
  let s = `<circle r="16.72" fill="url(#${id}ad)"/>`;
  // Soft lacquer reflection across upper-left quadrant.
  s += `<path d="M-14.8,-6.2A16,16 0 0 1 -4.2,-15.4A19.8,19.8 0 0 0 -14.8,-6.2Z" fill="#fff" opacity=".065"/>`;
  let ticks = '';
  for (let mnt = 0; mnt < 60; mnt++) {
    if (mnt % 5 === 0) continue;
    // Leave clean breathing room for SWISS and MADE flanking 30.
    if (mnt === 28 || mnt === 32) continue;
    const a = mnt * 6;
    ticks += `M${pt(15.1, a)}L${pt(16.18, a)}`;
  }
  s += `<path d="${ticks}" fill="none" stroke="${ink}" stroke-width=".13" opacity=".92"/>`;
  // Two-digit 5-minute numerals set in the minute track at r = 15.65.
  const sans = `font-family="'Futura','Century Gothic','Avenir Next',Arial,Helvetica,sans-serif" text-anchor="middle" dominant-baseline="central"`;
  let nums = '';
  for (let h = 0; h < 12; h++) {
    const label = h === 0 ? '60' : String(h * 5).padStart(2, '0');
    const a = h * 30;
    const [x, y] = P(15.65, a);
    // 20, 25, 30, 35, 40 face upright to the viewer; 45..15 follow the top arc.
    const rotDeg = h >= 4 && h <= 8 ? a + 180 : a;
    nums += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${rotDeg} ${f(x)} ${f(y)})">${label}</text>`;
  }
  s += `<g ${sans} font-size="1.48" font-weight="400" letter-spacing=".06" fill="${ink}" opacity=".94">${nums}</g>`;
  // SWISS and MADE flanking 30 along the bottom track.
  for (const [w, a, t] of [['SWISS', 11.4, 2.15], ['MADE', -11.2, 2.0]] as const) {
    s += `<text y="15.75" font-family="'Futura','Century Gothic','Avenir Next',Arial,Helvetica,sans-serif" text-anchor="middle" font-size=".6" textLength="${t}" lengthAdjust="spacingAndGlyphs" fill="${ink}" opacity=".92" transform="rotate(${a})">${w}</text>`;
  }
  return s;
}

/**
 * Eleven applied faceted rhodium-plated tapered wedge indices (hours 1..5 and 7..12; 6 is occupied by the date window),
 * pointing inward from r = 14.45 (width 1.52 mm) to a clearly squared-off inner end at r = 10.10 (width 0.56 mm), with
 * a readable darker grey side facet and inset white Super-LumiNova.
 */
function markers(id: string) {
  const rOut = 14.45, rIn = 10.10, wOut = .76, wIn = .28;
  const lOut = 13.92, lIn = 10.70, lwOut = .40, lwIn = .12;
  const rotPt = (x: number, y: number, deg: number): XY => {
    const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    return [x * c - y * s, x * s + y * c];
  };
  const poly = (pts: XY[], deg: number) => 'M' + pts.map(p => xy(rotPt(p[0], p[1], deg))).join('L') + 'Z';
  let frame = '', rightHalf = '', lume = '';
  for (let h = 0; h < 12; h++) {
    if (h === 6) continue;
    const deg = h * 30;
    frame += poly([[-wOut, -rOut], [wOut, -rOut], [wIn, -rIn], [-wIn, -rIn]], deg);
    rightHalf += poly([[0, -rOut], [wOut, -rOut], [wIn, -rIn], [0, -rIn]], deg);
    lume += poly([[-lwOut, -lOut], [lwOut, -lOut], [lwIn, -lIn], [-lwIn, -lIn]], deg);
  }
  return `<path d="${frame}" fill="#000" opacity=".42" transform="translate(.1 .15)"/>`
    + `<path d="${frame}" fill="url(#${id}aw)" stroke="#687078" stroke-width=".07" stroke-linejoin="round"/>`
    + `<path d="${rightHalf}" fill="#3a4046" opacity=".44"/>`
    + `<path d="${lume}" fill="url(#${id}al)"${lu('indices')}/>`;
}

/**
 * Trapezoidal rhodium-framed date window at 6 o'clock: narrower at top (2.76 mm) and wider at bottom (3.48 mm),
 * following radial geometry, with a black date disc and crisp white numeral 8.
 */
function date(id: string) {
  const outer = 'M-1.38,9.75H1.38L1.74,13.35H-1.74Z';
  const inner = 'M-1.02,10.12H1.02L1.35,12.96H-1.35Z';
  return `<path d="${outer}" fill="#000" opacity=".4" transform="translate(.08 .12)"/>`
    + `<path d="${outer}" fill="url(#${id}aw)" stroke="#687078" stroke-width=".07" stroke-linejoin="round"/>`
    + `<path d="M-1.38,9.75H1.38L1.02,10.12H-1.02Z" fill="#fff" opacity=".32"/>`
    + `<path d="${inner}" fill="#090a0d" stroke="#22262b" stroke-width=".06"/>`
    + `<text y="12.5" font-family="'Helvetica Neue',Arial,Helvetica,sans-serif" font-size="2.65" font-weight="400" text-anchor="middle" fill="#f4f6f8">8</text>`;
}

/** Applied rhodium Ω, OMEGA, silver italic Seamaster above the pivot; CO-AXIAL / MASTER CHRONOMETER below. */
function printing(id: string) {
  const ink = '#eef1f4', sans = `font-family="'Futura','Century Gothic','Avenir Next',Arial,Helvetica,sans-serif" text-anchor="middle"`;
  let s = `<path d="M-.88,.72H-.34A.72,.72 0 1 1 .34,.72H.88" transform="translate(0 -7.45)" fill="none" stroke="url(#${id}aw)" stroke-width=".3" stroke-linecap="round"/>`;
  s += `<text y="-5.32" ${sans} font-size="1.52" textLength="6.1" lengthAdjust="spacingAndGlyphs" fill="${ink}">OMEGA</text>`;
  s += `<text x=".05" y="-3.76" font-family="'Brush Script MT','Segoe Script','Snell Roundhand',cursive" font-style="italic" font-size="1.96" textLength="7.0" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${ink}" opacity=".95">Seamaster</text>`;
  s += `<text y="5.38" ${sans} font-size=".76" textLength="4.1" lengthAdjust="spacingAndGlyphs" fill="${ink}" opacity=".86">CO-AXIAL</text>`;
  s += `<text y="6.35" ${sans} font-size=".66" textLength="8.5" lengthAdjust="spacingAndGlyphs" fill="${ink}" opacity=".86">MASTER CHRONOMETER</text>`;
  return s;
}

/**
 * Aqua Terra handset posed at the photo's 10:08:37: faceted tapered hour hand with a slightly blunter tip and visible
 * silver border around its lume, broad-arrow minute hand with a balanced shorter arrowhead and clear silver border,
 * and slim seconds needle with an elongated kite marker near its tip. Each hand carries a live-time role.
 */
function hands(id: string) {
  const ha = 305.5, ma = 47.2, sa = 224.0;
  const metal = `url(#${id}aw)`, edge = '#5e666e', lume = `url(#${id}al)`;
  // Hour hand: faceted Aqua Terra taper with a slightly blunter tip (±0.14 at -9.55) and clear silver border round the lume.
  const hour = 'M-.50,1.6L-1.08,-.2L-.14,-9.55H.14L1.08,-.2L.50,1.6Z';
  const hourR = 'M0,1.6V-9.55H.14L1.08,-.2L.50,1.6Z';
  const hourLume = 'M-.44,-1.85L-.10,-7.65H.10L.44,-1.85Z';
  // Minute hand: balanced shaft to -11.05, shorter broad arrowhead (±1.42 barbs, tip at -14.35) with distinct silver border.
  const minute = 'M-.42,1.85L-.80,0L-.56,-11.05L-1.42,-10.85L-.09,-14.35H.09L1.42,-10.85L.56,-11.05L.80,0L.42,1.85Z';
  const minR = 'M0,1.85V-14.35H.09L1.42,-10.85L.56,-11.05L.80,0L.42,1.85Z';
  const minShaftLume = 'M-.28,-2.1L-.22,-10.35H.22L.28,-2.1Z';
  const minTipLume = 'M-.82,-11.32L0,-13.45L.82,-11.32Z';
  // Seconds hand: slim needle with an elongated kite marker (-9.85 to -13.2, widest ±0.56 at -11.2) and fine tip to -15.1.
  const secNeedle = 'M-.15,2.9L-.065,-15.1H.065L.15,2.9Z';
  const secHead = 'M0,-13.2L-.56,-11.2L0,-9.85L.56,-11.2Z';
  const secLume = 'M0,-12.55L-.30,-11.2L0,-10.35L.30,-11.2Z';

  let s = `<g fill="#000" opacity=".32" transform="translate(.16 .24)">`
    + `<path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/>`
    + `<path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/>`
    + `<g ${handRole('second')}transform="rotate(${sa})"><path d="${secNeedle}"/><path d="${secHead}"/></g></g>`;
  // Hour hand
  s += `<g ${handRole('hour')}transform="rotate(${ha})">`
    + `<path d="${hour}" fill="${metal}" stroke="${edge}" stroke-width=".05" stroke-linejoin="round"/>`
    + `<path d="${hourR}" fill="#484e54" opacity=".26"/>`
    + `<path d="${hourLume}" fill="${lume}"${lu('hands')}/></g>`;
  // Minute hand
  s += `<g ${handRole('minute')}transform="rotate(${ma})">`
    + `<path d="${minute}" fill="${metal}" stroke="${edge}" stroke-width=".05" stroke-linejoin="round"/>`
    + `<path d="${minR}" fill="#484e54" opacity=".26"/>`
    + `<path d="${minShaftLume}${minTipLume}" fill="${lume}"${lu('hands')}/></g>`;
  // Seconds hand
  s += `<g ${handRole('second')}transform="rotate(${sa})">`
    + `<path d="${secNeedle}" fill="${metal}" stroke="${edge}" stroke-width=".03"/>`
    + `<path d="${secHead}" fill="${metal}" stroke="${edge}" stroke-width=".05" stroke-linejoin="round"/>`
    + `<path d="${secLume}" fill="${lume}"${lu('seconds')}/></g>`;
  // Centre cap
  return s + `<circle r=".86" fill="${metal}" stroke="${edge}" stroke-width=".05"/><circle r=".34" fill="#70777e"/>`;
}

export interface Omega22010412101002Options {
  D: number; LL: number; lw: number; id: string; L: FullLook;
  outline: boolean; stroke: string; outlineColor: string; sw: number;
}

/** Everything above the bracelet for the Seamaster Aqua Terra 150M 41 mm (220.10.41.21.01.002). */
export function omega22010412101002SVG(o: Omega22010412101002Options) {
  const { D, LL, lw, id, L, outline } = o;
  const d = omega22010412101002Case(D, LL, lw), u = D / REF_D, m = L.caseColor;
  let s = outline ? '' : defs(id, L);
  const partStroke = outline
    ? o.stroke.replace(/stroke-width="([\d.]+)"/, (_, w: string) => `stroke-width="${f(+w / u)}"`)
    : `stroke="${shade(m, -.48)}" stroke-width=".09"`;
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}ac)`}" ${outline ? o.stroke : `stroke="${shade(m, -.48)}" stroke-width=".12"`}/>`;
  if (outline) {
    return s + `<g transform="scale(${f(u)})">${crown(id, L, true, partStroke)}</g>`
      + `<circle r="${f(20.42 * u)}" fill="none" ${o.stroke}/>`
      + `<circle r="${f(17.2 * u)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  }
  const lg = lugs(D, LL, lw);
  s += `<defs><clipPath id="${id}acc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}acc)">`
    + `${lugTopLight(id, D, LL, .85)}`
    + `<path d="${lg.feather}" fill="url(#${id}aq)" opacity=".35"/>`
    + `<path d="${lg.facets}" fill="url(#${id}aq)" opacity=".82"/>`
    + `<path d="${lg.creases}" fill="none" stroke="#fff" stroke-width=".32" opacity=".62"/>`
    + `<path d="${lg.ends}" fill="none" stroke="${shade(m, -.55)}" stroke-width=".85" opacity=".4"/>`
    + `${bezelShadow(20.48 * u)}</g>`;
  s += `<g transform="scale(${f(u)})">`;
  s += crown(id, L, false, partStroke);
  s += bezel(id, L);
  s += dial(id, L);
  s += markers(id);
  s += date(id);
  s += printing(id);
  s += hands(id);
  // Domed sapphire crystal: restrained upper-left highlight arc.
  s += `<path d="M-13.8,-4.6A14.5,14.5 0 0 1 -4.6,-13.8A16.8,16.8 0 0 0 -13.8,-4.6Z" fill="#fff" opacity=".08"/>`;
  return s + '</g>';
}
