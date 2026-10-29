import type { FullLook } from '../catalog/schema';
import { esc, shade } from '../lib/util';
import { P } from './geom';
import { lu } from './night';
import { handRole } from './hands';

// Oris Divers Sixty-Five Chronograph 40 mm (01 771 7791 4054-07 8 20 18):
// Multi-piece 316L stainless-steel case (40.0 mm diameter, 48.0 mm lug-to-lug,
// 20 mm lug width) with sweeping brushed lugs, narrow outer chamfers, vintage
// unguarded screw-down crown at 3 o'clock and pump chronograph pushers at 2 and 4;
// 120-tooth coin-edge unidirectional bezel with black aluminium minute-scale top ring
// (lumed triangle and pip at 12, condensed 10/20/30/40/50 numerals, five-minute bars
// and full minute ticks); double-domed sapphire crystal edge refraction halo; curved
// glossy black dial with dense 1/5-second peripheral track, sunken snailed subdials
// at 9 (continuous seconds: 60/15/30/45) and 3 (30-minute counter: 30/15), applied
// shield marker at 12, rectangular baton at 6 and circular plots at 1, 2, 4, 5, 7, 8,
// 10 and 11 filled with white Super-LumiNova, ORIS and WATER RESISTANT / 10BAR/100M
// printing, segmented hour hand, sword minute hand and slim needle chronograph hand.
// Furniture is in units of k, the bezel insert's outer radius; the case is in mm.
// See docs/models/oris-01-771-7791.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');
type XY = [number, number];

const xy = ([x, y]: XY) => `${f(x)},${f(y)}`;

/**
 * Multi-piece case silhouette in millimetres. The 120-tooth bezel crest is the specified
 * 40.0 mm diameter (R = 20.0 mm, k = R / 1.036). Lug openings are an exact 20 mm (x = -10..+10),
 * and the sweeping vintage lugs reach the 48.0 mm lug-to-lug (y = -24..+24) with angled flat tips.
 */
export function oris771Case(D: number, LL: number, lw: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, u = R / 20;
  const k = R / 1.036;
  const ri = .24 * u, seat = k * .965, bow = .35 * u;

  // Sweeping vintage Divers Sixty-Five lugs: straight inner wall at ±10 mm, angled flat tip
  // from (10, ±24) to (13.35u, ±23.18u), and a long sweeping shoulder into the bezel near ±12.8u.
  const lugCurve = (sx: number, sy: number, toJoin: boolean) => {
    const pTipIn: XY = [sx * (slot + ri), sy * -H];
    const pTipOut: XY = [sx * (slot + 3.18 * u), sy * (-H + .74 * u)];
    const pCorner: XY = [sx * (slot + 3.42 * u), sy * (-H + 1.08 * u)];
    const c1: XY = [sx * (slot + 4.18 * u), sy * (-H + 4.35 * u)];
    const c2: XY = [sx * (slot + 5.15 * u), sy * (-16.8 * u)];
    const pJoin: XY = [sx * (slot + 5.85 * u), sy * (-12.8 * u)];
    return toJoin
      ? `L${xy([sx * slot, sy * (-H + ri)])}Q${xy([sx * slot, sy * -H])} ${xy(pTipIn)}L${xy(pTipOut)}Q${xy([sx * (slot + 3.38 * u), sy * (-H + .82 * u)])} ${xy(pCorner)}C${xy(c1)} ${xy(c2)} ${xy(pJoin)}`
      : `C${xy(c2)} ${xy(c1)} ${xy(pCorner)}Q${xy([sx * (slot + 3.38 * u), sy * (-H + .82 * u)])} ${xy(pTipOut)}L${xy(pTipIn)}Q${xy([sx * slot, sy * -H])} ${xy([sx * slot, sy * (-H + ri)])}L${xy([sx * slot, sy * -seat])}`;
  };

  const rMid = k * 1.012;
  const arc = (p: XY) => `A${f(rMid)},${f(rMid)} 0 0 1 ${xy(p)}`;

  const d = `M${xy([slot, -seat])}`
    + lugCurve(1, 1, true)
    + arc([slot + 5.85 * u, 12.8 * u])
    + lugCurve(1, -1, false)
    + `Q0,${f(seat - bow)} ${xy([-slot, seat])}`
    + lugCurve(-1, -1, true)
    + arc([-(slot + 5.85 * u), -12.8 * u])
    + lugCurve(-1, 1, false)
    + `Q0,${f(-seat + bow)} ${xy([slot, -seat])}Z`;
  return { d, k };
}

