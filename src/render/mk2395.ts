import type { FullLook } from '../catalog/schema';
import { esc, shade } from '../lib/util';
import { P } from './geom';
import { lu } from './night';
import { handRole } from './hands';

// Baltic Aquascaphe MK2 39.5 mm (Blue): 316L steel case with vertically brushed lugs,
// flat-top crown guards with polished upper chamfers, 80-tooth unidirectional sapphire
// bezel (12 triangle, 15/30/45 numerals, inner ring and full 60-minute scale),
// double-domed sapphire crystal edge halo, glossy blue dial with scaled railway track
// (5, 10, 20, 25, 35, 40, 50, 55), 3D BGW9 lumicast appliques (12 numeral, 3/6/9
// triangles, circular plots), faceted pencil hands and lollipop seconds hand.
// Furniture is in units of k, the sapphire bezel insert's outer radius; the case is in mm.
// See docs/models/baltic-mk2-39-5.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');
type XY = [number, number];

const xy = ([x, y]: XY) => `${f(x)},${f(y)}`;

/**
 * Case silhouette in millimetres. The 80-tooth bezel crest is the specified 39.5 mm diameter
 * (R = 19.75 mm, k = R / 1.048). Lug openings are an exact 20 mm (x = -10..+10), lug-to-lug is
 * 47.0 mm (y = -23.5..+23.5), and the right flank carries the MK2 flat-top crown guards.
 */
