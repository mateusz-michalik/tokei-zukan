import type { FullLook } from '../catalog/schema';
import { esc, shade } from '../lib/util';
import { P } from './geom';
import { spb519Case } from './spb519';
import { lu } from './night';
import { handRole } from './hands';

// Seiko Black Series 1968 diver (SPB255): rounded 1968 case with broad lug chamfers,
// 4 o'clock crown, 60-tooth bezel with orange 0–20 sector (both 10 and 20 orange),
// circular plots, divided 12 shield, date at 3 with outboard lume plot, orange minute
// hand and red-dot paddle seconds hand. Furniture is in units of k, the bezel insert's
// outer radius; the case is in millimetres. See docs/models/seiko-spb255.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');

/** 1968 rounded-shoulder silhouette with open 20 mm lug slots. */
export const spb255Case = spb519Case;

function rrect(x: number, y: number, w: number, h: number, r: number) {
  const x2 = x + w, y2 = y + h, rr = Math.min(r, w / 2, h / 2);
  return `M${f(x + rr)},${f(y)}H${f(x2 - rr)}Q${f(x2)},${f(y)} ${f(x2)},${f(y + rr)}V${f(y2 - rr)}Q${f(x2)},${f(y2)} ${f(x2 - rr)},${f(y2)}H${f(x + rr)}Q${f(x)},${f(y2)} ${f(x)},${f(y2 - rr)}V${f(y + rr)}Q${f(x)},${f(y)} ${f(x + rr)},${f(y)}Z`;
}

function defs(id: string, L: FullLook, metal: string) {
  return `<defs>
<linearGradient id="${id}cs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(metal, .16)}"/><stop offset=".42" stop-color="${metal}"/><stop offset="1" stop-color="${shade(metal, -.42)}"/></linearGradient>
<linearGradient id="${id}cy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(metal, -.18)}"/><stop offset=".32" stop-color="${shade(metal, .38)}"/><stop offset=".5" stop-color="${shade(metal, .58)}"/><stop offset="1" stop-color="${shade(metal, -.46)}"/></linearGradient>
<linearGradient id="${id}lu" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(L.lume, .1)}"/><stop offset="1" stop-color="${shade(L.lume, -.12)}"/></linearGradient>
<radialGradient id="${id}dl" cx=".44" cy=".38" r=".82"><stop stop-color="${shade(L.dial, .05)}"/><stop offset=".62" stop-color="${L.dial}"/><stop offset="1" stop-color="${shade(L.dial, -.45)}"/></radialGradient>
<linearGradient id="${id}be" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="${shade(L.bezel, .13)}"/><stop offset=".6" stop-color="${L.bezel}"/><stop offset="1" stop-color="${shade(L.bezel, -.35)}"/></linearGradient>
<linearGradient id="${id}re" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#484e50"/><stop offset=".35" stop-color="#222628"/><stop offset=".7" stop-color="#6c7476"/><stop offset="1" stop-color="#c2c8c6"/></linearGradient>
<pattern id="${id}br" patternUnits="userSpaceOnUse" width=".55" height=".55" patternTransform="rotate(28)"><path d="M0,0V.55M.28,0V.55" stroke="#fff" stroke-width=".04" opacity=".055"/></pattern>
</defs>`;
}