function defs(id: string, L: FullLook, metal: string) {
  return `<defs>
<linearGradient id="${id}oc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(metal, .32)}"/><stop offset=".48" stop-color="${metal}"/><stop offset="1" stop-color="${shade(metal, -.32)}"/></linearGradient>
<linearGradient id="${id}ocy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(metal, -.42)}"/><stop offset=".24" stop-color="${shade(metal, .46)}"/><stop offset=".5" stop-color="${shade(metal, .78)}"/><stop offset=".76" stop-color="${shade(metal, .16)}"/><stop offset="1" stop-color="${shade(metal, -.44)}"/></linearGradient>
<linearGradient id="${id}ost" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fafcfb"/><stop offset=".38" stop-color="${L.handColor}"/><stop offset=".56" stop-color="#7c8286"/><stop offset=".74" stop-color="#e3e7ea"/><stop offset="1" stop-color="#989ea2"/></linearGradient>
<linearGradient id="${id}olu" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbfdfc"/><stop offset=".65" stop-color="${L.lume}"/><stop offset="1" stop-color="${shade(L.lume, -.1)}"/></linearGradient>
<linearGradient id="${id}obe" x1=".12" y1=".06" x2=".88" y2=".94"><stop stop-color="${shade(L.bezel, .18)}"/><stop offset=".42" stop-color="${L.bezel}"/><stop offset="1" stop-color="#060709"/></linearGradient>
<radialGradient id="${id}odl" cx=".44" cy=".36" r=".8"><stop stop-color="${shade(L.dial, .08)}"/><stop offset=".58" stop-color="${L.dial}"/><stop offset="1" stop-color="#040507"/></radialGradient>
<radialGradient id="${id}osd" cx=".42" cy=".38" r=".72"><stop stop-color="#1c2026"/><stop offset=".65" stop-color="#0d0f12"/><stop offset="1" stop-color="#060709"/></radialGradient>
<linearGradient id="${id}ore" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#edf2f6"/><stop offset=".35" stop-color="#9aa2a8"/><stop offset=".7" stop-color="#d8dfe4"/><stop offset="1" stop-color="#6c7378"/></linearGradient>
<pattern id="${id}obr" patternUnits="userSpaceOnUse" width=".4" height=".6"><path d="M0,0V.6M.2,0V.6" stroke="#fff" stroke-width=".045" opacity=".13"/><path d="M.1,0V.6M.3,0V.6" stroke="#42484d" stroke-width=".035" opacity=".09"/></pattern>
</defs>`;
}

/**
 * Vintage unguarded screw-down crown at 3 o'clock and cylindrical pump chronograph
 * pushers at 2 o'clock (60°) and 4 o'clock (120°).
 */