export function mk2395Case(D: number, LL: number, lw: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, u = R / 19.75;
  const k = R / 1.048;
  const ri = .26 * u, seat = k * .955, bow = .42 * u, xTip = slot + 2.22 * u;

  // Outer lug shoulder from the outer tip corner down to the bezel join at y = ±13.65u.
  const lugCurve = (sx: number, sy: number, toJoin: boolean) => {
    const p0: XY = [sx * xTip, sy * (-H + .44 * u)];
    const c1: XY = [sx * (xTip + .38 * u), sy * (-H + 3.1 * u)];
    const c2: XY = [sx * (slot + 3.45 * u), sy * (-17.2 * u)];
    const p1: XY = [sx * (slot + 4.22 * u), sy * (-13.65 * u)];
    return toJoin
      ? `L${xy([sx * slot, sy * (-H + ri)])}Q${xy([sx * slot, sy * -H])} ${xy([sx * (slot + ri), sy * -H])}L${xy([sx * (xTip - ri), sy * (-H + .16 * u)])}Q${xy([sx * xTip, sy * (-H + .16 * u)])} ${xy(p0)}C${xy(c1)} ${xy(c2)} ${xy(p1)}`
      : `C${xy(c2)} ${xy(c1)} ${xy(p0)}Q${xy([sx * xTip, sy * (-H + .16 * u)])} ${xy([sx * (xTip - ri), sy * (-H + .16 * u)])}L${xy([sx * (slot + ri), sy * -H])}Q${xy([sx * slot, sy * -H])} ${xy([sx * slot, sy * (-H + ri)])}L${xy([sx * slot, sy * -seat])}`;
  };

  // Right flank: bezel under-arc into the flat-top crown guards and recessed crown pocket.
  const rMid = k * 1.018;
  const rightFlank =
    `A${f(rMid)},${f(rMid)} 0 0 1 ${xy([18.75 * u, -6.45 * u])}`
    + `L${xy([20.85 * u, -5.65 * u])}Q${xy([21.08 * u, -5.52 * u])} ${xy([21.12 * u, -5.22 * u])}`
    + `L${xy([21.41 * u, -3.55 * u])}Q${xy([21.43 * u, -3.28 * u])} ${xy([21.15 * u, -3.25 * u])}`
    + `L${xy([19.95 * u, -3.15 * u])}V${f(3.15 * u)}`
    + `L${xy([21.15 * u, 3.25 * u])}Q${xy([21.43 * u, 3.28 * u])} ${xy([21.41 * u, 3.55 * u])}`
    + `L${xy([21.12 * u, 5.22 * u])}Q${xy([21.08 * u, 5.52 * u])} ${xy([20.85 * u, 5.65 * u])}`
    + `L${xy([18.75 * u, 6.45 * u])}`
    + `A${f(rMid)},${f(rMid)} 0 0 1 ${xy([slot + 4.22 * u, 13.65 * u])}`;

  const leftFlank = `A${f(rMid)},${f(rMid)} 0 0 1 ${xy([-(slot + 4.22 * u), -13.65 * u])}`;

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
<linearGradient id="${id}mc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(metal, .32)}"/><stop offset=".48" stop-color="${metal}"/><stop offset="1" stop-color="${shade(metal, -.32)}"/></linearGradient>
<linearGradient id="${id}mcy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(metal, -.38)}"/><stop offset=".24" stop-color="${shade(metal, .42)}"/><stop offset=".48" stop-color="${shade(metal, .74)}"/><stop offset=".76" stop-color="${shade(metal, .15)}"/><stop offset="1" stop-color="${shade(metal, -.42)}"/></linearGradient>
<linearGradient id="${id}mlu" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7fafb"/><stop offset=".65" stop-color="${L.lume}"/><stop offset="1" stop-color="${shade(L.lume, -.1)}"/></linearGradient>
<linearGradient id="${id}mbe" x1=".15" y1=".08" x2=".85" y2=".92"><stop stop-color="${shade(L.bezel, .22)}"/><stop offset=".38" stop-color="${L.bezel}"/><stop offset=".75" stop-color="${shade(L.bezel, -.28)}"/><stop offset="1" stop-color="${shade(L.bezel, .08)}"/></linearGradient>
<radialGradient id="${id}mdl" cx=".38" cy=".34" r=".78"><stop stop-color="${shade(L.dial, .14)}"/><stop offset=".42" stop-color="${L.dial}"/><stop offset=".8" stop-color="${shade(L.dial, -.32)}"/><stop offset="1" stop-color="${shade(L.dial, -.54)}"/></radialGradient>
<linearGradient id="${id}mre" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eef3f7"/><stop offset=".35" stop-color="#aeb9c2"/><stop offset=".7" stop-color="#dde4ea"/><stop offset="1" stop-color="#7c8790"/></linearGradient>
<pattern id="${id}mbr" patternUnits="userSpaceOnUse" width=".42" height=".6"><path d="M0,0V.6M.21,0V.6" stroke="#fff" stroke-width=".045" opacity=".13"/><path d="M.1,0V.6M.32,0V.6" stroke="#454c52" stroke-width=".035" opacity=".09"/></pattern>
</defs>`;
}

/** Screw-down crown at 3 o'clock, nestled between the flat-top crown guards. */
function crown(D: number, id: string, metal: string, outline: boolean, stroke: string) {
  const u = D / 39.5;
  const x0 = 19.95 * u, h = 2.98 * u, w = 2.72 * u, barrel = 1.92 * u;
  let s = `<g transform="translate(${f(x0)} 0)">`;
  if (!outline) s += `<rect x="${f(-.35 * u)}" y="${f(-h + .12 * u)}" width="${f(.65 * u)}" height="${f((h - .12 * u) * 2)}" rx=".2" fill="${shade(metal, -.58)}"/>`;
  s += `<path d="M0,${f(-h)}H${f(barrel)}Q${f(w)},${f(-h)} ${f(w)},0Q${f(w)},${f(h)} ${f(barrel)},${f(h)}H0Z" fill="${outline ? 'none' : `url(#${id}mcy)`}" ${stroke}/>`;
  if (!outline) {
    let darks = '', lights = '';
    for (let i = -5; i <= 5; i++) {
      const y = i * .49 * u;
      darks += `M${f(.14 * u)},${f(y)}H${f(barrel - .08 * u)}`;
      lights += `M${f(.16 * u)},${f(y + .15 * u)}H${f(barrel - .12 * u)}`;
    }
    s += `<path d="${darks}" stroke="${shade(metal, -.56)}" stroke-width="${f(.17 * u)}" stroke-linecap="round"/>`;
    s += `<path d="${lights}" stroke="#fff" stroke-width="${f(.08 * u)}" stroke-linecap="round" opacity=".82"/>`;
    s += `<path d="M${f(barrel)},${f(-h + .15 * u)}V${f(h - .15 * u)}" stroke="${shade(metal, -.38)}" stroke-width=".11"/>`;
    s += `<path d="M${f(barrel + .28 * u)},${f(-h * .76)}Q${f(w - .12 * u)},0 ${f(barrel + .28 * u)},${f(h * .76)}" fill="none" stroke="#fff" stroke-width="${f(.26 * u)}" stroke-linecap="round" opacity=".75"/>`;
  }
  return s + '</g>';
}

/**
 * 80-tooth coin-edge bezel with a glossy sapphire insert. The scale has an inverted
 * BGW9 triangle at 12, bold numerals at 15, 30 and 45, full-width bars at the other
 * five-minute marks, and inner-half minute ticks rising from a continuous inner ring.
 */
function bezel(k: number, id: string, L: FullLook) {
  let crests = '', facets = '';
  const teeth = 80, step = 360 / teeth, half = step / 2;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    crests += `M${pt(k * 1.012, a - half)}L${pt(k * 1.046, a - half * .55)}Q${pt(k * 1.05, a)} ${pt(k * 1.046, a + half * .55)}L${pt(k * 1.012, a + half)}Z`;
    facets += `M${pt(k * 1.046, a + half * .45)}L${pt(k * 1.012, a + half)}L${pt(k * 1.022, a + half * .35)}Z`;
  }
  let s = `<circle r="${f(k * 1.028)}" fill="url(#${id}mcy)"/>`;
  s += `<path d="${crests}" fill="${shade(L.caseColor, .42)}" stroke="${shade(L.caseColor, -.28)}" stroke-width=".045"/>`;
  s += `<path d="${facets}" fill="${shade(L.caseColor, -.34)}" opacity=".65"/>`;
  s += `<circle r="${f(k * 1.012)}" fill="none" stroke="#f2f5f7" stroke-width=".15"/>`;
  s += `<circle r="${f(k * 1.001)}" fill="none" stroke="#182334" stroke-width=".12"/>`;
  // Sapphire bezel insert with subtle glass reflection arcs.
  s += `<circle r="${f(k * .998)}" fill="url(#${id}mbe)"/>`;
  const sheen = `M${pt(k * .995, 292)}A${f(k * .995)},${f(k * .995)} 0 0 1 ${pt(k * .995, 348)}L${pt(k * .848, 348)}A${f(k * .848)},${f(k * .848)} 0 0 0 ${pt(k * .848, 292)}Z`;
  s += `<path d="${sheen}" fill="#8ba3c7" opacity=".16"/><path d="${sheen}" transform="rotate(175)" fill="#7d96bc" opacity=".11"/>`;
  s += `<circle r="${f(k * .996)}" fill="none" stroke="#8ea0b8" stroke-width=".07" opacity=".55"/>`;

  const bt = L.bezelText, rIn = k * .854;
  s += `<circle r="${f(rIn)}" fill="none" stroke="${bt}" stroke-width="${f(k * .009)}" opacity=".92"/>`;

  let minor = '', major = '';
  for (let m = 1; m < 60; m++) {
    if (m === 15 || m === 30 || m === 45) continue;
    const a = m * 6;
    if (m % 5 === 0) major += `M${pt(rIn, a)}L${pt(k * .974, a)}`;
    else minor += `M${pt(rIn, a)}L${pt(k * .913, a)}`;
  }
  s += `<path d="${minor}" stroke="${bt}" stroke-width="${f(k * .011)}"/><path d="${major}" stroke="${bt}" stroke-width="${f(k * .02)}"/>`;

  // 12 o'clock inverted BGW9 triangle (no separate pip).
  const tBase = k * .971, tTip = k * .874, tHalf = k * .068;
  s += `<path d="M${f(-tHalf)},${f(-tBase)}H${f(tHalf)}L0,${f(-tTip)}Z" fill="url(#${id}mlu)"${lu('bezel')} stroke="${shade(bt, -.15)}" stroke-width=".04"/>`;

  // Bezel numerals at 15, 30 and 45 only, oriented with tops outward.
  s += `<g fill="${bt}" font-family="'Trebuchet MS',Arial,Helvetica,sans-serif" font-size="${f(k * .118)}" font-weight="700" text-anchor="middle" dominant-baseline="central">`;
  for (const v of [15, 30, 45]) {
    const a = v * 6, [x, y] = P(k * .918, a);
    s += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${a} ${f(x)} ${f(y)}) translate(${f(x)} ${f(y)}) scale(1.08 .92) translate(${f(-x)} ${f(-y)})">${v}</text>`;
  }
  return s + '</g>';
}