/** Screw-down knurled crown at 4 o'clock, seated beneath the case flank. */
function crown(R: number, id: string, L: FullLook, outline: boolean, stroke: string) {
  const angle = ({ 3: 0, 4: 28, 9: -90 } as Record<string, number>)[L.crown] ?? 28;
  const h = 3.25, proud = 3.55, metal = L.caseColor;
  let s = `<g transform="rotate(${angle}) translate(${f(R - .35)} 0)">`;
  if (!outline) s += `<rect x="-.65" y="${f(-h + .15)}" width="1.3" height="${f((h - .15) * 2)}" rx=".4" fill="${shade(metal, -.58)}"/>`;
  s += `<path d="M0,${-h}H${f(proud - 1.1)}Q${proud},${-h} ${proud},0Q${proud},${h} ${f(proud - 1.1)},${h}H0Z" fill="${outline ? 'none' : `url(#${id}cy)`}" ${stroke}/>`;
  if (!outline) {
    let grooves = '', lights = '';
    for (let i = -8; i <= 8; i++) {
      grooves += `M.2,${f(i * .35)}H${f(proud - 1.2)}`;
      lights += `M.24,${f(i * .35 + .11)}H${f(proud - 1.25)}`;
    }
    s += `<path d="${grooves}" stroke="${shade(metal, -.65)}" stroke-width=".11"/><path d="${lights}" stroke="#e2e6e8" stroke-width=".05" opacity=".75"/>`;
    s += `<path d="M${f(proud - .14)},${f(-h + .38)}Q${f(proud)},0 ${f(proud - .14)},${f(h - .38)}" fill="none" stroke="#fff" stroke-width=".22" opacity=".5"/>`;
  }
  return s + '</g>';
}

/**
 * Dark-coated 60-tooth 1968 bezel. On the SPB255 the orange sector runs all the way
 * through 20 minutes: triangle, dots 1–19, five-minute bars at 5 and 15, and both 10 and 20.
 */
function bezel(k: number, id: string, L: FullLook) {
  const orange = L.minuteLume || '#F4A12A', bt = L.bezelText;
  let crests = '', facets = '';
  const teeth = 60, step = 360 / teeth, half = step / 2;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    crests += `M${pt(k * .995, a - half)}Q${pt(k * 1.044, a - half * .75)} ${pt(k * 1.044, a - half * .45)}L${pt(k * 1.044, a + half * .45)}Q${pt(k * 1.044, a + half * .75)} ${pt(k * .995, a + half)}Z`;
    facets += `M${pt(k * 1.04, a)}L${pt(k * 1.044, a + half * .45)}L${pt(k * .995, a + half)}L${pt(k * 1.015, a + half * .4)}Z`;
  }
  let s = `<circle r="${f(k * 1.02)}" fill="${shade(L.caseColor, -.28)}"/>`;
  s += `<path d="${crests}" fill="${shade(L.caseColor, .2)}" stroke="${shade(L.caseColor, -.18)}" stroke-width=".045"/>`;
  s += `<path d="${facets}" fill="#17191c" opacity=".72"/>`;
  s += `<circle r="${f(k * 1.006)}" fill="none" stroke="${shade(L.caseColor, .34)}" stroke-width=".11"/>`;
  s += `<circle r="${f(k * .998)}" fill="url(#${id}be)"/>`;
  s += `<circle r="${f(k * .998)}" fill="none" stroke="#858b8f" stroke-width=".08"/>`;
  let dots = '', orangeDots = '', bars = '', orangeBars = '';
  for (let m = 1; m < 60; m++) {
    if (m % 10 === 0) continue;
    const a = m * 6;
    if (m % 5 === 0) {
      const d = `M${pt(k * .972, a)}L${pt(k * .835, a)}`;
      if (m < 20) orangeBars += d; else bars += d;
    } else {
      const [x, y] = P(k * .868, a), r = k * .0135;
      const d = `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;
      if (m < 20) orangeDots += d; else dots += d;
    }
  }
  s += `<path d="${dots}" fill="${bt}"/><path d="${orangeDots}" fill="${orange}"/><path d="${bars}" stroke="${bt}" stroke-width="${f(k * .028)}"/><path d="${orangeBars}" stroke="${orange}" stroke-width="${f(k * .028)}"/>`;
  const base = k * .986, tip = k * .826, th = k * .118;
  s += `<path d="M${f(-th)},${f(-base)}H${f(th)}L0,${f(-tip)}Z" fill="${orange}"/>`;
  s += `<circle cy="${f(-k * .93)}" r="${f(k * .033)}" fill="${L.lume}"${lu('bezel')} stroke="${shade(orange, -.35)}" stroke-width=".08"/>`;
  s += `<g font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .172)}" font-weight="400" text-anchor="middle" dominant-baseline="central">`;
  for (const v of [10, 20, 30, 40, 50]) {
    const a = v * 6, [x, y] = P(k * .9, a);
    const fill = v <= 20 ? orange : bt;
    s += `<text x="${f(x)}" y="${f(y)}" fill="${fill}" transform="rotate(${a} ${f(x)} ${f(y)}) translate(${f(x)} ${f(y)}) scale(1.08 .86) translate(${f(-x)} ${f(-y)})">${v}</text>`;
  }
  return s + '</g>';
}