function crownAndPushers(D: number, id: string, metal: string, outline: boolean, stroke: string) {
  const R = D / 2, u = R / 20;
  const cyl = outline ? 'none' : `url(#${id}ocy)`, dark = shade(metal, -.55);
  let s = '';

  // Vintage pump pushers: narrow collar, cylindrical stem, and broader polished cap.
  for (const a of [60, 120]) {
    s += `<g transform="rotate(${a - 90}) translate(${f(R - .55 * u)} 0)">`;
    if (!outline) s += `<rect x="-.2" y="${f(-1.25 * u)}" width="${f(.65 * u)}" height="${f(2.5 * u)}" fill="${dark}"/>`;
    // Stem
    s += `<rect x="${f(.25 * u)}" y="${f(-1.12 * u)}" width="${f(1.55 * u)}" height="${f(2.24 * u)}" fill="${cyl}" ${stroke}/>`;
    // Broader pump cap
    s += `<rect x="${f(1.65 * u)}" y="${f(-1.68 * u)}" width="${f(1.45 * u)}" height="${f(3.36 * u)}" rx="${f(.24 * u)}" fill="${cyl}" ${stroke}/>`;
    if (!outline) {
      s += `<path d="M${f(1.68 * u)},${f(-1.62 * u)}V${f(1.62 * u)}" stroke="${dark}" stroke-width=".09"/>`;
      s += `<rect x="${f(2.78 * u)}" y="${f(-1.42 * u)}" width="${f(.22 * u)}" height="${f(2.84 * u)}" rx=".09" fill="#f7f9fa" opacity=".88"/>`;
    }
    s += '</g>';
  }

  // Unguarded vintage screw-down crown at 3 o'clock: finely knurled collar and domed cap.
  const h = 3.25 * u, barrel = 2.15 * u, w = 3.35 * u;
  s += `<g transform="translate(${f(R - .4 * u)} 0)">`;
  if (!outline) s += `<rect x="-.3" y="${f(-h * .72)}" width="${f(.55 * u)}" height="${f(h * 1.44)}" fill="${dark}"/>`;
  s += `<path d="M0,${f(-h)}H${f(barrel)}Q${f(w)},${f(-h * .92)} ${f(w)},0Q${f(w)},${f(h * .92)} ${f(barrel)},${f(h)}H0Z" fill="${cyl}" ${stroke}/>`;
  if (!outline) {
    let grooves = '', lights = '';
    for (let i = -8; i <= 8; i++) {
      const y = i * .36 * u;
      grooves += `M${f(.14 * u)},${f(y)}H${f(barrel - .06 * u)}`;
      lights += `M${f(.16 * u)},${f(y + .11 * u)}H${f(barrel - .1 * u)}`;
    }
    s += `<path d="${grooves}" stroke="${dark}" stroke-width="${f(.12 * u)}"/><path d="${lights}" stroke="#fff" stroke-width="${f(.06 * u)}" opacity=".8"/>`;
    s += `<path d="M${f(barrel)},${f(-h + .12 * u)}V${f(h - .12 * u)}" stroke="${shade(metal, -.38)}" stroke-width=".11"/>`;
    s += `<path d="M${f(barrel + .45 * u)},${f(-h * .72)}Q${f(w - .14 * u)},0 ${f(barrel + .45 * u)},${f(h * .72)}" fill="none" stroke="#fff" stroke-width="${f(.26 * u)}" stroke-linecap="round" opacity=".78"/>`;
  }
  return s + '</g>';
}

/**
 * 120-tooth coin-edge unidirectional bezel with black aluminium minute-scale insert:
 * inverted triangle with circular Super-LumiNova pip at 12, condensed numerals at
 * 10, 20, 30, 40 and 50, bold rectangular bars at 5, 15, 25, 35, 45 and 55, and
 * crisp minute ticks at all remaining minutes around the full 60-minute circumference.
 */
