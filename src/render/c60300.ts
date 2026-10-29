import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { P } from './geom';
import { lu } from './night';
import { handRole } from './hands';

// Christopher Ward C60 Trident Pro 300 40 mm (C60-40ADA31S0KK1-B0):
// Brushed & polished Light-catcher™ 316L stainless-steel case (40.0 mm diameter,
// 47.45 mm lug-to-lug, 20 mm lug width) with angled crown guards and screw-down crown;
// two-part unidirectional bezel with a 120-tooth coin edge, black zirconia ceramic
// outer insert (hollow 12 triangle and 5–55 numerals at every five-minute mark) and
// fixed brushed steel inner ring with 60 minute increments; glossy black lacquer dial
// with applied twin-flags logo, top-brushed diamond-faceted batons (double at 12,
// short baton below the 6 o'clock date aperture), red AUTOMATIC / white 300m|1000ft
// printing, broad triangular hour hand, tapered sword minute hand, and Trident
// counter-balanced seconds hand with red-tipped lumed arrow pointer.
// Furniture is in units of k, the ceramic bezel insert's outer radius; the case is in mm.
// See docs/models/christopher-ward-c60-pro-300.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');
type XY = [number, number];

const xy = ([x, y]: XY) => `${f(x)},${f(y)}`;

/**
 * Light-catcher™ case silhouette in millimetres. The 120-tooth bezel crest is the specified
 * 40.0 mm diameter (R = 20.0 mm, k = R / 1.033). Lug openings are an exact 20 mm (x = -10..+10),
 * lug-to-lug is 47.45 mm (y = -23.725..+23.725) with angled tip facets, and the right flank
 * carries the sloped crown guards and recessed crown seat.
 */
export function c60300Case(D: number, LL: number, lw: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, u = R / 20;
  const k = R / 1.033;
  const ri = .25 * u, seat = k * .962, bow = .38 * u;

  // Light-catcher lug contour: angled outer tip facet from (10, ±H) to (12.85u, ±21.25u),
  // then a smooth shoulder curve into the bezel at (14.75u, ±14.0u).
  const lugCurve = (sx: number, sy: number, toJoin: boolean) => {
    const pTipIn: XY = [sx * (slot + ri), sy * -H];
    const pTipOut: XY = [sx * (slot + 2.62 * u), sy * (-H + 2.15 * u)];
    const pCorner: XY = [sx * (slot + 2.86 * u), sy * (-H + 2.55 * u)];
    const c1: XY = [sx * (slot + 3.22 * u), sy * (-H + 4.95 * u)];
    const c2: XY = [sx * (slot + 3.92 * u), sy * (-17.2 * u)];
    const pJoin: XY = [sx * (slot + 4.75 * u), sy * (-14.0 * u)];
    return toJoin
      ? `L${xy([sx * slot, sy * (-H + ri)])}Q${xy([sx * slot, sy * -H])} ${xy(pTipIn)}L${xy(pTipOut)}Q${xy([sx * (slot + 2.82 * u), sy * (-H + 2.32 * u)])} ${xy(pCorner)}C${xy(c1)} ${xy(c2)} ${xy(pJoin)}`
      : `C${xy(c2)} ${xy(c1)} ${xy(pCorner)}Q${xy([sx * (slot + 2.82 * u), sy * (-H + 2.32 * u)])} ${xy(pTipOut)}L${xy(pTipIn)}Q${xy([sx * slot, sy * -H])} ${xy([sx * slot, sy * (-H + ri)])}L${xy([sx * slot, sy * -seat])}`;
  };

  const rMid = k * 1.012;
  const rightFlank =
    `A${f(rMid)},${f(rMid)} 0 0 1 ${xy([18.42 * u, -7.85 * u])}`
    + `C${xy([19.35 * u, -6.95 * u])} ${xy([20.08 * u, -5.75 * u])} ${xy([20.48 * u, -4.35 * u])}`
    + `Q${xy([20.56 * u, -3.75 * u])} ${xy([20.22 * u, -3.55 * u])}`
    + `L${xy([19.82 * u, -3.35 * u])}V${f(3.35 * u)}`
    + `L${xy([20.22 * u, 3.55 * u])}Q${xy([20.56 * u, 3.75 * u])} ${xy([20.48 * u, 4.35 * u])}`
    + `C${xy([20.08 * u, 5.75 * u])} ${xy([19.35 * u, 6.95 * u])} ${xy([18.42 * u, 7.85 * u])}`
    + `A${f(rMid)},${f(rMid)} 0 0 1 ${xy([slot + 4.75 * u, 14.0 * u])}`;

  const leftFlank = `A${f(rMid)},${f(rMid)} 0 0 1 ${xy([-(slot + 4.75 * u), -14.0 * u])}`;

  const d = `M${xy([slot, -seat])}`
    + lugCurve(1, 1, true)
    + rightFlank
    + lugCurve(1, -1, false)
    + `Q0,${f(seat - bow)} ${xy([-slot, seat])}`
    + lugCurve(-1, -1, true)
    + leftFlank
    + lugCurve(-1, 1, false)
    + `Q0,${f(-seat + bow)} ${xy([slot, -seat])}Z`;
  return { d, k };
}