/** Narrow metallic crystal seat and printed minute track on the outer dial. */
function chapter(k: number, id: string) {
  let minor = '', major = '';
  for (let i = 1; i < 60; i++) {
    const a = i * 6;
    if (i % 5) minor += `M${pt(k * .752, a)}L${pt(k * .706, a)}`;
    else major += `M${pt(k * .755, a)}L${pt(k * .692, a)}`;
  }
  const y0 = -k * .755, y1 = -k * .688;
  return `<circle r="${f(k * .784)}" fill="none" stroke="url(#${id}re)" stroke-width="${f(k * .026)}"/>`
    + `<circle r="${f(k * .796)}" fill="none" stroke="#cfd5d8" stroke-width=".09"/>`
    + `<circle r="${f(k * .771)}" fill="none" stroke="#262a2e" stroke-width=".1"/>`
    + `<path d="${minor}" stroke="#d6dad5" stroke-width="${f(k * .008)}"/>`
    + `<path d="${major}" stroke="#f2f4f0" stroke-width="${f(k * .017)}"/>`
    + `<rect x="${f(-k * .017)}" y="${f(y0)}" width="${f(k * .034)}" height="${f(y1 - y0)}" rx=".03" fill="#f2f4f0"/>`;
}

/** Circular plots, batons at 6 and 9, divided shield at 12, and a short lume plot beyond the date at 3. */
function markers(k: number, id: string) {
  let shadow = '', metal = '', lume = '';
  for (const h of [1, 2, 4, 5, 7, 8, 10, 11]) {
    const [x, y] = P(k * .568, h * 30), r = k * .06;
    shadow += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
    metal += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
    lume += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r - k * .012)}"/>`;
  }
  const addBar = (a: number, w: number, outer: number, inner: number, r = k * .008) => {
    const x = -w / 2, y = -outer, h = outer - inner, t = ` transform="rotate(${a})"`, m = k * .012;
    const d = rrect(x, y, w, h, r);
    shadow += `<path d="${d}"${t}/>`;
    metal += `<path d="${d}"${t}/>`;
    lume += `<path d="${rrect(x + m, y + m, w - 2 * m, h - 2 * m, r * .65)}"${t}/>`;
  };
  addBar(270, k * .11, k * .655, k * .465);
  addBar(180, k * .102, k * .655, k * .455);
  // Short framed lume plot outboard of the 3 o'clock date aperture.
  addBar(90, k * .084, k * .722, k * .676, k * .006);
  // 12 o'clock divided shield.
  const shield = `M${f(-k * .076)},${f(-k * .65)}H${f(k * .076)}L${f(k * .07)},${f(-k * .475)}L0,${f(-k * .43)}L${f(-k * .07)},${f(-k * .475)}Z`;
  const shieldLume = `M${f(-k * .058)},${f(-k * .63)}H${f(k * .058)}L${f(k * .053)},${f(-k * .486)}L0,${f(-k * .454)}L${f(-k * .053)},${f(-k * .486)}Z`;
  shadow += `<path d="${shield}"/>`;
  metal += `<path d="${shield}"/>`;
  lume += `<path d="${shieldLume}"/>`;
  return `<g fill="#000" opacity=".28" transform="translate(.08 .12)">${shadow}</g>`
    + `<g fill="#7c8480" stroke="#cfd5d0" stroke-width=".055">${metal}</g>`
    + `<g fill="url(#${id}lu)"${lu('indices')} stroke="#c7c1ae" stroke-width=".04">${lume}</g>`
    + `<path d="M0,${f(-k * .638)}V${f(-k * .446)}" stroke="#98a09c" stroke-width="${f(k * .01)}"/>`;
}

/**
 * 1968 handset in Black Series livery: broad split-finish hour hand with a divided tip lume,
 * bright orange minute blade over a dark metal base, and a seconds needle with a red-dot lume paddle.
 */