function bezel(k: number, id: string, L: FullLook) {
  let crests = '', facets = '';
  const teeth = 120, step = 360 / teeth, half = step / 2;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    crests += `M${pt(k * 1.006, a - half)}Q${pt(k * 1.036, a)} ${pt(k * 1.006, a + half)}Z`;
    facets += `M${pt(k * 1.030, a)}L${pt(k * 1.006, a + half)}L${pt(k * 1.016, a + half * .35)}Z`;
  }
  let s = `<circle r="${f(k * 1.018)}" fill="url(#${id}ocy)"/>`;
  s += `<path d="${crests}" fill="${shade(L.caseColor, .46)}" stroke="${shade(L.caseColor, -.28)}" stroke-width=".04"/>`;
  s += `<path d="${facets}" fill="${shade(L.caseColor, -.34)}" opacity=".62"/>`;
  s += `<circle r="${f(k * 1.004)}" fill="none" stroke="#eef2f5" stroke-width=".14"/>`;

  // Black aluminium bezel insert (0.858k..0.998k) with subtle upper-left metallic sheen.
  const rOut = k * .998, rIn = k * .858;
  s += `<circle r="${f(rOut)}" fill="url(#${id}obe)"/>`;
  const sheen = `M${pt(rOut, 305)}A${f(rOut)},${f(rOut)} 0 0 1 ${pt(rOut, 20)}L${pt(rIn, 20)}A${f(rIn)},${f(rIn)} 0 0 0 ${pt(rIn, 305)}Z`;
  s += `<path d="${sheen}" fill="#cfd6dc" opacity=".14"/>`;
  s += `<circle r="${f(rOut)}" fill="none" stroke="#687078" stroke-width=".08"/>`;

  const bt = L.bezelText;
  let minor = '', major = '';
  for (let m = 1; m < 60; m++) {
    if (m % 10 === 0) continue;
    const a = m * 6;
    if (m % 5 === 0) major += `M${pt(k * .984, a)}L${pt(k * .874, a)}`;
    else minor += `M${pt(k * .964, a)}L${pt(k * .898, a)}`;
  }
  s += `<path d="${minor}" stroke="${bt}" stroke-width="${f(k * .012)}"/><path d="${major}" stroke="${bt}" stroke-width="${f(k * .028)}"/>`;

  // 12 o'clock inverted triangle with recessed Super-LumiNova pip.
  s += `<path d="M${f(-k * .088)},${f(-k * .986)}H${f(k * .088)}L0,${f(-k * .872)}Z" fill="${bt}"/>`;
  s += `<circle cy="${f(-k * .942)}" r="${f(k * .028)}" fill="url(#${id}olu)"${lu('bezel')} stroke="#889096" stroke-width=".06"/>`;

  // Tall, condensed bezel numerals at 10, 20, 30, 40 and 50.
  s += `<g fill="${bt}" font-family="'Trebuchet MS','Arial Narrow',Arial,sans-serif" font-size="${f(k * .136)}" font-weight="400" text-anchor="middle" dominant-baseline="central">`;
  for (const v of [10, 20, 30, 40, 50]) {
    const a = v * 6, [x, y] = P(k * .928, a);
    s += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${a} ${f(x)} ${f(y)}) translate(${f(x)} ${f(y)}) scale(.74 1.06) translate(${f(-x)} ${f(-y)})">${v}</text>`;
  }
  return s + '</g>';
}

/**
 * Polished steel inner bezel lip, double-domed sapphire crystal edge refraction ring,
 * and dense 1/5-second peripheral chronograph track with SWISS MADE at 6 o'clock.
 */
function crystalAndTrack(k: number, id: string, L: FullLook) {
  let s = `<circle r="${f(k * .846)}" fill="none" stroke="url(#${id}ore)" stroke-width="${f(k * .022)}"/>`;
  s += `<circle r="${f(k * .857)}" fill="none" stroke="#dce2e6" stroke-width=".09"/>`;
  // Box/double-domed sapphire crystal edge refraction halo.
  s += `<circle r="${f(k * .818)}" fill="none" stroke="#b8c2cc" stroke-width="${f(k * .034)}" opacity=".72"/>`;
  s += `<circle r="${f(k * .814)}" fill="none" stroke="#f2f6fa" stroke-width="${f(k * .011)}" opacity=".82"/>`;
  s += `<circle r="${f(k * .796)}" fill="none" stroke="#18202c" stroke-width="${f(k * .014)}" opacity=".8"/>`;

  // Dense 1/5-second (300-tick) peripheral track with longer minute ticks and bold 5-minute bars.
  const ink = L.bezelText, rOut = k * .784;
  let fine = '', sec = '', five = '';
  for (let i = 0; i < 300; i++) {
    const a = i * 1.2;
    if (i % 25 === 0) five += `M${pt(rOut, a)}L${pt(k * .706, a)}`;
    else if (i % 5 === 0) sec += `M${pt(rOut, a)}L${pt(k * .732, a)}`;
    else fine += `M${pt(rOut, a)}L${pt(k * .752, a)}`;
  }
  s += `<path d="${fine}" stroke="${ink}" stroke-width="${f(k * .0042)}" opacity=".78"/>`;
  s += `<path d="${sec}" stroke="${ink}" stroke-width="${f(k * .0075)}" opacity=".9"/>`;
  s += `<path d="${five}" stroke="${ink}" stroke-width="${f(k * .015)}" opacity=".96"/>`;

  const [sx, sy] = P(k * .682, 193.5), [mx, my] = P(k * .682, 166.5);
  s += `<g fill="${ink}" font-family="'Trebuchet MS',Arial,sans-serif" font-size="${f(k * .033)}" text-anchor="middle" dominant-baseline="central" opacity=".88">`
    + `<text x="${f(sx)}" y="${f(sy)}" transform="rotate(13.5 ${f(sx)} ${f(sy)})">SWISS</text>`
    + `<text x="${f(mx)}" y="${f(my)}" transform="rotate(-13.5 ${f(mx)} ${f(my)})">MADE</text></g>`;
  return s;
}