function defs(id: string, L: FullLook, metal: string) {
  return `<defs>
<linearGradient id="${id}cc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(metal, .34)}"/><stop offset=".48" stop-color="${metal}"/><stop offset="1" stop-color="${shade(metal, -.32)}"/></linearGradient>
<linearGradient id="${id}ccy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(metal, -.42)}"/><stop offset=".22" stop-color="${shade(metal, .46)}"/><stop offset=".48" stop-color="${shade(metal, .78)}"/><stop offset=".76" stop-color="${shade(metal, .16)}"/><stop offset="1" stop-color="${shade(metal, -.44)}"/></linearGradient>
<linearGradient id="${id}cst" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fafcfb"/><stop offset=".38" stop-color="${L.handColor}"/><stop offset=".56" stop-color="#7c8388"/><stop offset=".74" stop-color="#e3e7ea"/><stop offset="1" stop-color="#98a0a5"/></linearGradient>
<linearGradient id="${id}clu" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbfdfc"/><stop offset=".65" stop-color="${L.lume}"/><stop offset="1" stop-color="${shade(L.lume, -.1)}"/></linearGradient>
<linearGradient id="${id}cbe" x1="0" y1="0" x2="1" y2=".85"><stop stop-color="${shade(L.bezel, .16)}"/><stop offset=".45" stop-color="${L.bezel}"/><stop offset="1" stop-color="#050608"/></linearGradient>
<linearGradient id="${id}cri" x1=".15" y1=".05" x2=".85" y2=".95"><stop stop-color="#e5eaee"/><stop offset=".32" stop-color="#9ca4aa"/><stop offset=".68" stop-color="#697177"/><stop offset="1" stop-color="#bcc3c8"/></linearGradient>
<radialGradient id="${id}cdl" cx=".44" cy=".38" r=".8"><stop stop-color="${shade(L.dial, .06)}"/><stop offset=".6" stop-color="${L.dial}"/><stop offset="1" stop-color="#050608"/></radialGradient>
<pattern id="${id}cbr" patternUnits="userSpaceOnUse" width=".4" height=".6"><path d="M0,0V.6M.2,0V.6" stroke="#fff" stroke-width=".045" opacity=".14"/><path d="M.1,0V.6M.3,0V.6" stroke="#42484d" stroke-width=".035" opacity=".1"/></pattern>
</defs>`;
}