/**
 * Polished steel bezel inner lip, double-domed sapphire crystal edge refraction ring,
 * and the dial's scaled railway minute track with 5-minute numerals.
 */
function crystalAndRailway(k: number, id: string, L: FullLook) {
  // Steel bezel inner lip (0.826k..0.848k) and domed sapphire optical halo (0.768k..0.826k).
  let s = `<circle r="${f(k * .837)}" fill="none" stroke="url(#${id}mre)" stroke-width="${f(k * .022)}"/>`;
  s += `<circle r="${f(k * .847)}" fill="none" stroke="#dce3ea" stroke-width=".09"/>`;
  s += `<circle r="${f(k * .802)}" fill="none" stroke="#c8d2dc" stroke-width="${f(k * .046)}" opacity=".88"/>`;
  s += `<circle r="${f(k * .798)}" fill="none" stroke="#f7f9fb" stroke-width="${f(k * .014)}" opacity=".9"/>`;
  s += `<circle r="${f(k * .772)}" fill="none" stroke="#182a40" stroke-width="${f(k * .014)}" opacity=".75"/>`;

  // Scaled railway track on the glossy blue dial.
  const ink = L.bezelText, rTrack = k * .738, rOuter = k * .765, rInner = k * .678;
  s += `<circle r="${f(rTrack)}" fill="none" stroke="${ink}" stroke-width="${f(k * .0085)}" opacity=".92"/>`;

  let ticks = '', bridges = '';
  for (let m = 0; m < 60; m++) {
    const a = m * 6;
    if (m % 5 === 0) {
      bridges += `M${pt(rTrack, a)}L${pt(rOuter, a)}`;
      if (m === 0) ticks += `M${pt(rTrack, 0)}L${pt(rInner, 0)}`;
      else if (m % 15 === 0) bridges += `M${pt(rTrack, a)}L${pt(k * .616, a)}`;
    } else {
      ticks += `M${pt(rTrack, a)}L${pt(rInner, a)}`;
    }
  }
  s += `<path d="${ticks}" stroke="${ink}" stroke-width="${f(k * .0075)}" opacity=".88"/>`;
  s += `<path d="${bridges}" stroke="${ink}" stroke-width="${f(k * .0105)}" opacity=".95"/>`;

  // Railway 5-minute numerals: upright in both top and bottom halves of the dial.
  s += `<g fill="${ink}" font-family="'Trebuchet MS',Arial,Helvetica,sans-serif" font-size="${f(k * .048)}" font-weight="600" text-anchor="middle" dominant-baseline="central" opacity=".92">`;
  for (const m of [5, 10, 20, 25, 35, 40, 50, 55]) {
    const a = m * 6, rot = m >= 20 && m <= 40 ? a - 180 : a;
    const [x, y] = P(k * .684, a);
    s += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${rot} ${f(x)} ${f(y)})">${m}</text>`;
  }
  return s + '</g>';
}