/**
 * Bi-compax sunken registers at 9 o'clock (continuous seconds: 60, 15, 30, 45)
 * and 3 o'clock (30-minute counter: 30, 15). Numerals read upright relative to the dial.
 */
function subdials(k: number, id: string, L: FullLook) {
  const r = k * .246, ink = L.bezelText;
  const drawSub = (cx: number, labels: [string, number][], mode: 'sec' | 'min', handAng: number) => {
    let s = `<circle cx="${f(cx)}" cy="0" r="${f(r + k * .006)}" fill="#050608"/>`;
    s += `<circle cx="${f(cx)}" cy="0" r="${f(r)}" fill="url(#${id}osd)" stroke="#2c3238" stroke-width=".09"/>`;
    // Subtle concentric snailing rings.
    for (const fR of [.82, .66, .5]) {
      s += `<circle cx="${f(cx)}" cy="0" r="${f(r * fR)}" fill="none" stroke="#fff" stroke-width=".03" opacity=".04"/>`;
    }
    let minor = '', major = '';
    if (mode === 'sec') {
      for (let i = 0; i < 12; i++) {
        const a = i * 30, [x0, y0] = P(r * .95, a), [x1, y1] = P(r * (i % 3 === 0 ? .76 : .64), a);
        if (i % 3 === 0) continue; // numerals sit at 60, 15, 30, 45
        major += `M${f(cx + x0)},${f(y0)}L${f(cx + x1)},${f(y1)}`;
      }
    } else {
      for (let i = 0; i < 30; i++) {
        const a = i * 12;
        if (i === 0 || i === 15) continue;
        const [x0, y0] = P(r * .95, a), [x1, y1] = P(r * (i % 5 === 0 ? .64 : .81), a);
        if (i % 5 === 0) major += `M${f(cx + x0)},${f(y0)}L${f(cx + x1)},${f(y1)}`;
        else minor += `M${f(cx + x0)},${f(y0)}L${f(cx + x1)},${f(y1)}`;
      }
    }
    if (minor) s += `<path d="${minor}" stroke="${ink}" stroke-width="${f(k * .007)}" opacity=".88"/>`;
    if (major) s += `<path d="${major}" stroke="${ink}" stroke-width="${f(k * .011)}" opacity=".95"/>`;

    s += `<g fill="${ink}" font-family="'Trebuchet MS',Arial,sans-serif" font-size="${f(k * .054)}" font-weight="600" text-anchor="middle" dominant-baseline="central">`;
    for (const [txt, posA] of labels) {
      const [lx, ly] = P(r * .71, posA);
      s += `<text x="${f(cx + lx)}" y="${f(ly)}">${txt}</text>`;
    }
    s += '</g>';

    // White lumed subdial hand with polished steel collar.
    const hw = k * .018, hLen = r * .82;
    s += `<g ${handRole(mode === 'sec' ? 'small-seconds' : 'chrono')}transform="translate(${f(cx)} 0) rotate(${handAng})">`
      + `<path d="M${f(-hw)},${f(k * .03)}L${f(-hw * .75)},${f(-hLen * .88)}L0,${f(-hLen)}L${f(hw * .75)},${f(-hLen * .88)}L${f(hw)},${f(k * .03)}Z" fill="url(#${id}olu)"${lu('subdials')} stroke="#aeb6bc" stroke-width=".04"/>`
      + `<circle r="${f(k * .034)}" fill="url(#${id}ost)" stroke="#40464c" stroke-width=".05"/>`
      + `<circle r="${f(k * .013)}" fill="#202428"/></g>`;
    return s;
  };

  // Left subdial (9 o'clock, cx = -0.398k): 60, 15, 30, 45 upright relative to the dial.
  const left = drawSub(-k * .398, [['60', 0], ['15', 90], ['30', 180], ['45', 270]], 'sec', 174);
  // Right subdial (3 o'clock, cx = +0.398k): 30 and 15.
  const right = drawSub(k * .398, [['30', 0], ['15', 180]], 'min', 38);
  return left + right;
}