/** Screw-down crown at 3 o'clock with deep machined flutes and a stepped shoulder. */
function crown(D: number, id: string, metal: string, outline: boolean, stroke: string) {
  const u = D / 40;
  const x0 = 19.82 * u, h = 3.28 * u, w = 3.45 * u, barrel = 2.65 * u;
  let s = `<g transform="translate(${f(x0)} 0)">`;
  if (!outline) s += `<rect x="${f(-.35 * u)}" y="${f(-h + .15 * u)}" width="${f(.65 * u)}" height="${f((h - .15 * u) * 2)}" rx=".2" fill="${shade(metal, -.58)}"/>`;
  s += `<path d="M0,${f(-h)}H${f(barrel)}L${f(w)},${f(-h * .82)}V${f(h * .82)}L${f(barrel)},${f(h)}H0Z" fill="${outline ? 'none' : `url(#${id}ccy)`}" ${stroke}/>`;
  if (!outline) {
    let darks = '', lights = '';
    for (let i = -5; i <= 5; i++) {
      const y = i * .53 * u;
      darks += `M${f(.22 * u)},${f(y)}H${f(barrel - .08 * u)}`;
      lights += `M${f(.24 * u)},${f(y + .17 * u)}H${f(barrel - .12 * u)}`;
    }
    s += `<path d="${darks}" stroke="#1c2024" stroke-width="${f(.22 * u)}" stroke-linecap="round"/>`;
    s += `<path d="${lights}" stroke="#fff" stroke-width="${f(.09 * u)}" stroke-linecap="round" opacity=".88"/>`;
    s += `<path d="M${f(barrel)},${f(-h + .12 * u)}V${f(h - .12 * u)}" stroke="${shade(metal, -.42)}" stroke-width=".12"/>`;
    s += `<path d="M${f(barrel + .38 * u)},${f(-h * .72)}V${f(h * .72)}" stroke="#fff" stroke-width="${f(.24 * u)}" stroke-linecap="round" opacity=".78"/>`;
  }
  return s + '</g>';
}

/**
 * Two-part unidirectional bezel:
 * 1) 120-tooth coin edge and outer zirconia ceramic insert (0.870k..1.000k) with glossy reflection
 *    sectors, hollow lumed triangle at 12, and Arabic numerals 5..55 at every five-minute mark.
 * 2) Fixed brushed steel inner ring (0.782k..0.868k) with 60 dark minute increments.
 */
function bezel(k: number, id: string, L: FullLook) {
  let crests = '', facets = '';
  const teeth = 120, step = 360 / teeth, half = step / 2;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    crests += `M${pt(k * 1.005, a - half)}Q${pt(k * 1.034, a)} ${pt(k * 1.005, a + half)}Z`;
    facets += `M${pt(k * 1.028, a)}L${pt(k * 1.005, a + half)}L${pt(k * 1.015, a + half * .35)}Z`;
  }
  let s = `<circle r="${f(k * 1.016)}" fill="url(#${id}ccy)"/>`;
  s += `<path d="${crests}" fill="${shade(L.caseColor, .48)}" stroke="${shade(L.caseColor, -.28)}" stroke-width=".04"/>`;
  s += `<path d="${facets}" fill="${shade(L.caseColor, -.34)}" opacity=".6"/>`;
  s += `<circle r="${f(k * 1.004)}" fill="none" stroke="#eef2f5" stroke-width=".14"/>`;

  // Outer black ceramic insert with diagonal glossy reflection bands.
  const rOut = k * .998, rIn = k * .870;
  s += `<circle r="${f(rOut)}" fill="url(#${id}cbe)"/>`;
  const gloss1 = `M${pt(rOut, 286)}A${f(rOut)},${f(rOut)} 0 0 1 ${pt(rOut, 351)}L${pt(rIn, 353)}A${f(rIn)},${f(rIn)} 0 0 0 ${pt(rIn, 284)}Z`;
  const gloss2 = `M${pt(rOut, 114)}A${f(rOut)},${f(rOut)} 0 0 1 ${pt(rOut, 160)}L${pt(rIn, 162)}A${f(rIn)},${f(rIn)} 0 0 0 ${pt(rIn, 112)}Z`;
  s += `<path d="${gloss1}" fill="#cfd6dc" opacity=".42"/><path d="${gloss2}" fill="#b8c0c8" opacity=".34"/>`;
  s += `<circle r="${f(rOut)}" fill="none" stroke="#7c848c" stroke-width=".08"/>`;

  // 12 o'clock hollow triangle on ceramic insert.
  const tOut = `M${f(-k * .084)},${f(-k * .984)}H${f(k * .084)}L0,${f(-k * .888)}Z`;
  const tIn = `M${f(-k * .038)},${f(-k * .963)}H${f(k * .038)}L0,${f(-k * .920)}Z`;
  s += `<path d="${tOut}" fill="${L.bezelText}"${lu('bezel')}/><path d="${tIn}" fill="#14171a"/>`;

  // Bold numerals at every 5-minute position (5 through 55) on the ceramic insert.
  s += `<g fill="${L.bezelText}" font-family="'Trebuchet MS','Gill Sans',Arial,sans-serif" font-size="${f(k * .102)}" font-weight="700" text-anchor="middle" dominant-baseline="central">`;
  for (let m = 5; m <= 55; m += 5) {
    const a = m * 6, [x, y] = P(k * .933, a);
    s += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${a} ${f(x)} ${f(y)}) translate(${f(x)} ${f(y)}) scale(1.12 .92) translate(${f(-x)} ${f(-y)})">${m}</text>`;
  }
  s += '</g>';

  // Fixed brushed steel inner ring (0.782k..0.868k) with 60 dark minute marks.
  s += `<circle r="${f(k * .870)}" fill="none" stroke="#080a0c" stroke-width=".14"/>`;
  s += `<circle r="${f(k * .828)}" fill="none" stroke="url(#${id}cri)" stroke-width="${f(k * .080)}"/>`;
  s += `<circle r="${f(k * .792)}" fill="none" stroke="#3b4248" stroke-width="${f(k * .020)}"/>`;
  let innerMinor = '', innerMajor = '';
  for (let m = 0; m < 60; m++) {
    const a = m * 6;
    if (m % 5 === 0) innerMajor += `M${pt(k * .864, a)}L${pt(k * .814, a)}`;
    else innerMinor += `M${pt(k * .860, a)}L${pt(k * .822, a)}`;
  }
  s += `<path d="${innerMinor}" stroke="#181c20" stroke-width="${f(k * .011)}"/><path d="${innerMajor}" stroke="#121518" stroke-width="${f(k * .026)}"/>`;
  s += `<circle r="${f(k * .778)}" fill="none" stroke="#c8d0d6" stroke-width=".09" opacity=".75"/>`;
  return s;
}