function hands(k: number, id: string, L: FullLook) {
  const hw = k * .108, mw = k * .066;
  const orange = L.minuteLume || '#F4A12A';
  const brushed = shade(L.handColor, -.28), polished = L.handColor;
  const hour = `M${f(-hw * .43)},${f(k * .02)}L${f(-hw / 2)},${f(-k * .37)}L0,${f(-k * .455)}L${f(hw / 2)},${f(-k * .37)}L${f(hw * .43)},${f(k * .02)}Z`;
  const hourTail = `M${f(-hw * .46)},0V${f(k * .138)}L0,${f(k * .158)}L${f(hw * .46)},${f(k * .138)}V0Z`;
  const hourFace = `M0,${f(-k * .455)}L${f(hw / 2)},${f(-k * .37)}L${f(hw * .43)},${f(k * .02)}H0Z M0,0H${f(hw * .46)}V${f(k * .138)}L0,${f(k * .158)}Z`;
  const hourLume = `M${f(-hw * .31)},${f(-k * .155)}V${f(-k * .368)}L0,${f(-k * .42)}L${f(hw * .31)},${f(-k * .368)}V${f(-k * .155)}Z`;

  const minute = `M${f(-mw * .45)},${f(k * .02)}L${f(-mw / 2)},${f(-k * .585)}L0,${f(-k * .67)}L${f(mw / 2)},${f(-k * .585)}L${f(mw * .45)},${f(k * .02)}Z`;
  const minuteTail = `M${f(-mw * .5)},0V${f(k * .145)}H${f(mw * .5)}V0Z`;
  const minuteFace = `M0,${f(-k * .67)}L${f(mw / 2)},${f(-k * .585)}L${f(mw * .45)},${f(k * .02)}H0Z M0,0H${f(mw * .5)}V${f(k * .145)}H0Z`;
  const minuteLume = `M${f(-mw * .35)},${f(-k * .13)}V${f(-k * .58)}L0,${f(-k * .635)}L${f(mw * .35)},${f(-k * .58)}V${f(-k * .13)}Z`;

  const ha = 304, ma = 52, sa = 256;
  let s = `<g fill="#000" opacity=".28" transform="translate(.16 .22)"><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${hourTail}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/><path d="${minuteTail}" ${handRole('minute')}transform="rotate(${ma})"/></g>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hourTail}" fill="${brushed}"/><path d="${hour}" fill="${brushed}" stroke="#959c98" stroke-width=".06"/><path d="${hourFace}" fill="${polished}"/><path d="${hourLume}" fill="url(#${id}lu)"${lu('hands')} stroke="#8c9288" stroke-width=".05"/><path d="M${f(-hw * .32)},${f(-k * .355)}H${f(hw * .32)}" stroke="${polished}" stroke-width="${f(k * .009)}"/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minuteTail}" fill="${brushed}"/><path d="${minute}" fill="${brushed}" stroke="#959c98" stroke-width=".06"/><path d="${minuteFace}" fill="${polished}"/><path d="${minuteLume}" fill="${orange}" stroke="#8c9288" stroke-width=".05"/></g>`;

  // Seconds: dark needle with a framed paddle holding an inner red-orange dot and outer cream lume.
  const capY = -k * .60, capH = k * .152, cw = k * .028;
  const dotColor = L.secondsDot || '#E85A34';
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="M-.055,${f(k * .175)}H.055L.035,${f(-k * .695)}H-.035Z" fill="${L.handColor}"/>`
    + `<path d="${rrect(-cw, capY, cw * 2, capH, cw * .36)}" fill="${L.handColor}" stroke="#8c9490" stroke-width=".05"/>`
    + `<path d="${rrect(-cw * .64, capY + k * .012, cw * 1.28, k * .064, cw * .22)}" fill="${L.lume}"${lu('seconds')}/>`
    + `<circle cy="${f(-k * .485)}" r="${f(k * .021)}" fill="${dotColor}" stroke="#f2eee0" stroke-width=".035"/></g>`;
  return s + `<circle r="${f(k * .029)}" fill="${L.handColor}" stroke="#88908a" stroke-width=".06"/><circle r="${f(k * .011)}" fill="#525a58"/>`;
}

export interface SPB255Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap for the Black Series 1968 diver. */
export function spb255SVG(o: SPB255Options) {
  const { D, LL, lw, id, L, outline } = o;
  const metal = L.caseColor;
  const { d, k } = spb255Case(D, LL, lw);
  let s = outline ? '' : defs(id, L, metal);
  // Seat the 4 o'clock crown beneath the case so the case flank masks its root.
  s += crown(D / 2, id, L, outline, o.stroke);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}cs)`}" ${outline ? o.stroke : `stroke="${shade(metal, .45)}" stroke-width=".13"`}/>`;
  if (outline) {
    return s + `<circle r="${f(k * 1.044)}" fill="none" ${o.stroke}/><circle r="${f(k * .77)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  }
  const u = D / 42, slot = lw / 2, H = LL / 2, R = D / 2;
  const facet = `M${f(slot + .1 * u)},${f(-H + .1 * u)}C${f(slot + 2.7 * u)},${f(-H + 1.1 * u)} ${f(slot + 4.2 * u)},${f(-H + 2 * u)} ${f(slot + 5 * u)},${f(-H + 4 * u)}L${f(R * .94)},${f(-R * .34)}L${f(R * .84)},${f(-R * .49)}C${f(slot + 4 * u)},${f(-H + 4.7 * u)} ${f(slot + 2.7 * u)},${f(-H + 2 * u)} ${f(slot + .1 * u)},${f(-H + .95 * u)}Z`;
  const facetEdge = `M${f(slot + .1 * u)},${f(-H + .95 * u)}C${f(slot + 2.7 * u)},${f(-H + 2 * u)} ${f(slot + 4 * u)},${f(-H + 4.7 * u)} ${f(R * .84)},${f(-R * .49)}`;
  let bevels = '';
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    bevels += `<path d="${facet}" transform="scale(${sx} ${sy})" fill="${shade(metal, sx < 0 ? -.26 : .05)}"/>`;
    bevels += `<path d="${facetEdge}" transform="scale(${sx} ${sy})" fill="none" stroke="${shade(metal, .42)}" stroke-width=".13" opacity=".75"/>`;
  }
  s += `<defs><clipPath id="${id}cc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}cc)">${bevels}<path d="${d}" fill="url(#${id}br)"/><path d="${d}" fill="none" stroke="${shade(metal, -.45)}" stroke-width=".36"/><path d="${d}" fill="none" stroke="${shade(metal, .52)}" stroke-width=".13"/></g>`;
  s += bezel(k, id, L);
  s += `<circle r="${f(k * .772)}" fill="url(#${id}dl)"/>`;
  s += chapter(k, id);
  s += markers(k, id);
  if (L.date) {
    const dx = k * .562, dy = 0, w = k * .148, h = k * .102;
    s += `<rect x="${f(dx - w / 2 - k * .012)}" y="${f(dy - h / 2 - k * .012)}" width="${f(w + k * .024)}" height="${f(h + k * .024)}" rx=".14" fill="#303532" stroke="#6a706c" stroke-width=".05"/>`;
    s += `<rect x="${f(dx - w / 2)}" y="${f(dy - h / 2)}" width="${f(w)}" height="${f(h)}" rx=".06" fill="#f4f5f2"/>`;
    s += `<text x="${f(dx)}" y="${f(dy)}" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .104)}" textLength="${f(k * .112)}" lengthAdjust="spacingAndGlyphs" font-weight="400" text-anchor="middle" dominant-baseline="central" fill="#16181b">6</text>`;
  }
  const ink = '#E4E7DE';
  s += `<text y="${f(-k * .26)}" font-family="Georgia,'Times New Roman',serif" font-size="${f(k * .085)}" font-weight="700" textLength="${f(k * .35)}" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${ink}">${esc(o.brand.toUpperCase())}</text>`;
  const xs = k * .041;
  s += `<g transform="translate(0 ${f(k * .205)})"><path d="M${f(xs * .45)},${f(-xs)}H${f(xs * 1.1)}L${f(-xs * .45)},${f(xs)}H${f(-xs * 1.1)}Z" fill="none" stroke="${ink}" stroke-width="${f(xs * .15)}" stroke-linejoin="miter"/><path d="M${f(-xs * 1.2)},${f(-xs)}H${f(-xs * .3)}L${f(xs * 1.2)},${f(xs)}H${f(xs * .3)}Z" fill="${ink}"/></g>`;
  s += `<g fill="${ink}" font-family="Arial,Helvetica,sans-serif" text-anchor="middle"><text y="${f(k * .292)}" font-size="${f(k * .043)}" letter-spacing=".04" textLength="${f(k * .34)}" lengthAdjust="spacingAndGlyphs">AUTOMATIC</text><text y="${f(k * .362)}" font-size="${f(k * .049)}" font-weight="700" textLength="${f(k * .45)}" lengthAdjust="spacingAndGlyphs">DIVER’S 200m</text></g>`;
  s += hands(k, id, L);
  s += `<path d="M${f(-k * .52)},${f(-k * .16)}A${f(k * .7)},${f(k * .7)} 0 0 1 ${f(k * .16)},${f(-k * .52)}A${f(k * .92)},${f(k * .92)} 0 0 0 ${f(-k * .52)},${f(-k * .16)}Z" fill="#fff" opacity=".055"/>`;
  return s;
}