/**
 * Applied polished markers filled with white Super-LumiNova:
 * pentagonal shield at 12, rectangular baton at 6, and circular plots at 1, 2, 4, 5, 7, 8, 10 and 11.
 */
function markers(k: number, id: string) {
  let shadow = '', metal = '', lume = '';

  // Circular plots at 1, 2, 4, 5, 7, 8, 10, 11 (pushed out to 0.618k around the large bicompax registers).
  const rPlot = k * .618, ro = k * .050, ri = k * .040;
  for (const h of [1, 2, 4, 5, 7, 8, 10, 11]) {
    const [x, y] = P(rPlot, h * 30);
    shadow += `M${f(x - ro)},${f(y)}a${f(ro)},${f(ro)} 0 1 0 ${f(2 * ro)},0a${f(ro)},${f(ro)} 0 1 0 ${f(-2 * ro)},0`;
    metal += `M${f(x - ro)},${f(y)}a${f(ro)},${f(ro)} 0 1 0 ${f(2 * ro)},0a${f(ro)},${f(ro)} 0 1 0 ${f(-2 * ro)},0`;
    lume += `M${f(x - ri)},${f(y)}a${f(ri)},${f(ri)} 0 1 0 ${f(2 * ri)},0a${f(ri)},${f(ri)} 0 1 0 ${f(-2 * ri)},0`;
  }

  // 12 o'clock pentagonal shield (0.482k..0.678k).
  const shOut = `M${f(-k * .068)},${f(-k * .678)}H${f(k * .068)}L${f(k * .058)},${f(-k * .525)}L0,${f(-k * .482)}L${f(-k * .058)},${f(-k * .525)}Z`;
  const shIn = `M${f(-k * .054)},${f(-k * .664)}H${f(k * .054)}L${f(k * .045)},${f(-k * .532)}L0,${f(-k * .498)}L${f(-k * .045)},${f(-k * .532)}Z`;
  shadow += shOut;
  metal += shOut;
  lume += shIn;

  // 6 o'clock rectangular baton (0.502k..0.678k).
  const b6Out = `M${f(-k * .052)},${f(k * .502)}H${f(k * .052)}V${f(k * .678)}H${f(-k * .052)}Z`;
  const b6In = `M${f(-k * .038)},${f(k * .516)}H${f(k * .038)}V${f(k * .664)}H${f(-k * .038)}Z`;
  shadow += b6Out;
  metal += b6Out;
  lume += b6In;

  return `<g fill="#000" opacity=".4" transform="translate(.08 .12)"><path d="${shadow}"/></g>`
    + `<g fill="url(#${id}ost)" stroke="#dce2e6" stroke-width=".045"><path d="${metal}"/></g>`
    + `<g fill="url(#${id}olu)"${lu('indices')} stroke="#b8c0c6" stroke-width=".035"><path d="${lume}"/></g>`;
}