/** Outer dial minute track and SWISS MADE flanking the 6 o'clock baton. */
function dialTrack(k: number, L: FullLook) {
  let minor = '', major = '';
  for (let m = 0; m < 60; m++) {
    const a = m * 6;
    if (m % 5 === 0) major += `M${pt(k * .742, a)}L${pt(k * .688, a)}`;
    else minor += `M${pt(k * .740, a)}L${pt(k * .695, a)}`;
  }
  const ink = L.bezelText;
  const [sx, sy] = P(k * .715, 187.5), [mx, my] = P(k * .715, 172.5);
  return `<path d="${minor}" stroke="${ink}" stroke-width="${f(k * .0075)}" opacity=".88"/>`
    + `<path d="${major}" stroke="${ink}" stroke-width="${f(k * .012)}" opacity=".95"/>`
    + `<g fill="${ink}" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .026)}" text-anchor="middle" dominant-baseline="central" opacity=".85">`
    + `<text x="${f(sx)}" y="${f(sy)}" transform="rotate(7.5 ${f(sx)} ${f(sy)})">SWISS</text>`
    + `<text x="${f(mx)}" y="${f(my)}" transform="rotate(-7.5 ${f(mx)} ${f(my)})">MADE</text></g>`;
}

/**
 * Applied top-brushed, diamond-faceted baton indexes filled with SLN X1 BL C1 lume:
 * double baton at 12, full batons at 1–5 and 7–11, and a short baton below the 6 o'clock date window.
 */