/**
 * 3D BGW9 lumicast appliques ("super indexes"): applied geometric 12 at 12 o'clock,
 * elongated shark-tooth triangles at 3, 6 and 9, and large circular plots at the other hours.
 */
function markers(k: number, id: string) {
  let shadow = '', rim = '', lume = '';

  // 8 circular lumicast plots at 1, 2, 4, 5, 7, 8, 10, 11.
  const rPlot = k * .556, ro = k * .053, ri = k * .045;
  for (const h of [1, 2, 4, 5, 7, 8, 10, 11]) {
    const [x, y] = P(rPlot, h * 30);
    shadow += `M${f(x - ro)},${f(y)}a${f(ro)},${f(ro)} 0 1 0 ${f(2 * ro)},0a${f(ro)},${f(ro)} 0 1 0 ${f(-2 * ro)},0`;
    rim += `M${f(x - ro)},${f(y)}a${f(ro)},${f(ro)} 0 1 0 ${f(2 * ro)},0a${f(ro)},${f(ro)} 0 1 0 ${f(-2 * ro)},0`;
    lume += `M${f(x - ri)},${f(y)}a${f(ri)},${f(ri)} 0 1 0 ${f(2 * ri)},0a${f(ri)},${f(ri)} 0 1 0 ${f(-2 * ri)},0`;
  }

  // Rounded shark-tooth triangles at 3, 6 and 9.
  const tri = (inset: number) => {
    const top = -k * (.614 - inset * .9), tip = -k * (.414 + inset * 1.7), hw = k * (.066 - inset), cr = k * .009;
    return `M${f(-hw + cr)},${f(top)}H${f(hw - cr)}Q${f(hw)},${f(top)} ${f(hw - cr * .35)},${f(top + cr)}L${f(cr * .35)},${f(tip - cr)}Q0,${f(tip)} ${f(-cr * .35)},${f(tip - cr)}L${f(-hw + cr * .35)},${f(top + cr)}Q${f(-hw)},${f(top)} ${f(-hw + cr)},${f(top)}Z`;
  };
  const triOuter = tri(0), triInner = tri(.0075);
  let triShadow = '', triRim = '', triLume = '';
  for (const a of [90, 180, 270]) {
    const t = ` transform="rotate(${a})"`;
    triShadow += `<path d="${triOuter}"${t}/>`;
    triRim += `<path d="${triOuter}"${t}/>`;
    triLume += `<path d="${triInner}"${t}/>`;
  }

  // Applied 12 o'clock numeral: geometric '1' bar and arched/diagonal '2'.
  const one = (m: number) => {
    const x0 = -k * (.061 - m), x1 = -k * (.031 + m), y0 = -k * (.598 - m), y1 = -k * (.448 + m);
    return `M${f(x0)},${f(y0)}H${f(x1)}V${f(y1)}H${f(x0)}Z`;
  };
  const two = (m: number) => {
    const Lx = -k * (.020 - m), Rx = k * (.072 - m), mid = (Lx + Rx) / 2;
    const top = -k * (.599 - m), bot = -k * (.448 + m), w = k * (.029 - 2 * m);
    const barTop = bot - w, archY = -k * (.554), inTop = top + w;
    return `M${f(Lx)},${f(-k * .562 - m * .4)}`
      + `C${f(Lx)},${f(top)} ${f(mid - k * .022)},${f(top)} ${f(mid)},${f(top)}`
      + `C${f(mid + k * .026)},${f(top)} ${f(Rx)},${f(top + k * .01)} ${f(Rx)},${f(archY)}`
      + `C${f(Rx)},${f(-k * .534)} ${f(Rx - k * .014)},${f(-k * .516)} ${f(Lx + w * 1.05)},${f(barTop)}`
      + `H${f(Rx)}V${f(bot)}H${f(Lx)}V${f(barTop - k * .012)}`
      + `L${f(Rx - w * 1.05)},${f(-k * .542)}`
      + `C${f(Rx - w)},${f(-k * .562)} ${f(mid + k * .014)},${f(inTop)} ${f(mid)},${f(inTop)}`
      + `C${f(mid - k * .014)},${f(inTop)} ${f(Lx + w)},${f(-k * .566)} ${f(Lx + w)},${f(-k * .562 - m * .4)}Z`;
  };
  const d12Outer = `${one(0)} ${two(0)}`, d12Inner = `${one(.005)} ${two(.005)}`;

  return `<g fill="#010913" opacity=".38" transform="translate(.09 .14)"><path d="${shadow} ${d12Outer}"/>${triShadow}</g>`
    + `<g fill="#b5c2cc" stroke="#dce4ea" stroke-width=".04"><path d="${rim} ${d12Outer}"/>${triRim}</g>`
    + `<g fill="url(#${id}mlu)"${lu('indices')}><path d="${lume} ${d12Inner}"/>${triLume}</g>`;
}