/** Dial printing: bold ORIS wordmark below 12 and WATER RESISTANT / 10BAR/100M above 6. */
function printing(k: number, L: FullLook, brand: string) {
  const ink = L.bezelText, label = (brand || 'ORIS').toUpperCase();
  return `<g fill="${ink}" font-family="'Trebuchet MS','Gill Sans',Arial,sans-serif" text-anchor="middle">`
    + `<text y="${f(-k * .332)}" font-size="${f(k * .096)}" font-weight="700" letter-spacing="${f(k * .008)}" textLength="${f(k * .285)}" lengthAdjust="spacingAndGlyphs">${esc(label)}</text>`
    + `<text y="${f(k * .348)}" font-size="${f(k * .036)}" font-weight="600" letter-spacing="${f(k * .005)}" textLength="${f(k * .348)}" lengthAdjust="spacingAndGlyphs">WATER RESISTANT</text>`
    + `<text y="${f(k * .404)}" font-size="${f(k * .037)}" font-weight="600" letter-spacing="${f(k * .005)}" textLength="${f(k * .268)}" lengthAdjust="spacingAndGlyphs">10BAR / 100M</text>`
    + `</g>`;
}

/**
 * Divers Sixty-Five Chronograph handset:
 * - Segmented sword hour hand with a crossbar dividing the main lume and tip lume
 * - Long sword minute hand reaching the peripheral track
 * - Slender central chronograph 1/4-second needle with a rectangular counterweight tail.
 */
function hands(k: number, id: string, L: FullLook) {
  const brushed = shade(L.handColor, -.24), polished = shade(L.handColor, .1);
  const hw = k * .068, mw = k * .054;

  // Hour hand: sword blade with a metal crossbar at -0.318k dividing the lume into two segments.
  const hour = `M${f(-hw * .44)},${f(k * .095)}H${f(hw * .44)}L${f(hw / 2)},${f(-k * .385)}L0,${f(-k * .448)}L${f(-hw / 2)},${f(-k * .385)}Z`;
  const hourFace = `M0,${f(-k * .448)}L${f(hw / 2)},${f(-k * .385)}L${f(hw * .44)},${f(k * .095)}H0Z`;
  const hl = hw * .31;
  const hourLume = `M${f(-hl)},${f(-k * .105)}H${f(hl)}V${f(-k * .306)}H${f(-hl)}Z`
    + `M${f(-hl)},${f(-k * .326)}H${f(hl)}V${f(-k * .380)}L0,${f(-k * .420)}L${f(-hl)},${f(-k * .380)}Z`;

  // Minute hand: long sword blade reaching the 1/5-second track.
  const minute = `M${f(-mw * .44)},${f(k * .105)}H${f(mw * .44)}L${f(mw / 2)},${f(-k * .635)}L0,${f(-k * .702)}L${f(-mw / 2)},${f(-k * .635)}Z`;
  const minuteFace = `M0,${f(-k * .702)}L${f(mw / 2)},${f(-k * .635)}L${f(mw * .44)},${f(k * .105)}H0Z`;
  const ml = mw * .30;
  const minuteLume = `M${f(-ml)},${f(-k * .108)}H${f(ml)}V${f(-k * .628)}L0,${f(-k * .668)}L${f(-ml)},${f(-k * .628)}Z`;

  const ha = 342, ma = 91, sa = 38;
  let s = `<g fill="#000" opacity=".36" transform="translate(.15 .22)"><circle r="${f(k * .068)}"/><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/><path d="M-.09,${f(k * .195)}H.09L.032,${f(-k * .755)}H-.032Z" ${handRole('chrono')}transform="rotate(${sa})"/></g>`;

  s += `<circle r="${f(k * .066)}" fill="${brushed}" stroke="${polished}" stroke-width=".05"/>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hour}" fill="${brushed}" stroke="#edf1f4" stroke-width=".055"/><path d="${hourFace}" fill="${polished}"/><path d="${hourLume}" fill="url(#${id}olu)"${lu('hands')} stroke="#b4bec4" stroke-width=".04"/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minute}" fill="${brushed}" stroke="#edf1f4" stroke-width=".055"/><path d="${minuteFace}" fill="${polished}"/><path d="${minuteLume}" fill="url(#${id}olu)"${lu('hands')} stroke="#b4bec4" stroke-width=".04"/></g>`;

  // Central chronograph seconds hand: slender polished needle from +0.195k tail to -0.755k tip.
  const secColor = L.accent || L.handColor;
  s += `<g ${handRole('chrono')}transform="rotate(${sa})"><path d="M-.105,${f(k * .195)}H.105L.065,0H-.065Z" fill="${brushed}" stroke="${secColor}" stroke-width=".035"/><path d="M-.055,0H.055L.028,${f(-k * .755)}H-.028Z" fill="${secColor}"/></g>`;

  return s + `<circle r="${f(k * .038)}" fill="url(#${id}ost)" stroke="#e4e9ec" stroke-width=".06"/><circle r="${f(k * .015)}" fill="#252a2e"/>`;
}