function markers(k: number, id: string) {
  let shadow = '', frames = '', bevels = '', lume = '';

  const addBaton = (a: number, x0: number, yOuter: number, w: number, len: number, innerFacet: number) => {
    const t = a ? ` transform="rotate(${a})"` : '';
    const yInner = yOuter + len, m = k * .011;
    const outer = `M${f(x0)},${f(yOuter)}H${f(x0 + w)}V${f(yInner)}H${f(x0)}Z`;
    const inner = `M${f(x0 + m)},${f(yOuter + m)}H${f(x0 + w - m)}V${f(yInner - innerFacet)}H${f(x0 + m)}Z`;
    const tipBevel = `M${f(x0)},${f(yInner)}L${f(x0 + m)},${f(yInner - innerFacet)}H${f(x0 + w - m)}L${f(x0 + w)},${f(yInner)}Z`;
    shadow += `<path d="${outer}"${t}/>`;
    frames += `<path d="${outer}"${t}/>`;
    bevels += `<path d="${tipBevel}"${t}/>`;
    lume += `<path d="${inner}"${t}/>`;
  };

  // 12 o'clock double baton.
  const w12 = k * .064, gap12 = k * .022, y12 = -k * .728, len12 = k * .228;
  addBaton(0, -(w12 + gap12 / 2), y12, w12, len12, k * .028);
  addBaton(0, gap12 / 2, y12, w12, len12, k * .028);

  // Single batons at 1, 2, 3, 4, 5, 7, 8, 9, 10, 11.
  const wBar = k * .068, yBar = -k * .728, lenBar = k * .224;
  for (let h = 1; h < 12; h++) {
    if (h === 6) continue;
    addBaton(h * 30, -wBar / 2, yBar, wBar, lenBar, k * .026);
  }

  // Short baton at 6 o'clock, outboard of the date aperture.
  addBaton(180, -wBar / 2, -k * .728, wBar, k * .068, k * .012);

  return `<g fill="#000" opacity=".42" transform="translate(.09 .14)">${shadow}</g>`
    + `<g fill="url(#${id}cst)" stroke="#dce2e6" stroke-width=".045">${frames}</g>`
    + `<g fill="#6d747a">${bevels}</g>`
    + `<g fill="url(#${id}clu)"${lu('indices')} stroke="#b8c2c8" stroke-width=".035">${lume}</g>`;
}

/**
 * Applied twin-flags logo (English cross on the left, inverted Swiss cross on the right),
 * red AUTOMATIC / white 300m|1000ft printing, and bevel-framed date window at 6 o'clock.
 */