/** Dial printing: wide-tracked geometric BALTIC wordmark above and AQUASCAPHE / 200M below. */
function printing(k: number, L: FullLook, brand: string) {
  const ink = L.bezelText;
  const label = (brand || 'BALTIC').toUpperCase();
  return `<g fill="${ink}" font-family="'Gill Sans','Trebuchet MS',Arial,sans-serif" text-anchor="middle">`
    + `<text y="${f(-k * .242)}" font-size="${f(k * .073)}" font-weight="400" letter-spacing="${f(k * .022)}" textLength="${f(k * .348)}" lengthAdjust="spacingAndGlyphs">${esc(label)}</text>`
    + `<text y="${f(k * .239)}" font-size="${f(k * .040)}" font-weight="600" letter-spacing="${f(k * .008)}" textLength="${f(k * .332)}" lengthAdjust="spacingAndGlyphs">AQUASCAPHE</text>`
    + `<text y="${f(k * .291)}" font-size="${f(k * .042)}" font-weight="600" letter-spacing="${f(k * .007)}" textLength="${f(k * .138)}" lengthAdjust="spacingAndGlyphs">200M</text>`
    + `</g>`;
}

/**
 * Faceted pencil/sword hour and minute hands with a circular pivot collar and separate BGW9
 * lume inserts, paired with the lollipop seconds hand. Pose matches the reference photo.
 */