export interface Oris771Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap for the Oris Divers Sixty-Five Chronograph 40 mm. */
export function oris771SVG(o: Oris771Options) {
  const { D, LL, lw, id, L, outline } = o;
  const metal = L.caseColor;
  const { d, k } = oris771Case(D, LL, lw);
  let s = outline ? '' : defs(id, L, metal);
  s += crownAndPushers(D, id, metal, outline, o.stroke);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}oc)`}" ${outline ? o.stroke : `stroke="${shade(metal, -.3)}" stroke-width=".12"`}/>`;
  if (outline) {
    return s + `<circle r="${f(k * 1.036)}" fill="none" ${o.stroke}/><circle r="${f(k * .792)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  }

  // Sweeping vertically brushed lugs with narrow outer chamfers.
  const u = D / 40, slot = lw / 2, H = LL / 2;
  const lugChamfer = `M${f(slot + 3.18 * u)},${f(-H + .74 * u)}L${f(slot + 3.42 * u)},${f(-H + 1.08 * u)}C${f(slot + 4.18 * u)},${f(-H + 4.35 * u)} ${f(slot + 5.15 * u)},${f(-16.8 * u)} ${f(slot + 5.85 * u)},${f(-12.8 * u)}L${f(slot + 5.15 * u)},${f(-13.2 * u)}C${f(slot + 4.52 * u)},${f(-16.9 * u)} ${f(slot + 3.55 * u)},${f(-H + 4.45 * u)} ${f(slot + 2.82 * u)},${f(-H + .88 * u)}Z`;
  const chamferCrease = `M${f(slot + 2.82 * u)},${f(-H + .88 * u)}C${f(slot + 3.55 * u)},${f(-H + 4.45 * u)} ${f(slot + 4.52 * u)},${f(-16.9 * u)} ${f(slot + 5.15 * u)},${f(-13.2 * u)}`;
  let facets = '';
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    facets += `<path d="${lugChamfer}" transform="scale(${sx} ${sy})" fill="${shade(metal, sx < 0 ? -.16 : .28)}"/>`;
    facets += `<path d="${chamferCrease}" transform="scale(${sx} ${sy})" fill="none" stroke="#f2f6f9" stroke-width=".13" opacity=".78"/>`;
  }
  s += `<defs><clipPath id="${id}occ"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}occ)">${facets}<path d="${d}" fill="url(#${id}obr)"/><path d="${d}" fill="none" stroke="${shade(metal, -.34)}" stroke-width=".38"/><path d="${d}" fill="none" stroke="${shade(metal, .6)}" stroke-width=".15"/></g>`;

  s += bezel(k, id, L);
  s += `<circle r="${f(k * .795)}" fill="url(#${id}odl)"/>`;
  s += crystalAndTrack(k, id, L);
  s += subdials(k, id, L);
  s += markers(k, id);
  s += printing(k, L, o.brand);
  s += hands(k, id, L);

  // Domed sapphire crystal reflection arc.
  s += `<path d="M${f(-k * .56)},${f(-k * .18)}A${f(k * .74)},${f(k * .74)} 0 0 1 ${f(k * .2)},${f(-k * .56)}A${f(k * .96)},${f(k * .96)} 0 0 0 ${f(-k * .56)},${f(-k * .18)}Z" fill="#fff" opacity=".065"/>`;
  return s;
}