function logoTextAndDate(k: number, id: string, L: FullLook) {
  // Applied twin-flags logo centred at y = -0.300k: two 3x3 grids of cell size c = 0.032k.
  const c = k * .032, g = k * .005, y0 = -k * .348;
  const xL = -(3 * c + g), xR = g;
  const england = `M${f(xL + c)},${f(y0)}H${f(xL + 2 * c)}V${f(y0 + c)}H${f(xL + 3 * c)}V${f(y0 + 2 * c)}H${f(xL + 2 * c)}V${f(y0 + 3 * c)}H${f(xL + c)}V${f(y0 + 2 * c)}H${f(xL)}V${f(y0 + c)}H${f(xL + c)}Z`;
  const sq = (x: number, y: number) => `M${f(x)},${f(y)}H${f(x + c)}V${f(y + c)}H${f(x)}Z`;
  const swiss = sq(xR, y0) + sq(xR + 2 * c, y0) + sq(xR, y0 + 2 * c) + sq(xR + 2 * c, y0 + 2 * c);
  let s = `<path d="${england}${swiss}" fill="#000" opacity=".38" transform="translate(.06 .09)"/>`;
  s += `<path d="${england}${swiss}" fill="url(#${id}cst)" stroke="#d2d8dc" stroke-width=".03"/>`;

  // Lower dial printing: red AUTOMATIC and white 300m|1000ft.
  const red = L.accent || '#E03A2E', ink = L.bezelText;
  s += `<g font-family="'Trebuchet MS','Gill Sans',Arial,sans-serif" text-anchor="middle">`
    + `<text y="${f(k * .304)}" font-size="${f(k * .042)}" font-weight="700" letter-spacing="${f(k * .01)}" textLength="${f(k * .336)}" lengthAdjust="spacingAndGlyphs" fill="${red}">AUTOMATIC</text>`
    + `<text y="${f(k * .364)}" font-size="${f(k * .036)}" font-weight="600" letter-spacing="${f(k * .003)}" textLength="${f(k * .242)}" lengthAdjust="spacingAndGlyphs" fill="${ink}">300m|1000ft</text>`
    + `</g>`;

  // Framed date window at 6 o'clock with self-coloured black disc and white '8'.
  if (L.date === '6') {
    const w = k * .136, h = k * .168, y = k * .556, b = k * .013;
    s += `<rect x="${f(-w / 2 - b)}" y="${f(y - h / 2 - b)}" width="${f(w + 2 * b)}" height="${f(h + 2 * b)}" rx=".12" fill="#252a2e" stroke="#aeb6bc" stroke-width=".055"/>`;
    s += `<rect x="${f(-w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" rx=".06" fill="#0d0f12" stroke="#d8dfe4" stroke-width=".045"/>`;
    s += `<text x="0" y="${f(y + k * .004)}" font-family="'Trebuchet MS',Arial,sans-serif" font-size="${f(k * .112)}" font-weight="400" text-anchor="middle" dominant-baseline="central" fill="${ink}">8</text>`;
  }
  return s;
}

/**
 * C60 Trident Pro 300 handset:
 * - Broad triangular/spade hour hand with rectangular counterweight and triangular lume insert
 * - Faceted sword/baton minute hand with long lume insert
 * - Signature 3-pronged Trident counter-balanced seconds hand with red-tipped lumed arrow pointer.
 */