function hands(k: number, id: string, L: FullLook) {
  const brushed = shade(L.handColor, -.22), polished = shade(L.handColor, .1);
  const hw = k * .092, mw = k * .074;

  // Hour hand: narrow neck above the pivot collar, smoothly rounded base shoulders, and a bullet-arched pencil tip.
  const hour = `M${f(-hw * .23)},0V${f(-k * .076)}C${f(-hw * .23)},${f(-k * .095)} ${f(-hw / 2)},${f(-k * .102)} ${f(-hw / 2)},${f(-k * .148)}V${f(-k * .382)}C${f(-hw / 2)},${f(-k * .445)} ${f(-hw * .22)},${f(-k * .478)} 0,${f(-k * .478)}C${f(hw * .22)},${f(-k * .478)} ${f(hw / 2)},${f(-k * .445)} ${f(hw / 2)},${f(-k * .382)}V${f(-k * .148)}C${f(hw / 2)},${f(-k * .102)} ${f(hw * .23)},${f(-k * .095)} ${f(hw * .23)},${f(-k * .076)}V0Z`;
  const hourFace = `M0,${f(-k * .478)}C${f(hw * .22)},${f(-k * .478)} ${f(hw / 2)},${f(-k * .445)} ${f(hw / 2)},${f(-k * .382)}V${f(-k * .148)}C${f(hw / 2)},${f(-k * .102)} ${f(hw * .23)},${f(-k * .095)} ${f(hw * .23)},${f(-k * .076)}V0H0Z`;
  const hl = hw * .305, hr = hl * .55;
  const hourLume = `M${f(-hl + hr)},${f(-k * .118)}H${f(hl - hr)}Q${f(hl)},${f(-k * .118)} ${f(hl)},${f(-k * .118 - hr)}V${f(-k * .382)}C${f(hl)},${f(-k * .424)} ${f(hl * .42)},${f(-k * .446)} 0,${f(-k * .446)}C${f(-hl * .42)},${f(-k * .446)} ${f(-hl)},${f(-k * .424)} ${f(-hl)},${f(-k * .382)}V${f(-k * .118 - hr)}Q${f(-hl)},${f(-k * .118)} ${f(-hl + hr)},${f(-k * .118)}Z`;

  // Minute hand: longer metal root before the BGW9 lume insert, with smoothly rounded shoulders and bullet-arched pencil tip.
  const minute = `M${f(-mw * .25)},0V${f(-k * .074)}C${f(-mw * .25)},${f(-k * .094)} ${f(-mw / 2)},${f(-k * .102)} ${f(-mw / 2)},${f(-k * .144)}V${f(-k * .598)}C${f(-mw / 2)},${f(-k * .662)} ${f(-mw * .22)},${f(-k * .698)} 0,${f(-k * .698)}C${f(mw * .22)},${f(-k * .698)} ${f(mw / 2)},${f(-k * .662)} ${f(mw / 2)},${f(-k * .598)}V${f(-k * .144)}C${f(mw / 2)},${f(-k * .102)} ${f(mw * .25)},${f(-k * .094)} ${f(mw * .25)},${f(-k * .074)}V0Z`;
  const minuteFace = `M0,${f(-k * .698)}C${f(mw * .22)},${f(-k * .698)} ${f(mw / 2)},${f(-k * .662)} ${f(mw / 2)},${f(-k * .598)}V${f(-k * .144)}C${f(mw / 2)},${f(-k * .102)} ${f(mw * .25)},${f(-k * .094)} ${f(mw * .25)},${f(-k * .074)}V0H0Z`;
  const ml = mw * .29, mr = ml * .55;
  const minuteLume = `M${f(-ml + mr)},${f(-k * .206)}H${f(ml - mr)}Q${f(ml)},${f(-k * .206)} ${f(ml)},${f(-k * .206 - mr)}V${f(-k * .598)}C${f(ml)},${f(-k * .640)} ${f(ml * .42)},${f(-k * .660)} 0,${f(-k * .660)}C${f(-ml * .42)},${f(-k * .660)} ${f(-ml)},${f(-k * .640)} ${f(-ml)},${f(-k * .598)}V${f(-k * .206 - mr)}Q${f(-ml)},${f(-k * .206)} ${f(-ml + mr)},${f(-k * .206)}Z`;

  const ha = 303.5, ma = 48, sa = 223;
  let s = `<g fill="#000b16" opacity=".34" transform="translate(.15 .22)"><circle r="${f(k * .068)}"/><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/><path d="M-.07,${f(k * .198)}H.07L.035,${f(-k * .725)}H-.035Z" ${handRole('second')}transform="rotate(${sa})"/><circle cy="${f(-k * .433)}" r="${f(k * .046)}" ${handRole('second')}transform="rotate(${sa})"/></g>`;

  // Circular hand hub collar around the pivot.
  s += `<circle r="${f(k * .068)}" fill="${brushed}" stroke="${polished}" stroke-width=".06"/>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hour}" fill="${brushed}" stroke="#eef2f5" stroke-width=".055"/><path d="${hourFace}" fill="${polished}"/><path d="${hourLume}" fill="url(#${id}mlu)"${lu('hands')} stroke="#b8c2ca" stroke-width=".045"/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minute}" fill="${brushed}" stroke="#eef2f5" stroke-width=".055"/><path d="${minuteFace}" fill="${polished}"/><path d="${minuteLume}" fill="url(#${id}mlu)"${lu('hands')} stroke="#b8c2ca" stroke-width=".045"/></g>`;

  // Lollipop seconds hand with tapered counterweight tail and lumed plot at 0.433k.
  const secColor = L.accent || L.handColor;
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="M-.085,${f(k * .198)}H.085L.032,${f(-k * .725)}H-.032Z" fill="${secColor}" stroke="#eef2f5" stroke-width=".03"/>`
    + `<circle cy="${f(-k * .433)}" r="${f(k * .045)}" fill="${secColor}" stroke="#eef2f5" stroke-width=".05"/>`
    + `<circle cy="${f(-k * .433)}" r="${f(k * .033)}" fill="${L.secondsDot || `url(#${id}mlu)`}"${lu('seconds')}/></g>`;

  return s + `<circle r="${f(k * .038)}" fill="${polished}" stroke="#98a2aa" stroke-width=".06"/><circle r="${f(k * .016)}" fill="#2b333a"/>`;
}

export interface MK2395Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap for the Baltic Aquascaphe MK2 39.5. */
export function mk2395SVG(o: MK2395Options) {
  const { D, LL, lw, id, L, outline } = o;
  const metal = L.caseColor;
  const { d, k } = mk2395Case(D, LL, lw);
  let s = outline ? '' : defs(id, L, metal);
  s += crown(D, id, metal, outline, o.stroke);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}mc)`}" ${outline ? o.stroke : `stroke="${shade(metal, -.3)}" stroke-width=".12"`}/>`;
  if (outline) {
    return s + `<circle r="${f(k * 1.048)}" fill="none" ${o.stroke}/><circle r="${f(k * .766)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  }

  // Vertical brushing on the lugs, narrow outer lug-flank chamfers, and polished flat-top crown guard bevels.
  const u = D / 39.5, slot = lw / 2, H = LL / 2, xTip = slot + 2.22 * u;
  const lugChamfer = `M${f(xTip - .08 * u)},${f(-H + .42 * u)}C${f(xTip + .35 * u)},${f(-H + 3.1 * u)} ${f(slot + 3.4 * u)},${f(-17.2 * u)} ${f(slot + 4.18 * u)},${f(-13.7 * u)}L${f(slot + 3.65 * u)},${f(-14.1 * u)}C${f(slot + 2.95 * u)},${f(-17.3 * u)} ${f(xTip - .25 * u)},${f(-H + 3.1 * u)} ${f(xTip - .55 * u)},${f(-H + .2 * u)}Z`;
  const guardTop = `M${f(19.35 * u)},${f(-6.05 * u)}L${f(20.45 * u)},${f(-5.45 * u)}L${f(20.68 * u)},${f(-3.3 * u)}H${f(19.75 * u)}Z`;
  let facets = '';
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    facets += `<path d="${lugChamfer}" transform="scale(${sx} ${sy})" fill="${shade(metal, sx < 0 ? -.15 : .28)}"/>`;
  }
  for (const sy of [-1, 1]) {
    facets += `<path d="${guardTop}" transform="scale(1 ${sy})" fill="url(#${id}mcy)" opacity=".85"/>`;
  }
  s += `<defs><clipPath id="${id}mcc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}mcc)">${facets}<path d="${d}" fill="url(#${id}mbr)"/><path d="${d}" fill="none" stroke="${shade(metal, -.32)}" stroke-width=".38"/><path d="${d}" fill="none" stroke="${shade(metal, .58)}" stroke-width=".15"/></g>`;

  s += bezel(k, id, L);
  s += `<circle r="${f(k * .767)}" fill="url(#${id}mdl)"/>`;
  s += crystalAndRailway(k, id, L);
  s += markers(k, id);
  if (L.date === '6') {
    const dy = k * .535, w = k * .135, h = k * .102;
    s += `<rect x="${f(-w / 2 - k * .01)}" y="${f(dy - h / 2 - k * .01)}" width="${f(w + k * .02)}" height="${f(h + k * .02)}" rx=".1" fill="${shade(L.dial, -.35)}" stroke="#7e94aa" stroke-width=".05"/>`;
    s += `<rect x="${f(-w / 2)}" y="${f(dy - h / 2)}" width="${f(w)}" height="${f(h)}" rx=".05" fill="${shade(L.dial, -.18)}"/>`;
    s += `<text x="0" y="${f(dy)}" font-family="'Trebuchet MS',Arial,sans-serif" font-size="${f(k * .082)}" font-weight="600" text-anchor="middle" dominant-baseline="central" fill="${L.bezelText}">6</text>`;
  }
  s += printing(k, L, o.brand);
  s += hands(k, id, L);

  // Restrained double-domed sapphire crystal highlight.
  s += `<path d="M${f(-k * .56)},${f(-k * .18)}A${f(k * .72)},${f(k * .72)} 0 0 1 ${f(k * .2)},${f(-k * .56)}A${f(k * .94)},${f(k * .94)} 0 0 0 ${f(-k * .56)},${f(-k * .18)}Z" fill="#fff" opacity=".065"/>`;
  return s;
}