function hands(k: number, id: string, L: FullLook) {
  const brushed = shade(L.handColor, -.24), polished = shade(L.handColor, .12);
  const red = L.accent || '#E03A2E';

  // Hour hand: rectangular tail, narrow neck, wide flared triangular head tapering to -0.485k.
  const hw = k * .118, hn = k * .021;
  const hour = `M${f(-hn)},${f(k * .102)}H${f(hn)}V${f(-k * .092)}L${f(hw / 2)},${f(-k * .152)}L0,${f(-k * .485)}L${f(-hw / 2)},${f(-k * .152)}L${f(-hn)},${f(-k * .092)}Z`;
  const hourFace = `M0,${f(-k * .485)}L${f(hw / 2)},${f(-k * .152)}L${f(hn)},${f(-k * .092)}V${f(k * .102)}H0Z`;
  const hourLume = `M0,${f(-k * .432)}L${f(hw * .33)},${f(-k * .162)}L0,${f(-k * .136)}L${f(-hw * .33)},${f(-k * .162)}Z`;

  // Minute hand: rectangular tail and gently tapered sword blade to -0.702k.
  const mw0 = k * .030, mw1 = k * .026;
  const minute = `M${f(-k * .023)},${f(k * .110)}H${f(k * .023)}V${f(-k * .06)}L${f(mw0)},${f(-k * .12)}L${f(mw1)},${f(-k * .672)}L0,${f(-k * .702)}L${f(-mw1)},${f(-k * .672)}L${f(-mw0)},${f(-k * .12)}L${f(-k * .023)},${f(-k * .06)}Z`;
  const minuteFace = `M0,${f(-k * .702)}L${f(mw1)},${f(-k * .672)}L${f(mw0)},${f(-k * .12)}L${f(k * .023)},${f(-k * .06)}V${f(k * .110)}H0Z`;
  const minuteLume = `M${f(-k * .016)},${f(-k * .152)}H${f(k * .016)}L${f(k * .014)},${f(-k * .658)}L0,${f(-k * .676)}L${f(-k * .014)},${f(-k * .658)}Z`;

  // Seconds hand Trident counterweight (in positive y, opposite the pointer) and arrow tip.
  const trW = k * .054, trY0 = k * .142, trY1 = k * .248, trTip = k * .296;
  const trident =
    `M-.065,${f(trY0)}H.065V${f(-k * .50)}H-.065Z`
    + `M${f(-trW)},${f(trY1)}Q${f(-trW)},${f(trY0)} 0,${f(trY0)}Q${f(trW)},${f(trY0)} ${f(trW)},${f(trY1)}`
    + `L${f(trW + k * .012)},${f(trY1 - k * .006)}L${f(trW - k * .006)},${f(trTip - k * .014)}L${f(trW - k * .022)},${f(trY1 - k * .004)}`
    + `Q${f(trW - k * .016)},${f(trY0 + k * .02)} .07,${f(trY0 + k * .02)}V${f(trY1 + k * .006)}`
    + `L${f(k * .019)},${f(trY1 + k * .002)}L0,${f(trTip)}L${f(-k * .019)},${f(trY1 + k * .002)}L-.07,${f(trY1 + k * .006)}`
    + `V${f(trY0 + k * .02)}Q${f(-trW + k * .016)},${f(trY0 + k * .02)} ${f(-trW + k * .022)},${f(trY1 - k * .004)}`
    + `L${f(-trW + k * .006)},${f(trTip - k * .014)}L${f(-trW - k * .012)},${f(trY1 - k * .006)}Z`;
  const secRed = `M-.055,${f(-k * .50)}H.055V${f(-k * .595)}L${f(k * .036)},${f(-k * .595)}L0,${f(-k * .722)}L${f(-k * .036)},${f(-k * .595)}H-.055Z`;
  const secLume = `M0,${f(-k * .688)}L${f(k * .020)},${f(-k * .608)}H${f(-k * .020)}Z`;

  const ha = 291.5, ma = 47.5, sa = 199.5;
  let s = `<g fill="#000" opacity=".36" transform="translate(.15 .22)"><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/><path d="${trident}${secRed}" ${handRole('second')}transform="rotate(${sa})"/></g>`;

  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hour}" fill="${brushed}" stroke="#edf1f4" stroke-width=".055"/><path d="${hourFace}" fill="${polished}"/><path d="${hourLume}" fill="url(#${id}clu)"${lu('hands')} stroke="#b4bec4" stroke-width=".04"/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minute}" fill="${brushed}" stroke="#edf1f4" stroke-width=".055"/><path d="${minuteFace}" fill="${polished}"/><path d="${minuteLume}" fill="url(#${id}clu)"${lu('hands')} stroke="#b4bec4" stroke-width=".04"/></g>`;
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="${trident}" fill="url(#${id}cst)" stroke="#dce2e6" stroke-width=".035"/><path d="${secRed}" fill="${red}" stroke="${shade(red, -.2)}" stroke-width=".03"/><path d="${secLume}" fill="url(#${id}clu)"${lu('seconds')}/></g>`;

  return s + `<circle r="${f(k * .036)}" fill="url(#${id}cst)" stroke="#e4e9ec" stroke-width=".06"/><circle r="${f(k * .014)}" fill="#525a60"/>`;
}

export interface C60300Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap for the Christopher Ward C60 Trident Pro 300 40 mm. */
export function c60300SVG(o: C60300Options) {
  const { D, LL, lw, id, L, outline } = o;
  const metal = L.caseColor;
  const { d, k } = c60300Case(D, LL, lw);
  let s = outline ? '' : defs(id, L, metal);
  s += crown(D, id, metal, outline, o.stroke);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}cc)`}" ${outline ? o.stroke : `stroke="${shade(metal, -.3)}" stroke-width=".12"`}/>`;
  if (outline) {
    return s + `<circle r="${f(k * 1.033)}" fill="none" ${o.stroke}/><circle r="${f(k * .775)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  }

  // Light-catcher™ polished outer lug chamfers, vertical brushing on the lugs, and crown-guard bevels.
  const u = D / 40, slot = lw / 2, H = LL / 2;
  const lugChamfer = `M${f(slot + .18 * u)},${f(-H)}L${f(slot + 2.86 * u)},${f(-H + 2.55 * u)}C${f(slot + 3.22 * u)},${f(-H + 4.95 * u)} ${f(slot + 3.92 * u)},${f(-17.2 * u)} ${f(slot + 4.75 * u)},${f(-14.0 * u)}L${f(slot + 3.85 * u)},${f(-14.4 * u)}C${f(slot + 3.15 * u)},${f(-17.3 * u)} ${f(slot + 2.45 * u)},${f(-H + 5.1 * u)} ${f(slot + 2.05 * u)},${f(-H + 2.55 * u)}L${f(slot + .08 * u)},${f(-H + .45 * u)}Z`;
  const chamferCrease = `M${f(slot + 2.05 * u)},${f(-H + 2.55 * u)}C${f(slot + 2.45 * u)},${f(-H + 5.1 * u)} ${f(slot + 3.15 * u)},${f(-17.3 * u)} ${f(slot + 3.85 * u)},${f(-14.4 * u)}`;
  const guardFacet = `M${f(18.42 * u)},${f(-7.85 * u)}C${f(19.35 * u)},${f(-6.95 * u)} ${f(20.08 * u)},${f(-5.75 * u)} ${f(20.48 * u)},${f(-4.35 * u)}L${f(19.65 * u)},${f(-3.55 * u)}L${f(18.2 * u)},${f(-6.8 * u)}Z`;
  let facets = '';
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    facets += `<path d="${lugChamfer}" transform="scale(${sx} ${sy})" fill="${shade(metal, sx < 0 ? .28 : -.22)}"/>`;
    facets += `<path d="${chamferCrease}" transform="scale(${sx} ${sy})" fill="none" stroke="#f4f7f9" stroke-width=".14" opacity=".8"/>`;
  }
  for (const sy of [-1, 1]) {
    facets += `<path d="${guardFacet}" transform="scale(1 ${sy})" fill="url(#${id}ccy)" opacity=".82"/>`;
  }
  s += `<defs><clipPath id="${id}ccc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}ccc)">${facets}<path d="${d}" fill="url(#${id}cbr)"/><path d="${d}" fill="none" stroke="${shade(metal, -.34)}" stroke-width=".38"/><path d="${d}" fill="none" stroke="${shade(metal, .6)}" stroke-width=".15"/></g>`;

  s += bezel(k, id, L);
  s += `<circle r="${f(k * .775)}" fill="url(#${id}cdl)"/>`;
  s += dialTrack(k, L);
  s += markers(k, id);
  s += logoTextAndDate(k, id, L);
  s += hands(k, id, L);

  // Subtle flat sapphire crystal reflection.
  s += `<path d="M${f(-k * .54)},${f(-k * .18)}A${f(k * .72)},${f(k * .72)} 0 0 1 ${f(k * .18)},${f(-k * .54)}A${f(k * .94)},${f(k * .94)} 0 0 0 ${f(-k * .54)},${f(-k * .18)}Z" fill="#fff" opacity=".05"/>`;
  return s;
}
